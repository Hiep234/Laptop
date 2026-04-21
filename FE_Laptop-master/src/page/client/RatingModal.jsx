import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import '../style/RatingModal.css'; // Tạo file CSS riêng cho modal

const RatingModal = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    if (!isOpen) return null;

    if (userData === null) return (
        <div className="modal-overlay">
            <div className="rating-modal">
                <button className="close-button-modal" onClick={onClose}>
                    &times;
                </button>
                <h2>Yêu cầu đăng nhập</h2>
                <p>Bạn cần đăng nhập để có thể đánh giá sản phẩm.</p>
            </div>
        </div>
    );

    const handleSubmit = () => {
        onSubmit({ rating, review: reviewText });
        setRating(0);
        setReviewText('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="rating-modal">
                <button className="close-button-modal" onClick={onClose}>
                    &times;
                </button>

                <h2>Đánh giá của bạn</h2>

                <div className="stars-container-modal">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="star-modal"
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    size={40}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>

                <p className="rating-text-modal">
                    {rating === 0 ? "Chọn số sao đánh giá" : `Bạn đã chọn ${rating} sao`}
                </p>

                <div className="review-section-modal">
                    <textarea
                        className="review-textarea-modal"
                        placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm/dịch vụ..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </div>

                <button
                    className="submit-button-modal"
                    onClick={handleSubmit}
                    disabled={rating === 0}
                >
                    Gửi đánh giá
                </button>
            </div>
        </div>
    );
};

export default RatingModal;