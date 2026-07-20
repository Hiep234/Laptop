import re

from nlp_utils import autocorrect_vi

# ================================================================
#  SMART BUDGET PARSER – hiểu nhiều cách nói về giá
# ================================================================
def parse_budget_vnd(text: str):
    """
    Trả về (min_price, max_price) hoặc None.
    Hỗ trợ đa dạng cách nói của người Việt:
        - "dưới 20tr", "< 15 triệu", "không quá 25m", "tầm 20 triệu"
        - "từ 15 đến 25 triệu", "15-25tr", "khoảng 18-22 triệu"
        - "trên 30tr", "> 30 triệu"
        - "giá rẻ", "tầm trung", "cao cấp" → bracket mặc định
        - "2 chục triệu", "hai mươi triệu" (tiếng Việt viết bằng chữ)
        - "tầm 15 16 triệu", "15 đến 20 triệu" (cách nói tự nhiên)
        - "ngân sách 20tr", "budget 20tr"
        - "20 củ", "20 chai" (tiếng lóng)
    """
    t = autocorrect_vi(text.lower()).replace(",", "")
    # Giữ lại dấu chấm cho số thập phân nhưng bỏ dấu chấm cuối câu
    t = re.sub(r"\.(?!\d)", "", t)

    # Chuyển số viết bằng chữ → số
    WORD_NUM = {
        "một": "1", "mot": "1", "hai": "2", "ba": "3", "bốn": "4", "bon": "4",
        "năm": "5", "nam": "5", "sáu": "6", "sau": "6", "bảy": "7", "bay": "7",
        "tám": "8", "tam": "8", "chín": "9", "chin": "9", "mười": "10", "muoi": "10",
        "mươi": "0", "muoi": "0",
        "mười lăm": "15", "muoi lam": "15", "mười hai": "12", "muoi hai": "12",
        "hai mươi": "20", "hai muoi": "20", "ba mươi": "30", "ba muoi": "30",
        "bốn mươi": "40", "bon muoi": "40", "năm mươi": "50", "nam muoi": "50",
    }
    for word, num in sorted(WORD_NUM.items(), key=lambda x: len(x[0]), reverse=True):
        t = t.replace(word, num)

    MONEY_UNIT = r"(?:tr|triệu|trieu|m|củ|cu|chai|lít|lit|xị|xi|tr\b)"

    def _to_vnd(num_str, unit_str=""):
        try:
            n = float(num_str)
        except ValueError:
            return 0
        if unit_str and re.match(MONEY_UNIT, unit_str.strip()):
            return int(n * 1_000_000)
        if n < 200:  # giả sử nói "20" nghĩa là 20 triệu
            return int(n * 1_000_000)
        return int(n)  # đã là giá trị lớn

    # --- Bracket mặc định cho ngân sách sinh viên / người đi làm ---
    BUDGET_BRACKETS_VN = {
        "sinh viên": (8_000_000, 18_000_000),
        "sinh vien": (8_000_000, 18_000_000),
        "học sinh": (5_000_000, 15_000_000),
        "hoc sinh": (5_000_000, 15_000_000),
        "giá rẻ": (0, 15_000_000),
        "gia re": (0, 15_000_000),
        "bình dân": (0, 15_000_000),
        "binh dan": (0, 15_000_000),
        "tiết kiệm": (0, 15_000_000),
        "tiet kiem": (0, 15_000_000),
        "giá sinh viên": (8_000_000, 18_000_000),
        "gia sinh vien": (8_000_000, 18_000_000),
        "giá mềm": (0, 18_000_000),
        "gia mem": (0, 18_000_000),
        "tầm trung": (15_000_000, 30_000_000),
        "tam trung": (15_000_000, 30_000_000),
        "trung bình": (12_000_000, 25_000_000),
        "trung binh": (12_000_000, 25_000_000),
        "vừa phải": (12_000_000, 25_000_000),
        "vua phai": (12_000_000, 25_000_000),
        "cao cấp": (30_000_000, 999_000_000),
        "cao cap": (30_000_000, 999_000_000),
        "premium": (35_000_000, 999_000_000),
        "flagship": (40_000_000, 999_000_000),
        "sang trọng": (35_000_000, 999_000_000),
        "sang trong": (35_000_000, 999_000_000),
        "xa xỉ": (50_000_000, 999_000_000),
        "xa xi": (50_000_000, 999_000_000),
    }
    for phrase, bracket in sorted(BUDGET_BRACKETS_VN.items(), key=lambda x: len(x[0]), reverse=True):
        if phrase in t:
            # Nếu có số cụ thể trong câu thì ưu tiên parse số, không dùng bracket
            if not re.search(r"\d+\s*" + MONEY_UNIT, t):
                return bracket

    # Dải giá: "từ X đến Y triệu", "X-Y tr", "khoảng X đến Y triệu", "X Y triệu"
    m = re.search(
        r"(?:từ|tu|khoảng|khoang|between|ngan sach|ngân sách|budget)?\s*(\d+(?:\.\d+)?)\s*(?:" + MONEY_UNIT + r")?\s*[-–đến~den\s]+\s*(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")?",
        t
    )
    if m:
        lo = _to_vnd(m.group(1), m.group(3) or "tr")
        hi = _to_vnd(m.group(2), m.group(3) or "tr")
        if lo > hi:
            lo, hi = hi, lo  # swap nếu user nói ngược
        return (lo, hi)

    # "dưới / không quá / <=  X triệu"
    m = re.search(r"(dưới|duoi|khong qua|không quá|<=|<|tối đa|toi da|chưa đến|chua den|ko qua|k qua)\s*(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")?", t)
    if m:
        hi = _to_vnd(m.group(2), m.group(3) or "tr")
        return (0, hi)

    # "trên / >= / hơn X triệu"
    m = re.search(r"(trên|tren|>=|>|hơn|hon|từ|tu|ít nhất|it nhat|toi thieu|tối thiểu)\s*(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")?", t)
    if m:
        lo = _to_vnd(m.group(2), m.group(3) or "tr")
        return (lo, 999_000_000)

    # "ngân sách X triệu" / "budget X triệu"  → ±20%
    m = re.search(r"(?:ngân sách|ngan sach|budget|mức giá|muc gia)\s*(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")?", t)
    if m:
        mid = _to_vnd(m.group(1), m.group(2) or "tr")
        return (int(mid * 0.8), int(mid * 1.2))

    # "tầm X triệu" / "khoảng X triệu"  → ±20 %
    m = re.search(r"(?:tầm|tam|khoảng|khoang|around|quanh|~|cỡ|co)\s*(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")?", t)
    if m:
        mid = _to_vnd(m.group(1), m.group(2) or "tr")
        return (int(mid * 0.8), int(mid * 1.2))

    # Giá đơn: "20tr", "15 triệu", "20 củ", "20 chai"  (ko có từ khóa chỉ hướng → ±20 %)
    m = re.search(r"\b(\d+(?:\.\d+)?)\s*(" + MONEY_UNIT + r")\b", t)
    if m:
        mid = _to_vnd(m.group(1), m.group(2))
        return (int(mid * 0.8), int(mid * 1.2))

    # Số nguyên lớn 7-10 chữ số → giá trực tiếp
    m = re.search(r"\b(\d{7,10})\b", t)
    if m:
        v = int(m.group(1))
        return (int(v * 0.8), int(v * 1.2))

    return None
