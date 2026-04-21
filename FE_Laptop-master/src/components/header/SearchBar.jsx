import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./SearchBar.scss";
import { searchProducts } from "../../Redux/actions/ProductThunk";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null); // State để theo dõi item đang hover
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            return;
        }
        const delayDebounce = setTimeout(() => {
            fetchSearchResults(query);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const fetchSearchResults = async (keyword) => {
        try {
            setLoading(true);
            setError(null);
            const response = await dispatch(searchProducts({ keyword, size: 5 }));

            setResults(response.content || response || []);
        } catch (err) {
            setError("Lỗi khi tìm kiếm dữ liệu");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
    };

    const handleProductClick = (id) => {
        window.location.href = `/products/${id}`;
    };

    const formatPrice = (price) => {
        if (!price) return "Đang cập nhật";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/search/${encodeURIComponent(query.trim())}`);
            setQuery("");
            setResults([]);
        }
    };
    return (
        <div className="search-container">
            <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={query}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && <FaTimes className="clear-icon" onClick={clearSearch} />}
            </div>

            {loading && <div className="search-loading">Đang tìm kiếm...</div>}
            {error && <div className="search-error">{error}</div>}

            {results.length > 0 && (
                <div className="search-results">
                    <div className="search-section-title">Sản phẩm gợi ý</div>
                    {Array.isArray(results) && results.map((product, index) => (
                        <div
                            className="search-item"
                            key={product.id || index}
                            onClick={() => handleProductClick(product.id)}
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                backgroundColor: hoveredItem === index ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                            }}
                        >
                            <img
                                src={product.imageUrl || '/default-laptop.jpg'}
                                alt={product.name}
                                style={{
                                    transform: hoveredItem === index ? 'scale(1.05)' : 'scale(1)'
                                }}
                            />
                            <div className="product-info">
                                <div
                                    className="product-title"
                                    style={{
                                        color: hoveredItem === index ? 'var(--primary-color)' : 'var(--text-color)'
                                    }}
                                >
                                    {product.name}
                                </div>
                                <div className="product-meta">
                                    {formatPrice(product.price)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;