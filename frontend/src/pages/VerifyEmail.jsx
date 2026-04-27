import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60; // must match backend OTP_EXPIRY_MINUTES

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Email is passed via router state from Register
    const email = location.state?.email || '';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [status, setStatus] = useState(''); // '' | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);
    const { setUser, setAuthTokens } = useContext(AuthContext);

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => setSecondsLeft(s => s - 1), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    // Redirect if no email provided
    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    const handleDigitChange = (idx, val) => {
        // Allow only single digit
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[idx] = digit;
        setDigits(next);
        // Auto-advance
        if (digit && idx < OTP_LENGTH - 1) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill('');
        [...pasted].forEach((ch, i) => { next[i] = ch; });
        setDigits(next);
        // Focus last filled input
        const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[lastIdx]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length < OTP_LENGTH) {
            setStatus('error');
            setMessage('Please enter all 6 digits.');
            return;
        }
        setStatus('loading');
        setMessage('');
        try {
            const res = await api.post('users/verify-email/', { email, code });
            setStatus('success');
            setMessage(res.data.message || 'Email verified! Logging you in...');
            
            // Auto-login logic
            const { access, refresh } = res.data;
            if (access && refresh) {
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                const decoded = jwtDecode(access);
                setAuthTokens({ access, refresh });
                setUser(decoded);
                
                // Small delay to show success state
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                // Fallback to login if no tokens returned
                setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
            }
        } catch (err) {
            setStatus('error');
            setMessage(
                err.response?.data?.error ||
                'Verification failed. Please check the code and try again.'
            );
        }
    };

    const handleResend = async () => {
        setResending(true);
        setMessage('');
        try {
            await api.post('users/resend-otp/', { email });
            setDigits(Array(OTP_LENGTH).fill(''));
            setSecondsLeft(EXPIRY_SECONDS);
            setStatus('');
            setMessage('A new code has been sent to your email.');
            inputRefs.current[0]?.focus();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to resend code. Please try again.');
            setStatus('error');
        } finally {
            setResending(false);
        }
    };

    const isExpired = secondsLeft <= 0;

    return (
        <div className="auth-page-wrapper">
            <style>{`
                .otp-card {
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.6);
                    border-radius: 1.75rem;
                    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.12), 0 12px 20px -6px rgba(0,0,0,0.06);
                    padding: 2.75rem 2.5rem;
                    width: 100%;
                    max-width: 440px;
                    text-align: center;
                    animation: fadeIn 0.45s ease;
                }
                .otp-icon {
                    width: 68px;
                    height: 68px;
                    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.25rem;
                    font-size: 2rem;
                    box-shadow: 0 4px 12px rgba(47,158,68,0.2);
                }
                .otp-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #1b5e20;
                    margin-bottom: 0.4rem;
                    background: linear-gradient(to right, #2f9e44, #1b8a3e);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .otp-subtitle {
                    font-size: 0.92rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }
                .otp-email {
                    font-weight: 700;
                    color: #1b5e20;
                }
                .otp-inputs {
                    display: flex;
                    justify-content: center;
                    gap: 0.6rem;
                    margin: 2rem 0 1.25rem;
                }
                .otp-digit {
                    width: 52px !important;
                    height: 58px;
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    border: 2px solid #cbd5e1;
                    border-radius: 0.9rem;
                    background: #f8fafc;
                    color: #1b5e20;
                    padding: 0 !important;
                    margin-bottom: 0 !important;
                    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
                    caret-color: #2f9e44;
                }
                .otp-digit:focus {
                    border-color: #2f9e44;
                    box-shadow: 0 0 0 4px rgba(47,158,68,0.18);
                    transform: scale(1.06);
                    background: #fff;
                    outline: none;
                }
                .otp-digit.filled {
                    border-color: #2f9e44;
                    background: #f0fdf4;
                }
                .otp-submit-btn {
                    width: 100%;
                    padding: 0.9rem;
                    font-size: 1rem;
                    font-weight: 700;
                    border-radius: 0.85rem;
                    background: linear-gradient(135deg, #2f9e44, #1b8a3e);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(47,158,68,0.3);
                    margin-bottom: 0;
                }
                .otp-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(47,158,68,0.35);
                }
                .otp-submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                }
                .otp-timer {
                    margin: 1rem 0 0.5rem;
                    font-size: 0.88rem;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .otp-timer .time {
                    font-weight: 700;
                    color: ${isExpired ? '#ef4444' : '#2f9e44'};
                    font-variant-numeric: tabular-nums;
                    font-size: 0.95rem;
                }
                .otp-timer.expired .time { color: #ef4444; }
                .resend-btn {
                    background: none;
                    border: none;
                    color: #2f9e44;
                    font-weight: 700;
                    font-size: 0.92rem;
                    cursor: pointer;
                    text-decoration: underline;
                    padding: 0;
                    box-shadow: none;
                    transition: color 0.2s;
                }
                .resend-btn:hover { color: #1b8a3e; transform: none; box-shadow: none; }
                .resend-btn:disabled { color: #94a3b8; cursor: not-allowed; text-decoration: none; }
                .otp-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    font-size: 0.88rem;
                    font-weight: 500;
                    margin: 0.75rem 0 0;
                    text-align: left;
                }
                .otp-alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
                .otp-alert.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
                .otp-alert.info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
                .otp-back {
                    display: block;
                    margin-top: 1.5rem;
                    font-size: 0.88rem;
                    color: #64748b;
                }
                .loading-dots::after {
                    content: '';
                    animation: dots 1.2s infinite;
                }
                @keyframes dots {
                    0%,20% { content: '.'; }
                    40%,60% { content: '..'; }
                    80%,100% { content: '...'; }
                }
            `}</style>

            <div className="auth-container" style={{ maxWidth: '480px' }}>
                <div className="otp-card">
                    <div className="otp-icon">📧</div>

                    <h2 className="otp-title">Verify Your Email</h2>
                    <p className="otp-subtitle">
                        We sent a 6-digit code to<br />
                        <span className="otp-email">{email}</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="otp-inputs" onPaste={handlePaste}>
                            {digits.map((d, i) => (
                                <input
                                    key={i}
                                    id={`otp-digit-${i}`}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={d}
                                    onChange={e => handleDigitChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className={`otp-digit${d ? ' filled' : ''}`}
                                    disabled={status === 'loading' || status === 'success'}
                                    autoFocus={i === 0}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            id="otp-submit-btn"
                            className="otp-submit-btn"
                            disabled={status === 'loading' || status === 'success' || isExpired}
                        >
                            {status === 'loading'
                                ? <span>Verifying<span className="loading-dots" /></span>
                                : status === 'success'
                                    ? '✓ Verified!'
                                    : 'Verify Email'}
                        </button>
                    </form>

                    {/* Timer */}
                    <div className={`otp-timer${isExpired ? ' expired' : ''}`}>
                        {isExpired ? (
                            <span>Code expired.</span>
                        ) : (
                            <>
                                <span>⏱ Code expires in</span>
                                <span className="time">{formatTime(secondsLeft)}</span>
                            </>
                        )}
                    </div>

                    {/* Resend */}
                    <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Didn't receive it?{' '}
                        <button
                            id="otp-resend-btn"
                            className="resend-btn"
                            onClick={handleResend}
                            disabled={resending || status === 'loading' || status === 'success'}
                            type="button"
                        >
                            {resending ? 'Sending…' : 'Resend code'}
                        </button>
                    </div>

                    {/* Feedback messages */}
                    {message && (
                        <div className={`otp-alert ${status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}`}>
                            <span>{status === 'success' ? '✅' : status === 'error' ? '✖' : 'ℹ️'}</span>
                            <span>{message}</span>
                        </div>
                    )}

                    <p className="otp-back">
                        Wrong email?{' '}
                        <Link to="/register" className="auth-link">Go back to register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
