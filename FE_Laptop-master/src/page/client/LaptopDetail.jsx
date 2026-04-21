import React, {useContext, useEffect, useState} from 'react';
import {
    ShoppingCartOutlined,
    HeartOutlined,
    DownOutlined,
    UpOutlined,
    StarFilled,
    StarOutlined,
    CheckOutlined,
    ShareAltOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    HeartFilled
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Tabs,
    Avatar,
    Divider,
    Image,
    Rate, notification, Spin, Pagination
} from 'antd';
import '../style/LaptopDetail.css';
import banner1 from '../../assets/x.webp';
import { getProductDetailById } from "../../Redux/actions/ProductThunk";
import { useDispatch } from "react-redux";
import {insertCartItem} from "../../Redux/actions/CartItemThunk";
import {useParams} from "react-router-dom";
import RatingModal from "./RatingModal";
import {createReview, getAllReview} from "../../Redux/actions/RatingThunk";
import {NotificationContext} from "../../components/NotificationProvider";

const { TabPane } = Tabs;
const { Meta } = Card;

const LaptopDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [selectedOption, setSelectedOption] = useState(0);
    const [activeTab, setActiveTab] = useState("specs");
    const [showMoreSpecs, setShowMoreSpecs] = useState(false);
    const [productDetail, setProductDetail] = useState(null);
    const dispatch = useDispatch();
    const notification = useContext(NotificationContext);
    const [loading, setLoading] = useState(true);
    const [isReviewsLoading, setIsReviewsLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [varientId,setVariantId] = useState(0);
    const { id } = useParams();
    const [optionId, setOptionId] = useState(id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 5,
        totalElements: 0
    });
    const fetchProductDetail = async (optionId, isInit = true) => {
        try {
            if (isInit) setLoading(true);
            const response = await dispatch(getProductDetailById(optionId));
            setProductDetail(response);
            const selectedOptionIndex = response?.productOptions.findIndex(option => option.id.toString() === optionId.toString());

            if (selectedOptionIndex !== -1) {
                setSelectedOption(selectedOptionIndex);
            } else {
                // Nếu không tìm thấy, chọn option đầu tiên và thông báo
                setSelectedOption(0);
                notification.warning({
                    message: 'Thông báo',
                    description: 'Cấu hình không tồn tại, đã chọn cấu hình mặc định',
                    placement: 'topRight',
                });
            }

            // Lấy variantId đầu tiên
            const firstVariantId = response?.productVariants?.[0]?.id;
            if (firstVariantId) {
                setVariantId(firstVariantId);
            }

            return response;
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải sản phẩm',
                placement: 'topRight',
            });
            return null;
        } finally {
            if (isInit) setLoading(false);
        }
    };
    const fetchReviews = async () => {
        try {
            setIsReviewsLoading(true);
            const res = await dispatch(getAllReview(productDetail?.id,pagination.currentPage,
               pagination.pageSize
            ));

            if (res?.data) {
                setReviews(res.data.content);
                setPagination({
                    currentPage: res.data.currentPage,
                    totalPages: res.data.totalPages,
                    pageSize: res.data.pageSize,
                    totalElements: res.data.totalElements
                });
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsReviewsLoading(false);
        }
    };
    useEffect(() => {
        fetchProductDetail(id, true);
    }, [dispatch, id]);
    useEffect(() => {
        if (productDetail?.id) {
            fetchReviews();
            // Check favorite
            const favs = JSON.parse(localStorage.getItem('FAVORITES')) || [];
            const found = favs.find(item => item.id === productDetail.product.id);
            setIsFavorite(!!found);
        }
    }, [productDetail?.id, pagination.currentPage]);
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };
    const handleSubmitReview = async ({ rating, review }) => {
        const body = {
            productOptionId: productDetail?.id,
            rating: rating,
            comment: review
        };
        const res = await dispatch(createReview(body));

        if (res?.code === 201) {
            fetchReviews();
            notification.success({
                message: 'Thành công',
                description: 'Đánh giá thành công',
                placement: 'topRight',
            });
            window.location.reload();
        } else {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể gửi đánh giá',
                placement: 'topRight',
            });
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };
    const calculatePrice = () => {
        if (!productDetail) return 0;

        // Tìm option dựa trên optionId
        const option = productDetail.productOptions.find(opt => opt.id.toString() === optionId.toString()) ||
            productDetail.productOptions[0];

        const basePrice = option.price;
        const variantPrice = productDetail.productVariants[selectedVariant]?.priceDiff || 0;
        return basePrice + variantPrice;
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            star <= rating ?
                <StarFilled key={star} className="star-filled" /> :
                <StarOutlined key={star} className="star-outlined" />
        ));
    };

    const specifications = [
        { name: "CPU", value: productDetail?.productOptions[selectedOption]?.cpu || '' },
        { name: "RAM", value: productDetail?.productOptions[selectedOption]?.ram || '' },
        { name: "Loại RAM", value: productDetail?.ramType || '' },
        { name: "Khe RAM", value: productDetail?.ramSlot || '' },
        { name: "Ổ cứng", value: productDetail?.productOptions[selectedOption]?.storage || '' },
        { name: "Nâng cấp ổ cứng", value: productDetail?.storageUpgrade || '' },
        { name: "Card đồ họa", value: productDetail?.productOptions[selectedOption]?.gpu || '' },
        { name: "Kích thước màn hình", value: productDetail?.displaySize || '' },
        { name: "Độ phân giải", value: productDetail?.displayResolution || '' },
        { name: "Tần số quét", value: productDetail?.displayRefreshRate || '' },
        { name: "Công nghệ màn hình", value: productDetail?.displayTechnology || '' },
        { name: "Hệ điều hành", value: productDetail?.operatingSystem || '' },
        { name: "Pin", value: productDetail?.battery || '' },
        { name: "Cổng kết nối", value: productDetail?.ports || '' },
        { name: "Kích thước", value: productDetail?.dimension || '' },
        { name: "Trọng lượng", value: productDetail?.weight || '' },
        { name: "Bảo mật", value: productDetail?.security || '' },
        { name: "Âm thanh", value: productDetail?.audioFeatures || '' },
        { name: "Webcam", value: productDetail?.webcam || '' },
        { name: "Kết nối không dây", value: `${productDetail?.wifi || ''}, ${productDetail?.bluetooth || ''}` },
        { name: "Bàn phím", value: productDetail?.keyboard || '' },
        { name: "Tính năng đặc biệt", value: productDetail?.specialFeatures || '' },
    ];
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const ReviewItem = ({ name, avatar, date, rating, comment }) => {
        return (
            <div className="review-item">
                <div className="review-header">
                    <div className="reviewer-info">
                        <Avatar
                            size={48}
                            src={avatar}
                            icon={<UserOutlined />}
                            alt={name}
                        />
                        <div>
                            <div className="reviewer-name">{name}</div>
                            <div className="review-date">{date}</div>
                        </div>
                    </div>
                    <Rate
                        disabled
                        value={rating}
                        className="review-rating"
                        character={({ index }) => index < rating ? <StarFilled /> : <StarOutlined />}
                    />
                </div>
                <p className="review-comment">{comment}</p>
            </div>
        );
    };

    if (loading || !productDetail) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Đang tải...</p>
            </div>
        );
    }
    const handleBuyNow = async () => {
        if(varientId) {
            console.log(varientId);
            const result = await dispatch(insertCartItem({
                quantity: 1,
                productVariantId: varientId,
                userId: userData?.id,
            }));
            if (result === 200) {
                window.location.href = `http://localhost:3000/cart/${userData?.id}`;
            } else {
                notification.error({
                    message: "Lỗi",
                    description: "Không thể thêm vào giỏ hàng",
                    placement: "topRight",
                });
            }
        }
    };
    const handleAddCart = async () => {
        if(varientId) {
            console.log(varientId);
            const result = await dispatch(insertCartItem({
                quantity: 1,
                productVariantId: varientId,
                userId: userData?.id,
            }));
            if (result === 200) {
                window.dispatchEvent(new Event('cartUpdated'));
                notification.success({
                    message: 'Thành công',
                    description: 'Đã thêm sản phẩm vào giỏ hàng',
                    placement: 'topRight',
                });
            } else {
                notification.error({
                    message: "Lỗi",
                    description: "Không thể thêm vào giỏ hàng",
                    placement: "topRight",
                });
            }
        }
    };
    
    const handleToggleFavorite = () => {
        if (!productDetail) return;
        let favs = JSON.parse(localStorage.getItem('FAVORITES')) || [];
        const productId = productDetail.product.id;
        
        const index = favs.findIndex(item => item.id === productId);
        if (index > -1) {
            favs.splice(index, 1);
            setIsFavorite(false);
            notification.info({
                message: 'Thông báo',
                description: 'Đã bỏ yêu thích sản phẩm',
                placement: 'topRight',
            });
        } else {
            favs.push({
                id: productId,
                name: productDetail.product.name,
                image: productDetail.product.images[0]?.url || banner1,
                price: calculatePrice(),
                rating: productDetail.ratingAverage
            });
            setIsFavorite(true);
            notification.success({
                message: 'Thành công',
                description: 'Đã thêm vào danh sách yêu thích',
                placement: 'topRight',
            });
        }
        localStorage.setItem('FAVORITES', JSON.stringify(favs));
        window.dispatchEvent(new Event('favoritesUpdated'));
    };

    return (
        <div className="laptop-detail-container">
            <div className="product-detail-grid">
                <div className="product-images">
                    <div className="main-image-container">
                        <Badge.Ribbon text="Mới" color="red" className={"ribbon"}>
                            <Image
                                className="main-image"
                                src={productDetail.product.images[selectedImage]?.url || banner1}
                                alt={productDetail.product.name}
                            />
                        </Badge.Ribbon>
                    </div>

                    <div
                        className="thumbnail-container"
                        style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '8px 0',
                            overflowX: 'auto',
                            maxWidth: '800px',
                        }}
                    >
                        {productDetail.product.images.map((image, index) => (
                            <div
                                key={index}
                                className={`thumbnail ${selectedImage === index ? 'thumbnail-active' : ''}`}
                                onClick={() => setSelectedImage(index)}
                                style={{
                                    flex: '0 0 auto',
                                    width: '80px',
                                    height: '80px',
                                    minWidth: '80px',
                                    border: selectedImage === index ? '2px solid #1890ff' : '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    backgroundColor: '#f5f5f5'
                                }}
                            >
                                <img
                                    src={image.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;base64,...'; // Ảnh fallback
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="features-grid">
                        <Card className="feature-card">
                            <CarOutlined className="feature-icon"/>
                            <Meta
                                title="Giao hàng miễn phí"
                                description="Trong 24 giờ"
                                className="feature-meta"
                            />
                        </Card>
                        <Card className="feature-card">
                            <SafetyCertificateOutlined className="feature-icon"/>
                            <Meta
                                title="Bảo hành 24 tháng"
                                description="Chính hãng"
                                className="feature-meta"
                            />
                        </Card>
                        <Card className="feature-card">
                            <ShareAltOutlined className="feature-icon"/>
                            <Meta
                                title="Đổi trả 30 ngày"
                                description="Miễn phí"
                                className="feature-meta"
                            />
                        </Card>
                    </div>
                </div>

                {/* Right column - Details */}
                <div className="product-info">
                    <div className="product-header">
                        <h1 className="product-title">{productDetail.product.name}</h1>
                        <div className="rating-container">
                            <div className="stars">
                                {renderStars(productDetail.ratingAverage)}
                            </div>
                            <span className="rating-text">{productDetail.ratingAverage} / 5 ({productDetail.totalRating} đánh giá)</span>
                        </div>

                        <div className="price-container">
                            <span className="current-price">{formatPrice(calculatePrice())}</span>
                            <span className="old-price">{formatPrice(calculatePrice() * 1.1)}</span>
                            <Badge count="-10%" style={{backgroundColor: '#f5222d'}}/>
                        </div>
                        <div className="product-description" dangerouslySetInnerHTML={{ __html: productDetail.product.description }} />
                    </div>

                    {/* Configuration Selection */}
                    <div className="config-section">
                        <h3 className="section-title">Chọn cấu hình</h3>
                        <div className="config-options">
                            {productDetail.productOptions.map((option, index) => (
                                <Card
                                    key={option.id}
                                    className={`config-card-small ${option.id.toString() === optionId.toString() ? 'config-card-active' : ''}`}
                                    onClick={async () => {
                                        const newResponse = await fetchProductDetail(option.id, false);
                                        if (newResponse) {
                                            const selectedOptionIndex = newResponse.productOptions.findIndex(
                                                opt => opt.id.toString() === option.id.toString()
                                            );
                                            if (selectedOptionIndex !== -1) {
                                                setSelectedOption(selectedOptionIndex);
                                            }
                                            setOptionId(option.id);
                                        }
                                    }}
                                    style={{ marginBottom: 16, position: 'relative' }}
                                >
                                    {index === 1 && ( // Assuming the second option is most popular
                                        <Badge.Ribbon text="Phổ biến" color="red" placement="end">
                                            <div></div>
                                        </Badge.Ribbon>
                                    )}
                                    <div className="config-content-small"
                                         style={{ display: 'flex', alignItems: 'center' }}>
                                        <div
                                            className={`config-radio ${selectedOption === index ? 'config-radio-active' : ''}`}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                border: '2px solid #1890ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 12,
                                                backgroundColor: selectedOption === index ? '#1890ff' : 'transparent'
                                            }}
                                        >
                                            {selectedOption === index &&
                                                <CheckOutlined style={{ color: 'white', fontSize: 12 }} />}
                                        </div>
                                        <div className="config-details-small">
                                            <h4 className="config-name" style={{ margin: 0 }}>{option.code}</h4>
                                            <div className="config-price"
                                                 style={{ color: '#ff4d4f', fontWeight: 'bold', margin: '4px 0' }}>
                                                {formatPrice(option.price)}
                                            </div>
                                            <div className="spec-item">
                                                <span>{option.cpu} | {option.ram} - {option.storage} | {option.gpu}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="color-section">
                        <h3 className="section-title">Chọn màu sắc</h3>
                        <div className="color-options">
                            {productDetail.productVariants.map((variant, index) => (
                                <div
                                    key={variant.id}
                                    className="color-option"
                                    onClick={() => {
                                        setVariantId(variant.id);
                                        setSelectedVariant(index);
                                    }}

                                >
                                    <div
                                        className={`color-circle ${selectedVariant === index ? 'color-circle-active' : ''}`}
                                        style={{ backgroundColor: getColorHex(variant.color) }}
                                    />
                                    <span className={`color-name ${selectedVariant === index ? 'color-name-active' : ''}`}>
                                        {variant.color}
                                    </span>
                                        <span className="color-price-adjustment">
                                            +{formatPrice(variant.priceDiff)}
                                        </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <Button
                            type="primary"
                            size="large"
                            className="buy-now-btn"
                            onClick={handleBuyNow}
                        >
                            <ShoppingCartOutlined />
                            Mua ngay
                        </Button>

                        <div className="secondary-buttons">
                            <Button size="large" className="secondary-btn"
                                    onClick={handleAddCart}
                            >
                                <ShoppingCartOutlined />
                                Thêm vào giỏ
                            </Button>
                            <Button size="large" className={`secondary-btn ${isFavorite ? 'btn-loved' : ''}`}
                                    onClick={handleToggleFavorite}
                            >
                                {isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="tabs-section">
                <Tabs defaultActiveKey="specs" onChange={(key) => setActiveTab(key)}>
                    <TabPane tab="Thông số kỹ thuật" key="specs">
                        <Card>
                            <div className="specs-grid">
                                {specifications.slice(0, showMoreSpecs ? specifications.length : 8).map((spec, index) => (
                                    spec.value && (
                                        <div key={index} className="spec-row">
                                            <span className="spec-label">{spec.name}</span>
                                            <span className="spec-value">{spec.value}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                            {specifications.length > 8 && (
                                <Button
                                    type="text"
                                    className="toggle-specs-btn"
                                    onClick={() => setShowMoreSpecs(!showMoreSpecs)}
                                    icon={showMoreSpecs ? <UpOutlined /> : <DownOutlined />}
                                >
                                    {showMoreSpecs ? 'Thu gọn' : 'Xem thêm thông số'}
                                </Button>
                            )}
                        </Card>
                    </TabPane>
                    <TabPane tab="Mô tả sản phẩm" key="description">
                        <Card>
                            <div className="product-description-content">
                                <h3>{productDetail.product.name} - Hiệu năng vượt trội, thiết kế đỉnh cao</h3>
                                <div dangerouslySetInnerHTML={{ __html: productDetail.product.description }} />

                                <h4>Hiệu năng vượt trội</h4>
                                <p>
                                    Được trang bị bộ vi xử lý {productDetail.productOptions[selectedOption].cpu} cùng card đồ họa {productDetail.productOptions[selectedOption].gpu},
                                    {productDetail.product.name} dễ dàng xử lý mọi tác vụ từ gaming đến đồ họa chuyên nghiệp. RAM {productDetail.productOptions[selectedOption].ram} tốc độ cao và ổ
                                    cứng {productDetail.productOptions[selectedOption].storage} giúp mọi thao tác diễn ra mượt mà, không độ trễ.
                                </p>

                                <h4>Màn hình chất lượng cao</h4>
                                <p>
                                    Màn hình {productDetail.displaySize} với độ phân giải {productDetail.displayResolution} và tần số quét {productDetail.displayRefreshRate} mang đến hình ảnh sắc nét,
                                    màu sắc chính xác và chuyển động mượt mà. Công nghệ {productDetail.displayTechnology} giúp hiển thị hình ảnh chất lượng cao.
                                </p>

                                <h4>Thiết kế tinh tế</h4>
                                <p>
                                    Với trọng lượng chỉ {productDetail.weight} và kích thước {productDetail.dimension}, {productDetail.product.name} là một trong những laptop mỏng nhẹ
                                    nhất trong phân khúc. Thiết kế hiện đại với các tính năng {productDetail.specialFeatures} mang đến trải nghiệm sử dụng tuyệt vời.
                                </p>
                            </div>
                        </Card>
                    </TabPane>
                    <TabPane tab={`Đánh giá (${productDetail.totalRating})`} key="reviews">
                        <Card>
                            <div className="reviews-header">
                                <div className="rating-overview">
                                    <div className="rating-score">{productDetail.ratingAverage}</div>
                                    <div>
                                        <div className="stars-container">
                                            {renderStars(productDetail.ratingAverage)}
                                            <StarFilled className="star-half" />
                                        </div>
                                        <div className="rating-count">Dựa trên {productDetail.totalRating} đánh giá</div>
                                    </div>
                                </div>
                                <Button type="primary" onClick={() => setIsModalOpen(true)}
                                    >Viết đánh giá</Button>
                            </div>

                            <div className="reviews-list">
                                {isReviewsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0' }}><Spin /></div>
                                ) : (
                                    <div className="reviews-list">
                                        {reviews.length > 0 ? (
                                            reviews.map((review, index) => (
                                                <React.Fragment key={review.id}>
                                                    <ReviewItem
                                                        name={review.user.fullName}
                                                        rating={review.rating}
                                                        comment={review.comment}
                                                        date={formatDate(review.createdAt)}
                                                    />
                                                    {index < reviews.length - 1 && <Divider/>}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                                        )}
                                    </div>
                                )}

                                {pagination.totalPages > 1 && (
                                    <Pagination
                                        current={pagination.currentPage}
                                        total={pagination.totalElements}
                                        pageSize={pagination.pageSize}
                                        onChange={(page) => handlePageChange(page)}
                                        showSizeChanger={false}
                                        className="product-pagination"
                                        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`}
                                    />
                                )}
                            </div>
                            <RatingModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onSubmit={handleSubmitReview}
                            />
                        </Card>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

// Helper function to convert color names to hex values
const getColorHex = (colorName) => {
    const colorMap = {
        'Silver': '#C0C0C0',
        'Black': '#1a1a1a',
        'Blue': '#0066cc',
        'Red': '#ff0000',
        'Gold': '#ffd700',
        'White': '#ffffff',
        'Gray': '#808080',
        'Space Gray': '#717378',
        'Rose Gold': '#b76e79',
        'Green': '#008000',
        'Pink': '#ffc0cb'
    };
    return colorMap[colorName] || '#1a1a1a';
};

export default LaptopDetail;