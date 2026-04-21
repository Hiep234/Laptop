import React, {useEffect, useState} from "react";
import {
    ArrowLeftOutlined,
    WalletOutlined,
    SafetyOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Input,
    Select,
    Alert,
    Badge,
    Divider,
    Steps,
    Typography,
    Space,
    Form,
    InputNumber
} from "antd";
import "../style/WithdrawalScreen.css";
import {getUserBalance, sendRequestDrawl} from "../../Redux/actions/UserThunk";
import {useDispatch} from "react-redux";

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;
const { Item } = Form;

// List of Vietnamese banks
const BANKS = [
    { code: "VCB", name: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)" },
    { code: "BIDV", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)" },
    { code: "AGB", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)" },
    { code: "TCB", name: "Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)" },
    { code: "MB", name: "Ngân hàng TMCP Quân đội (MB)" },
    { code: "ACB", name: "Ngân hàng TMCP Á Châu (ACB)" },
    { code: "VPB", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)" },
    { code: "VIB", name: "Ngân hàng TMCP Quốc tế Việt Nam (VIB)" },
    { code: "SHB", name: "Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)" },
    { code: "MSB", name: "Ngân hàng TMCP Hàng Hải Việt Nam (MSB)" },
    { code: "HDB", name: "Ngân hàng TMCP Phát triển TP.HCM (HDBank)" },
    { code: "EIB", name: "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam (Eximbank)" },
    { code: "OCB", name: "Ngân hàng TMCP Phương Đông (OCB)" },
    { code: "SCB", name: "Ngân hàng TMCP Sài Gòn (SCB)" },
    { code: "TPB", name: "Ngân hàng TMCP Tiên Phong (TPBank)" },
    { code: "PGB", name: "Ngân hàng TMCP Xăng dầu Petrolimex (PGBank)" },
    { code: "NAB", name: "Ngân hàng TMCP Nam Á (Nam A Bank)" },
    { code: "VAB", name: "Ngân hàng TMCP Việt Á (VietABank)" },
    { code: "BAOVIET", name: "Ngân hàng TMCP Bảo Việt (BaoVietBank)" },
    { code: "SEAB", name: "Ngân hàng TMCP Đông Nam Á (SeABank)" },
    { code: "LPB", name: "Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)" },
    { code: "ABB", name: "Ngân hàng TMCP An Bình (ABBANK)" },
    { code: "KLB", name: "Ngân hàng TMCP Kiên Long (KienlongBank)" },
    { code: "SGB", name: "Ngân hàng TMCP Sài Gòn Công Thương (Saigonbank)" },
    { code: "CBB", name: "Ngân hàng TM TNHH MTV Xây dựng Việt Nam (CBBank)" },
    { code: "NCB", name: "Ngân hàng TMCP Quốc Dân (NCB)" },
    { code: "GPB", name: "Ngân hàng TM TNHH MTV Dầu khí Toàn cầu (GPBank)" },
    { code: "VRB", name: "Ngân hàng Liên doanh Việt – Nga (VRB)" },
    { code: "IVB", name: "Ngân hàng TNHH Indovina (Indovina Bank)" }
];


const WithdrawalScreen = () => {
    const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: PIN, 4: Success
    const [amount, setAmount] = useState("");
    const [destination, setDestination] = useState("");
    const [destinationType, setDestinationType] = useState("");
    const [selectedBank, setSelectedBank] = useState("");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(() => {
        const savedUser = localStorage.getItem('USER_LOGIN');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // Mock data
    const [walletBalance,setWalletBalance] = useState();
    const transactionFee = 0;
    const minWithdrawal = 50000; // 50,000 VND
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    useEffect(() => {
        if (!userData || !userData.id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const balance = await dispatch(getUserBalance(userData.id));
                setWalletBalance(balance.data);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch, userData?.id]);

    const handleAmountChange = (value) => {
        setAmount(value);
        setError("");
    };

    const validateForm = () => {
        const numAmount = Number.parseInt(amount);
        if (!amount || numAmount < minWithdrawal) {
            setError(`Số tiền tối thiểu là ${formatCurrency(minWithdrawal)}`);
            return false;
        }
        if (numAmount + transactionFee > walletBalance) {
            setError("Số dư không đủ để thực hiện giao dịch");
            return false;
        }
        if (!destination || !destinationType) {
            setError("Vui lòng chọn phương thức và nhập thông tin đích");
            return false;
        }
        if (destinationType === "bank" && !selectedBank) {
            setError("Vui lòng chọn ngân hàng");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateForm()) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleConfirmWithdrawal = async () => {
        if (pin.length !== 6) {
            setError("Mã PIN phải có 6 chữ số");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const body = {
                accountNumber: destination,
                amount: Number.parseInt(amount),
                requestNote: `${destinationType === 'bank'
                    ? `${BANKS.find(b => b.code === selectedBank)?.name}`
                    : 'MoMo'}`,
                bankCode: destinationType === 'bank' ? selectedBank : null,
                paymentMethod: destinationType === 'bank' ? 'BANK_TRANSFER' : 'MOMO'
            };

            const res = await dispatch(sendRequestDrawl(body));

            if (res.code === 201) { // Assuming 20 is success code
                setIsLoading(false);
                setStep(4);
            } else {
                setError(res.message || "Có lỗi xảy ra khi thực hiện giao dịch");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Có lỗi xảy ra khi kết nối đến server");
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setError("");
        }
    };

    const resetForm = () => {
        setStep(1);
        setAmount("");
        setDestination("");
        setDestinationType("");
        setSelectedBank("");
        setPin("");
        setError("");
    };

    if (step === 4) {
        return (
            <div className="withdrawal-container">
                <Card className="success-card">
                    <div className="success-icon">
                        <CheckCircleOutlined style={{ fontSize: "32px", color: "#52c41a" }} />
                    </div>
                    <Title level={3} className="success-title">
                        Yêu cầu rút tiền thành công!
                    </Title>
                    <Text className="success-description">
                        Giao dịch của bạn đang được xử lý. Tiền sẽ được chuyển trong vòng 1-3 ngày làm việc.
                    </Text>
                    <div className="transaction-details">
                        <div className="transaction-row">
                            <Text>Số tiền rút:</Text>
                            <Text strong>{formatCurrency(Number.parseInt(amount))}</Text>
                        </div>
                        <div className="transaction-row">
                            <Text>Mã giao dịch:</Text>
                            <Text code>TXN{Date.now().toString().slice(-8)}</Text>
                        </div>
                    </div>
                    <Button type="primary" block onClick={resetForm}>
                        Thực hiện giao dịch khác
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="withdrawal-container">
            <div className="withdrawal-content">
                {/* Header */}
                <div className="withdrawal-header">
                    <Title level={4} className="header-title">
                        Rút tiền
                    </Title>
                    <div className="header-placeholder" />
                </div>

                {/* Progress Indicator */}
                <Steps current={step - 1} className="withdrawal-steps">
                    <Step title="Thông tin" />
                    <Step title="Xác nhận" />
                    <Step title="Bảo mật" />
                </Steps>

                {/* Balance Card */}
                <Card className="balance-card">
                    <div className="balance-content">
                        <Space size="middle">
                            <div className="balance-icon">
                                <WalletOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
                            </div>
                            <div>
                                <Text type="secondary">Số dư khả dụng</Text>
                                <Title level={4} className="balance-amount">
                                    {formatCurrency(walletBalance)}
                                </Title>
                            </div>
                        </Space>
                        <Badge count="VND" style={{ backgroundColor: "#f0f0f0", color: "#666" }} />
                    </div>
                </Card>

                {/* Main Content */}
                {step === 1 && (
                    <Card>
                        <div className="card-header">
                            <Title level={5}>Thông tin rút tiền</Title>
                            <Text type="secondary">Nhập số tiền và chọn phương thức nhận tiền</Text>
                        </div>
                        <div className="card-body">
                            <Form layout="vertical">
                                <Item label="Số tiền muốn rút">
                                    <InputNumber
                                        placeholder="0"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        style={{ width: "100%" }}
                                        min={minWithdrawal}
                                        max={walletBalance - transactionFee}
                                    />
                                    <Text type="secondary" className="amount-hint">
                                        Tối thiểu: {formatCurrency(minWithdrawal)}
                                    </Text>
                                </Item>

                                <Item label="Phương thức nhận tiền">
                                    <Select
                                        placeholder="Chọn phương thức"
                                        value={destinationType}
                                        onChange={(value) => {
                                            setDestinationType(value);
                                            setDestination("");
                                            setSelectedBank("");
                                        }}
                                    >
                                        <Option value="bank">Chuyển khoản ngân hàng</Option>
                                        <Option value="momo">Ví MoMo</Option>
                                    </Select>
                                </Item>

                                {destinationType === "bank" && (
                                    <>
                                        <Item label="Ngân hàng">
                                            <Select
                                                placeholder="Chọn ngân hàng"
                                                value={selectedBank}
                                                onChange={setSelectedBank}
                                            >
                                                {BANKS.map(bank => (
                                                    <Option key={bank.code} value={bank.code}>
                                                        {bank.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Item>
                                        <Item label="Số tài khoản">
                                            <Input
                                                placeholder="Nhập số tài khoản ngân hàng"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                            />
                                        </Item>
                                    </>
                                )}

                                {destinationType === "momo" && (
                                    <Item label="Số điện thoại">
                                        <Input
                                            placeholder="Nhập số điện thoại MoMo"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                        />
                                    </Item>
                                )}

                                {amount && Number.parseInt(amount) > 0 && (
                                    <div className="transaction-summary">
                                        <div className="summary-row">
                                            <Text>Số tiền rút:</Text>
                                            <Text>{formatCurrency(Number.parseInt(amount))}</Text>
                                        </div>
                                        <div className="summary-row">
                                            <Text>Phí giao dịch:</Text>
                                            <Text>{formatCurrency(transactionFee)}</Text>
                                        </div>
                                        <Divider className="summary-divider" />
                                        <div className="summary-row total-row">
                                            <Text strong>Tổng cộng:</Text>
                                            <Text strong>
                                                {formatCurrency(Number.parseInt(amount) + transactionFee)}
                                            </Text>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <Alert
                                        message={error}
                                        type="error"
                                        showIcon
                                        icon={<ExclamationCircleOutlined />}
                                        className="error-alert"
                                    />
                                )}

                                <Button
                                    type="primary"
                                    block
                                    onClick={handleNext}
                                    disabled={!amount || !destinationType || !destination ||
                                        (destinationType === "bank" && !selectedBank)}
                                >
                                    Tiếp tục
                                </Button>
                            </Form>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <div className="card-header">
                            <Title level={5}>Xác nhận giao dịch</Title>
                            <Text type="secondary">
                                Vui lòng kiểm tra lại thông tin trước khi xác nhận
                            </Text>
                        </div>
                        <div className="card-body">
                            <div className="confirmation-details">
                                <div className="detail-row">
                                    <Text type="secondary">Số tiền rút:</Text>
                                    <Text strong>{formatCurrency(Number.parseInt(amount))}</Text>
                                </div>
                                <div className="detail-row">
                                    <Text type="secondary">Phí giao dịch:</Text>
                                    <Text>{formatCurrency(transactionFee)}</Text>
                                </div>
                                <div className="detail-row">
                                    <Text type="secondary">Phương thức:</Text>
                                    <Text className="capitalize">
                                        {destinationType === "bank" ? "Ngân hàng" : "MoMo"}
                                    </Text>
                                </div>
                                {destinationType === "bank" && (
                                    <div className="detail-row">
                                        <Text type="secondary">Ngân hàng:</Text>
                                        <Text>
                                            {BANKS.find(b => b.code === selectedBank)?.name || selectedBank}
                                        </Text>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <Text type="secondary">
                                        {destinationType === "bank" ? "Số tài khoản:" : "Số điện thoại:"}
                                    </Text>
                                    <Text code>{destination}</Text>
                                </div>
                                <Divider className="detail-divider" />
                                <div className="detail-row total-row">
                                    <Text strong>Tổng cộng:</Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {formatCurrency(Number.parseInt(amount) + transactionFee)}
                                    </Title>
                                </div>
                            </div>

                            <Alert
                                message={
                                    <Text>
                                        Giao dịch sẽ được xử lý trong vòng 1-3 ngày làm việc. Vui lòng kiểm tra kỹ
                                        thông tin trước khi xác nhận.
                                    </Text>
                                }
                                type="info"
                                icon={<SafetyOutlined />}
                                showIcon
                                className="info-alert"
                            />

                            <Space size="middle" className="action-buttons">
                                <Button block onClick={handleBack}>
                                    Quay lại
                                </Button>
                                <Button type="primary" block onClick={handleNext}>
                                    Xác nhận
                                </Button>
                            </Space>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card>
                        <div className="card-header">
                            <Title level={5}>Xác thực bảo mật</Title>
                            <Text type="secondary">Nhập mã PIN 6 chữ số để hoàn tất giao dịch</Text>
                        </div>
                        <div className="card-body">
                            <Form layout="vertical">
                                <Item label="Mã PIN">
                                    <Input.Password
                                        placeholder="••••••"
                                        value={pin}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                                            setPin(value);
                                            setError("");
                                        }}
                                        maxLength={6}
                                        iconRender={(visible) =>
                                            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                        }
                                        className="pin-input"
                                    />
                                </Item>

                                {error && (
                                    <Alert
                                        message={error}
                                        type="error"
                                        showIcon
                                        icon={<ExclamationCircleOutlined />}
                                        className="error-alert"
                                    />
                                )}

                                <Space size="middle" className="action-buttons">
                                    <Button block onClick={handleBack} disabled={isLoading}>
                                        Quay lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        block
                                        onClick={handleConfirmWithdrawal}
                                        disabled={pin.length !== 6 || isLoading}
                                        loading={isLoading}
                                    >
                                        {isLoading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                                    </Button>
                                </Space>
                            </Form>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default WithdrawalScreen;