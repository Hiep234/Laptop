import React from 'react';
import '../style/LaptopCard.scss';
import {Star} from "lucide-react";
import {useCompare} from '../../Utils/CompareContext';
import {SwapOutlined} from '@ant-design/icons';

const LaptopCard = ({ laptop }) => {
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const inCompare = isInCompare(laptop.id);

    const discountPercentage = laptop.price
        ? Math.round(((laptop.price * 1.1 - laptop.price) / (laptop.price * 1.1)) * 100)
        : 0;

    const handleCompareToggle = (e) => {
        e.stopPropagation();
        if (inCompare) {
            removeFromCompare(laptop.id);
        } else {
            addToCompare({
                id: laptop.id,
                name: laptop.product.name,
                image: laptop.productVariant?.imageUrl
            });
        }
    };

    return (
        <div
            className="laptop-card"
            onClick={() => window.location.href = `/products/${laptop.id}`}
        >
            {discountPercentage > 0 && (
                <div className="discount-badge">-{discountPercentage}%</div>
            )}

            <div className="card-badge">{laptop.product.brand.name.toUpperCase()}</div>

            <div className="card-image">
                <button
                    className={`compare-toggle-btn ${inCompare ? 'active' : ''}`}
                    onClick={handleCompareToggle}
                    title={inCompare ? 'Bỏ so sánh' : 'Thêm so sánh'}
                >
                    <SwapOutlined />
                </button>
                <img
                    src={laptop.productVariant.imageUrl}
                    alt={laptop.name}
                    loading="lazy"
                />
            </div>

            <div className="card-content">
                <h3 className="card-title">{laptop.product.name}</h3>

                <div className="card-specs">
                    <p><strong>CPU:</strong> {laptop.cpu}</p>
                    <p><strong>RAM:</strong> {laptop.ram}</p>
                    <p><strong>Ổ cứng:</strong> {laptop.storage}</p>
                    <p><strong>Màn hình:</strong> {laptop.displaySize}</p>
                </div>

                <div className="price-container">
                    <div className="card-price">
                        {laptop.price.toLocaleString('vi-VN')}đ
                    </div>
                    {discountPercentage > 0 && (
                        <div className="original-price">
                            {(laptop.price * 1.1).toLocaleString('vi-VN')}đ
                        </div>

                    )}
                </div>

                <div className="card-footer-laptop">
                <div className="card-rating-laptop">
                        <Star className="star-icon-laptop" size={14}/>
                        <span>{laptop.ratingAverage || '0'}</span>
                    </div>

                    <div className="sales-count">
                        Đã bán <strong>{laptop.salesCount || 0}+</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaptopCard;