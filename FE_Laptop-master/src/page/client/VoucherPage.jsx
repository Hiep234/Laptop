import { useState, useEffect } from "react"
import {
    CheckOutlined,
    CopyOutlined,
    TagOutlined,
    FireOutlined,
    ClockCircleOutlined
} from "@ant-design/icons"
import {
    Button,
    Card,
    Badge,
    Divider,
    Progress,
    message,
    Tooltip,
    Pagination,
    Empty,
    Spin
} from "antd"
import dayjs from "dayjs"
import "../style/VoucherList.css"
import {getAllVoucher} from "../../Redux/actions/VoucherThunk";
import { useDispatch } from 'react-redux';
const { Meta } = Card

const VoucherPage = () => {
    const [copiedCode, setCopiedCode] = useState(null)
    const [messageApi, contextHolder] = message.useMessage()
    const [currentPage, setCurrentPage] = useState(1)
    const [vouchers, setVouchers] = useState([])
    const [loading, setLoading] = useState(true)
    const pageSize = 6 // Number of vouchers per page
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                setLoading(true);
                const response = await dispatch(getAllVoucher(null, null, null, null, null, currentPage, pageSize, null, null));
                if (response && response.content) {
                    setVouchers(response.content);
                } else {
                    messageApi.warning("Không có mã giảm giá nào");
                }
            } catch (error) {
                console.error("Error fetching vouchers:", error);
                messageApi.error("Đã xảy ra lỗi khi tải mã giảm giá");
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, [dispatch, messageApi]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount).replace("₫", "VNĐ")
    }

    const calculateDaysLeft = (endDate) => {
        const end = dayjs(endDate)
        const now = dayjs()
        return end.diff(now, 'day')
    }

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        messageApi.success(`Đã sao chép mã ${code}`)
        setTimeout(() => setCopiedCode(null), 3000)
    }

    const getDiscountText = (voucher) => {
        if (voucher.discountType === "FIXED") {
            return formatCurrency(voucher.discountValue)
        } else if (voucher.discountType === "PERCENT") {
            return `${voucher.discountValue}%`
        } else {
            return "Miễn phí vận chuyển"
        }
    }

    // Calculate paginated data
    const paginatedVouchers = vouchers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    return (
        <>
            {contextHolder}
            <div className="voucher-container">
                <h2 className="voucher-section-title">
                    <TagOutlined /> Mã giảm giá hiện có ({vouchers.length})
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : paginatedVouchers.length > 0 ? (
                    <>
                        <div className="voucher-grid">
                            {paginatedVouchers.map((voucher) => {
                                const daysLeft = calculateDaysLeft(voucher.endDate)
                                const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
                                const isExpired = daysLeft <= 0
                                const isPopular = voucher.quantity < 20
                                const quantityPercentage = (voucher.quantity / 150) * 100

                                return (
                                    <div key={voucher.id} className="voucher-card-wrapper">
                                        <Card
                                            className={`voucher-card ${
                                                isExpired ? "expired" : isExpiringSoon ? "expiring" : "active"
                                            }`}
                                            cover={
                                                <div className="voucher-header-strip">
                                                    {isPopular && (
                                                        <div className="popular-tag">
                                                            <FireOutlined /> Phổ biến
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                            hoverable
                                        >
                                            <div className="voucher-card-content">
                                                <Meta
                                                    title={
                                                        <div className="voucher-title">
                                                            <TagOutlined className="voucher-icon" />
                                                            {voucher.code}
                                                            {isExpiringSoon && (
                                                                <Tooltip title="Sắp hết hạn">
                                                                    <ClockCircleOutlined className="expiring-icon" />
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    }
                                                    description={<div className="voucher-description">{voucher.description}</div>}
                                                />

                                                <div className="voucher-badge-container">
                                                    <Badge
                                                        status={isExpired ? "default" : isExpiringSoon ? "warning" : "success"}
                                                        text={
                                                            isExpired ? "Đã hết hạn" :
                                                                isExpiringSoon ? `Còn ${daysLeft} ngày` : "Đang áp dụng"
                                                        }
                                                    />
                                                </div>

                                                <div className="voucher-content">
                                                    <div className="voucher-row highlight">
                                                        <span className="voucher-label">Giảm giá:</span>
                                                        <span className="voucher-value">
                                                            {getDiscountText(voucher)}
                                                        </span>
                                                    </div>

                                                    {voucher.minOrderValue > 0 && (
                                                        <div className="voucher-row small">
                                                            <span className="voucher-label">Áp dụng cho đơn từ:</span>
                                                            <span>{formatCurrency(voucher.minOrderValue)}</span>
                                                        </div>
                                                    )}

                                                    <Divider className="voucher-divider" />

                                                    <div className="voucher-row small">
                                                        <span className="voucher-label">Hiệu lực:</span>
                                                        <span>
                                                            {dayjs(voucher.startDate).format("DD/MM/YYYY")} -{" "}
                                                            {dayjs(voucher.endDate).format("DD/MM/YYYY")}
                                                        </span>
                                                    </div>

                                                    <div className="voucher-progress">
                                                        <div className="progress-labels">
                                                            <span>Còn lại: {voucher.quantity}</span>
                                                            <span className="muted">Số lượng có hạn</span>
                                                        </div>
                                                        <Progress
                                                            percent={quantityPercentage}
                                                            showInfo={false}
                                                            strokeColor={isExpiringSoon ? "#faad14" : "#1890ff"}
                                                            trailColor="#f0f0f0"
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type={isExpired ? "default" : "primary"}
                                                    className="voucher-button"
                                                    icon={copiedCode === voucher.code ? <CheckOutlined /> : <CopyOutlined />}
                                                    onClick={() => copyToClipboard(voucher.code)}
                                                    disabled={isExpired}
                                                    block
                                                >
                                                    {copiedCode === voucher.code ? "Đã sao chép" : "Sao chép mã"}
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="voucher-pagination">
                            <Pagination
                                current={currentPage}
                                total={vouchers.length}
                                pageSize={pageSize}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        description="Hiện không có mã giảm giá nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </div>
        </>
    )
}

export default VoucherPage