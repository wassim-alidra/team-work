import { Bell, ChevronDown, User, LogOut, Menu } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

import api from "../../api/axios";

const Topbar = ({ user, setActiveTab, onMenuToggle }) => {
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const roleLabels = {
    FARMER: "Farmer",
    BUYER: "Buyer",
    TRANSPORTER: "Transporter",
    ADMIN: "Admin",
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("market/notifications/");
      const data = res.data.results || res.data;
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(sorted);
        setUnreadCount(sorted.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(false);
    if (setActiveTab) {
      setActiveTab("notifications");
    } else {
      navigate("/dashboard?tab=notifications");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("market/notifications/mark_all_as_read/");
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
    handleNotificationClick();
  };

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
      {/* Hamburger menu (mobile only) */}
      <button
        className="topbar-hamburger"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      <div className="topbar-left">
        <h1>Dashboard</h1>
        <p className="topbar-welcome">Welcome back, {user?.username}</p>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <div className="topbar-notifications-wrapper" ref={notificationsRef}>
          <button
            className={`topbar-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="notifications-dropdown fade-in-slide">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className="unread-dot-label">{unreadCount} new</span>}
              </div>

              <div className="notifications-list custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      className={`notification-preview-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={handleNotificationClick}
                    >
                      <div className="notification-dot"></div>
                      <div className="notification-content">
                        <p className="notification-msg">{n.message}</p>
                        <span className="notification-time">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>

              <button className="view-all-btn" onClick={handleNotificationClick}>
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="topbar-user" ref={dropdownRef}>
          <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.profile_image ? (
              <img
                src={
                  user.profile_image.startsWith("http")
                    ? user.profile_image
                    : `http://${window.location.hostname}:8000${user.profile_image}`
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user?.username?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>
          <div className="topbar-user-info topbar-user-info--desktop" onClick={() => setDropdownOpen(!dropdownOpen)}>
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