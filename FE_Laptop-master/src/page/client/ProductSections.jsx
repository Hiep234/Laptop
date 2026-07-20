import React, { useState, useEffect } from 'react';
import { Zap, Star, Clock, ArrowRight, Eye } from 'lucide-react';
import '../style/ProductSections.css';
import { Button, Card, Image, message } from "antd";
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
    const [countdownBlocks, setCountdownBlocks] = useState({ hours: '00', minutes: '00', seconds: '00' });
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

        setCountdownBlocks({
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0')
        });
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
        if (product.cpu) specs.push({ label: 'CPU', value: product.cpu });
        if (product.ram) specs.push({ label: 'RAM', value: product.ram });
        if (product.storage) specs.push({ label: 'SSD', value: product.storage });
        
        return (
            <div className="spec-badges-container">
                {specs.slice(0, 3).map((spec, index) => (
                    <span key={index} className="spec-badge-pill">
                        <span className="spec-badge-label">{spec.label}</span>
                        <span className="spec-badge-val">{spec.value}</span>
                    </span>
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

    const ProductCard = ({ product, showDiscount = true }) => {
        const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
        return (
            <Card 
                className="laptop-showcase-card"
                onClick={() => window.location.href = `/products/${product.id}`}
                cover={
                    <div className="card-image-box">
                        {showDiscount && hasDiscount && (
                            <div className="discount-tag-ribbon">
                                -{Math.round(product.discountPercentage)}%
                            </div>
                        )}
                        <Image
                            src={product.productVariant?.imageUrl || '/products/default-laptop.jpg'}
                            preview={false}
                            alt={product.name}
                            className="card-main-image"
                            onError={(e) => {
                                e.target.src = '/products/default-laptop.jpg';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="card-hover-action-overlay">
                            <span className="hover-action-btn">
                                <Eye size={16} /> Xem chi tiết
                            </span>
                        </div>
                    </div>
                }
            >
                <div className="card-body-wrapper">
                    <h3 className="card-product-title" title={renderProductName(product)}>
                        {renderProductName(product)}
                    </h3>
                    
                    {renderSpecTags(product)}
                    
                    <div className="card-price-details">
                        <span className="card-price-current">
                            {formatPrice(product.price || 0)}
                        </span>
                        {hasDiscount && (
                            <span className="card-price-old">
                                {formatPrice(product.price * (1 + product.discountPercentage / 100))}
                            </span>
                        )}
                    </div>
                    
                    <div className="card-footer-stats">
                        <div className="card-rating-block">
                            <Star className="star-rating-icon" size={14} />
                            <span>{product.ratingAverage?.toFixed(1) || '5.0'}</span>
                        </div>
                        <span className="card-sold-count">Đã bán {product.salesCount || 0}+</span>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="home-product-sections-container">
            {/* Flash Sale Section */}
            <section className="flash-sale-wrapper">
                <div className="grid-container">
                    <div className="flash-sale-header-block">
                        <div className="header-title-info">
                            <div className="header-icon-glow">
                                <Zap className="pulse-icon" size={24} />
                            </div>
                            <h2 className="header-title-text">DEAL SỐC MỖI NGÀY</h2>
                        </div>
                        <div className="countdown-timer-group">
                            <Clock size={16} className="clock-icon" />
                            <span className="timer-label">Kết thúc sau:</span>
                            <div className="timer-blocks">
                                <span className="time-block">{countdownBlocks.hours}</span>
                                <span className="time-colon">:</span>
                                <span className="time-block">{countdownBlocks.minutes}</span>
                                <span className="time-colon">:</span>
                                <span className="time-block">{countdownBlocks.seconds}</span>
                            </div>
                        </div>
                    </div>

                    {loading.flashSale ? (
                        <div className="loading-container-home-screen">Đang tải sản phẩm flash sale...</div>
                    ) : error ? (
                        <div className="error-container-home-screen">{error}</div>
                    ) : (
                        <div className="products-grid-home-screen">
                            {flashSaleProducts.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="view-all-container-home-screen">
                        <Button
                            type="primary"
                            className="view-all-button-home-screen flash-sale-btn"
                            onClick={() => window.location.href = '/flash-sale'}
                        >
                            Xem tất cả flash sale <ArrowRight size={16} style={{ marginLeft: 8 }} />
                        </Button>
                    </div>
                </div>
            </section>



            {/* Sản phẩm nổi bật */}
            <section className="product-grid-wrapper bg-soft-gray">
                <div className="grid-container">
                    <div className="grid-section-header">
                        <h2 className="grid-section-title">Sản Phẩm Bán Chạy Nhất</h2>
                        <div className="header-decor-line"></div>
                    </div>
                    
                    {loading.bestseller ? (
                        <div className="loading-container-home-screen">Đang tải sản phẩm bán chạy...</div>
                    ) : (
                        <div className="products-grid-home-screen">
                            {bestsellerProducts.slice(0, 8).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="view-all-container-home-screen">
                        <Button
                            type="primary"
                            className="view-all-button-home-screen normal-grid-btn"
                            onClick={() => window.location.href = '/search'}
                        >
                            Xem tất cả sản phẩm <ArrowRight size={16} style={{ marginLeft: 8 }} />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductSections;