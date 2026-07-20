import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../Redux/actions/UserThunk';
import { User, Lock, Loader2, X } from 'lucide-react';
import  "./Login.css"
const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [inputErrors, setInputErrors] = useState({
        username: false,
        password: false
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                username: '',
                password: '',
            });
            setError('');
            setInputErrors({
                username: false,
                password: false
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (id === 'username' || id === 'password') {
            setInputErrors(prev => ({ ...prev, [id]: false }));
            if (error) setError('');
        }
    };

    const validateForm = () => {
        const errors = {
            username: !formData.username.trim(),
            password: !formData.password
        };

        setInputErrors(errors);

        if (errors.username || errors.password) {
            setError('Vui lòng điền đầy đủ thông tin');
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
            const result = await dispatch(loginUser({
                username: formData.username.trim(),
                password: formData.password
            }));
            if (result?.error) {
                throw new Error(result.error.message || 'Đăng nhập thất bại');
            }
            // Successful login
            if (localStorage.getItem('accessToken')) {
                onLoginSuccess?.(result); // Pass user data to parent
                window.location.href = "/admin/dashboard";
                onClose();
            } else {
                throw new Error('Không nhận được token đăng nhập');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
                        Đăng nhập
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
                    <div className={`form-group ${inputErrors.username ? 'error' : ''}`}>
                        <label htmlFor="username">Tên đăng nhập</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
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

                    <div className={`form-group ${inputErrors.password ? 'error' : ''}`}>
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                id="password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <Lock size={16} className="input-icon" />
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
                                <Loader2 size={18} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : 'Đăng nhập'}
                    </button>

                    <div className="register-prompt">
                        Chưa có tài khoản?{' '}
                        <button
                            type="button"
                            className="register-link"
                            onClick={(e) => {
                                e.preventDefault();
                                onSwitchToRegister();
                            }}
                            disabled={isLoading}
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;