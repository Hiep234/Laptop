import { useState, useEffect, useContext } from 'react';
import { Table, Input, Button, Space, Modal, Form, ConfigProvider, Select, Typography, Pagination, InputNumber, DatePicker, Switch, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getAllVoucher, createVoucher, updateVoucher, deleteVoucher } from '../../../Redux/actions/VoucherThunk';
import dayjs from 'dayjs';
import { NotificationContext } from '../../../components/NotificationProvider';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const VoucherManagement = () => {
  // State variables
  const [vouchers, setVouchers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states
  const [discountTypeFilter, setDiscountTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('asc');
  const [form] = Form.useForm();
  const notification = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false); // Add this state for form submission
  const dispatch = useDispatch();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // Extract start and end dates from the date range if selected
      const startDate = dateRange ? dateRange[0]?.format('YYYY-MM-DD') : null;
      const endDate = dateRange ? dateRange[1]?.format('YYYY-MM-DD') : null;
      
      const response = await dispatch(getAllVoucher(
        searchText,
        discountTypeFilter,
        statusFilter,
        startDate,
        endDate,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      ));
      
      if (response && response.content) {
        setVouchers(response.content);
        setTotalElements(response.totalElements);
      } else {
        notification.warning({
          message: "Không có mã giảm giá nào",
          description: "Không tìm thấy mã giảm giá nào với tiêu chí tìm kiếm đã nhập."
        });
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể tải danh sách mã giảm giá."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [currentPage, pageSize, searchText, discountTypeFilter, statusFilter, dateRange, sortField, sortDirection]);

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

  const handleDiscountTypeChange = (value) => {
    setDiscountTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const showModal = (voucher = null) => {
    setCurrentVoucher(voucher);
    form.resetFields();

    if (voucher) {
      // Set existing voucher values
      form.setFieldsValue({
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        date: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
        quantity: voucher.quantity,
        isActive: voucher.isActive
      });
    } else {
      // For new voucher, initialize isActive to true
      form.setFieldsValue({
        isActive: true
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      setFormSubmitting(true); // Set loading state when form submission starts
      const values = await form.validateFields();
      
      const voucherData = {
        code: values.code,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        startDate: values.date[0].format("YYYY-MM-DDTHH:mm:ss"),
        endDate: values.date[1].format("YYYY-MM-DDTHH:mm:ss"),
        quantity: values.quantity,
        isActive: values.isActive
      };

      if (currentVoucher) {
        // Update voucher
        const response = await dispatch(updateVoucher(currentVoucher.id, voucherData));
        console.log("Update response:", response);
        if (response === 200) {
          notification.success({
            message: 'Cập nhật mã giảm giá thành công',
            description: 'Mã giảm giá đã được cập nhật thành công.'
          });
          fetchVouchers();
          setIsModalVisible(false);
        } else if (response === 409) {
          notification.error({
            message: 'Mã giảm giá đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        } else {
          notification.error({
            message: 'Cập nhật mã giảm giá thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật mã giảm giá.'
          });
        }
      } else {
        // Create new voucher
        const response = await dispatch(createVoucher(voucherData));
        if (response === 201) {
          notification.success({
            message: 'Thêm mã giảm giá thành công',
            description: 'Mã giảm giá đã được thêm thành công.'
          });
          fetchVouchers();
          setIsModalVisible(false);
        } else if (response === 409) {
          notification.error({
            message: 'Mã giảm giá đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        } else {
          notification.error({
            message: 'Thêm mã giảm giá thất bại',
            description: 'Đã xảy ra lỗi khi thêm mã giảm giá.'
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xử lý yêu cầu này.'
      });
    } finally {
      setFormSubmitting(false); // Reset loading state when form submission completes
    }
  };

  // Show delete confirmation modal
  const showDeleteModal = (voucher) => {
    setVoucherToDelete(voucher);
    setIsDeleteModalVisible(true);
  };

  // Handle cancel for delete modal
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setVoucherToDelete(null);
  };

  // Handle actual deletion when confirmed
  const handleDeleteConfirm = async () => {
    if (!voucherToDelete) return;

    try {
      setLoading(true);
      const response = await dispatch(deleteVoucher(voucherToDelete.id));

      if (response === 204) {
        notification.success({
          message: 'Xóa mã giảm giá thành công',
          description: 'Mã giảm giá đã được xóa thành công.'
        });
        fetchVouchers();
      } else {
        notification.error({
          message: 'Xóa mã giảm giá thất bại',
          description: 'Không thể xóa mã giảm giá này.'
        });
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xóa mã giảm giá này.'
      });
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setVoucherToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format discount value based on type
  const formatDiscount = (value, type) => {
    if (type === 'PERCENT') {
      return `${value}%`;
    } else {
      return formatCurrency(value);
    }
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
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      width: 110,
    },
    {
      title: 'Loại',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 80,
      render: (type) => (
        <Tag color={type === 'PERCENT' ? 'blue' : 'green'}>
          {type === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
        </Tag>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 100,
      render: (value, record) => formatDiscount(value, record.discountType),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'center',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => formatDate(date),
      width: 120,
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => formatDate(date),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Đang kích hoạt' : 'Không kích hoạt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)}
          />
        </Space>
      ),
      width: 80,
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
      }}
    >
    <div style={{ padding: 24, background: '#fff'}}>
      
      {/* Title and Add Button */}
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
            fontWeight: 800
          }}
        >
          Quản lý mã giảm giá
        </Title>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          style={{ height: 48 }}
        >
          Thêm mã giảm giá
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <Input
          placeholder="Tìm kiếm mã giảm giá..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={searchText}
          onChange={handleSearch}
          size="large"
        />
        
        <Select
          placeholder="Loại giảm giá"
          style={{ width: 160 }}
          allowClear
          onChange={handleDiscountTypeChange}
          value={discountTypeFilter}
          size="large"
        >
          <Option value="PERCENT">Phần trăm</Option>
          <Option value="FIXED">Cố định</Option>
        </Select>
        
        <Select
          placeholder="Trạng thái"
          style={{ width: 180 }}
          allowClear
          onChange={handleStatusChange}
          value={statusFilter}
          size="large"
        >
          <Option value={true}>Đang kích hoạt</Option>
          <Option value={false}>Không kích hoạt</Option>
        </Select>
        
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          style={{ width: 300 }}
          onChange={handleDateRangeChange}
          size="large"
          format="DD/MM/YYYY"
        />
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
            <Option value="code">Mã giảm giá</Option>
            <Option value="discountValue">Giá trị giảm</Option>
            <Option value="startDate">Ngày bắt đầu</Option>
            <Option value="endDate">Ngày kết thúc</Option>
            <Option value="createdAt">Ngày tạo</Option>
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
        dataSource={vouchers} 
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

      {/* Add/Edit Modal */}
      <Modal
        title={currentVoucher ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
        okText={currentVoucher ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={formSubmitting}
        okButtonProps={{ 
          loading: formSubmitting, 
          disabled: formSubmitting 
        }}
        cancelButtonProps={{
          disabled: formSubmitting
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Mã giảm giá"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
          >
            <Input placeholder="Nhập mã giảm giá (VD: SALE10P)" />
          </Form.Item>


          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết về mã giảm giá" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="discountType"
              label="Loại giảm giá"
              rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
              style={{ width: '50%' }}
            >
              <Select placeholder="Chọn loại giảm giá">
                <Option value="PERCENT">Phần trăm (%)</Option>
                <Option value="FIXED">Cố định (VNĐ)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="discountValue"
              label="Giá trị"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm giá!' }]}
              style={{ width: '50%' }}
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={0} 
                placeholder="Nhập giá trị"
                formatter={(value) => {
                  const type = form.getFieldValue('discountType');
                  if (type === 'PERCENT') {
                    return `${value}%`;
                  } else {
                    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }
                }}
                parser={(value) => {
                  const type = form.getFieldValue('discountType');
                  if (type === 'PERCENT') {
                    return value.replace('%', '');
                  } else {
                    return value.replace(/\$\s?|(,*)/g, '');
                  }
                }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="date"
            label="Thời gian hiệu lực"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian hiệu lực!' }]}
          >
            <RangePicker 
              showTime 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY HH:mm"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="Nhập số lượng mã có thể sử dụng"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Kích hoạt" 
              unCheckedChildren="Không kích hoạt" 
              defaultChecked 
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        confirmLoading={loading}
        okButtonProps={{ danger: true }} 
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            Bạn có chắc chắn muốn xóa mã giảm giá <strong>{voucherToDelete?.code}</strong>?
          </p>
        </div>
        <p style={{ marginTop: '12px', color: '#666' }}>
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
    </ConfigProvider>
  );
};

export default VoucherManagement;