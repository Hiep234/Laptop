from datetime import datetime
from flask import request, jsonify

from config import app, limiter, _sessions, TOP_K, DB_URI, GEMINI_MODEL, logger
from config import get_or_create_session
from nlp_utils import autocorrect_vi
from search import smart_search
from recommender import get_recommendations
from gemini_service import build_context, gemini_chat_with_memory
from intent_router import classify_intent

# ================================================================
#  CLI  –  giao diện terminal thông minh
# ================================================================
HELP = """
╔══════════════════════════════════════════════════════════╗
║      🤖 LAPTOP CHATBOT – Trợ lý AI thông minh         ║
╠══════════════════════════════════════════════════════════╣
║  Gõ câu hỏi tự nhiên bằng tiếng Việt, ví dụ:         ║
║                                                          ║
║  • "Tư vấn laptop gaming dưới 25 triệu"                ║
║  • "Laptop nhẹ pin trâu cho sinh viên"                  ║
║  • "Máy đồ hoạ tầm 30-40tr màn đẹp"                    ║
║  • "Asus hay Dell tốt hơn tầm 20tr?"                   ║
║  • "Laptop lập trình 16GB RAM SSD 512"                  ║
║  • "Con rẻ nhất trong mấy cái vừa gợi ý?"              ║
║  • "So sánh con Asus với con Dell"                      ║
║  • "Laptop nguòn góc Việt Nam rẻ mà tốt"              ║
║  • "Máy bàn phím cơ chơi game mượt"                    ║
║  • "Cho em laptop giá sinh viên nè"                     ║
║                                                          ║
║  Hỗ trợ: tiếng Việt có dấu/không dấu,                ║
║          tự sửa lỗi chính tả, tiếng lóng                 ║
║                                                          ║
║  Lệnh đặc biệt:                                        ║
║  /rec <user_id>  Gợi ý theo hành vi mua hàng           ║
║  /clear           Xoá lịch sử hội thoại                ║
║  /tags            Xem tags đã nhận diện                 ║
║  /help            Xem hướng dẫn này                     ║
║  /quit            Thoát                                 ║
╚══════════════════════════════════════════════════════════╝
"""

def format_tags_display(tags: set, budget) -> str:
    """Format tags đẹp để debug/hiển thị."""
    if not tags and not budget:
        return ""
    parts = []
    if budget:
        lo, hi = budget
        if lo == 0:
            parts.append(f"💰 Dưới {hi/1e6:.0f}tr")
        elif hi >= 999_000_000:
            parts.append(f"💰 Trên {lo/1e6:.0f}tr")
        else:
            parts.append(f"💰 {lo/1e6:.0f}-{hi/1e6:.0f}tr")

    tag_icons = {
        "USE:": "🎯", "ATTR:": "✨", "BRAND:": "🏷️",
        "OS:": "💻", "SPEC:": "📐", "PRICE:": "💰", "INTENT:": "🔍"
    }
    for tag in sorted(tags):
        icon = "•"
        for prefix, ic in tag_icons.items():
            if tag.startswith(prefix):
                icon = ic
                break
        parts.append(f"{icon} {tag}")

    return " | ".join(parts)


# ================================================================
#  REST API ENDPOINTS  –  Spring Boot / React gọi qua HTTP
# ================================================================

def _build_response(message: str, session_id: str, intent: str = "",
                    tags: list = None, budget: dict = None,
                    product_ids: list = None):
    """Helper tạo JSON response chuẩn."""
    resp = {
        "session_id": session_id,
        "message": message,
        "intent": intent,
        "tags": tags or [],
        "budget": budget,
        "product_ids": product_ids or [],
        "timestamp": datetime.now().isoformat(),
    }
    return jsonify(resp)


@app.route("/api/chat", methods=["POST"])
@limiter.limit("30 per minute")
def api_chat():
    """
    POST /api/chat
    Body JSON: { "message": "...", "session_id": "..." (optional) }
    Response JSON: {
        "session_id": "...",
        "message": "...",
        "intent": "search|greeting|followup|general|compare|detail",
        "tags": ["USE:gaming", "BRAND:asus", ...],
        "budget": { "min": 0, "max": 20000000 } | null,
        "product_ids": [1, 2, 3],
        "timestamp": "..."
    }
    """
    data = request.get_json(silent=True) or {}
    msg = (data.get("message") or "").strip()
    if not msg:
        return jsonify({"error": "Thiếu trường 'message'"}), 400

    session_id, memory = get_or_create_session(data.get("session_id"))

    try:
        result = _process_message(msg, memory)
    except Exception as e:
        logger.error("Error processing message: %s", e, exc_info=True)
        return jsonify({"error": f"Lỗi xử lý: {e}", "session_id": session_id}), 500

    logger.info(
        "Chat: session=%s intent=%s tags=%s",
        session_id[:8], result.get("intent", ""), result.get("tags", [])
    )

    return _build_response(
        message=result["answer"],
        session_id=session_id,
        intent=result.get("intent", ""),
        tags=result.get("tags", []),
        budget=result.get("budget"),
        product_ids=result.get("product_ids", []),
    )


@app.route("/api/chat/clear", methods=["POST"])
def api_clear():
    """
    POST /api/chat/clear
    Body JSON: { "session_id": "..." }
    """
    data = request.get_json(silent=True) or {}
    sid = data.get("session_id")
    if sid:
        session_id, memory = get_or_create_session(sid)
        memory.clear()
        logger.info("Session cleared: %s", sid[:8])
    return jsonify({"session_id": sid, "message": "Đã xoá lịch sử hội thoại."})


@app.route("/api/chat/tags", methods=["POST"])
def api_tags():
    """
    POST /api/chat/tags
    Body JSON: { "session_id": "..." }
    """
    data = request.get_json(silent=True) or {}
    sid = data.get("session_id")
    if not sid or sid not in _sessions:
        return jsonify({"session_id": sid, "tags": [], "budget": None, "display": "Chưa có tags nào."})

    _, memory = get_or_create_session(sid)
    display = format_tags_display(memory.accumulated_tags, memory.last_budget)
    budget_dict = None
    if memory.last_budget:
        budget_dict = {"min": memory.last_budget[0], "max": memory.last_budget[1]}
    return jsonify({
        "session_id": sid,
        "tags": sorted(memory.accumulated_tags),
        "budget": budget_dict,
        "display": display or "Chưa có tags nào."
    })


@app.route("/api/recommendations", methods=["GET"])
@limiter.limit("10 per minute")
def api_recommendations():
    """
    GET /api/recommendations?user_id=123
    Gợi ý laptop theo hành vi mua hàng của user.
    """
    user_id = request.args.get("user_id")
    if not user_id or not str(user_id).isdigit():
        return jsonify({"error": "Thiếu hoặc sai 'user_id' (số nguyên)"}), 400

    user_id = int(user_id)
    session_id, memory = get_or_create_session(None)

    ids = get_recommendations(user_id)
    ctx = build_context(ids)
    memory.add_user(f"Gợi ý laptop cho mình (user #{user_id})")
    ans = gemini_chat_with_memory(
        f"Dựa vào hành vi mua hàng của khách hàng #{user_id}, hãy tư vấn laptop phù hợp.",
        ctx, memory
    )
    memory.add_assistant(ans)

    logger.info("Recommendation for user #%d: %d products", user_id, len(ids))

    return jsonify({
        "message": ans,
        "intent": "recommend",
        "product_ids": ids,
        "timestamp": datetime.now().isoformat(),
    })


@app.route("/api/health", methods=["GET"])
def api_health():
    """Health check cho Spring Boot / load balancer."""
    return jsonify({
        "status": "ok",
        "model": GEMINI_MODEL,
        "db": DB_URI.split("@")[-1] if "@" in DB_URI else DB_URI,
        "active_sessions": len(_sessions),
    })


