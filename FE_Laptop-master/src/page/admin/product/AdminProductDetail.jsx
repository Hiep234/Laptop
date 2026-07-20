import React, { useState, useEffect } from "react";
import { 
  ArrowLeftOutlined, 
  StarFilled, 
  StarOutlined,
  LaptopOutlined,
  BgColorsOutlined,
  DollarOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Card, 
  Tabs, 
  Table, 
  Tag, 
  Badge, 
  Image, 
  Row, 
  Col,
  Divider,
  Typography,
  Spin,
  Empty,
  message
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminDetailProduct } from '../../../Redux/actions/ProductThunk';
import '../../style/AdminProductDetail.css';

const { TabPane } = Tabs;
const { Meta } = Card;
const { Title, Text } = Typography;

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminProductDetail = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();  // Lấy id từ URL

     const fetchProductDetail = async () => {
        try {
        setLoading(true);
        const response = await dispatch(adminDetailProduct(id));
        if (response) {
            setProductData(response);
            setLoading(false);
        } else {
            setError("Không thể tải thông tin sản phẩm");
            setLoading(false);
        }
        } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        setLoading(false);
        message.error("Không thể tải thông tin sản phẩm");
        }
    };
  // Fetch product data khi component mount
    useEffect(() => {
      fetchProductDetail();
    }, []);


  const handleBack = () => {
    navigate('/admin/laptops');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.floor(rating) ? (
          <StarFilled key={i} style={{ color: '#fadb14' }} />
        ) : (
          <StarOutlined key={i} style={{ color: '#d9d9d9' }} />
        )
      );
    }
    return stars;
  };

  // Hiển thị loading hoặc error state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
          tip="Đang tải thông tin sản phẩm..." 
        />
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div style={{ padding: '24px' }}>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{ marginBottom: '24px' }}
        >
          Quay lại trang quản lý laptop
        </Button>
        <Empty 
          description={error || "Không tìm thấy thông tin sản phẩm"} 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </div>
    );
  }

  // Lấy option và variant hiện tại
  const currentOption = productData.options[selectedOption];
  const currentVariant = currentOption.productVariants[selectedVariant];

  return (
    <div className="product-detail-container" style={{ background: 'white', padding: '20px' }}>
      {/* Header with navigation */}
      <div className="product-admin-header" style={{ marginBottom: '20px' }}>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{ marginLeft: 0 }}
        >
          Quay lại trang quản lý laptop
        </Button>
      </div>

      {/* Product content */}
      <Row gutter={[24, 24]} className="product-content">
        {/* Product images - giảm kích thước cột */}
        <Col xs={24} md={10} lg={7}>
          <Card 
            bordered={false} 
            style={{ background: 'white' }}
            bodyStyle={{ padding: 8 }}
          >
            <div className="main-image-container">
              <Image
                src={productData.images[currentImageIndex]?.url}
                alt={`${productData.name} image ${currentImageIndex + 1}`}
                preview={true}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'fill', 
                }}
              />
            </div>
            <div className="thumbnail-grid">
              {productData.images.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`thumbnail-container ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{ 
                    width: '50px',
                    height: '50px', 
                    margin: '4px',
                    border: index === currentImageIndex ? '2px solid #1890ff' : '1px solid #f0f0f0',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Product info - tăng kích thước cột */}
        <Col xs={24} md={14} lg={17}>
          <Card bordered={false} style={{ background: 'white', padding: '0' }}>
            <div className="product-tags" style={{ padding: 0, margin: 0 }}>
              <Tag color="green" style={{marginLeft: 0}}>{productData.category.name}</Tag>
              <Tag color="blue">{productData.brand.name}</Tag>
            </div>
            <Title level={2} className="product-title">{productData.name}</Title>
            <div className="product-rating">
              <div className="stars">
                {renderStars(productData.ratingAverage)}
              </div>
              <span className="rating-text">{productData.ratingAverage.toFixed(1)}</span>
              <Divider type="vertical" />
              <span className="sales-text">Lượt bán: {productData.salesCount}</span>
            </div>

            {/* Configuration options */}
            <div className="section-container" style={{ marginTop: '20px' }}>
              <Title level={4} className="section-title">
                <LaptopOutlined style={{ marginRight: '8px' }} />
                Phiên bản cấu hình
              </Title>
              <Row gutter={[16,16]}>
                {productData.options.map((option, index) => (
                  <Col span={12} key={option.id}>
                    <Card 
                      bordered={true}
                      style={{ 
                        cursor: 'pointer',
                        borderColor: selectedOption === index ? '#1890ff' : '#d9d9d9',
                        background: selectedOption === index ? '#f0f7ff' : 'white'
                      }}
                      onClick={() => {
                        setSelectedOption(index);
                        setSelectedVariant(0);
                      }}
                    >
                      <div className="option-header">
                        <Title level={5} style={{ margin: 0 }}>{option.code}</Title>
                        <Text type="secondary">{option.cpu} | {option.gpu}</Text>
                      </div>
                      <div className="option-price" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                        {formatCurrency(option.price)}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Color variants */}
            <div className="section-container" style={{ marginTop: '20px' }}>
              <Title level={4} className="section-title">
                <BgColorsOutlined style={{ marginRight: '8px' }} />
                Màu sắc
              </Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {currentOption.productVariants.map((variant, index) => (
                  <div 
                    key={variant.id} 
                    onClick={() => setSelectedVariant(index)}
                    style={{ 
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: selectedVariant === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: '4px',
                      padding: '8px',
                      width: '100px'
                    }}
                  >
                <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto',
                position: 'relative'
                }}>
                <img
                    src={variant.imageUrl}
                    alt={variant.color}
                    style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                    }}
                />
                
                {variant.priceDiff > 0 && (
                    <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center'
                    }}>
                    <Tag color="gold">
                        +{formatCurrency(variant.priceDiff)}
                    </Tag>
                    </div>
                )}
                </div>
                    <div style={{ 
                      marginTop: '8px',
                      fontWeight: selectedVariant === index ? 'bold' : 'normal'
                    }}>
                      {variant.color}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and stock */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Tổng tiền:</Text>
                <Title level={3} style={{ margin: '0' }}>
                  {formatCurrency(currentOption.price + currentVariant.priceDiff)}
                </Title>
              </div>
              <div>
                <Text type="secondary">Số lượng có sẵn:</Text>
                <Title level={3} style={{ margin: '0' }}>
                  {currentVariant.stock}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed specifications */}
      <Tabs defaultActiveKey="description" style={{ marginTop: '24px' }}>
        {/* Thêm tab mô tả sản phẩm */}
        <TabPane 
          tab={
            <span>
              <InfoCircleOutlined style={{marginRight: '8px'}} />
              Mô tả sản phẩm
            </span>
          }
          key="description"
        >
          <Card bordered={false} style={{ background: 'white' }}>
            <div dangerouslySetInnerHTML={{ __html: productData.description }} />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <DesktopOutlined style={{marginRight: '8px'}} />
              Thông số kỹ thuật
            </span>
          } 
          key="specs"
        >
          <Card bordered={false} style={{ background: 'white' }}>
            <Table 
              dataSource={[{
                spec: 'CPU', value: currentOption.cpu
              },
              { spec: 'GPU', value: currentOption.gpu },
              { spec: 'RAM', value: `${currentOption.ram} ${currentOption.ramType}` },
              { spec: 'RAM Slots', value: currentOption.ramSlot },
              { spec: 'Storage', value: currentOption.storage },
              { spec: 'Storage Upgrade', value: currentOption.storageUpgrade },
              { spec: 'Display Size', value: currentOption.displaySize },
              { spec: 'Resolution', value: currentOption.displayResolution },
              { spec: 'Refresh Rate', value: currentOption.displayRefreshRate },
              { spec: 'Display Technology', value: currentOption.displayTechnology },
                { spec: 'Operating System', value: currentOption.operatingSystem },
                { spec: 'Battery', value: currentOption.battery },
                { spec: 'Weight', value: currentOption.weight },
                { spec: 'Dimension', value: currentOption.dimension || 'N/A' },
                { spec: 'Wi-Fi', value: currentOption.wifi || 'N/A' },
                { spec: 'Bluetooth', value: currentOption.bluetooth || 'N/A' },
                { spec: 'Ports', value: currentOption.ports || 'N/A' },
                { spec: 'Special Features', value: currentOption.specialFeatures || 'N/A' }
              ]}
              pagination={false}
              style={{ background: 'white' }}
            >
              <Table.Column title="Thông số kỹ thuật" dataIndex="spec" key="spec" />
              <Table.Column title={`${currentOption.code} Model`} dataIndex="value" key="value" />
            </Table>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminProductDetail;