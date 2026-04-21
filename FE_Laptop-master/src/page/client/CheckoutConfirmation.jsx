import {useContext, useEffect, useState} from 'react';
import '../style/CheckoutConfirmation.css';
import { CreditCardIcon, MapPinIcon, PackageIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import {Spin, Tag, Collapse, Alert, notification} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { createUrlPay } from "../../Redux/actions/PaymentThunk";
import {useDispatch, useSelector} from "react-redux";
import {getAllVoucher} from "../../Redux/actions/VoucherThunk";
import {getAllDistricts, getAllProvinces, getAllWards} from "../../Redux/actions/LocationThunk";
import {insertOrder} from "../../Redux/actions/OrderItemThunk";
import {getUserBalance} from "../../Redux/actions/UserThunk";
import {NotificationContext} from "../../components/NotificationProvider";

const { Panel } = Collapse;

const CheckoutConfirmation = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePanel, setActivePanel] = useState(['shipping']);
    const notification = useContext(NotificationContext);
    const { provinces, districts, wards, loading, error } = useSelector(state => state.LocationReducer);
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        postalCode: '',
        notes: '',
        paymentMethod: 'VNPAY'
    });
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAllProvinces());
    }, [dispatch]);

    useEffect(() => {
        if (formData.province) {
            dispatch(getAllDistricts(formData.province));
            setFormData(prev => ({ ...prev, district: '', ward: '' }));
        }
    }, [formData.province, dispatch]);

    useEffect(() => {
        if (formData.district) {
            dispatch(getAllWards(formData.district));
            setFormData(prev => ({ ...prev, ward: '' }));
        }
    }, [formData.district, dispatch]);
    const {
        cartItems = [],
        voucher = null,
        shippingFee = 30000,
        subtotal: cartSubtotal = 0,
        discount: cartDiscount = 0
    } = location.state || {};

    // Calculate order values
    const subtotal = cartSubtotal || cartItems.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
    const discountValue = cartDiscount || 0;
    const shipping = shippingFee || 0;
    const total = Math.max(0, subtotal - discountValue + shipping);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const validate = () => {
        const newErrors = {};

        if (formData.fullName.length < 2) newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ";
        if (!/^(0|\+84)[1-9][0-9]{8}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
        if (formData.address.length < 5) newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
        if (!formData.province) newErrors.province = "Thành phố không được để trống";
        if (!formData.district) newErrors.district = "Quận/Huyện không được để trống";
        if (!formData.ward) newErrors.ward = "Phường/Xã không được để trống";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            // Prepare order items
            const orderProductRequestList = cartItems.map(item => ({
                idCartItem: item.id,
                productVariantId: item.variantId,
                quantity: item.quantity,
                productCode: item.productCode,
                productName: item.productName,
                productImage: item.imageUrl,
                priceAtOrderTime: item.basePrice,
                productColor: item.color
            }));

            // Prepare order data
            const orderData = {
                userId: userData?.id,
                discountId: voucher?.id || -1,
                detailAddress: formData.address,
                fullName: formData.fullName,
                phoneNumber: formData.phone,
                email: formData.email,
                wardId: formData.ward,
                discount: cartDiscount || 0,
                paymentMethod: formData.paymentMethod,
                note: formData.notes,
                orderProductRequestList: orderProductRequestList
            };

            console.log("Submitting order:", orderData);
            const balanceRes = await dispatch(getUserBalance(userData?.id));
            if (balanceRes.code !== 200) {
                throw new Error('Failed to check user balance');
            }

            if (balanceRes.data < total && formData.paymentMethod === 'IN_APP') {
                notification.error({
                    message: 'Số dư không đủ',
                    description: 'Tài khoản của bạn không đủ số dư để thanh toán. Vui lòng chọn phương thức thanh toán khác.',
                });
                return;
            }

            const res = await dispatch(insertOrder(orderData));

            if (res.code !== 200) {
                throw new Error(res.message || 'Failed to create order');
            }

            // Handle different payment methods
            switch (formData.paymentMethod) {
                case 'COD':
                    window.location.href = '/result';
                    break;

                case 'IN_APP':
                    window.location.href = '/result';
                    break;

                case 'VNPAY':
                    const paymentRes = await dispatch(createUrlPay(total, res.data.orderId));
                    if (!paymentRes?.payload?.url) {
                        throw new Error('Failed to create payment URL');
                    }
                    window.location.href = paymentRes.payload.url;
                    break;

                default:
                    throw new Error('Phương thức thanh toán không hợp lệ');
            }

        } catch (error) {
            console.error("Order submission error:", error);
            notification.error({
                message: 'Lỗi đặt hàng',
                description: error.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handlePanelChange = (keys) => {
        setActivePanel(keys);
    };

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>Xác nhận đặt hàng</h1>
                <p>Vui lòng kiểm tra và hoàn tất thông tin đơn hàng</p>
            </div>

            <div className="checkout-grid">
                <div className="checkout-form-section">
                    <Collapse
                        activeKey={activePanel}
                        onChange={handlePanelChange}
                        expandIconPosition="end"
                        expandIcon={({ isActive }) =>
                            isActive ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />
                        }
                    >
                        <Panel
                            header={
                                <div className="panel-header">
                                    <span>Thông tin giao hàng</span>
                                </div>
                            }
                            key="shipping"
                        >
                            <form className="checkout-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Họ và tên <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="Nguyễn Văn A"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Email <span className="required">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <span className="error-message">{errors.email}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Số điện thoại <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="0912345678"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? 'error' : ''}
                                    />
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Địa chỉ <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Số nhà, tên đường"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={errors.address ? 'error' : ''}
                                    />
                                    {errors.address && <span className="error-message">{errors.address}</span>}
                                </div>

                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Tỉnh/Thành phố <span className="required">*</span></label>
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            className={errors.province ? 'error' : ''}
                                        >
                                            <option value="">Chọn tỉnh/thành phố</option>
                                            {provinces?.map(province => (
                                                <option key={province.id} value={province.id}>
                                                    {province.name.trim()} {/* Trim to remove any whitespace */}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.province && <span className="error-message">{errors.province}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Quận/Huyện <span className="required">*</span></label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            disabled={!formData.province}
                                            className={errors.district ? 'error' : ''}
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {districts?.map(district => (
                                                <option key={district.id} value={district.id}>
                                                    {district.name.trim()}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.district && <span className="error-message">{errors.district}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Phường/Xã <span className="required">*</span></label>
                                        <select
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleChange}
                                            disabled={!formData.district}
                                            className={errors.ward ? 'error' : ''}
                                        >
                                            <option value="">Chọn phường/xã</option>
                                            {wards?.map(ward => (
                                                <option key={ward.id} value={ward.id}>
                                                    {ward.name.trim()}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.ward && <span className="error-message">{errors.ward}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mã bưu điện (không bắt buộc)</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="700000"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ghi chú đơn hàng</label>
                                    <textarea
                                        name="notes"
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                    ></textarea>
                                </div>
                            </form>
                        </Panel>

                        <Panel
                            header={
                                <div className="panel-header">
                                    <span>Phương thức thanh toán</span>
                                </div>
                            }
                            key="payment"
                        >
                            <div className="payment-methods">
                                <div className="payment-option">
                                    <input
                                        type="radio"
                                        id="vnpay"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={formData.paymentMethod === 'VNPAY'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="vnpay">
                                        <span> Thanh toán qua VNPAY</span>
                                    </label>
                                </div>
                                <div className="payment-option">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={formData.paymentMethod === 'COD'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="cod">
                                        <span> Thanh toán khi nhận hàng (COD)</span>
                                    </label>
                                </div>
                                <div className="payment-option">
                                    <input
                                        type="radio"
                                        id="in_app"
                                        name="paymentMethod"
                                        value="IN_APP"
                                        checked={formData.paymentMethod === 'IN_APP'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="in_app">
                                        <span> Thanh toán qua số dư ví TechWallet</span>
                                    </label>
                                </div>
                            </div>
                        </Panel>
                    </Collapse>
                </div>

                <div className="checkout-summary">
                    <div className="checkout-card">
                        <div className="card-header-check">
                            <div className="header-icon-check">
                                <h2>Đơn hàng của bạn</h2>
                            </div>
                            <p>Tóm tắt đơn hàng</p>
                        </div>
                        <div className="card-content">
                            <div className="order-items">
                                {cartItems.map((item) => (
                                    <OrderItem key={item.id} item={item} />
                                ))}
                            </div>

                            <div className="divider"></div>

                            <OrderSummary
                                subtotal={subtotal}
                                discount={discountValue}
                                shipping={shipping}
                                total={total}
                                voucher={voucher}
                            />
                        </div>
                        <div className="card-footer-check">
                            <button
                                type="submit"
                                className={`checkout-button ${isSubmitting ? 'processing' : ''}`}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="button-loading">
                                        <Spin indicator={<LoadingOutlined style={{ color: '#fff', fontSize: 20 }} spin />} />
                                        <span>Đang xử lý...</span>
                                    </span>
                                ) : (
                                    <span className="button-content-check">
                                        <CreditCardIcon size={18} />
                                        <span>Hoàn tất đặt hàng</span>
                                    </span>
                                )}
                            </button>
                            <div className="checkout-note">
                                <p>Bằng cách nhấn nút trên, bạn đồng ý với <a href="/terms" target="_blank" rel="noopener noreferrer">điều khoản dịch vụ</a> và <a href="/privacy" target="_blank" rel="noopener noreferrer">chính sách bảo mật</a> của chúng tôi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderItem = ({ item }) => (
    <div className="order-item">
        <div className="item-image">
            <img
                src={item.imageUrl || '/default-product-image.png'}
                alt={item.name}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-product-image.png';
                }}
            />
        </div>
        <div className="item-details">
            <h4>{item.productName + " " + item.productCode}</h4>
            <div className="item-meta">
                <span>SL: {item.quantity} Đơn giá: {item.basePrice.toLocaleString("vi-VN")}₫</span>
            </div>
            {item.color && <div className="item-attribute">{item.color}</div>}
            {item.size && <div className="item-attribute">Size: {item.size}</div>}
        </div>
        <div className="item-price">
            {(item.basePrice * item.quantity).toLocaleString("vi-VN")}₫
        </div>
    </div>
);

const OrderSummary = ({ subtotal, discount, shipping, total, voucher }) => (
    <div className="order-summary">
        <div className="summary-section">
            <div className="summary-row">
                <span className="summary-label">Tạm tính</span>
                <span className="summary-value">{subtotal.toLocaleString("vi-VN")}₫</span>
            </div>

            {discount > 0 && (
                <div className="summary-row discount-row">
                    <span className="summary-label">
                        Giảm giá
                        {voucher && (
                            <Tag color="blue" className="voucher-tag">
                                {voucher.code}
                            </Tag>
                        )}
                    </span>
                    <span className="summary-value discount-value">
                        -{discount.toLocaleString("vi-VN")}₫
                    </span>
                </div>
            )}

            <div className="summary-row">
                <span className="summary-label">Phí vận chuyển</span>
                <span className="summary-value">
                    {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString("vi-VN")}₫`}
                </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
                <span className="total-label">Tổng cộng</span>
                <span className="total-value">{total.toLocaleString("vi-VN")}₫</span>
            </div>

            {voucher && (
                <div className="voucher-info">
                    <p className="voucher-name">Mã giảm giá: {voucher.code}</p>
                    {voucher.discountType === 'PERCENTAGE' && (
                        <p className="voucher-desc">Giảm {voucher.discountValue}% giá trị đơn hàng</p>
                    )}
                    {voucher.discountType === 'FIXED' && (
                        <p className="voucher-desc">Giảm {voucher.discountValue.toLocaleString()}₫</p>
                    )}
                </div>
            )}

            <div className="summary-note">
                <p>Đã bao gồm VAT (nếu có)</p>
                {shipping === 0 && subtotal < 1000000 && (
                    <p>Được miễn phí vận chuyển nhờ áp dụng mã khuyến mãi</p>
                )}
                {shipping === 0 && subtotal >= 1000000 && (
                    <p>Được miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</p>
                )}
            </div>
        </div>
    </div>
);

export default CheckoutConfirmation;