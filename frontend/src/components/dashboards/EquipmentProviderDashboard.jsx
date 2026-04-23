import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import {
    Home, Package, Clock, CheckCircle,
    Plus, AlertCircle, Calendar, Settings,
    Wrench, Activity, Info, Edit, Trash2,
    Upload, MapPin, DollarSign, Image as ImageIcon
} from "lucide-react";
import "../../styles/dashboard.css";

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
    const [stats, setStats] = useState({ total_equipment: 0, total_bookings: 0, pending_bookings: 0 });
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchEquipment();
        fetchBookings();
        fetchNotifications();
    }, [activeTab]);

    const fetchEquipment = async () => {
        try {
            const res = await api.get("market/equipment/");
            setEquipment(res.data);
            setStats(prev => ({ ...prev, total_equipment: res.data.length }));
        } catch (err) { console.error("Error fetching equipment:", err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await api.get("market/equipment-bookings/");
            setBookings(res.data);
            setStats(prev => ({
                ...prev,
                total_bookings: res.data.length,
                pending_bookings: res.data.filter(b => b.status === 'PENDING').length
            }));
        } catch (err) { console.error(err); }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("market/notifications/");
            setNotifications(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        try {
            await api.patch(`market/equipment-bookings/${id}/`, { status });
            fetchBookings();
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

        if (formData.quantity_available < 1 || formData.quantity_available === "") {
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
            alert("Success!");
            resetForm();
            fetchEquipment();
        } catch (err) {
            if (err.response?.data) setFieldErrors(err.response.data);
            alert("Error saving equipment.");
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

    const renderEquipment = () => (
        <div className="glass-panel animate-in">
            <div className="section-header"><h2>Manage Machinery Fleet</h2></div>
            <div className="inventory-list mt-2">
                <div className="grid-list">
                    {equipment.map(e => (
                        <div key={e.id} className="card-item animate-in">
                            <div className="card-image-box">
                                {e.images?.[0] ? <img src={e.images[0].image} alt={e.name} /> : <div className="image-placeholder"><ImageIcon size={40} color="#cbd5e1" /></div>}
                            </div>
                            <div className="card-content">
                                <h3>{e.name}</h3>
                                <div className="mini-meta"><strong>{e.price_per_day} DA/day</strong></div>
                                <div className="mini-meta"><MapPin size={14} /> <span>{e.location || 'Not set'}</span></div>
                                <div className="mini-meta"><span>{e.quantity_available} units available</span></div>
                            </div>
                            <div className="flex-gap-sm p-1">
                                <button className="btn-success-sm full-width" onClick={() => handleEditClick(e)}><Edit size={16} /> Edit</button>
                                <button className="btn-danger-sm" onClick={() => api.delete(`market/equipment/${e.id}/`).then(fetchEquipment)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-3 divider"></div>
            <h3>{isEditing ? `Edit Machine` : `Add New Machine`}</h3>
            <form className="expanded-form" onSubmit={handleAddOrUpdateEquipment}>
                <div className="grid-form">
                    <div className="form-group span-2"><label>Machine Name *</label><input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Deere 6120M" />{fieldErrors.name && <small className="error-text">{fieldErrors.name[0]}</small>}</div>
                    <div className="form-group"><label>Category *</label><input name="equipment_type" value={formData.equipment_type} onChange={handleChange} placeholder="e.g. Tractor" /></div>
                    <div className="form-group"><label>Price/Day *</label><input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} placeholder="5000" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} /></div>
                    <div className="form-group"><label>Available Quantity *</label><input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} min="1" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '.') e.preventDefault(); }} /></div>
                    <div className="span-2"><strong>--- Technical Specifications ---</strong></div>
                    <div className="form-group"><label>Power</label><input name="horsepower" value={formData.horsepower} onChange={handleChange} placeholder="120 HP" /></div>
                    <div className="form-group"><label>Year</label><input type="number" name="year_of_manufacture" value={formData.year_of_manufacture} onChange={handleChange} placeholder="2020" min="1900" max={new Date().getFullYear() + 1} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} /></div>
                    <div className="form-group"><label>Fuel</label><input name="fuel_type" value={formData.fuel_type} onChange={handleChange} placeholder="Diesel" /></div>
                    <div className="form-group"><label>Location</label><input name="location" value={formData.location} onChange={handleChange} placeholder="Farm Address" /></div>
                    <div className="form-group span-2">
                        <label>Photos</label>
                        {existingImages.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                {existingImages.map(img => (
                                    <div key={img.id} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        <img src={img.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="Equipment" />
                                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                    </div>
                </div>
                <button type="submit" className="btn-primary mt-1" disabled={loading}>{loading ? "Saving..." : "Save Equipment"}</button>
            </form>
        </div>
    );

    if (activeTab === "equipment") return renderEquipment();

    if (activeTab === "orders") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Equipment Bookings</h2>
                    <p>Manage rental requests from farmers</p>
                </div>
                <div className="history-table-container mt-2">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Machine</th>
                                <th>Farmer</th>
                                <th>Requested Date</th>
                                <th>Quantity</th>
                                <th>Days</th>
                                <th>Quantity/Available</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id}>
                                    <td>#{b.id}</td>
                                    <td><strong>{b.equipment_name}</strong></td>
                                    <td>{b.farmer_name}</td>
                                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                                    <td>{b.requested_quantity || 1}</td>
                                    <td>{b.rental_days || 1}</td>
                                    <td>{b.requested_quantity || 1} / {b.equipment_total_quantity}</td>
                                    <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'PENDING' ? (
                                            <div className="flex-gap-sm">
                                                <button className="btn-success-sm" onClick={() => handleUpdateBookingStatus(b.id, 'ACCEPTED')}><CheckCircle size={16} /> Accept</button>
                                                <button className="btn-danger-sm" onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')}><AlertCircle size={16} /> Reject</button>
                                            </div>
                                        ) : (
                                            <span className="text-muted">{b.status}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && <p className="empty-state">No rental requests at the moment.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Notifications</h2>
                    <p>Alerts about your bookings and equipment</p>
                </div>
                <div className="notifications-list mt-2">
                    {notifications.map(n => (
                        <div key={n.id} className="notification-card">
                            <div className="notif-content">
                                <p>{n.message}</p>
                                <span className="timestamp">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p className="empty-text">No notifications yet.</p>}
                </div>
            </div>
        );
    }

    // Default dashboard views
    return (
        <div className="glass-panel animate-in">
            <div className="section-header">
                <h2>Provider Overview</h2>
                <p>Quick stats and active bookings</p>
            </div>
            <div className="stats-grid mt-2">
                <div className="stat-card stat-blue">
                    <div className="stat-icon"><Activity /></div>
                    <div className="stat-info">
                        <h3>{stats.total_equipment}</h3>
                        <p>Total Machines</p>
                    </div>
                </div>
                <div className="stat-card stat-yellow">
                    <div className="stat-icon"><Clock /></div>
                    <div className="stat-info">
                        <h3>{stats.pending_bookings}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="stat-card stat-green">
                    <div className="stat-icon"><CheckCircle /></div>
                    <div className="stat-info">
                        <h3>{stats.total_bookings}</h3>
                        <p>Total Bookings</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default EquipmentProviderDashboard;
