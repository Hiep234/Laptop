import os
import uuid
import logging
import threading
import time
import atexit

import google.generativeai as genai
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# ================== LOAD .env ==================
load_dotenv()

# ================== LOGGING ==================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("laptopbot")

# ================== CONFIG ==================
DB_URI = os.getenv("DB_URI")
if not DB_URI:
    raise ValueError("DB_URI environment variable is required. Set it in .env file.")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required. Set it in .env file.")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
TOP_K = int(os.getenv("TOP_K", "5"))
CANDIDATE_LIMIT = int(os.getenv("CANDIDATE_LIMIT", "500"))
SESSION_TTL = int(os.getenv("SESSION_TTL", "3600"))

# ---- Cấu hình Gemini ----
genai.configure(api_key=GEMINI_API_KEY)

# ================== FLASK APP ==================
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
CORS(app)

db = SQLAlchemy(app)

# ================== RATE LIMITER ==================
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri="memory://",
)

# ================== SESSION MANAGEMENT ==================
_sessions = {}
_sessions_lock = threading.Lock()


def get_or_create_session(session_id=None):
    """Lấy hoặc tạo session. Trả về (session_id, memory)."""
    from conversation import ConversationMemory
    with _sessions_lock:
        if session_id and session_id in _sessions:
            mem, _ = _sessions[session_id]
            _sessions[session_id] = (mem, time.time())  # refresh TTL
            return session_id, mem
        # Tạo session mới
        new_id = session_id or str(uuid.uuid4())
        mem = ConversationMemory(max_turns=10)
        _sessions[new_id] = (mem, time.time())
        return new_id, mem


def cleanup_sessions():
    """Xoá sessions hết hạn."""
    now = time.time()
    with _sessions_lock:
        expired = [k for k, (_, ts) in _sessions.items() if now - ts > SESSION_TTL]
        for k in expired:
            del _sessions[k]
        if expired:
            logger.info("Cleaned up %d expired sessions", len(expired))


# ================== BACKGROUND SCHEDULER ==================
def _start_session_cleanup_scheduler():
    """Chạy cleanup sessions mỗi 5 phút ở background thread."""
    def _run():
        while True:
            time.sleep(300)  # 5 phút
            try:
                cleanup_sessions()
            except Exception as e:
                logger.error("Session cleanup error: %s", e)

    t = threading.Thread(target=_run, daemon=True, name="session-cleanup")
    t.start()
    logger.info("Session cleanup scheduler started (every 5 minutes)")


_start_session_cleanup_scheduler()
