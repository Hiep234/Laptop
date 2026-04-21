import React, { useState, useEffect } from "react";
import {
    Card,
    Statistic,
    Input,
    Select,
    Button,
    Tag,
    Divider,
    Space,
    Table,
    Tooltip,
    Dropdown,
    Empty,
    message
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    DownloadOutlined,
    EyeOutlined,
    MoreOutlined,
    SortAscendingOutlined,
    CalendarOutlined,
    WalletOutlined,
    BankOutlined,
    MobileOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllDrawl } from "../../Redux/actions/UserThunk";
import "../style/WithdrawalHistory.css";

// Cấu hình trạng thái
const statusConfig = {
    PENDING: {
        label: "Đang chờ",
        icon: <ClockCircleOutlined />,
        color: "orange",
    },
    APPROVED: {
        label: "Đã duyệt",
        icon: <ExclamationCircleOutlined />,
        color: "blue",
    },
    REJECTED: {
        label: "Đã từ chối",
        icon: <CloseCircleOutlined />,
        color: "red",
    },
    COMPLETED: {
        label: "Hoàn thành",
        icon: <CheckCircleOutlined />,
        color: "green",
    },
};

const WithdrawalHistory = () => {
    const dispatch = useDispatch();
    const { content: withdrawalData = [], loading } = useSelector(state => state.UserReducer.drawlList || {});

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Format ngày giờ
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("vi-VN"),
            time: date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
    };


    // Thống kê
    const stats = {
        total: withdrawalData.length,
        pending: withdrawalData.filter((item) => item.status === "PENDING").length,
        approved: withdrawalData.filter((item) => item.status === "APPROVED").length,
        rejected: withdrawalData.filter((item) => item.status === "REJECTED").length,
        completed: withdrawalData.filter((item) => item.status === "COMPLETED").length,
        totalAmount: withdrawalData
            .filter((item) => item.status === "COMPLETED")
            .reduce((sum, item) => sum + item.amount, 0),
    };

    // Lọc và sắp xếp dữ liệu
    const filteredData = withdrawalData.filter(item => {
        const matchesSearch = searchTerm
            ? item.id.toString().includes(searchTerm) ||
            item.accountNumber.includes(searchTerm)
            : true;

        const matchesStatus = statusFilter !== "all"
            ? item.status === statusFilter
            : true;

        return matchesSearch && matchesStatus;
    });

    // Gọi API khi thay đổi bộ lọc hoặc phân trang
    useEffect(() => {
        const fetchData = async () => {
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
            }
        };

        fetchData();
    }, [dispatch, pagination.current, pagination.pageSize, sortBy, sortDirection]);

    // Columns for table
    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <span className="font-semibold">{id}</span>,
        },
        {
            title: 'Người yêu cầu',
            dataIndex: ['user', 'fullName'],
            key: 'user',
            render: (fullName) => <span className="font-semibold">{fullName}</span>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span className="font-bold">{formatCurrency(amount)}</span>,
        },
        {
            title: 'Phương thức',
            key: 'method',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {record.requestNote.includes("MoMo") ? <MobileOutlined /> : <BankOutlined />}
                    {record.requestNote}
                </div>
            ),
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (dateString) => {
                const dateTime = formatDateTime(dateString);
                return (
                    <div className="flex items-center gap-1">
                        <CalendarOutlined />
                        {dateTime.date} {dateTime.time}
                    </div>
                );
            },
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = statusConfig[status] || statusConfig.PENDING;
                return (
                    <Tag icon={config.icon} color={config.color}>
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
    ];

    // Xử lý thay đổi phân trang và sắp xếp
    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);

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
            <div className="withdrawal-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Lịch sử rút tiền</h1>
                            <p>Quản lý và theo dõi các giao dịch rút tiền</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Thống kê */}
                <div className="stats-grid">
                    <Card>
                        <Statistic title="Tổng giao dịch" value={stats.total} />
                    </Card>
                    <Card>
                        <Statistic title="Đang chờ" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
                    </Card>
                    <Card>
                        <Statistic title="Đã duyệt" value={stats.approved} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                    <Card>
                        <Statistic title="Đã từ chối" value={stats.rejected} valueStyle={{ color: '#f5222d' }} />
                    </Card>
                    <Card>
                        <Statistic title="Hoàn thành" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                    <Card>
                        <Statistic title="Tổng đã rút" value={formatCurrency(stats.totalAmount)} />
                    </Card>
                </div>

                {/* Bộ lọc và tìm kiếm */}
                <Card className="filter-history-card">
                    <div className="filter-history-content">
                        <div className="search-history-input">
                            <Input
                                placeholder="Tìm kiếm theo mã giao dịch hoặc số tài khoản..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="status-history-select"
                            placeholder="Trạng thái"
                            allowClear
                        >
                            <Select.Option value="all">Tất cả</Select.Option>
                            <Select.Option value="PENDING">Đang chờ</Select.Option>
                            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                            <Select.Option value="REJECTED">Đã từ chối</Select.Option>
                            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                        </Select>
                        <Button type="primary" onClick={() => setPagination({...pagination, current: 1})}>
                            Áp dụng
                        </Button>
                    </div>
                </Card>

                {/* Danh sách giao dịch */}
                <Card>
                    <div className="card-header">
                        <WalletOutlined />
                        <span>Danh sách giao dịch ({filteredData.length})</span>
                    </div>
                    <Divider style={{ margin: 0 }} />
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            total: withdrawalData.totalElements || 0,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: (total) => `Tổng ${total} giao dịch`,
                        }}
                        onChange={handleTableChange}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={<SearchOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                                    description={
                                        <>
                                            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Không tìm thấy giao dịch</div>
                                            <div>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                                        </>
                                    }
                                />
                            ),
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default WithdrawalHistory;