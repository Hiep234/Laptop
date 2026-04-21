import re
from decimal import Decimal
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from config import CANDIDATE_LIMIT, TOP_K, logger, db
from models import ProductOption
from nlp_utils import autocorrect_vi, extract_tags
from budget_parser import parse_budget_vnd
from scoring import score_option_smart

# ================================================================
#  SMART SEARCH – Enhanced with preference-aware re-ranking
# ================================================================
def smart_search(query: str, top_k: int = TOP_K, memory=None):
    """
    Enhanced search pipeline:
    1. Auto-correct lỗi chính tả
    2. Trích tags (with fuzzy matching)
    3. Parse budget (nhiều cách nói VN)
    4. Merge with accumulated preferences from memory
    5. Build DB query với các filter phù hợp
    6. Score & rank (with CPU/GPU tiers + rejected penalty)
    7. Diversity injection
    """
    corrected = autocorrect_vi(query)
    tags = extract_tags(corrected)
    budget = parse_budget_vnd(corrected)

    # Merge preferences from conversation memory
    rejected_ids = set()
    if memory:
        boost_tags = memory.get_search_boost_tags()
        # Don't override explicit tags, just add accumulated context
        for tag in boost_tags:
            if not any(t.split(":")[0] == tag.split(":")[0] for t in tags):
                tags.add(tag)

        # Get rejected product IDs
        rejected_ids = memory.user_preferences.get("rejected_ids", set())

        # Use accumulated budget if no budget in current query
        if not budget and memory.user_preferences.get("budget_range"):
            budget = memory.user_preferences["budget_range"]
            logger.info("Using accumulated budget from memory: %s", budget)

    # Tokenize cho full-text matching
    clean_q = re.sub(r"[^\wà-ỹ]+", " ", corrected.lower())
    tokens = [t for t in clean_q.split() if len(t) >= 2]

    # Build base query (with joinedload for scoring + product name)
    q = ProductOption.query.options(
        joinedload(ProductOption.variants),
        joinedload(ProductOption.product),
    ).filter(ProductOption.is_delete != True)

    # Product name search (e.g., "MacBook", "Alienware", "Yoga")
    from models import Product
    name_keywords = [t for t in tokens if len(t) >= 3]
    if name_keywords:
        name_conditions = []
        for nk in name_keywords:
            name_conditions.append(ProductOption.code.ilike(f"%{nk}%"))
        # Also search in product names via join
        name_matched_ids = (
            db.session.query(Product.id)
            .filter(
                Product.is_delete != True,
                or_(*[Product.name.ilike(f"%{nk}%") for nk in name_keywords])
            ).all()
        )
        if name_matched_ids:
            product_ids = [pid for (pid,) in name_matched_ids]
            name_conditions.append(ProductOption.product_id.in_(product_ids))
        # Don't apply as filter here - will be used as scoring boost later

    # Apply budget filter at DB level
    if budget:
        lo, hi = budget
        buffer_lo = max(0, lo - lo * 0.15)
        buffer_hi = hi + hi * 0.15
        q = q.filter(ProductOption.price.between(Decimal(buffer_lo), Decimal(buffer_hi)))

    # Apply brand filter at DB level
    brand_tags = [t for t in tags if t.startswith("BRAND:")]
    if brand_tags:
        brand_conditions = []
        for bt in brand_tags:
            brand = bt.split(":")[1]
            brand_conditions.append(ProductOption.code.ilike(f"%{brand}%"))
            brand_conditions.append(ProductOption.cpu.ilike(f"%{brand}%"))
            brand_conditions.append(ProductOption.gpu.ilike(f"%{brand}%"))
        q = q.filter(or_(*brand_conditions))

    # Screen size filter
    screen_tags = [t for t in tags if t.startswith("SPEC:screen_")]
    if screen_tags:
        screen_conds = []
        for st in screen_tags:
            inch = st.split("_")[1]
            screen_conds.append(ProductOption.display_size.ilike(f"%{inch}%"))
        q = q.filter(or_(*screen_conds))

    # CPU filter at DB level
    cpu_tags = [t for t in tags if t.startswith("SPEC:cpu_")]
    if cpu_tags:
        cpu_conds = []
        cpu_map = {
            "cpu_i5": ["i5", "Core 5"], "cpu_i7": ["i7", "Core 7"],
            "cpu_i9": ["i9", "Core 9"],
            "cpu_r5": ["Ryzen 5"], "cpu_r7": ["Ryzen 7"], "cpu_r9": ["Ryzen 9"],
            "cpu_m1": ["M1"], "cpu_m2": ["M2"], "cpu_m3": ["M3"], "cpu_m4": ["M4"],
            "cpu_ultra": ["Ultra"],
            "cpu_snapdragon": ["Snapdragon"],
        }
        for ct in cpu_tags:
            spec = ct.split(":")[1]
            keywords = cpu_map.get(spec, [])
            for kw in keywords:
                cpu_conds.append(ProductOption.cpu.ilike(f"%{kw}%"))
        if cpu_conds:
            q = q.filter(or_(*cpu_conds))

    candidates = q.limit(CANDIDATE_LIMIT).all()

    if not candidates:
        # Fallback 1: bỏ brand + CPU filter, giữ budget
        q2 = ProductOption.query.options(
            joinedload(ProductOption.variants)
        ).filter(ProductOption.is_delete != True)
        if budget:
            lo, hi = budget
            q2 = q2.filter(ProductOption.price.between(
                Decimal(max(0, lo - lo * 0.3)),
                Decimal(hi + hi * 0.3)
            ))
        candidates = q2.limit(CANDIDATE_LIMIT).all()

    if not candidates:
        # Fallback 2: bỏ hết filter
        candidates = ProductOption.query.options(
            joinedload(ProductOption.variants)
        ).filter(
            ProductOption.is_delete != True
        ).limit(CANDIDATE_LIMIT).all()

    if not candidates:
        return [], tags, budget

    # Score all candidates (with rejected_ids for penalty)
    scored = []
    for opt in candidates:
        s = score_option_smart(opt, tags, budget, tokens, rejected_ids)
        scored.append((opt.id, s))

    scored.sort(key=lambda x: x[1], reverse=True)

    # Lấy top có score > 0, hoặc fallback top-N
    top_ids = [oid for oid, s in scored if s > 0][:top_k]
    if not top_ids:
        top_ids = [oid for oid, _ in scored[:top_k]]

    # ---- Diversity injection ----
    # If all top results are same brand, swap one for variety
    if len(top_ids) >= 3:
        top_opts = {o.id: o for o in candidates if o.id in top_ids}
        brands = [(oid, (top_opts[oid].code or "").lower().split()[0] if oid in top_opts else "")
                  for oid in top_ids]
        if brands:
            first_brand = brands[0][1]
            all_same = all(b == first_brand for _, b in brands if b)
            if all_same and len(scored) > top_k:
                # Tìm sản phẩm khác brand có score > 0
                for oid, s in scored[top_k:]:
                    if s <= 0:
                        break
                    if oid in top_opts:
                        continue
                    opt = next((o for o in candidates if o.id == oid), None)
                    if opt and (opt.code or "").lower().split()[0] != first_brand:
                        top_ids[-1] = oid  # Replace last item
                        logger.info("Diversity: swapped last result for variety")
                        break

    return top_ids, tags, budget
