import { useState, useEffect, useContext } from 'react';
import { Table, Input, Button, Space, Modal, message, ConfigProvider, Select, Typography, Pagination, Tag } from 'antd';
import { SearchOutlined, LockOutlined, UnlockOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { adminGetAllUser, blockUser } from '../../../Redux/actions/UserThunk';
import dayjs from 'dayjs';
import {NotificationContext} from "../../../components/NotificationProvider";

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [userToToggleBlock, setUserToToggleBlock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState(null);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const notification = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await dispatch(adminGetAllUser(
        searchText,
        currentPage,
        pageSize,
        sortDirection,
        sortField
      ));
      
      if (response && response.content) {
        setUsers(response.content);
        setTotalElements(response.totalElements);
      } else {
        notification.warning({
          message: "Không có người dùng nào",
          description: "Vui lòng kiểm tra lại điều kiện tìm kiếm hoặc thử lại sau."
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể tải danh sách người dùng."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchText, statusFilter, sortField, sortDirection]);

  // Page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Page size change handler
  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Sort field change handler
  const handleSortFieldChange = (value) => {
    setSortField(value);
    setCurrentPage(1);
  };

  // Sort direction change handler
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Show block/unblock confirmation modal
  const showBlockModal = (user) => {
    setUserToToggleBlock(user);
    setIsBlockModalVisible(true);
  };

  // Handle cancel for block modal
  const handleBlockCancel = () => {
    setIsBlockModalVisible(false);
    setUserToToggleBlock(null);
  };

  // Handle actual block/unblock when confirmed
  const handleBlockConfirm = async () => {
    if (!userToToggleBlock) return;

    try {
      setLoading(true);
      const response = await dispatch(blockUser(userToToggleBlock.id));

      if (response === 200) {
        const actionText = userToToggleBlock.isBlocked ? 'mở khóa' : 'khóa';
        notification.success({
          message: `${actionText} tài khoản thành công`,
          description: `Tài khoản của ${userToToggleBlock.fullName} đã được ${actionText}.`
        });
        fetchUsers();
      } else {
        notification.error({
          message: "Thao tác thất bại",
          description: "Không thể thực hiện thao tác này."
        });
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể thực hiện thao tác này."
      });
    } finally {
      setLoading(false);
      setIsBlockModalVisible(false);
      setUserToToggleBlock(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 130,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Số dư',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance) => formatCurrency(balance),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      width: 140,
      render: (isBlocked) => (
        <Tag color={isBlocked ? 'error' : 'success'}>
          {isBlocked ? 'Đã khóa' : 'Đang hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type={record.isBlocked ? "primary" : "danger"}
          icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
          onClick={() => showBlockModal(record)}
          size="middle"
          title={record.isBlocked ? "Mở khóa" : "Khóa"}
          style={{ borderRadius: '4px' }}
        />
      ),
      width: 80,
      align: 'center'
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#1890ff',
            headerColor: 'white',
          },
        },
        token: {
          fontFamily: "'Montserrat', 'Roboto', sans-serif",
        }
      }}
    >
    <div style={{ padding: 24, background: '#fff'}}>
      
      {/* Title */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32
      }}>
        <Title 
          level={2} 
          style={{ 
            margin: 0, 
            fontWeight: 800,
            fontFamily: "'Montserrat', sans-serif" 
          }}
        >
          Quản lý người dùng
        </Title>
      </div>
      
      {/* Search and Filters */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <Input
          placeholder="Tìm kiếm theo tên, username, email..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={handleSearch}
          size="large"
        />
        
        <Select
          placeholder="Trạng thái"
          style={{ width: 180 }}
          allowClear
          onChange={handleStatusChange}
          value={statusFilter}
          size="large"
        >
          <Option value={false}>Đang hoạt động</Option>
          <Option value={true}>Đã khóa</Option>
        </Select>
      </div>
      
      {/* Custom Pagination and Sorting Controls */}
      <div style={{ 
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Sắp xếp theo:</span>
          <Select 
            value={sortField} 
            onChange={handleSortFieldChange}
            style={{ width: 180 }}
            size="middle"
          >
            <Option value="fullName">Họ tên</Option>
            <Option value="username">Tên đăng nhập</Option>
            <Option value="balance">Số dư</Option>
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="updatedAt">Ngày cập nhật</Option>
          </Select>
          
          <Button 
            onClick={handleSortDirectionChange}
            icon={sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
            size="middle"
          >
            {sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Hiển thị:</span>
          <Select 
            value={pageSize} 
            onChange={(value) => handlePageSizeChange(currentPage, value)}
            style={{ width: 80 }}
            size="middle"
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
            <Option value={50}>50</Option>
          </Select>
          <span>mục / trang</span>
        </div>
      </div>

      {/* Table without pagination */}
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        scroll={{ x: 1100 }}
      />

      {/* Custom Pagination Component */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalElements}
          onChange={handlePageChange}
          showQuickJumper={true}
          locale={{ 
            jump_to: "Đến trang", 
            page: "" 
          }}
          showSizeChanger={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
        />
      </div>

      {/* Block/Unblock Confirmation Modal */}
      <Modal
        title={userToToggleBlock?.isBlocked ? "Xác nhận mở khóa" : "Xác nhận khóa"}
        visible={isBlockModalVisible}
        onOk={handleBlockConfirm}
        onCancel={handleBlockCancel}
        okText={userToToggleBlock?.isBlocked ? "Mở khóa" : "Khóa"}
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExclamationCircleFilled style={{ color: userToToggleBlock?.isBlocked ? '#1890ff' : '#ff4d4f', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            {userToToggleBlock?.isBlocked ? (
              <>Bạn có chắc chắn muốn <strong>mở khóa</strong> tài khoản của <strong>{userToToggleBlock?.fullName}</strong>?</>
            ) : (
              <>Bạn có chắc chắn muốn <strong>khóa</strong> tài khoản của <strong>{userToToggleBlock?.fullName}</strong>?</>
            )}
          </p>
        </div>
        {!userToToggleBlock?.isBlocked && (
          <p style={{ marginTop: '12px', color: '#666' }}>
            Người dùng sẽ không thể đăng nhập khi bị khóa tài khoản.
          </p>
        )}
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default UserManagement;