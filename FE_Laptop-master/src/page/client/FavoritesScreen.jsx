import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Empty, Row, Col, Rate, notification } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../style/ProductSections.css';

const { Meta } = Card;
const { Title } = Typography;

const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = () => {
            const favs = JSON.parse(localStorage.getItem('FAVORITES')) || [];
            setFavorites(favs);
        };
        fetchFavorites();

        window.addEventListener('favoritesUpdated', fetchFavorites);
        return () => window.removeEventListener('favoritesUpdated', fetchFavorites);
    }, []);

    const handleRemoveFavorite = (e, id) => {
        e.stopPropagation();
        let favs = JSON.parse(localStorage.getItem('FAVORITES')) || [];
        favs = favs.filter(item => item.id !== id);
        localStorage.setItem('FAVORITES', JSON.stringify(favs));
        setFavorites(favs);
        window.dispatchEvent(new Event('favoritesUpdated'));
        notification.info({
            message: 'Đã xóa',
            description: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
            placement: 'topRight'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    return (
        <div style={{ minHeight: '80vh', padding: '40px 20px', maxWidth: '1280px', margin: '0 auto', background: '#f5f5f7' }}>
            <Title level={2} style={{ marginBottom: '30px', fontWeight: 600 }}>Sản phẩm yêu thích ({favorites.length})</Title>
            
            {favorites.length === 0 ? (
                <div style={{ background: '#fff', padding: '60px 20px', borderRadius: '24px', textAlign: 'center' }}>
                    <Empty
                        description={<span style={{ fontSize: '16px', color: '#888' }}>Bạn chưa có sản phẩm yêu thích nào.</span>}
                    />
                    <Button type="primary" size="large" style={{ marginTop: '20px', borderRadius: '24px' }} onClick={() => navigate('/')}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {favorites.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                            <Card
                                hoverable
                                className="product-card"
                                onClick={() => navigate(`/products/${product.id}`)}
                                style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '20px',
                                    overflow: 'hidden'
                                }}
                                cover={
                                    <div style={{ position: 'relative', background: '#fff', padding: '20px' }}>
                                        <img
                                            alt={product.name}
                                            src={product.image}
                                            style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                                        />
                                        <Button 
                                            icon={<DeleteOutlined />} 
                                            type="text" 
                                            danger
                                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.8)', padding: '4px 8px' }}
                                            onClick={(e) => handleRemoveFavorite(e, product.id)}
                                        />
                                    </div>
                                }
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', marginTop: '-10px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px', lineHeight: '1.4' }} className="text-truncate-2">
                                            {product.name}
                                        </h3>
                                        <Rate disabled defaultValue={product.rating || 5} style={{ fontSize: '12px', marginBottom: '8px' }} />
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f' }}>
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}

export default FavoritesScreen;
