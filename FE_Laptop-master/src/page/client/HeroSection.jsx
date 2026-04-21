import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  Button, Carousel } from 'antd';
import '../style/HeroSection.css';
import banner1 from '../../assets/10284957.jpg';
import banner2 from '../../assets/5990174.jpg';
import banner3 from '../../assets/122.jpg';

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const banners = [
        {
            id: 1,
            title: "Laptop Gaming Cao Cấp",
            subtitle: "Trải nghiệm gaming đỉnh cao với hiệu năng vượt trội và thiết kế sang trọng",
            image: banner1,
            buttonText: "Mua ngay",
        },
        {
            id: 2,
            title: "Laptop Văn Phòng",
            subtitle: "Nhẹ nhàng, mỏng gọn, hiệu năng ổn định cho công việc",
            image: banner2,
            buttonText: "Khám phá",
        },
        {
            id: 3,
            title: "Phụ Kiện Chính Hãng",
            subtitle: "Đầy đủ phụ kiện laptop với giá tốt nhất thị trường",
            image: banner3,
            buttonText: "Xem ngay",
        },
    ];


    return (
        <>
            <section className="hero-section">
                <Carousel
                    autoplay
                    effect="fade"
                    className="hero-carousel"
                    dotPosition="bottom"
                >
                    {banners.map((banner) => (
                        <div key={banner.id} className="hero-slide">
                            <div
                                className="hero-image"
                                style={{backgroundImage: `url(${banner.image})`}}
                            >
                                <div className="hero-overlay">
                                    <div className="hero-content">
                                        <h1 className="hero-title">{banner.title}</h1>
                                        <p className="hero-subtitle">{banner.subtitle}</p>
                                        <div className="hero-buttons">
                                            <Button type="primary" size="large" className="primary-button"
                                                    onClick={() => {
                                                        window.location.href = "/search";
                                                    }}>
                                                {banner.buttonText}
                                            </Button>
                                            <Button size="large" className="secondary-button"
                                                    onClick={() => {
                                                       window.location.href = "/search";
                                                    }}
                                            >
                                                Tìm hiểu thêm
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </section>
        </>
    );
};

export default HeroSection;