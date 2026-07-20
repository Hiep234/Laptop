import React, { useState } from 'react';
import { Button, Carousel } from 'antd';
import { Cpu, Zap, ShieldCheck } from 'lucide-react';
import '../../components/header/Header.css';
import '../../page/style/HeroSection.css'; // Đảm bảo import file CSS của HeroSection

import gamingLaptop from '../../assets/gaming_laptop.png';
import businessLaptop from '../../assets/business_laptop.png';
import workstationLaptop from '../../assets/workstation_laptop.png';

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const banners = [
        {
            id: 0,
            theme: "gaming-theme",
            title: "Chiến Thần Gaming",
            highlight: "Bứt Phá Giới Hạn",
            subtitle: "Sở hữu các dòng Laptop Gaming mạnh mẽ trang bị card đồ hoạ RTX 40-Series và chip Core i9 thế hệ mới nhất. Tần số quét 240Hz cực mượt.",
            image: gamingLaptop,
            buttonText: "Mua ngay",
            badge: "HOT RELEASE",
            features: ["RTX 4090 GPU", "Intel i9 CPU", "240Hz QHD+ Screen"]
        },
        {
            id: 1,
            theme: "business-theme",
            title: "Đẳng Cấp Ultrabook",
            highlight: "Sang Trọng & Tinh Tế",
            subtitle: "Mỏng nhẹ vượt trội, vỏ hợp kim nguyên khối siêu bền. Màn hình OLED 3K sống động cùng thời lượng pin bền bỉ cho cả ngày dài làm việc.",
            image: businessLaptop,
            buttonText: "Khám phá",
            badge: "PREMIUM EXPERIENCE",
            features: ["Intel Evo Platform", "3K OLED Screen", "18 Hours Battery"]
        },
        {
            id: 2,
            theme: "workstation-theme",
            title: "Quái Vật Cấu Hình",
            highlight: "Hiệu Năng Vô Song",
            subtitle: "Chinh phục mọi tác vụ nặng: dựng phim, lập trình AI, đồ họa 3D. Hỗ trợ bộ nhớ RAM lên tới 64GB cùng ổ cứng siêu tốc SSD PCIe Gen 4.",
            image: workstationLaptop,
            buttonText: "Xem chi tiết",
            badge: "ULTIMATE PERFORMANCE",
            features: ["Nvidia RTX Ada GPU", "Xeon / Core i9", "ECC DDR5 Memory"]
        }
    ];

    return (
        <section className="hero-section">
            <Carousel
                autoplay
                effect="fade"
                className="hero-carousel"
                dotPosition="bottom"
                beforeChange={(from, to) => setCurrentSlide(to)}
            >
                {banners.map((banner, index) => {
                    const isActive = currentSlide === index;
                    return (
                        <div key={banner.id} className={`hero-slide ${banner.theme} ${isActive ? 'active' : ''}`}>
                            <div className="hero-slide-container">
                                <div className="hero-slide-content">
                                    <span className="hero-badge">{banner.badge}</span>
                                    <h1 className="hero-title">
                                        {banner.title}
                                        <span className="hero-highlight"> {banner.highlight}</span>
                                    </h1>
                                    <p className="hero-subtitle">{banner.subtitle}</p>
                                    
                                    <div className="hero-features-list">
                                        {banner.features.map((feat, i) => (
                                            <span key={i} className="hero-feature-item">
                                                {banner.theme === "gaming-theme" ? <Zap size={14} className="feature-icon-gaming" /> : 
                                                 banner.theme === "business-theme" ? <ShieldCheck size={14} className="feature-icon-business" /> : 
                                                 <Cpu size={14} className="feature-icon-workstation" />}
                                                {feat}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="hero-buttons">
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            className="primary-button"
                                            onClick={() => {
                                                window.location.href = "/search";
                                            }}
                                        >
                                            {banner.buttonText}
                                        </Button>
                                        <Button 
                                            size="large" 
                                            className="secondary-button"
                                            onClick={() => {
                                                window.location.href = "/search";
                                            }}
                                        >
                                            Tìm hiểu thêm
                                        </Button>
                                    </div>
                                </div>
                                <div className="hero-slide-image-wrapper">
                                    <div className="hero-image-backdrop"></div>
                                    <img 
                                        src={banner.image} 
                                        alt={banner.title} 
                                        className="hero-laptop-image"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Carousel>
        </section>
    );
};

export default HeroSection;