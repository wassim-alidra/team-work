import { Bell, Search, ChevronDown, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const Topbar = ({ user }) => {
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleLabels = {
    FARMER: "Farmer",
    BUYER: "Buyer",
    TRANSPORTER: "Transporter",
    ADMIN: "Admin",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutUser();
  };

  const goToProfile = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-user" ref={dropdownRef}>
         <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
  {user?.profile_image ? (
    <img
      src={
        user.profile_image.startsWith("http")
          ? user.profile_image
          : `http://localhost:8000${user.profile_image}`
      }
      alt="Profile"
      className="w-full h-full object-cover rounded-full"
    />
  ) : (
    user?.username?.charAt(0)?.toUpperCase() || "U"
  )}
</div>
          <div className="topbar-user-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{user?.username}</span>
            <small>{roleLabels[user?.role] || user?.role}</small>
          </div>
          
          <button 
            className="topbar-dropdown-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Toggle user menu"
          >
            <ChevronDown 
              size={18} 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} 
            />
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown-menu fade-in-slide">
              <button className="dropdown-item" onClick={goToProfile}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;