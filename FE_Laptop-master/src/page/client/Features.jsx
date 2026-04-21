import React from 'react';
import '../style/Features.css';

const Features = () => {
    const features = [
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                >
                    <rect width="16" height="16" x="4" y="4" rx="2" />
                    <rect width="4" height="4" x="10" y="10" />
                    <path d="M4 16h16" />
                    <path d="M4 12h4" />
                    <path d="M16 12h4" />
                    <path d="M10 4v4" />
                    <path d="M10 16v4" />
                    <path d="M14 4v4" />
                    <path d="M14 16v4" />
                </svg>
            ),
            title: "Sản phẩm chính hãng",
            description: "100% sản phẩm chính hãng, nhập khẩu trực tiếp từ nhà sản xuất"
        },
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
            ),
            title: "Dịch vụ tận tâm",
            description: "Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7"
        },
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ),
            title: "Bảo hành tận nơi",
            description: "Bảo hành chính hãng lên đến 36 tháng, 1 đổi 1 trong 30 ngày"
        },
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feature-icon"
                >
                    <path d="m2 9 3-3 3 3" />
                    <path d="M13 18H7a2 2 0 0 1-2-2V6" />
                    <path d="m22 15-3 3-3-3" />
                    <path d="M11 6h6a2 2 0 0 1 2 2v10" />
                </svg>
            ),
            title: "Giao hàng miễn phí",
            description: "Giao hàng miễn phí toàn quốc cho đơn hàng từ 2 triệu"
        }
    ];

    return (
        <section className="features-section-home">
            <div className="features-container-home">
                <div className="features-grid-home">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card-home">
                            <div className="feature-icon-container-home-x">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title-home">{feature.title}</h3>
                            <p className="feature-description-home">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;