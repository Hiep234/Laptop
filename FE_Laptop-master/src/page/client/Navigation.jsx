import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronDown, Navigation,
} from 'lucide-react';
import '../../components/header/Header.css';

const NavigationHeader = () => {

    return (
        <>
            <nav className="main-nav">
                <div className="container">
                    <ul className="nav-list">
                        <li className="nav-item dropdown">
                            <a className="nav-link">
                                Laptop Gaming
                                <ChevronDown className="dropdown-icon"/>
                            </a>
                            <div className="dropdown-menu">
                                <ul className="dropdown-list">
                                    <li><Link to="/gaming-high-end" className="dropdown-link">Laptop Gaming Cao
                                        Cấp</Link></li>
                                    <li><Link to="/gaming-mid-range" className="dropdown-link">Laptop Gaming Tầm
                                        Trung</Link></li>
                                    <li><Link to="/gaming-budget" className="dropdown-link">Laptop Gaming Giá Rẻ</Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link">
                                Laptop Văn Phòng
                                <ChevronDown className="dropdown-icon"/>
                            </a>
                            <div className="dropdown-menu">
                                <ul className="dropdown-list">
                                    <li><Link to="/ultrabook" className="dropdown-link">Ultrabook</Link></li>
                                    <li><Link to="/thin-light" className="dropdown-link">Laptop Mỏng Nhẹ</Link></li>
                                    <li><Link to="/business" className="dropdown-link">Laptop Doanh Nhân</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link">
                                Thương Hiệu
                                <ChevronDown className="dropdown-icon"/>
                            </a>
                            <div className="dropdown-menu">
                                <ul className="dropdown-list">
                                    <li><Link to="/brand/apple" className="dropdown-link">Apple</Link></li>
                                    <li><Link to="/brand/dell" className="dropdown-link">Dell</Link></li>
                                    <li><Link to="/brand/hp" className="dropdown-link">HP</Link></li>
                                    <li><Link to="/brand/lenovo" className="dropdown-link">Lenovo</Link></li>
                                    <li><Link to="/brand/asus" className="dropdown-link">Asus</Link></li>
                                    <li><Link to="/brand/msi" className="dropdown-link">MSI</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className="nav-item"><Link to="/accessories" className="nav-link">Phụ Kiện</Link></li>
                        <li className="nav-item"><Link to="/promotions" className="nav-link">Khuyến Mãi</Link></li>
                        <li className="nav-item"><Link to="/news" className="nav-link">Tin Tức</Link></li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default NavigationHeader;