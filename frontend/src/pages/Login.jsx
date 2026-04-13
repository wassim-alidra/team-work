import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    let { loginUser } = useContext(AuthContext);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        try {
            setError('');
            await loginUser(e);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page-wrapper fade-in">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to access your AgriGov Market account</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">Username or Email</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Enter your username" 
                            required 
                        />
                    </div>
                    
                    <div className="auth-form-group">
                        <label className="auth-label">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required 
                        />
                    </div>
                    
                    <div className="auth-extra-row">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: 'auto' }} /> Remember me
                        </label>
                        <a href="#" className="auth-link">Forgot password?</a>
                    </div>
                    
                    {error && (
                        <div className="alert alert-danger fade-in">
                            <span style={{ fontWeight: 'bold' }}>✖</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Sign In
                    </button>
                </form>
                
                <p className="auth-footer">
                    Don’t have an account? <Link to="/register" className="auth-link">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
