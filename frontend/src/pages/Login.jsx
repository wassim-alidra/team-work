import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    let { loginUser } = useContext(AuthContext);
    const location = useLocation();
    const [error, setError] = useState('');
    const [needsVerify, setNeedsVerify] = useState(false);  // true when error is "verify email"
    const [userEmail, setUserEmail] = useState('');           // captured from the form
    const [resendMsg, setResendMsg] = useState('');
    const [resending, setResending] = useState(false);

    // If redirected from VerifyEmail after successful verification
    const justVerified = location.state?.verified;

    const handleSubmit = async (e) => {
        // Capture email/username before the event gets consumed
        const formUsername = e.target.username?.value || '';
        setUserEmail(formUsername);   // we'll use it for resend (backend accepts username too via email lookup)
        setNeedsVerify(false);
        setResendMsg('');
        try {
            setError('');
            await loginUser(e);
        } catch (err) {
            const msg = err.message || '';
            setError(msg);
            // Detect the "verify your email" error from our backend
            if (msg.toLowerCase().includes('verify your email')) {
                setNeedsVerify(true);
            }
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResendMsg('');
        try {
            // Try to resolve email from username via a lightweight attempt
            await api.post('users/resend-otp/', { email: userEmail });
            setResendMsg('A new code has been sent! Check your inbox.');
        } catch (err) {
            const detail = err.response?.data?.error || 'Could not resend. Try registering again.';
            setResendMsg(detail);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container fade-in">
            <style>
                {`
                .login-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    background: #fef2f2;
                    color: #b91c1c;
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin: 10px 0;
                    font-size: 14px;
                    border: 1px solid #fecaca;
                }
                .login-error .icon {
                    font-weight: bold;
                    font-size: 14px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }
                .login-success-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f0fdf4;
                    color: #166534;
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin: 10px 0;
                    font-size: 14px;
                    border: 1px solid #bbf7d0;
                    font-weight: 600;
                }
                .verify-hint {
                    margin-top: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #7c3aed;
                }
                .resend-inline-btn {
                    background: none;
                    border: none;
                    color: #2f9e44;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: underline;
                    padding: 0;
                    box-shadow: none;
                    transition: color 0.2s;
                }
                .resend-inline-btn:hover { color: #1b8a3e; transform: none; box-shadow: none; }
                .resend-inline-btn:disabled { color: #94a3b8; cursor: not-allowed; text-decoration: none; }
                .resend-feedback {
                    margin-top: 6px;
                    font-size: 12.5px;
                    color: #166534;
                    background: #f0fdf4;
                    border-radius: 8px;
                    padding: 6px 10px;
                    border: 1px solid #bbf7d0;
                }
                `}
            </style>
            <div className="glass-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to access your AgriGov Market account</p>

                {/* Success banner after email verification */}
                {justVerified && (
                    <div className="login-success-banner">
                        ✅ Email verified! You can now sign in.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="auth-form-label">Username or Email</label>
                        <input type="text" name="username" placeholder="Enter your username" required />
                    </div>
                    <div>
                        <label className="auth-form-label">Password</label>
                        <input type="password" name="password" placeholder="Enter your password" required />
                    </div>
                    
                    <div className="auth-extra-links">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#475569' }}>
                            <input type="checkbox" style={{ width: 'auto', margin: 0 }} /> Remember me
                        </label>
                        <a href="#" className="auth-link">Forgot password?</a>
                    </div>
                    
                    {error && (
                        <div className="login-error">
                            <span className="icon">✖</span>
                            <div>
                                <span>{error}</span>
                                {/* Inline resend OTP prompt when account isn't verified */}
                                {needsVerify && (
                                    <div className="verify-hint">
                                        <span>📧 Resend the code?</span>
                                        <button
                                            id="login-resend-otp-btn"
                                            type="button"
                                            className="resend-inline-btn"
                                            onClick={handleResend}
                                            disabled={resending}
                                        >
                                            {resending ? 'Sending…' : 'Resend verification code'}
                                        </button>
                                        <span>or</span>
                                        <Link
                                            to="/verify-email"
                                            state={{ email: userEmail }}
                                            className="auth-link"
                                            style={{ fontSize: '13px' }}
                                        >
                                            Enter code
                                        </Link>
                                    </div>
                                )}
                                {resendMsg && (
                                    <div className="resend-feedback">{resendMsg}</div>
                                )}
                            </div>
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%' }}>Sign In</button>
                </form>
                
                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Register</Link>
                </p>
            </div>
        </div>
    </div>
);
};

export default Login;
