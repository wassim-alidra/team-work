import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { Truck, ClipboardList, CheckCircle, DollarSign, Save, Package, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import RouteMapModal from "./RouteMapModal";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";

const TransporterDashboard = ({ activeTab }) => {
    const { user, setUser } = useContext(AuthContext);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [availableOrdersCount, setAvailableOrdersCount] = useState(0);
    const [availableOrdersPage, setAvailableOrdersPage] = useState(1);

    const [myDeliveries, setMyDeliveries] = useState([]);
    const [myDeliveriesCount, setMyDeliveriesCount] = useState(0);
    const [myDeliveriesPage, setMyDeliveriesPage] = useState(1);
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, completed_count: 0, history: [] });
    const [profileForm, setProfileForm] = useState({
        vehicle_type: "",
        license_plate: "",
        capacity: 0
    });
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (activeTab === "dashboard" || activeTab === "requests") fetchAvailableOrders(availableOrdersPage);
        if (activeTab === "dashboard" || activeTab === "status") fetchMyDeliveries(null, myDeliveriesPage);
        if (activeTab === "history") fetchMyDeliveries("DELIVERED", myDeliveriesPage);
        if (activeTab === "earnings") fetchEarnings();
        if (activeTab === "profile") {
            setProfileForm({
                vehicle_type: user.profile?.vehicle_type || "",
                license_plate: user.profile?.license_plate || "",
                capacity: user.profile?.capacity || 0
            });
        }
    }, [activeTab, availableOrdersPage, myDeliveriesPage]);

    const fetchAvailableOrders = async (page = 1) => {
        try {
            const res = await api.get(`market/deliveries/available_orders/?page=${page}`);
            if (res.data.results) {
                setAvailableOrders(res.data.results);
                setAvailableOrdersCount(res.data.count);
            } else {
                setAvailableOrders(res.data);
                setAvailableOrdersCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching available orders:", err);
        }
    };

    const fetchMyDeliveries = async (statusFilter = null, page = 1) => {
        try {
            let url = `market/deliveries/?page=${page}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            const res = await api.get(url);
            if (res.data.results) {
                setMyDeliveries(res.data.results);
                setMyDeliveriesCount(res.data.count);
            } else {
                setMyDeliveries(res.data);
                setMyDeliveriesCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching deliveries:", err);
        }
    };

    const fetchEarnings = async () => {
        try {
            const res = await api.get("market/deliveries/earnings/");
            setEarningsData(res.data);
        } catch (err) {
            console.error("Error fetching earnings:", err);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await api.post("market/deliveries/", { order: orderId });
            alert("Delivery accepted!");
            fetchAvailableOrders();
        } catch (err) {
            alert("Error accepting delivery");
        }
    };

    const handleUpdateStatus = async (deliveryId, status) => {
        try {
            await api.patch(`market/deliveries/${deliveryId}/`, { status });
            fetchMyDeliveries();
            if (status === "DELIVERED") fetchEarnings();
        } catch (err) {
            alert("Error updating status");
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.patch("users/me/", profileForm);
            setUser({ ...user, profile: { ...user.profile, ...res.data } });
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────── DASHBOARD TAB ───────────────────
    if (activeTab === "dashboard") {
        const stats = [
            { label: "Available", value: availableOrders.length, icon: <ClipboardList />, color: "blue" },
            { label: "Active", value: myDeliveries.filter(d => d.status !== "DELIVERED").length, icon: <Truck />, color: "green" },
            { label: "Completed", value: myDeliveries.filter(d => d.status === "DELIVERED").length, icon: <CheckCircle />, color: "purple" },
            { label: "Earnings", value: `${earningsData.total_earnings || 0} DA`, icon: <DollarSign />, color: "yellow" }
        ];

        return (
            <>
                <div className="transporter-home">
                    <div className="stats-grid">
                        {stats.map((s, i) => (
                            <div key={i} className={`stat-card stat-${s.color}`}>
                                <div className="stat-icon">{s.icon}</div>
                                <div className="stat-info">
                                    <h3>{s.value}</h3>
                                    <p>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-sections">
                        <div className="glass-panel">
                            <div className="panel-header">
                                <h3>Ready for Pickup</h3>
                                <button className="text-btn" onClick={() => fetchAvailableOrders()}>Refresh</button>
                            </div>
                            {availableOrders.length === 0 ? (
                                <p className="empty-text">No delivery requests available.</p>
                            ) : (
                                <div className="mini-list">
                                    {availableOrders.slice(0, 3).map(o => (
                                        <div key={o.id} className="mini-item">
                                            <div className="item-main">
                                                <strong>Order #{o.id}</strong>
                                                <span>{o.product_name}</span>
                                            </div>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="btn-sm"
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        background: "rgba(59,130,246,0.15)",
                                                        border: "1px solid rgba(59,130,246,0.4)",
                                                        color: "#93c5fd"
                                                    }}
                                                    onClick={() => setSelectedOrder(o)}
                                                >
                                                    <MapPin size={13} /> View
                                                </button>
                                                <button className="btn-sm" onClick={() => handleAccept(o.id)}>Accept</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="glass-panel">
                            <div className="panel-header">
                                <h3>Active Deliveries</h3>
                            </div>
                            {myDeliveries.filter(d => d.status !== "DELIVERED").length === 0 ? (
                                <p className="empty-text">No active missions.</p>
                            ) : (
                                <div className="mini-list">
                                    {myDeliveries.filter(d => d.status !== "DELIVERED").slice(0, 3).map(d => (
                                        <div key={d.id} className="mini-item">
                                            <div className="item-main">
                                                <strong>Delivery #{d.id}</strong>
                                                <span className={`status-pill ${d.status.toLowerCase()}`}>{d.status}</span>
                                            </div>
                                            <Truck size={16} color="#6b7280" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedOrder && (
                    <RouteMapModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onAccept={async (orderId) => { await handleAccept(orderId); setSelectedOrder(null); }}
                    />
                )}
            </>
        );
    }

    // ─────────────────── REQUESTS TAB ───────────────────
    if (activeTab === "requests") {
        return (
            <>
                <div className="glass-panel">
                    <div className="section-header">
                        <h2>Available Delivery Requests</h2>
                        <p>Missions waiting for a transporter</p>
                    </div>
                    <div className="grid-list">
                        {availableOrders.map(o => (
                            <div key={o.id} className="card-item animate-in">
                                <div className="card-badge">Available</div>
                                <div className="card-content">
                                    <h3>Order #{o.id}</h3>
                                    <div className="detail-row">
                                        <Package size={16} />
                                        <span>{o.product_name} — {o.quantity} kg</span>
                                    </div>
                                    <div className="detail-row" style={{ marginTop: 4 }}>
                                        <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Value:</span>
                                        <span style={{ fontSize: "0.78rem", color: "#facc15", fontWeight: 600 }}>{o.total_price} DA</span>
                                    </div>
                                    <div className="route-flow" style={{ marginTop: 10 }}>
                                        <div className="node">
                                            <div className="dot green"></div>
                                            <span style={{ fontSize: "0.75rem" }}>{o.farmer_wilaya || "Farmer"}</span>
                                        </div>
                                        <div className="line"></div>
                                        <div className="node">
                                            <div className="dot blue"></div>
                                            <span style={{ fontSize: "0.75rem" }}>{o.buyer_wilaya || "Buyer"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            flex: 1, display: "flex", alignItems: "center",
                                            justifyContent: "center", gap: 6,
                                            background: "linear-gradient(135deg,#1d4ed8,#1e40af)",
                                            boxShadow: "0 4px 12px rgba(29,78,216,0.3)"
                                        }}
                                        onClick={() => setSelectedOrder(o)}
                                    >
                                        <MapPin size={15} /> View Details
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{
                                            flex: 1,
                                            background: "linear-gradient(135deg,#16a34a,#15803d)",
                                            boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
                                        }}
                                        onClick={() => handleAccept(o.id)}
                                    >
                                        ✓ Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                        {availableOrders.length === 0 && (
                            <p className="empty-state">No requests available at the moment.</p>
                        )}
                    </div>
                    <Pagination 
                        currentPage={availableOrdersPage}
                        totalCount={availableOrdersCount}
                        pageSize={10}
                        onPageChange={setAvailableOrdersPage}
                    />
                </div>

                {selectedOrder && (
                    <RouteMapModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onAccept={async (orderId) => { await handleAccept(orderId); setSelectedOrder(null); }}
                    />
                )}
            </>
        );
    }

    // ─────────────────── STATUS TAB ───────────────────
    if (activeTab === "status") {
        const active = myDeliveries.filter(d => d.status !== "DELIVERED");
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h2>Update Delivery Status</h2>
                    <p>Manage your active missions</p>
                </div>
                <div className="grid-list">
                    {active.map(d => (
                        <div key={d.id} className="card-item status-card">
                            <div className="card-header">
                                <h3>Delivery #{d.id}</h3>
                                <span className={`status-badge ${d.status.toLowerCase()}`}>{d.status}</span>
                            </div>
                            <div className="progress-track">
                                <div className={`dot ${d.status === "ASSIGNED" || d.status === "IN_TRANSIT" ? "active" : ""}`}></div>
                                <div className={`line ${d.status === "IN_TRANSIT" ? "active" : ""}`}></div>
                                <div className={`dot ${d.status === "IN_TRANSIT" ? "active" : ""}`}></div>
                                <div className="line"></div>
                                <div className="dot"></div>
                            </div>
                            <div className="action-row">
                                {d.status === "ASSIGNED" ? (
                                    <button className="btn-secondary" onClick={() => handleUpdateStatus(d.id, "IN_TRANSIT")}>
                                        Start Transit
                                    </button>
                                ) : (
                                    <button className="btn-success" onClick={() => handleUpdateStatus(d.id, "DELIVERED")}>
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {active.length === 0 && <p className="empty-state">No active deliveries to update.</p>}
                </div>
            </div>
        );
    }

    // ─────────────────── HISTORY TAB ───────────────────
    if (activeTab === "history") {
        const history = myDeliveries.filter(d => d.status === "DELIVERED");
        return (
            <div className="glass-panel">
                <div className="section-header">
                    <h2>Delivery History</h2>
                    <p>Your completed missions</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Delivery ID</th>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Fee</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(d => (
                                <tr key={d.id}>
                                    <td>#{d.id}</td>
                                    <td>Order #{d.order}</td>
                                    <td>{new Date(d.delivery_date).toLocaleDateString()}</td>
                                    <td className="earning-text">{d.delivery_fee} DA</td>
                                    <td><span className="badge-success">Completed</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {history.length === 0 && <p className="empty-state">No history found.</p>}
                </div>
                <Pagination 
                    currentPage={myDeliveriesPage}
                    totalCount={myDeliveriesCount}
                    pageSize={10}
                    onPageChange={setMyDeliveriesPage}
                />
            </div>
        );
    }

    // ─────────────────── EARNINGS TAB ───────────────────
    if (activeTab === "earnings") {
        return (
            <div className="earnings-view">
                <div className="earnings-summary glass-panel">
                    <div className="summary-card">
                        <DollarSign size={32} className="icon-gold" />
                        <div>
                            <span>Total Earnings</span>
                            <h2>{earningsData.total_earnings} DA</h2>
                        </div>
                    </div>
                    <div className="summary-card">
                        <CheckCircle size={32} className="icon-green" />
                        <div>
                            <span>Missions Completed</span>
                            <h2>{earningsData.completed_count}</h2>
                        </div>
                    </div>
                </div>

                <div className="glass-panel mt-1">
                    <h3>Recent Payouts</h3>
                    <div className="mini-list">
                        {earningsData.history?.map(d => (
                            <div key={d.id} className="mini-item">
                                <span>Delivery #{d.id}</span>
                                <strong className="green-text">+{d.delivery_fee} DA</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────── PROFILE TAB ───────────────────
    if (activeTab === "profile") {
        return (
            <div className="glass-panel max-600">
                <div className="section-header">
                    <h2>Vehicle Profile</h2>
                    <p>Manage your transport capabilities</p>
                </div>
                <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                        <label>Vehicle Type</label>
                        <input
                            type="text"
                            value={profileForm.vehicle_type}
                            onChange={(e) => setProfileForm({ ...profileForm, vehicle_type: e.target.value })}
                            placeholder="e.g. Refrigerated Truck"
                        />
                    </div>
                    <div className="form-group">
                        <label>License Plate</label>
                        <input
                            type="text"
                            value={profileForm.license_plate}
                            onChange={(e) => setProfileForm({ ...profileForm, license_plate: e.target.value })}
                            placeholder="e.g. ABC-1234"
                        />
                    </div>
                    <div className="form-group">
                        <label>Capacity (Tons)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={profileForm.capacity}
                            onChange={(e) => setProfileForm({ ...profileForm, capacity: parseFloat(e.target.value) })}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Saving..." : <><Save size={18} /> Update Profile</>}
                    </button>
                </form>
            </div>
        );
    }

    return null;
};

export default TransporterDashboard;