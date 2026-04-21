import React, { useState, useEffect } from 'react';
import '../style/LaptopGrid.scss';
import LaptopCard from './LaptopCard';
import { Pagination } from 'antd';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useDispatch, useSelector } from "react-redux";
import { searchProductsDetail, getAllBrands, getAllCategories } from "../../Redux/actions/ProductThunk";
import {useParams} from "react-router-dom";

const LaptopGrid = () => {
    const dispatch = useDispatch();
    const {
        products,
        loading,
        error,
        categories,
        brands
    } = useSelector(state => state.ProductReducer);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortOption, setSortOption] = useState('name,asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const { text } = useParams();
    const [searchKeyword, setSearchKeyword] = useState(text || '');
    const [expanded, setExpanded] = useState({
        category: true,
        brand: true,
        price: true
    });

    // Fetch initial data
    useEffect(() => {
        dispatch(getAllBrands());
        dispatch(getAllCategories());
    }, [dispatch]);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        const [sortBy, sortDir] = sortOption.split(',');

        const params = {
            keyword: searchKeyword,
            categoryId: selectedCategories.join(','),
            brandId: selectedBrands.join(','),
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page: currentPage ,
            size: pageSize,
            sortBy,
            sortDir
        };

        dispatch(searchProductsDetail(params));
    }, [
        searchKeyword,
        selectedCategories,
        selectedBrands,
        priceRange,
        currentPage,
        pageSize,
        sortOption,
        dispatch
    ]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
        setCurrentPage(1);
    };

    const handleBrandChange = (brandId) => {
        setSelectedBrands(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
        setCurrentPage(1);
    };

    const handlePriceChange = (e, index, isMillion = false) => {
        const value = parseFloat(e.target.value) || 0;
        const newRange = [...priceRange];
        newRange[index] = isMillion ? value * 1000000 : value;
        setPriceRange(newRange);
        setCurrentPage(1);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, 50000000]);
        setSearchKeyword('');
        setSortOption('name,asc');
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            setCurrentPage(1);
        }
    };

    return (
        <div className="laptop-store-container">
            <div className="store-controls">
                <button
                    className="filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? <FiX /> : <FiFilter />}
                    {showFilters ? 'Đóng bộ lọc' : 'Bộ lọc'}
                </button>

                <div className="search-box">
                    <FiSearch className="search-icon" onClick={handleSearch} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm laptop..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={handleSearch}
                    />
                </div>
            </div>

            <div className="store-content">
                {showFilters && (
                    <div className="filters-sidebar">
                        <div className="filter-header">
                            <h2>Bộ lọc sản phẩm</h2>
                            <button className="close-filters" onClick={() => setShowFilters(false)}>
                                <span>×</span>
                            </button>
                        </div>
                        <div className="filter-section">
                            <div className="section-header"
                                 onClick={() => setExpanded(prev => ({...prev, category: !prev.category}))}>
                                <h3>
                                    <span>Danh mục</span>
                                    {selectedCategories.length > 0 && (
                                        <span className="filter-count">{selectedCategories.length}</span>
                                    )}
                                </h3>
                                {expanded.category ? <FiChevronUp/> : <FiChevronDown/>}
                            </div>

                            {expanded.category && (
                                <div className="filter-options">
                                    {categories?.data?.map(category => (
                                        <label key={category.id} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => handleCategoryChange(category.id)}
                                            />
                                            <span className="custom-checkbox"></span>
                                            <span className="option-label">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="filter-section">
                            <div className="section-header"
                                 onClick={() => setExpanded(prev => ({...prev, brand: !prev.brand}))}>
                                <h3>
                                    <span>Thương hiệu</span>
                                    {selectedBrands.length > 0 && (
                                        <span className="filter-count">{selectedBrands.length}</span>
                                    )}
                                </h3>
                                {expanded.brand ? <FiChevronUp/> : <FiChevronDown/>}
                            </div>

                            {expanded.brand && (
                                <div className="filter-options">
                                    {brands?.data?.map(brand => (
                                        <label key={brand.id} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={() => handleBrandChange(brand.id)}
                                            />
                                            <span className="custom-checkbox"></span>
                                            <span className="option-label">{brand.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="filter-section">
                            <div className="section-header"
                                 onClick={() => setExpanded(prev => ({...prev, price: !prev.price}))}>
                                <h3>Khoảng giá</h3>
                                {expanded.price ? <FiChevronUp/> : <FiChevronDown/>}
                            </div>

                            {expanded.price && (
                                <div className="price-filter">
                                    <div className="price-inputs">
                                        <div className="price-input-group">
                                            <label>Từ (triệu đồng)</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="number"
                                                    value={priceRange[0] / 1000000}
                                                    onChange={(e) => handlePriceChange(e, 0, true)}
                                                    min="0"
                                                    max={priceRange[1] / 1000000}
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>

                                        <div className="price-input-group">
                                            <label>Đến (triệu đồng)</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="number"
                                                    value={priceRange[1] / 1000000}
                                                    onChange={(e) => handlePriceChange(e, 1, true)}
                                                    min={priceRange[0] / 1000000}
                                                    max="50"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="price-slider-container">
                                        <div className="price-labels">
                                            <span>0đ</span>
                                            <span>25tr</span>
                                            <span>50tr</span>
                                        </div>
                                        <div className="price-slider">
                                            <input
                                                type="range"
                                                min="0"
                                                max="50000000"
                                                value={priceRange[0]}
                                                onChange={(e) => handlePriceChange(e, 0)}
                                                className="range-min"
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="50000000"
                                                value={priceRange[1]}
                                                onChange={(e) => handlePriceChange(e, 1)}
                                                className="range-max"
                                            />
                                        </div>
                                    </div>

                                    <div className="selected-range">
                                        Khoảng giá: {(priceRange[0] / 1000000).toFixed(1)}tr - {(priceRange[1] / 1000000).toFixed(1)}tr
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="filter-actions">
                            <button className="reset-filters" onClick={resetFilters}>
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}

                <div className="laptops-grid">
                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : error ? (
                        <div className="error">Lỗi: {error}</div>
                    ) : products?.content?.length > 0 ? (
                        <>
                            <div className="grid-header">
                                <p>Tìm thấy {products.totalElements} sản phẩm</p>
                                <div className="sort-options">
                                    <label>Sắp xếp:</label>
                                    <select value={sortOption} onChange={handleSortChange}>
                                        <option value="name,asc">Tên A-Z</option>
                                        <option value="name,desc">Tên Z-A</option>
                                        <option value="price,asc">Giá tăng dần</option>
                                        <option value="price,desc">Giá giảm dần</option>
                                        <option value="rating,desc">Đánh giá cao</option>
                                        <option value="createdAt,desc">Mới nhất</option>
                                    </select>
                                </div>
                            </div>

                            <div className="laptop-cards">
                                {products.content.map(laptop => (
                                    <LaptopCard key={laptop.id} laptop={laptop}/>
                                ))}
                            </div>

                            {products.totalElements > pageSize && (
                                <div className="pagination-wrapper">
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={products.totalElements}
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                        responsive
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-results">
                            <h3>Không tìm thấy sản phẩm phù hợp</h3>
                            <p>Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                            <button onClick={resetFilters}>Xóa bộ lọc</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LaptopGrid;