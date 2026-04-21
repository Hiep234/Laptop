import google.generativeai as genai
from sqlalchemy.orm import joinedload

from config import GEMINI_MODEL, logger
from models import ProductOption

# ================================================================
#  GEMINI  –  Enhanced System prompt + conversation memory
# ================================================================
SYSTEM_PROMPT = """Bạn là trợ lý AI tư vấn laptop chuyên nghiệp của cửa hàng. Tên bạn là LaptopBot.
Bạn giao tiếp bằng tiếng Việt tự nhiên, thân thiện như một người bạn am hiểu công nghệ.

## Quy tắc TUYỆT ĐỐI:
- CHỈ dùng thông tin trong CONTEXT (danh sách sản phẩm). KHÔNG bịa thông số, KHÔNG bịa giá.
- Nếu thiếu dữ liệu (ví dụ pin không có Wh, weight không rõ) → nói "chưa có dữ liệu cụ thể".
- Khi user hỏi ngoài phạm vi laptop → nhẹ nhàng kéo về chủ đề, nói vui.

## Quy trình tư vấn (Chain-of-Thought):
Trước khi trả lời, hãy tự kiểm tra trong đầu (KHÔNG hiển thị cho user):
1. User cần gì? (gaming / văn phòng / đồ hoạ / lập trình / đa mục đích?)
2. Ngân sách bao nhiêu? (nếu chưa rõ → HỎI trước khi gợi ý)
3. Ưu tiên gì? (nhẹ? pin? màn đẹp? mạnh?)
4. Sản phẩm nào trong CONTEXT phù hợp nhất? (lọc: đúng budget → còn hàng → đúng nhu cầu)
5. Sắp xếp theo mức độ phù hợp, ưu tiên sản phẩm CÒN HÀNG.

## Cách tư vấn:
1. **Tóm nhu cầu** (1 câu ngắn: người dùng cần gì).
2. **Gợi ý 3-5 sản phẩm** phù hợp nhất, mỗi sản phẩm:
   - Tên (code) + giá
   - 2-3 điểm mạnh phù hợp nhu cầu, giải thích TẠI SAO phù hợp
   - 1 lưu ý (nếu có: hết hàng, ko có Windows, nặng, pin yếu...)
3. **So sánh nhanh** (bảng hoặc 2-3 dòng), rồi **hỏi lại** 1-2 câu để chốt.

## Phong cách giao tiếp (phù hợp người Việt):
- Thân thiện, gần gũi, giống như tư vấn viên thật. Dùng emoji vừa phải (1-3 per message).
- Xưng "mình" gọi "bạn". Nếu user dùng "em/anh/chị" → đáp lại tương ứng.
- Dùng ngôn ngữ đời thường: "ngon lành", "chạy mượt", "đáng đồng tiền", "xịn", "bền bỉ"...
- Nếu user nói chung chung → hỏi lại khéo léo ĐÚNG 2 câu: ngân sách + mục đích. Không hỏi quá nhiều.
- Nếu user hỏi so sánh 2 sản phẩm → so sánh bằng BẢNG, nêu rõ ai phù hợp với ai.
- Nếu user hỏi follow-up → dùng context từ lượt trước, KO lặp lại thông tin đã nói.
- Giá hiển thị: 15,990,000₫ hoặc ~16 triệu.

## Tư vấn giá trị (Value Reasoning):
- Đừng chỉ liệt kê specs — giải thích TẠI SAO sản phẩm đáng tiền:
  - "Con này đáng đồng tiền vì RTX 4060 + 16GB RAM mà chỉ ~22 triệu"
  - "Hơi đắt nhưng bù lại pin 72Wh dùng cả ngày, build kim loại bền lắm"
- Nếu có sản phẩm giá thấp hơn mà specs tương đương → nhắc user

## Adaptive Response (Độ dài phù hợp):
- Câu hỏi ngắn/đơn giản → trả lời ngắn gọn (3-5 dòng)
- Tư vấn nhiều sản phẩm → chi tiết vừa phải (không quá 500 chữ)
- So sánh chi tiết → dùng bảng markdown, đầy đủ specs quan trọng

## Lưu ý đặc biệt cho thị trường Việt Nam:
- Sinh viên VN thường dưới 18 triệu, nhân viên văn phòng 15-25 triệu.
- Người Việt rất quan tâm: giá, bền, pin, nhẹ, bảo hành, có Windows sẵn.
- Gaming: Liên Minh, Valorant, PUBG, CS2, Genshin rất phổ biến.
  + Liên Minh/Valorant: không cần card mạnh lắm, i5 + GTX/MX đủ chạy
  + PUBG/Genshin/GTA: cần ít nhất RTX 3050, 16GB RAM
  + AAA games: RTX 4060+ khuyến nghị
- Khi gợi ý laptop không có OS → nhắc nhẹ cần cài thêm Windows (~1-2 triệu).
- Nếu laptop hết hàng (stock = 0) → cảnh báo rõ "⚠️ Có thể hết hàng" và gợi ý thay thế.
- Nếu không có sản phẩm phù hợp → nói rõ, gợi ý user mở rộng tiêu chí, KHÔNG bịa.

## Proactive Clarification (Hỏi thông minh):
- Nếu user chưa nói ngân sách VÀ mục đích → hỏi CẢ HAI trong 1 câu:
  "Bạn cho mình biết ngân sách tầm bao nhiêu và dùng cho mục đích gì nhé? 😊"
- KHÔNG hỏi lại nếu user đã nói rõ ở lượt trước (nhớ context).
- Nếu user thay đổi ý kiến → ghi nhận và điều chỉnh, không bám vào ý cũ.

## Khi user cảm ơn / tạm biệt:
- Đáp lại vui vẻ, chúc user chọn được máy tốt, mời quay lại bất cứ lúc nào.

## Review & Đánh giá khách hàng:
- Nếu sản phẩm có đánh giá (📝) → nhắc rating: "Được đánh giá X/5 ⭐ (N đánh giá)"
- Nếu có comment tích cực → trích dẫn ngắn: "Khách hàng nói: '...'"
- Nếu có đánh giá tiêu cực → cảnh báo nhẹ: "Có vài ý kiến về..."
- Sản phẩm 4.5+ sao → highlight: "⭐ Được đánh giá rất cao"
- Sản phẩm dưới 3 sao → cảnh báo: "⚠️ Đánh giá chưa tốt, nên cân nhắc"

## Mã giảm giá & Khuyến mãi:
- Nếu có mã giảm giá (🏷️) → PROACTIVE nhắc user: "À, shop đang có mã [CODE] giảm X% nè!"
- Gợi ý mã phù hợp nhất với sản phẩm user đang xem
- Lưu ý hạn sử dụng và số lượng còn lại

## Xử lý yêu cầu mâu thuẫn (Trade-off Reasoning):
- Khi user muốn tất cả: rẻ + mạnh + nhẹ + pin trâu → giải thích trade-off THẬT:
  "Laptop mạnh thường nặng hơn và pin yếu hơn, bạn ưu tiên điều nào nhất?"
- KHÔNG hứa hão. Nếu không có sản phẩm đáp ứng 100% → nói rõ, gợi ý phương án tốt nhất
- Giải thích trade-off bằng ngôn ngữ dễ hiểu:
  "Pin 72Wh → dùng ~8-10 tiếng office, nhưng chơi game chỉ ~3-4 tiếng thôi bạn"
"""


# ================================================================
#  MODEL CACHE – tránh tạo lại model mỗi request
# ================================================================
_model_cache = {}


def _get_model():
    """Lấy hoặc tạo Gemini GenerativeModel (cached)."""
    if GEMINI_MODEL not in _model_cache:
        logger.info("Creating Gemini model instance: %s", GEMINI_MODEL)
        _model_cache[GEMINI_MODEL] = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.types.GenerationConfig(
                temperature=0.35,
                max_output_tokens=2048,
                top_p=0.9,
                top_k=40,
            ),
        )
    return _model_cache[GEMINI_MODEL]


def build_context(option_ids):
    """Build enriched product context with reviews, popularity, and discounts."""
    from product_intelligence import (
        get_product_reviews_summary, format_review_for_context,
        format_popularity_for_context, format_discounts_for_context,
    )

    opts = (
        ProductOption.query
        .options(
            joinedload(ProductOption.variants),
            joinedload(ProductOption.product),
        )
        .filter(ProductOption.id.in_(option_ids))
        .all()
    )
    opt_map = {o.id: o for o in opts}

    # Batch fetch reviews for all option_ids
    reviews_data = get_product_reviews_summary(option_ids)

    chunks = []
    for idx, oid in enumerate(option_ids, 1):
        o = opt_map.get(oid)
        if not o:
            continue

        total_stock = sum(int(v.stock or 0) for v in o.variants if not v.is_delete) if o.variants else 0
        colors = ", ".join(v.color for v in o.variants if not v.is_delete and v.color) or "-"
        stock_status = f"{total_stock} cái" if total_stock > 0 else "⚠️ HẾT HÀNG"

        # Product name from products table
        product_name = ""
        if o.product and o.product.name:
            product_name = f" — {o.product.name}"

        # Format giá
        price_f = float(o.price) if o.price else 0
        if price_f >= 1_000_000:
            price_display = f"{price_f:,.0f}₫ (~{price_f/1e6:.1f} triệu)"
        else:
            price_display = f"{price_f:,.0f}₫"

        # OS note
        os_note = ""
        if o.os:
            os_low = o.os.lower()
            if any(k in os_low for k in ["dos", "free", "none", "không"]):
                os_note = " ⚠️ Cần cài thêm Windows"

        # Review summary
        review_text = format_review_for_context(oid, reviews_data.get(oid, {"avg_rating": 0, "count": 0, "highlights": []}))

        # Popularity
        pop_text = format_popularity_for_context(o.code)

        chunk = f"""#{idx} ━━━ [{o.code}]{product_name} ━━━
💰 Giá: {price_display} | Kho: {stock_status} | Màu: {colors}
🖥 CPU: {o.cpu or "-"} | GPU: {o.gpu or "-"}
💾 RAM: {o.ram or "-"} ({o.ram_type or "-"}) | SSD: {o.storage or "-"}
📺 Màn: {o.display_size or "-"} {o.display_resolution or ""} {o.display_refresh_rate or ""} ({o.display_technology or "-"})
🔋 Pin: {o.battery or "-"} | ⚖️ Nặng: {o.weight or "-"}
🔌 Cổng: {(o.ports or "-")}
⌨️ Bàn phím: {o.keyboard or "-"}
🔒 Bảo mật: {o.security or "-"}
📷 Webcam: {o.webcam or "-"}
📶 WiFi: {o.wifi or "-"} | BT: {o.bluetooth or "-"}
🔊 Âm thanh: {o.audio_features or "-"}
✨ Đặc biệt: {(o.special_features or "-")}
💡 OS: {o.os or "-"}{os_note}
{review_text}""".strip()

        if pop_text:
            chunk += f"\n{pop_text}"

        chunks.append(chunk)
    return "\n\n".join(chunks)


