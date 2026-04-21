import re

from nlp_utils import normalize_vi

# ================================================================
#  SMART PRODUCT SCORING  –  đa tiêu chí, CPU/GPU performance tiers
# ================================================================

# ---- CPU Performance Tiers ----
CPU_TIERS = {
    # Intel - sorted by performance tier (higher = more powerful)
    "i9-14": 100, "i9-13": 95, "i9-12": 88,
    "i7-14": 85, "i7-13": 80, "i7-12": 73,
    "core ultra 9": 98, "core ultra 7": 82, "core ultra 5": 68,
    "i5-14": 65, "i5-13": 62, "i5-12": 55,
    "i3-14": 40, "i3-13": 38, "i3-12": 35,
    # AMD
    "ryzen 9 7": 96, "ryzen 9 6": 90, "ryzen 9 5": 85,
    "ryzen 7 7": 78, "ryzen 7 6": 72, "ryzen 7 5": 67,
    "ryzen 5 7": 60, "ryzen 5 6": 55, "ryzen 5 5": 50,
    "ryzen 3": 35,
    # Apple
    "m4 pro": 95, "m4 max": 100, "m4": 85,
    "m3 pro": 88, "m3 max": 95, "m3": 78,
    "m2 pro": 80, "m2 max": 88, "m2": 70,
    "m1 pro": 72, "m1 max": 80, "m1": 62,
    # Snapdragon
    "snapdragon x elite": 82, "snapdragon x plus": 68,
    # Generic fallbacks
    "i9": 88, "i7": 75, "i5": 58, "i3": 35,
    "ryzen 9": 88, "ryzen 7": 72, "ryzen 5": 55,
}

# ---- GPU Performance Tiers ----
GPU_TIERS = {
    # NVIDIA RTX 40 series (laptop)
    "rtx 4090": 100, "rtx 4080": 92, "rtx 4070": 80,
    "rtx 4060": 68, "rtx 4050": 55,
    # NVIDIA RTX 30 series (laptop)
    "rtx 3080": 78, "rtx 3070": 68, "rtx 3060": 58, "rtx 3050": 42,
    # NVIDIA GTX
    "gtx 1650": 30, "gtx 1660": 38,
    # NVIDIA MX
    "mx 570": 28, "mx 550": 22, "mx 450": 18, "mx 350": 15,
    # AMD
    "radeon rx 7600": 62, "radeon rx 6700": 55, "radeon rx 6600": 48,
    "radeon rx 6500": 35, "radeon 780m": 30, "radeon 680m": 25,
    # Intel Arc
    "arc a770": 60, "arc a750": 55, "arc a580": 45, "arc a370": 28,
    # Integrated
    "iris xe": 12, "iris plus": 10, "uhd": 8,
    "radeon": 10, "vega": 12,
}

def _get_cpu_tier(cpu_str: str) -> int:
    """Get CPU performance tier score (0-100)."""
    if not cpu_str:
        return 0
    cpu_low = cpu_str.lower()
    # Try specific matches first (longer = more specific)
    for key in sorted(CPU_TIERS.keys(), key=len, reverse=True):
        if key in cpu_low:
            return CPU_TIERS[key]
    return 20  # fallback for unknown CPUs

def _get_gpu_tier(gpu_str: str) -> int:
    """Get GPU performance tier score (0-100)."""
    if not gpu_str:
        return 0
    gpu_low = gpu_str.lower()
    for key in sorted(GPU_TIERS.keys(), key=len, reverse=True):
        if key in gpu_low:
            return GPU_TIERS[key]
    return 5  # fallback for unknown/integrated GPUs


USE_CASE_PROFILES = {
    "USE:gaming": {
        "gpu_required": True,
        "prefer_high_refresh": True,
        "min_ram_gb": 16,
        "min_gpu_tier": 40,  # At least RTX 3050 level
        "weight_bonus": {"cpu": 3, "gpu": 8, "ram": 4, "display_refresh_rate": 5, "storage": 2},
    },
    "USE:office": {
        "gpu_required": False,
        "prefer_light": True,
        "prefer_long_battery": True,
        "weight_bonus": {"battery": 5, "weight": 4, "display_size": 2, "keyboard": 3},
    },
    "USE:creative": {
        "gpu_required": True,
        "prefer_good_display": True,
        "min_ram_gb": 16,
        "min_gpu_tier": 30,  # At least MX-level for basic creative
        "weight_bonus": {"gpu": 6, "ram": 5, "display_resolution": 5, "display_technology": 4, "cpu": 4, "storage": 3},
    },
    "USE:dev": {
        "gpu_required": False,
        "min_ram_gb": 16,
        "prefer_long_battery": True,
        "min_cpu_tier": 55,  # At least i5-13th gen level
        "weight_bonus": {"ram": 5, "cpu": 4, "storage": 3, "keyboard": 3, "display_size": 2},
    },
}

