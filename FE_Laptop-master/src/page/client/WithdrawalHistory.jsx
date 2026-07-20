import React, { useState, useEffect } from "react";
import {
    Card,
    Input,
    Select,
    Button,
    Tag,
    Table,
    Tooltip,
    Empty,
    message,
    Modal
} from "antd";
// No icons imported
import { useDispatch, useSelector } from "react-redux";
import { getAllDrawl } from "../../Redux/actions/UserThunk";
import "../style/WithdrawalHistory.css";

// Cấu hình trạng thái
const statusConfig = {
    PENDING: {
        label: "Đang chờ",
        color: "orange",
    },
    APPROVED: {
        label: "Đã duyệt",
        color: "blue",
    },
    REJECTED: {
        label: "Đã từ chối",
        color: "red",
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "green",
    },
};

const WithdrawalHistory = () => {
    const dispatch = useDispatch();
    const drawlList = useSelector(state => state.UserReducer.drawlList);

    // Xử lý dữ liệu an toàn khi Redux state ban đầu là mảng rỗng []
    const withdrawalData = Array.isArray(drawlList) 
        ? drawlList 
        : (drawlList?.content || []);
        
    const totalElements = Array.isArray(drawlList) 
        ? drawlList.length 
        : (drawlList?.totalElements || 0);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleViewDetails = (record) => {
        setSelectedWithdrawal(record);
        setIsModalVisible(true);
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    // Format ngày giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: "-", time: "" };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("vi-VN"),
            time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
    };

    // Thống kê dựa trên toàn bộ list tải về
    const stats = {
        total: totalElements,
        pending: withdrawalData.filter((item) => item.status === "PENDING").length,
        approved: withdrawalData.filter((item) => item.status === "APPROVED").length,
        rejected: withdrawalData.filter((item) => item.status === "REJECTED").length,
        completed: withdrawalData.filter((item) => item.status === "COMPLETED").length,
        totalAmount: withdrawalData
            .filter((item) => item.status === "COMPLETED")
            .reduce((sum, item) => sum + item.amount, 0),
    };

    // Lọc dữ liệu client side theo từ khóa tìm kiếm và bộ lọc trạng thái
    const filteredData = withdrawalData.filter(item => {
        const matchesSearch = searchTerm
            ? item.id?.toString().includes(searchTerm) ||
              item.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        const matchesStatus = statusFilter !== "all"
            ? item.status === statusFilter
            : true;

        return matchesSearch && matchesStatus;
    });

    // Gọi API khi thay đổi bộ lọc hoặc phân trang
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await dispatch(getAllDrawl(
                    null, // startDate
                    null, // endDate
                    pagination.current,
                    pagination.pageSize,
                    sortBy,
                    sortDirection
                ));
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu rút tiền");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, pagination.current, pagination.pageSize, sortBy, sortDirection]);

    // Định nghĩa cột hiển thị trong bảng
    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <span className="transaction-id-label">#{id}</span>,
        },
        {
            title: 'Người yêu cầu',
            dataIndex: ['user', 'fullName'],
            key: 'user',
            render: (fullName) => <span className="user-fullname-label">{fullName || "-"}</span>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span className="amount-label">{formatCurrency(amount)}</span>,
            sorter: true,
        },
        {
            title: 'Phương thức',
            key: 'method',
            render: (_, record) => (
                <div className="method-label-container">
                    <span className="method-text-span">{record.requestNote || "Chuyển khoản"}</span>
                </div>
            ),
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            render: (accNum) => <span className="account-number-label">{accNum}</span>,
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (dateString) => {
                const dateTime = formatDateTime(dateString);
                return (
                    <div className="date-label-container">
                        <span>
                            {dateTime.date} <span className="time-subtext">{dateTime.time}</span>
                        </span>
                    </div>
                );
            },
            sorter: true,
        },
        {
            title: 'Phản hồi từ Admin',
            dataIndex: 'adminNote',
            key: 'adminNote',
            render: (adminNote, record) => {
                if (!adminNote) {
                    return <span className="admin-note-none">-</span>;
                }
                const statusClass = record.status?.toLowerCase() || "pending";
                return (
                    <Tooltip title={adminNote} placement="topLeft">
                        <div 
                            className={`admin-note-bubble admin-note-${statusClass}`}
                            onClick={() => handleViewDetails(record)}
                        >
                            {adminNote}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = statusConfig[status] || statusConfig.PENDING;
                return (
                    <Tag color={config.color} className={`status-tag-${status.toLowerCase()}`}>
                        {config.label}
                    </Tag>
                );
            },
            filters: [
                { text: 'Đang chờ', value: 'PENDING' },
                { text: 'Đã duyệt', value: 'APPROVED' },
                { text: 'Đã từ chối', value: 'REJECTED' },
                { text: 'Hoàn thành', value: 'COMPLETED' },
            ],
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="link" 
                    onClick={() => handleViewDetails(record)}
                    className="view-detail-btn"
                >
                    Chi tiết
                </Button>
            ),
        }
    ];

    // Xử lý thay đổi phân trang, sắp xếp và lọc từ bảng Ant Design
    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination(newPagination);

        if (sorter.field) {
            setSortBy(sorter.field);
            setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
        }

        if (filters.status) {
            setStatusFilter(filters.status[0] || 'all');
        }
    };

    return (
        <div className="withdrawal-history-container">
            {/* Header */}
            <div className="withdrawal-history-header">
                <div className="container header-container-inner">
                    <div className="header-text-section">
                        <div>
                            <h1>Lịch sử rút tiền</h1>
                            <p>Theo dõi trạng thái và quản lý các yêu cầu rút tiền của bạn</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container history-content-wrapper">
                {/* Thống kê */}
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Tổng yêu cầu</span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card stat-pending">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Đang chờ</span>
                                <span className="stat-value">{stats.pending}</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card stat-approved">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Đã duyệt</span>
                                <span className="stat-value">{stats.approved}</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card stat-completed">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Thành công</span>
                                <span className="stat-value">{stats.completed}</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card stat-rejected">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Bị từ chối</span>
                                <span className="stat-value">{stats.rejected}</span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card stat-amount">
                        <div className="stat-card-inner">
                            <div className="stat-info">
                                <span className="stat-title">Tổng đã nhận</span>
                                <span className="stat-value">{formatCurrency(stats.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <Card className="filter-history-card">
                    <div className="filter-history-header-inline">
                        <span>Bộ lọc tìm kiếm</span>
                    </div>
                    <div className="filter-history-content">
                        <div className="search-history-input">
                            <Input
                                placeholder="Nhập mã giao dịch hoặc số tài khoản..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="status-history-select"
                            placeholder="Chọn trạng thái"
                        >
                            <Select.Option value="all">Tất cả trạng thái</Select.Option>
                            <Select.Option value="PENDING">Đang chờ</Select.Option>
                            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                            <Select.Option value="REJECTED">Đã từ chối</Select.Option>
                            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                        </Select>
                        
                        <div className="filter-actions-group">
                            <Button 
                                type="primary" 
                                className="apply-filter-btn"
                                onClick={() => setPagination({...pagination, current: 1})}
                            >
                                Lọc kết quả
                            </Button>
                            {(searchTerm || statusFilter !== "all") && (
                                <Button 
                                    type="text" 
                                    className="reset-filter-btn"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setPagination({...pagination, current: 1});
                                    }}
                                >
                                    Đặt lại
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Danh sách giao dịch */}
                <Card className="table-history-card">
                    <div className="table-card-header">
                        <div className="table-title-left">
                            <span className="bullet-indicator"></span>
                            <span>Danh sách yêu cầu rút tiền ({filteredData.length})</span>
                        </div>
                    </div>
                    
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            total: totalElements,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: (total) => `Tổng số: ${total} giao dịch`,
                        }}
                        onChange={handleTableChange}
                        className="custom-table"
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="empty-description">
                                            <div className="empty-title">Không tìm thấy giao dịch nào</div>
                                            <div className="empty-subtitle">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn</div>
                                        </div>
                                    }
                                />
                            ),
                        }}
                    />
                </Card>
            </div>

            {/* Modal Chi tiết */}
            <Modal
                title={
                    <div className="detail-modal-title">
                        <div>
                            <h3>Chi tiết giao dịch</h3>
                            <span className="modal-subtitle">Thông tin chi tiết yêu cầu rút tiền</span>
                        </div>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" className="modal-close-btn" onClick={() => setIsModalVisible(false)}>
                        Đóng cửa sổ
                    </Button>
                ]}
                width={550}
                centered
                className="premium-detail-modal"
            >
                {selectedWithdrawal && (
                    <div className="modal-detail-body">
                        {/* Mã giao dịch và trạng thái */}
                        <div className="modal-detail-header-card">
                            <div className="header-card-row">
                                <span className="modal-tx-code">Mã giao dịch: <strong>#{selectedWithdrawal.id}</strong></span>
                                <span className="modal-tx-date">
                                    {formatDateTime(selectedWithdrawal.createdAt).date} {formatDateTime(selectedWithdrawal.createdAt).time}
                                </span>
                            </div>
                            <div className="header-card-status">
                                <Tag color={statusConfig[selectedWithdrawal.status]?.color} className="status-tag-large">
                                    {statusConfig[selectedWithdrawal.status]?.label.toUpperCase()}
                                </Tag>
                            </div>
                        </div>

                        {/* Bảng chi tiết */}
                        <div className="detail-info-block">
                            <h4 className="section-subtitle">Thông tin giao dịch</h4>
                            <div className="detail-info-grid">
                                <div className="info-row">
                                    <span className="info-label">Người yêu cầu:</span>
                                    <span className="info-value font-semibold">{selectedWithdrawal.user?.fullName || "-"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Số tiền rút:</span>
                                    <span className="info-value amount-highlight">{formatCurrency(selectedWithdrawal.amount)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phương thức:</span>
                                    <span className="info-value flex-align-center">
                                        <span className="method-text">{selectedWithdrawal.requestNote || "Chuyển khoản"}</span>
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Số tài khoản:</span>
                                    <span className="info-value account-value-copy">{selectedWithdrawal.accountNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Phản hồi từ Admin */}
                        <div className={`detail-feedback-block feedback-${selectedWithdrawal.status?.toLowerCase() || "pending"}`}>
                            <div className="feedback-header">
                                <span>Phản hồi từ Ban Quản Trị</span>
                            </div>
                            <div className="feedback-content">
                                {selectedWithdrawal.adminNote ? (
                                    <p className="feedback-note-text">"{selectedWithdrawal.adminNote}"</p>
                                ) : (
                                    <p className="feedback-note-empty">Yêu cầu này đang trong trạng thái xử lý hoặc chưa có ghi chú phản hồi từ Admin.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WithdrawalHistory;