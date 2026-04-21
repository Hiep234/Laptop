import React from 'react';
import {
    MapPin,
    Phone,
    Mail,
    Clock
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import './footer.css';
import {Button, Image} from "antd";
import {Link} from "react-router-dom";
import logo from "../../assets/log.jpg";
const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Company Info */}
                    <div className="company-info">
                        <div className="logo-wrapper">
                            <Image
                                src={logo}
                                width={32}
                                preview={false}
                                height={32}
                                alt="TechLaptop Logo"
                                className="footer-logo"
                            />
                            <span className="company-name">TechLaptop</span>
                        </div>
                        <p className="company-description">
                            Hệ thống bán lẻ laptop và phụ kiện uy tín hàng đầu Việt Nam
                        </p>
                        <div className="social-links">
                            <Button variant="outline" size="icon" className="social-button">
                                <FaFacebookF className="social-icon" />
                            </Button>
                            <Button variant="outline" size="icon" className="social-button">
                                <FaInstagram className="social-icon" />
                            </Button>
                            <Button variant="outline" size="icon" className="social-button">
                                <FaTwitter className="social-icon" />
                            </Button>
                            <Button variant="outline" size="icon" className="social-button">
                                <FaLinkedinIn className="social-icon" />
                            </Button>
                        </div>
                    </div>

                    {/* Information Links */}
                    <div className="footer-section">
                        <h3 className="section-title-footer">Thông tin</h3>
                        <ul className="footer-links">
                            <li><Link href="#" className="footer-link">Giới thiệu</Link></li>
                            <li><Link href="#" className="footer-link">Tin tức</Link></li>
                            <li><Link href="#" className="footer-link">Khuyến mãi</Link></li>
                            <li><Link href="#" className="footer-link">Tuyển dụng</Link></li>
                            <li><Link href="#" className="footer-link">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div className="footer-section">
                        <h3 className="section-title-footer">Chính sách</h3>
                        <ul className="footer-links">
                            <li><Link href="#" className="footer-link">Chính sách bảo hành</Link></li>
                            <li><Link href="#" className="footer-link">Chính sách thanh toán</Link></li>
                            <li><Link href="#" className="footer-link">Chính sách giao hàng</Link></li>
                            <li><Link href="#" className="footer-link">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="footer-link">Điều khoản dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h3 className="section-title-footer">Liên hệ</h3>
                        <ul className="contact-info">
                            <li className="contact-item">
                                <MapPin className="contact-icon" />
                                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="contact-item">
                                <Phone className="contact-icon" />
                                <span>1800-123-4567</span>
                            </li>
                            <li className="contact-item">
                                <Mail className="contact-icon" />
                                <span>info@techlaptop.com</span>
                            </li>
                            <li className="contact-item">
                                <Clock className="contact-icon" />
                                <span>8:00 - 21:00, Thứ 2 - Chủ nhật</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="copyright">
                        © {new Date().getFullYear()} TechLaptop. Tất cả quyền được bảo lưu.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;