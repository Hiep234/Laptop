// SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, History, Star } from "lucide-react";
import "../style/SearchBar.css";
import { Button, Input, Modal, List, Divider, Tag, Image } from "antd";
import { searchProducts, getFeaturedProducts } from "../../Redux/actions/ProductThunk";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const searchContainerRef = useRef(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Load search history and featured products
    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }

    }, [dispatch]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsPreviewVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle search when query changes
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetchSearchResults(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const fetchSearchResults = async (keyword) => {
        try {
            setLoading(true);
            setError(null);
            const response = await dispatch(searchProducts({ keyword, size: 5 }));
            setResults(response?.content || []);
        } catch (err) {
            setError("Lỗi khi tìm kiếm dữ liệu");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const updatedHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 5);
            setSearchHistory(updatedHistory);
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
            navigate(`/search/${searchQuery}`);
            setIsPreviewVisible(false);
        }
        else{
            window.location.href = '/search';
        }
    };

    const handleHistoryItemClick = (item) => {
        setSearchQuery(item);
        setIsPreviewVisible(false);
        setIsOpen(true);
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
        setIsOpen(false);
        setIsPreviewVisible(false);
    };

    return (
        <div className="search-bar-container" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="search-form">
                <Input
                    type="text"
                    placeholder="Tìm kiếm laptop..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsPreviewVisible(true)}
                    suffix={
                        <Button
                            htmlType="submit"
                            type="text"
                            icon={<Search size={16} />}
                            loading={loading}
                        />
                    }
                />
            </form>

            {isPreviewVisible && (
                <div className="search-preview">
                    {searchQuery ? (
                        <>
                            <div className="preview-section">
                                <h3 className="preview-title">Kết quả tìm kiếm</h3>
                                <div className="preview-content">
                                    {results.slice(0, 3).map((product) => (
                                        <div
                                            key={product.id}
                                            className="preview-item"
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            {product.productVariant.imageUrl && (
                                                <Image
                                                    src={product.productVariant.imageUrl}
                                                    alt={product.product.name}
                                                    width={80}
                                                    height={60}
                                                    preview={false}
                                                />
                                            )}
                                            <div className="preview-info">
                                                <h4>{product.product.name}</h4>
                                                <p className="text-sm">
                                                    {`${product.cpu}, ${product.gpu}, ${product.ram}, ${product.storage}`}
                                                </p>

                                                <p className="text-primary">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(product.price || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                        </>
                    ) : (
                        <>
                            <div className="preview-section">
                                <h3 className="preview-title">Lịch sử tìm kiếm</h3>
                                {searchHistory.length > 0 ? (
                                    <List
                                        dataSource={searchHistory}
                                        renderItem={(item) => (
                                            <List.Item
                                                onClick={() => handleHistoryItemClick(item)}
                                                className="history-item"
                                            >
                                                <History size={14} className="mr-2" />
                                                <span>{item}</span>
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <p className="text-muted">Không có lịch sử tìm kiếm</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;