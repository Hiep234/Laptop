"""
Product Intelligence Module — khai thác reviews, discounts, popularity từ database.
Biến dữ liệu thô thành context thông minh cho Gemini.
"""
from datetime import datetime
from collections import defaultdict
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from config import db, logger
from models import ProductReview, Discount, OrderItem, Order, ProductOption

# ================================================================
#  REVIEW INTELLIGENCE — rating + sentiment từ đánh giá thực
# ================================================================
_review_cache = {}
_review_cache_time = None
REVIEW_CACHE_TTL = 300  # 5 phút


def get_product_reviews_summary(option_ids: list) -> dict:
    """
    Lấy tóm tắt review cho danh sách product options.
    Returns: {option_id: {"avg_rating": float, "count": int, "highlights": [str]}}
    """
    global _review_cache, _review_cache_time
    now = datetime.now()

    # Cache invalidation
    if _review_cache_time and (now - _review_cache_time).seconds < REVIEW_CACHE_TTL:
        result = {}
        needs_fetch = []
        for oid in option_ids:
            if oid in _review_cache:
                result[oid] = _review_cache[oid]
            else:
                needs_fetch.append(oid)
        if not needs_fetch:
            return result
        option_ids_to_query = needs_fetch
    else:
        _review_cache.clear()
        option_ids_to_query = option_ids
        result = {}

    try:
        reviews = (
            ProductReview.query
            .filter(ProductReview.product_option_id.in_(option_ids_to_query))
            .order_by(ProductReview.created_at.desc())
            .all()
        )

        grouped = defaultdict(list)
        for r in reviews:
            grouped[r.product_option_id].append(r)

        for oid in option_ids_to_query:
            option_reviews = grouped.get(oid, [])
            if not option_reviews:
                summary = {"avg_rating": 0, "count": 0, "highlights": []}
            else:
                ratings = [r.rating for r in option_reviews]
                avg = sum(ratings) / len(ratings)
                count = len(ratings)

                # Extract highlights (top 3 comments with rating >= 4)
                highlights = []
                for r in option_reviews:
                    if r.comment and r.rating >= 4 and len(r.comment.strip()) > 3:
                        highlights.append(r.comment.strip()[:100])
                    if len(highlights) >= 3:
                        break

                # Extract negative highlights too
                negatives = []
                for r in option_reviews:
                    if r.comment and r.rating <= 2 and len(r.comment.strip()) > 3:
                        negatives.append(r.comment.strip()[:100])
                    if len(negatives) >= 2:
                        break

                summary = {
                    "avg_rating": round(avg, 1),
                    "count": count,
                    "highlights": highlights,
                    "negatives": negatives,
                }

            _review_cache[oid] = summary
            result[oid] = summary

        _review_cache_time = now
        return result

    except Exception as e:
        logger.warning("Failed to fetch reviews: %s", e)
        return {oid: {"avg_rating": 0, "count": 0, "highlights": []} for oid in option_ids}


def format_review_for_context(option_id: int, review_data: dict) -> str:
    """Format review data thành text cho Gemini context."""
    if review_data["count"] == 0:
        return "📝 Chưa có đánh giá"

    stars = "⭐" * round(review_data["avg_rating"])
    text = f"📝 {stars} {review_data['avg_rating']}/5 ({review_data['count']} đánh giá)"

    if review_data.get("highlights"):
        text += f" | 👍 \"{review_data['highlights'][0]}\""

    if review_data.get("negatives"):
        text += f" | 👎 \"{review_data['negatives'][0]}\""

    return text


# ================================================================
#  DISCOUNT INTELLIGENCE — mã giảm giá đang hoạt động
# ================================================================
_discount_cache = None
_discount_cache_time = None


def get_active_discounts() -> list:
    """Lấy danh sách mã giảm giá đang hoạt động."""
    global _discount_cache, _discount_cache_time
    now = datetime.now()

    if _discount_cache_time and (now - _discount_cache_time).seconds < 600:
        return _discount_cache

    try:
        discounts = (
            Discount.query
            .filter(
                Discount.is_active == True,
                Discount.is_delete != True,
                Discount.start_date <= now,
                Discount.end_date >= now,
                Discount.quantity > 0,
            )
            .all()
        )

        result = []
        for d in discounts:
            if d.discount_type == "PERCENT":
                desc = f"Giảm {int(d.discount_value)}%"
            else:
                desc = f"Giảm {int(d.discount_value):,}₫"
            result.append({
                "code": d.code,
                "description": d.description or desc,
                "value_display": desc,
                "quantity_left": d.quantity,
                "end_date": d.end_date.strftime("%d/%m/%Y") if d.end_date else "",
            })

        _discount_cache = result
        _discount_cache_time = now
        logger.info("Loaded %d active discounts", len(result))
        return result

    except Exception as e:
        logger.warning("Failed to fetch discounts: %s", e)
        return []


def format_discounts_for_context() -> str:
    """Format discount thành hint cho Gemini."""
    discounts = get_active_discounts()
    if not discounts:
        return ""

    lines = ["🏷️ MÃ GIẢM GIÁ ĐANG CÓ:"]
    for d in discounts[:3]:  # Max 3
        lines.append(f"  • {d['code']}: {d['value_display']} – còn {d['quantity_left']} mã (HSD: {d['end_date']})")
    return "\n".join(lines)


# ================================================================
#  POPULARITY INTELLIGENCE — sản phẩm bán chạy từ order data
# ================================================================
_popularity_cache = {}
_popularity_cache_time = None


def get_product_popularity() -> dict:
    """
    Tính popularity score từ order_items (chỉ đơn COMPLETED/CONFIRMED).
    Returns: {option_code: {"sold_count": int, "revenue": float}}
    """
    global _popularity_cache, _popularity_cache_time
    now = datetime.now()

    if _popularity_cache_time and (now - _popularity_cache_time).seconds < 600:
        return _popularity_cache

    try:
        # Query order items from completed/confirmed orders
        results = (
            db.session.query(
                OrderItem.product_code,
                func.sum(OrderItem.quantity).label("total_sold"),
                func.sum(OrderItem.quantity * OrderItem.price_at_order_time).label("revenue"),
            )
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.status.in_(["COMPLETED", "CONFIRMED", "SHIPPED"]),
                OrderItem.is_delete != True,
            )
            .group_by(OrderItem.product_code)
            .all()
        )

        popularity = {}
        for code, sold, revenue in results:
            popularity[code] = {
                "sold_count": int(sold or 0),
                "revenue": float(revenue or 0),
            }

        _popularity_cache = popularity
        _popularity_cache_time = now
        logger.info("Loaded popularity for %d products", len(popularity))
        return popularity

    except Exception as e:
        logger.warning("Failed to fetch popularity: %s", e)
        return {}


def get_popularity_for_option(option_code: str) -> dict:
    """Get popularity data for a specific product option."""
    popularity = get_product_popularity()
    return popularity.get(option_code, {"sold_count": 0, "revenue": 0})


def format_popularity_for_context(option_code: str) -> str:
    """Format popularity info."""
    pop = get_popularity_for_option(option_code)
    if pop["sold_count"] > 0:
        return f"🔥 Đã bán: {pop['sold_count']} chiếc"
    return ""
