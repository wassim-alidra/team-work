import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div className="auth-container fade-in">
            <div className="glass-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to access your AgriGov Market account</p>
                <form onSubmit={loginUser}>
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

                    <button type="submit" style={{ width: '100%' }}>Sign In</button>
                </form>
                
                <p className="auth-footer">
                    Don’t have an account? <Link to="/register" className="auth-link">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
