import { Bell, Search, ChevronDown, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const Topbar = ({ user, activeTab }) => {
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

  const pageTitles = {
    dashboard: { title: "Dashboard", subtitle: "Overview of your transport operations" },
    requests: { title: "Delivery Requests", subtitle: "Find and accept new missions" },
    status: { title: "Active Deliveries", subtitle: "Update the status of your current trips" },
    history: { title: "Delivery History", subtitle: "Review your completed missions" },
    earnings: { title: "My Earnings", subtitle: "Track your income and performance" },
    profile: { title: "My Profile", subtitle: "Manage your vehicle and personal details" }
  };

  const currentHeader = pageTitles[activeTab] || { title: "Dashboard", subtitle: `Welcome back, ${user?.username}` };

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
        <h1>{currentHeader.title}</h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "4px" }}>
            {currentHeader.subtitle}
        </p>
      </div>

      <div className="topbar-right">
        <div className="topbar-user" ref={dropdownRef}>
          <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
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
              <button className="dropdown-item" >
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