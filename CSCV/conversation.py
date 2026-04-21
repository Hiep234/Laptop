from config import logger
from nlp_utils import autocorrect_vi, extract_tags

# ================================================================
#  CONVERSATION MEMORY  –  Smart memory with preference tracking
# ================================================================
class ConversationMemory:
    """Lưu lịch sử hội thoại + context + user preferences."""

    def __init__(self, max_turns: int = 10):
        self.max_turns = max_turns
        self.messages: list[dict] = []
        self.last_option_ids: list[int] = []
        self.accumulated_tags: set = set()
        self.last_budget = None

        # ---- Smart preference tracking ----
        self.user_preferences = {
            "brands": set(),        # Brands user mentioned/liked
            "use_cases": set(),     # gaming, office, creative, dev
            "budget_range": None,   # (min, max) tuple
            "size_pref": None,      # "small" / "medium" / "large"
            "must_have": set(),     # Must-have features: "light", "long_battery", etc.
            "rejected_ids": set(),  # Product IDs user said "no" to
        }
        self.turn_count = 0
        self._summary = None  # Compressed summary of older turns

    def add_user(self, text: str):
        self.messages.append({"role": "user", "content": text})
        self.turn_count += 1
        self._extract_preferences_from_text(text)
        self._maybe_summarize()
        self._trim()

    def add_assistant(self, text: str):
        self.messages.append({"role": "assistant", "content": text})
        self._trim()

    def _extract_preferences_from_text(self, text: str):
        """Auto-extract user preferences from each message."""
        tags = extract_tags(text)

        for tag in tags:
            if tag.startswith("BRAND:"):
                self.user_preferences["brands"].add(tag.split(":")[1])
            elif tag.startswith("USE:"):
                self.user_preferences["use_cases"].add(tag.split(":")[1])
            elif tag.startswith("ATTR:"):
                self.user_preferences["must_have"].add(tag.split(":")[1])
            elif tag.startswith("SPEC:screen_"):
                inch = tag.split("_")[1]
                try:
                    n = int(inch)
                    if n <= 13:
                        self.user_preferences["size_pref"] = "small"
                    elif n <= 15:
                        self.user_preferences["size_pref"] = "medium"
                    else:
                        self.user_preferences["size_pref"] = "large"
                except ValueError:
                    pass

        # Detect rejection patterns
        low = text.lower()
        rejection_signals = [
            "không thích", "khong thich", "không muốn", "khong muon",
            "bỏ qua", "bo qua", "đắt quá", "dat qua", "ko lấy",
            "không lấy", "khong lay", "thôi", "thoi", "bỏ",
        ]
        if any(sig in low for sig in rejection_signals) and self.last_option_ids:
            # Mark current recommendations as somewhat rejected
            for oid in self.last_option_ids:
                self.user_preferences["rejected_ids"].add(oid)

    def _maybe_summarize(self):
        """Summarize older turns to save tokens while keeping context."""
        if self.turn_count >= 6 and len(self.messages) >= 8 and not self._summary:
            # Tạo summary từ 4 messages đầu tiên
            old_messages = self.messages[:4]
            summary_parts = []
            for msg in old_messages:
                role = "User" if msg["role"] == "user" else "Bot"
                content = msg["content"][:100]  # Truncate
                summary_parts.append(f"{role}: {content}")
            self._summary = "Tóm tắt cuộc trò chuyện trước:\n" + "\n".join(summary_parts)
            logger.info("Conversation summarized (turn %d)", self.turn_count)

    def update_search_context(self, option_ids: list, tags: set, budget):
        self.last_option_ids = option_ids
        self.accumulated_tags.update(tags)
        if budget:
            self.last_budget = budget
            self.user_preferences["budget_range"] = budget

    def get_messages_for_llm(self) -> list[dict]:
        """Trả về messages cho Gemini, với summarization nếu cần."""
        if self._summary and len(self.messages) > 6:
            # Trả về summary + 6 messages gần nhất
            return self.messages[-6:]
        return list(self.messages)

    def get_preference_summary(self) -> str:
        """Generate a natural language summary of user preferences for Gemini."""
        parts = []
        prefs = self.user_preferences

        if prefs["use_cases"]:
            use_map = {
                "gaming": "chơi game", "office": "văn phòng/học tập",
                "creative": "đồ hoạ/thiết kế", "dev": "lập trình",
            }
            uses = [use_map.get(u, u) for u in prefs["use_cases"]]
            parts.append(f"Nhu cầu: {', '.join(uses)}")

        if prefs["brands"]:
            parts.append(f"Thương hiệu quan tâm: {', '.join(sorted(prefs['brands']))}")

        if prefs["budget_range"]:
            lo, hi = prefs["budget_range"]
            if lo == 0:
                parts.append(f"Ngân sách: dưới {hi/1e6:.0f} triệu")
            elif hi >= 999_000_000:
                parts.append(f"Ngân sách: trên {lo/1e6:.0f} triệu")
            else:
                parts.append(f"Ngân sách: {lo/1e6:.0f}-{hi/1e6:.0f} triệu")

        if prefs["must_have"]:
            attr_map = {
                "light": "nhẹ", "long_battery": "pin trâu",
                "good_display": "màn hình đẹp", "mech_kb": "bàn phím cơ",
                "durable": "bền", "cool": "tản nhiệt tốt", "quiet": "yên tĩnh",
            }
            features = [attr_map.get(a, a) for a in prefs["must_have"]]
            parts.append(f"Ưu tiên: {', '.join(features)}")

        if prefs["size_pref"]:
            size_map = {"small": "nhỏ gọn (13-14\")", "medium": "trung bình (14-15.6\")", "large": "lớn (16\"+)"}
            parts.append(f"Kích thước: {size_map.get(prefs['size_pref'], prefs['size_pref'])}")

        if prefs["rejected_ids"]:
            parts.append(f"Đã xem nhưng chưa ưng: {len(prefs['rejected_ids'])} sản phẩm")

        if self._summary:
            parts.append(self._summary)

        return "\n".join(parts) if parts else ""

    def get_search_boost_tags(self) -> set:
        """Return accumulated preference tags for search boosting."""
        boost_tags = set()
        prefs = self.user_preferences

        for brand in prefs["brands"]:
            boost_tags.add(f"BRAND:{brand}")
        for use in prefs["use_cases"]:
            boost_tags.add(f"USE:{use}")
        for attr in prefs["must_have"]:
            boost_tags.add(f"ATTR:{attr}")

        return boost_tags

    def _trim(self):
        max_msgs = self.max_turns * 2
        if len(self.messages) > max_msgs:
            self.messages = self.messages[-max_msgs:]

    def is_followup(self, text: str) -> bool:
        """Nhận biết câu hỏi follow-up."""
        if not self.last_option_ids:
            return False

        low = text.lower().strip()
        followup_signals = [
            "còn", "thêm", "nữa", "khác", "rẻ hơn", "đắt hơn",
            "mạnh hơn", "nhẹ hơn", "cái nào", "cái đó", "con đó",
            "con nào", "cái này", "sao", "thế", "vậy", "à", "ờ",
            "ok", "được", "hả", "nha", "nhỉ", "nhé",
            "so sánh", "so sanh", "chi tiết", "chi tiet",
            "cụ thể", "cu the", "giải thích", "giai thich",
            "tại sao", "tai sao", "vì sao", "vi sao",
            "có gì", "co gi", "khác gì", "khac gi",
            "cho xin", "cho mình", "cho e", "cho em",
            "còn con nào", "còn cái nào",
            "vâng", "dạ", "dạ vâng",
            "lấy cái", "muốn cái", "thích cái",
            "con đầu", "con cuối", "con thứ",
            "màu", "giá bao nhiêu", "gia bao nhieu",
            "còn hàng không", "con hang khong",
            "mua được không", "mua duoc khong",
            "ship", "giao hàng",
            "con", "them", "nua", "khac", "re hon", "dat hon",
            "manh hon", "nhe hon", "cai nao", "cai do", "con do",
            "con nao", "cai nay", "the", "vay", "duoc",
        ]

        if len(low.split()) <= 8:
            for sig in followup_signals:
                if sig in low:
                    return True

        return False

    def clear(self):
        self.messages.clear()
        self.last_option_ids.clear()
        self.accumulated_tags.clear()
        self.last_budget = None
        self.user_preferences = {
            "brands": set(),
            "use_cases": set(),
            "budget_range": None,
            "size_pref": None,
            "must_have": set(),
            "rejected_ids": set(),
        }
        self.turn_count = 0
        self._summary = None
