import React from 'react';
import { ShieldCheck, HeartHandshake, Wrench, Truck } from 'lucide-react';
import '../style/Features.css';

const Features = () => {
    const features = [
        {
            icon: <ShieldCheck size={28} className="feature-lucide-icon" />,
            title: "Sản Phẩm Chính Hãng",
            description: "Cam kết 100% sản phẩm chính hãng, bảo hành toàn cầu từ nhà sản xuất",
            colorClass: "feat-shield"
        },
        {
            icon: <HeartHandshake size={28} className="feature-lucide-icon" />,
            title: "Hỗ Trợ Tận Tâm",
            description: "Đội ngũ chuyên viên kỹ thuật chuyên nghiệp hỗ trợ giải đáp 24/7",
            colorClass: "feat-heart"
        },
        {
            icon: <Wrench size={28} className="feature-lucide-icon" />,
            title: "Bảo Hành Tận Nơi",
            description: "Chế độ bảo hành siêu tốc lên đến 36 tháng, 1 đổi 1 trong 30 ngày",
            colorClass: "feat-wrench"
        },
        {
            icon: <Truck size={28} className="feature-lucide-icon" />,
            title: "Giao Hàng Miễn Phí",
            description: "Giao hàng hỏa tốc miễn phí toàn quốc cho tất cả hóa đơn mua laptop",
            colorClass: "feat-truck"
        }
    ];

    return (
        <section className="features-section-home">
            <div className="features-container-home">
                <div className="features-grid-home">
                    {features.map((feature, index) => (
                        <div key={index} className={`feature-card-home ${feature.colorClass}`}>
                            <div className="feature-icon-container-home">
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