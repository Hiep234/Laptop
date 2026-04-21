import React, {useState, useEffect, useMemo, useContext} from "react";
import { ChevronDown, ChevronUp, Search, ShoppingBag, Package, Truck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Pagination, Spin, Input, Select } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import {cancelOrder, getAllHistoryOrder, refundOrder} from "../../Redux/actions/OrderItemThunk";
import "../style/PurchaseHistory.css";
import {NotificationContext} from "../../components/NotificationProvider";

const PurchaseHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { orders, loading, error } = useSelector(state => state.OrderReducer);

    const [userData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;
    const notification = useContext(NotificationContext);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const apiStatus = statusFilter === "all" ? null : statusFilter.toUpperCase();
                await dispatch(getAllHistoryOrder(
                    currentPage - 1,
                    ordersPerPage,
                    apiStatus,
                    sortOrder === "newest" ? "desc" : "asc",
                    userData?.id
                ));
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }
        };

        fetchOrders();
    }, [currentPage, statusFilter, sortOrder, dispatch, userData?.id]);

    // Transform orders and add frontend search filtering
    const filteredOrders = useMemo(() => {
        if (!orders?.content) return [];

        let result = orders.content.map(order => ({
            id: `ORD-${order.orderId}`,
            date: new Date(order.createdAt || Date.now()),
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            total: order.orderItems.reduce((sum, item) => sum + (item.priceAtOrderTime * item.quantity), 0) - (order.discount || 0),
            items: order.orderItems.map(item => ({
                id: item.orderItemId,
                name: item.productName,
                price: item.priceAtOrderTime,
                quantity: item.quantity,
                image: item.productImage,
                color: item.productColor,
                code: item.productCode
            }))
        }));

        // Frontend search filtering
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(order =>
                order.id.toLowerCase().includes(term) ||
                order.items.some(item =>
                    item.name.toLowerCase().includes(term) ||
                    item.code.toLowerCase().includes(term)
                )
            );
        }

        return result;
    }, [orders, searchTerm]);

    const totalPages = orders?.totalPages || 1;

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            PENDING: { label: "Chờ xác nhận", className: "status-badge pending" },
            CONFIRMED: { label: "Đã xác nhận", className: "status-badge confirmed" },
            SHIPPED: { label: "Đang giao hàng", className: "status-badge shipped" },
            COMPLETED: { label: "Hoàn thành", className: "status-badge completed" },
            CANCELLED: { label: "Đã hủy", className: "status-badge cancelled" },

        };

        const config = statusConfig[status] || statusConfig.PENDING;
        return <span className={config.className}>{config.label}</span>;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setExpandedOrder(null);
    };
    const handleReturnRequest =  async  (id) => {
        const idNumber = id.substring(4);
        const res = await dispatch(refundOrder(idNumber));
        if(res.code === 200){
            window.location.reload();
        }
        else{
            notification.warning({
                message: 'Cảnh báo',
                description: 'Đã xảy ra lỗi!',
                placement: 'topRight',
            });
        }
    }
    const handleCancelRequest =  async  (id) => {
        const idNumber = id.substring(4);
        const res = await dispatch(cancelOrder(idNumber));
        if(res.code === 200){
            window.location.reload();
        }
        else{
            notification.warning({
                message: 'Cảnh báo',
                description: 'Đã xảy ra lỗi!',
                placement: 'topRight',
            });
        }
    }
    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Đang tải lịch sử mua hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h3>Đã xảy ra lỗi</h3>
                    <p>{error.message || "Không thể tải lịch sử mua hàng"}</p>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="purchase-history-container">
            <div className="purchase-history-header">
                <h1>Lịch sử mua hàng</h1>
                <div className="history-controls">
                    <div className="search-container">
                        <Input
                            placeholder="Tìm kiếm đơn hàng..."
                            prefix={<Search size={16} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </div>
                    <Select
                        className="sort-select"
                        value={sortOrder}
                        onChange={(value) => {
                            setSortOrder(value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: "newest", label: "Mới nhất" },
                            { value: "oldest", label: "Cũ nhất" }
                        ]}
                    />
                </div>
            </div>

            <div className="status-tabs">
                {["all", "PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"].map((status) => (
                    <button
                        key={status}
                        className={`status-tab ${statusFilter === status ? "active" : ""}`}
                        onClick={() => {
                            setStatusFilter(status);
                            setCurrentPage(1);
                        }}
                    >
                        {status === "all" ? "Tất cả" :
                            status === "PENDING" ? "Chờ xác nhận" :
                                status === "CONFIRMED" ? "Đã xác nhận" :
                                    status === "SHIPPED" ? "Đang giao" :
                                        status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"}
                    </button>
                ))}
            </div>

            <div className="orders-list-container">
                {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={48} className="empty-icon" />
                        <p className="empty-text">Không tìm thấy đơn hàng nào</p>
                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate('/')}
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <>
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div
                                    className="order-summary"
                                    onClick={() => toggleOrderExpand(order.id)}
                                >
                                    <div className="order-meta">
                                        <div className="order-id-date">
                                            <span className="order-id">{order.id}</span>
                                            <span className="order-date">
                                                {new Intl.DateTimeFormat("vi-VN").format(order.date)}
                                            </span>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="order-amount">
                                        <span className="total-amount">{formatPrice(order.total)}</span>
                                        <span className="items-count">{order.items.length} sản phẩm</span>
                                        {expandedOrder === order.id ? (
                                            <ChevronUp className="chevron-icon" />
                                        ) : (
                                            <ChevronDown className="chevron-icon" />
                                        )}
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="order-details-expanded">
                                        <div className="order-details-section">
                                            <h3>Chi tiết đơn hàng</h3>
                                            <div className="details-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">Ngày đặt hàng:</span>
                                                    <span>{new Intl.DateTimeFormat("vi-VN").format(order.date)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Trạng thái:</span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Mã đơn hàng:</span>
                                                    <span>{order.id}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Tổng tiền:</span>
                                                    <span className="detail-value">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="products-section">
                                            <h3>Sản phẩm</h3>
                                            <div className="products-list">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="product-item">
                                                        <div className="product-image-container">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="product-image"
                                                                onError={(e) => {
                                                                    e.target.src = "/placeholder.svg";
                                                                    e.target.onerror = null;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="product-info">
                                                            <h4 className="product-name">{item.name}</h4>
                                                            <p className="product-code">Mã: {item.code}</p>
                                                            <p className="product-quantity">Số lượng: {item.quantity}</p>
                                                            <p className="product-color">Màu: {item.color}</p>
                                                        </div>
                                                        <div className="product-price">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <div className="status-info">
                                                {order.status === "PENDING" && (
                                                    <div
                                                        className="status-message pending"
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                            padding: "8px 12px",
                                                            borderRadius: "4px",
                                                            backgroundColor: "#fff8e1"
                                                        }}
                                                    >
                                                        <Package size={20} style={{ color: "#ffb300" }} />
                                                        <span style={{ fontWeight: 500 }}>Đang chờ xác nhận</span>
                                                        <button
                                                            style={{
                                                                marginLeft: "16px",
                                                                padding: "6px 12px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #e0e0e0",
                                                                backgroundColor: "transparent",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s ease",
                                                                fontWeight: 500
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                            onClick={() => {
                                                                notification.success({
                                                                    message: 'Yêu cầu đã gửi thành công',
                                                                    description: 'Yêu cầu huỷ đơn hàng thành công',
                                                                    duration: 4.5,
                                                                    placement: 'topRight',
                                                                });
                                                                handleCancelRequest(order.id);
                                                            }}
                                                        >
                                                            Huỷ đơn hàng
                                                        </button>
                                                    </div>
                                                )}
                                                {order.status === "CONFIRMED" && (
                                                    <div className="status-message confirmed">
                                                        <Package size={20}/>
                                                        <span>Đã xác nhận - Đang chuẩn bị hàng</span>
                                                    </div>
                                                )}
                                                {order.status === "SHIPPED" && (
                                                    <div className="status-message shipped">
                                                        <Truck size={20}/>
                                                        <span>Đang vận chuyển</span>
                                                    </div>
                                                )}
                                                {order.status === "COMPLETED" && (
                                                    <div className="status-message completed">
                                                    <Package size={20} />
                                                        <span>Đã giao hàng thành công</span>
                                                    </div>
                                                )}
                                                {order.status === "CANCELLED" && order.paymentStatus === "REFUNDED" && (
                                                    <div className="status-message cancelled">
                                                        <Package size={20} />
                                                        <span>Đơn hàng đã bị hủy</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="action-buttons">
                                                {order.status === "CANCELLED" && order.paymentStatus === "REFUNDED" && (
                                                    <div className="status-tag waiting-refund">
                                                        <i className="icon-clock"></i> Đang chờ hoàn tiền
                                                    </div>
                                                )}
                                                {order.status === "CANCELLED" && order.paymentStatus === "REFUNDED_SUCCESSFUL" && (
                                                    <div className="status-tag refunded">
                                                        <i className="icon-check"></i> Đã hoàn tiền
                                                    </div>
                                                )}
                                                {order.paymentStatus === "PAID" && (
                                                    <button
                                                        className="secondary-button"
                                                        onClick={() => {
                                                            // Hiển thị thông báo
                                                            notification.info({
                                                                message: 'Yêu cầu đã được gửi',
                                                                description: 'Yêu cầu trả hàng/hoàn tiền của bạn đang được xem xét. Vui lòng chờ trong giây lát.',
                                                                duration: 4.5,
                                                                placement: 'topRight',
                                                            });

                                                             handleReturnRequest(order.id);
                                                        }}
                                                    >
                                                        Trả hàng / Hoàn tiền
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pagination-wrapper">
                        <Pagination
                                current={currentPage}
                                total={orders?.totalElements || 0}
                                pageSize={ordersPerPage}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PurchaseHistory;