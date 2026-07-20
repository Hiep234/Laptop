import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./SearchBar.scss";
import { searchMovies } from "../../Redux/actions/MovieThunk";
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
            const response = await dispatch(searchMovies({ keyword, size: 100 }));

            setResults(response.content || []);
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

    const handleMovieClick = (slug) => {
        window.location.href = `/detail/${slug}`;
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "Đang cập nhật";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m} phút` : ""}`.trim();
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
                    <div className="search-section-title">Danh sách phim</div>
                    {results.map((movie, index) => (
                        <div
                            className="search-item"
                            key={movie.id || index}
                            onClick={() => handleMovieClick(movie.slug)}
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                                backgroundColor: hoveredItem === index ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                transform: hoveredItem === index ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            <img
                                src={movie.posterUrl || '/default-poster.jpg'}
                                alt={movie.title}
                                style={{
                                    transform: hoveredItem === index ? 'scale(1.05)' : 'scale(1)'
                                }}
                            />
                            <div className="movie-info">
                                <div
                                    className="movie-title"
                                    style={{
                                        color: hoveredItem === index ? '#ff5e00' : 'inherit'
                                    }}
                                >
                                    {movie.title}
                                </div>
                                <div className="movie-meta">
                                    {movie.episodeCount && `• T${movie.episodeCount} `}
                                    {movie.releaseYear && `• ${movie.releaseYear} `}
                                    • {formatDuration(movie.duration)}
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