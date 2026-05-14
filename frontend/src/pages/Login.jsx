import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import loginPhotoLocal from '../assets/login-bg.jpg';

// Cloudinary URL (Hosted version)
const loginPhotoHosted = "https://res.cloudinary.com/duoabslmx/image/upload/v1778762856/agrigov_login_bg.jpg";

// Use local photo by default
const loginPhoto = loginPhotoLocal;

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
        <div style={{ 
            minHeight: '100vh', 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${loginPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem 1rem', 
            fontFamily: 'Inter, system-ui, sans-serif' 
        }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(1,45,29,0.08)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '2rem 2.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #e8eff1' }}>
                    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#012d1d', margin: '0 0 0.25rem', background: 'none', WebkitTextFillColor: '#012d1d' }}>AgriGov Market</h1>
                    <p style={{ fontSize: '0.9rem', color: '#717973', margin: 0 }}>Sign in to access your account</p>
                </div>
                <style>
                    {`
                    .login-error { display:flex; align-items:flex-start; gap:8px; background:#fef2f2; color:#b91c1c; padding:10px 12px; border-radius:10px; margin:10px 0; font-size:14px; border:1px solid #fecaca; }
                    .login-error .icon { font-weight:bold; font-size:14px; flex-shrink:0; margin-top:1px; }
                    .login-success-banner { display:flex; align-items:center; gap:8px; background:#f0fdf4; color:#166534; padding:10px 12px; border-radius:10px; margin:10px 0; font-size:14px; border:1px solid #bbf7d0; font-weight:600; }
                    .verify-hint { margin-top:8px; display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:13px; color:#7c3aed; }
                    .resend-inline-btn { background:none; border:none; color:#116c4a; font-weight:700; font-size:13px; cursor:pointer; text-decoration:underline; padding:0; box-shadow:none; transition:color 0.2s; }
                    .resend-inline-btn:hover { color:#1b8a3e; transform:none; box-shadow:none; }
                    .resend-inline-btn:disabled { color:#94a3b8; cursor:not-allowed; text-decoration:none; }
                    .resend-feedback { margin-top:6px; font-size:12.5px; color:#166534; background:#f0fdf4; border-radius:8px; padding:6px 10px; border:1px solid #bbf7d0; }
                    .lp-input-field { width:100%; border:1px solid #c1c8c2; border-radius:10px; padding:0.8rem 1rem; font-size:0.95rem; color:#161d1f; font-family:Inter,sans-serif; box-sizing:border-box; transition:border-color 0.2s,box-shadow 0.2s; outline:none; background:#fff; margin-bottom:0; }
                    .lp-input-field:focus { border-color:#116c4a; box-shadow:0 0 0 3px rgba(17,108,74,0.12); }
                    .lp-input-field::placeholder { color:#9ca3af; }
                    .lp-field { margin-bottom:1.25rem; }
                    .lp-label { display:block; font-size:0.88rem; font-weight:600; color:#1e293b; margin-bottom:0.5rem; }
                    .lp-signin-btn { width:100%; background:#1b4332; color:#fff; border:none; padding:0.9rem; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:background 0.2s,transform 0.1s; box-shadow:0 4px 12px rgba(27,67,50,0.25); }
                    .lp-signin-btn:hover { background:#012d1d; }
                    .lp-signin-btn:active { transform:scale(0.98); }
                    `}
                </style>
                <div style={{ padding: '1.75rem 2.5rem 2rem' }}>


                {/* Success banner after email verification */}
                {justVerified && (
                    <div className="login-success-banner">
                        ✅ Email verified! You can now sign in.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="lp-field">
                        <label className="lp-label">Username or Email</label>
                        <input className="lp-input-field" type="text" name="username" placeholder="Enter your username" required />
                    </div>
                    <div className="lp-field">
                        <label className="lp-label">Password</label>
                        <input className="lp-input-field" type="password" name="password" placeholder="Enter your password" required />
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', fontSize:'0.875rem' }}>
                        <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', color:'#475569' }}>
                            <input type="checkbox" style={{ width:'auto', margin:0 }} /> Remember me
                        </label>
                        <a href="#" style={{ color:'#116c4a', fontWeight:600, textDecoration:'none', fontSize:'0.875rem' }}>Forgot password?</a>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span className="icon">✖</span>
                            <div>
                                <span>{error}</span>
                                {needsVerify && (
                                    <div className="verify-hint">
                                        <span>📧 Resend the code?</span>
                                        <button id="login-resend-otp-btn" type="button" className="resend-inline-btn"
                                            onClick={handleResend} disabled={resending}>
                                            {resending ? 'Sending…' : 'Resend verification code'}
                                        </button>
                                        <span>or</span>
                                        <Link to="/verify-email" state={{ email: userEmail }} className="auth-link" style={{ fontSize:'13px' }}>
                                            Enter code
                                        </Link>
                                    </div>
                                )}
                                {resendMsg && <div className="resend-feedback">{resendMsg}</div>}
                            </div>
                        </div>
                    )}

                    <button className="lp-signin-btn" type="submit">Sign In</button>
                </form>

                <div style={{ height:'1px', background:'#e8eff1', margin:'1.5rem 0 1.25rem' }} />
                <p style={{ textAlign:'center', fontSize:'0.9rem', color:'#64748b', margin:0 }}>
                    Don't have an account? <Link to="/register" style={{ color:'#116c4a', fontWeight:700, textDecoration:'none' }}>Register</Link>
                </p>
            </div>
        </div>
        </div>
    );
};

export default Login;

