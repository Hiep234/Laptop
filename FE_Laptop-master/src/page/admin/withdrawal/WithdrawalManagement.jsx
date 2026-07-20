import { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, Form, Input, ConfigProvider, Select, Typography, Pagination, Tag, DatePicker, Descriptions, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getAllWithdrawals, updateWithdrawalStatus } from '../../../Redux/actions/WithdrawalThunk';
import dayjs from 'dayjs';
import { NotificationContext } from "../../../components/NotificationProvider";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const WithdrawalManagement = () => {
  // State variables
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [form] = Form.useForm();
  const notification = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const dispatch = useDispatch();

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      // Extract start and end dates from date range if selected
      let startDate = null;
      let endDate = null;
      
      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format('YYYY-MM-DD');
        endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await dispatch(getAllWithdrawals(
        startDate,
        endDate,
        statusFilter,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      ));
      
      if (response && response.content) {
        setWithdrawals(response.content);
        setTotalElements(response.totalElements);
      } else {
        notification.warning({
          message: "Không có yêu cầu rút tiền nào",
          description: "Không tìm thấy yêu cầu rút tiền nào với tiêu chí tìm kiếm đã nhập."
        });
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể tải danh sách yêu cầu rút tiền."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, pageSize, dateRange, statusFilter, sortField, sortDirection]);

  // Page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Page size change handler
  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Sort field change handler
  const handleSortFieldChange = (value) => {
    setSortField(value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Sort direction change handler
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset to first page when changing sort direction
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Show withdrawal details
  const handleViewDetails = (withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsDetailModalVisible(true);
  };

  // Handle reject modal
  const showRejectModal = (withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    form.resetFields();
    setIsRejectModalVisible(true);
  };

  // Handle accept modal
  const showAcceptModal = (withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    form.resetFields();
    setIsAcceptModalVisible(true);
  };

  // Handle complete modal
  const showCompleteModal = (withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setIsCompleteModalVisible(true);
  };

  // Handle reject action
  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      setFormSubmitting(true);
      
      const requestData = {
        adminNote: values.adminNote,
        status: "REJECTED",
        amount: currentWithdrawal.amount
      };
      
      const response = await dispatch(updateWithdrawalStatus(currentWithdrawal.id, requestData));
      
      if (response === 200) {
        notification.success({
          message: 'Từ chối yêu cầu thành công',
          description: 'Yêu cầu rút tiền đã được từ chối.'
        });
        fetchWithdrawals();
        setIsRejectModalVisible(false);
      } else {
        notification.error({
          message: 'Từ chối yêu cầu thất bại',
          description: 'Đã xảy ra lỗi khi từ chối yêu cầu rút tiền.'
        });
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xử lý yêu cầu này.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle accept action
  const handleAccept = async () => {
    try {
      const values = await form.validateFields();
      setFormSubmitting(true);
      
      const requestData = {
        adminNote: values.adminNote,
        status: "APPROVED"
      };
      
      const response = await dispatch(updateWithdrawalStatus(currentWithdrawal.id, requestData));
      
      if (response === 200) {
        notification.success({
          message: 'Chấp nhận yêu cầu thành công',
          description: 'Yêu cầu rút tiền đã được chấp nhận.'
        });
        fetchWithdrawals();
        setIsAcceptModalVisible(false);
      } else {
        notification.error({
          message: 'Chấp nhận yêu cầu thất bại',
          description: 'Đã xảy ra lỗi khi chấp nhận yêu cầu rút tiền.'
        });
      }
    } catch (error) {
      console.error("Error accepting withdrawal:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xử lý yêu cầu này.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle complete action
  const handleComplete = async () => {
    try {
      setFormSubmitting(true);
      
      const requestData = {
        status: "COMPLETED"
      };
      
      const response = await dispatch(updateWithdrawalStatus(currentWithdrawal.id, requestData));
      
      if (response === 200) {
        notification.success({
          message: 'Hoàn thành yêu cầu thành công',
          description: 'Yêu cầu rút tiền đã được đánh dấu là hoàn thành.'
        });
        fetchWithdrawals();
        setIsCompleteModalVisible(false);
      } else {
        notification.error({
          message: 'Hoàn thành yêu cầu thất bại',
          description: 'Đã xảy ra lỗi khi hoàn thành yêu cầu rút tiền.'
        });
      }
    } catch (error) {
      console.error("Error completing withdrawal:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xử lý yêu cầu này.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status tag for withdrawal
  const getStatusTag = (status) => {
    let color = 'default';
    let text = status;
    
    switch (status) {
      case 'PENDING':
        color = 'processing';
        text = 'Chờ xử lý';
        break;
      case 'APPROVED':
        color = 'warning';
        text = 'Đã duyệt';
        break;
      case 'COMPLETED':
        color = 'success';
        text = 'Đã hoàn thành';
        break;
      case 'REJECTED':
        color = 'error';
        text = 'Đã từ chối';
        break;
      default:
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user) => user?.fullName || '-',
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 150,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            title="Xem chi tiết"
          />
          
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="primary" 
                style={{ backgroundColor: '#52c41a' }}
                icon={<CheckOutlined />} 
                onClick={() => showAcceptModal(record)}
                title="Chấp nhận"
              />
              <Button 
                danger
                icon={<CloseOutlined />} 
                onClick={() => showRejectModal(record)}
                title="Từ chối"
              />
            </>
          )}
          
          {record.status === 'APPROVED' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setIsDetailModalVisible(false);
                showCompleteModal(currentWithdrawal);
              }}
              title="Hoàn thành yêu cầu"
            />
          )}
        </Space>
      ),
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
          Quản lý yêu cầu rút tiền
        </Title>
      </div>
      
      {/* Filters */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex', 
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          style={{ width: 280 }}
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          allowClear
          size="large"
        />

        <Select
          placeholder="Trạng thái yêu cầu"
          style={{ width: 180 }}
          allowClear
          onChange={handleStatusChange}
          value={statusFilter}
          size="large"
        >
          <Option value="PENDING">Chờ xử lý</Option>
          <Option value="APPROVED">Đã duyệt</Option>
          <Option value="COMPLETED">Đã hoàn thành</Option>
          <Option value="REJECTED">Đã từ chối</Option>
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
            style={{ width: 150 }}
            size="middle"
          >
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="updatedAt">Ngày cập nhật</Option>
            <Option value="amount">Số tiền</Option>
            <Option value="status">Trạng thái</Option>
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
        dataSource={withdrawals} 
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
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

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu rút tiền"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {currentWithdrawal && (
          <>
            <Descriptions title="Thông tin yêu cầu" bordered column={2}>
              <Descriptions.Item label="ID" span={1}>
                {currentWithdrawal.id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {getStatusTag(currentWithdrawal.status)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Người yêu cầu" span={1}>
                {currentWithdrawal.user?.fullName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID người dùng" span={1}>
                {currentWithdrawal.user?.id || "-"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Số tiền rút" span={2}>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatCurrency(currentWithdrawal.amount)}
                </span>
              </Descriptions.Item>
              
              <Descriptions.Item label="Số tài khoản" span={2}>
                {currentWithdrawal.accountNumber}
              </Descriptions.Item>
              
              <Descriptions.Item label="Thời gian yêu cầu" span={1}>
                {formatDate(currentWithdrawal.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian cập nhật" span={1}>
                {currentWithdrawal.updatedAt ? formatDate(currentWithdrawal.updatedAt) : "-"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ghi chú của người dùng" span={2}>
                {currentWithdrawal.requestNote || "Không có ghi chú"}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ghi chú của admin" span={2}>
                {currentWithdrawal.adminNote || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {currentWithdrawal.status === 'PENDING' && (
                <>
                  <Button 
                    type="primary" 
                    style={{ backgroundColor: '#52c41a' }}
                    onClick={() => {
                      setIsDetailModalVisible(false);
                      showAcceptModal(currentWithdrawal);
                    }}
                  >
                    Chấp nhận yêu cầu
                  </Button>
                  <Button 
                    danger
                    onClick={() => {
                      setIsDetailModalVisible(false);
                      showRejectModal(currentWithdrawal);
                    }}
                  >
                    Từ chối yêu cầu
                  </Button>
                </>
              )}

              {currentWithdrawal.status === 'APPROVED' && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    showCompleteModal(currentWithdrawal);
                  }}
                  title="Hoàn thành yêu cầu"
                >
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu rút tiền"
        visible={isRejectModalVisible}
        onCancel={() => setIsRejectModalVisible(false)}
        confirmLoading={formSubmitting}
        footer={[
          <Button key="cancel" onClick={() => setIsRejectModalVisible(false)} disabled={formSubmitting}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            danger 
            style={{ backgroundColor: '#ff4d4f', color: 'white' }}
            onClick={handleReject}
            loading={formSubmitting}
            disabled={formSubmitting}
          >
            Xác nhận từ chối
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            Bạn đang từ chối yêu cầu rút tiền <strong>#{currentWithdrawal?.id}</strong>
          </p>
        </div>
        
        {currentWithdrawal && (
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Người yêu cầu:</strong> {currentWithdrawal.user?.fullName}</p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Số tiền:</strong> {' '}
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {formatCurrency(currentWithdrawal.amount)}
              </span>
            </p>
            <p style={{ margin: '0 0 0 0' }}><strong>Số tài khoản:</strong> {currentWithdrawal.accountNumber}</p>
          </div>
        )}
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="adminNote"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối yêu cầu rút tiền" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Accept Modal */}
      <Modal
        title="Chấp nhận yêu cầu rút tiền"
        visible={isAcceptModalVisible}
        onCancel={() => setIsAcceptModalVisible(false)}
        confirmLoading={formSubmitting}
        footer={[
          <Button key="cancel" onClick={() => setIsAcceptModalVisible(false)} disabled={formSubmitting}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            style={{ backgroundColor: '#52c41a' }}
            onClick={handleAccept}
            loading={formSubmitting}
            disabled={formSubmitting}
          >
            Xác nhận chấp nhận
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <ExclamationCircleFilled style={{ color: '#52c41a', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            Bạn đang chấp nhận yêu cầu rút tiền <strong>#{currentWithdrawal?.id}</strong>
          </p>
        </div>
        
        {currentWithdrawal && (
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Người yêu cầu:</strong> {currentWithdrawal.user?.fullName}</p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Số tiền:</strong> {' '}
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {formatCurrency(currentWithdrawal.amount)}
              </span>
            </p>
            <p style={{ margin: '0 0 0 0' }}><strong>Số tài khoản:</strong> {currentWithdrawal.accountNumber}</p>
          </div>
        )}
        
        <p>
          Sau khi chấp nhận, bạn cần tiến hành chuyển khoản cho người dùng và đánh dấu yêu cầu là hoàn thành sau khi đã chuyển khoản thành công.
        </p>
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="adminNote"
            label="Ghi chú của admin"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú khi chấp nhận!' }]}
          >
            <TextArea rows={4} placeholder="Nhập ghi chú khi chấp nhận yêu cầu rút tiền" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Modal */}
      <Modal
        title="Hoàn thành yêu cầu rút tiền"
        visible={isCompleteModalVisible}
        onCancel={() => setIsCompleteModalVisible(false)}
        confirmLoading={formSubmitting}
        footer={[
          <Button key="cancel" onClick={() => setIsCompleteModalVisible(false)} disabled={formSubmitting}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            onClick={handleComplete}
            loading={formSubmitting}
            disabled={formSubmitting}
          >
            Xác nhận hoàn thành
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <ExclamationCircleFilled style={{ color: '#1890ff', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            Bạn đang đánh dấu hoàn thành yêu cầu rút tiền <strong>#{currentWithdrawal?.id}</strong>
          </p>
        </div>
        
        {currentWithdrawal && (
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0' }}><strong>Người yêu cầu:</strong> {currentWithdrawal.user?.fullName}</p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Số tiền:</strong> {' '}
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                {formatCurrency(currentWithdrawal.amount)}
              </span>
            </p>
            <p style={{ margin: '0 0 0 0' }}><strong>Số tài khoản:</strong> {currentWithdrawal.accountNumber}</p>
          </div>
        )}
        
        <p>
          Xác nhận rằng bạn đã chuyển khoản thành công số tiền trên cho người dùng. Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default WithdrawalManagement;