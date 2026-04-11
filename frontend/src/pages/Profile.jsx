import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { User, Mail, Shield } from "lucide-react";
import "../styles/dashboard.css"; // Ensure styles are pulled

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="loading">Loading...</div>;

    const roleLabels = {
        FARMER: "Farmer",
        BUYER: "Buyer",
        TRANSPORTER: "Transporter",
        ADMIN: "Admin",
    };

    return (
        <DashboardLayout activeTab="profile" setActiveTab={() => {}}>
            <div className="profile-page-container animate-in">
                <div className="glass-panel profile-glass-card max-600">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <h2>{user?.username || "Unknown User"}</h2>
                        <span className="status-badge delivered profile-role-badge">
                            {roleLabels[user?.role] || user?.role || "User"}
                        </span>
                    </div>

                    <div className="profile-divider"></div>

                    <div className="mini-list profile-details">
                        <div className="mini-item">
                            <div className="item-main" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                                <div className="stat-icon" style={{ background: "rgba(47, 143, 58, 0.1)", color: "#2f8f3a", width: "40px", height: "40px" }}>
                                    <User size={20} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "0.80rem", color: "#6b7280" }}>Username</span>
                                    <strong style={{ fontSize: "1rem", color: "#111827" }}>{user?.username || "Not set"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="mini-item">
                            <div className="item-main" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                                <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", width: "40px", height: "40px" }}>
                                    <Mail size={20} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "0.80rem", color: "#6b7280" }}>Email Address</span>
                                    <strong style={{ fontSize: "1rem", color: "#111827" }}>{user?.email || "No email provided"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="mini-item">
                            <div className="item-main" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                                <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", width: "40px", height: "40px" }}>
                                    <Shield size={20} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "0.80rem", color: "#6b7280" }}>Account Role</span>
                                    <strong style={{ fontSize: "1rem", color: "#111827" }}>{roleLabels[user?.role] || user?.role || "User"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
