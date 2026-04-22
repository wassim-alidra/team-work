import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Users, Home, AlertCircle, Bell, TrendingUp, Package, ShoppingCart, CheckCircle, Plus, MoreVertical, Pencil, Trash2, Clock, Leaf, Apple, Wheat, Drumstick, GlassWater, Flower, Sprout, Eye, EyeOff, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";

const AdminDashboard = ({ activeTab }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [usersPage, setUsersPage] = useState(1);

    const [complaints, setComplaints] = useState([]);
    const [complaintsCount, setComplaintsCount] = useState(0);
    const [complaintsPage, setComplaintsPage] = useState(1);

    const [catalog, setCatalog] = useState([]);
    const [catalogCount, setCatalogCount] = useState(0);
    const [catalogPage, setCatalogPage] = useState(1);

    const [notifMessage, setNotifMessage] = useState("");
    const [notifTarget, setNotifTarget] = useState("all");
    const [catalogForm, setCatalogForm] = useState({ name: "", description: "", min_price: "", max_price: "", category: "", unit: "kg" });
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null); // For Category card edit
    const [selectedCatalogItem, setSelectedCatalogItem] = useState(null); // For Catalog item edit
    const [loading, setLoading] = useState(false);
    const [tempMessage, setTempMessage] = useState("");
    const [catalogFilter, setCatalogFilter] = useState("all");
    
    // Categories Backend State
    const [categories, setCategories] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "", icon: "Leaf", color: "#dcfce7" });
    const [activeMenu, setActiveMenu] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);

    const getIconComponent = (name, size = 24) => {
        const icons = { Leaf, Apple, Wheat, Drumstick, GlassWater, Flower, Sprout };
        const Icon = icons[name] || Leaf;
        return <Icon size={size} />;
    };

    useEffect(() => {
        if (activeTab === "dashboard") fetchStats();
        if (activeTab === "users") fetchUsers(usersPage);
        if (activeTab === "complaints") fetchComplaints(complaintsPage);
        if (activeTab === "catalog") { fetchCatalog(null, null, catalogPage); fetchCategories(); }
        if (activeTab === "categories") fetchCategories();
    }, [activeTab, usersPage, complaintsPage, catalogPage]);

    const fetchCategories = async () => {
        setCategoryLoading(true);
        try {
            const res = await api.get("market/categories/");
            const data = res.data.results || res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            alert("Failed to load categories.");
        } finally {
            setCategoryLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("market/admin-stats/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            const res = await api.get(`market/users-list/?page=${page}`);
            // If backend is paginated, it returns { count, results }
            if (res.data.results) {
                setUsers(res.data.results);
                setUsersCount(res.data.count);
            } else {
                setUsers(res.data);
                setUsersCount(res.data.length);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserAction = async (actionType, id) => {
        if (actionType === 'delete_account' && !window.confirm("Are you sure you want to delete this account? This action cannot be fully undone.")) return;
        setLoading(true);
        try {
            await api.post(`market/users-list/${id}/${actionType}/`);
            let successText = actionType;
            if (actionType === 'suspend') successText = 'suspended';
            else if (actionType === 'activate') successText = 'activated';
            else if (actionType === 'delete_account') successText = 'deleted';
            else if (actionType === 'approve_account') successText = 'approved';
            
            setTempMessage(`User ${successText} successfully.`);
            fetchUsers();
            
            setSelectedUser(prev => {
                if (!prev) return prev;
                if (actionType === 'delete_account') return { ...prev, is_deleted: true, is_active: false };
                if (actionType === 'suspend') return { ...prev, is_active: false };
                if (actionType === 'activate') return { ...prev, is_active: true };
                if (actionType === 'approve_account') return { ...prev, approval_status: 'approved' };
                return prev;
            });
            
            setTimeout(() => setTempMessage(""), 3000);
        } catch (err) {
            alert("Error processing action: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchComplaints = async (page = 1) => {
        try {
            const res = await api.get(`market/complaints/?page=${page}`);
            if (res.data.results) {
                setComplaints(res.data.results);
                setComplaintsCount(res.data.count);
            } else {
                setComplaints(res.data);
                setComplaintsCount(res.data.length);
            }
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

    const fetchCatalog = async (categoryId = null, search = null, page = 1) => {
        // Use provided values or current state
        const finalCategory = categoryId !== null ? categoryId : catalogFilter;
        const finalSearch = search !== null ? search : searchQuery;

        try {
            let params = [];
            if (finalCategory && finalCategory !== "all") params.push(`category=${finalCategory}`);
            if (finalSearch) params.push(`search=${encodeURIComponent(finalSearch)}`);
            params.push(`page=${page}`);
            
            let url = "market/catalog/";
            if (params.length > 0) url += "?" + params.join("&");
            
            const res = await api.get(url);
            if (res.data.results) {
                setCatalog(res.data.results);
                setCatalogCount(res.data.count);
            } else {
                setCatalog(res.data);
                setCatalogCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching catalog:", err);
        }
    };

    const fetchPriceHistory = async (productId) => {
        setLoading(true);
        try {
            const res = await api.get(`market/price-history/?product=${productId}`);
            setPriceHistory(res.data);
            setShowHistoryModal(true);
        } catch (err) {
            alert("Error fetching price history");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCatalogItem = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!catalogForm.name || !catalogForm.min_price || !catalogForm.max_price || !catalogForm.category) {
            alert("Please fill in all required fields including category.");
            return;
        }

        setLoading(true);
        try {
            if (selectedCatalogItem) {
                await api.patch(`market/catalog/${selectedCatalogItem.id}/`, catalogForm);
                alert("Official price updated successfully!");
            } else {
                await api.post("market/catalog/", catalogForm);
                alert("New product added to official price list!");
            }
            
            // Success cleanup
            setCatalogForm({ name: "", description: "", min_price: "", max_price: "", category: "", unit: "kg" });
            setSelectedCatalogItem(null);
            setShowAddModal(false);
            
            // Refresh table with current filters
            fetchCatalog();
        } catch (err) {
            const errorMsg = err.response?.data ? Object.values(err.response.data).flat().join(", ") : "Error saving to catalog";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCatalogItem = async (id) => {
        if (!window.confirm("Are you sure you want to remove this product from the official prices list? This action cannot be undone.")) return;
        
        setLoading(true);
        try {
            await api.delete(`market/catalog/${id}/`);
            // Refresh table with current filters to ensure row disappears
            await fetchCatalog(catalogFilter, searchQuery);
            alert("Product removed from catalog successfully.");
        } catch (err) {
            console.error("Delete failed:", err);
            const msg = err.response?.data?.detail || "You do not have permission to delete this item or it does not exist.";
            alert("Error: " + msg);
        } finally {
            setLoading(false);
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
                            {users.filter(u => !u.is_deleted)
                                .slice((usersPage - 1) * 10, usersPage * 10)
                                .map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.username}</strong></td>
                                    <td><span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.approval_status === "pending" ? (
                                            <span className="status-badge" style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>Pending Approval</span>
                                        ) : u.is_active ? (
                                            <span className="status-badge" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Active</span>
                                        ) : (
                                            <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>Suspended</span>
                                        )}
                                    </td>
                                    <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                                    <td>
                                      <button
    className="btn-view-small"
    onClick={() => setSelectedUser(u)}
>
    View
</button> 
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={usersPage}
                    totalCount={usersCount}
                    pageSize={10}
                    onPageChange={setUsersPage}
                />

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
                                    {selectedUser.documents && selectedUser.documents.length > 0 && (
                                        <>
                                            <strong>Documents:</strong>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                {selectedUser.documents.map((doc, idx) => (
                                                    <a key={idx} href={doc.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        📄 {doc.name}
                                                    </a>
                                                ))}
                                            </div>
                                        </>
                                    )}
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
                                        {selectedUser.approval_status === 'pending' && (
                                            <button className="btn-warning" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', color: '#fff', backgroundColor: '#eab308', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleUserAction('approve_account', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Approve Account"}
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
                <Pagination 
                    currentPage={complaintsPage}
                    totalCount={complaintsCount}
                    pageSize={10}
                    onPageChange={setComplaintsPage}
                />
            </div>
        );
    }

    if (activeTab === "catalog") {
        return (
            <div className="prices-management animate-in">
                <div className="section-header-row mb-2">
                    <div className="header-text">
                        <h2 className="title-lg">Official Prices Management</h2>
                        <p className="subtitle-md">Control regulated market prices and track historical fluctuations.</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn-success-lg" 
                            onClick={() => { 
                                // Pre-fill category if a specific one is selected
                                setCatalogForm({ 
                                    name: "", 
                                    description: "", 
                                    min_price: "", 
                                    max_price: "", 
                                    category: (catalogFilter !== "all") ? catalogFilter : "", 
                                    unit: "kg" 
                                }); 
                                setSelectedCatalogItem(null); 
                                setShowAddModal(true); 
                            }}
                        >
                            <Plus size={20} /> <span>Add New Price</span>
                        </button>
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="category-tabs-container mb-2">
                    <button 
                        className={`category-tab ${catalogFilter === "all" ? "active" : ""}`}
                        onClick={() => { setCatalogFilter("all"); fetchCatalog("all", searchQuery); }}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            className={`category-tab ${catalogFilter === cat.id ? "active" : ""}`}
                            onClick={() => { setCatalogFilter(cat.id); fetchCatalog(cat.id, searchQuery); }}
                            style={{ 
                                "--tab-color": cat.color || "#10b981",
                                "--tab-text": cat.textColor || "#065f46" 
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="glass-panel">
                    <div className="table-controls mb-1">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="Search product..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    fetchCatalog(catalogFilter, e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <div className="history-table-container">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Official Price</th>
                                    <th>Unit</th>
                                    <th>Last Update</th>
                                    <th>Updated By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catalog.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div 
                                                    className="product-avatar" 
                                                    style={{ backgroundColor: item.category_color || "#f1f5f9", color: item.category_color ? "#fff" : "#64748b" }}
                                                >
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                <strong>{item.name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className="status-badge-cat" 
                                                style={{ backgroundColor: item.category_color || "#f1f5f9" }}
                                            >
                                                {item.category_name || "General"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="price-display">
                                                <span className="price-range">
                                                    {item.min_price} – {item.max_price} DA
                                                </span>
                                            </div>
                                        </td>
                                        <td>{item.unit}</td>
                                        <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="admin-tag">
                                                {item.updated_by_name || "System"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button 
                                                    className="action-btn btn-edit" 
                                                    title="Edit Official Price Details"
                                                    onClick={() => { 
                                                        setSelectedCatalogItem(item); 
                                                        setCatalogForm({ 
                                                            name: item.name, 
                                                            description: item.description, 
                                                            min_price: item.min_price, 
                                                            max_price: item.max_price, 
                                                            category: item.category, 
                                                            unit: item.unit 
                                                        }); 
                                                        setShowAddModal(true); 
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn btn-history"
                                                    title="View Price Fluctuations"
                                                    onClick={() => {
                                                        setSelectedCatalogItem(item);
                                                        fetchPriceHistory(item.id);
                                                    }}
                                                >
                                                    <Clock size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn btn-delete" 
                                                    title="Remove Product Entry"
                                                    onClick={() => handleDeleteCatalogItem(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {catalog.length === 0 && <p className="empty-text">No products found.</p>}
                    </div>
                    <Pagination 
                        currentPage={catalogPage}
                        totalCount={catalogCount}
                        pageSize={10}
                        onPageChange={setCatalogPage}
                    />
                </div>

                {/* Add/Edit Price Modal (Small Window Style) */}
                {showAddModal && activeTab === "catalog" && (
                    <div className="modal-overlay-small">
                        <div className="modal-content-small animate-in">
                            <div className="modal-header-small">
                                <div className="header-icon-box">
                                    <TrendingUp size={18} />
                                </div>
                                <div className="header-info">
                                    <h3>{selectedCatalogItem ? "Edit Official Price" : "Add New Official Price"}</h3>
                                    <p>{selectedCatalogItem ? `Updating ${selectedCatalogItem.name}` : "Define a new regulated price point"}</p>
                                </div>
                                <button className="close-btn-round" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            
                            <div className="modal-body-small">
                                <div className="form-group-compact">
                                    <label>Product Name</label>
                                    <input 
                                        type="text" 
                                        value={catalogForm.name} 
                                        onChange={e => setCatalogForm({...catalogForm, name: e.target.value})} 
                                        placeholder="e.g. Tomatoes" 
                                        required
                                    />
                                </div>

                                <div className="form-group-compact">
                                    <label>Category</label>
                                    <select 
                                        value={catalogForm.category} 
                                        onChange={e => setCatalogForm({...catalogForm, category: e.target.value})}
                                        required
                                        className="select-custom"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row-compact">
                                    <div className="form-group-compact">
                                        <label>Min Price (DA)</label>
                                        <input 
                                            type="number" step="0.01"
                                            value={catalogForm.min_price} 
                                            onChange={e => setCatalogForm({...catalogForm, min_price: e.target.value})} 
                                            required
                                        />
                                    </div>
                                    <div className="form-group-compact">
                                        <label>Max Price (DA)</label>
                                        <input 
                                            type="number" step="0.01"
                                            value={catalogForm.max_price} 
                                            onChange={e => setCatalogForm({...catalogForm, max_price: e.target.value})} 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row-compact">
                                    <div className="form-group-compact">
                                        <label>Unit</label>
                                        <input 
                                            type="text" 
                                            value={catalogForm.unit} 
                                            onChange={e => setCatalogForm({...catalogForm, unit: e.target.value})} 
                                            placeholder="kg, bunch, piece..."
                                        />
                                    </div>
                                </div>

                                <div className="form-group-compact">
                                    <label>Management Notes</label>
                                    <textarea 
                                        rows="2" 
                                        value={catalogForm.description} 
                                        onChange={e => setCatalogForm({...catalogForm, description: e.target.value})} 
                                        placeholder="Optional internal notes..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-footer-small">
                                <button className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="btn-save" onClick={handleAddCatalogItem} disabled={loading}>
                                    {loading ? "Saving..." : (selectedCatalogItem ? "Save Changes" : "Create Price")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Redesigned History Modal (Petite Fenêtre) */}
                {showHistoryModal && (
                    <div className="modal-overlay-small">
                        <div className="modal-content-small animate-in">
                            <div className="modal-header-small">
                                <div className="header-icon-box" style={{ background: "#fffbeb", color: "#d97706" }}>
                                    <Clock size={18} />
                                </div>
                                <div className="header-info">
                                    <h3>Price Timeline</h3>
                                    <p>{selectedCatalogItem?.name}</p>
                                </div>
                                <button className="close-btn-round" onClick={() => setShowHistoryModal(false)}>×</button>
                            </div>
                            <div className="modal-body-small" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                <div className="history-list">
                                    {/* Current (Live) Price Reference */}
                                    <div className="history-item current-price">
                                        <div className="history-indicator current"></div>
                                        <div className="history-main">
                                            <div className="price-tag">{selectedCatalogItem?.min_price} – {selectedCatalogItem?.max_price} <small>DA/{selectedCatalogItem?.unit}</small></div>
                                            <div className="meta-text">Current regulated price</div>
                                        </div>
                                        <div className="tag-label active">ACTIVE</div>
                                    </div>

                                    {/* Backend Price History records */}
                                    {priceHistory.length > 0 ? priceHistory.map((h, idx) => (
                                        <div key={idx} className="history-item">
                                            <div className="history-indicator"></div>
                                            <div className="history-main">
                                                <div className="price-tag">{h.min_price} – {h.max_price} <small>DA/{selectedCatalogItem?.unit}</small></div>
                                                <div className="meta-info">
                                                   <span>
  <Calendar size={12} /> 
  {new Date(h.updated_at).toLocaleDateString("fr-FR")}
</span>
                                                    <span><User size={12} /> {h.updated_by_name || "System"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="empty-history-sub">
                                            <p>No previous changes recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer-small">
                                <button className="btn-save" onClick={() => setShowHistoryModal(false)}>Done</button>
                            </div>
                        </div>
                    </div>
                )}
                
                <style>{`
                    .header-actions { display: flex; gap: 1rem; }
                    .category-tabs-container { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
                    .category-tab { 
                        padding: 0.6rem 1.25rem; 
                        border-radius: 12px; 
                        background: white; 
                        border: 1px solid #f1f5f9; 
                        color: #64748b; 
                        font-weight: 600; 
                        cursor: pointer; 
                        white-space: nowrap; 
                        transition: 0.2s; 
                    }
                    .category-tab:hover { background: #f8fafc; color: #1e293b; }
                    .category-tab.active { 
                        background: var(--tab-color, #2f8f3a); 
                        color: white !important; 
                        border-color: transparent; 
                        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    }
                    
                    .product-cell { display: flex; align-items: center; gap: 0.75rem; }
                    .product-avatar { 
                        width: 32px; 
                        height: 32px; 
                        border-radius: 8px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-weight: 800; 
                        font-size: 0.9rem; 
                    }
                    
                    .price-display { font-weight: 700; color: #1e293b; }
                    .admin-tag { font-size: 0.85rem; color: #64748b; font-weight: 500; }
                    
                    .table-actions { 
                        display: flex; 
                        gap: 0.8rem; 
                        align-items: center; 
                    }
                    .action-btn { 
                        width: 34px; 
                        height: 34px; 
                        border-radius: 9px; 
                        border: 1px solid #e2e8f0; 
                        background: #ffffff;
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        cursor: pointer; 
                        transition: all 0.2s;
                        color: #1e293b;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    }
                    .action-btn:hover { 
                        transform: translateY(-2px); 
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
                        border-color: transparent;
                    }
                    
                    .btn-edit:hover { background: #1e40af; color: #ffffff; }
                    .btn-history:hover { background: #b45309; color: #ffffff; }
                    .btn-delete:hover { background: #b91c1c; color: #ffffff; }
                    
                    .action-btn svg { width: 17px; height: 17px; stroke-width: 2.5; }

                    .history-table tbody tr { transition: all 0.2s; }
                    .history-table tbody tr:hover { background-color: #f8fafc; }

                    .status-badge-cat {
                        padding: 0.35rem 0.75rem;
                        border-radius: 10px;
                        font-size: 0.8rem;
                        font-weight: 700;
                        border: 1px solid rgba(0,0,0,0.05);
                        display: inline-block;
                        color: #1e293b;
                    }

                    .mini-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    .mini-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.85rem; text-transform: uppercase; }
                    .mini-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 0.9rem; }
                    .price-bold { font-weight: 700; color: #059669; }
                    .current-row { background: #f0fdf4; }
                    .price-highlight { font-weight: 800; color: #10b981; }
                    
                    .header-with-badge { display: flex; align-items: center; gap: 0.75rem; }
                    .badge-outline { padding: 0.25rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.8rem; color: #64748b; font-weight: 600; }
                    
                    .search-box { margin-bottom: 1.5rem; }
                    .search-box input {
                        width: 100%;
                        max-width: 400px;
                        padding: 0.75rem 1rem;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                        font-size: 0.95rem;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .search-box input:focus {
                        border-color: #2f8f3a;
                        box-shadow: 0 0 0 3px rgba(47, 143, 58, 0.1);
                    }

                    /* Small Centered Modal Style */
                    .modal-overlay-small {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(15, 23, 42, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1100;
                        padding: 1.5rem;
                    }
                    .modal-content-small {
                        background: white;
                        width: 100%;
                        max-width: 440px;
                        border-radius: 20px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        overflow: hidden;
                    }
                    .modal-header-small {
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid #f1f5f9;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        position: relative;
                    }
                    .header-icon-box {
                        width: 40px;
                        height: 40px;
                        background: #f0fdf4;
                        color: #16a34a;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .header-info h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
                    .header-info p { margin: 0; font-size: 0.8rem; color: #64748b; }
                    .close-btn-round {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: none;
                        background: #f1f5f9;
                        color: #64748b;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .close-btn-round:hover { background: #e2e8f0; color: #1e293b; }

                    .modal-body-small { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                    .form-group-compact { display: flex; flex-direction: column; gap: 0.4rem; }
                    .form-group-compact label { font-size: 0.85rem; font-weight: 600; color: #475569; }
                    .form-group-compact input, .form-group-compact select, .form-group-compact textarea {
                        padding: 0.65rem 0.9rem;
                        border-radius: 10px;
                        border: 1px solid #e2e8f0;
                        font-size: 0.92rem;
                        outline: none;
                        transition: 0.2s;
                    }
                    .form-group-compact input:focus, .form-group-compact select:focus, .form-group-compact textarea:focus {
                        border-color: #2f8f3a;
                        box-shadow: 0 0 0 3px rgba(47, 143, 58, 0.1);
                    }
                    .form-row-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .modal-footer-small {
                        padding: 1.25rem 1.5rem;
                        background: #f8fafc;
                        display: flex;
                        justify-content: flex-end;
                        gap: 0.75rem;
                        border-top: 1px solid #f1f5f9;
                    }
                    .btn-ghost {
                        background: none;
                        border: 1px solid transparent;
                        color: #64748b;
                        padding: 0.6rem 1.25rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .btn-ghost:hover { background: #f1f5f9; color: #1e293b; }
                    .btn-save {
                        background: #2f8f3a;
                        color: white;
                        border: none;
                        padding: 0.6rem 1.5rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        transition: 0.2s;
                    }
                    .btn-save:hover { background: #25702d; transform: translateY(-1px); }
                    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                    /* History List Styling */
                    .history-list { display: flex; flex-direction: column; gap: 0.5rem; }
                    .history-item { 
                        display: flex; 
                        gap: 1rem; 
                        padding: 1rem; 
                        background: #f8fafc; 
                        border-radius: 12px; 
                        position: relative;
                        align-items: center;
                    }
                    .history-indicator { 
                        width: 10px; 
                        height: 10px; 
                        border-radius: 50%; 
                        background: #cbd5e1; 
                        flex-shrink: 0;
                    }
                    .history-indicator.current { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
                    
                    .history-item.current-price { 
                        background: #f0fdf4; 
                        border: 1px solid #dcfce7;
                    }
                    
                    .history-main { flex: 1; }
                    .price-tag { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
                    .price-tag small { color: #64748b; font-size: 0.8rem; }
                    
                    .meta-info, .meta-text { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: #64748b; }
                    .tag-label { 
                        padding: 0.25rem 0.6rem; 
                        border-radius: 20px; 
                        font-size: 0.65rem; 
                        font-weight: 800; 
                        background: #dcfce7; 
                        color: #166534;
                    }
                    
                    .empty-history-sub { text-align: center; padding: 2rem; color: #94a3b8; }
                `}</style>
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

    if (activeTab === "categories") {
        return (
            <div className="categories-view animate-in">
                <div className="section-header-row mb-2">
                    <div className="header-text">
                        <h2 className="title-lg">Categories Management</h2>
                        <p className="subtitle-md">Organize products into logical groupings for the marketplace.</p>
                    </div>
                    <button className="btn-success-lg" onClick={() => { setCategoryForm({ name: "", description: "", icon: "Leaf", color: "#dcfce7" }); setShowAddModal(true); }}>
                        <Plus size={20} /> <span>Add New Category</span>
                    </button>
                </div>

                <div className="grid-list">
                    {categories.map(cat => (
                        <div 
                            key={cat.id} 
                            className="category-card-premium card-item clickable-card"
                            onClick={() => navigate(`/dashboard/category/${cat.id}`)}
                        >
                            <div className="card-top">
                                <div className="icon-container" style={{ backgroundColor: cat.color, color: cat.textColor || "#111827" }}>
                                    {getIconComponent(cat.icon)}
                                </div>
                                <div className="card-actions-wrapper">
                                    {cat.is_hidden && <span className="badge-hidden">HIDDEN</span>}
                                    <button 
                                        className="icon-btn-ghost" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); // Prevent card click navigation
                                            setActiveMenu(activeMenu === cat.id ? null : cat.id); 
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    
                                    {activeMenu === cat.id && (
                                        <div className="dropdown-menu-floating animate-in">
                                            <button onClick={() => { setSelectedCategory(cat); setCategoryForm({ ...cat }); setShowEditModal(true); setActiveMenu(null); }}>
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={async () => { 
                                                try {
                                                    await api.patch(`market/categories/${cat.id}/`, { is_hidden: !cat.is_hidden });
                                                    fetchCategories();
                                                    setActiveMenu(null);
                                                } catch (err) {
                                                    alert("Error updating visibility");
                                                }
                                            }}>
                                                {cat.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />} {cat.is_hidden ? "Unhide" : "Hide"}
                                            </button>
                                            <hr />
                                            <button
    className="delete-action"
    onClick={async (e) => {
        e.stopPropagation();
        setActiveMenu(null);

        const confirmed = window.confirm(`Are you sure you want to delete ${cat.name}?`);
        if (!confirmed) return;

        try {
            await api.delete(`market/categories/${cat.id}/`);
            fetchCategories();
        } catch (err) {
            console.error("Delete category error:", err);
            alert(err.response?.data?.detail || "Error deleting category");
        }
    }}
>
    <Trash2 size={14} /> Delete
</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="card-body">
                                <h3>{cat.name}</h3>
                                <p className="product-count">{cat.productsCount || 0} Listable Products</p>
                            </div>
                            
                           
                        </div>
                    ))}
                </div>

                {/* Modals Implementation */}
                {showAddModal && (
                    <div className="modal-overlay-custom">
                        <div className="modal-content-premium glass-panel animate-in">
                            <div className="modal-header">
                                <h3>Add New Category</h3>
                                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Category Name</label>
                                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. Vegetables" />
                                </div>
                                <div className="form-group">
                                    <label>Description (Optional)</label>
                                    <textarea rows="2" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Describe this category..."></textarea>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group">
                                        <label>Icon</label>
                                        <select value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})}>
                                            <option value="Leaf">Leaf</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Wheat">Wheat</option>
                                            <option value="Drumstick">Drumstick</option>
                                            <option value="GlassWater">Milk/Water</option>
                                            <option value="Flower">Flower</option>
                                            <option value="Sprout">Sprout</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Theme Color</label>
                                        <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-custom">
                                <button className="btn-secondary-custom" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="btn-primary-custom" disabled={categoryLoading} onClick={async () => {
                                    if (!categoryForm.name) return alert("Name is required");
                                    setCategoryLoading(true);
                                    try {
                                        await api.post("market/categories/", {
                                            name: categoryForm.name,
                                            description: categoryForm.description,
                                            icon: categoryForm.icon,
                                            color: categoryForm.color,
                                            is_hidden: false
                                        });
                                        fetchCategories();
                                        setShowAddModal(false);
                                    } catch (err) {
                                        alert("Error creating category: " + (err.response?.data?.name || "Server error"));
                                    } finally {
                                        setCategoryLoading(false);
                                    }
                                }}>{categoryLoading ? "Creating..." : "Create Category"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && (
                    <div className="modal-overlay-custom">
                        <div className="modal-content-premium glass-panel animate-in">
                            <div className="modal-header">
                                <h3>Edit Category</h3>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Category Name</label>
                                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="2" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}></textarea>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group">
                                        <label>Icon</label>
                                        <select value={categoryForm.iconName || categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, iconName: e.target.value})}>
                                            <option value="Leaf">Leaf</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Wheat">Wheat</option>
                                            <option value="Drumstick">Drumstick</option>
                                            <option value="GlassWater">Milk/Water</option>
                                            <option value="Flower">Flower</option>
                                            <option value="Sprout">Sprout</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-custom">
                                <button className="btn-secondary-custom" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="btn-primary-custom" disabled={categoryLoading} onClick={async () => {
                                    setCategoryLoading(true);
                                    try {
                                        await api.patch(`market/categories/${selectedCategory.id}/`, { 
                                            name: categoryForm.name, 
                                            description: categoryForm.description,
                                            icon: categoryForm.iconName || categoryForm.icon,
                                            color: categoryForm.color
                                        });
                                        fetchCategories();
                                        setShowEditModal(false);
                                    } catch (err) {
                                        alert("Error updating category");
                                    } finally {
                                        setCategoryLoading(false);
                                    }
                                }}>{categoryLoading ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-overlay-custom">
                        <div className="modal-content-premium glass-panel animate-in" style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <h3>Delete Category</h3>
                                <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{selectedCategory?.name}</strong>? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer-custom">
                                <button className="btn-secondary-custom" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn-danger-custom" disabled={categoryLoading} onClick={async () => {
                                    setCategoryLoading(true);
                                    try {
                                        await api.delete(`market/categories/${selectedCategory.id}/`);
                                        fetchCategories();
                                        setShowDeleteModal(false);
                                    } catch (err) {
                                        alert("Error deleting category");
                                    } finally {
                                        setCategoryLoading(false);
                                    }
                                }}>{categoryLoading ? "Deleting..." : "Delete"}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Styles for Categories */}
                <style>{`
                    .categories-view { display: flex; flex-direction: column; }
                    .title-lg { margin: 0; font-size: 1.75rem; color: #111827; }
                    .subtitle-md { margin: 0.25rem 0 0 0; color: #64748b; font-size: 1rem; }
                    .btn-success-lg { background: #2f8f3a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
                    .btn-success-lg:hover { background: #25702d; transform: translateY(-1px); }
                    
                    .category-card-premium { position: relative; display: flex; flex-direction: column; padding: 1.5rem; border-radius: 20px; background: white; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                    .category-card-premium:hover { box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1); transform: translateY(-4px); }
                    .clickable-card { cursor: pointer; }
                    
                    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                    .icon-container { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; opacity: 0.9; }
                    .card-actions-wrapper { position: relative; display: flex; align-items: center; gap: 0.5rem; }
                    .badge-hidden { background: #f1f5f9; color: #64748b; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; }
                    .icon-btn-ghost { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
                    .icon-btn-ghost:hover { background: #f8fafc; color: #1e293b; }
                    
                    .dropdown-menu-floating { position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 50; min-width: 140px; padding: 0.4rem; margin-top: 0.5rem; }
                    .dropdown-menu-floating button { width: 100%; text-align: left; background: none; border: none; padding: 0.6rem 0.8rem; font-size: 0.85rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; color: #334155; }
                    .dropdown-menu-floating button:hover { background: #f1f5f9; color: #1e293b; }
                    .dropdown-menu-floating .delete-action { color: #ef4444; }
                    .dropdown-menu-floating .delete-action:hover { background: #fef2f2; color: #ef4444; }
                    
                    .card-body h3 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
                    .product-count { margin: 0; font-size: 0.85rem; color: #64748b; }
                    
                    .card-footer-action { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                    .avatar-group-mini { display: flex; margin-left: 4px; }
                    .avatar-mini { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; margin-left: -8px; }
                    .avatar-mini:first-of-type { margin-left: 0; }
                    .btn-rename-text { background: none; border: none; color: #2f8f3a; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
                    .btn-rename-text:hover { color: #25702d; text-decoration: underline; }
                    
                    .modal-overlay-custom { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                    .modal-content-premium { background: white; width: 100%; max-width: 500px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; position: relative; }
                    .modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
                    .close-btn { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
                    .modal-body { padding: 1.5rem; display: flex; flexDirection: column; gap: 1.25rem; }
                    .form-row-custom { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .modal-footer-custom { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; }
                    .btn-secondary-custom { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                    .btn-primary-custom { background: #2f8f3a; border: none; color: white; padding: 0.61rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                    .btn-danger-custom { background: #ef4444; border: none; color: white; padding: 0.61rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                `}</style>
            </div>
        );
    }

    return null;
};

export default AdminDashboard;
