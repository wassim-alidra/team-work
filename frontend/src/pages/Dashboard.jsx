import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import FarmerDashboard from "../components/dashboards/FarmerDashboard";
import BuyerDashboard from "../components/dashboards/BuyerDashboard";
import TransporterDashboard from "../components/dashboards/TransporterDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("dashboard");

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {user.role === "FARMER" && (
                <FarmerDashboard activeTab={activeTab} />
            )}

            {user.role === "BUYER" && (
                <BuyerDashboard activeTab={activeTab} />
            )}

            {user.role === "TRANSPORTER" && (
                <TransporterDashboard activeTab={activeTab} />
            )}

            {user.role === "ADMIN" && (
                <AdminDashboard activeTab={activeTab} />
            )}
        </DashboardLayout>
    );
};

export default Dashboard;