import React from 'react';
import { Star } from 'lucide-react';
import '../style/TestimonialsNewsletter.css';
import { Card, Image } from "antd";
import avt from "../../assets/avt.jpg";

const TestimonialsNewsletter = () => {
    const testimonials = [
        {
            name: "Lâm Minh Đức",
            role: "Game Thủ Chuyên Nghiệp",
            content: "Chiếc Laptop Gaming tôi sắm ở đây chạy cực kỳ ổn định. Chơi các tựa game AAA cấu hình cao FPS luôn mượt mà. Dịch vụ hậu mãi hỗ trợ rất tận tình.",
            rating: 5
        },
        {
            name: "Hoàng Mỹ Linh",
            role: "Content Creator / Designer",
            content: "Màn hình OLED có độ chuẩn màu rất cao, sắc nét đến từng chi tiết. Cấu hình máy mượt mà giúp tôi xử lý video 4K siêu nhanh. Khuyên mọi người nên mua!",
            rating: 5
        },
        {
            name: "Phạm Thành Nam",
            role: "Lập Trình Viên AI",
            content: "Máy trạm di động cấu hình khủng, RAM 64GB và tản nhiệt tốt. Chạy các tác vụ Deep Learning êm ái. Nhân viên kỹ thuật tư vấn cực kỳ có chuyên môn.",
            rating: 5
        }
    ];

    return (
        <div className="testimonials-newsletter-wrapper">
            {/* Testimonials Section */}
            <section className="testimonials-grid-section">
                <div className="grid-container">
                    <div className="testimonials-header">
                        <h2 className="testimonials-title">Khách Hàng Nói Gì Về TechLaptop</h2>
                        <div className="header-decor-line"></div>
                    </div>
                    
                    <div className="testimonials-cards-grid">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="premium-testimonial-card">
                                <div className="testimonial-rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={`star-rating-icon ${i < testimonial.rating ? 'filled' : ''}`}
                                        />
                                    ))}
                                </div>

                                <blockquote className="testimonial-quote-text">
                                    <p>"{testimonial.content}"</p>
                                </blockquote>

                                <div className="testimonial-author-profile">
                                    <div className="author-avatar-wrapper">
                                        <Image
                                            src={avt}
                                            alt={testimonial.name}
                                            width={44}
                                            height={44}
                                            className="avatar-image-rounded"
                                            preview={false}
                                            onError={(e) => {
                                                e.target.src = '/avatars/default-avatar.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <div className="author-metadata">
                                        <h4 className="author-profile-name">{testimonial.name}</h4>
                                        <span className="author-profile-role">{testimonial.role}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TestimonialsNewsletter;