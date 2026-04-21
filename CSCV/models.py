from config import db

# ================== MODELS ==================
class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    is_delete = db.Column(db.Boolean)
    brand_id = db.Column(db.BigInteger, db.ForeignKey("brands.id"))
    category_id = db.Column(db.BigInteger, db.ForeignKey("categories.id"))

    brand = db.relationship("Brand", backref="products")
    category = db.relationship("Category", backref="products")

class Brand(db.Model):
    __tablename__ = "brands"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_delete = db.Column(db.Boolean)

class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    is_delete = db.Column(db.Boolean)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

class ProductOption(db.Model):
    __tablename__ = "product_options"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), nullable=False)

    audio_features = db.Column(db.Text)
    battery = db.Column(db.String(255))
    bluetooth = db.Column(db.String(255))
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

    product_id = db.Column(db.BigInteger, db.ForeignKey("products.id"), nullable=False)
    product = db.relationship("Product", backref="options")

class ProductVariant(db.Model):
    __tablename__ = "product_variants"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    color = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.Text)
    is_delete = db.Column(db.Boolean)
    price_diff = db.Column(db.Numeric(12, 2))
    stock = db.Column(db.Integer)

    option_id = db.Column(db.BigInteger, db.ForeignKey("product_options.id"), nullable=False)
    product_option = db.relationship("ProductOption", backref="variants")

class ProductReview(db.Model):
    __tablename__ = "product_reviews"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    comment = db.Column(db.Text)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    product_option_id = db.Column(db.BigInteger, db.ForeignKey("product_options.id"), nullable=False)

    user = db.relationship("User", backref="reviews")
    product_option = db.relationship("ProductOption", backref="reviews")

class Discount(db.Model):
    __tablename__ = "discounts"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    code = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    discount_type = db.Column(db.String(20), nullable=False)  # 'FIXED' or 'PERCENT'
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean)
    is_delete = db.Column(db.Boolean)
    quantity = db.Column(db.Integer)

class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_order_time = db.Column(db.Numeric(10, 2), nullable=False)
    product_code = db.Column(db.String(50), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    is_delete = db.Column(db.Boolean)
    order_id = db.Column(db.BigInteger, db.ForeignKey("orders.id"), nullable=False)
    product_variant_id = db.Column(db.BigInteger, db.ForeignKey("product_variants.id"), nullable=False)

    product_variant = db.relationship("ProductVariant", backref="order_items")

class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    status = db.Column(db.String(20), nullable=False)  # PENDING, CONFIRMED, SHIPPED, COMPLETED, CANCELLED
    payment_status = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime)

    user = db.relationship("User", backref="orders")
    items = db.relationship("OrderItem", backref="order")

class CartItem(db.Model):
    __tablename__ = "cart_items"
    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    quantity = db.Column(db.Integer, nullable=False)
    product_variant_id = db.Column(db.BigInteger, db.ForeignKey("product_variants.id"), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)

    product_variant = db.relationship("ProductVariant", backref="cart_items")
    user = db.relationship("User", backref="cart_items")

class UserViewHistory(db.Model):
    __tablename__ = "user_view_history"
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"))
    product_id = db.Column(db.BigInteger, db.ForeignKey("products.id"))
    view_count = db.Column(db.Integer, default=1)

    product = db.relationship("Product")
    user = db.relationship("User")
