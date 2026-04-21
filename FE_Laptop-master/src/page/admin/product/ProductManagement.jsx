import { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, Upload, message, Image, Tag, ConfigProvider, Select, Typography, Pagination,  Row, Col, Card, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SortAscendingOutlined, SortDescendingOutlined, ExclamationCircleFilled, PictureOutlined, StarFilled, EyeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { adminGetAllProducts, getAllCategories, getAllBrands, adminDeleteProduct } from '../../../Redux/actions/ProductThunk';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const ProductManagement = () => {
  // Thêm hook useNavigate
  const navigate = useNavigate();
  
  // State variables
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);

  // Data states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Other state variables
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchText, categoryFilter, brandFilter, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await dispatch(adminGetAllProducts(
        searchText,
        categoryFilter,
        brandFilter,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      ));
      
      if (response && response.content) {
        setProducts(response.content);
        setTotalElements(response.totalElements);
      } else {
        messageApi.warning("Không có sản phẩm nào");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      messageApi.error("Đã xảy ra lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await dispatch(getAllCategories());
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await dispatch(getAllBrands());
      if (response) {
        setBrands(response);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

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

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleBrandChange = (value) => {
    setBrandFilter(value);
    setCurrentPage(1);
  };


  const showViewModal = (product) => {
    setCurrentProduct(product);
    setPreviewImages(product.images || []);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setPreviewImages([]);
  };

  // Hàm xử lý chuyển hướng đến trang tạo sản phẩm mới
  const handleAddProduct = () => {
    navigate('/admin/laptops/create');
  };

  // Hàm xử lý chuyển hướng đến trang sửa sản phẩm
  const handleEditProduct = (productId) => {
    navigate(`/admin/laptops/update/${productId}`);
  };
  const handleDetailProduct = (productId) => {
    navigate(`/admin/laptops/detail/${productId}`);
  };
  // Show delete confirmation modal
  const showDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalVisible(true);
  };

  // Handle cancel for delete modal
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setProductToDelete(null);
  };

  // Handle actual deletion when confirmed
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      
      const response = await dispatch(adminDeleteProduct(productToDelete.id));
      console.log(response);
      if (response === 204) {
        messageApi.success('Xóa sản phẩm thành công');
      } else {
        messageApi.error('Đã xảy ra lỗi khi xóa sản phẩm');
      }
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      messageApi.error('Đã xảy ra lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setProductToDelete(null);
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
      width: 60,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'image',
      width: 100,
      render: (images) => (
        images && images.length > 0 ? (
          <Image 
            src={images[0].url} 
            alt="Product"
            width={70}
            height={70}
            style={{ objectFit: 'contain' }}
            preview={false}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        ) : (
          <div style={{ 
            width: 70, 
            height: 70, 
            background: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        )
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <span 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={() => showViewModal(record)}
          >
            {text}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'Thể loại',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120
    },
    {
      title: 'Nhãn hàng',
      dataIndex: ['brand', 'name'],
      key: 'brand',
      width: 90
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 90,
      align: 'center',
    },
    {
      title: 'Đã bán',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: 70,
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleDetailProduct(record.id)}
            size="middle"
            title="Xem chi tiết"
            style={{ borderRadius: '4px' }}
          />
          <Button 
            type="primary"
            style={{ background: '#52c41a', borderRadius: '4px' }}
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record.id)}
            size="middle"
            title="Chỉnh sửa"
          />
          <Button 
            danger
            type="primary" 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)}
            size="middle"
            title="Xóa sản phẩm"
            style={{ borderRadius: '4px' }}
          />
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
      }}
    >
    <div style={{ padding: 24, background: '#fff'}}>
      {contextHolder}
      
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
          Quản lý laptop
        </Title>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddProduct}
          size="large"
          style={{ height: 48 }}
        >
          Thêm sản phẩm
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
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={handleSearch}
          size="large"
        />
        
        <Select
          placeholder="Thể loại"
          style={{ width: 180 }}
          allowClear
          onChange={handleCategoryChange}
          value={categoryFilter}
          size="large"
        >
          {categories.map(category => (
            <Option key={category.id} value={category.id}>{category.name}</Option>
          ))}
        </Select>
        
        <Select
          placeholder="Nhãn hàng"
          style={{ width: 180 }}
          allowClear
          onChange={handleBrandChange}
          value={brandFilter}
          size="large"
        >
          {brands.map(brand => (
            <Option key={brand.id} value={brand.id}>{brand.name}</Option>
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
            style={{ width: 180 }}
            size="middle"
          >
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="name">Tên sản phẩm</Option>
            <Option value="sales">Đã bán</Option>
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
        dataSource={products} 
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        confirmLoading={loading}
        okButtonProps={{ 
          danger: true,
          icon: <DeleteOutlined />
        }} 
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>
            Bạn có chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.name}</strong>?
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

export default ProductManagement;