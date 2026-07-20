import {useContext, useEffect, useState} from 'react';
import '../style/CheckoutConfirmation.css';
import { CreditCardIcon, MapPinIcon, PackageIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import {Spin, Tag, Collapse, Alert, notification} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { createUrlPay } from "../../Redux/actions/PaymentThunk";
import {useDispatch, useSelector} from "react-redux";
import {getAllVoucher} from "../../Redux/actions/VoucherThunk";
import {insertOrder} from "../../Redux/actions/OrderItemThunk";
import {getUserBalance} from "../../Redux/actions/UserThunk";
import {NotificationContext} from "../../components/NotificationProvider";
import { shippingService } from "../../Service/ShippingService";
import { SHOP_DISTRICT_ID } from "../../Utils/Setting/Config";
import { money } from "../../Utils/orderHelpers";

const { Panel } = Collapse;

const CheckoutConfirmation = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePanel, setActivePanel] = useState(['shipping']);
    const notification = useContext(NotificationContext);
    
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        notes: '',
        paymentMethod: 'COD'
    });
    const [errors, setErrors] = useState({});

    // GHN states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState(null); // holds full province object
    const [selectedDistrict, setSelectedDistrict] = useState(null); // holds full district object
    const [selectedWard, setSelectedWard] = useState(null); // holds full ward object

    const [shippingFee, setShippingFee] = useState(0);
    const [shippingFeeDetails, setShippingFeeDetails] = useState(null);
    const [shippingError, setShippingError] = useState("");
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isCalculatingShippingFee, setIsCalculatingShippingFee] = useState(false);
    const [serviceId, setServiceId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProvinces = async () => {
            setIsLoadingAddress(true);
            try {
                const res = await shippingService.getProvinces();
                let list = [];
                if (res && Array.isArray(res.data)) {
                    list = res.data;
                } else if (res && res.data && Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (res && res.data && Array.isArray(res.data)) {
                    list = res.data;
                }
                setProvinces(list);
            } catch (err) {
                console.error("Error fetching GHN provinces:", err);
                notification.error({
                    message: "Không thể tải danh sách địa chỉ, vui lòng thử lại.",
                });
            } finally {
                setIsLoadingAddress(false);
            }
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceIdVal = e.target.value;
        if (!provinceIdVal) {
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setDistricts([]);
            setWards([]);
            setShippingFee(0);
            setShippingFeeDetails(null);
            setShippingError("");
            setServiceId(null);
            return;
        }

        const provId = parseInt(provinceIdVal, 10);
        const prov = provinces.find(p => p.ProvinceID === provId);

        setSelectedProvince(prov || { ProvinceID: provId, ProvinceName: "" });
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
        setShippingFee(0);
        setShippingFeeDetails(null);
        setShippingError("");
        setServiceId(null);

        setIsLoadingAddress(true);
        try {
            const res = await shippingService.getDistricts(provId);
            let list = [];
            if (res && Array.isArray(res.data)) {
                list = res.data;
            } else if (res && res.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (res && res.data && Array.isArray(res.data)) {
                list = res.data;
            }
            setDistricts(list);
        } catch (err) {
            console.error("Error fetching districts:", err);
            notification.error({
                message: "Không thể tải danh sách địa chỉ, vui lòng thử lại.",
            });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtIdVal = e.target.value;
        if (!districtIdVal) {
            setSelectedDistrict(null);
            setSelectedWard(null);
            setWards([]);
            setShippingFee(0);
            setShippingFeeDetails(null);
            setShippingError("");
            setServiceId(null);
            return;
        }

        const distId = parseInt(districtIdVal, 10);
        const dist = districts.find(d => d.DistrictID === distId);

        setSelectedDistrict(dist || { DistrictID: distId, DistrictName: "" });
        setSelectedWard(null);
        setWards([]);
        setShippingFee(0);
        setShippingFeeDetails(null);
        setShippingError("");
        setServiceId(null);

        setIsLoadingAddress(true);
        try {
            const res = await shippingService.getWards(distId);
            let list = [];
            if (res && Array.isArray(res.data)) {
                list = res.data;
            } else if (res && res.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (res && res.data && Array.isArray(res.data)) {
                list = res.data;
            }
            setWards(list);
        } catch (err) {
            console.error("Error fetching wards:", err);
            notification.error({
                message: "Không thể tải danh sách địa chỉ, vui lòng thử lại.",
            });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleWardChange = (e) => {
        const wardCodeVal = e.target.value;
        if (!wardCodeVal) {
            setSelectedWard(null);
            setShippingFee(0);
            setShippingFeeDetails(null);
            setShippingError("");
            setServiceId(null);
            return;
        }

        const wrd = wards.find(w => w.WardCode === wardCodeVal);
        setSelectedWard(wrd || { WardCode: wardCodeVal, WardName: "" });
        setShippingFee(0);
        setShippingFeeDetails(null);
        setShippingError("");
        setServiceId(null);
    };

    const {
        cartItems = [],
        voucher = null,
        shippingFee: initialShippingFee = 0,
        subtotal: cartSubtotal = 0,
        discount: cartDiscount = 0
    } = location.state || {};

    const subtotal = cartSubtotal || cartItems.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
    const discountValue = cartDiscount || 0;

    // Auto calculate GHN shipping fee
    useEffect(() => {
        if (selectedDistrict && selectedWard) {
            const calculateShippingFee = async () => {
                setIsCalculatingShippingFee(true);
                setShippingError("");
                try {
                    // Step 1: getAvailableServices
                    const servicesRes = await shippingService.getAvailableServices({
                        from_district: SHOP_DISTRICT_ID || 1442,
                        to_district: selectedDistrict.DistrictID
                    });

                    let servicesList = [];
                    if (servicesRes && Array.isArray(servicesRes.data)) {
                        servicesList = servicesRes.data;
                    } else if (servicesRes && servicesRes.data && Array.isArray(servicesRes.data.data)) {
                        servicesList = servicesRes.data.data;
                    } else if (servicesRes && servicesRes.data && Array.isArray(servicesRes.data)) {
                        servicesList = servicesRes.data;
                    }

                    const firstService = servicesList[0];
                    const resolvedServiceId = firstService ? (firstService.service_id || firstService.serviceId) : 53320;
                    setServiceId(resolvedServiceId);

                    // Step 2: calculateFee
                    const reqBody = {
                        service_id: resolvedServiceId,
                        to_district_id: selectedDistrict.DistrictID,
                        to_ward_code: selectedWard.WardCode,
                        weight: 1500,
                        length: 30,
                        width: 20,
                        height: 10,
                        insurance_value: subtotal,
                        cod_value: formData.paymentMethod === 'COD' ? Math.max(0, subtotal - discountValue) : 0
                    };

                    const res = await shippingService.calculateFee(reqBody);
                    let fee = 0;
                    let rawGhnData = null;
                    if (res && res.data && res.data.data) {
                        rawGhnData = res.data.data;
                    } else if (res && res.data && res.data.data && res.data.data.data) {
                        rawGhnData = res.data.data.data;
                    } else if (res && res.data) {
                        rawGhnData = res.data;
                    }

                    if (rawGhnData) {
                        fee = rawGhnData.total || 0;
                        setShippingFeeDetails({
                            total: fee,
                            serviceFee: rawGhnData.service_fee || rawGhnData.serviceFee || fee || 0,
                            insuranceFee: rawGhnData.insurance_fee || rawGhnData.insuranceFee || 0
                        });
                    } else {
                        throw new Error("Không lấy được thông tin phí vận chuyển từ dữ liệu phản hồi.");
                    }

                    setShippingFee(fee);
                } catch (err) {
                    console.error("Error calculating shipping fee:", err);
                    setShippingFee(0);
                    setShippingFeeDetails(null);
                    const errMsg = "Không thể tính phí vận chuyển. Vui lòng kiểm tra địa chỉ giao hàng.";
                    setShippingError(errMsg);
                    notification.error({
                        message: "Lỗi tính phí vận chuyển",
                        description: "Đường vận chuyển hoặc địa chỉ không được hỗ trợ bởi GHN."
                    });
                } finally {
                    setIsCalculatingShippingFee(false);
                }
            };

            calculateShippingFee();
        } else {
            setShippingFee(0);
            setShippingFeeDetails(null);
        }
    }, [selectedDistrict, selectedWard, subtotal, discountValue, formData.paymentMethod]);

    const total = Math.max(0, subtotal - discountValue + shippingFee);

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
        if (!selectedProvince) newErrors.province = "Thành phố không được để trống";
        if (!selectedDistrict) newErrors.district = "Quận/Huyện không được để trống";
        if (!selectedWard) newErrors.ward = "Phường/Xã không được để trống";

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
                wardId: 1, // Fallback ward ID in local DB
                discount: cartDiscount || 0,
                paymentMethod: formData.paymentMethod,
                note: formData.notes,
                orderProductRequestList: orderProductRequestList,

                // GHN fields
                receiverName: formData.fullName,
                receiverPhone: formData.phone,
                receiverAddress: formData.address,
                provinceName: selectedProvince ? selectedProvince.ProvinceName : "",
                districtName: selectedDistrict ? selectedDistrict.DistrictName : "",
                wardName: selectedWard ? selectedWard.WardName : "",
                toDistrictId: selectedDistrict ? selectedDistrict.DistrictID : null,
                toWardCode: selectedWard ? selectedWard.WardCode : null,
                weight: 1500,
                length: 30,
                width: 20,
                height: 10,
                codAmount: formData.paymentMethod === 'COD' ? total : 0,
                serviceId: serviceId || 53320,
                shippingFee: shippingFee
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
                    const paymentUrl = await dispatch(createUrlPay(total, res.data.orderId));
                    if (!paymentUrl) {
                        throw new Error('Failed to create payment URL');
                    }
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
                                        <label>
                                            Tỉnh/Thành phố <span className="required">*</span>
                                            {isLoadingAddress && !selectedProvince && <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} style={{ marginLeft: 8 }} />}
                                        </label>
                                        <select
                                            name="province"
                                            value={selectedProvince ? selectedProvince.ProvinceID : ""}
                                            onChange={handleProvinceChange}
                                            className={errors.province ? 'error' : ''}
                                            disabled={isLoadingAddress}
                                        >
                                            <option value="">Chọn tỉnh/thành phố</option>
                                            {provinces?.map(province => {
                                                const id = province.ProvinceID;
                                                const name = province.ProvinceName || '';
                                                return (
                                                    <option key={id} value={id}>
                                                        {name.trim()}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.province && <span className="error-message">{errors.province}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Quận/Huyện <span className="required">*</span>
                                            {isLoadingAddress && selectedProvince && !selectedDistrict && <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} style={{ marginLeft: 8 }} />}
                                        </label>
                                        <select
                                            name="district"
                                            value={selectedDistrict ? selectedDistrict.DistrictID : ""}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince || isLoadingAddress}
                                            className={errors.district ? 'error' : ''}
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {districts?.map(district => {
                                                const id = district.DistrictID;
                                                const name = district.DistrictName || '';
                                                return (
                                                    <option key={id} value={id}>
                                                        {name.trim()}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.district && <span className="error-message">{errors.district}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Phường/Xã <span className="required">*</span>
                                            {isLoadingAddress && selectedDistrict && !selectedWard && <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 12 }} spin />} style={{ marginLeft: 8 }} />}
                                        </label>
                                        <select
                                            name="ward"
                                            value={selectedWard ? selectedWard.WardCode : ""}
                                            onChange={handleWardChange}
                                            disabled={!selectedDistrict || isLoadingAddress}
                                            className={errors.ward ? 'error' : ''}
                                        >
                                            <option value="">Chọn phường/xã</option>
                                            {wards?.map(ward => {
                                                const code = ward.WardCode;
                                                const name = ward.WardName || '';
                                                return (
                                                    <option key={code} value={code}>
                                                        {name.trim()}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.ward && <span className="error-message">{errors.ward}</span>}
                                    </div>
                                </div>

                                {isCalculatingShippingFee && (
                                    <div style={{ margin: '10px 0', color: '#1890ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                                        <span>Đang tìm dịch vụ và tính phí vận chuyển GHN...</span>
                                    </div>
                                )}
                                {shippingError && (
                                    <Alert
                                        message={shippingError}
                                        type="error"
                                        showIcon
                                        style={{ margin: '10px 0' }}
                                    />
                                )}

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
                                shipping={selectedWard ? shippingFee : null}
                                total={total}
                                voucher={voucher}
                                shippingFeeDetails={shippingFeeDetails}
                                isCalculating={isCalculatingShippingFee}
                                error={shippingError}
                                selectedWard={selectedWard}
                                selectedDistrict={selectedDistrict}
                            />
                        </div>
                        <div className="card-footer-check">
                            <button
                                type="submit"
                                className={`checkout-button ${
                                    isSubmitting ||
                                    isCalculatingShippingFee ||
                                    !shippingFee ||
                                    shippingFee <= 0 ||
                                    !!shippingError ||
                                    !selectedProvince ||
                                    !selectedDistrict ||
                                    !selectedWard ||
                                    !formData.fullName ||
                                    !formData.phone ||
                                    !formData.address
                                        ? 'disabled'
                                        : ''
                                } ${isSubmitting ? 'processing' : ''}`}
                                onClick={handleSubmit}
                                disabled={
                                    isSubmitting ||
                                    isCalculatingShippingFee ||
                                    !shippingFee ||
                                    shippingFee <= 0 ||
                                    !!shippingError ||
                                    !selectedProvince ||
                                    !selectedDistrict ||
                                    !selectedWard ||
                                    !formData.fullName ||
                                    !formData.phone ||
                                    !formData.address
                                }
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
                <span>SL: {item.quantity} Đơn giá: {money(item.basePrice)}</span>
            </div>
            {item.color && <div className="item-attribute">{item.color}</div>}
            {item.size && <div className="item-attribute">Size: {item.size}</div>}
        </div>
        <div className="item-price">
            {money(item.basePrice * item.quantity)}
        </div>
    </div>
);

const OrderSummary = ({
    subtotal,
    discount,
    shipping,
    total,
    voucher,
    shippingFeeDetails,
    isCalculating,
    error,
    selectedWard,
    selectedDistrict
}) => (
    <div className="order-summary">
        <div className="summary-section">
            <div className="summary-row">
                <span className="summary-label">Tạm tính</span>
                <span className="summary-value">{money(subtotal)}</span>
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
                        -{money(discount)}
                    </span>
                </div>
            )}

            {/* GHN Shipping Integration Block */}
            <div className="ghn-shipping-section" style={{ margin: '0.75rem 0' }}>
                <div className="summary-row" style={{ padding: '0.25rem 0 0.5rem 0' }}>
                    <span className="summary-label" style={{ fontWeight: '600', color: '#1e293b' }}>
                        Vận chuyển qua GHN
                    </span>
                    <span className="summary-value">
                        {shipping === null ? (
                            <span style={{ color: '#8c8c8c', fontStyle: 'italic', fontWeight: 'normal' }}>Chưa tính</span>
                        ) : shipping === 0 ? (
                            <span style={{ color: '#52c41a', fontWeight: '600' }}>Miễn phí</span>
                        ) : (
                            <span style={{ color: '#fd5f27', fontWeight: '700' }}>{money(shipping)}</span>
                        )}
                    </span>
                </div>

                {!selectedDistrict || !selectedWard ? (
                    <div className="ghn-placeholder-card">
                        <p>Vui lòng hoàn tất thông tin địa chỉ để tính phí vận chuyển GHN Express tự động.</p>
                    </div>
                ) : isCalculating ? (
                    <div className="ghn-loading-card">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 22, color: '#fd5f27' }} spin />} />
                        <span className="ghn-loading-text">Đang tìm dịch vụ và tính phí GHN...</span>
                    </div>
                ) : error ? (
                    <div className="ghn-error-card">
                        <Alert
                            message="Lỗi tính phí vận chuyển"
                            description="Không thể tính phí vận chuyển. Vui lòng kiểm tra địa chỉ giao hàng."
                            type="warning"
                            showIcon
                        />
                    </div>
                ) : shippingFeeDetails ? (
                    <div className="ghn-shipping-card">
                        <div className="ghn-card-header">
                            <div className="ghn-brand-badge">
                                <span className="ghn-dot"></span>
                                GHN Express
                            </div>
                            <span className="ghn-status-badge">Đã tính phí tự động</span>
                        </div>
                        
                        <div className="ghn-card-details">
                            <div className="ghn-detail-row">
                                <span className="ghn-detail-label">Đơn vị vận chuyển:</span>
                                <span className="ghn-detail-value">Giao Hàng Nhanh</span>
                            </div>
                            <div className="ghn-detail-row">
                                <span className="ghn-detail-label">Dịch vụ:</span>
                                <span className="ghn-detail-value">Hàng nhẹ / Chuẩn</span>
                            </div>
                            <div className="ghn-detail-row">
                                <span className="ghn-detail-label">Khối lượng:</span>
                                <span className="ghn-detail-value">1.5 kg</span>
                            </div>
                            <div className="ghn-detail-row">
                                <span className="ghn-detail-label">Bảo hiểm hàng hóa:</span>
                                <span className="ghn-detail-value">{money(subtotal)}</span>
                            </div>
                            {shippingFeeDetails.serviceFee > 0 && (
                                <div className="ghn-detail-row">
                                    <span className="ghn-detail-label">Phí dịch vụ:</span>
                                    <span className="ghn-detail-value">{money(shippingFeeDetails.serviceFee)}</span>
                                </div>
                            )}
                            {shippingFeeDetails.insuranceFee > 0 && (
                                <div className="ghn-detail-row">
                                    <span className="ghn-detail-label">Phí bảo hiểm:</span>
                                    <span className="ghn-detail-value">{money(shippingFeeDetails.insuranceFee)}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="ghn-total-row">
                            <span className="ghn-total-label">Tổng phí vận chuyển:</span>
                            <span className="ghn-total-value">{money(shippingFeeDetails.total)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="ghn-placeholder-card">
                        <p>Vui lòng hoàn tất thông tin địa chỉ để tính phí vận chuyển GHN Express tự động.</p>
                    </div>
                )}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
                <span className="total-label">Tổng thanh toán</span>
                <span className="total-value">{money(total)}</span>
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
                <p style={{ color: '#fd5f27', fontWeight: '500', fontSize: '0.75rem', marginTop: '4px', textAlign: 'center' }}>
                    Phí vận chuyển được tính tự động từ Giao Hàng Nhanh theo địa chỉ nhận hàng.
                </p>
            </div>
        </div>
    </div>
);

export default CheckoutConfirmation;