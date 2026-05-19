import { Home, Package, ShoppingCart, Truck, Sprout, LogOut, Clock, Users, Bell, AlertCircle, LayoutGrid, Wrench, Landmark, BarChart2, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const Sidebar = ({ user, activeTab, setActiveTab, logoutUser, mobileOpen, setMobileOpen }) => {
  const { language, t } = useLanguage();
  const isAr = language === "ar";
  const transporterItems = [
    { key: "dashboard", label: t("dashboard"), icon: <Home size={18} /> },
    { key: "requests", label: t("deliveryRequests"), icon: <Package size={18} /> },
    { key: "status", label: t("updateStatus"), icon: <Truck size={18} /> },
    { key: "history", label: t("deliveryHistory"), icon: <Clock size={18} /> },
    { key: "earnings", label: t("earnings"), icon: <ShoppingCart size={18} /> },
    { key: "notifications", label: t("notifications"), icon: <Bell size={18} /> },
  ];

  const equipmentProviderItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "equipment", label: "My Equipment", icon: <Package size={18} /> },
    { key: "orders", label: "Inquiries", icon: <ShoppingCart size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  const farmerItems = [
    { key: "dashboard", label: t("dashboard"), icon: <Home size={18} /> },
    { key: "farms", label: t("farms"), icon: <LayoutGrid size={18} /> },
    { key: "products", label: t("products"), icon: <Package size={18} /> },
    { key: "orders", label: t("orders"), icon: <ShoppingCart size={18} /> },
    { key: "tracking", label: t("tracking"), icon: <Truck size={18} /> },
    { key: "equipment", label: t("equipment"), icon: <Wrench size={18} /> },
    { key: "prices", label: t("prices"), icon: <Package size={18} /> },
    { key: "setistics", label: t("setistics"), icon: <BarChart2 size={18} /> },
    { key: "notifications", label: t("notifications"), icon: <Bell size={18} /> },
    { key: "complaints", label: t("complaints"), icon: <LogOut size={18} /> },
  ];

  const buyerItems = [
    { key: "dashboard", label: t("dashboard"), icon: <Home size={18} /> },
    { key: "products", label: t("marketplace"), icon: <Package size={18} /> },
    { key: "orders", label: t("orders"), icon: <Clock size={18} /> },
    { key: "tracking", label: t("tracking"), icon: <Truck size={18} /> },
    { key: "notifications", label: t("notifications"), icon: <Bell size={18} /> },
    { key: "complaints", label: t("complaints"), icon: <LogOut size={18} /> },
  ];

  const adminItems = [
    { key: "dashboard", label: "Overview", icon: <Home size={18} /> },
    { key: "users", label: "Users Management", icon: <Users size={18} /> },
    { key: "farm-approvals", label: "Farm Approvals", icon: <Landmark size={18} /> },
    { key: "setistics", label: "Statistics", icon: <BarChart2 size={18} /> },
    { key: "categories", label: "Categories", icon: <LayoutGrid size={18} /> },
    { key: "complaints", label: "Complaints", icon: <AlertCircle size={18} /> },
    { key: "catalog", label: "Official Prices", icon: <Package size={18} /> },
    { key: "notifications", label: "Alert Users", icon: <Bell size={18} /> },
  ];

  const genericItems = [
    { key: "dashboard", label: t("dashboard"), icon: <Home size={18} /> },
    {
      key: "products",
      label: user?.role === "BUYER" ? t("marketplace") : t("products"),
      icon: <Package size={18} />,
    },
    { key: "orders", label: t("orders"), icon: <ShoppingCart size={18} /> },
    { key: "services", label: "Services", icon: <Sprout size={18} /> },
  ];

  let menuItems = genericItems;
  if (user?.role === "TRANSPORTER") menuItems = transporterItems;
  if (user?.role === "FARMER") menuItems = farmerItems;
  if (user?.role === "BUYER") menuItems = buyerItems;
  if (user?.role === "ADMIN") menuItems = adminItems;
  if (user?.role === "EQUIPMENT_PROVIDER") menuItems = equipmentProviderItems;

  const handleNavClick = (key) => {
    setActiveTab(key);
    // Close mobile drawer after navigation
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`dashboard-sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
        style={{ display: "flex", flexDirection: "column" }}
        dir={isAr ? "rtl" : "ltr"}
        aria-label="Sidebar navigation"
      >
        {/* Mobile close button */}
        <button
          className="sidebar-mobile-close"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>

        <div
          className="sidebar-brand"
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "5px"
          }}
        >
          <img
            src="/Agrigove web site.PNG"
            alt="AgriGov Logo"
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain"
            }}
          />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeTab === item.key ? "active" : ""}`}
              onClick={() => handleNavClick(item.key)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout at bottom */}
        {logoutUser && (
          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={logoutUser}>
              <LogOut size={18} />
              <span>{t("logout")}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;