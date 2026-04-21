"""
Entity Extractor — Nhận diện thông tin chi tiết từ tin nhắn user.
Trích xuất: tên sản phẩm cụ thể, số tiền chính xác, so sánh, user segment.
"""
import re
from nlp_utils import normalize_vi, autocorrect_vi

# ================================================================
#  PRODUCT ENTITY DETECTION — nhận diện tên sản phẩm user nhắc tới
# ================================================================
PRODUCT_PATTERNS = {
    # Apple
    "macbook pro": "MacBook Pro",
    "macbook air": "MacBook Air",
    "macbook": "MacBook",
    "mbp": "MacBook Pro",
    "mba": "MacBook Air",
    # Dell
    "alienware": "Dell Alienware",
    "dell xps": "Dell XPS",
    "dell inspiron": "Dell Inspiron",
    "dell latitude": "Dell Latitude",
    "dell vostro": "Dell Vostro",
    # HP
    "hp elite": "HP Elite",
    "hp dragonfly": "HP Elite Dragonfly",
    "dragonfly": "HP Elite Dragonfly",
    "hp envy": "HP Envy",
    "hp pavilion": "HP Pavilion",
    "hp spectre": "HP Spectre",
    "hp omen": "HP OMEN",
    "hp victus": "HP Victus",
    # Lenovo
    "thinkpad": "Lenovo ThinkPad",
    "yoga": "Lenovo Yoga",
    "ideapad": "Lenovo IdeaPad",
    "legion": "Lenovo Legion",
    "lenovo yoga": "Lenovo Yoga",
    # ASUS
    "rog": "ASUS ROG",
    "zenbook": "ASUS ZenBook",
    "vivobook": "ASUS VivoBook",
    "tuf gaming": "ASUS TUF Gaming",
    "tuf": "ASUS TUF Gaming",
    "asus rog": "ASUS ROG",
    "asus zenbook": "ASUS ZenBook",
    "chromebook": "Chromebook",
    # Acer
    "acer nitro": "Acer Nitro",
    "acer swift": "Acer Swift",
    "acer predator": "Acer Predator",
    "acer aspire": "Acer Aspire",
    # MSI
    "msi stealth": "MSI Stealth",
    "msi raider": "MSI Raider",
    "msi pulse": "MSI Pulse",
    "msi katana": "MSI Katana",
    "msi creator": "MSI Creator",
    # Others
    "surface": "Microsoft Surface",
    "razer blade": "Razer Blade",
    "matebook": "Huawei MateBook",
}


def extract_product_entities(text: str) -> list:
    """Nhận diện tên sản phẩm cụ thể user nhắc đến."""
    raw_low = text.lower()
    corrected = autocorrect_vi(raw_low)
    found = []
    # Ưu tiên tên dài hơn (cụ thể hơn)
    for pattern in sorted(PRODUCT_PATTERNS.keys(), key=len, reverse=True):
        # Check cả raw text VÀ autocorrected text
        if pattern in raw_low or pattern in corrected:
            name = PRODUCT_PATTERNS[pattern]
            if name not in found:
                found.append(name)
            # Xoá pattern đã match để tránh match ngắn hơn
            raw_low = raw_low.replace(pattern, " ")
            corrected = corrected.replace(pattern, " ")
    return found


# ================================================================
#  USER SEGMENT DETECTION — phát hiện profile user tự động
# ================================================================
USER_SEGMENTS = {
    "student": {
        "signals": [
            "sinh viên", "sinh vien", "học sinh", "hoc sinh", "đi học", "di hoc",
            "trường", "truong", "đại học", "dai hoc", "làm bài", "lam bai",
            "tiểu luận", "tieu luan", "note taking", "ghi chép",
            "sv", "hs", "lớp", "lop", "thầy", "thay", "cô", "co",
            "học tập", "hoc tap", "em muốn", "em mua", "em tìm", "em tim",
        ],
        "budget_hint": (8_000_000, 18_000_000),
        "description": "Sinh viên / học sinh",
        "priorities": "nhẹ, pin trâu, giá rẻ, bền, Office/Word/Excel",
    },
    "professional": {
        "signals": [
            "công việc", "cong viec", "làm việc", "lam viec", "họp", "hop",
            "doanh nhân", "doanh nhan", "kinh doanh", "công ty", "cong ty",
            "văn phòng", "van phong", "excel", "powerpoint", "email",
            "erp", "crm", "dự án", "du an", "presentation",
            "remote", "work from home", "wfh",
        ],
        "budget_hint": (15_000_000, 35_000_000),
        "description": "Nhân viên văn phòng / chuyên nghiệp",
        "priorities": "bền, bảo mật, nhẹ, pin trâu, bàn phím tốt",
    },
    "gamer": {
        "signals": [
            "game", "gaming", "chơi game", "choi game", "liên minh", "lien minh",
            "valorant", "pubg", "cs2", "csgo", "genshin", "fortnite",
            "fps", "mmo", "esports", "stream", "streaming",
            "max setting", "max đồ", "high ultra", "144hz", "165hz", "240hz",
            "rtx", "gpu", "card đồ hoạ", "card do hoa",
        ],
        "budget_hint": (18_000_000, 45_000_000),
        "description": "Gamer",
        "priorities": "GPU mạnh, RAM 16GB+, màn 144Hz+, tản nhiệt tốt",
    },
    "creative": {
        "signals": [
            "thiết kế", "thiet ke", "đồ hoạ", "do hoa", "photoshop", "illustrator",
            "premiere", "after effects", "blender", "3d", "render",
            "video", "edit video", "chỉnh ảnh", "chinh anh", "photography",
            "autocad", "solidworks", "revit", "sketchup",
            "youtuber", "content creator", "sáng tạo", "sang tao",
        ],
        "budget_hint": (20_000_000, 50_000_000),
        "description": "Nhà sáng tạo nội dung / thiết kế",
        "priorities": "màn hình chuẩn màu, GPU + CPU mạnh, RAM 16GB+, SSD lớn",
    },
    "developer": {
        "signals": [
            "lập trình", "lap trinh", "code", "coding", "developer", "dev",
            "programming", "python", "java", "javascript", "react", "angular",
            "docker", "kubernetes", "terminal", "linux", "ubuntu", "wsl",
            "ide", "vscode", "visual studio", "intellij", "android studio",
            "compile", "build", "debug", "git",
        ],
        "budget_hint": (18_000_000, 40_000_000),
        "description": "Lập trình viên / Developer",
        "priorities": "RAM 16GB+, CPU mạnh, SSD NVMe, bàn phím tốt, Linux support",
    },
}


def detect_user_segment(text: str, accumulated_messages: list = None) -> dict:
    """
    Phát hiện user thuộc phân khúc nào.
    Returns: {"segment": str, "confidence": float, "description": str, "priorities": str}
    """
    # Combine current text with history for better detection
    combined = text.lower()
    if accumulated_messages:
        for msg in accumulated_messages[-4:]:
            if msg.get("role") == "user":
                combined += " " + msg["content"].lower()

    combined = autocorrect_vi(combined)
    scores = {}

    for segment, data in USER_SEGMENTS.items():
        score = 0
        for sig in data["signals"]:
            if sig in combined:
                score += 1
        scores[segment] = score

    if not scores or max(scores.values()) == 0:
        return {"segment": "general", "confidence": 0, "description": "Người dùng chung", "priorities": ""}

    best = max(scores, key=scores.get)
    confidence = min(scores[best] / 3, 1.0)  # 3+ signals = 100% confidence

    return {
        "segment": best,
        "confidence": confidence,
        "description": USER_SEGMENTS[best]["description"],
        "priorities": USER_SEGMENTS[best]["priorities"],
        "budget_hint": USER_SEGMENTS[best]["budget_hint"],
    }