def _extract_number(s: str) -> float:
    if not s:
        return 0.0
    m = re.search(r"[\d.]+", s)
    return float(m.group()) if m else 0.0

def _extract_weight_kg(s: str) -> float:
    if not s:
        return 99.0
    low = s.lower()
    m = re.search(r"([\d.]+)\s*kg", low)
    if m:
        return float(m.group(1))
    m = re.search(r"([\d.]+)\s*g\b", low)
    if m:
        return float(m.group(1)) / 1000
    return 99.0

def _extract_battery_wh(s: str) -> float:
    if not s:
        return 0.0
    low = s.lower()
    m = re.search(r"([\d.]+)\s*wh", low)
    if m:
        return float(m.group(1))
    m = re.search(r"([\d.]+)\s*cell", low)
    if m:
        return float(m.group(1)) * 15
    return 0.0


def score_option_smart(opt, tags: set, budget: tuple = None, query_tokens: list = None,
                       rejected_ids: set = None):
    """
    Enhanced scoring with CPU/GPU performance tiers.
    """
    score = 0.0
    blob = " ".join(str(x) for x in [
        opt.code, opt.cpu, opt.gpu, opt.ram, opt.storage, opt.os,
        opt.battery, opt.weight, opt.display_size, opt.display_resolution,
        opt.display_refresh_rate, opt.display_technology,
        opt.ports, opt.special_features, opt.keyboard
    ] if x).lower()
    blob_norm = normalize_vi(blob)

    # Get performance tiers
    cpu_tier = _get_cpu_tier(opt.cpu)
    gpu_tier = _get_gpu_tier(opt.gpu)

    # ---------- 0. Rejected product penalty ----------
    if rejected_ids and opt.id in rejected_ids:
        score -= 30  # Strong penalty for previously rejected products

    # ---------- 1. Full-text token match ----------
    if query_tokens:
        for tok in query_tokens:
            if len(tok) >= 2 and (tok in blob or normalize_vi(tok) in blob_norm):
                score += 2.0

    # ---------- 2. Use-case profile scoring (ENHANCED with tiers) ----------
    use_tags = [t for t in tags if t.startswith("USE:")]
    for ut in use_tags:
        profile = USE_CASE_PROFILES.get(ut, {})

        # GPU scoring with tiers (replaces binary check)
        if profile.get("gpu_required"):
            min_tier = profile.get("min_gpu_tier", 30)
            if gpu_tier >= min_tier:
                # Progressive bonus based on how much above minimum
                bonus = 10 + (gpu_tier - min_tier) * 0.15
                score += min(bonus, 25)
            elif gpu_tier > 0:
                # Has GPU but weak
                score += 3
            else:
                score -= 10  # No GPU at all

        # CPU tier check
        if profile.get("min_cpu_tier"):
            if cpu_tier >= profile["min_cpu_tier"]:
                score += 8
            elif cpu_tier >= profile["min_cpu_tier"] * 0.7:
                score += 3

        if profile.get("prefer_light"):
            w = _extract_weight_kg(opt.weight)
            if w < 1.5:
                score += 10
            elif w < 2.0:
                score += 5

        if profile.get("prefer_long_battery"):
            bwh = _extract_battery_wh(opt.battery)
            if bwh >= 60:
                score += 8
            elif bwh >= 45:
                score += 4

        if profile.get("prefer_good_display"):
            dr = (opt.display_resolution or "").lower()
            if any(k in dr for k in ["2560", "2880", "3840", "3456", "2k", "3k", "4k", "qhd", "uhd"]):
                score += 6
            dt = (opt.display_technology or "").lower()
            if any(k in dt for k in ["oled", "mini led", "miniled"]):
                score += 4

        if profile.get("prefer_high_refresh"):
            rfr = (opt.display_refresh_rate or "").lower()
            hz_val = _extract_number(rfr)
            if hz_val >= 144:
                score += 8
            elif hz_val >= 120:
                score += 5

        min_ram = profile.get("min_ram_gb", 0)
        if min_ram:
            ram_gb = _extract_number(opt.ram)
            if ram_gb >= min_ram:
                score += 5
            elif ram_gb >= min_ram / 2:
                score += 1

    # ---------- 3. Attribute tags ----------
    if "ATTR:light" in tags:
        w = _extract_weight_kg(opt.weight)
        if w < 1.4:
            score += 12
        elif w < 1.8:
            score += 7
        elif w < 2.0:
            score += 3

    if "ATTR:long_battery" in tags:
        bwh = _extract_battery_wh(opt.battery)
        if bwh >= 70:
            score += 12
        elif bwh >= 55:
            score += 7
        elif bwh >= 40:
            score += 3

    if "ATTR:good_display" in tags:
        dr = (opt.display_resolution or "").lower()
        if any(k in dr for k in ["2560", "2880", "3840", "3456", "2k", "3k", "4k", "qhd"]):
            score += 8
        dt = (opt.display_technology or "").lower()
        if any(k in dt for k in ["oled", "mini led"]):
            score += 5

    if "ATTR:mech_kb" in tags:
        kb = (opt.keyboard or "").lower()
        if any(k in kb for k in ["cơ", "mechanical", "co"]):
            score += 8

    if "ATTR:durable" in tags:
        blob_check = blob.lower()
        if any(k in blob_check for k in ["nhôm", "aluminum", "al", "magnesium", "carbon", "metal", "kim loại"]):
            score += 8
        if any(k in blob_check for k in ["mil-std", "mil std", "military", "quân sự"]):
            score += 6

    if "ATTR:cool" in tags:
        sf = (opt.special_features or "").lower()
        if any(k in sf for k in ["tản nhiệt", "cooling", "fan", "quạt", "vapor", "heat pipe"]):
            score += 6
        if gpu_tier >= 40:  # Gaming GPUs = better cooling systems
            score += 3

    if "ATTR:quiet" in tags:
        w = _extract_weight_kg(opt.weight)
        if w < 1.5:
            score += 5
        sf = (opt.special_features or "").lower()
        if any(k in sf for k in ["yên tĩnh", "quiet", "silent", "noise"]):
            score += 6

    # ---------- 4. Brand filters ----------
    brand_tags = [t for t in tags if t.startswith("BRAND:")]
    if brand_tags:
        code_low = (opt.code or "").lower()
        matched_brand = False
        for bt in brand_tags:
            brand = bt.split(":")[1]
            if brand in code_low or brand in blob:
                matched_brand = True
                score += 15
                break
        if not matched_brand:
            score -= 20

    # ---------- 5. OS preference ----------
    os_tags = [t for t in tags if t.startswith("OS:")]
    if os_tags:
        opt_os = (opt.os or "").lower()
        for ot in os_tags:
            wanted = ot.split(":")[1]
            if wanted in opt_os:
                score += 8

    # ---------- 6. Specific spec tags (ENHANCED with tier scoring) ----------
    spec_tags = [t for t in tags if t.startswith("SPEC:")]
    for st in spec_tags:
        spec = st.split(":")[1]

        if spec.startswith("ram_"):
            wanted_gb = int(spec.replace("ram_", ""))
            ram_gb = _extract_number(opt.ram)
            if ram_gb == wanted_gb:
                score += 10
            elif ram_gb > wanted_gb:
                score += 4

        elif spec.startswith("hz_"):
            wanted_hz = int(spec.replace("hz_", ""))
            current_hz = _extract_number(opt.display_refresh_rate)
            if current_hz >= wanted_hz:
                score += 10

        elif spec.startswith("screen_"):
            wanted_inch = int(spec.replace("screen_", ""))
            current_inch = _extract_number(opt.display_size)
            if abs(current_inch - wanted_inch) < 0.7:
                score += 10
            elif abs(current_inch - wanted_inch) < 1.5:
                score += 4

        elif spec == "touch":
            if "cảm ứng" in blob or "touch" in blob:
                score += 8

        elif spec == "2in1":
            if any(k in blob for k in ["2 in 1", "2-in-1", "360", "convertible", "xoay"]):
                score += 8

        elif spec == "ssd":
            if opt.storage:
                storage_low = opt.storage.lower()
                if "nvme" in storage_low or "pcie" in storage_low:
                    score += 6  # NVMe > SATA
                elif "ssd" in storage_low:
                    score += 4

        elif spec == "hdd":
            if opt.storage and "hdd" in opt.storage.lower():
                score += 4

        elif spec == "ssd_512":
            if opt.storage and "512" in opt.storage:
                score += 8

        elif spec == "ssd_1tb":
            if opt.storage and ("1tb" in opt.storage.lower() or "1024" in opt.storage):
                score += 10

        elif spec == "ssd_2tb":
            if opt.storage and "2tb" in opt.storage.lower():
                score += 10

        # CPU matching (ENHANCED with tier scoring)
        elif spec.startswith("cpu_"):
            cpu_low = (opt.cpu or "").lower()
            cpu_map = {
                "cpu_i5": ["i5", "core 5"], "cpu_i7": ["i7", "core 7"],
                "cpu_i9": ["i9", "core 9"],
                "cpu_r5": ["ryzen 5", "r5"], "cpu_r7": ["ryzen 7", "r7"],
                "cpu_r9": ["ryzen 9", "r9"],
                "cpu_m1": ["m1"], "cpu_m2": ["m2"], "cpu_m3": ["m3"], "cpu_m4": ["m4"],
                "cpu_ultra": ["ultra"],
                "cpu_snapdragon": ["snapdragon"],
            }
            keywords = cpu_map.get(spec, [])
            if any(k in cpu_low for k in keywords):
                score += 12
                # Bonus for newer generation
                if cpu_tier >= 75:
                    score += 5  # High-end CPU bonus

        # GPU matching (ENHANCED with tier scoring)
        elif spec.startswith("gpu_"):
            gpu_low = (opt.gpu or "").lower()
            gpu_num = spec.replace("gpu_", "")
            if gpu_num in gpu_low:
                score += 12
                if gpu_tier >= 60:
                    score += 5  # High-end GPU bonus

        elif spec == "dgpu":
            if gpu_tier >= 30:
                score += 10 + min(gpu_tier * 0.1, 8)  # Better GPU = more bonus
            elif gpu_tier > 0:
                score += 5

        elif spec == "igpu":
            if gpu_tier <= 15:
                score += 5

    # ---------- 7. Price bracket tags ----------
    if "PRICE:cheap" in tags and budget is None:
        budget = (0, 15_000_000)
    elif "PRICE:mid" in tags and budget is None:
        budget = (15_000_000, 30_000_000)
    elif "PRICE:premium" in tags and budget is None:
        budget = (30_000_000, 999_000_000)

    # ---------- 8. Budget fit ----------
    if budget:
        price_f = float(opt.price) if opt.price else 0
        lo, hi = budget
        if lo <= price_f <= hi:
            score += 10
        elif price_f < lo:
            score += 3
        else:
            overshoot = (price_f - hi) / max(hi, 1)
            score -= min(overshoot * 30, 25)

    # ---------- 9. Intent scoring (ENHANCED with tiers) ----------
    if "INTENT:cheapest" in tags:
        price_f = float(opt.price) if opt.price else 999_000_000
        score += max(0, 50 - price_f / 1_000_000)

    if "INTENT:most_expensive" in tags:
        price_f = float(opt.price) if opt.price else 0
        score += price_f / 1_000_000

    if "INTENT:most_powerful" in tags:
        # Use tier scores for better ranking
        score += cpu_tier * 0.3
        score += gpu_tier * 0.4
        ram_gb = _extract_number(opt.ram)
        score += ram_gb * 0.3

    if "INTENT:lightest" in tags:
        w = _extract_weight_kg(opt.weight)
        score += max(0, 30 - w * 15)

    if "INTENT:popular" in tags:
        total_stock = sum(int(v.stock or 0) for v in opt.variants if not v.is_delete) if opt.variants else 0
        score += min(total_stock * 0.5, 15)
        code_low = (opt.code or "").lower()
        if any(b in code_low for b in ["asus", "dell", "hp", "lenovo", "acer"]):
            score += 5
        # Use actual sales data if available
        pop = _get_product_popularity(opt.code)
        if pop > 0:
            score += min(pop * 3, 20)  # Up to 20 bonus from actual sales

    # ---------- 10. Stock penalty ----------
    total_stock = sum(
        int(v.stock or 0) for v in opt.variants if not v.is_delete
    ) if opt.variants else 0
    if total_stock == 0:
        score -= 8  # Stronger penalty for out of stock

    # ---------- 11. Review-based scoring (NEW) ----------
    review_score = _get_review_score(opt.id)
    score += review_score  # -5 to +10

    return score


def _get_review_score(option_id: int) -> float:
    """Lấy review-based bonus/penalty từ product_intelligence cache."""
    try:
        from product_intelligence import get_product_reviews_summary
        reviews = get_product_reviews_summary([option_id])
        data = reviews.get(option_id, {})
        avg = data.get("avg_rating", 0)
        count = data.get("count", 0)

        if count == 0:
            return 0  # No reviews = neutral

        # High ratings = bonus, low ratings = penalty
        if avg >= 4.5 and count >= 3:
            return 10   # Excellent reviews
        elif avg >= 4.0:
            return 7
        elif avg >= 3.5:
            return 3
        elif avg >= 3.0:
            return 0
        elif avg >= 2.0:
            return -3   # Below average
        else:
            return -5   # Poor reviews

    except Exception:
        return 0


def _get_product_popularity(option_code: str) -> int:
    """Lấy sold count từ product_intelligence cache."""
    try:
        from product_intelligence import get_popularity_for_option
        pop = get_popularity_for_option(option_code)
        return pop.get("sold_count", 0)
    except Exception:
        return 0

