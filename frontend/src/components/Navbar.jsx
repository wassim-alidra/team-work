import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    let { user, logoutUser } = useContext(AuthContext);
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">AgriGov Market</Link>
            
            <div className="navbar-links">
                {user && <Link to="/dashboard" className="navbar-link">Dashboard</Link>}
                {user ? (
                    <>
                        <span style={{ color: '#475569', fontWeight: '500', marginRight: '0.5rem' }}>
                            Hello, <strong style={{ color: '#1e293b' }}>{user.username}</strong>
                        </span>
                        <button onClick={logoutUser} className="navbar-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link" style={isActive('/login') ? { color: 'var(--primary-color)', backgroundColor: '#f0fdf4' } : {}}>Login</Link>
                        <Link to="/register" className="navbar-btn">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
