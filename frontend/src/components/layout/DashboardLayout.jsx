import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logoutUser={logoutUser}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="dashboard-main">
                <Topbar
                    user={user}
                    setActiveTab={setActiveTab}
                    onMenuToggle={() => setMobileOpen(prev => !prev)}
                />
                <div className="dashboard-content">{children}</div>
            </div>
        </div>
    );
};

export default DashboardLayout;