# ================================================================
#  PRICE/VALUE INTELLIGENCE — phân tích giá trị
# ================================================================
def calculate_value_score(opt) -> dict:
    """
    Tính điểm value (giá trị / giá tiền) cho sản phẩm.
    Returns: {"score": float, "verdict": str, "reasoning": str}
    """
    from scoring import _get_cpu_tier, _get_gpu_tier, _extract_number, _extract_weight_kg, _extract_battery_wh

    price = float(opt.price) if opt.price else 0
    if price <= 0:
        return {"score": 0, "verdict": "unknown", "reasoning": ""}

    # Calculate raw performance score
    cpu_score = _get_cpu_tier(opt.cpu)
    gpu_score = _get_gpu_tier(opt.gpu)
    ram_gb = _extract_number(opt.ram)
    storage_gb = _extract_number(opt.storage) if opt.storage and ("512" in str(opt.storage) or "1tb" in str(opt.storage).lower()) else 256
    weight_kg = _extract_weight_kg(opt.weight)
    battery_wh = _extract_battery_wh(opt.battery)

    # Performance composite (0-100)
    perf = (cpu_score * 0.3 + gpu_score * 0.25 + min(ram_gb * 2, 30) + min(storage_gb / 50, 20) + min(battery_wh * 0.3, 15))

    # Value = performance per million VND
    price_millions = price / 1_000_000
    value = perf / max(price_millions, 1)

    # Classify
    if value >= 4.5:
        verdict = "excellent_value"
        reasoning = "Rất đáng tiền — hiệu năng cao so với giá"
    elif value >= 3.5:
        verdict = "good_value"
        reasoning = "Giá hợp lý — đáng cân nhắc"
    elif value >= 2.5:
        verdict = "fair_value"
        reasoning = "Giá tương xứng chất lượng"
    elif value >= 1.5:
        verdict = "pricey"
        reasoning = "Hơi đắt so với specs — trả thêm cho thương hiệu/thiết kế"
    else:
        verdict = "expensive"
        reasoning = "Giá cao — phù hợp nếu cần đặc biệt (nhẹ/build/bảo hành)"

    return {
        "score": round(value, 2),
        "verdict": verdict,
        "reasoning": reasoning,
        "performance": round(perf, 1),
        "price_millions": round(price_millions, 1),
    }


# ================================================================
#  SMART CLARIFICATION — câu hỏi thông minh khi thiếu thông tin
# ================================================================
def generate_clarification(tags: set, budget, segment: dict) -> str:
    """
    Tạo câu hỏi follow-up thông minh dựa trên thông tin còn thiếu.
    Returns: empty string nếu đủ thông tin.
    """
    missing = []

    has_use = any(t.startswith("USE:") for t in tags)
    has_budget = budget is not None
    has_brand = any(t.startswith("BRAND:") for t in tags)

    # Nếu không có use-case VÀ không có budget → cần hỏi cả hai
    if not has_use and not has_budget:
        return "Bạn cho mình biết 2 thứ nhé: **mục đích dùng** (gaming/học tập/thiết kế/lập trình?) và **ngân sách** tầm bao nhiêu? 😊"

    if not has_use:
        if segment.get("segment", "general") != "general":
            return ""  # Đã detect được segment, không cần hỏi
        missing.append("mục đích dùng chính (gaming/văn phòng/đồ hoạ/lập trình?)")

    if not has_budget:
        missing.append("ngân sách tầm bao nhiêu")

    if missing:
        return f"Để mình gợi ý chính xác hơn, cho mình biết {' và '.join(missing)} nhé! 😊"

    return ""


# ================================================================
#  OUT-OF-STOCK ALTERNATIVES — gợi ý thay thế khi hết hàng
# ================================================================
def find_alternatives_for_oos(oos_option_id: int, all_options: list, top_n: int = 3) -> list:
    """
    Tìm sản phẩm thay thế cho sản phẩm hết hàng.
    Returns: list of option IDs tương tự nhất còn hàng.
    """
    from scoring import _get_cpu_tier, _get_gpu_tier, _extract_number

    oos_opt = next((o for o in all_options if o.id == oos_option_id), None)
    if not oos_opt:
        return []

    oos_cpu = _get_cpu_tier(oos_opt.cpu)
    oos_gpu = _get_gpu_tier(oos_opt.gpu)
    oos_price = float(oos_opt.price) if oos_opt.price else 0
    oos_ram = _extract_number(oos_opt.ram)

    alternatives = []
    for opt in all_options:
        if opt.id == oos_option_id:
            continue
        # Check stock
        total_stock = sum(int(v.stock or 0) for v in opt.variants if not v.is_delete) if opt.variants else 0
        if total_stock == 0:
            continue

        # Calculate similarity
        price_diff = abs(float(opt.price or 0) - oos_price) / max(oos_price, 1)
        cpu_diff = abs(_get_cpu_tier(opt.cpu) - oos_cpu) / 100
        gpu_diff = abs(_get_gpu_tier(opt.gpu) - oos_gpu) / 100
        ram_diff = abs(_extract_number(opt.ram) - oos_ram) / max(oos_ram, 1)

        similarity = 1 - (price_diff * 0.4 + cpu_diff * 0.25 + gpu_diff * 0.25 + ram_diff * 0.1)
        alternatives.append((opt.id, similarity))

    alternatives.sort(key=lambda x: x[1], reverse=True)
    return [oid for oid, _ in alternatives[:top_n]]
