import React from 'react';
import '../style/FeaturedCategories.css';
import {Link} from "react-router-dom";
import source1 from "../../assets/gaming.jfif";
import source2 from "../../assets/dh.jpg";
import source3 from "../../assets/mongnhe.jpg";
import source4 from "../../assets/vanphong.jpg";
import {Image} from "antd";
const FeaturedCategories = () => {
    const categories = [
        { name: "Gaming", image: source1 },
        { name: "Văn Phòng", image: source4 },
        { name: "Đồ Họa", image: source2 },
        { name: "Mỏng Nhẹ", image: source3 },
    ];

    return (
        <section className="featured-categories">
            <div className="categories-container">
                <h2 className="categories-title">Danh Mục Nổi Bật</h2>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <Link
                            href="#"
                            key={category.name}
                            className="category-card"
                        >
                            <div className="image-container">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    width={400}
                                    height={300}
                                    className="category-image"
                                    onError={(e) => {
                                        e.target.src = '/default-category.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <div className="category-overlay">
                                <h3 className="category-name">{category.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCategories;