import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spin } from 'antd';
import {
    DownOutlined
} from '@ant-design/icons';
import { getProductDetailById } from '../../Redux/actions/ProductThunk';
import { searchProducts } from '../../Redux/actions/ProductThunk';
import { useCompare } from '../../Utils/CompareContext';
import '../style/CompareLaptop.css';

const CompareLaptop = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { removeFromCompare, addToCompare, compareList } = useCompare();

    const [product1, setProduct1] = useState(null);
    const [product2, setProduct2] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const id1 = searchParams.get('id1');
    const id2 = searchParams.get('id2');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const promises = [];
            if (id1) promises.push(dispatch(getProductDetailById(id1)));
            if (id2) promises.push(dispatch(getProductDetailById(id2)));

            const results = await Promise.all(promises);
            if (results[0]) setProduct1(results[0]);
            if (results[1]) setProduct2(results[1]);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [id1, id2, dispatch]);

    useEffect(() => {
        if (id1 || id2) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [fetchProducts, id1, id2]);

    // Initialize all groups as expanded
    useEffect(() => {
        const groups = {};
        specGroups.forEach(g => { groups[g.key] = true; });
        setExpandedGroups(groups);
    }, []);

    const handleSearch = async (keyword) => {
        setSearchQuery(keyword);
        if (!keyword.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await dispatch(searchProducts({ keyword, size: 5 }));
            setSearchResults(res?.content || []);
        } catch (e) {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        addToCompare({
            id: product.id,
            name: product.product.name,
            image: product.productVariant?.imageUrl
        });
        const currentId1 = id1 || compareList[0]?.id;
        navigate(`/compare?id1=${currentId1}&id2=${product.id}`);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveProduct = (num) => {
        if (num === 1 && product1) {
            removeFromCompare(parseInt(id1));
            if (id2) {
                navigate(`/compare?id1=${id2}`);
            } else {
                navigate('/compare');
            }
            setProduct1(null);
        } else if (num === 2 && product2) {
            removeFromCompare(parseInt(id2));
            navigate(`/compare?id1=${id1}`);
            setProduct2(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getOptionSpec = (product, key) => {
        if (!product) return '';
        const option = product.productOptions?.[0];
        if (option && option[key]) return option[key];
        return '';
    };

    const getSpec = (product, key) => {
        if (!product) return '';
        return product[key] || '';
    };

    const getPrice = (product) => {
        if (!product) return 0;
        return product.productOptions?.[0]?.price || 0;
    };

    const specGroups = [
        {
            key: 'performance',
            title: 'Hiệu năng',
            specs: [
                { label: 'CPU', get: (p) => getOptionSpec(p, 'cpu') },
                { label: 'RAM', get: (p) => getOptionSpec(p, 'ram') },
                { label: 'Loại RAM', get: (p) => getSpec(p, 'ramType') },
                { label: 'Khe RAM', get: (p) => getSpec(p, 'ramSlot') },
                { label: 'Ổ cứng', get: (p) => getOptionSpec(p, 'storage') },
                { label: 'Nâng cấp ổ cứng', get: (p) => getSpec(p, 'storageUpgrade') },
                { label: 'Card đồ họa', get: (p) => getOptionSpec(p, 'gpu') },
            ]
        },
        {
            key: 'display',
            title: 'Màn hình',
            specs: [
                { label: 'Kích thước', get: (p) => getSpec(p, 'displaySize') },
                { label: 'Độ phân giải', get: (p) => getSpec(p, 'displayResolution') },
                { label: 'Tần số quét', get: (p) => getSpec(p, 'displayRefreshRate') },
                { label: 'Công nghệ', get: (p) => getSpec(p, 'displayTechnology') },
            ]
        },
        {
            key: 'design',
            title: 'Thiết kế',
            specs: [
                { label: 'Kích thước', get: (p) => getSpec(p, 'dimension') },
                { label: 'Trọng lượng', get: (p) => getSpec(p, 'weight') },
                { label: 'Bàn phím', get: (p) => getSpec(p, 'keyboard') },
                { label: 'Webcam', get: (p) => getSpec(p, 'webcam') },
            ]
        },
        {
            key: 'connectivity',
            title: 'Kết nối',
            specs: [
                { label: 'Cổng kết nối', get: (p) => getSpec(p, 'ports') },
                { label: 'WiFi', get: (p) => getSpec(p, 'wifi') },
                { label: 'Bluetooth', get: (p) => getSpec(p, 'bluetooth') },
            ]
        },
        {
            key: 'other',
            title: 'Thông tin khác',
            specs: [
                { label: 'Hệ điều hành', get: (p) => getSpec(p, 'operatingSystem') },
                { label: 'Pin', get: (p) => getSpec(p, 'battery') },
                { label: 'Bảo mật', get: (p) => getSpec(p, 'security') },
                { label: 'Âm thanh', get: (p) => getSpec(p, 'audioFeatures') },
                { label: 'Tính năng đặc biệt', get: (p) => getSpec(p, 'specialFeatures') },
            ]
        },
    ];

    if (loading) {
        return (
            <div className="compare-page">
                <div className="compare-hero">
                    <h1>So sánh Laptop</h1>
                    <p>Đang tải dữ liệu so sánh...</p>
                </div>
                <div className="compare-content">
                    <div className="compare-loading">
                        <Spin size="large" />
                        <p>Đang tải thông tin sản phẩm...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!id1 && !id2) {
        return (
            <div className="compare-page">
                <div className="compare-hero">
                    <h1>So sánh Laptop</h1>
                    <p>So sánh chi tiết thông số kỹ thuật giữa 2 laptop</p>
                </div>
                <div className="compare-content">
                    <div className="compare-empty">
                        <h2>Chưa có sản phẩm nào để so sánh</h2>
                        <p>Hãy chọn sản phẩm từ trang chi tiết hoặc danh sách sản phẩm</p>
                        <button
                            className="compare-empty-btn"
                            onClick={() => navigate('/search')}
                        >
                            Tìm sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderProductCard = (product, num) => {
        if (!product) {
            return (
                <div className="compare-add-product" onClick={() => setShowSearch(!showSearch)}>
                    <div className="compare-add-icon">
                        +
                    </div>
                    <h3>Thêm sản phẩm so sánh</h3>
                    <p>Chọn laptop thứ 2 để so sánh</p>

                    {showSearch && (
                        <div className="compare-search-wrapper" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                className="compare-search-input"
                                placeholder="Tìm kiếm laptop..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
                            {searchLoading && <div style={{ textAlign: 'center', padding: 8 }}><Spin size="small" /></div>}
                            <div className="compare-search-results">
                                {searchResults.map((item) => (
                                    <div
                                        key={item.id}
                                        className="compare-search-item"
                                        onClick={() => handleSelectProduct(item)}
                                    >
                                        <img src={item.productVariant?.imageUrl} alt={item.product?.name} />
                                        <div className="compare-search-item-info">
                                            <h4>{item.product?.name}</h4>
                                            <p>{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="compare-product-card">
                <div className="compare-product-image-wrapper">
                    <img
                        className="compare-product-image"
                        src={product.product?.images?.[0]?.url}
                        alt={product.product?.name}
                    />
                </div>
                <h2 className="compare-product-name">{product.product?.name}</h2>
                <p className="compare-product-config">
                    {getOptionSpec(product, 'cpu')} | {getOptionSpec(product, 'ram')} | {getOptionSpec(product, 'storage')}
                </p>
                <div className="compare-product-rating">
                    ★ {product.ratingAverage || 0} ({product.totalRating || 0})
                </div>
                <div className="compare-product-price">{formatPrice(getPrice(product))}</div>
                <div className="compare-product-price-old">{formatPrice(getPrice(product) * 1.1)}</div>
                <div className="compare-product-actions">
                    <button
                        className="compare-btn-buy"
                        onClick={() => navigate(`/products/${product.productOptions?.[0]?.id || id1}`)}
                    >
                        Xem chi tiết
                    </button>
                    <button
                        className="compare-btn-remove"
                        onClick={() => handleRemoveProduct(num)}
                    >
                        Xoá
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="compare-page">
            <div className="compare-hero">
                <h1>So sánh Laptop</h1>
                <p>So sánh chi tiết thông số kỹ thuật giữa 2 laptop</p>
            </div>

            <div className="compare-content">
                {/* Product cards */}
                <div className="compare-products-header">
                    {renderProductCard(product1, 1)}
                    {renderProductCard(product2, 2)}
                </div>

                {/* Specs comparison */}
                {product1 && product2 && (
                    <div className="compare-specs-section">
                        {specGroups.map(group => (
                            <div key={group.key} className="compare-specs-group">
                                <div
                                    className="compare-specs-group-header"
                                    onClick={() => toggleGroup(group.key)}
                                >

                                    <span className="compare-specs-group-title">{group.title}</span>
                                    <DownOutlined
                                        className={`compare-specs-group-toggle ${expandedGroups[group.key] ? 'expanded' : ''}`}
                                    />
                                </div>

                                {expandedGroups[group.key] && group.specs.map((spec, idx) => {
                                    const val1 = spec.get(product1);
                                    const val2 = spec.get(product2);
                                    const isDiff = val1 && val2 && val1.toString().trim().toLowerCase() !== val2.toString().trim().toLowerCase();

                                    if (!val1 && !val2) return null;

                                    return (
                                        <div key={idx} className={`compare-spec-row ${isDiff ? 'diff' : ''}`}>
                                            <div className="compare-spec-label">
                                                {spec.label}
                                            </div>
                                            <div className="compare-spec-value">
                                                {val1 || '—'}
                                            </div>
                                            <div className="compare-spec-value">
                                                {val2 || '—'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {product1 && product2 && (
                    <div className="compare-summary">
                        <div className="compare-summary-card">
                            <h3>
                                {product1.product?.name}
                                {getPrice(product1) < getPrice(product2) && (
                                    <span className="compare-verdict-badge better">
                                        Giá tốt hơn
                                    </span>
                                )}
                            </h3>
                            <ul className="compare-diff-list">
                                <li>CPU: {getOptionSpec(product1, 'cpu')}</li>
                                <li>RAM: {getOptionSpec(product1, 'ram')}</li>
                                <li>GPU: {getOptionSpec(product1, 'gpu')}</li>
                                <li>Giá: {formatPrice(getPrice(product1))}</li>
                            </ul>
                        </div>
                        <div className="compare-summary-card">
                            <h3>
                                {product2.product?.name}
                                {getPrice(product2) < getPrice(product1) && (
                                    <span className="compare-verdict-badge better">
                                        Giá tốt hơn
                                    </span>
                                )}
                            </h3>
                            <ul className="compare-diff-list">
                                <li>CPU: {getOptionSpec(product2, 'cpu')}</li>
                                <li>RAM: {getOptionSpec(product2, 'ram')}</li>
                                <li>GPU: {getOptionSpec(product2, 'gpu')}</li>
                                <li>Giá: {formatPrice(getPrice(product2))}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompareLaptop;
