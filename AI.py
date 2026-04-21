from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_, and_
from collections import defaultdict
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost:3306/laptop_store'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Định nghĩa các model cơ bản trước
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

# Database Models
class ProductOption(db.Model):
    __tablename__ = 'product_options'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    audio_features = db.Column(db.Text)
    battery = db.Column(db.String(255))
    bluetooth = db.Column(db.String(255))
    code = db.Column(db.String(50), nullable=False)
    cpu = db.Column(db.String(255))
    dimension = db.Column(db.String(255))
    display_refresh_rate = db.Column(db.String(255))
    display_resolution = db.Column(db.String(255))
    display_size = db.Column(db.String(255))
    display_technology = db.Column(db.String(255))
    gpu = db.Column(db.String(255))
    is_delete = db.Column(db.Boolean)
    keyboard = db.Column(db.String(255))
    os = db.Column(db.String(255))
    ports = db.Column(db.Text)
    price = db.Column(db.Numeric(12, 2), nullable=False)
    ram = db.Column(db.String(255))
    ram_slot = db.Column(db.String(255))
    ram_type = db.Column(db.String(255))
    security = db.Column(db.String(255))
    special_features = db.Column(db.Text)
    storage = db.Column(db.String(255))
    storage_upgrade = db.Column(db.String(255))
    webcam = db.Column(db.String(255))
    weight = db.Column(db.String(255))
    wifi = db.Column(db.String(255))
    product_id = db.Column(db.BigInteger, db.ForeignKey('products.id'), nullable=False)
    
    product = db.relationship('Product', backref='options')

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    color = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.Text)
    is_delete = db.Column(db.Boolean)
    price_diff = db.Column(db.Numeric(12, 2))
    stock = db.Column(db.Integer)
    option_id = db.Column(db.BigInteger, db.ForeignKey('product_options.id'), nullable=False)
    
    product_option = db.relationship('ProductOption', backref='variants')

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    quantity = db.Column(db.Integer, nullable=False)
    product_variant_id = db.Column(db.BigInteger, db.ForeignKey('product_variants.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(6))
    updated_at = db.Column(db.DateTime(6))
    
    product_variant = db.relationship('ProductVariant', backref='cart_items')
    user = db.relationship('User', backref='cart_items')

class UserViewHistory(db.Model):
    __tablename__ = 'user_view_history'
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    product_id = db.Column(db.BigInteger, db.ForeignKey('products.id'))
    view_count = db.Column(db.Integer, default=1)
    last_viewed = db.Column(db.DateTime)
    
    product = db.relationship('Product')
    user = db.relationship('User')

# Hàm tính điểm tương đồng nâng cao với trọng số
def calculate_similarity_score(option1, option2):
    # Định nghĩa trọng số cho từng thuộc tính
    WEIGHTS = {
        'cpu': 5,          # CPU là yếu tố quan trọng nhất
        'gpu': 4,          # GPU quan trọng với người dùng đồ họa, game
        'ram': 3,          # RAM quan trọng nhưng không bằng CPU/GPU
        'ram_type': 2,     # Loại RAM ít quan trọng hơn dung lượng
        'storage': 3,      # Bộ nhớ quan trọng
        'display_size': 3, # Kích thước màn hình quan trọng
        'display_resolution': 3, # Độ phân giải quan trọng
        'display_technology': 2, # Công nghệ màn hình (IPS, OLED,...)
        'os': 2,          # Hệ điều hành
        'battery': 2,      # Pin
        'weight': 1,       # Trọng lượng
        'price': 4         # Giá cả rất quan trọng
    }
    
    score = 0
    total_possible = 0
    
    # So sánh các thuộc tính có trọng số
    for field, weight in WEIGHTS.items():
        if field == 'price':
            # Xử lý đặc biệt cho giá cả (tính % chênh lệch)
            price1 = float(option1.price) if option1.price else 0
            price2 = float(option2.price) if option2.price else 0
            if price1 > 0 and price2 > 0:
                price_diff = abs(price1 - price2) / max(price1, price2)
                # Càng ít chênh lệch giá thì điểm càng cao
                score += (1 - min(price_diff, 1)) * weight
                total_possible += weight
        else:
            val1 = getattr(option1, field, '') or ''
            val2 = (getattr(option2, field, '') or '')
            val1 = str(val1).lower().strip()
            val2 = str(val2).lower().strip()
            
            if val1 and val2:
                total_possible += weight
                if val1 == val2:
                    score += weight
                elif field == 'cpu' and val1.split()[0] == val2.split()[0]:
                    # Cùng hãng CPU nhưng khác model vẫn được một phần điểm
                    score += weight * 0.7
                elif field == 'gpu' and val1.split()[0] == val2.split()[0]:
                    # Cùng hãng GPU nhưng khác model
                    score += weight * 0.7
    
    # Tính phần trăm tương đồng
    if total_possible == 0:
        return 0
    return (score / total_possible) * 100

def get_user_preferences(user_id):
    """Phân tích hành vi người dùng để xác định sở thích"""
    preferences = {
        'price_range': None,
        'preferred_brands': set(),
        'preferred_specs': defaultdict(int)
    }
    
    # Phân tích giỏ hàng
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if cart_items:
        prices = [float(item.product_variant.product_option.price) for item in cart_items if item.product_variant.product_option.price]
        if prices:
            preferences['price_range'] = (min(prices), max(prices))
        
        for item in cart_items:
            option = item.product_variant.product_option
            if option.cpu:
                brand = option.cpu.split()[0]
                preferences['preferred_brands'].add(brand)
    
    # Phân tích lịch sử xem sản phẩm
    view_history = UserViewHistory.query.filter_by(user_id=user_id).order_by(
        UserViewHistory.last_viewed.desc()
    ).limit(20).all()
    
    for view in view_history:
        # Lấy option phổ biến nhất của sản phẩm đã xem
        popular_option = ProductOption.query.filter_by(
            product_id=view.product_id
        ).order_by(
            db.func.length(ProductOption.variants)
        ).first()
        
        if popular_option:
            if popular_option.cpu:
                brand = popular_option.cpu.split()[0]
                preferences['preferred_brands'].add(brand)
            
            # Ghi nhận các thông số kỹ thuật được xem nhiều
            if popular_option.ram:
                preferences['preferred_specs']['ram_' + popular_option.ram] += view.view_count
            if popular_option.storage:
                preferences['preferred_specs']['storage_' + popular_option.storage] += view.view_count
    
    return preferences

def get_recommendations(user_id):
    # Bước 1: Thu thập dữ liệu
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    preferences = get_user_preferences(user_id)
    
    # Bước 2: Xác định các option ứng viên
    if not cart_items and not preferences.get('preferred_brands'):
        return get_random_recommendations(5)
    
    # Lấy các option không nằm trong giỏ hàng và chưa bị xóa
    query = ProductOption.query.filter(
        ProductOption.is_delete != True
    )
    
    # Áp dụng bộ lọc theo sở thích nếu có
    if preferences.get('preferred_brands'):
        brand_filters = [
            ProductOption.cpu.ilike(f"{brand}%")
            for brand in preferences['preferred_brands']
        ]
        query = query.filter(or_(*brand_filters))
    
    if preferences.get('price_range'):
        min_price, max_price = preferences['price_range']
        price_buffer = (max_price - min_price) * 0.5
        query = query.filter(
            ProductOption.price.between(
                max(0, min_price - price_buffer),
                max_price + price_buffer
            )
        )
    
    candidate_options = query.all()
    
    if not candidate_options:
        return get_random_recommendations(5)
    
    # Bước 3: Tính điểm cho từng option
    scored_options = []
    
    for option in candidate_options:
        score = 0
        
        # 1. Điểm tương đồng với giỏ hàng
        if cart_items:
            cart_option_ids = [item.product_variant.option_id for item in cart_items]
            cart_options = ProductOption.query.filter(ProductOption.id.in_(cart_option_ids)).all()
            
            similarity_sum = sum(
                calculate_similarity_score(cart_opt, option)
                for cart_opt in cart_options
            )
            score += similarity_sum / len(cart_options) * 0.6  # Trọng số 60%
        
        # 2. Điểm phù hợp với sở thích người dùng
        if preferences:
            # Phù hợp thương hiệu
            if option.cpu and any(option.cpu.startswith(brand) for brand in preferences['preferred_brands']):
                score += 20  # Bonus điểm cho cùng thương hiệu
            
            # Phù hợp với các thông số được xem nhiều
            if option.ram and 'ram_' + option.ram in preferences['preferred_specs']:
                score += preferences['preferred_specs']['ram_' + option.ram] * 0.1
            
            if option.storage and 'storage_' + option.storage in preferences['preferred_specs']:
                score += preferences['preferred_specs']['storage_' + option.storage] * 0.1
        
        scored_options.append((option.id, score))
    
    # Sắp xếp theo điểm giảm dần
    scored_options.sort(key=lambda x: x[1], reverse=True)
    
    # Lấy top option có điểm cao nhất, đảm bảo không trùng lặp
    top_options = []
    seen_ids = set()
    
    for opt_id, score in scored_options:
        if opt_id not in seen_ids:
            top_options.append(opt_id)
            seen_ids.add(opt_id)
            if len(top_options) >= 5:
                break
    
    # Nếu không đủ 5, bổ sung bằng option ngẫu nhiên không trùng lặp
    if len(top_options) < 5:
        remaining = 5 - len(top_options)
        # Lấy các option chưa có trong danh sách
        existing_ids = set(top_options)
        random_options = ProductOption.query.filter(
            ProductOption.is_delete != True,
            ProductOption.id.notin_(existing_ids)
        ).order_by(db.func.rand()).limit(remaining).all()
        
        for opt in random_options:
            if opt.id not in existing_ids:
                top_options.append(opt.id)
                existing_ids.add(opt.id)
                if len(top_options) >= 5:
                    break
    
    return top_options[:5]  # Đảm bảo chỉ trả về tối đa 5 ID

def get_random_recommendations(count):
    # Lấy ngẫu nhiên các option không trùng lặp
    options = ProductOption.query.filter(
        ProductOption.is_delete != True
    ).distinct(ProductOption.id).order_by(db.func.rand()).limit(count).all()
    return [opt.id for opt in options]


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations_api():
    user_id = request.args.get('user_id', type=int)
    
    try:
        if not user_id:
            recommended_ids = get_random_recommendations(5)
            return jsonify({
                'message': 'Showing random recommendations since no user_id provided',
                'recommended_product_option_ids': recommended_ids,
                'count': len(recommended_ids)
            })
        
        recommended_ids = get_recommendations(user_id)
        return jsonify({
            'user_id': user_id,
            'recommended_product_option_ids': recommended_ids,
            'count': len(recommended_ids)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Tạo bảng nếu chưa tồn tại
    app.run(debug=True)