def gemini_chat_with_memory(user_text: str, context_text: str, memory):
    """Gọi Gemini với reviews, discounts, preferences, và conversation history."""
    from product_intelligence import format_discounts_for_context

    gemini_history = [
        {"role": "user", "parts": [f"[SYSTEM INSTRUCTION]\n{SYSTEM_PROMPT}"]},
        {"role": "model", "parts": ["Đã hiểu! Mình là LaptopBot, sẵn sàng tư vấn laptop cho bạn. 😊"]},
    ]

    # Inject preference summary nếu có (giúp Gemini nhớ user thích gì)
    pref_summary = memory.get_preference_summary()
    if pref_summary:
        gemini_history.append({"role": "user", "parts": [f"[CONTEXT TỪ CÁC LƯỢT TRƯỚC]\n{pref_summary}"]})
        gemini_history.append({"role": "model", "parts": ["Đã ghi nhận thông tin. Tôi sẽ dùng context này để tư vấn phù hợp hơn."]})

    # Get conversation history (with optional summarization)
    history = memory.get_messages_for_llm()
    for msg in history[-8:]:
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    # Current message + product context (RAG) + discounts
    current_msg = f"{user_text}"
    if context_text:
        current_msg += f"\n\n📦 SẢN PHẨM PHÙ HỢP (đã sắp xếp theo độ phù hợp):\n{context_text}"

    # Inject active discounts
    discounts_text = format_discounts_for_context()
    if discounts_text:
        current_msg += f"\n\n{discounts_text}"

    try:
        logger.info("Sending request to Gemini (%s)...", GEMINI_MODEL)

        model = _get_model()
        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(current_msg)

        logger.info("Gemini responded (%d chars)", len(response.text))
        return response.text
    except KeyboardInterrupt:
        return "⚠️ Đã huỷ yêu cầu. Bạn có thể hỏi lại hoặc thử câu ngắn hơn."
    except Exception as e:
        error_msg = str(e)
        logger.error("Gemini API error: %s", error_msg)
        if "API_KEY" in error_msg or "401" in error_msg or "403" in error_msg:
            return "⚠️ Lỗi API Key Gemini. Kiểm tra lại GEMINI_API_KEY."
        if "quota" in error_msg.lower() or "429" in error_msg:
            return "⚠️ Hết quota Gemini API. Vui lòng thử lại sau vài phút nhé!"
        if "timeout" in error_msg.lower():
            return "⚠️ Gemini phản hồi quá lâu. Thử lại nhé!"
        if "not found" in error_msg.lower() or "404" in error_msg:
            return f"⚠️ Model '{GEMINI_MODEL}' không tồn tại. Kiểm tra lại GEMINI_MODEL."
        return f"⚠️ Lỗi Gemini: {e}"

