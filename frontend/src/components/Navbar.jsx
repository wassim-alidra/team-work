import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    let { user, logoutUser } = useContext(AuthContext);
    const location = useLocation();
    
    // Logic to determine if we are on landing page or not (though App.jsx handles this for now)
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar fade-in">
            <Link to="/" className="navbar-brand">AgriGov Market</Link>
            
            {!isAuthPage && (
                <div className="navbar-nav-center">
                    <Link to="/" className="navbar-link">Home</Link>
                    <a href="#about" className="navbar-link">About Us</a>
                    <a href="#services" className="navbar-link">Services</a>
                    <a href="#contact" className="navbar-link">Contact</a>
                </div>
            )}

            <div className="navbar-nav-right">
                {user ? (
                    <>
                        <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginRight: '0.5rem' }}>
                            Hello, <strong style={{ color: 'var(--gray-900)' }}>{user.username}</strong>
                        </span>
                        <button onClick={logoutUser} className="navbar-btn-register" style={{ border: 'none' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/login" 
                            className="navbar-btn-login"
                            style={location.pathname === '/login' ? { color: 'var(--brand-600)', background: 'var(--brand-50)' } : {}}
                        >
                            Login
                        </Link>
                        <Link to="/register" className="navbar-btn-register">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
