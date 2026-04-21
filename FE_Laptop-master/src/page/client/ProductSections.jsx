import React, { useState, useEffect } from 'react';
import { Zap, Star, Clock } from 'lucide-react';
import '../style/ProductSections.css';
import { Badge, Button, Card, Image, Tag, message } from "antd";
import { useDispatch } from "react-redux";
import { getAllProductFeature, searchProducts } from "../../Redux/actions/ProductThunk";

const ProductSections = () => {
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [bestsellerProducts, setBestsellerProducts] = useState([]);
    const [featureProducts, setFeatureProduct] = useState([]);
    const [loading, setLoading] = useState({
        flashSale: false,
        bestseller: false,
        feature: false,
    });
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('24:00:00');
    const dispatch = useDispatch();
    const [userData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Calculate time remaining until midnight
    const updateCountdown = () => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    };

    // Render product name with full specs
    const renderProductName = (product) => {
        const specs = [
            product.name,
            product.code,
            product.cpu,
            product.ram,
            product.storage,
            product.gpu
        ].filter(Boolean).join(' ');

        return specs;
    };

    // Render specifications as tags
    const renderSpecTags = (product) => {
        const specs = [];
        if (product.cpu) specs.push(`CPU: ${product.cpu}`);
        if (product.ram) specs.push(`RAM: ${product.ram}`);
        if (product.storage) specs.push(`Ổ cứng: ${product.storage}`);
        if (product.gpu) specs.push(`GPU: ${product.gpu}`);
        if (product.screen) specs.push(`Màn hình: ${product.screen}`);

        return (
            <div className="spec-tags-container-home-screen">
                {specs.slice(0, 3).map((spec, index) => (
                    <Tag key={index} className="spec-tag-home-screen">
                        {spec}
                    </Tag>
                ))}
            </div>
        );
    };

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch flash sale products
                setLoading(prev => ({ ...prev, flashSale: true }));
                const flashSaleResponse = await dispatch(searchProducts({ size: 4 }));
                setFlashSaleProducts(flashSaleResponse?.content || []);

                // Fetch bestseller products
                setLoading(prev => ({ ...prev, bestseller: true }));
                const bestsellerResponse = await dispatch(searchProducts({ size: 8 }));
                setBestsellerProducts(bestsellerResponse?.content || []);

                // Fetch feature products
                setLoading(prev => ({ ...prev, feature: true }));
                const feature = await dispatch(getAllProductFeature(userData?.id || 0));
                setFeatureProduct(feature?.content || []);

            } catch (err) {
                setError("Lỗi khi tải dữ liệu sản phẩm");
                message.error("Lỗi khi tải dữ liệu sản phẩm");
            } finally {
                setLoading({
                    flashSale: false,
                    bestseller: false,
                    feature: false
                });
            }
        };

        fetchProducts();
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [dispatch, userData?.id]);

    return (
        <>
            {/* Sản phẩm gợi ý */}
            <section className="featured-products-section">
                <div className="container">
                    <div className="section-header">
                        <div className="title-wrapper">
                            <h2 className="section-title">Sản phẩm có thể bạn quan tâm</h2>
                        </div>
                    </div>

                    {loading.feature ? (
                        <div className="loading-container-home-screen">Đang tải sản phẩm...</div>
                    ) : error ? (
                        <div className="error-container-home-screen">{error}</div>
                    ) : (
                        <div className="products-grid-home-screen">
                            {featureProducts.slice(0, 4).map((product) => (
                                <Card key={product.id} className="product-card-home-screen"
                                      onClick={() => window.location.href = `/products/${product.id}`}
                                >
                                    <div className="image-container-home-screen">
                                        {product.discountPercentage && (
                                            <Badge.Ribbon
                                                text={`-${Math.round(product.discountPercentage)}%`}
                                                color="#ff4d4f"
                                                className="discount-badge-home-screen"
                                            >
                                                <Image
                                                    src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                                    preview={false}
                                                    alt={product.name}
                                                    className="product-image-home-screen"
                                                    onError={(e) => {
                                                        e.target.src = '/products/default-laptop.jpg';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </Badge.Ribbon>
                                        )}
                                        {!product.discountPercentage && (
                                            <Image
                                                src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                                preview={false}
                                                alt={product.name}
                                                className="product-image-home-screen"
                                                onError={(e) => {
                                                    e.target.src = '/products/default-laptop.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="product-content-home-screen">
                                        <h3 className="product-name-home-screen" >
                                            {renderProductName(product)}
                                        </h3>
                                        {renderSpecTags(product)}
                                        <div className="price-container-home-screen">
                                            <span className="current-price-home-screen">
                                                {formatPrice(product.price || 0)}
                                            </span>
                                            {product.discountPercentage && (
                                                <span className="old-price-home-screen">
                                                    {formatPrice(product.price * (1 + product.discountPercentage / 100))}
                                                </span>
                                            )}
                                        </div>
                                        <div className="rating-container-home-screen">
                                            <div className="rating-home-screen">
                                                <Star className="star-icon-home-screen" size={14} />
                                                <span>{product.ratingAverage?.toFixed(1) || '5.0'}</span>
                                            </div>
                                            <span className="divider-home-screen">|</span>
                                            <span className="sold">Đã bán {product.salesCount || 0}+</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Flash Sale Section */}
            <section className="flash-sale-section">
                <div className="container">
                    <div className="section-header">
                        <div className="title-wrapper">
                            <Zap className="flash-icon" size={20} />
                            <h2 className="section-title-home">Flash Sale</h2>
                        </div>
                        <div className="countdown-timer">
                            <Clock className="timer-icon" size={16} />
                            <span>Kết thúc sau:</span>
                            <span className="time-remaining">{timeRemaining}</span>
                        </div>
                    </div>

                    {loading.flashSale ? (
                        <div className="loading-container-home-screen">Đang tải sản phẩm flash sale...</div>
                    ) : error ? (
                        <div className="error-container-home-screen">{error}</div>
                    ) : (
                        <div className="products-grid-home-screen">
                            {flashSaleProducts.slice(0, 4).map((product) => (
                                <Card key={product.id} className="product-card-home-screen"
                                      onClick={() => window.location.href = `/products/${product.id}`}
                                >
                                    <div className="image-container-home-screen">
                                        {product.discountPercentage && (
                                            <Badge.Ribbon
                                                text={`-${Math.round(product.discountPercentage)}%`}
                                                color="#ff4d4f"
                                                className="discount-badge-home-screen"
                                            >
                                                <Image
                                                    src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                                    preview={false}
                                                    alt={product.name}
                                                    className="product-image-home-screen"
                                                    onError={(e) => {
                                                        e.target.src = '/products/default-laptop.jpg';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </Badge.Ribbon>
                                        )}
                                        {!product.discountPercentage && (
                                            <Image
                                                src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                                preview={false}
                                                alt={product.name}
                                                className="product-image-home-screen"
                                                onError={(e) => {
                                                    e.target.src = '/products/default-laptop.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="product-content-home-screen">
                                        <h3 className="product-name-home-screen">
                                            {renderProductName(product)}
                                        </h3>
                                        {renderSpecTags(product)}
                                        <div className="price-container-home-screen">
                                            <span className="current-price-home-screen">
                                                {formatPrice(product.price || 0)}
                                            </span>
                                            <span className="old-price-home-screen">
                                                {formatPrice(product.price * 1.1)}
                                            </span>
                                        </div>
                                        <div className="rating-container-home-screen">
                                            <div className="rating-home-screen">
                                                <Star className="star-icon-home-screen" size={14} />
                                                <span>{product.ratingAverage?.toFixed(1) || '5.0'}</span>
                                            </div>
                                            <span className="divider-home-screen">|</span>
                                            <span className="sold">Đã bán {product.salesCount || 0}+</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="view-all-container-home-screen">
                        <Button
                            type="primary"
                            className="view-all-button-home-screen"
                            onClick={() => window.location.href = '/flash-sale'}
                        >
                            Xem tất cả
                        </Button>
                    </div>
                </div>
            </section>

            {/* Sản phẩm nổi bật */}
            <section className="featured-products-section">
                <div className="container">
                    <div className="tabs-header">
                        <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
                    </div>
                    <div className="products-grid-home-screen">
                        {bestsellerProducts.slice(0, 8).map((product) => (
                            <Card key={product.id} className="product-card-home-screen"
                                  onClick={() => window.location.href = `/products/${product.id}`}
                            >
                                <div className="image-container-home-screen">
                                    {product.discountPercentage && (
                                        <Badge.Ribbon
                                            text={`-${Math.round(product.discountPercentage)}%`}
                                            color="#ff4d4f"
                                            className="discount-badge-home-screen"
                                        >
                                            <Image
                                                src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                                alt={product.name}
                                                preview={false}
                                                className="product-image-home-screen"
                                            />
                                        </Badge.Ribbon>
                                    )}
                                    {!product.discountPercentage && (
                                        <Image
                                            src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                                            alt={product.name}
                                            preview={false}
                                            className="product-image-home-screen"
                                        />
                                    )}
                                </div>
                                <div className="product-content-home-screen">
                                    <h3 className="product-name-home-screen">
                                        {renderProductName(product)}
                                    </h3>
                                    {renderSpecTags(product)}
                                    <div className="price-container-home-screen">
                                        <span className="current-price-home-screen">
                                            {formatPrice(product?.price || 0)}
                                        </span>
                                        <span className="old-price-home-screen">
                                            {formatPrice(product.price * 1.1)}
                                        </span>
                                    </div>
                                    <div className="rating-container-home-screen">
                                        <div className="rating-home-screen">
                                            <Star className="star-icon-home-screen" size={14} />
                                            <span>{product.ratingAverage?.toFixed(1) || '5.0'}</span>
                                        </div>
                                        <span className="divider-home-screen">|</span>
                                        <span className="sold">Đã bán {product.salesCount || 0}+</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="view-all-container-home-screen">
                        <Button
                            type="primary"
                            className="view-all-button-home-screen"
                            onClick={() => window.location.href = '/search'}
                        >
                            Xem tất cả sản phẩm
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductSections;