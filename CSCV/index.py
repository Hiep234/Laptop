import sys
import io

from config import app, DB_URI, GEMINI_MODEL, logger

# Import routes để đăng ký tất cả endpoints với Flask app
import routes  # noqa: F401

# ================================================================
#  RUN SERVER
# ================================================================
if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

    logger.info("=" * 56)
    logger.info("   LAPTOP AI CHATBOT - REST API")
    logger.info("=" * 56)
    logger.info("  DB : %s", DB_URI.split("@")[-1] if "@" in DB_URI else DB_URI)
    logger.info("  AI : Google Gemini (%s)", GEMINI_MODEL)
    logger.info("  API: http://localhost:5000")
    logger.info("")
    logger.info("  Endpoints:")
    logger.info("    POST /api/chat           - Chat")
    logger.info("    POST /api/chat/clear     - Xoa lich su")
    logger.info("    POST /api/chat/tags      - Xem tags")
    logger.info("    GET  /api/recommendations - Goi y theo user")
    logger.info("    GET  /api/health         - Health check")

    app.run(host="0.0.0.0", port=5000, debug=True)