# ================================================================
#  MESSAGE PROCESSOR  –  xử lý logic chat (trả dict thay vì print)
# ================================================================
def _process_message(msg: str, memory) -> dict:
    """
    Xử lý 1 message, trả về dict:
    { "answer": str, "intent": str, "tags": list, "budget": dict|None, "product_ids": list }
    """
    # Auto-correct lỗi chính tả trước khi xử lý
    corrected_msg = autocorrect_vi(msg)
    intent = classify_intent(corrected_msg, memory)

    # ---- Entity extraction (Phase 4) ----
    from entity_extractor import (
        extract_product_entities, detect_user_segment,
        generate_clarification, calculate_value_score,
    )
    product_entities = extract_product_entities(msg)
    user_segment = detect_user_segment(msg, memory.messages)

    # Store segment in preferences
    if user_segment.get("segment", "general") != "general" and user_segment.get("confidence", 0) >= 0.5:
        seg = user_segment["segment"]
        seg_to_use = {"student": "office", "professional": "office", "gamer": "gaming",
                      "creative": "creative", "developer": "dev"}
        if seg in seg_to_use:
            memory.user_preferences["use_cases"].add(seg_to_use[seg])
        logger.info("User segment: %s (%.0f%% confidence)", seg, user_segment["confidence"] * 100)

    # ---- Greeting ----
    if intent == "greeting":
        memory.add_user(msg)
        # Greeting thông minh theo thời gian + segment
        hour = datetime.now().hour
        if hour < 12:
            time_greeting = "Chào buổi sáng"
        elif hour < 18:
            time_greeting = "Chào buổi chiều"
        else:
            time_greeting = "Chào buổi tối"

        # Personalized greeting based on detected segment
        segment_hint = ""
        if user_segment.get("segment") == "student":
            segment_hint = "\n\n💡 Mình có kinh nghiệm tư vấn laptop cho sinh viên — nhẹ, pin trâu, giá tốt!"
        elif user_segment.get("segment") == "gamer":
            segment_hint = "\n\n💡 Game thủ hả? Mình rành laptop gaming lắm — từ tầm 18 triệu cho tới 50 triệu+"
        elif user_segment.get("segment") == "creative":
            segment_hint = "\n\n💡 Bạn làm sáng tạo? Mình tư vấn laptop màn đẹp, GPU mạnh cho đồ hoạ/video!"

        greeting_resp = (
            f"{time_greeting}! 👋 Mình là LaptopBot, trợ lý tư vấn laptop.\n"
            "Bạn đang tìm laptop cho nhu cầu gì nè? Ví dụ:\n"
            "• 🎮 Gaming (Liên Minh, Valorant, PUBG...)\n"
            "• 📚 Học tập / Văn phòng\n"
            "• 🎨 Đồ hoạ / Thiết kế\n"
            "• 💻 Lập trình\n\n"
            "Hoặc cho mình biết ngân sách, mình gợi ý ngay! 😊"
            f"{segment_hint}"
        )
        memory.add_assistant(greeting_resp)
        return {"answer": greeting_resp, "intent": intent}

    # ---- Thanks / Goodbye ----
    if intent == "thanks":
        memory.add_user(msg)
        thanks_resp = (
            "Không có chi! 😊 Chúc bạn chọn được chiếc laptop ưng ý nhé!\n"
            "Nếu cần tư vấn thêm, cứ nhắn mình bất cứ lúc nào. Mình luôn sẵn sàng! 💪"
        )
        memory.add_assistant(thanks_resp)
        return {"answer": thanks_resp, "intent": intent}

    # ---- Off-topic ----
    if intent == "off_topic":
        memory.add_user(msg)
        off_topic_resp = (
            "Haha, câu này mình không rành lắm 😅 Mình chỉ giỏi tư vấn laptop thôi!\n"
            "Bạn có đang tìm laptop không? Nói cho mình biết nhu cầu nhé! 💻"
        )
        memory.add_assistant(off_topic_resp)
        return {"answer": off_topic_resp, "intent": intent}

    # ---- Follow-up ----
    if intent == "followup" and memory.last_option_ids:
        ctx = build_context(memory.last_option_ids)
        memory.add_user(msg)

        # Add segment context to follow-up
        segment_hint = ""
        if user_segment.get("segment", "general") != "general":
            segment_hint = f"\n[User profile: {user_segment['description']} — ưu tiên: {user_segment['priorities']}]\n"

        ans = gemini_chat_with_memory(corrected_msg + segment_hint, ctx, memory)
        memory.add_assistant(ans)
        return {"answer": ans, "intent": intent, "product_ids": memory.last_option_ids}

    # ---- General ----
    if intent == "general":
        memory.add_user(msg)
        old_ctx = build_context(memory.last_option_ids) if memory.last_option_ids else ""

        # Inject segment context
        segment_hint = ""
        if user_segment.get("segment", "general") != "general":
            segment_hint = f"\n[User profile: {user_segment['description']} — ưu tiên: {user_segment['priorities']}]\n"

        ans = gemini_chat_with_memory(corrected_msg + segment_hint, old_ctx, memory)
        memory.add_assistant(ans)
        return {"answer": ans, "intent": intent}

    # ---- Search / Compare / Detail ----
    # Pass memory for context-aware search (preference merging + rejected penalty)
    ids, tags, budget = smart_search(corrected_msg, TOP_K, memory=memory)

    # Nếu search không ra kết quả, thử lại không có memory filters
    if not ids:
        ids, tags, budget = smart_search(corrected_msg, TOP_K, memory=None)

    # Use segment budget_hint as fallback
    if not budget and user_segment.get("budget_hint"):
        budget = user_segment["budget_hint"]
        logger.info("Using segment-based budget: %s", budget)

    tags_list = sorted(tags)
    budget_dict = None
    if budget:
        budget_dict = {"min": budget[0], "max": budget[1]}

    if not ids:
        memory.add_user(msg)

        # Smart clarification instead of generic "no results"
        clarification = generate_clarification(tags, budget, user_segment)
        if clarification:
            no_result_msg = f"Mình chưa tìm được ngay, nhưng muốn hỏi thêm: {clarification}"
        else:
            no_result_msg = (
                "Mình chưa tìm được sản phẩm phù hợp. 😅\n"
                "Bạn thử:\n"
                "• Mở rộng ngân sách (ví dụ tăng thêm 3-5 triệu)\n"
                "• Nói rõ hơn nhu cầu (gaming / văn phòng / đồ hoạ?)\n"
                "• Bớt điều kiện (bỏ hãng cụ thể, size màn hình...)\n\n"
                "Hoặc gõ 'tư vấn' để mình hỏi kỹ hơn nhé! 😊"
            )
        memory.add_assistant(no_result_msg)
        return {"answer": no_result_msg, "intent": intent, "tags": tags_list, "budget": budget_dict}

    ctx = build_context(ids)
    memory.add_user(msg)
    memory.update_search_context(ids, tags, budget)

    # ---- Build enriched message for Gemini ----
    enriched_parts = [corrected_msg]

    # Intent hint
    if intent == "compare":
        enriched_parts.append("\n[Ý định: SO SÁNH – Hãy so sánh chi tiết, lập bảng markdown, nêu rõ ai phù hợp với ai]\n")
    elif intent == "detail":
        enriched_parts.append("\n[Ý định: CHI TIẾT – Trình bày đầy đủ thông số, ưu/nhược điểm, đáng mua không?]\n")

    # Use-case tags hint
    use_tags = [t for t in tags if t.startswith("USE:")]
    if use_tags:
        use_names = {"USE:gaming": "gaming", "USE:office": "văn phòng/học tập",
                     "USE:creative": "đồ hoạ/thiết kế", "USE:dev": "lập trình"}
        needs = [use_names.get(t, t.split(":")[1]) for t in use_tags]
        enriched_parts.append(f"\n[Nhu cầu nhận diện: {', '.join(needs)}]\n")

    # Budget hint
    if budget:
        lo, hi = budget
        if lo == 0:
            enriched_parts.append(f"\n[Ngân sách: dưới {hi/1e6:.0f} triệu]\n")
        elif hi >= 999_000_000:
            enriched_parts.append(f"\n[Ngân sách: trên {lo/1e6:.0f} triệu]\n")
        else:
            enriched_parts.append(f"\n[Ngân sách: {lo/1e6:.0f}-{hi/1e6:.0f} triệu]\n")

    # User segment hint (Phase 4)
    if user_segment.get("segment", "general") != "general":
        enriched_parts.append(
            f"\n[User profile: {user_segment['description']} — "
            f"Ưu tiên: {user_segment['priorities']}]\n"
        )

    # Product entity hint (Phase 4)
    if product_entities:
        enriched_parts.append(f"\n[User nhắc đến: {', '.join(product_entities)}]\n")

    enriched_msg = "".join(enriched_parts)
    ans = gemini_chat_with_memory(enriched_msg, ctx, memory)
    memory.add_assistant(ans)

    return {
        "answer": ans,
        "intent": intent,
        "tags": tags_list,
        "budget": budget_dict,
        "product_ids": ids,
        "user_segment": user_segment.get("segment", "general"),
    }

