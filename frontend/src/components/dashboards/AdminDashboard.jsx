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
    const [catalogForm, setCatalogForm] = useState({ name: "", description: "", min_price: "", max_price: "", category: "", unit: "kg", image: null });
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
            const formData = new FormData();
            Object.keys(catalogForm).forEach(key => {
                if (catalogForm[key] !== null && catalogForm[key] !== undefined && catalogForm[key] !== "") {
                    if (key === 'image' && !(catalogForm[key] instanceof File)) return; // don't send string URLs back to image field
                    formData.append(key, catalogForm[key]);
                }
            });

            if (selectedCatalogItem) {
                await api.patch(`market/catalog/${selectedCatalogItem.id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
                alert("Official price updated successfully!");
            } else {
                await api.post("market/catalog/", formData, { headers: { "Content-Type": "multipart/form-data" } });
                alert("New product added to official price list!");
            }
            
            // Success cleanup
            setCatalogForm({ name: "", description: "", min_price: "", max_price: "", category: "", unit: "kg", image: null });
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
        if (!stats) return <div className="p-xl text-center text-on-surface-variant animate-pulse font-body-lg text-body-lg">Loading ministerial statistics...</div>;
        
        return (
            <div className="max-w-[1280px] mx-auto animate-in space-y-lg px-6 py-8">
                <header className="mb-lg">
                    <h1 className="font-h1 text-h1 text-on-surface mb-xs">Ministerial Overview</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time macro analytics for national agricultural logistics.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md md:gap-lg">
                    <section className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-md">
                        <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                            <div className="flex justify-between items-start mb-lg">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Users</span>
                                <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                                    <Users size={24} />
                                </div>
                            </div>
                            <div>
                                <div className="font-h2 text-h2 text-primary">{stats.total_users}</div>
                                <div className="font-body-sm text-body-sm text-secondary flex items-center mt-1">
                                    Farmers: {stats.farmers_count} | Buyers: {stats.buyers_count}
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                            <div className="flex justify-between items-start mb-lg">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Orders</span>
                                <div className="bg-secondary-container/30 p-2 rounded-lg text-secondary">
                                    <ShoppingCart size={24} />
                                </div>
                            </div>
                            <div>
                                <div className="font-h2 text-h2 text-primary">{stats.total_orders}</div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                            <div className="flex justify-between items-start mb-lg">
                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Catalog Items</span>
                                <div className="bg-primary-fixed p-2 rounded-lg text-on-primary-fixed">
                                    <Package size={24} />
                                </div>
                            </div>
                            <div>
                                <div className="font-h2 text-h2 text-primary">{stats.total_products}</div>
                            </div>
                        </div>
                    </section>

                    <section className="md:col-span-1 bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 relative overflow-hidden flex flex-col justify-center items-center text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>
                        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-md text-on-secondary-container">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="font-h3 text-h3 text-on-surface mb-1">System Optimal</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">All ministerial logistics APIs operational.</p>
                        <button onClick={fetchStats} className="font-button text-button text-primary border border-outline-variant px-4 py-2 rounded-lg hover:bg-surface-container transition-colors w-full">Refresh Analytics</button>
                    </section>

                    <section className="md:col-span-2 bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30">
                        <div className="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-md">
                            <h3 className="font-h3 text-h3 text-on-surface">Platform Activity</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 text-primary">
                                    <Users size={16} />
                                </div>
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface"><span className="font-semibold">{stats.farmers_count}</span> Registered Farmers</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0 text-secondary">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface"><span className="font-semibold">{stats.transporters_count}</span> Transporters active</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 text-error">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <p className="font-body-md text-body-md text-on-surface"><span className="font-semibold">{stats.pending_complaints}</span> Pending Complaints</p>
                                    <p className="font-body-sm text-body-sm text-error">Requires attention</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="md:col-span-1 bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30">
                        <h3 className="font-h3 text-h3 text-on-surface mb-md">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left font-button text-button bg-primary text-on-primary rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors flex justify-between items-center">
                                Review Users
                                <ChevronRight size={20} />
                            </button>
                            <button className="w-full text-left font-button text-button bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 hover:bg-secondary-container/80 transition-colors flex justify-between items-center">
                                Update Official Prices
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (activeTab === "users") {
        return (
            <div className="max-w-[1280px] mx-auto animate-in px-6 py-8">
                <div className="mb-xl">
                    <h1 className="font-h1 text-h1 text-on-surface mb-2">User Management</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Ministerial Oversight & Actor Verification</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">Total Platform Actors</p>
                                <h2 className="font-h2 text-h2 text-on-surface">{usersCount}</h2>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">User</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Role</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Status</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Joined Date</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/30">
                                {users.filter(u => !u.is_deleted).slice((usersPage - 1) * 10, usersPage * 10).map(u => (
                                    <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant/30 uppercase">
                                                    {u.username.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-body-md text-body-md text-on-surface font-medium">{u.username}</p>
                                                    <p className="font-body-sm text-body-sm text-on-surface-variant">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 bg-surface-container-high text-on-surface font-label-caps text-label-caps rounded-full mb-1">{u.role}</span>
                                        </td>
                                        <td className="p-4">
                                            {u.approval_status === "pending" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps rounded-full">
                                                    <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Pending
                                                </span>
                                            ) : u.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps rounded-full">
                                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-error-container text-on-error-container font-label-caps text-label-caps rounded-full">
                                                    <span className="material-symbols-outlined text-[14px]">error</span> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-body-sm text-body-sm text-on-surface">{new Date(u.date_joined).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="font-button text-button text-primary hover:text-secondary mr-2 transition-colors" onClick={() => setSelectedUser(u)}>Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-outline-variant/50 flex items-center justify-center bg-surface-bright">
                        <Pagination 
                            currentPage={usersPage}
                            totalCount={usersCount}
                            pageSize={10}
                            onPageChange={setUsersPage}
                        />
                    </div>
                </div>

                {selectedUser && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
                        <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
                                <h3 className="font-h3 text-h3 text-on-surface">Actor Review</h3>
                                <button className="text-on-surface-variant hover:bg-surface-container p-1 rounded-full transition-colors" onClick={() => { setSelectedUser(null); setTempMessage(""); }}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {tempMessage && <div className="mx-lg mt-lg p-md bg-primary-fixed/30 text-on-primary-fixed rounded-lg border border-primary/20">{tempMessage}</div>}

                            <div className="p-lg flex-1 overflow-y-auto space-y-md">
                                <div className="grid grid-cols-2 gap-md font-body-md text-body-md text-on-surface">
                                    <div><strong className="text-on-surface-variant block mb-1">Username</strong> {selectedUser.username}</div>
                                    <div><strong className="text-on-surface-variant block mb-1">Full Name</strong> {selectedUser.first_name || '-'} {selectedUser.last_name || '-'}</div>
                                    <div><strong className="text-on-surface-variant block mb-1">Email</strong> {selectedUser.email}</div>
                                    <div><strong className="text-on-surface-variant block mb-1">Role</strong> <span className="inline-block px-2 py-0.5 bg-surface-container-high rounded-md">{selectedUser.role}</span></div>
                                    <div><strong className="text-on-surface-variant block mb-1">Status</strong> {selectedUser.is_deleted ? "Deleted" : selectedUser.is_active ? "Active" : "Suspended"}</div>
                                    <div><strong className="text-on-surface-variant block mb-1">Joined Date</strong> {new Date(selectedUser.date_joined).toLocaleDateString()}</div>
                                    {selectedUser.extra_info && <div className="col-span-2"><strong className="text-on-surface-variant block mb-1">Profile Info</strong> {selectedUser.extra_info}</div>}
                                </div>
                            </div>
                            
                            <div className="p-lg border-t border-outline-variant/30 bg-surface-bright flex justify-end gap-3">
                                {!selectedUser.is_deleted && (
                                    <>
                                        {selectedUser.is_active ? (
                                            <button className="px-4 py-2 border border-error text-error rounded-lg font-button text-button hover:bg-error-container transition-colors" onClick={() => handleUserAction('suspend', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Suspend"}
                                            </button>
                                        ) : (
                                            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-button text-button hover:bg-secondary transition-colors" onClick={() => handleUserAction('activate', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Activate"}
                                            </button>
                                        )}
                                        {selectedUser.approval_status === 'pending' && (
                                            <button className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-button text-button hover:bg-secondary-fixed transition-colors" onClick={() => handleUserAction('approve_account', selectedUser.id)} disabled={loading}>
                                                {loading ? "..." : "Approve Account"}
                                            </button>
                                        )}
                                        <button className="px-4 py-2 bg-error text-on-error rounded-lg font-button text-button hover:bg-error/90 transition-colors" onClick={() => handleUserAction('delete_account', selectedUser.id)} disabled={loading}>
                                            {loading ? "..." : "Delete"}
                                        </button>
                                    </>
                                )}
                                <button className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-button text-button hover:bg-surface-container transition-colors" onClick={() => { setSelectedUser(null); setTempMessage(""); }}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "complaints") {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 animate-in">
                <div className="mb-xl">
                    <h1 className="font-h1 text-h1 text-on-surface mb-xs">Complaints Desk</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Centralized dashboard for dispute resolution and oversight.</p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 overflow-hidden flex flex-col h-full">
                    <div className="p-lg border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                        <h2 className="font-h3 text-h3 text-on-surface">Recent Submissions</h2>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-bright border-b border-outline-variant/30">
                                    <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/4">User / Date</th>
                                    <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/2">Subject & Message</th>
                                    <th className="py-3 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase w-1/4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {complaints.map(c => (
                                    <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="py-4 px-6 align-top">
                                            <div className="font-body-md text-body-md font-medium text-on-surface">{c.username}</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant">{new Date(c.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-1 ${c.is_resolved ? 'bg-surface-container-highest text-on-surface' : 'bg-error-container text-on-error-container'}`}>
                                                {c.is_resolved ? 'Resolved' : 'Open'}
                                            </span>
                                            <div className="font-body-sm text-body-sm text-on-surface font-semibold mb-1">{c.subject}</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant">{c.message}</div>
                                        </td>
                                        <td className="py-4 px-6 align-top text-right">
                                            {!c.is_resolved ? (
                                                <button className="font-button text-button bg-primary text-on-primary px-3 py-1.5 rounded hover:bg-primary/90 transition-colors" onClick={() => handleResolveComplaint(c.id)}>Resolve</button>
                                            ) : (
                                                <span className="font-body-sm text-body-sm text-on-surface-variant">Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {complaints.length === 0 && <div className="p-lg text-center text-on-surface-variant">No complaints found.</div>}
                    </div>
                    <div className="p-4 border-t border-outline-variant/30 flex items-center justify-center bg-surface-bright">
                        <Pagination 
                            currentPage={complaintsPage}
                            totalCount={complaintsCount}
                            pageSize={10}
                            onPageChange={setComplaintsPage}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "catalog") {
        return (
            <div className="max-w-[1400px] w-full mx-auto px-lg md:px-xl py-lg animate-in">
                <header className="mb-xl flex flex-col md:flex-row md:justify-between md:items-end gap-md">
                    <div>
                        <h1 className="font-h1 text-h1 text-on-surface mb-2">Official Catalog & Prices</h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Ministerial control room for regulating baseline agricultural commodities, tracking historical adjustments, and ensuring nationwide market stability.</p>
                    </div>
                    <button 
                        className="flex items-center justify-center gap-2 bg-primary text-on-primary font-button text-button px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                        onClick={() => { 
                            setCatalogForm({ name: "", description: "", min_price: "", max_price: "", category: (catalogFilter !== "all") ? catalogFilter : "", unit: "kg", image: null }); 
                            setSelectedCatalogItem(null); 
                            setShowAddModal(true); 
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>New Product</span>
                    </button>
                </header>

                <div className="flex gap-2 mb-md overflow-x-auto pb-2">
                    <button 
                        className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${catalogFilter === "all" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
                        onClick={() => { setCatalogFilter("all"); fetchCatalog("all", searchQuery); }}
                    >All</button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-colors ${catalogFilter === cat.id ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
                            onClick={() => { setCatalogFilter(cat.id); fetchCatalog(cat.id, searchQuery); }}
                        >{cat.name}</button>
                    ))}
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 overflow-hidden flex-1 mb-lg">
                    <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                        <div className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    fetchCatalog(catalogFilter, e.target.value);
                                }}
                                className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant/50 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase font-semibold">ASSET</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase font-semibold">PRODUCT DETAILS</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase font-semibold">OFFICIAL PRICE</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase font-semibold">LAST UPDATE</th>
                                    <th className="font-label-caps text-label-caps text-on-surface-variant py-4 px-6 uppercase font-semibold text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-md text-body-md divide-y divide-outline-variant/30">
                                {catalog.map(item => (
                                    <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                                        <td className="py-3 px-6">
                                            <div className="w-12 h-12 rounded-lg bg-surface-container-highest overflow-hidden border border-outline-variant/30 relative flex items-center justify-center font-bold text-lg text-on-surface-variant uppercase">
                                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : item.name.substring(0,2)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <p className="font-medium text-on-surface">{item.name}</p>
                                            <span className="inline-block mt-1 bg-surface-container-high font-label-caps text-label-caps text-on-surface px-2 py-0.5 rounded-full">{item.category_name || "General"}</span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <p className="text-on-surface font-semibold">{item.min_price} - {item.max_price} <span className="text-on-surface-variant font-normal text-sm">DA / {item.unit}</span></p>
                                        </td>
                                        <td className="py-3 px-6">
                                            <p className="text-on-surface font-body-sm text-body-sm">{new Date(item.updated_at).toLocaleDateString()}</p>
                                            <p className="text-on-surface-variant text-xs mt-0.5">{item.updated_by_name || "System"}</p>
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
                                                    title="Edit Details"
                                                    onClick={() => { 
                                                        setSelectedCatalogItem(item); 
                                                        setCatalogForm({ name: item.name, description: item.description, min_price: item.min_price, max_price: item.max_price, category: item.category, unit: item.unit, image: null }); 
                                                        setShowAddModal(true); 
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button 
                                                    className="text-on-surface-variant hover:text-secondary transition-colors p-2 rounded-full hover:bg-surface-container"
                                                    title="View Price Timeline"
                                                    onClick={() => {
                                                        setSelectedCatalogItem(item);
                                                        fetchPriceHistory(item.id);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">history</span>
                                                </button>
                                                <button 
                                                    className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container"
                                                    title="Remove Entry"
                                                    onClick={() => handleDeleteCatalogItem(item.id)}
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {catalog.length === 0 && <div className="p-xl text-center text-on-surface-variant">No products found.</div>}
                    </div>
                    <div className="p-4 border-t border-outline-variant/30 flex items-center justify-center bg-surface-bright">
                        <Pagination currentPage={catalogPage} totalCount={catalogCount} pageSize={10} onPageChange={setCatalogPage} />
                    </div>
                </div>

                {showAddModal && activeTab === "catalog" && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                        <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-lg border-b border-outline-variant/30 flex gap-4 items-center relative">
                                <div className="w-10 h-10 bg-primary-container/20 text-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">tune</span>
                                </div>
                                <div>
                                    <h3 className="font-h3 text-h3 text-on-surface mb-0.5">{selectedCatalogItem ? "Edit Official Price" : "Add Official Price"}</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">Ministerial price regulation panel</p>
                                </div>
                                <button className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-1 rounded-full transition-colors" onClick={() => setShowAddModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            <div className="p-lg flex-1 overflow-y-auto space-y-md">
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">PRODUCT NAME</label>
                                    <input type="text" value={catalogForm.name} onChange={e => setCatalogForm({...catalogForm, name: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">CATEGORY</label>
                                    <select value={catalogForm.category} onChange={e => setCatalogForm({...catalogForm, category: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" required>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">MIN PRICE (DA)</label>
                                        <input type="number" step="0.01" value={catalogForm.min_price} onChange={e => setCatalogForm({...catalogForm, min_price: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">MAX PRICE (DA)</label>
                                        <input type="number" step="0.01" value={catalogForm.max_price} onChange={e => setCatalogForm({...catalogForm, max_price: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">UNIT</label>
                                        <input type="text" value={catalogForm.unit} onChange={e => setCatalogForm({...catalogForm, unit: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="kg, bunch..." required />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">MANAGEMENT NOTES</label>
                                    <textarea rows="2" value={catalogForm.description} onChange={e => setCatalogForm({...catalogForm, description: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"></textarea>
                                </div>

                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">PRODUCT IMAGE</label>
                                    <input type="file" accept="image/*" onChange={e => setCatalogForm({...catalogForm, image: e.target.files[0]})} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container/20 file:text-primary hover:file:bg-primary-container/30" />
                                </div>
                            </div>

                            <div className="p-lg border-t border-outline-variant/30 bg-surface-bright flex justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-lg font-button text-button text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container transition-colors" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="px-5 py-2.5 rounded-lg font-button text-button bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2" onClick={handleAddCatalogItem} disabled={loading}>
                                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                                    {loading ? "Saving..." : "Authorize"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showHistoryModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-lg border-b border-outline-variant/30 flex gap-4 items-center relative">
                                <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">history</span>
                                </div>
                                <div>
                                    <h3 className="font-h3 text-h3 text-on-surface mb-0.5">Price Timeline</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">{selectedCatalogItem?.name}</p>
                                </div>
                                <button className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-1 rounded-full transition-colors" onClick={() => setShowHistoryModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            <div className="p-lg flex-1 overflow-y-auto max-h-[60vh]">
                                <div className="relative border-l-2 border-outline-variant/30 ml-3 space-y-6">
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
                                        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">ACTIVE REGULATION</p>
                                        <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-primary font-bold text-lg">{selectedCatalogItem?.min_price} - {selectedCatalogItem?.max_price} <span className="text-sm font-normal">DA/{selectedCatalogItem?.unit}</span></span>
                                                <span className="bg-primary text-on-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Current</span>
                                            </div>
                                        </div>
                                    </div>

                                    {priceHistory.map((h, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
                                            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">{new Date(h.updated_at).toLocaleString()}</p>
                                            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                                                <div className="font-semibold text-on-surface mb-1">{h.min_price} - {h.max_price} <span className="text-sm font-normal text-on-surface-variant">DA/{selectedCatalogItem?.unit}</span></div>
                                                <div className="text-xs text-on-surface-variant flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">person</span> {h.updated_by_name || "System"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {priceHistory.length === 0 && (
                                        <div className="pl-6 text-on-surface-variant text-sm italic">No past adjustments found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-8 animate-in">
                <div className="mb-xl text-center">
                    <div className="w-16 h-16 bg-primary-fixed/30 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px]">campaign</span>
                    </div>
                    <h1 className="font-h1 text-h1 text-on-surface mb-xs">Official Broadcast</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">Issue ministerial directives and critical announcements directly to platform actors.</p>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 p-lg md:p-xl">
                    <form onSubmit={handleSendNotification} className="space-y-xl">
                        <div className="space-y-4">
                            <label className="block font-label-caps text-label-caps text-on-surface">TARGET AUDIENCE</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {["all", "farmers", "buyers"].map(opt => (
                                    <label key={opt} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${notifTarget === opt ? "border-primary bg-primary-container/10" : "border-outline-variant/30 bg-surface-bright hover:border-primary/50"}`}>
                                        <input
                                            type="radio"
                                            name="notifTarget"
                                            value={opt}
                                            checked={notifTarget === opt}
                                            onChange={() => setNotifTarget(opt)}
                                            className="sr-only"
                                        />
                                        <span className={`material-symbols-outlined text-[28px] mb-2 ${notifTarget === opt ? "text-primary" : "text-on-surface-variant"}`}>
                                            {opt === "all" ? "groups" : opt === "farmers" ? "agriculture" : "storefront"}
                                        </span>
                                        <span className={`font-body-sm text-body-sm text-center font-semibold ${notifTarget === opt ? "text-primary" : "text-on-surface"}`}>
                                            {opt === "all" ? "All Actors" : opt === "farmers" ? "Farmers Only" : "Buyers Only"}
                                        </span>
                                        {notifTarget === opt && (
                                            <span className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full ring-2 ring-surface-container-lowest"></span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block font-label-caps text-label-caps text-on-surface">MINISTERIAL DIRECTIVE</label>
                            <div className="relative">
                                <div className="absolute top-4 left-4 text-primary">
                                    <span className="material-symbols-outlined">gavel</span>
                                </div>
                                <textarea
                                    rows="5"
                                    placeholder="Draft official announcement..."
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    required
                                    className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl pl-12 pr-4 py-4 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all"
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/30">
                            <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-button text-button py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined">send</span>
                                {loading ? "Broadcasting..." : `Broadcast to ${targetLabel[notifTarget]}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (activeTab === "categories") {
        return (
            <div className="max-w-[1400px] w-full mx-auto px-lg md:px-xl py-lg animate-in">
                <header className="mb-xl flex flex-col md:flex-row md:justify-between md:items-end gap-md">
                    <div>
                        <h1 className="font-h1 text-h1 text-on-surface mb-2">Marketplace Categories</h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Manage logical groupings for agricultural products across the entire platform.</p>
                    </div>
                    <button 
                        className="flex items-center justify-center gap-2 bg-primary text-on-primary font-button text-button px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_4px_10px_rgba(26,58,52,0.2)] hover:shadow-[0_6px_15px_rgba(26,58,52,0.3)] transform hover:-translate-y-0.5"
                        onClick={() => { setCategoryForm({ name: "", description: "", icon: "Leaf", color: "#dcfce7" }); setShowAddModal(true); }}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>New Category</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {categories.map(cat => (
                        <div 
                            key={cat.id} 
                            className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 hover:shadow-[0_10px_25px_rgba(26,58,52,0.1)] transition-all transform hover:-translate-y-1 cursor-pointer group flex flex-col relative overflow-hidden"
                            onClick={() => navigate(`/dashboard/category/${cat.id}`)}
                        >
                            {/* Decorative accent top line */}
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: cat.color }}></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.color, color: cat.textColor || "#111827" }}>
                                    {getIconComponent(cat.icon)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {cat.is_hidden && <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-md font-label-caps text-[10px] font-bold border border-outline-variant/50">HIDDEN</span>}
                                    <div className="relative">
                                        <button 
                                            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-colors"
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === cat.id ? null : cat.id); 
                                            }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        
                                        {activeMenu === cat.id && (
                                            <div className="absolute top-full right-0 mt-1 w-36 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg z-50 overflow-hidden animate-in">
                                                <button 
                                                    className="w-full text-left px-4 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2 transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); setCategoryForm({ ...cat }); setShowEditModal(true); setActiveMenu(null); }}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2 transition-colors"
                                                    onClick={async (e) => { 
                                                        e.stopPropagation();
                                                        try {
                                                            await api.patch(`market/categories/${cat.id}/`, { is_hidden: !cat.is_hidden });
                                                            fetchCategories();
                                                            setActiveMenu(null);
                                                        } catch (err) {
                                                            alert("Error updating visibility");
                                                        }
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">{cat.is_hidden ? 'visibility' : 'visibility_off'}</span> {cat.is_hidden ? "Unhide" : "Hide"}
                                                </button>
                                                <div className="h-px bg-outline-variant/30 my-1"></div>
                                                <button 
                                                    className="w-full text-left px-4 py-2 font-body-sm text-body-sm text-error hover:bg-error-container/50 flex items-center gap-2 transition-colors"
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
                                                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 z-10">
                                <h3 className="font-h3 text-h3 text-on-surface mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{cat.description || "No description provided."}</p>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center z-10">
                                <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold bg-surface-container px-3 py-1 rounded-full">{cat.productsCount || 0} Products</span>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transform group-hover:translate-x-1 transition-all">arrow_forward</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Petite Fenêtre Modals */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-lg border-b border-outline-variant/30 flex gap-4 items-center relative">
                                <div className="w-10 h-10 bg-primary-container/20 text-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">category</span>
                                </div>
                                <div>
                                    <h3 className="font-h3 text-h3 text-on-surface mb-0.5">Add Category</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">Create a new product group</p>
                                </div>
                                <button className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-1 rounded-full transition-colors" onClick={() => setShowAddModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-lg flex-1 overflow-y-auto space-y-md">
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">CATEGORY NAME</label>
                                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. Vegetables" className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">DESCRIPTION</label>
                                    <textarea rows="2" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Describe this category..." className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">ICON</label>
                                        <select value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                            <option value="Leaf">Leaf</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Wheat">Wheat</option>
                                            <option value="Drumstick">Drumstick</option>
                                            <option value="GlassWater">Milk/Water</option>
                                            <option value="Flower">Flower</option>
                                            <option value="Sprout">Sprout</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">THEME COLOR</label>
                                        <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer border border-outline-variant/50" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-lg border-t border-outline-variant/30 bg-surface-bright flex justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-lg font-button text-button text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container transition-colors" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="px-5 py-2.5 rounded-lg font-button text-button bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm" disabled={categoryLoading} onClick={async () => {
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
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-lg border-b border-outline-variant/30 flex gap-4 items-center relative">
                                <div className="w-10 h-10 bg-primary-container/20 text-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">edit</span>
                                </div>
                                <div>
                                    <h3 className="font-h3 text-h3 text-on-surface mb-0.5">Edit Category</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">Update category details</p>
                                </div>
                                <button className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-1 rounded-full transition-colors" onClick={() => setShowEditModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-lg flex-1 overflow-y-auto space-y-md">
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">CATEGORY NAME</label>
                                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-label-caps text-label-caps text-on-surface">DESCRIPTION</label>
                                    <textarea rows="2" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">ICON</label>
                                        <select value={categoryForm.iconName || categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, iconName: e.target.value})} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                            <option value="Leaf">Leaf</option>
                                            <option value="Apple">Apple</option>
                                            <option value="Wheat">Wheat</option>
                                            <option value="Drumstick">Drumstick</option>
                                            <option value="GlassWater">Milk/Water</option>
                                            <option value="Flower">Flower</option>
                                            <option value="Sprout">Sprout</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-label-caps text-label-caps text-on-surface">THEME COLOR</label>
                                        <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer border border-outline-variant/50" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-lg border-t border-outline-variant/30 bg-surface-bright flex justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-lg font-button text-button text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container transition-colors" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="px-5 py-2.5 rounded-lg font-button text-button bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm" disabled={categoryLoading} onClick={async () => {
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
            </div>
        );
    }

    return null;
};

export default AdminDashboard;
