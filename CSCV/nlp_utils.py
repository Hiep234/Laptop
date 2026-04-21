import re
import unicodedata

from synonym_map import SYNONYM_MAP, TYPO_MAP

# ================================================================
#  VIETNAMESE NLP UTILITIES (Enhanced with fuzzy matching)
# ================================================================
def remove_diacritics(text: str) -> str:
    """Bỏ dấu tiếng Việt để so sánh fuzzy."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))

def normalize_vi(text: str) -> str:
    """Chuẩn hoá: lowercase + bỏ dấu + bỏ ký tự đặc biệt."""
    return re.sub(r"[^\w\s]", " ", remove_diacritics(text.lower())).strip()

def autocorrect_vi(text: str) -> str:
    """Sửa lỗi chính tả phổ biến của người Việt."""
    result = text.lower()
    for typo, fix in sorted(TYPO_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        result = result.replace(typo, fix)
    return result


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Khoảng cách Damerau-Levenshtein (hỗ trợ transposition: ab↔ba = 1)."""
    len1, len2 = len(s1), len(s2)
    d = [[0] * (len2 + 1) for _ in range(len1 + 1)]

    for i in range(len1 + 1):
        d[i][0] = i
    for j in range(len2 + 1):
        d[0][j] = j

    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            d[i][j] = min(
                d[i - 1][j] + 1,       # deletion
                d[i][j - 1] + 1,       # insertion
                d[i - 1][j - 1] + cost  # substitution
            )
            # Transposition
            if i > 1 and j > 1 and s1[i - 1] == s2[j - 2] and s1[i - 2] == s2[j - 1]:
                d[i][j] = min(d[i][j], d[i - 2][j - 2] + 1)

    return d[len1][len2]


def _is_fuzzy_match(query_word: str, key: str) -> bool:
    """Kiểm tra fuzzy match dựa trên Damerau-Levenshtein distance."""
    if len(query_word) < 4 or len(key) < 4:
        return False  # Từ quá ngắn, không fuzzy để tránh false positive
    # Tolerance: distance 1 for 4-char words, distance 2 for 5+ chars
    max_dist = 2 if min(len(query_word), len(key)) >= 5 else 1
    if abs(len(query_word) - len(key)) > max_dist:
        return False
    return _levenshtein_distance(query_word, key) <= max_dist


def _word_boundary_match(text: str, key: str) -> bool:
    """Kiểm tra match với word boundary (tránh 'hp' match vào 'shopping')."""
    if len(key) <= 2:
        # Từ ngắn (hp, lg, ai...) → cần word boundary chính xác
        pattern = r'(?:^|[\s,;.!?\-/])' + re.escape(key) + r'(?:$|[\s,;.!?\-/])'
        return bool(re.search(pattern, text))
    # Từ dài → substring match OK
    return key in text


def extract_tags(text: str) -> set:
    """
    Trích xuất tags từ câu hỏi (Enhanced: fuzzy + word boundary).
    
    Improvements:
    1. Word-boundary matching for short keywords (hp, lg, ai)
    2. Fuzzy matching for typos not in TYPO_MAP
    3. Multi-word priority matching (longer phrases first)
    """
    tags = set()
    low = autocorrect_vi(text.lower().strip())
    norm = normalize_vi(low)

    # Match từ dài trước để tránh match sai
    sorted_keys = sorted(SYNONYM_MAP.keys(), key=len, reverse=True)
    consumed = set()
    fuzzy_candidates = []

    for key in sorted_keys:
        key_norm = normalize_vi(key)
        tag = SYNONYM_MAP[key]

        # Skip nếu tag này đã tìm thấy
        if tag in consumed:
            continue

        # Exact match (với word boundary check cho từ ngắn)
        if _word_boundary_match(low, key) or _word_boundary_match(norm, key_norm):
            tags.add(tag)
            consumed.add(tag)
            continue

        # Collect fuzzy candidates (chỉ cho single-word keys dài ≥ 4)
        if " " not in key and len(key) >= 4:
            fuzzy_candidates.append((key, tag))

    # Fuzzy matching cho các từ trong query chưa match
    if fuzzy_candidates:
        query_words = low.split()
        for qword in query_words:
            if len(qword) < 4:
                continue
            for key, tag in fuzzy_candidates:
                if tag in consumed:
                    continue
                if _is_fuzzy_match(qword, key):
                    tags.add(tag)
                    consumed.add(tag)
                    break  # Mỗi query word chỉ match 1 key

    return tags
