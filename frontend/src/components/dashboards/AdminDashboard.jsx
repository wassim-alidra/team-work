import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Users, Home, AlertCircle, Bell, TrendingUp, Package, ShoppingCart, CheckCircle } from "lucide-react";
import "../../styles/dashboard.css";

const AdminDashboard = ({ activeTab }) => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [notifMessage, setNotifMessage] = useState("");
    const [notifTarget, setNotifTarget] = useState("all");
    const [catalogForm, setCatalogForm] = useState({ name: "", description: "", min_price: "", max_price: "" });
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tempMessage, setTempMessage] = useState("");

    useEffect(() => {
        if (activeTab === "dashboard") fetchStats();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "complaints") fetchComplaints();
        if (activeTab === "catalog") fetchCatalog();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get("market/admin-stats/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get("market/users-list/");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserAction = async (actionType, id) => {
        if (actionType === 'delete_account' && !window.confirm("Are you sure you want to delete this account? This action cannot be fully undone.")) return;
        setLoading(true);
        try {
            await api.post(`market/users-list/${id}/${actionType}/`);
            setTempMessage(`User ${actionType === 'suspend' ? 'suspended' : actionType === 'activate' ? 'activated' : 'deleted'} successfully.`);
            fetchUsers();
            
            setSelectedUser(prev => {
                if (!prev) return prev;
                if (actionType === 'delete_account') return { ...prev, is_deleted: true, is_active: false };
                if (actionType === 'suspend') return { ...prev, is_active: false };
                if (actionType === 'activate') return { ...prev, is_active: true };
                return prev;
            });
            
            setTimeout(() => setTempMessage(""), 3000);
        } catch (err) {
            alert("Error processing action: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await api.get("market/complaints/");
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const targetLabel = { farmers: "Farmers", buyers: "Buyers", all: "Farmers & Buyers" };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifMessage) return;
        setLoading(true);
        try {
            await api.post("market/notifications/send_broadcast/", { message: notifMessage, target: notifTarget });
            alert(`Broadcast sent successfully to all ${targetLabel[notifTarget]}!`);
            setNotifMessage("");
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || "Error sending notification. Please try again.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalog = async () => {
        try {
            const res = await api.get("market/catalog/");
            setCatalog(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCatalogItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("market/catalog/", catalogForm);
            alert("Added to catalog!");
            setCatalogForm({ name: "", description: "", min_price: "", max_price: "" });
            fetchCatalog();
        } catch (err) {
            alert("Error adding to catalog");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCatalogItem = async (id) => {
        if (!window.confirm("Remove this product from the official list?")) return;
        try {
            await api.delete(`market/catalog/${id}/`);
            fetchCatalog();
        } catch (err) {
            alert("Error removing item");
        }
    };

    const handleResolveComplaint = async (id) => {
        try {
            await api.patch(`market/complaints/${id}/`, { is_resolved: true });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    if (activeTab === "dashboard") {
        if (!stats) return <div className="loading-spinner">Loading statistics...</div>;
        
        const metricCards = [
            { label: "Total Users", value: stats.total_users, icon: <Users />, color: "blue" },
            { label: "Revenue (DA)", value: stats.total_revenue, icon: <TrendingUp />, color: "green" },
            { label: "Total Products", value: stats.total_products, icon: <Package />, color: "purple" },
            { label: "Active Orders", value: stats.total_orders, icon: <ShoppingCart />, color: "orange" },
        ];

        return (
            <div className="admin-overview animate-in">
                <div className="stats-grid">
                    {metricCards.map((m, i) => (
                        <div key={i} className={`stat-card stat-${m.color}`}>
                            <div className="stat-icon">{m.icon}</div>
                            <div className="stat-info">
                                <h3>{m.value}</h3>
                                <p>{m.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-sections mt-2">
                    <div className="glass-panel">
                        <h3>Actor Distribution</h3>
                        <div className="distribution-list">
                            <div className="dist-item"><span>Farmers:</span> <strong>{stats.farmers_count}</strong></div>
                            <div className="dist-item"><span>Buyers:</span> <strong>{stats.buyers_count}</strong></div>
                            <div className="dist-item"><span>Transporters:</span> <strong>{stats.transporters_count}</strong></div>
                        </div>
                    </div>
                    <div className="glass-panel">
                        <h3>Critical Alerts</h3>
                        <div className="alert-item">
                            <AlertCircle size={20} color="#ef4444" />
                            <span>{stats.pending_complaints} Pending Complaints</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "users") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Platform Users</h2>
                    <p>Management and overview of all registered actors</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.username}</strong></td>
                                    <td><span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.is_deleted ? (
                                            <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>Deleted</span>
                                        ) : u.is_active ? (
                                            <span className="status-badge" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Active</span>
                                        ) : (
                                            <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>Suspended</span>
                                        )}
                                    </td>
                                    <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-secondary-sm" onClick={() => setSelectedUser(u)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* User Details Modal */}
                {selectedUser && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="modal-content animate-in glass-panel" style={{ maxWidth: '550px', width: '90%', padding: '2rem', position: 'relative' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#10b981' }}>User Details</h3>
                                <button className="close-btn" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }} onClick={() => { setSelectedUser(null); setTempMessage(""); }}>×</button>
                            </div>
                            {tempMessage && <div className="alert alert-success" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', border: '1px solid #a7f3d0' }}>{tempMessage}</div>}
                            <div className="modal-body" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#334155' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.8rem' }}>
                                    <strong>Username:</strong> <span>{selectedUser.username}</span>
                                    <strong>Full Name:</strong> <span>{selectedUser.first_name || '-'} {selectedUser.last_name || '-'}</span>
                                    <strong>Email:</strong> <span>{selectedUser.email}</span>
                                    <strong>Role:</strong> <span><span className={`role-pill role-${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span></span>
                                    <strong>Status:</strong> <span>
                                        {selectedUser.is_deleted ? "Deleted" : selectedUser.is_active ? "Active" : "Suspended"}
                                    </span>
                                    <strong>Joined Date:</strong> <span>{new Date(selectedUser.date_joined).toLocaleDateString()}</span>
                                    {selectedUser.extra_info && <><strong>Profile Info:</strong> <span>{selectedUser.extra_info}</span></>}
                                </div>
                            </div>
                            <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                {!selectedUser.is_deleted && (
                                    <>
                                        {selectedUser.is_active ? (
                                            <button className="btn-danger-outline" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleUserAction('suspend', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Suspend"}
                                            </button>
                                        ) : (
                                            <button className="btn-success" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', color: '#fff', backgroundColor: '#10b981', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleUserAction('activate', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Activate"}
                                            </button>
                                        )}
                                        <button className="btn-danger" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', color: '#fff', backgroundColor: '#ef4444', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleUserAction('delete_account', selectedUser.id)} disabled={loading}>
                                            {loading ? "..." : "Delete"}
                                        </button>
                                    </>
                                )}
                                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setSelectedUser(null); setTempMessage(""); }}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "complaints") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>System Complaints</h2>
                    <p>Review issues reported by users</p>
                </div>
                <div className="complaints-feed">
                    {complaints.map(c => (
                        <div key={c.id} className={`complaint-card ${c.is_resolved ? 'resolved' : ''}`}>
                            <div className="complaint-head">
                                <strong>{c.username}</strong>
                                <span className="timestamp">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <h3>{c.subject}</h3>
                            <p>{c.message}</p>
                            {!c.is_resolved && (
                                <button className="btn-success-sm" onClick={() => handleResolveComplaint(c.id)}>Mark as Resolved</button>
                            )}
                        </div>
                    ))}
                    {complaints.length === 0 && <p className="empty-text">No complaints found.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "catalog") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Official Product Catalog</h2>
                    <p>Manage the list of products farmers are allowed to sell</p>
                </div>

                <form className="expanded-form mb-2" onSubmit={handleAddCatalogItem}>
                    <div className="grid-form">
                        <div className="form-group span-2">
                            <label>Product Type Name</label>
                            <input 
                                value={catalogForm.name} 
                                onChange={(e) => setCatalogForm({...catalogForm, name: e.target.value})}
                                placeholder="e.g. Red Sweet Tomatoes" 
                                required
                            />
                        </div>
                        <div className="form-group span-2">
                            <label>Official Description (Global)</label>
                            <textarea 
                                value={catalogForm.description}
                                onChange={(e) => setCatalogForm({...catalogForm, description: e.target.value})}
                                placeholder="General description for this product type..." 
                                rows="2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Min Price (DA/kg)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={catalogForm.min_price}
                                onChange={(e) => setCatalogForm({...catalogForm, min_price: e.target.value})}
                                placeholder="e.g. 50"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Price (DA/kg)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={catalogForm.max_price}
                                onChange={(e) => setCatalogForm({...catalogForm, max_price: e.target.value})}
                                placeholder="e.g. 200"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary mt-1" disabled={loading}>
                        {loading ? "Adding..." : "Add to Official List"}
                    </button>
                </form>

                <div className="inventory-list mt-2">
                    <h3>Defined Products</h3>
                    <div className="grid-list">
                        {catalog.map(item => (
                            <div key={item.id} className="card-item animate-in">
                                <div className="card-content">
                                    <h3>{item.name}</h3>
                                    <p className="p-desc">{item.description}</p>
                                    {(item.min_price || item.max_price) && (
                                        <div className="price-range-badge">
                                            <span>💰 {item.min_price ?? "--"} – {item.max_price ?? "--"} DA/kg</span>
                                        </div>
                                    )}
                                </div>
                                <button className="btn-danger-outline full-width" onClick={() => handleDeleteCatalogItem(item.id)}>Remove from Catalog</button>
                            </div>
                        ))}
                        {catalog.length === 0 && <p className="empty-text">Catalog is empty.</p>}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="glass-panel animate-in max-600">
                <div className="section-header">
                    <h2>Send Official Broadcast</h2>
                    <p>Choose the audience and compose your ministerial notification</p>
                </div>
                <form className="admin-form" onSubmit={handleSendNotification}>
                    <div className="form-group">
                        <label>Send To</label>
                        <div className="notif-target-group">
                            {["all", "farmers", "buyers"].map(opt => (
                                <label key={opt} className={`notif-target-btn ${notifTarget === opt ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="notifTarget"
                                        value={opt}
                                        checked={notifTarget === opt}
                                        onChange={() => setNotifTarget(opt)}
                                    />
                                    {opt === "all" ? "🌾 Farmers & 🛒 Buyers" : opt === "farmers" ? "🌾 Farmers Only" : "🛒 Buyers Only"}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Minister Message</label>
                        <textarea
                            rows="5"
                            placeholder="Type your official announcement here..."
                            value={notifMessage}
                            onChange={(e) => setNotifMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-primary-lg" disabled={loading}>
                        {loading ? "Sending..." : `Send to ${targetLabel[notifTarget]}`}
                    </button>
                </form>
            </div>
        );
    }

    return null;
};

export default AdminDashboard;
