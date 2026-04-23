import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import {
    Home, Package, Clock, CheckCircle,
    Plus, AlertCircle, Calendar, Settings,
    Wrench, Activity, Info, Pencil, Trash2,
    Upload, MapPin, DollarSign, Image as ImageIcon,
    TrendingUp, ChevronRight, MessageSquare, ShieldCheck, Download, Users, Briefcase, Timer
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/equipment_provider.css";

const EquipmentProviderDashboard = ({ activeTab }) => {
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
        is_available: true, expected_available_date: "", quantity_available: 1
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

    useEffect(() => {
        fetchEquipment();
        fetchBookings();
        fetchNotifications();
    }, [activeTab]);

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
            is_available: true, expected_available_date: "", quantity_available: 1
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

    const renderDashboard = () => (
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

            <div className="ep-bento-grid">
                {/* Sales Performance Chart */}
                <div className="col-span-12 md:col-span-8 ep-card">
                    <div className="flex items-center justify-between mb-lg">
                        <h3 className="ep-h3"><TrendingUp size={24} className="text-secondary" /> Rental Revenue</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase">
                                +12% Efficiency
                            </span>
                        </div>
                    </div>
                    <div className="ep-chart-container">
                        {[40, 65, 90, 55, 75, 82].map((height, i) => (
                            <div key={i} className="ep-chart-bar" style={{ height: `${height}%` }}>
                                <div className="ep-chart-tooltip">Week {i+1}: {(height * 100).toLocaleString()} DA</div>
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

                {/* Inventory Status */}
                <div className="col-span-12 md:col-span-4 ep-card ep-card-primary">
                    <h3 className="ep-h3 text-white mb-lg"><Package size={24} className="text-secondary-container" /> Fleet Health</h3>
                    <div className="space-y-6">
                        <div className="ep-status-row">
                            <div className="ep-status-info">
                                <span className="font-semibold text-sm">Overall Availability</span>
                                <span className="font-bold">{Math.round((stats.available_fleet / (stats.total_equipment || 1)) * 100)}%</span>
                            </div>
                            <div className="ep-progress-bg">
                                <div className="ep-progress-fill" style={{ width: `${(stats.available_fleet / (stats.total_equipment || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="ep-status-row">
                            <div className="ep-status-info">
                                <span className="font-semibold text-sm">Service Rate</span>
                                <span className="font-bold">94%</span>
                            </div>
                            <div className="ep-progress-bg">
                                <div className="ep-progress-fill" style={{ width: '94%', backgroundColor: '#4ade80' }}></div>
                            </div>
                        </div>
                    </div>
                    <button className="mt-auto w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-surface-container-high transition-colors" onClick={() => window.scrollTo(0,0)}>
                        Optimize Fleet
                    </button>
                </div>

                {/* Recent Inquiries/Bookings */}
                <div className="col-span-12 md:col-span-6 ep-card">
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
                                        <h4 className="font-bold">{b.farmer_name}</h4>
                                        <span className="text-[10px] text-outline font-bold uppercase">New</span>
                                    </div>
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
                <div className="col-span-12 md:col-span-6 ep-card">
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
        </div>
    );

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
                            <div className="ep-card-badge">
                                {e.is_available && e.quantity_available > 0 ? 'Available' : 'Booked'}
                            </div>
                        </div>
                        <div className="ep-card-body">
                            <p className="ep-label-caps" style={{fontSize: '10px'}}>{e.equipment_type || 'Machinery'}</p>
                            <h3 className="font-bold text-lg text-primary">{e.name}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 my-4">
                                <div className="ep-meta-item"><Calendar size={14} /> <span>{e.year_of_manufacture || '2023'}</span></div>
                                <div className="ep-meta-item"><Timer size={14} /> <span>{e.hours_of_use || '0'} Hrs</span></div>
                                <div className="ep-meta-item"><MapPin size={14} /> <span>{e.location || 'Fleet Center'}</span></div>
                                <div className="ep-meta-item"><Package size={14} /> <span>{e.quantity_available} Units</span></div>
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
                        <div className="span-2 pt-4">
                            <div className="ep-label-caps">Technical Specifications</div>
                        </div>
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

    if (activeTab === "equipment") return renderEquipment();

    if (activeTab === "orders") {
        return (
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
                                            <div className="font-medium">{b.farmer_name}</div>
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
        );
    }

    if (activeTab === "notifications") {
        return (
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
        );
    }

    // Default dashboard view
    return renderDashboard();
};

export default EquipmentProviderDashboard;
