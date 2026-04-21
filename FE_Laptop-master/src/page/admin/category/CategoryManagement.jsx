import { useState, useEffect, useContext } from 'react';
import { Table, Input, Button, Space, Modal, Form, Upload, message, Image, ConfigProvider, Select, Typography, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createCategory, deleteCategory, getAllCategoryPagination, updateCategory } from '../../../Redux/actions/CategoryThunk';
import dayjs from 'dayjs';
import { NotificationContext } from '../../../components/NotificationProvider';

const { Title } = Typography;
const { Option } = Select;

const CategoryManagement = () => {
  // Existing state variables
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('asc');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const notification = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false); // Add this new state
  const dispatch = useDispatch();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Updated API call to include sorting parameters
      const response = await dispatch(getAllCategoryPagination(
        searchText,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      ));

      if (response && response.content) {
        setCategories(response.content);
        setTotalElements(response.totalElements);
      } else {
        notification.warning({
          message: "Không có danh mục nào",
          description: "Vui lòng kiểm tra lại tiêu chí tìm kiếm."
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notification.error({
        message: "Đã xảy ra lỗi",
        description: "Không thể tải danh mục."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize, searchText, sortField, sortDirection]);

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

  const showModal = (category = null) => {
    setCurrentCategory(category);
    form.resetFields();
    setFileList([]);

    if (category) {
      if (category.imageUrl) {
        const imageFileList = [{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: category.imageUrl,
        }];

        setFileList(imageFileList);

        // Initialize both name and image fields
        form.setFieldsValue({
          name: category.name,
          image: imageFileList  // Add this line to set the image field
        });
      } else {
        form.setFieldsValue({
          name: category.name
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
      console.log("Form data prepared:", fileList);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      if (currentCategory) {
        // Update category
        const response = await dispatch(updateCategory(currentCategory.id, formData));
        console.log("Update response:", response);
        if (response === 200) {
          notification.success({
            message: 'Cập nhật thể loại thành công',
            description: 'Thể loại đã được cập nhật thành công.'
          });
          fetchCategories();
          setIsModalVisible(false);
        } else if(response === 409){
          notification.error({
            message: 'Thể loại đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        }else{
          notification.error({
            message: 'Cập nhật thể loại thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật thể loại.'
          });
        }
      } else {
        // Create new category
        const response = await dispatch(createCategory(formData));
        if (response === 201) {
          notification.success({
            message: 'Thêm thể loại thành công',
            description: 'Thể loại đã được thêm thành công.'
          });
          fetchCategories();
          setIsModalVisible(false);
        } else if(response === 409){
          notification.error({
            message: 'Thể loại đã tồn tại',
            description: 'Vui lòng kiểm tra lại thông tin và thử lại.'
          });
        }else{
          notification.error({
            message: 'Cập nhật thể loại thất bại',
            description: 'Đã xảy ra lỗi khi cập nhật thể loại.'
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
  const showDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalVisible(true);
  };

  // Handle cancel for delete modal
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setCategoryToDelete(null);
  };

  // Handle actual deletion when confirmed
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      const response = await dispatch(deleteCategory(categoryToDelete.id));

      if (response === 204) {
        notification.success({
          message: 'Xóa thể loại thành công',
          description: 'Thể loại đã được xóa thành công.'
        });
        fetchCategories();
      } else {
        notification.error({
          message: 'Xóa thể loại thất bại',
          description: 'Không thể xóa thể loại này.'
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      notification.error({
        message: 'Đã xảy ra lỗi',
        description: 'Không thể xóa thể loại này.'
      });
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setCategoryToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'image',
      render: (imageUrl) => (
        imageUrl ? <Image src={imageUrl} width={50} height={50} style={{ objectFit: 'contain' }} /> : '-'
      ),
      width: 100,
    },
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      key: 'name',
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
          description: 'Vui lòng chọn file ảnh để tải lên.',
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
          }}
        >
          Quản lý thể loại laptop
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
          style={{ height: 48 }} // Match height with title
        >
          Thêm thể loại
        </Button>
      </div>

      {/* Search and Filter */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        gap: '16px' // Increased spacing
      }}>
        <Input
          placeholder="Tìm kiếm thể loại..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={handleSearch}
          size="large"
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
            style={{ width: 150 }}
            size="middle"
          >
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="updatedAt">Ngày cập nhật</Option>
            <Option value="name">Tên thể loại</Option>
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
        dataSource={categories}
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
        title={currentCategory ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={700}
        okText={currentCategory ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={formSubmitting} // Use the new state here
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
            label="Tên thể loại"
            rules={[{ required: true, message: 'Vui lòng nhập tên thể loại!' }]}
          >
            <Input placeholder="Nhập tên thể loại" />
          </Form.Item>

          <Form.Item
              name="image"
              label="Hình ảnh"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: !currentCategory, message: 'Vui lòng tải lên hình ảnh!' }]}
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
            Bạn có chắc chắn muốn xóa thể loại <strong>{categoryToDelete?.name}</strong>?
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

export default CategoryManagement;