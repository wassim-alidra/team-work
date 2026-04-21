import { useState, useContext, useEffect } from "react";
import { Truck, CheckCircle, DollarSign, Save, Package, MapPin, ChevronRight, Check } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axios";
import RouteMapModal from "./RouteMapModal";
import "../../styles/dashboard.css";
import "../../styles/transporter-dashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Pagination from "../common/Pagination"; // Keep if needed for real backend, or adapt it.

const TransporterDashboard = ({ activeTab, setActiveTab }) => {
    const { user, setUser } = useContext(AuthContext);
    
    // ---------- REAL API STATE ----------
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, completed_count: 0, history: [] });
    
    const [profileForm, setProfileForm] = useState({
        name: user?.username || "Transporter",
        phone: user?.profile?.phone || "",
        vehicle_type: user?.profile?.vehicle_type || "",
        license_plate: user?.profile?.license_plate || "",
        capacity: user?.profile?.capacity || 0
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [requestFilter, setRequestFilter] = useState("All");
    const [requestSearch, setRequestSearch] = useState("");

    // ---------- HELPER LOGIC ----------
    const showToast = (message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // ---------- API CALLS ----------
    const fetchAvailableOrders = async () => {
        try {
            const res = await api.get(`market/deliveries/available_orders/`);
            setAvailableOrders(res.data.results || res.data || []);
        } catch (err) {
            console.error("Error fetching available orders:", err);
        }
    };

    const fetchMyDeliveries = async () => {
        try {
            const res = await api.get(`market/deliveries/`);
            setMyDeliveries(res.data.results || res.data || []);
        } catch (err) {
            console.error("Error fetching my deliveries:", err);
        }
    };

    const fetchEarnings = async () => {
        try {
            const res = await api.get("market/deliveries/earnings/");
            setEarningsData(res.data || { total_earnings: 0, completed_count: 0, history: [] });
        } catch (err) {
            console.error("Error fetching earnings:", err);
        }
    };

    useEffect(() => {
        if (activeTab === "dashboard" || activeTab === "requests") fetchAvailableOrders();
        if (activeTab === "dashboard" || activeTab === "status" || activeTab === "history") fetchMyDeliveries();
        if (activeTab === "dashboard" || activeTab === "earnings") fetchEarnings();
        if (activeTab === "profile") {
            setProfileForm(prev => ({
                ...prev,
                vehicle_type: user?.profile?.vehicle_type || "",
                license_plate: user?.profile?.license_plate || "",
                capacity: user?.profile?.capacity || 0
            }));
        }
    }, [activeTab]);

    // ---------- MUTATIONS ----------
    const handleAccept = async (order) => {
        try {
            await api.post("market/deliveries/", { order: order.id });
            showToast(`Order #${order.id} Accepted successfully!`);
            if(selectedOrder) setSelectedOrder(null);
            fetchAvailableOrders();
            fetchMyDeliveries();
        } catch (err) {
            alert("Error accepting delivery. Please try again.");
            console.error(err);
        }
    };

    const handleUpdateStatus = async (deliveryId, newStatus) => {
        try {
            await api.patch(`market/deliveries/${deliveryId}/`, { status: newStatus });
            if (newStatus === "DELIVERED") {
                showToast("Delivery successfully marked as Delivered!");
                fetchEarnings(); 
            } else {
                showToast(`Status updated to ${newStatus}`);
            }
            fetchMyDeliveries();
        } catch (err) {
            alert("Error updating status");
            console.error(err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                vehicle_type: profileForm.vehicle_type,
                license_plate: profileForm.license_plate,
                capacity: parseFloat(profileForm.capacity)
            };
            const res = await api.patch("users/me/", payload);
            setUser({ ...user, profile: { ...user.profile, ...res.data } });
            showToast("Profile saved successfully!");
        } catch (err) {
            alert("Error updating profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ---------- COMPUTED STATS MODULES ----------
    const activeDeveliriesList = myDeliveries.filter(d => d.status !== "DELIVERED");
    
    // Fallbacks if dates aren't cleanly available
    const todayStr = new Date().toDateString();
    const historyDeliveries = myDeliveries.filter(d => d.status === "DELIVERED");
    const completedToday = historyDeliveries.filter(d => new Date(d.delivery_date || d.updated_at).toDateString() === todayStr).length;

    // Derived Weekly Earnings (approximation if backend doesn't provide exact weekly filter)
    const earningsThisWeek = earningsData.recent_week_earnings || historyDeliveries
        .filter(d => new Date(d.delivery_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, d) => sum + parseFloat(d.delivery_fee || 0), 0);

    // Derived Weekly Chart (aggregate deliveries by Day)
    const getWeeklyData = () => {
        const days = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
        historyDeliveries.forEach(d => {
            if (d.delivery_date) {
                const dayName = new Date(d.delivery_date).toLocaleDateString("en-US", { weekday: 'short' });
                if (days[dayName] !== undefined) days[dayName] += 1;
            }
        });
        return Object.keys(days).map(key => ({ name: key, val: days[key] }));
    };
    const weeklyData = getWeeklyData();

    // Derived Donut Chart (aggregate available orders by product name)
    const getDonutData = () => {
        const counts = {};
        availableOrders.forEach(o => {
            const prodName = o.product_name || "Other";
            counts[prodName] = (counts[prodName] || 0) + 1;
        });
        
        let sortedData = Object.keys(counts)
            .map(k => ({ name: k, value: counts[k] }))
            .sort((a, b) => b.value - a.value);
        
        if (sortedData.length > 5) {
            const top5 = sortedData.slice(0, 5);
            const othersValue = sortedData.slice(5).reduce((sum, item) => sum + item.value, 0);
            if (othersValue > 0) {
                top5.push({ name: "Other", value: othersValue });
            }
            sortedData = top5;
        }

        return sortedData.length > 0 ? sortedData : [{ name: "No data", value: 1 }];
    };
    const donutData = getDonutData();
    const COLORS = ["#1D9E75", "#F59E0B", "#10B981", "#3B82F6"];

    // Render Sub-Tabs
    const renderDashboard = () => (
        <div className="t-fade-in">
            {/* TOP STATS */}
            <div className="t-stats-grid">
                <div className="t-stat-card">
                    <div className="t-stat-header">
                        <div className="t-stat-icon t-stat-bg-green"><Package size={20} className="t-delta-up"/></div>
                    </div>
                    <h3 className="t-stat-value">{availableOrders.length}</h3>
                    <p className="t-stat-title">Available orders</p>
                </div>
            
                <div className="t-stat-card">
                    <div className="t-stat-header">
                        <div className="t-stat-icon t-stat-bg-blue"><Truck size={20} className="t-stat-icon-blue"/></div>
                    </div>
                    <h3 className="t-stat-value">{activeDeveliriesList.length}</h3>
                    <p className="t-stat-title">Active deliveries</p>
                </div>
                
                <div className="t-stat-card">
                    <div className="t-stat-header">
                        <div className="t-stat-icon t-stat-bg-green"><CheckCircle size={20} className="t-delta-up"/></div>
                    </div>
                    <h3 className="t-stat-value">{completedToday}</h3>
                    <p className="t-stat-title">Completed today</p>
                </div>

                <div className="t-stat-card">
                    <div className="t-stat-header">
                        <div className="t-stat-icon t-stat-bg-amber"><DollarSign size={20} className="t-stat-icon-amber"/></div>
                    </div>
                    <h3 className="t-stat-value">{earningsThisWeek} DZD</h3>
                    <p className="t-stat-title">Earnings this week</p>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="t-grid-66-33" style={{marginTop: '1.5rem'}}>
                <div className="t-card">
                    <div className="t-stat-header" style={{marginBottom: '1rem'}}>
                        <h3 className="t-item-title">Weekly Deliveries</h3>
                    </div>
                    <div style={{width: '100%', height: 200}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="val" fill="#C0DD97" radius={[4, 4, 0, 0]} barSize={24}>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="t-card">
                    <div className="t-stat-header" style={{marginBottom: '1rem'}}>
                        <h3 className="t-item-title">Available Order Categories</h3>
                    </div>
                    <div style={{height: 200}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LOWER SECTION */}
            <div className="t-grid-50-50" style={{marginTop: '1.5rem'}}>
                <div className="t-card">
                    <div className="t-stat-header">
                        <h3 className="t-item-title">Ready for Pickup</h3>
                        <button className="t-btn t-btn-outline" onClick={() => setActiveTab("requests")}>View All <ChevronRight size={14}/></button>
                    </div>
                    <div className="t-list">
                        {availableOrders.length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '0.85rem', padding: '1rem' }}>No orders currently matching.</p>
                        ) : availableOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="t-list-item">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{fontWeight: 500}}>{order.product_name}</span>
                                        <span className="t-chip t-chip-green">#{order.id}</span>
                                    </div>
                                    <span style={{fontSize: '0.8rem', color: '#6b7280'}}>{order.farmer_wilaya || "N/A"} → {order.buyer_wilaya || "N/A"} • {order.quantity}kg</span>
                                </div>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button className="t-btn t-btn-outline" onClick={() => setSelectedOrder(order)}><MapPin size={14} /> View</button>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="t-card">
                    <div className="t-stat-header">
                        <h3 className="t-item-title">Active Delivery</h3>
                        <button className="t-btn t-btn-outline" onClick={() => setActiveTab("status")}>View All <ChevronRight size={14}/></button>
                    </div>
                    
                    {activeDeveliriesList.length > 0 ? (() => { 
                        const d = activeDeveliriesList[0];
                        const progress = d.status === "IN_TRANSIT" ? 65 : 25;
                        return (
                        <>
                            <div className="t-route-visualizer" style={{marginTop: '2rem'}}>
                                <div className="t-route-line"></div>
                                <div className="t-route-progress" style={{width: `${progress}%`}}></div>
                                
                                <div className="t-route-node">
                                    <span style={{fontSize: '0.75rem', color: '#6b7280', position: 'absolute', top: '-20px', whiteSpace: 'nowrap'}}>Farmer</span>
                                    <div className="t-node-dot active"></div>
                                </div>
                                <div className="t-truck-icon" style={{position: 'absolute', left: `calc(${progress}% + 10px)`, transform: 'translateX(-50%)'}}>
                                    <Truck size={16} />
                                </div>
                                <div className="t-route-node">
                                    <span style={{fontSize: '0.75rem', color: '#6b7280', position: 'absolute', top: '-20px', whiteSpace: 'nowrap'}}>Buyer</span>
                                    <div className="t-node-dot"></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginTop: '5px' }}>
                                <span>Departed</span>
                                <span style={{ color: '#1D9E75', fontWeight: '500' }}>In Progress</span>
                                <span>Destination</span>
                            </div>

                            <h3 className="t-item-title" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Delivery Info</h3>
                            <div className="t-perf-grid">
                                <div className="t-perf-box">
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <span style={{fontSize: '0.8rem', color: '#6b7280'}}>Total weight</span>
                                        <span style={{fontSize: '0.85rem', fontWeight: 500, color: 'var(--primary-green)'}}>{d.quantity || d.order_quantity || d.order?.quantity || d.order_details?.quantity || 0} KG</span>
                                    </div>
                                </div>
                                <div className="t-perf-box">
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <span style={{fontSize: '0.8rem', color: '#6b7280'}}>Total distance</span>
                                        <span style={{fontSize: '0.85rem', fontWeight: 500, color: 'var(--blue)'}}>{d.distance_km || d.distance || d.total_distance || d.order?.distance_km || d.order_details?.distance_km || 0} KM</span>
                                    </div>
                                </div>
                            </div>

                            {(() => {
                                let nextStatus = "IN_TRANSIT";
                                let btnText = "Start Delivery";
                                let disabled = false;

                                if (d.status === "IN_TRANSIT") {
                                    nextStatus = "DELIVERED";
                                    btnText = "Mark as Delivered";
                                } else if (d.status === "DELIVERED") {
                                    disabled = true;
                                    btnText = "Completed";
                                    nextStatus = "DELIVERED";
                                }

                                return (
                                    <button 
                                        className="t-btn t-btn-primary" 
                                        style={{
                                            width: '100%', 
                                            marginTop: '1.5rem', 
                                            padding: '0.75rem', 
                                            opacity: disabled ? 0.6 : 1, 
                                            cursor: disabled ? 'not-allowed' : 'pointer'
                                        }} 
                                        onClick={() => !disabled && handleUpdateStatus(d.id, nextStatus)}
                                        disabled={disabled}
                                    >
                                        <CheckCircle size={16} /> {btnText}
                                    </button>
                                );
                            })()}
                        </>);
                    })() : (
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', padding: '1rem' }}>No active deliveries.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRequests = () => {
        const filtered = availableOrders.filter(o => 
            (requestFilter === "All" || (o.category || "Other") === requestFilter) && 
            ((o.product_name || "").toLowerCase().includes(requestSearch.toLowerCase()) || (o.farmer_wilaya || "").toLowerCase().includes(requestSearch.toLowerCase()) || (o.buyer_wilaya || "").toLowerCase().includes(requestSearch.toLowerCase()))
        );

        return (
            <div className="t-fade-in t-card" style={{padding: '1.5rem'}}>
                

                <div className="grid-list">
                    {filtered.map(o => (
                        <div key={o.id} className="card-item t-card-hoverable">
                            <div className="card-badge" style={{background: 'var(--light-green)', color: 'var(--text-green)'}}>Available</div>
                            <div className="card-content">
                                <h3 style={{fontSize: '1.2rem', marginBottom: '8px'}}>Order #{o.id}</h3>
                                <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                                    <span className="t-chip t-chip-amber">{o.category || "Uncategorized"}</span>
                                </div>
                                <div className="detail-row" style={{marginTop: '1rem'}}>
                                    <Package size={16} color="#6b7280"/>
                                    <span style={{fontWeight: 500}}>{o.product_name} — {o.quantity} kg</span>
                                </div>
                                <div className="detail-row" style={{ marginTop: 8 }}>
                                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Transport Fee:</span>
                                    <span style={{ fontSize: "1rem", color: "var(--amber)", fontWeight: 600 }}>{o.total_price || "N/A"} DZD</span>
                                </div>
                                <div className="t-route-visualizer" style={{marginTop: '1.5rem', marginBottom: '0.5rem'}}>
                                    <div className="t-route-line"></div>
                                    <div className="t-route-node">
                                        <div className="t-node-dot active"></div>
                                        <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>{o.farmer_wilaya || "N/A"}</span>
                                    </div>
                                    <div className="t-route-node">
                                        <div className="t-node-dot"></div>
                                        <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>{o.buyer_wilaya || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                                <button className="t-btn t-btn-outline" style={{ flex: 1 }} onClick={() => setSelectedOrder(o)}>
                                    Details
                                </button>
                               
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p style={{color: '#6b7280'}}>No matching requests found.</p>}
                </div>
            </div>
        );
    };

    const renderStatus = () => (
        <div className="t-fade-in t-card" style={{padding: '1.5rem'}}>
            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                {activeDeveliriesList.length === 0 ? (
                     <p className="empty-text" style={{color: '#6b7280'}}>You have no active deliveries.</p>
                ) : (
                    activeDeveliriesList.map(d => (
                        <div key={d.id} className="t-card" style={{marginBottom: '1.5rem'}}>
                            <div className="t-stat-header" style={{borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1rem'}}>
                                <div>
                                    <h3 style={{fontSize: '1.2rem', marginBottom: '4px'}}>Delivery #{d.id}</h3>
                                    <span style={{color: '#6b7280', fontSize: '0.9rem'}}>Order #{d.order}</span>
                                </div>
                                <span className="t-chip t-chip-blue" style={{fontSize: '0.85rem', padding: '4px 10px'}}>{d.status}</span>
                            </div>
                            
                            <div className="t-form-group">
                                {(() => {
                                    let nextStatus = "IN_TRANSIT";
                                    let btnText = "Start Delivery";
                                    let disabled = false;

                                    if (d.status === "IN_TRANSIT") {
                                        nextStatus = "DELIVERED";
                                        btnText = "Mark as Delivered";
                                    } else if (d.status === "DELIVERED") {
                                        disabled = true;
                                        btnText = "Completed";
                                        nextStatus = "DELIVERED";
                                    } else if (d.status === "CANCELED") {
                                        disabled = true;
                                        btnText = "Canceled";
                                        nextStatus = "CANCELED";
                                    }

                                    return (
                                        <button 
                                            className="t-btn t-btn-primary" 
                                            style={{
                                                width: '100%', 
                                                padding: '0.75rem', 
                                                opacity: disabled ? 0.6 : 1, 
                                                cursor: disabled ? 'not-allowed' : 'pointer'
                                            }} 
                                            onClick={() => !disabled && handleUpdateStatus(d.id, nextStatus)}
                                            disabled={disabled}
                                        >
                                            <CheckCircle size={16} /> {btnText}
                                        </button>
                                    );
                                })()}
                            </div>

                            <div style={{position: 'relative', marginTop: '2rem', paddingLeft: '20px'}}>
                                <div style={{position: 'absolute', left: '26px', top: '10px', bottom: '10px', width: '2px', background: '#e5e7eb'}}></div>
                                
                                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 2}}>
                                    <div style={{width: '14px', height: '14px', borderRadius: '50%', background: 'var(--primary-green)', marginTop: '4px', border: '2px solid white', boxShadow: '0 0 0 2px var(--primary-green)'}}></div>
                                    <div>
                                        <b style={{fontSize: '0.95rem', display: 'block'}}>Order Accepted</b>
                                        
                                    </div>
                                </div>
                                
                                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 2}}>
                                    <div style={{width: '14px', height: '14px', borderRadius: '50%', background: d.status === 'IN_TRANSIT' ? 'var(--blue)' : '#e5e7eb', marginTop: '4px', border: '2px solid white'}}></div>
                                    <div>
                                        <b style={{fontSize: '0.95rem', display: 'block', color: d.status === 'IN_TRANSIT' ? '#111827' : '#9ca3af'}}>In Transit</b>
                                        
                                    </div>
                                </div>

                                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 2}}>
                                    <div style={{width: '14px', height: '14px', borderRadius: '50%', background: '#e5e7eb', marginTop: '4px', border: '2px solid white'}}></div>
                                    <div>
                                        <b style={{fontSize: '0.95rem', display: 'block', color: '#9ca3af'}}>Delivered</b>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="t-fade-in t-card" style={{padding: '1.5rem'}}>
            
            <table className="t-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Order Ref</th>
                        <th>Date</th>
                        <th>Fee</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {historyDeliveries.map(h => (
                        <tr key={h.id}>
                            <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 500}}>
                                    <div style={{width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-green)'}}></div>
                                    #{h.id}
                                </div>
                            </td>
                            <td style={{color: '#6b7280'}}>Order #{h.order}</td>
                            <td style={{color: '#6b7280'}}>{new Date(h.delivery_date || h.updated_at).toLocaleDateString()}</td>
                            <td style={{fontWeight: 500}}>{h.delivery_fee || "N/A"} DZD</td>
                            <td><span className="t-chip t-chip-green">{h.status}</span></td>
                        </tr>
                    ))}
                    {historyDeliveries.length === 0 && (
                        <tr><td colSpan="5" style={{textAlign: 'center', color: '#6b7280'}}>No history found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderEarnings = () => (
        <div className="t-fade-in">
            <div className="t-stats-grid" style={{marginBottom: '1.5rem'}}>
                <div className="t-stat-card">
                    <p className="t-stat-title">This Week</p>
                    <h3 className="t-stat-value">{earningsThisWeek} DA</h3>
                </div>
                <div className="t-stat-card">
                    <p className="t-stat-title">This Month</p>
                    <h3 className="t-stat-value">{earningsData.total_earnings || 0} DA</h3>
                </div>
                <div className="t-stat-card">
                    <p className="t-stat-title">This Year</p>
                    <h3 className="t-stat-value">{earningsData.total_earnings || 0} DA</h3>
                </div>
                <div className="t-stat-card">
                    <p className="t-stat-title">Total Deliveries</p>
                    <h3 className="t-stat-value">{earningsData.completed_count || historyDeliveries.length}</h3>
                </div>
            </div>

            
               

               
                    
                 
        </div>
    );

    const renderProfile = () => (
        <div className="t-fade-in t-profile-layout">
            <div className="t-card">
                <form onSubmit={handleProfileUpdate}>
                    <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem'}}>
                        <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'var(--light-green)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600}}>
                            {profileForm.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <h2 style={{margin: 0, fontSize: '1.5rem'}}>{profileForm.name}</h2>
                                <span className="t-chip t-chip-blue" style={{display: 'flex', alignItems: 'center', gap: '4px'}}><CheckCircle size={10}/> Verified</span>
                            </div>
                            <p style={{color: '#6b7280', margin: '4px 0 0 0'}}>Professional Transporter</p>
                        </div>
                    </div>

                    <div className="t-grid-50-50">
                        <div className="t-form-group">
                            <label>Full Name</label>
                            <input type="text" value={profileForm.name} disabled />
                        </div>
                        <div className="t-form-group">
                            <label>Phone Number</label>
                            <input type="text" value={profileForm.phone} disabled placeholder="Managed in auth" />
                        </div>
                        <div className="t-form-group">
                            <label>Vehicle Type</label>
                            <input type="text" value={profileForm.vehicle_type} onChange={e => setProfileForm({...profileForm, vehicle_type: e.target.value})} />
                        </div>
                        <div className="t-form-group">
                            <label>License Plate</label>
                            <input type="text" value={profileForm.license_plate} onChange={e => setProfileForm({...profileForm, license_plate: e.target.value})} />
                        </div>
                        <div className="t-form-group">
                            <label>Capacity (Kg)</label>
                            <input type="number" value={profileForm.capacity} onChange={e => setProfileForm({...profileForm, capacity: e.target.value})} />
                        </div>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                        <button type="submit" className="t-btn t-btn-primary" disabled={loading}>
                            {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="t-card">
                <h3 className="t-item-title" style={{marginBottom: '1.5rem'}}>Performance Summary</h3>
                <div className="t-summary-list">
                    <div className="t-summary-item">
                        <span style={{color: '#6b7280'}}>Total Deliveries</span>
                        <b style={{fontSize: '1.1rem'}}>{earningsData.completed_count || historyDeliveries.length}</b>
                    </div>
                    
                    
                    <div className="t-summary-item" style={{borderBottom: 'none'}}>
                        <span style={{color: '#6b7280'}}>Total Earnings</span>
                        <b style={{fontSize: '1.1rem', color: 'var(--amber)'}}>{earningsData.total_earnings || 0} DZD</b>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="agrigov-transporter-dashboard">
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "requests" && renderRequests()}
            {activeTab === "status" && renderStatus()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "earnings" && renderEarnings()}
            {activeTab === "profile" && renderProfile()}

            {selectedOrder && (
                <RouteMapModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onAccept={() => handleAccept(selectedOrder)}
                />
            )}

            {/* Toasts overlay */}
            <div className="t-toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className="t-toast">
                        <CheckCircle size={18} className="t-toast-icon" />
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransporterDashboard;