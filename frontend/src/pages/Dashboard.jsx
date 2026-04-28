import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import FarmerDashboard from "../components/dashboards/FarmerDashboard";
import BuyerDashboard from "../components/dashboards/BuyerDashboard";
import TransporterDashboard from "../components/dashboards/TransporterDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import EquipmentProviderDashboard from "../components/dashboards/EquipmentProviderDashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("dashboard");
    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            // Clear the state so it doesn't persist on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    if (!user) return <div className="loading">Loading...</div>;
    
    // Check for admin approval status
    const isPending = user.approval_status === "pending" && user.role !== "ADMIN";

    if (isPending) {
        return (
            <DashboardLayout activeTab="dashboard" setActiveTab={() => {}}>
                <div className="pending-approval-container fade-in">
                    <style>{`
                        .pending-approval-container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 60vh;
                            text-align: center;
                            padding: 2rem;
                        }
                        .pending-card {
                            max-width: 600px;
                            width: 100%;
                            background: rgba(255, 255, 255, 0.8);
                            backdrop-filter: blur(16px);
                            border-radius: 2rem;
                            padding: 3.5rem 2rem;
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                        }
                        .pending-icon {
                            font-size: 4rem;
                            margin-bottom: 1.5rem;
                            display: inline-block;
                            animation: pulse 2s infinite;
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.1); opacity: 0.7; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .pending-title {
                            font-size: 1.8rem;
                            font-weight: 800;
                            color: #1b5e20;
                            margin-bottom: 1rem;
                        }
                        .pending-text {
                            color: #64748b;
                            line-height: 1.6;
                            font-size: 1.1rem;
                            margin-bottom: 2rem;
                        }
                        .status-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            background: #fff7ed;
                            color: #c2410c;
                            padding: 0.5rem 1.25rem;
                            border-radius: 99px;
                            font-weight: 700;
                            font-size: 0.9rem;
                            border: 1px solid #fed7aa;
                        }
                    `}</style>
                    
                    <div className="pending-card">
                        <div className="pending-icon">⏳</div>
                        <h2 className="pending-title">Account Under Review</h2>
                        <p className="pending-text">
                            Hello <strong>{user.username}</strong>! Your email has been verified successfully. 
                            However, your {user.role.toLowerCase()} account requires a final review by our administrative team.
                        </p>
                        
                        <div className="status-badge">
                            <span className="dot" style={{ width: 8, height: 8, background: '#f97316', borderRadius: '50%' }}></span>
                            Status: Pending Admin Approval
                        </div>
                        
                        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                            You will gain full access once your documents are approved.<br/>
                            This usually takes less than 24 hours.
                        </p>
                        
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ marginTop: '1.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                        >
                            🔄 Check Status
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

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
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
)}

            {user.role === "EQUIPMENT_PROVIDER" && (
                <EquipmentProviderDashboard activeTab={activeTab} />
            )}
        </DashboardLayout>
    );
};

export default Dashboard;