import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../../Redux/actions/UserThunk';
import { User, Mail, Lock, Loader2, X } from 'lucide-react';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [inputErrors, setInputErrors] = useState({
        username: false,
        password: false,
        fullName: false,
        email: false
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: ''
            });
            setError('');
            setInputErrors({
                username: false,
                password: false,
                fullName: false,
                email: false
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        const fieldName = id.replace('register-', '');

        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Clear error when user starts typing
        if (inputErrors[fieldName]) {
            setInputErrors(prev => ({ ...prev, [fieldName]: false }));
            if (error) setError('');
        }
    };

    const validateForm = () => {
        const errors = {
            username: !formData.username.trim(),
            password: !formData.password,
            fullName: !formData.fullName.trim(),
            email: !formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)
        };

        setInputErrors(errors);

        if (errors.username || errors.password || errors.fullName || errors.email) {
            setError('Vui lòng điền đầy đủ thông tin hợp lệ');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await dispatch(register(
                formData.username,
                formData.password,
                formData.fullName,
                formData.email
            ));

            if (result?.error) {
                throw new Error(result.error.message || 'Đăng ký thất bại');
            }

            // Successful registration
            onRegisterSuccess?.();
            onClose();
        } catch (err) {
            console.error('Register error:', err);
            setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`login-modal ${isOpen ? 'open' : ''}`}>
            <div className="login-modal__overlay" onClick={onClose} />

            <div className="login-modal__content">
                <div className="login-modal__header">
                    <h2 className="login-modal__title">
                        <User size={20} className="icon" />
                        Đăng ký tài khoản
                    </h2>
                    <button
                        className="login-modal__close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="login-modal__error">
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className={`form-group ${inputErrors.fullName ? 'error' : ''}`}>
                        <label htmlFor="register-fullName">Họ và tên</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="register-fullName"
                                placeholder="Nhập họ và tên đầy đủ"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="name"
                            />
                            <User size={16} className="input-icon"/>
                        </div>
                        {inputErrors.fullName && (
                            <span className="error-message">Vui lòng nhập họ và tên</span>
                        )}
                    </div>

                    <div className={`form-group ${inputErrors.username ? 'error' : ''}`}>
                        <label htmlFor="register-username">Tên đăng nhập</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="register-username"
                                placeholder="Nhập tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>
                        {inputErrors.username && (
                            <span className="error-message">Vui lòng nhập tên đăng nhập</span>
                        )}
                    </div>

                    <div className={`form-group ${inputErrors.email ? 'error' : ''}`}>
                        <label htmlFor="register-email">Email</label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="register-email"
                                placeholder="Nhập email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                            <Mail size={16} className="input-icon"/>
                        </div>
                        {inputErrors.email && (
                            <span className="error-message">
                                {!formData.email.trim() ? 'Vui lòng nhập email' : 'Email không hợp lệ'}
                            </span>
                        )}
                    </div>

                    <div className={`form-group ${inputErrors.password ? 'error' : ''}`}>
                        <label htmlFor="register-password">Mật khẩu</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                id="register-password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <Lock size={16} className="input-icon"/>
                        </div>
                        {inputErrors.password && (
                            <span className="error-message">Vui lòng nhập mật khẩu</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin"/>
                                Đang xử lý...
                            </>
                        ) : 'Đăng ký'}
                    </button>

                    <div style={{fontSize: '14px', color: '#333', marginTop: '1rem', marginLeft: '10rem' }}>
                        Đã có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onSwitchToLogin();
                            }}
                            disabled={isLoading}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                marginLeft: '5px',
                                color: isLoading ? '#aaa' : '#007bff',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textDecoration: 'underline',
                                fontFamily: 'inherit',
                            }}
                        >
                            Đăng nhập
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default RegisterModal;