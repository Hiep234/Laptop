import React from 'react';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Result, Spin, message, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import '../style/OrderSuccess.css';
import { useDispatch } from "react-redux";
import { check } from "../../Redux/actions/PaymentThunk";

const { Text } = Typography;

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [showConfetti, setShowConfetti] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const location = useLocation();
    const dispatch = useDispatch();

    // Extract all VNPay parameters
    const queryParams = new URLSearchParams(location.search);
    const vnpParams = {
        amount: queryParams.get("vnp_Amount"),
        bankCode: queryParams.get("vnp_BankCode"),
        bankTranNo: queryParams.get("vnp_BankTranNo"),
        cardType: queryParams.get("vnp_CardType"),
        orderInfo: queryParams.get("vnp_OrderInfo"),
        payDate: queryParams.get("vnp_PayDate"),
        responseCode: queryParams.get("vnp_ResponseCode"),
        tmnCode: queryParams.get("vnp_TmnCode"),
        transactionNo: queryParams.get("vnp_TransactionNo"),
        transactionStatus: queryParams.get("vnp_TransactionStatus"),
        txnRef: queryParams.get("vnp_TxnRef"),
        secureHash: queryParams.get("vnp_SecureHash")
    };

    // Kiểm tra xem URL có chứa tham số VNPay không
    const hasVnpayParams = Object.values(vnpParams).some(param => param !== null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (hasVnpayParams) {
                    // Prepare request body for backend verification
                    const requestBody = {
                        amount: parseInt(vnpParams.amount) / 100,
                        orderId: vnpParams.orderInfo,
                        userId: JSON.parse(localStorage.getItem('USER_LOGIN'))?.id,
                        type: vnpParams.responseCode === "00" ? 0 : 1
                    };

                    // Call backend to verify payment
                    const result = await dispatch(check(requestBody));

                    if (result && result.data && result.code === 200) {
                        setPaymentStatus('success');
                        setPaymentDetails({
                            orderId: vnpParams.orderInfo,
                            amount: (parseInt(vnpParams.amount) / 100).toLocaleString('vi-VN') + ' VND',
                            transactionNo: vnpParams.transactionNo,
                            bank: vnpParams.bankCode,
                            paymentTime: formatPayDate(vnpParams.payDate)
                        });
                        setShowConfetti(true);
                    } else {
                        setPaymentStatus('failed');
                    }
                } else {
                    setPaymentStatus('success');
                    setShowConfetti(true);
                }
            } catch (error) {
                console.error("Payment verification failed:", error);
                setPaymentStatus('error');
                message.error('Xác minh thanh toán thất bại');
            } finally {
                setIsLoading(false);
            }
        };

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        if (hasVnpayParams) {
            // Nếu có tham số VNPay, kiểm tra responseCode
            if (vnpParams.responseCode === '00') {
                verifyPayment();
            } else {
                setPaymentStatus('failed');
                setIsLoading(false);
            }
        } else {
            // Nếu không có tham số VNPay, coi như thành công
            verifyPayment();
        }

        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [hasVnpayParams]);

    // Format VNPay's payDate (YYYYMMDDHHmmss) to readable format
    const formatPayDate = (payDate) => {
        if (!payDate) return '';
        const year = payDate.substring(0, 4);
        const month = payDate.substring(4, 6);
        const day = payDate.substring(6, 8);
        const hour = payDate.substring(8, 10);
        const minute = payDate.substring(10, 12);
        const second = payDate.substring(12, 14);
        return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="order-success-container">
                <Spin size="large" tip="Đang xác minh thanh toán..." />
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="order-success-container">
                <Result
                    icon={<CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '72px' }} />}
                    title="Thanh toán không thành công!"
                    subTitle={`Mã lỗi: ${vnpParams.responseCode || 'Không xác định'}`}
                    extra={[
                        <Button type="primary" key="home" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>,
                        <Button key="order" onClick={() => navigate('/cart')}>
                            Quay lại giỏ hàng
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    if (paymentStatus === 'error') {
        return (
            <div className="order-success-container">
                <Result
                    icon={<ExclamationCircleFilled style={{ color: '#faad14', fontSize: '72px' }} />}
                    title="Xác minh thanh toán gặp lỗi"
                    subTitle="Vui lòng kiểm tra lại đơn hàng trong tài khoản của bạn"
                    extra={[
                        <Button type="primary" key="home" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>,
                        <Button key="order" onClick={() => navigate('/orders')}>
                            Kiểm tra đơn hàng
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="order-success-container">
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}

            <Result
                icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '72px' }} />}
                title="Đặt hàng thành công!"
                subTitle={
                    hasVnpayParams ? (
                        <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                            <p>Đơn hàng <Text strong>#{paymentDetails?.orderId}</Text> đã được thanh toán thành công.</p>
                            <p>Số tiền: <Text strong>{paymentDetails?.amount}</Text></p>
                            <p>Mã giao dịch: <Text strong>{paymentDetails?.transactionNo}</Text></p>
                            <p>Ngân hàng: <Text strong>{paymentDetails?.bank}</Text></p>
                            <p>Thời gian: <Text strong>{paymentDetails?.paymentTime}</Text></p>
                        </div>
                    ) : (
                        "Đơn hàng đã được xác nhận và sẽ được vận chuyển đến bạn sớm."
                    )
                }
                extra={[
                    <Button type="primary" key="home" onClick={() => navigate('/')}>
                        Về trang chủ
                    </Button>,
                    <Button key="order" onClick={() => navigate(hasVnpayParams ? `/orders/${paymentDetails?.orderId}` : '/orders')}>
                        {hasVnpayParams ? 'Xem chi tiết đơn hàng' : 'Xem đơn hàng'}
                    </Button>,
                ]}
            />
        </div>
    );
};

export default OrderSuccess;