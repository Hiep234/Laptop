import google.generativeai as genai

from config import GEMINI_MODEL, logger
from nlp_utils import autocorrect_vi, normalize_vi

# ================================================================
#  INTENT ROUTER  –  phân loại ý định thông minh (Hybrid: keyword + LLM)
# ================================================================

# Gemini intent model (lightweight, cached)
_intent_model_cache = {}

def _get_intent_model():
    """Lightweight Gemini model for intent classification."""
    if "intent" not in _intent_model_cache:
        _intent_model_cache["intent"] = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction="Bạn là bộ phân loại ý định. Trả lời CHỈ bằng MỘT từ duy nhất.",
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,
                max_output_tokens=20,
            ),
        )
    return _intent_model_cache["intent"]


INTENT_CLASSIFY_PROMPT = """Phân loại ý định người dùng thành MỘT trong các loại sau:
- search: tìm/tư vấn/gợi ý laptop
- compare: so sánh 2+ sản phẩm
- detail: hỏi chi tiết thông số 1 sản phẩm cụ thể  
- general: câu hỏi kiến thức chung về laptop/công nghệ
- off_topic: câu hỏi không liên quan laptop

Tin nhắn: "{msg}"
Có context sản phẩm trước đó: {has_ctx}

Trả lời CHỈ tên intent (1 từ):"""


def _llm_classify_intent(text: str, has_context: bool) -> str:
    """Dùng Gemini phân loại intent cho trường hợp mơ hồ."""
    try:
        model = _get_intent_model()
        prompt = INTENT_CLASSIFY_PROMPT.format(
            msg=text[:200],  # Giới hạn để tiết kiệm tokens
            has_ctx="Có" if has_context else "Không"
        )
        response = model.generate_content(prompt)
        result = response.text.strip().lower()

        valid_intents = {"search", "compare", "detail", "general", "off_topic"}
        if result in valid_intents:
            logger.info("LLM intent classification: '%s' → %s", text[:50], result)
            return result
        # Nếu LLM trả về giá trị không hợp lệ, fallback
        logger.warning("LLM returned invalid intent '%s', falling back to search", result)
        return "search"
    except Exception as e:
        logger.warning("LLM intent classification failed: %s, falling back", e)
        return "search"


def classify_intent(text: str, memory) -> str:
    """
    Hybrid intent classification: keyword-first, LLM fallback.
    - 'search': tìm/tư vấn/gợi ý laptop
    - 'compare': so sánh sản phẩm
    - 'detail': hỏi chi tiết sản phẩm
    - 'followup': follow-up từ câu trước
    - 'greeting': chào hỏi
    - 'thanks': cảm ơn
    - 'general': câu hỏi chung về laptop
    - 'off_topic': câu hỏi ngoài phạm vi
    """
    low = autocorrect_vi(text.lower().strip())
    norm = normalize_vi(low)

    # ---- Greeting (fast path, no LLM needed) ----
    greetings = [
        "xin chao", "hello", "hi", "chao", "hey", "alo", "xin chào", "chào",
        "chào bạn", "chao ban", "ê", "ơi", "oi", "bot ơi", "bot oi",
        "laptopbot", "mình ơi", "minh oi", "bạn ơi", "ban oi",
        "good morning", "buổi sáng", "buoi sang",
        "chào shop", "chao shop", "shop ơi", "shop oi",
        "yo", "ê bot", "e bot",
    ]
    if any(low.startswith(g) or low == g for g in greetings):
        return "greeting"

    # ---- Thanks / goodbye (fast path) ----
    thanks_patterns = [
        "cảm ơn", "cam on", "thank", "cám ơn", "cam on nhe",
        "ok cảm ơn", "ok cam on", "tạm biệt", "tam biet", "bye",
        "thanks", "tks", "cả ơn", "camon", "tq", "ok tks",
        "cảm ơn nhé", "cam on nha", "xong rồi", "xong roi",
    ]
    if any(k in low for k in thanks_patterns):
        return "thanks"

    # ---- Compare (strong keyword signals) ----
    compare_patterns = [
        "so sánh", "so sanh", "khác gì", "khac gi", "hơn gì", "hon gi",
        "hay hơn", "hay hon", "tốt hơn", "tot hon", "vs", " hay ",
        "nào hơn", "nao hon", "nào tốt", "nao tot",
        "đọ", "do nhau", "đấu",
    ]
    if any(k in low for k in compare_patterns):
        return "compare"

    # "giữa A và B" pattern
    if any(k in low for k in ["giữa", "giua"]):
        if "và" in low or "va" in low or "với" in low or "voi" in low:
            return "compare"

    # ---- Follow-up (requires prior context) ----
    if memory.is_followup(text):
        return "followup"

    # ---- Detail (strong keyword signals) ----
    detail_signals = [
        "chi tiết", "chi tiet", "cụ thể", "cu the", "thông số", "thong so",
        "specs", "config", "cấu hình", "cau hinh",
        "review", "đánh giá", "danh gia", "nhận xét", "nhan xet",
        "ưu nhược", "uu nhuoc", "điểm mạnh", "diem manh", "điểm yếu", "diem yeu",
    ]
    if any(k in low for k in detail_signals):
        return "detail"

    # ---- General knowledge (strong signals) ----
    general_signals = [
        "là gì", "la gi", "nghĩa là", "nghia la", "giải thích", "giai thich",
        "khác nhau", "khac nhau", "ips hay", "oled hay", "nên chọn",
        "loại nào", "loai nao", "bao lâu", "bao lau",
        "có tốt không", "co tot khong", "sao lại", "sao lai",
        "thế nào", "the nao", "như nào", "nhu nao",
        "hiểu sao", "hieu sao", "dùng gì", "dung gi",
        "intel hay amd", "amd hay intel",
        "ssd hay hdd", "hdd hay ssd",
        "có nên", "co nen", "có đáng", "co dang",
        "bí quyết", "bi quyet", "mẹo", "meo", "tip",
        "bảo quản", "bao quan", "vệ sinh", "ve sinh",
    ]
    if any(k in low for k in general_signals):
        return "general"

    # ---- Off-topic (strong signals, with laptop exception) ----
    off_topic_signals = [
        "thời tiết", "thoi tiet", "bóng đá", "bong da",
        "nấu ăn", "nau an", "phim", "nhạc", "nhac",
        "tình yêu", "tinh yeu", "chính trị", "chinh tri",
        "tôn giáo", "ton giao",
    ]
    laptop_signals = ["laptop", "máy", "may", "game", "code", "lập trình", "lap trinh"]
    if any(k in low for k in off_topic_signals) and not any(k in low for k in laptop_signals):
        return "off_topic"

    # ---- Search signals (high confidence) ----
    search_signals = [
        "tư vấn", "tu van", "gợi ý", "goi y", "tìm", "tim",
        "cho mình", "cho em", "cần", "can", "muốn", "muon",
        "nên mua", "nen mua", "mua", "laptop",
        "triệu", "trieu", "tr", "ngân sách", "ngan sach",
        "gaming", "văn phòng", "van phong", "lập trình", "lap trinh",
        "đồ hoạ", "do hoa", "dưới", "duoi", "trên", "tren", "tầm", "tam",
    ]
    if any(k in low for k in search_signals):
        return "search"

    # ---- Ambiguous case: use LLM for classification ----
    has_context = bool(memory.last_option_ids)
    word_count = len(low.split())

    # Nếu câu rất ngắn (≤ 3 từ) và có context → likely followup
    if word_count <= 3 and has_context:
        return "followup"

    # Nếu câu dài ≥ 3 từ, dùng LLM phân loại
    if word_count >= 3:
        llm_intent = _llm_classify_intent(text, has_context)
        return llm_intent

    # Fallback mặc định
    return "search"
