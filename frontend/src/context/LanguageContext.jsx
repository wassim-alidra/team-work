import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const translations = {
  en: {
    // Sidebar - Common/Farmer/Buyer/Transporter
    dashboard: "Dashboard",
    farms: "My Farms",
    products: "My Products",
    orders: "My Orders",
    tracking: "Track Delivery",
    equipment: "Equipment Rental",
    prices: "Official Prices",
    setistics: "Statistics",
    notifications: "Notifications",
    complaints: "Complaints",
    logout: "Logout",
    marketplace: "Marketplace",
    deliveryRequests: "Delivery Requests",
    updateStatus: "Update Status",
    deliveryHistory: "Delivery History",
    earnings: "Earnings",

    // Topbar
    welcome: "Welcome back",
    dashboardTitle: "Dashboard",

    // Farmer Dashboard Page titles
    farmerDashboardTitle: "Farmer Dashboard",
    farmerDashboardSubtitle: "Welcome back. Here is the latest overview of your farm's operations.",
    myFarmsTitle: "My Farms",
    myProductsTitle: "My Products",
    myOrdersTitle: "My Orders",
    trackDeliveryTitle: "Track Delivery",
    equipmentRentalTitle: "Equipment Rental",
    officialPricesTitle: "Official Prices",
    statisticsTitle: "Statistics",
    notificationsTitle: "Notifications",
    complaintsTitle: "Complaints",

    // Buyer Dashboard Page titles
    buyerDashboardTitle: "Buyer Dashboard",
    buyerDashboardSubtitle: "Welcome back. Monitor your purchases and track shipments.",
    globalMarketplaceTitle: "Global Marketplace",
    myPurchasesTitle: "My Purchases",
    trackDeliveriesTitle: "Track Deliveries",
    marketplaceHighlightsTitle: "Marketplace Highlights",
    activeDeliveriesTitle: "Active Deliveries",
    onTheWay: "On The Way",
    delivered: "Delivered",
    totalSpent: "Total Spent",

    // Transporter Dashboard Page titles
    transporterDashboardTitle: "Transporter Dashboard",
    transporterDashboardSubtitle: "Manage your fleet and deliveries.",
    availableDeliveryRequestsTitle: "Available Delivery Requests",
    updateDeliveryStatusTitle: "Update Delivery Status",
    vehicleProfileTitle: "Vehicle Profile",
    available: "Available",
    active: "Active",
    completed: "Completed",
    readyForPickup: "Ready for Pickup",
    financeSummary: "Finance Summary",
  },
  ar: {
    // Sidebar - Common/Farmer/Buyer/Transporter
    dashboard: "لوحة التحكم",
    farms: "مزارعي",
    products: "منتجاتي",
    orders: "طلباتي",
    tracking: "تتبع التوصيل",
    equipment: "تأجير المعدات",
    prices: "الأسعار الرسمية",
    setistics: "الإحصائيات",
    notifications: "الإشعارات",
    complaints: "الشكاوى",
    logout: "تسجيل الخروج",
    marketplace: "السوق",
    deliveryRequests: "طلبات التوصيل",
    updateStatus: "تحديث الحالة",
    deliveryHistory: "سجل التوصيل",
    earnings: "الأرباح",

    // Topbar
    welcome: "مرحباً بعودتك",
    dashboardTitle: "لوحة التحكم",

    // Farmer Dashboard Page titles
    farmerDashboardTitle: "لوحة تحكم المزارع",
    farmerDashboardSubtitle: "مرحباً بعودتك. إليك آخر نظرة عامة على عمليات مزرعتك.",
    myFarmsTitle: "مزارعي",
    myProductsTitle: "منتجاتي",
    myOrdersTitle: "طلباتي",
    trackDeliveryTitle: "تتبع التوصيل",
    equipmentRentalTitle: "تأجير المعدات",
    officialPricesTitle: "الأسعار الرسمية",
    statisticsTitle: "الإحصائيات",
    notificationsTitle: "الإشعارات",
    complaintsTitle: "الشكاوى",

    // Buyer Dashboard Page titles
    buyerDashboardTitle: "لوحة تحكم المشتري",
    buyerDashboardSubtitle: "مرحباً بعودتك. راقب مشترياتك وتتبع الشحنات.",
    globalMarketplaceTitle: "السوق العالمي",
    myPurchasesTitle: "مشترياتي",
    trackDeliveriesTitle: "تتبع التوصيلات",
    marketplaceHighlightsTitle: "أبرز معالم السوق",
    activeDeliveriesTitle: "التوصيلات النشطة",
    onTheWay: "في الطريق",
    delivered: "تم التوصيل",
    totalSpent: "إجمالي الإنفاق",

    // Transporter Dashboard Page titles
    transporterDashboardTitle: "لوحة تحكم الناقل",
    transporterDashboardSubtitle: "إدارة أسطولك وتوصيلاتك.",
    availableDeliveryRequestsTitle: "طلبات التوصيل المتاحة",
    updateDeliveryStatusTitle: "تحديث حالة التوصيل",
    vehicleProfileTitle: "ملف المركبة",
    available: "المتاحة",
    active: "النشطة",
    completed: "المكتملة",
    readyForPickup: "جاهز للاستلام",
    financeSummary: "الملخص المالي",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () =>
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));

  const t = (key) => translations[language]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
