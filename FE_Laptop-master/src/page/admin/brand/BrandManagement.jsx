import { useState, useEffect, useContext } from 'react';
import { Table, Input, Button, Space, Modal, Form, Upload, message, Image, Tag, ConfigProvider, Select, Typography, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBrandPagination, createBrand, updateBrand, deleteBrand } from '../../../Redux/actions/BrandThunk';
import { getAllCountries } from '../../../Redux/actions/LocationThunk';
import dayjs from 'dayjs';
import {NotificationContext} from "../../../components/NotificationProvider";

const { Title } = Typography;
const { Option } = Select;

const BrandManagement = () => {
  // Existing state variables
  const [brands, setBrands] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const { countries } = useSelector(state => state.LocationReducer);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('asc');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const notification = useContext(NotificationContext);
  const [formSubmitting, setFormSubmitting] = useState(false); // Add this new state

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
      dispatch(getAllCountries());
      console.log("Countries fetched:", countries);
  }, [dispatch]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Updated API call to include sorting parameters
      const response = await dispatch(getAllBrandPagination(
        searchText, 
        selectedCountry, 
        currentPage, 
        pageSize,
        sortField,
        sortDirection
      ));
      
      if (response && response.content) {
        setBrands(response.content);
        setTotalElements(response.totalElements);
      } else {
        notification.warning({
          message: "Không có thương hiệu nào",
          description: "Không tìm thấy thương hiệu nào với tiêu chí tìm kiếm đã nhập."
        });
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể tải danh sách thương hiệu."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentPage, pageSize, searchText, selectedCountry, sortField, sortDirection]);

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
    console.log("Sort field changed:", value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Sort direction change handler
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset to first page when changing sort direction
  };


  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const showModal = (brand = null) => {
    setCurrentBrand(brand);
    form.resetFields();
    setFileList([]);
    
    if (brand) {
      const country = countries.find(c => c.name === brand.countryName);
      const countryId = country ? country.id : null;
      
      if (brand.logoUrl) {
        const logoFile = {
          uid: '-1',
          name: 'logo.png',
          status: 'done',
          url: brand.logoUrl,
        };
        
        // Set fileList state
        setFileList([logoFile]);
        
        // Set all form fields including the logo
        form.setFieldsValue({
          name: brand.name,
          description: brand.description,
          countryId: countryId,
          logo: [logoFile] // Initialize the logo field in the form
        });
      } else {
        // No logo case
        form.setFieldsValue({
          name: brand.name,
          description: brand.description,
          countryId: countryId
        });
      }
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
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('countryId', values.countryId);
      console.log("Form data prepared:", fileList);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('logo', fileList[0].originFileObj);
      }

      if (currentBrand) {
        // Update brand
        const response = await dispatch(updateBrand(currentBrand.id, formData));
        console.log("Update response:", response);
        if (response === 200) {
          notification.success({
            message: 'Cập nhật nhãn hàng thành công',
            description: 'Nhãn hàng đã được cập nhật thành công.'
          });
          fetchBrands();
          setIsModalVisible(false);
        } else if(response === 409){
          notification.error({
            message: 'Nhãn hàng đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        }else{
          notification.error({
            message: 'Cập nhật nhãn hàng thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật nhãn hàng.'
          });
        }
      } else {
        // Create new brand
        const response = await dispatch(createBrand(formData));
        if (response === 201) {
          notification.success({
            message: 'Thêm nhãn hàng thành công',
            description: 'Nhãn hàng đã được thêm thành công.'
          });
          fetchBrands();
          setIsModalVisible(false);
        } else if(response === 409){
          notification.error({
            message: 'Nhãn hàng đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        }else{
          notification.error({
            message: 'Cập nhật nhãn hàng thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật nhãn hàng.'
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

  // Show delete confirmation modal instead of using Modal.confirm
  const showDeleteModal = (brand) => {
    setBrandToDelete(brand);
    setIsDeleteModalVisible(true);
  };

  // Handle cancel for delete modal
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setBrandToDelete(null);
  };

  // Handle actual deletion when confirmed
  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    
    try {
      setLoading(true);
      const response = await dispatch(deleteBrand(brandToDelete.id));
      
      if (response === 204) {
        notification.success({
          message: 'Xóa nhãn hàng thành công',
          description: 'Nhãn hàng đã được xóa thành công.'
        });
        fetchBrands();
      } else {
        notification.error({
          message: 'Xóa nhãn hàng thất bại',
          description: 'Không thể xóa nhãn hàng này.'
        });
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xóa nhãn hàng này.'
      });
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setBrandToDelete(null);
    }
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    console.log("Selected country:", value);
    setCurrentPage(1); // Reset to first page when filtering
  };

    // Format date helper function
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };
  const colors = [
    'magenta', 'red', 'volcano', 'orange', 'gold', 'lime',
    'green', 'cyan', 'blue', 'geekblue', 'purple'
  ];

  function getColorByName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logo',
      render: (logoUrl) => (
        logoUrl ? <Image src={logoUrl} width={50} height={50} style={{ objectFit: 'contain' }} /> : '-'
      ),
      width: 100,
    },
    {
      title: 'Tên nhãn hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Quốc gia',
      dataIndex: 'countryName',
      key: 'country',
      render: (country) => <Tag color={getColorByName(country)}>{country}</Tag>,
      width: 120,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: 150,
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => date ? formatDate(date) : 'Chưa cập nhật',
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
      width: 120,
    },
  ];

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        notification.error({
          message: 'Chỉ được upload file ảnh!',
          description: 'Vui lòng chọn file ảnh để upload.'
        });
        return Upload.LIST_IGNORE; // Không thêm vào danh sách nếu không phải ảnh
      }
      return false; // Không tự động upload
    },
    maxCount: 1,
    fileList, // Sử dụng state fileList
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    listType: "picture-card",
    accept: "image/*",
    onRemove: () => {
      setFileList([]);
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
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
            fontWeight: 800, // Extra bold for emphasis
            fontFamily: "'Montserrat', sans-serif" 
          }}
        >
          Quản lý nhãn hàng laptop
        </Title>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          style={{ height: 48 }} // Match height with title
        >
          Thêm nhãn hàng
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex', 
        gap: '16px' // Increased spacing
      }}>
        <Input
          placeholder="Tìm kiếm nhãn hàng..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={handleSearch}
          size="large"
        />
        <Select
          placeholder="Chọn quốc gia"
          style={{ width: 180 }}
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={handleCountryChange}
          value={selectedCountry}
          prefix={<GlobalOutlined />}
          size="large"
        >
          {countries.map(country => (
            <Select.Option key={country.id} value={country.id}>
              {country.name}
            </Select.Option>
          ))}
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
            <Option value="name">Tên nhãn hàng</Option>

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
        dataSource={brands} 
        rowKey="id"
        loading={loading}
        pagination={false} // Disable built-in pagination
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
        title={currentBrand ? "Chỉnh sửa nhãn hàng" : "Thêm nhãn hàng mới"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
        okText={currentBrand ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={formSubmitting} // Use formSubmitting instead of loading
        okButtonProps={{ 
          loading: formSubmitting, // Add loading prop to the OK button
          disabled: formSubmitting // Also disable the button when loading
        }}
        cancelButtonProps={{
          disabled: formSubmitting // Disable the cancel button during submission
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhãn hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhãn hàng!' }]}
          >
            <Input placeholder="Nhập tên nhãn hàng" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả nhãn hàng" />
          </Form.Item>

          <Form.Item
            name="countryId"
            label="Quốc gia"
            rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
          >
            <Select
              placeholder="Chọn quốc gia"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {countries.map(country => (
                <Select.Option key={country.id} value={country.id}>
                  {country.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="logo"
            label="Logo"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: !currentBrand, message: 'Vui lòng tải lên logo!' }]}
          >
            <Upload {...uploadProps} listType="picture-card">
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
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
            Bạn có chắc chắn muốn xóa nhãn hàng <strong>{brandToDelete?.name}</strong>?
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

export default BrandManagement;