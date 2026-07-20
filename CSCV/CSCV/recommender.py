from collections import defaultdict
from sqlalchemy import or_

from config import db, TOP_K, logger
from models import ProductOption, CartItem, UserViewHistory

# ================================================================
#  RECOMMENDER (Enhanced: partial CPU/GPU matching + dedup)
# ================================================================

def _cpu_family(cpu_str: str) -> str:
    """Extract CPU family for partial matching (e.g., 'Intel Core i7-13700H' → 'i7')."""
    if not cpu_str:
        return ""
    low = cpu_str.lower()
    for fam in ["i9", "i7", "i5", "i3", "ryzen 9", "ryzen 7", "ryzen 5", "ryzen 3",
                 "m4", "m3", "m2", "m1", "ultra 9", "ultra 7", "ultra 5", "snapdragon"]:
        if fam in low:
            return fam
    return low.split()[0] if low.split() else ""

def _gpu_family(gpu_str: str) -> str:
    """Extract GPU family (e.g., 'NVIDIA RTX 4060' → 'rtx 4060')."""
    if not gpu_str:
        return ""
    low = gpu_str.lower()
    for fam in ["rtx 4090", "rtx 4080", "rtx 4070", "rtx 4060", "rtx 4050",
                 "rtx 3080", "rtx 3070", "rtx 3060", "rtx 3050",
                 "gtx 1660", "gtx 1650", "mx 570", "mx 550", "mx 450",
                 "arc a", "radeon rx"]:
        if fam in low:
            return fam
    return ""


def calculate_similarity_score(option1, option2):
    """Enhanced similarity with partial CPU/GPU family matching."""
    WEIGHTS = {
        "cpu": 5, "gpu": 4, "ram": 3, "ram_type": 2, "storage": 3,
        "display_size": 3, "display_resolution": 3, "display_technology": 2,
        "os": 2, "battery": 2, "weight": 1, "price": 4
    }
    score = 0.0
    total_possible = 0.0

    for field, weight in WEIGHTS.items():
        if field == "price":
            p1 = float(option1.price) if option1.price else 0.0
            p2 = float(option2.price) if option2.price else 0.0
            if p1 > 0 and p2 > 0:
                diff = abs(p1 - p2) / max(p1, p2)
                score += (1 - min(diff, 1)) * weight
                total_possible += weight
        elif field == "cpu":
            v1 = (getattr(option1, "cpu", "") or "").strip().lower()
            v2 = (getattr(option2, "cpu", "") or "").strip().lower()
            if v1 and v2:
                total_possible += weight
                if v1 == v2:
                    score += weight
                elif _cpu_family(v1) == _cpu_family(v2):
                    score += weight * 0.8  # Same family (e.g., both i7)
                elif v1.split()[0:1] == v2.split()[0:1]:
                    score += weight * 0.5  # Same brand
        elif field == "gpu":
            v1 = (getattr(option1, "gpu", "") or "").strip().lower()
            v2 = (getattr(option2, "gpu", "") or "").strip().lower()
            if v1 and v2:
                total_possible += weight
                if v1 == v2:
                    score += weight
                elif _gpu_family(v1) and _gpu_family(v1) == _gpu_family(v2):
                    score += weight * 0.8
                elif any(k in v1 for k in ["rtx", "gtx"]) and any(k in v2 for k in ["rtx", "gtx"]):
                    score += weight * 0.4
        else:
            v1 = (getattr(option1, field, "") or "").strip().lower()
            v2 = (getattr(option2, field, "") or "").strip().lower()
            if v1 and v2:
                total_possible += weight
                if v1 == v2:
                    score += weight
                elif field in ("ram", "storage") and v1.split()[0:1] == v2.split()[0:1]:
                    score += weight * 0.6

    return 0.0 if total_possible == 0 else (score / total_possible) * 100.0

