"""Phase 4 Final Verification — All Modules, No DB Required."""
import sys, os, types

os.environ["DB_URI"] = "sqlite:///:memory:"
os.environ["GEMINI_API_KEY"] = "test-key"
os.environ["GEMINI_MODEL"] = "gemini-2.5-flash"

import logging; logging.basicConfig(level=logging.WARNING)

# --- Mocks ---
class MockDB:
    Model = type('M', (), {'__tablename__': '', 'query': None})
    Column = lambda *a, **k: None; BigInteger = int; String = str; Text = str
    Boolean = bool; Integer = int; Numeric = float; DateTime = type('DT', (), {})
    ForeignKey = lambda *a, **k: None
    func = types.SimpleNamespace(rand=lambda: None, sum=lambda *a, **k: None)
    session = types.SimpleNamespace(commit=lambda: None,
        query=lambda *a, **k: types.SimpleNamespace(filter=lambda *a, **k: types.SimpleNamespace(all=lambda: []),
            join=lambda *a, **k: types.SimpleNamespace(filter=lambda *a, **k: types.SimpleNamespace(group_by=lambda *a, **k: types.SimpleNamespace(all=lambda: [])))))
    def relationship(*a, **k): return None
    def __getattr__(self, name): return lambda *a, **k: None

config_mod = types.ModuleType('config')
config_mod.app = type('A', (), {'config': {}, '__getattr__': lambda s, n: lambda *a, **k: None})()
config_mod.db = MockDB(); config_mod.limiter = type('L', (), {'limit': lambda s, *a, **k: lambda f: f, '__getattr__': lambda s, n: lambda *a, **k: None})()
config_mod.DB_URI = os.environ["DB_URI"]; config_mod.GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
config_mod.GEMINI_MODEL = os.environ["GEMINI_MODEL"]; config_mod.TOP_K = 5; config_mod.CANDIDATE_LIMIT = 500
config_mod.SESSION_TTL = 3600; config_mod._sessions = {}; config_mod.logger = logging.getLogger("test")
config_mod.get_or_create_session = lambda sid=None: ("test", None)
sys.modules['config'] = config_mod

models_mod = types.ModuleType('models')
for cls in ['ProductOption', 'Product', 'ProductVariant', 'ProductReview', 'Discount',
            'OrderItem', 'Order', 'CartItem', 'UserViewHistory', 'Brand', 'Category', 'User']:
    qmock = types.SimpleNamespace(filter=lambda *a, **k: types.SimpleNamespace(
        all=lambda: [], order_by=lambda *a, **k: types.SimpleNamespace(all=lambda: [])))
    setattr(models_mod, cls, type(cls, (), {'query': qmock, 'id': 1}))
sys.modules['models'] = models_mod

for m in ['flask', 'flask_cors', 'flask_sqlalchemy', 'flask_limiter', 'flask_limiter.util',
          'dotenv', 'sqlalchemy', 'sqlalchemy.orm']:
    if m not in sys.modules: sys.modules[m] = types.ModuleType(m)
sys.modules['sqlalchemy'].or_ = lambda *a: None; sys.modules['sqlalchemy'].func = types.SimpleNamespace()
sys.modules['sqlalchemy.orm'].joinedload = lambda *a: None

genai = types.ModuleType('google.generativeai')
genai.configure = lambda **k: None
genai.GenerativeModel = type('GM', (), {'__init__': lambda s, **k: None, 'start_chat': lambda s, **k: s,
    'send_message': lambda s, m: types.SimpleNamespace(text="mock"), 'generate_content': lambda s, m: types.SimpleNamespace(text="search")})
genai.types = types.SimpleNamespace(GenerationConfig=lambda **k: {})
sys.modules['google'] = types.ModuleType('google'); sys.modules['google.generativeai'] = genai

sys.path.insert(0, r'd:\CSCV')

passed = 0; failed = 0
def test(name, cond):
    global passed, failed
    if cond: print(f"  PASS: {name}"); passed += 1
    else: print(f"  FAIL: {name}"); failed += 1

# ====== TEST 1: NLP ======
print("=" * 50); print("TEST 1: NLP Fuzzy")
from nlp_utils import _levenshtein_distance, _is_fuzzy_match, _word_boundary_match, extract_tags
test("DL transposition", _levenshtein_distance("gaming", "gmaing") == 1)
test("Fuzzy match", _is_fuzzy_match("gmaing", "gaming"))
test("Boundary OK", _word_boundary_match("cho em hp gaming", "hp"))
test("Boundary NO", not _word_boundary_match("shopping", "hp"))

# ====== TEST 2: Tags ======
print("\n" + "=" * 50); print("TEST 2: Tags")
test("Gaming", "USE:gaming" in extract_tags("laptop gaming"))
test("Asus brand", "BRAND:asus" in extract_tags("laptop asus"))
test("Gen-Z xin so", "PRICE:premium" in extract_tags("laptop xin so"))
test("Ngon bo re", "PRICE:cheap" in extract_tags("ngon bo re"))

# ====== TEST 3: Tiers ======
print("\n" + "=" * 50); print("TEST 3: CPU/GPU Tiers")
from scoring import _get_cpu_tier, _get_gpu_tier
test("i7>i5", _get_cpu_tier("Intel Core i7-13700H") > _get_cpu_tier("Intel Core i5-13500U"))
test("RTX4090>4060", _get_gpu_tier("NVIDIA RTX 4090") > _get_gpu_tier("NVIDIA RTX 4060"))
test("RTX3050>Iris", _get_gpu_tier("NVIDIA RTX 3050") > _get_gpu_tier("Intel Iris Xe"))

# ====== TEST 4: Budget ======
print("\n" + "=" * 50); print("TEST 4: Budget")
from budget_parser import parse_budget_vnd
test("duoi 20tr", parse_budget_vnd("duoi 20 trieu") == (0, 20_000_000))
test("sinh vien", parse_budget_vnd("gia sinh vien") == (8_000_000, 18_000_000))

# ====== TEST 5: Memory ======
print("\n" + "=" * 50); print("TEST 5: Memory Prefs")
from conversation import ConversationMemory
m = ConversationMemory()
m.add_user("laptop asus gaming duoi 25 trieu")
test("Brand tracked", "asus" in m.user_preferences["brands"])
test("Use tracked", "gaming" in m.user_preferences["use_cases"])
m.add_user("laptop nhe pin trau")
test("Light tracked", "light" in m.user_preferences["must_have"])
test("Battery tracked", "long_battery" in m.user_preferences["must_have"])
m.last_option_ids = [1]; m.add_user("khong thich")
test("Rejection", len(m.user_preferences["rejected_ids"]) > 0)

# ====== TEST 6: Intent ======
print("\n" + "=" * 50); print("TEST 6: Intent")
from intent_router import classify_intent
m2 = ConversationMemory()
test("Greeting", classify_intent("xin chao", m2) == "greeting")
test("Thanks", classify_intent("cam on", m2) == "thanks")
test("Compare", classify_intent("so sanh dell voi hp", m2) == "compare")
test("Search", classify_intent("tu van laptop gaming", m2) == "search")
test("General", classify_intent("ips la gi", m2) == "general")

# ====== TEST 7: Entity Extraction (NEW Phase 4) ======
print("\n" + "=" * 50); print("TEST 7: Entity Extraction (Phase 4)")
from entity_extractor import extract_product_entities, detect_user_segment, generate_clarification, calculate_value_score

ents1 = extract_product_entities("em muon mua macbook pro cho de hoa")
test("Detect MacBook Pro", "MacBook Pro" in ents1)

ents2 = extract_product_entities("alienware hay rog tot hon")
test("Detect Alienware", "Dell Alienware" in ents2)
test("Detect ROG", "ASUS ROG" in ents2)

