import { useEffect, useState, useRef, useContext } from "react";
import api from "../../api/axios";
import {
    Home, Package, Clock, CheckCircle,
    Plus, AlertCircle, Calendar, Settings,
    Wrench, Activity, Info, Pencil, Trash2,
    Upload, MapPin, DollarSign, Image as ImageIcon,
    TrendingUp, ChevronRight, MessageSquare, ShieldCheck, Download, Users, Briefcase, Timer, ShoppingCart
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/equipment_provider.css";
import AuthContext from "../../context/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";

const EquipmentProviderDashboard = ({ activeTab }) => {
    const { user } = useContext(AuthContext);

    // Initialize Real-time WebSockets
    useWebSocket(user, (event, data) => {
        if (event === "new_booking") {
            fetchBookings();
            alert(`🎉 Real-Time Booking Request: ${data.message}`);
        }
    });

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEquipmentId, setCurrentEquipmentId] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "", equipment_type: "", condition: "Excellent", price_per_day: "",
        deposit_amount: "", horsepower: "", weight: "", year_of_manufacture: "",
        transmission: "", max_speed: "", fuel_type: "", hours_of_use: "",
        location: "", description: "", usage_instructions: "",
        is_available: true, expected_available_date: "", quantity_available: 1,
        is_electric: false, battery_capacity: "", charging_time: "",
        flight_time: "", max_range: "", payload_capacity: ""
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ 
        total_equipment: 0, 
        total_bookings: 0, 
        pending_bookings: 0,
        total_revenue: 0,
        available_fleet: 0
    });
    const [notifications, setNotifications] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    useEffect(() => {
        fetchEquipment();
        fetchBookings();
        fetchNotifications();
        if (activeTab === "notifications") {
            api.post("market/notifications/mark_all_as_read/").catch(console.error);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isUserModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isUserModalOpen]);

    const fetchEquipment = async () => {
        try {
            const res = await api.get("market/equipment/");
            const data = res.data.results || res.data;
            const equipmentList = Array.isArray(data) ? data : [];
            setEquipment(equipmentList);
            setStats(prev => ({ 
                ...prev, 
                total_equipment: equipmentList.length,
                available_fleet: equipmentList.filter(e => e.is_available && e.quantity_available > 0).length
            }));
        } catch (err) { console.error("Error fetching equipment:", err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await api.get("market/equipment-bookings/");
            const data = res.data.results || res.data;
            const bookingsList = Array.isArray(data) ? data : [];
            setBookings(bookingsList);
            
            // Calculate revenue and stats
            const accepted = bookingsList.filter(b => b.status === 'ACCEPTED');
            const totalRev = accepted.reduce((sum, b) => sum + (b.total_price || 0), 0);
            
            setStats(prev => ({
                ...prev,
                total_bookings: bookingsList.length,
                pending_bookings: bookingsList.filter(b => b.status === 'PENDING').length,
                total_revenue: totalRev
            }));
        } catch (err) { console.error(err); }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("market/notifications/");
            const data = res.data.results || res.data;
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        try {
            await api.patch(`market/equipment-bookings/${id}/`, { status });
            fetchBookings();
            alert(`Booking ${status.toLowerCase()} successfully.`);
        } catch (err) { alert("Failed to update booking"); }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => { setSelectedFiles(Array.from(e.target.files)); };

    const handleAddOrUpdateEquipment = async (e) => {
        e.preventDefault();

        if (formData.quantity_available < 1 && formData.quantity_available !== "") {
            return alert("Available quantity must be at least 1.");
        }

        setLoading(true);
        setFieldErrors({});
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== "") data.append(key, formData[key]);
        });
        selectedFiles.forEach(file => { data.append('uploaded_images', file); });
        imagesToDelete.forEach(id => { data.append('deleted_images', id); });

        try {
            if (isEditing) {
                await api.put(`market/equipment/${currentEquipmentId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post("market/equipment/", data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            alert("Fleet updated successfully!");
            resetForm();
            fetchEquipment();
        } catch (err) {
            if (err.response?.data) setFieldErrors(err.response.data);
            alert("Error saving equipment details.");
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setFormData({
            name: "", equipment_type: "", condition: "Excellent", price_per_day: "",
            deposit_amount: "", horsepower: "", weight: "", year_of_manufacture: "",
            transmission: "", max_speed: "", fuel_type: "", hours_of_use: "",
            location: "", description: "", usage_instructions: "",
            is_available: true, expected_available_date: "", quantity_available: 1,
            is_electric: false, battery_capacity: "", charging_time: "",
            flight_time: "", max_range: "", payload_capacity: ""
        });
        setIsEditing(false); setCurrentEquipmentId(null); setSelectedFiles([]); setFieldErrors({});
        setExistingImages([]); setImagesToDelete([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEditClick = (item) => {
        setFormData({ ...item, deposit_amount: item.deposit_amount || "" });
        setExistingImages(item.images || []);
        setIsEditing(true); setCurrentEquipmentId(item.id); setFieldErrors({});
        setImagesToDelete([]);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDeleteExistingImage = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleDeleteEquipment = async (id) => {
        if (!window.confirm("Are you sure you want to remove this machine from your fleet?")) return;
        try {
            await api.delete(`market/equipment/${id}/`);
            fetchEquipment();
        } catch (err) {
            alert("Error deleting equipment.");
        }
    };

    const renderDashboard = () => {
        // Calculate real statistics for the chart based on accepted bookings
        const getRealChartData = () => {
            const accepted = bookings.filter(b => b.status === 'ACCEPTED');
            const data = [];
            const now = new Date();
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthLabel = d.toLocaleString('default', { month: 'short' });
                const monthVal = d.getMonth();
                const yearVal = d.getFullYear();
                
                const sum = accepted.reduce((total, b) => {
                    const bDate = new Date(b.created_at || b.start_date);
                    if (bDate.getMonth() === monthVal && bDate.getFullYear() === yearVal) {
                        return total + (parseFloat(b.total_price) || 0);
                    }
                    return total;
                }, 0);
                
                data.push({ label: monthLabel, value: sum });
            }
            
            const maxVal = Math.max(...data.map(d => d.value), 1000);
            return data.map(d => ({
                ...d,
                height: Math.max(10, Math.round((d.value / maxVal) * 90))
            }));
        };

        const realChartData = getRealChartData();

        return (
            <div className="ep-dashboard-container animate-in">
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-lg">
                    <div>
                        <span className="ep-label-caps">Equipment Provider Overview</span>
                        <h1 className="ep-h1">Performance Dashboard</h1>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button className="ep-btn-outline flex items-center gap-2">
                            <Download size={18} /> Export Report
                        </button>
                    </div>
                </header>

                {/* Sales & Operational Statistics Cards (Admin Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                        <div className="flex justify-between items-start mb-lg">
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs font-bold">Total Revenue</span>
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{stats.total_revenue.toLocaleString()} DA</div>
                            <div className="text-xs text-secondary font-medium mt-1">
                                Earned from accepted leases
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                        <div className="flex justify-between items-start mb-lg">
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs font-bold">Active Bookings</span>
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <ShoppingCart size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{stats.total_bookings} requests</div>
                            <div className="text-xs text-on-surface-variant font-medium mt-1">
                                {stats.pending_bookings} awaiting confirmation
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between h-full border border-outline-variant/30">
                        <div className="flex justify-between items-start mb-lg">
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs font-bold">Machinery Fleet</span>
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                                <Package size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{stats.total_equipment} listed units</div>
                            <div className="text-xs text-secondary font-medium mt-1">
                                {stats.available_fleet} currently operational
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ep-bento-grid">
                    {/* Sales Performance Chart */}
                    <div className="col-span-1 md:col-span-12 ep-card">
                        <div className="flex items-center justify-between mb-lg">
                            <h3 className="ep-h3"><TrendingUp size={24} className="text-secondary" /> Rental Revenue</h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase">
                                    +12% Efficiency
                                </span>
                            </div>
                        </div>
                        <div className="ep-chart-container">
                            {realChartData.map((d, i) => (
                                <div key={i} className="ep-chart-bar" style={{ height: `${d.height}%` }}>
                                    <div className="ep-chart-tooltip">{d.label}: {d.value.toLocaleString()} DA</div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 mt-lg gap-lg">
                            <div className="p-md bg-surface-container-low rounded-lg">
                                <p className="ep-label-caps" style={{fontSize: '10px'}}>Total Revenue</p>
                                <p className="text-2xl font-bold text-primary">{stats.total_revenue.toLocaleString()} DA</p>
                            </div>
                            <div className="p-md bg-surface-container-low rounded-lg">
                                <p className="ep-label-caps" style={{fontSize: '10px'}}>Active Leases</p>
                                <p className="text-2xl font-bold text-secondary">{(stats.total_equipment - stats.available_fleet)} units</p>
                            </div>
                        </div>
                    </div>



                    {/* Recent Inquiries/Bookings */}
                    <div className="col-span-1 md:col-span-6 ep-card">
                        <div className="flex items-center justify-between mb-lg">
                            <h3 className="ep-h3"><MessageSquare size={24} className="text-secondary" /> Active Inquiries</h3>
                            <button className="text-secondary text-sm font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {bookings.filter(b => b.status === 'PENDING').slice(0, 3).map(b => (
                                <div key={b.id} className="ep-inquiry-item">
                                    <div className="ep-avatar"><Users size={20} /></div>
                                    <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold mb-1">{b.farmer_name}</h4>
                                                <span className="text-[10px] text-outline font-bold uppercase">New</span>
                                            </div>
                                            <button onClick={() => { setSelectedUser({name: b.farmer_name, phone: b.farmer_phone, email: b.farmer_email, wilaya: b.farmer_wilaya, role: 'Farmer'}); setIsUserModalOpen(true); }} className="px-3 py-1.5 mt-1 rounded-lg font-button text-[10px] bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center w-max gap-1 shadow-sm active:scale-95"><Users size={12}/> Client Info</button>
                                        <p className="text-sm text-on-surface-variant line-clamp-1">Requested {b.equipment_name} for {b.rental_days} days.</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] rounded font-bold uppercase">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {bookings.filter(b => b.status === 'PENDING').length === 0 && (
                                <p className="text-sm text-on-surface-variant text-center py-4">No pending inquiries at this moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Service Alerts */}
                    <div className="col-span-1 md:col-span-6 ep-card">
                        <div className="flex items-center justify-between mb-lg">
                            <h3 className="ep-h3"><Wrench size={24} className="text-error" /> Maintenance Desk</h3>
                            <div className="flex items-center gap-1 bg-error-container text-on-error-container px-2 py-1 rounded text-xs font-bold">
                                <AlertCircle size={14} /> 2 URGENT
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="ep-alert-item">
                                <div className="ep-alert-info">
                                    <div className="ep-alert-icon"><Activity size={18} /></div>
                                    <div>
                                        <p className="font-bold">Fleet Connectivity</p>
                                        <p className="text-xs text-on-surface-variant">Real-time GPS tracking operational</p>
                                    </div>
                                </div>
                                <span className="text-secondary font-bold text-xs uppercase">Normal</span>
                            </div>
                            <div className="mt-lg p-md bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
                                <ShieldCheck size={32} className="text-emerald-700" />
                                <div>
                                    <p className="font-bold text-emerald-900">Verified Provider Protection</p>
                                    <p className="text-xs text-emerald-700">All rentals are backed by ministerial insurance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Showcased Fleet & Active Rentals Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg">
                    {/* Active Rentals ongoing right now */}
                    <div className="ep-card bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
                        <h3 className="ep-h3 mb-md flex items-center gap-2 text-primary font-bold"><Clock size={22} className="text-secondary" /> Active Rentals (Ongoing Leases)</h3>
                        <div className="space-y-3">
                            {bookings.filter(b => b.status === 'ACCEPTED').slice(0, 3).map(b => {
                                const today = new Date();
                                const endDate = new Date(b.end_date || b.expected_return_date);
                                const diffTime = endDate - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const remainingText = diffDays > 0 ? `${diffDays} days remaining` : 'Return due today or overdue';
                                
                                return (
                                    <div key={b.id} className="flex justify-between items-center bg-surface-container-low p-md rounded-xl border border-outline-variant/30 hover:border-emerald-500/40 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-primary text-sm">{b.equipment_name}</h4>
                                            <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2 mt-1">Leased by <strong>{b.farmer_name}</strong> 
                                                <button onClick={() => { setSelectedUser({name: b.farmer_name, phone: b.farmer_phone, email: b.farmer_email, wilaya: b.farmer_wilaya, role: 'Farmer'}); setIsUserModalOpen(true); }} className="px-3 py-1 rounded-lg font-button text-[10px] bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-sm active:scale-95"><Users size={12}/> Info</button>
                                            </p>
                                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">{remainingText}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-secondary text-sm">{b.total_price ? `${b.total_price.toLocaleString()} DA` : '--'}</span>
                                            <span className="text-[10px] text-outline-variant block">{b.start_date} to {b.end_date}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {bookings.filter(b => b.status === 'ACCEPTED').length === 0 && (
                                <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
                                    <Clock size={32} className="mx-auto opacity-20 mb-2" />
                                    <p className="text-xs text-on-surface-variant italic">No ongoing active rentals at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Showcase One of My Equipment */}
                    <div className="ep-card bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
                        <h3 className="ep-h3 mb-md flex items-center gap-2 text-primary font-bold"><Package size={22} className="text-secondary" /> Featured Machinery Asset</h3>
                        {equipment.length > 0 ? (
                            (() => {
                                const e = equipment[0];
                                return (
                                    <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center bg-surface-container-low p-md rounded-xl border border-outline-variant/30 hover:shadow-md transition-all">
                                        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest border border-outline-variant/40 relative">
                                            {e.images?.[0] ? (
                                                <img src={e.images[0].image} alt={e.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><ImageIcon size={32} className="text-outline-variant" /></div>
                                            )}
                                            {e.is_electric && (
                                                <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] px-1 rounded font-bold uppercase">⚡ Electric</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="ep-label-caps" style={{fontSize: '9px'}}>{e.equipment_type || 'Agricultural Machine'}</span>
                                            <h4 className="font-bold text-primary text-base truncate mb-1" title={e.name}>{e.name}</h4>
                                            <div className="flex gap-2 items-center flex-wrap mb-2">
                                                <span className="text-xs bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-semibold">{e.location || 'Nearby'}</span>
                                                <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">{e.price_per_day} DA/day</span>
                                            </div>
                                            <div className="text-xs text-on-surface-variant font-medium">
                                                Status: <span className={e.is_available ? "text-emerald-600 font-semibold" : "text-error font-semibold"}>{e.is_available ? "Active & Available" : "Booked Out"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
                                <ImageIcon size={32} className="mx-auto opacity-20 mb-2" />
                                <p className="text-xs text-on-surface-variant italic">No equipment listed in your fleet yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderEquipment = () => (
        <div className="ep-dashboard-container animate-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between mb-lg">
                <div>
                    <span className="ep-label-caps">Inventory Management</span>
                    <h1 className="ep-h1">Machinery Fleet</h1>
                    <p className="text-on-surface-variant mt-2 max-w-2xl">Manage your high-performance agricultural machinery and listing details.</p>
                </div>
                <button 
                    className="ep-btn-secondary flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                    onClick={() => { resetForm(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                >
                    <Plus size={20} /> Add New Entry
                </button>
            </header>

            <div className="ep-equipment-grid mb-xl">
                {equipment.map(e => (
                    <div key={e.id} className="ep-equipment-card">
                        <div className="ep-card-img-container">
                            {e.images?.[0] ? 
                                <img src={e.images[0].image} alt={e.name} className="ep-card-img" /> : 
                                <div className="flex items-center justify-center bg-surface-container h-full"><ImageIcon size={40} className="text-outline-variant" /></div>
                            }
                             <div className="ep-card-badge flex items-center gap-1">
                                {e.is_electric && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mr-1">⚡ Electric</span>}
                                <span>{e.is_available && e.quantity_available > 0 ? 'Available' : 'Booked'}</span>
                            </div>
                        </div>
                        <div className="ep-card-body">
                            <p className="ep-label-caps" style={{fontSize: '10px'}}>{e.equipment_type || 'Machinery'}</p>
                            <h3 className="font-bold text-lg text-primary truncate" title={e.name}>{e.name}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 my-4">
                                <div className="ep-meta-item"><Calendar size={14} /> <span>{e.year_of_manufacture || '2023'}</span></div>
                                <div className="ep-meta-item"><MapPin size={14} className="truncate" /> <span className="truncate">{e.location || 'Fleet Center'}</span></div>
                                <div className="ep-meta-item"><Package size={14} /> <span>{e.quantity_available} Units</span></div>
                                {e.is_electric ? (
                                    <>
                                        {e.flight_time ? (
                                            <div className="ep-meta-item text-emerald-600 font-medium" title="Flight/Operating Time"><Clock size={14} /> <span className="truncate">{e.flight_time}</span></div>
                                        ) : e.battery_capacity ? (
                                            <div className="ep-meta-item text-emerald-600 font-medium" title="Battery Capacity"><Activity size={14} /> <span className="truncate">{e.battery_capacity}</span></div>
                                        ) : (
                                            <div className="ep-meta-item text-emerald-600 font-medium"><Activity size={14} /> <span>Electric</span></div>
                                        )}
                                    </>
                                ) : (
                                    <div className="ep-meta-item" title="Hours of Use"><Timer size={14} /> <span>{e.hours_of_use || '0'} Hrs</span></div>
                                )}
                            </div>

                            <div className="ep-card-footer">
                                <div>
                                    <span className="ep-price">{e.price_per_day} DA</span>
                                    <span className="text-on-surface-variant text-sm">/day</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant" onClick={() => handleEditClick(e)}>
                                        <Pencil size={18} />
                                    </button>
                                    <button className="p-2 rounded-lg bg-error-container/20 hover:bg-error-container/40 transition-colors text-error" onClick={() => handleDeleteEquipment(e.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add New Entry Placeholder */}
                <div 
                    className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-8 text-center bg-surface-container-low opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
                    onClick={() => { resetForm(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                >
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-secondary" />
                    </div>
                    <h4 className="font-bold text-primary mb-1">Add New Entry</h4>
                    <p className="text-xs text-on-surface-variant">List more machinery to your fleet</p>
                </div>
            </div>

            <div className="ep-card mb-lg">
                <h3 className="ep-h3 mb-lg"><Briefcase size={24} className="text-secondary" /> {isEditing ? `Modify Equipment Details` : `Register New Fleet Item`}</h3>
                <form className="expanded-form" onSubmit={handleAddOrUpdateEquipment}>
                    <div className="grid-form">
                        <div className="form-group span-2">
                            <label className="font-semibold text-sm">Machine Identity *</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Deere 8R 410" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" required />
                            {fieldErrors.name && <small className="text-error text-xs">{fieldErrors.name[0]}</small>}
                        </div>
                        <div className="form-group">
                            <label className="font-semibold text-sm">Equipment Category *</label>
                            <input name="equipment_type" value={formData.equipment_type} onChange={handleChange} placeholder="e.g. Heavy Tractor" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" required />
                        </div>
                        <div className="form-group">
                            <label className="font-semibold text-sm">Daily Rental Fee (DA) *</label>
                            <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} placeholder="15000" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" required />
                        </div>
                        <div className="form-group">
                            <label className="font-semibold text-sm">Total Quantity *</label>
                            <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} min="1" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" required />
                        </div>
                        <div className="form-group">
                            <label className="font-semibold text-sm">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2">
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="font-semibold text-sm">Power Source & Technology *</label>
                            <select 
                                name="is_electric" 
                                value={formData.is_electric} 
                                onChange={(e) => {
                                    const val = e.target.value === "true";
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        is_electric: val,
                                        fuel_type: val ? "Electric" : "Diesel",
                                        horsepower: val ? "" : prev.horsepower,
                                        battery_capacity: val ? prev.battery_capacity : "",
                                        charging_time: val ? prev.charging_time : "",
                                        flight_time: val ? prev.flight_time : "",
                                        max_range: val ? prev.max_range : "",
                                        payload_capacity: val ? prev.payload_capacity : ""
                                    }));
                                }} 
                                className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2 font-semibold text-primary"
                            >
                                <option value="false">Conventional (Diesel / Gasoline)</option>
                                <option value="true">Electric / Electronic (incl. Drones)</option>
                            </select>
                        </div>
                        <div className="span-2 pt-4">
                            <div className="ep-label-caps">Technical Specifications</div>
                        </div>
                        {formData.is_electric ? (
                            <>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Battery Capacity</label>
                                    <input name="battery_capacity" value={formData.battery_capacity} onChange={handleChange} placeholder="e.g. 22000 mAh or 100 kWh" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Charging Time</label>
                                    <input name="charging_time" value={formData.charging_time} onChange={handleChange} placeholder="e.g. 1.5 Hours" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Flight / Operating Time</label>
                                    <input name="flight_time" value={formData.flight_time} onChange={handleChange} placeholder="e.g. 45 min or 8 hours" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Max Operating / Flight Range</label>
                                    <input name="max_range" value={formData.max_range} onChange={handleChange} placeholder="e.g. 5 km" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Payload / Lift Capacity</label>
                                    <input name="payload_capacity" value={formData.payload_capacity} onChange={handleChange} placeholder="e.g. 15 kg" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Production Year</label>
                                    <input type="number" name="year_of_manufacture" value={formData.year_of_manufacture} onChange={handleChange} placeholder="2024" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Location / Base</label>
                                    <input name="location" value={formData.location} onChange={handleChange} placeholder="Wilaya, City" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Power (HP)</label>
                                    <input name="horsepower" value={formData.horsepower} onChange={handleChange} placeholder="410 HP" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Production Year</label>
                                    <input type="number" name="year_of_manufacture" value={formData.year_of_manufacture} onChange={handleChange} placeholder="2023" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Location / Base</label>
                                    <input name="location" value={formData.location} onChange={handleChange} placeholder="Wilaya, City" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                                <div className="form-group">
                                    <label className="font-semibold text-sm">Fuel Type</label>
                                    <input name="fuel_type" value={formData.fuel_type} onChange={handleChange} placeholder="Diesel" className="w-full bg-white border border-outline-variant/50 rounded-lg px-4 py-2" />
                                </div>
                            </>
                        )}
                        <div className="form-group span-2">
                            <label className="font-semibold text-sm">Imagery</label>
                            {existingImages.length > 0 && (
                                <div className="flex gap-4 mb-4 flex-wrap">
                                    {existingImages.map(img => (
                                        <div key={img.id} className="relative w-20 h-20 group">
                                            <img src={img.image} className="w-full h-full object-cover rounded-lg border border-outline-variant" alt="Equipment" />
                                            <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                                <Plus size={14} style={{transform: 'rotate(45deg)'}} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-outline-variant border-dashed rounded-lg cursor-pointer bg-white hover:bg-surface-container-low transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-outline" />
                                        <p className="mb-2 text-sm text-on-surface-variant"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-outline">SVG, PNG, JPG or GIF</p>
                                    </div>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                                </label>
                            </div>
                            {selectedFiles.length > 0 && <p className="text-xs mt-2 text-secondary font-semibold">{selectedFiles.length} files selected for upload</p>}
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button type="submit" className="ep-btn-primary flex-1" disabled={loading}>{loading ? "Synchronizing..." : "Authorize Entry"}</button>
                        {isEditing && <button type="button" className="ep-btn-outline" onClick={resetForm}>Cancel Modification</button>}
                    </div>
                </form>
            </div>
        </div>
    );

    const renderUserModal = () => (
        isUserModalOpen && selectedUser && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-primary/5">
                        <h3 className="font-h3 text-h3 text-primary">{selectedUser.role} Information</h3>
                        <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3"><Users className="text-secondary" size={20} /> <span className="font-bold">{selectedUser.name}</span></div>
                        <div className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary text-[20px]">call</span> <span>{selectedUser.phone || 'Not provided'}</span></div>
                        <div className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary text-[20px]">mail</span> <span>{selectedUser.email || 'Not provided'}</span></div>
                        <div className="flex items-center gap-3"><MapPin className="text-secondary" size={20} /> <span>{selectedUser.wilaya || 'Not provided'}</span></div>
                    </div>
                </div>
            </div>
        )
    );

    if (activeTab === "equipment") return (
        <>
            {renderEquipment()}
            {renderUserModal()}
        </>
    );

    if (activeTab === "orders") {
        return (
            <>
                <div className="ep-dashboard-container animate-in">
                    <header className="mb-lg">
                        <span className="ep-label-caps">Booking Logistics</span>
                        <h1 className="ep-h1">Rental Requests</h1>
                        <p className="text-on-surface-variant mt-2 max-w-2xl">Manage machinery bookings and dispatch schedules from farmers across the country.</p>
                    </header>

                    <div className="ep-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="history-table w-full">
                                <thead>
                                    <tr className="border-b border-surface-container-highest">
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Request ID</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Machinery</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Farmer Profile</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Timeline</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Rental Details</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Total Revenue</th>
                                        <th className="py-4 font-label-caps" style={{fontSize: '10px'}}>Current Status</th>
                                        <th className="py-4 font-label-caps text-right" style={{fontSize: '10px'}}>Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container">
                                    {bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-surface-bright transition-colors">
                                            <td className="py-4 text-sm font-bold">#{b.id}</td>
                                            <td className="py-4">
                                                <div className="font-bold text-primary">{b.equipment_name}</div>
                                                <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Asset ID: {b.equipment}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="font-medium flex flex-col items-start gap-1">
                                                    {b.farmer_name}
                                                    <button onClick={() => { setSelectedUser({name: b.farmer_name, phone: b.farmer_phone, email: b.farmer_email, wilaya: b.farmer_wilaya, role: 'Farmer'}); setIsUserModalOpen(true); }} className="px-3 py-1.5 rounded-lg font-button text-[10px] bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-sm active:scale-95"><Users size={12}/> Client Info</button>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">
                                                {new Date(b.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <div className="text-sm font-medium">{b.requested_quantity} Unit(s)</div>
                                                <div className="text-[10px] text-secondary font-bold uppercase">{b.rental_days} Rental Day(s)</div>
                                            </td>
                                            <td className="py-4 font-bold text-secondary">
                                                {b.total_price ? `${b.total_price.toLocaleString()} DA` : '--'}
                                            </td>
                                            <td className="py-4">
                                                <span className={`status-badge ${b.status.toLowerCase()} shadow-sm`}>{b.status}</span>
                                            </td>
                                            <td className="py-4 text-right">
                                                {b.status === 'PENDING' ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button className="p-2 rounded-lg bg-secondary-container text-on-secondary-container hover:shadow-md transition-all" onClick={() => handleUpdateBookingStatus(b.id, 'ACCEPTED')} title="Authorize">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button className="p-2 rounded-lg bg-error-container text-on-error-container hover:shadow-md transition-all" onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')} title="Decline">
                                                            <AlertCircle size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-on-surface-variant font-medium italic">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && (
                                <div className="py-12 text-center text-on-surface-variant">
                                    <div className="mb-4 flex justify-center opacity-20"><Briefcase size={64} /></div>
                                    <p>No machinery bookings have been registered yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {renderUserModal()}
            </>
        );
    }

    if (activeTab === "notifications") {
        return (
            <>
                <div className="ep-dashboard-container animate-in">
                    <header className="mb-lg">
                        <span className="ep-label-caps">Communication Center</span>
                        <h1 className="ep-h1">Notifications</h1>
                        <p className="text-on-surface-variant mt-2 max-w-2xl">Official alerts and messages regarding your machinery fleet and rental operations.</p>
                    </header>
                    <div className="space-y-4">
                        {notifications.map(n => (
                            <div key={n.id} className="ep-card flex gap-4 hover:border-secondary transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-colors">
                                    <Info size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-primary mb-1">{n.message}</p>
                                    <div className="flex items-center gap-2 text-on-surface-variant">
                                        <Clock size={12} />
                                        <span className="text-xs font-bold uppercase">{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button className="text-outline-variant hover:text-secondary"><ChevronRight size={24} /></button>
                            </div>
                        ))}
                        {notifications.length === 0 && (
                            <div className="ep-card text-center py-20">
                                <div className="mb-4 flex justify-center opacity-20"><Info size={64} /></div>
                                <p className="text-on-surface-variant font-medium">Your notification inbox is currently clear.</p>
                            </div>
                        )}
                    </div>
                </div>
                {renderUserModal()}
            </>
        );
    }

    // Default dashboard view
    return (
        <>
            {renderDashboard()}
            {renderUserModal()}
        </>
    );
};

export default EquipmentProviderDashboard;