def get_user_preferences(user_id: int):
    preferences = {
        "price_range": None,
        "preferred_brands": set(),
        "preferred_specs": defaultdict(int),
    }

    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if cart_items:
        prices = []
        for item in cart_items:
            opt = item.product_variant.product_option
            if opt and opt.price:
                prices.append(float(opt.price))
            if opt and opt.cpu:
                preferences["preferred_brands"].add(opt.cpu.split()[0])
        if prices:
            preferences["price_range"] = (min(prices), max(prices))

    view_history = UserViewHistory.query.filter_by(user_id=user_id).limit(20).all()
    for view in view_history:
        opt = (
            ProductOption.query.filter_by(product_id=view.product_id)
            .filter(ProductOption.is_delete != True)
            .first()
        )
        if not opt:
            continue
        if opt.cpu:
            preferences["preferred_brands"].add(opt.cpu.split()[0])
        if opt.ram:
            preferences["preferred_specs"][f"ram_{opt.ram}"] += int(view.view_count or 1)
        if opt.storage:
            preferences["preferred_specs"][f"storage_{opt.storage}"] += int(view.view_count or 1)
        # NEW: Track display size preference
        if opt.display_size:
            preferences["preferred_specs"][f"display_{opt.display_size}"] += int(view.view_count or 1)

    return preferences

def get_random_recommendations(count: int):
    opts = (
        ProductOption.query.filter(ProductOption.is_delete != True)
        .order_by(db.func.rand())
        .limit(count)
        .all()
    )
    return [o.id for o in opts]

def get_recommendations(user_id: int):
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    preferences = get_user_preferences(user_id)

    if not cart_items and not preferences.get("preferred_brands"):
        return get_random_recommendations(TOP_K)

    query = ProductOption.query.filter(ProductOption.is_delete != True)

    if preferences.get("preferred_brands"):
        brand_filters = [ProductOption.cpu.ilike(f"{b}%") for b in preferences["preferred_brands"]]
        query = query.filter(or_(*brand_filters))

    if preferences.get("price_range"):
        min_p, max_p = preferences["price_range"]
        buf = (max_p - min_p) * 0.5
        query = query.filter(ProductOption.price.between(max(0, min_p - buf), max_p + buf))

    candidates = query.all()
    if not candidates:
        return get_random_recommendations(TOP_K)

    cart_options = []
    if cart_items:
        cart_opt_ids = [it.product_variant.option_id for it in cart_items]
        cart_options = ProductOption.query.filter(ProductOption.id.in_(cart_opt_ids)).all()

    scored = []
    for opt in candidates:
        s = 0.0
        if cart_options:
            sim = sum(calculate_similarity_score(c, opt) for c in cart_options) / max(len(cart_options), 1)
            s += sim * 0.6

        if opt.cpu and any(opt.cpu.startswith(b) for b in preferences["preferred_brands"]):
            s += 20

        if opt.ram and f"ram_{opt.ram}" in preferences["preferred_specs"]:
            s += preferences["preferred_specs"][f"ram_{opt.ram}"] * 0.15
        if opt.storage and f"storage_{opt.storage}" in preferences["preferred_specs"]:
            s += preferences["preferred_specs"][f"storage_{opt.storage}"] * 0.15
        # NEW: Display size preference
        if opt.display_size and f"display_{opt.display_size}" in preferences["preferred_specs"]:
            s += preferences["preferred_specs"][f"display_{opt.display_size}"] * 0.1

        # NEW: Stock bonus (prefer in-stock products)
        total_stock = sum(int(v.stock or 0) for v in opt.variants if not v.is_delete) if opt.variants else 0
        if total_stock > 0:
            s += 5

        scored.append((opt.id, s))

    scored.sort(key=lambda x: x[1], reverse=True)

    # Deduplication: avoid recommending same product line multiple times
    top = []
    seen_codes = set()
    for oid, sc in scored:
        opt = next((c for c in candidates if c.id == oid), None)
        if opt:
            # Extract base product code (remove color/variant suffix)
            base_code = (opt.code or "").split("-")[0].split("(")[0].strip().lower()
            if base_code and base_code in seen_codes:
                continue
            if base_code:
                seen_codes.add(base_code)
        top.append(oid)
        if len(top) >= TOP_K:
            break

    if len(top) < TOP_K:
        for e in get_random_recommendations(TOP_K):
            if e not in top:
                top.append(e)
            if len(top) >= TOP_K:
                break
    return top[:TOP_K]