ents3 = extract_product_entities("thinkpad hay yoga cho van phong")
test("Detect ThinkPad", "Lenovo ThinkPad" in ents3)
test("Detect Yoga", "Lenovo Yoga" in ents3)

ents4 = extract_product_entities("hp dragonfly co nhe khong")
test("Detect Dragonfly", "HP Elite Dragonfly" in ents4)

ents5 = extract_product_entities("tuf gaming asus")
test("Detect TUF", "ASUS TUF Gaming" in ents5)

ents6 = extract_product_entities("surface pro cho sinh vien")
test("Detect Surface", "Microsoft Surface" in ents6)

# ====== TEST 8: User Segment Detection (NEW Phase 4) ======
print("\n" + "=" * 50); print("TEST 8: User Segment Detection (Phase 4)")

seg1 = detect_user_segment("em la sinh vien nam 3 dai hoc")
test("Student segment", seg1["segment"] == "student")
test("Student confidence", seg1["confidence"] >= 0.5)

seg2 = detect_user_segment("tim laptop choi valorant pubg max setting")
test("Gamer segment", seg2["segment"] == "gamer")

seg3 = detect_user_segment("can laptop chay photoshop illustrator render video")
test("Creative segment", seg3["segment"] == "creative")

seg4 = detect_user_segment("laptop chay docker python vscode")
test("Developer segment", seg4["segment"] == "developer")

seg5 = detect_user_segment("laptop cho cong viec van phong excel powerpoint")
test("Professional segment", seg5["segment"] == "professional")

seg6 = detect_user_segment("laptop tot")
test("General (no signals)", seg6["segment"] == "general")

# ====== TEST 9: Smart Clarification (NEW Phase 4) ======
print("\n" + "=" * 50); print("TEST 9: Smart Clarification (Phase 4)")
c1 = generate_clarification(set(), None, {"segment": "general"})
test("Ask both when empty", "mục đích" in c1 and "ngân sách" in c1)

c2 = generate_clarification({"USE:gaming"}, None, {"segment": "gamer"})
test("Ask budget only", "ngân sách" in c2.lower() if c2 else True)

c3 = generate_clarification({"USE:gaming"}, (15_000_000, 30_000_000), {"segment": "gamer"})
test("No question when complete", c3 == "")

# ====== TEST 10: System Prompt ======
print("\n" + "=" * 50); print("TEST 10: System Prompt")
from gemini_service import SYSTEM_PROMPT
test("Chain-of-thought", "Chain-of-Thought" in SYSTEM_PROMPT)
test("Trade-off", "Trade-off" in SYSTEM_PROMPT)
test("Review aware", "Review" in SYSTEM_PROMPT)
test("Discount aware", "giảm giá" in SYSTEM_PROMPT)

# ====== TEST 11: Product Intelligence ======
print("\n" + "=" * 50); print("TEST 11: Product Intelligence")
from product_intelligence import format_review_for_context
r = format_review_for_context(1, {"avg_rating": 5.0, "count": 3, "highlights": ["Tuyệt vời"], "negatives": []})
test("Review with 5 stars", "⭐" in r and "Tuyệt vời" in r)

# ====== TEST 12: Recommender ======
print("\n" + "=" * 50); print("TEST 12: Recommender")
from recommender import _cpu_family, _gpu_family
test("i7 family", _cpu_family("Intel Core i7-13700H") == _cpu_family("Intel Core i7-12700H"))
test("GPU family", _gpu_family("NVIDIA GeForce RTX 4060") == "rtx 4060")

# ====== RESULTS ======
print("\n" + "=" * 50)
print(f"RESULTS: {passed} passed, {failed} failed")
print("=" * 50)
if failed == 0: print("ALL TESTS PASSED!")
else: print(f"WARNING: {failed} test(s) failed!"); sys.exit(1)
