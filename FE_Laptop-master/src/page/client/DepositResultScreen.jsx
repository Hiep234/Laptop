import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Result, Spin, Button, Typography, Space, Descriptions, Divider } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, WalletOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { confirmWalletDeposit } from '../../Redux/actions/PaymentThunk';
import { getUserBalance } from '../../Redux/actions/UserThunk';
import { NotificationContext } from '../../components/NotificationProvider';

const { Title, Text } = Typography;

const DepositResultScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const notification = useContext(NotificationContext);
    
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('pending'); // 'success', 'failed', 'confirmed', 'pending', 'invalid'
    const [resultData, setResultData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    
    const hasVerified = useRef(false);
    
    const userData = JSON.parse(localStorage.getItem('USER_LOGIN'));
    const userId = userData?.id;

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const secureHash = queryParams.get('vnp_SecureHash');
        
        // Không gọi confirm nếu URL không có vnp_SecureHash
        if (!secureHash) {
            setStatus('invalid');
            setIsLoading(false);
            return;
        }

        // Không gọi confirm lặp vô hạn
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifyDeposit = async () => {
            try {
                setIsLoading(true);
                const queryString = location.search.substring(1);
                const res = await dispatch(confirmWalletDeposit(queryString));
                
                if (res && res.code === 200 && res.data) {
                    const data = res.data;
                    setResultData(data);
                    
                    if (data.status === 'SUCCESS') {
                        setStatus('success');
                        // Refresh lại thông tin balance
                        if (userId) {
                            dispatch(getUserBalance(userId));
                        }
                    } else if (data.status === 'FAILED') {
                        setStatus('failed');
                        setErrorMessage(data.message || 'Giao dịch nạp tiền không thành công');
                    } else {
                        setStatus('failed');
                    }
                } else {
                    setStatus('failed');
                    setErrorMessage(res?.message || 'Không thể xác thực giao dịch nạp tiền');
                }
            } catch (error) {
                console.error('Lỗi xác thực giao dịch nạp tiền:', error);
                
                const apiMessage = error.response?.data?.message || error.message || '';
                
                if (apiMessage.includes('Deposit already confirmed') || (error.response?.data?.data && error.response.data.data.message === 'Deposit already confirmed')) {
                    setStatus('confirmed');
                    if (userId) {
                        dispatch(getUserBalance(userId));
                    }
                } else {
                    setStatus('failed');
                    setErrorMessage(apiMessage || 'Có lỗi xảy ra khi xác thực giao dịch nạp tiền');
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyDeposit();
    }, [location.search, dispatch, userId]);

    const handleBackToWallet = () => {
        if (userId) {
            navigate(`/wallet/${userId}`);
        } else {
            navigate('/');
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
                <Spin size="large" />
                <Text type="secondary" style={{ fontSize: 16 }}>Đang xác minh giao dịch nạp tiền ví...</Text>
            </div>
        );
    }

    let resultComponent = null;

    if (status === 'success' && resultData) {
        resultComponent = (
            <Result
                status="success"
                icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
                title={<Title level={3} style={{ color: '#1f2937', fontWeight: 700 }}>Nạp tiền thành công!</Title>}
                subTitle="Số dư ví của bạn đã được cập nhật thành công qua cổng thanh toán VNPAY."
                extra={[
                    <Button type="primary" size="large" key="wallet" onClick={handleBackToWallet} style={{ height: 48, borderRadius: 8, padding: '0 32px' }}>
                        Quay lại ví của bạn
                    </Button>
                ]}
            >
                <Card bordered={false} style={{ background: '#f8fafc', borderRadius: 12 }}>
                    <Descriptions title="Chi tiết giao dịch" column={1} bordered size="middle">
                        <Descriptions.Item label="Mã giao dịch nạp ví">{resultData.depositId}</Descriptions.Item>
                        <Descriptions.Item label="Số tiền đã nạp">
                            <Text strong style={{ color: '#52c41a', fontSize: 16 }}>+{formatCurrency(resultData.amount)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số dư mới">
                            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>{formatCurrency(resultData.balance)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Text strong style={{ color: '#52c41a' }}>THÀNH CÔNG</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Result>
        );
    } else if (status === 'confirmed') {
        resultComponent = (
            <Result
                status="info"
                icon={<ExclamationCircleFilled style={{ color: '#1890ff' }} />}
                title={<Title level={3} style={{ color: '#1f2937', fontWeight: 700 }}>Giao dịch đã được xử lý</Title>}
                subTitle="Giao dịch nạp tiền này đã được xác nhận và xử lý trước đó."
                extra={[
                    <Button type="primary" size="large" key="wallet" onClick={handleBackToWallet} style={{ height: 48, borderRadius: 8, padding: '0 32px' }}>
                        Quay lại ví của bạn
                    </Button>
                ]}
            />
        );
    } else if (status === 'invalid') {
        resultComponent = (
            <Result
                status="warning"
                icon={<ExclamationCircleFilled style={{ color: '#faad14' }} />}
                title={<Title level={3} style={{ color: '#1f2937', fontWeight: 700 }}>Yêu cầu không hợp lệ</Title>}
                subTitle="Không tìm thấy tham số xác thực giao dịch nạp tiền ví từ VNPAY."
                extra={[
                    <Button type="primary" size="large" key="wallet" onClick={handleBackToWallet} style={{ height: 48, borderRadius: 8, padding: '0 32px' }}>
                        Quay lại ví của bạn
                    </Button>
                ]}
            />
        );
    } else {
        resultComponent = (
            <Result
                status="error"
                icon={<CloseCircleFilled style={{ color: '#ff4d4f' }} />}
                title={<Title level={3} style={{ color: '#1f2937', fontWeight: 700 }}>Nạp tiền thất bại!</Title>}
                subTitle={errorMessage || "Giao dịch nạp tiền của bạn không thành công hoặc đã bị hủy bỏ."}
                extra={[
                    <Button type="primary" size="large" key="wallet" onClick={handleBackToWallet} style={{ height: 48, borderRadius: 8, padding: '0 32px' }}>
                        Quay lại ví và thử lại
                    </Button>
                ]}
            />
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 16px', background: '#f1f5f9', minHeight: '80vh' }}>
            <Card style={{ maxWidth: 650, width: '100%', borderRadius: 16, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)' }}>
                {resultComponent}
            </Card>
        </div>
    );
};

export default DepositResultScreen;
