import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Package, ShoppingBag, Clock, CheckCircle, DollarSign, Plus, Truck, AlertCircle, FileText, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";

const ALGERIA_WILAYAS = [
    { id: 1, name: "Adrar", lat: 27.8727, lon: -0.2929 },
    { id: 2, name: "Chlef", lat: 36.1667, lon: 1.3333 },
    { id: 3, name: "Laghouat", lat: 33.8000, lon: 2.8667 },
    { id: 4, name: "Oum El Bouaghi", lat: 35.8750, lon: 7.1133 },
    { id: 5, name: "Batna", lat: 35.5500, lon: 6.1667 },
    { id: 6, name: "Bejaia", lat: 36.7500, lon: 5.0667 },
    { id: 7, name: "Biskra", lat: 34.8500, lon: 5.7333 },
    { id: 8, name: "Bechar", lat: 31.6167, lon: -2.2167 },
    { id: 9, name: "Blida", lat: 36.4833, lon: 2.8333 },
    { id: 10, name: "Bouira", lat: 36.3833, lon: 3.9000 },
    { id: 11, name: "Tamanrasset", lat: 22.7850, lon: 5.5228 },
    { id: 12, name: "Tebessa", lat: 35.4000, lon: 8.1167 },
    { id: 13, name: "Tlemcen", lat: 34.8833, lon: -1.3167 },
    { id: 14, name: "Tiaret", lat: 35.3667, lon: 1.3167 },
    { id: 15, name: "Tizi Ouzou", lat: 36.7139, lon: 4.0486 },
    { id: 16, name: "Algiers", lat: 36.7525, lon: 3.0420 },
    { id: 17, name: "Djelfa", lat: 34.6667, lon: 3.2500 },
    { id: 18, name: "Jijel", lat: 36.8167, lon: 5.7667 },
    { id: 19, name: "Setif", lat: 36.1833, lon: 5.4167 },
    { id: 20, name: "Saida", lat: 34.8333, lon: 0.1500 },
    { id: 21, name: "Skikda", lat: 36.8667, lon: 6.9167 },
    { id: 22, name: "Sidi Bel Abbes", lat: 35.2000, lon: -0.6333 },
    { id: 23, name: "Annaba", lat: 36.9000, lon: 7.7667 },
    { id: 24, name: "Guelma", lat: 36.4667, lon: 7.4833 },
    { id: 25, name: "Constantine", lat: 36.3667, lon: 6.6000 },
    { id: 26, name: "Medea", lat: 36.2667, lon: 2.7500 },
    { id: 27, name: "Mostaganem", lat: 35.9333, lon: 0.0833 },
    { id: 28, name: "M'Sila", lat: 35.7000, lon: 4.5333 },
    { id: 29, name: "Mascara", lat: 35.4000, lon: 0.1333 },
    { id: 30, name: "Ouargla", lat: 31.9500, lon: 5.3167 },
    { id: 31, name: "Oran", lat: 35.7000, lon: -0.6333 },
    { id: 32, name: "El Bayadh", lat: 33.6833, lon: 1.0167 },
    { id: 33, name: "Illizi", lat: 26.4833, lon: 8.4667 },
    { id: 34, name: "Bordj Bou Arreridj", lat: 36.0667, lon: 4.7667 },
    { id: 35, name: "Boumerdes", lat: 36.7500, lon: 3.4833 },
    { id: 36, name: "El Tarf", lat: 36.7667, lon: 8.3167 },
    { id: 37, name: "Tindouf", lat: 27.6667, lon: -8.1333 },
    { id: 38, name: "Tissemsilt", lat: 35.6000, lon: 1.8167 },
    { id: 39, name: "El Oued", lat: 33.3667, lon: 6.8667 },
    { id: 40, name: "Khenchela", lat: 35.4333, lon: 7.1500 },
    { id: 41, name: "Souk Ahras", lat: 36.2833, lon: 7.9500 },
    { id: 42, name: "Tipaza", lat: 36.5914, lon: 2.4439 },
    { id: 43, name: "Mila", lat: 36.4500, lon: 6.2667 },
    { id: 44, name: "Ain Defla", lat: 36.2667, lon: 1.9667 },
    { id: 45, name: "Naama", lat: 33.2667, lon: -0.3167 },
    { id: 46, name: "Ain Temouchent", lat: 35.3000, lon: -1.1333 },
    { id: 47, name: "Ghardaia", lat: 32.4833, lon: 3.6667 },
    { id: 48, name: "Relizane", lat: 35.7333, lon: 0.5500 },
    { id: 49, name: "El M'Ghair", lat: 33.9189, lon: 5.9286 },
    { id: 50, name: "El Meniaa", lat: 30.5772, lon: 2.8794 },
    { id: 51, name: "Ouled Djellal", lat: 34.4333, lon: 5.0667 },
    { id: 52, name: "Bordj Baji Mokhtar", lat: 21.3333, lon: 0.9667 },
    { id: 53, name: "Beni Abbes", lat: 30.1333, lon: -2.1667 },
    { id: 54, name: "Timimoun", lat: 29.2631, lon: 0.2311 },
    { id: 55, name: "Touggourt", lat: 33.1000, lon: 6.0667 },
    { id: 56, name: "Djanet", lat: 24.5500, lon: 9.4833 },
    { id: 57, name: "In Salah", lat: 27.2000, lon: 2.4833 },
    { id: 58, name: "In Guezzam", lat: 19.5667, lon: 5.7667 }
];

const FarmerDashboard = ({ activeTab }) => {
    const [products, setProducts] = useState([]);
    const [productsCount, setProductsCount] = useState(0);
    const [productsPage, setProductsPage] = useState(1);

    const [orders, setOrders] = useState([]);
    const [ordersCount, setOrdersCount] = useState(0);
    const [ordersPage, setOrdersPage] = useState(1);
    const [trackingPage, setTrackingPage] = useState(1);

    const [notifications, setNotifications] = useState([]);
    
    const [catalog, setCatalog] = useState([]);
    const [catalogCount, setCatalogCount] = useState(0);
    const [catalogPage, setCatalogPage] = useState(1);

    const [farms, setFarms] = useState([]);
    const [stats, setStats] = useState({
        total_products: 0,
        total_quantity: 0,
        total_orders: 0,
        pending_orders: 0,
        completed_orders: 0,
        total_revenue: 0
    });
    const [formData, setFormData] = useState({
        catalog: "",
        price_per_kg: "",
        quantity_available: "",
        farm: "",
    });
    const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Weather Feature States
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [selectedWilaya, setSelectedWilaya] = useState(ALGERIA_WILAYAS[15]); // Default to Algiers

    useEffect(() => {
        fetchProducts(productsPage);
        fetchOrders(ordersPage);
        fetchStats();
        fetchNotifications();
        fetchCatalog(catalogPage);
        fetchFarms();
    }, [activeTab, productsPage, ordersPage, catalogPage]);

    useEffect(() => {
        fetchWeatherData();
    }, [selectedWilaya]);

    const fetchWeatherData = async () => {
        setLoadingWeather(true);
        try {
            const res = await api.get(`weather/?lat=${selectedWilaya.lat}&lon=${selectedWilaya.lon}`);
            setWeatherData(res.data);
        } catch (err) {
            console.error("Error fetching weather:", err);
        } finally {
            setLoadingWeather(false);
        }
    };

    const fetchCatalog = async (page = 1) => {
        try {
            const res = await api.get(`market/catalog/?page=${page}`);
            const data = res.data.results || res.data;
            setCatalog(Array.isArray(data) ? data : []);
            setCatalogCount(res.data.count || (Array.isArray(data) ? data.length : 0));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async (page = 1) => {
        try {
            const res = await api.get(`market/products/?page=${page}`);
            if (res.data.results) {
                setProducts(res.data.results);
                setProductsCount(res.data.count);
            } else {
                setProducts(res.data);
                setProductsCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchOrders = async (page = 1) => {
        try {
            const res = await api.get(`market/orders/?page=${page}`);
            if (res.data.results) {
                setOrders(res.data.results);
                setOrdersCount(res.data.count);
            } else {
                setOrders(res.data);
                setOrdersCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    const fetchFarms = async () => {
        try {
            const res = await api.get("farms/");
            const data = res.data.results || res.data;
            setFarms(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0 && !formData.farm) {
                setFormData(prev => ({ ...prev, farm: data[0].id }));
            }
        } catch (err) {
            console.error("Error fetching farms:", err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("market/products/stats/");
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "catalog") {
            const found = catalog.find(c => String(c.id) === String(value));
            setSelectedCatalogItem(found || null);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.catalog || !formData.price_per_kg || !formData.quantity_available || !formData.farm) {
            alert("Please select a product type, farm, and fill all fields.");
            setLoading(false);
            return;
        }

        try {
            await api.post("market/products/", formData);
            alert("Product added to your inventory!");
            setFormData({
                catalog: "",
                price_per_kg: "",
                quantity_available: "",
                farm: farms.length > 0 ? farms[0].id : "",
            });
            fetchProducts();
            fetchStats();
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Error adding product. Please ensure all fields are correct.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this product?");
        if (!ok) return;

        try {
            await api.delete(`market/products/${id}/`);
            fetchProducts();
            fetchStats();
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product.");
        }
    };

    const handleAddFarm = async (e) => {
        e.preventDefault();
        const name = e.target.farm_name.value;
        const wilaya = e.target.wilaya.value;
        const location = e.target.location.value;

        if (!name || !wilaya) return alert("Farm name and wilaya are required.");

        setLoading(true);
        try {
            await api.post("farms/", { name, wilaya, location });
            alert("Farm added successfully!");
            e.target.reset();
            fetchFarms();
        } catch (err) {
            alert(err.response?.data?.detail || "Error adding farm.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFarm = async (id) => {
        if (!window.confirm("Are you sure? This will delete the farm profile.")) return;
        try {
            await api.delete(`farms/${id}/`);
            fetchFarms();
        } catch (err) {
            alert("Error deleting farm.");
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get("market/notifications/");
            const data = res.data.results || res.data;
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.patch(`market/orders/${id}/`, { status });
            fetchOrders();
            fetchStats();
        } catch (err) {
            console.error("Error updating order:", err);
            alert("Failed to update order status.");
        }
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        const subject = e.target.subject.value;
        const message = e.target.message.value;
        const orderId = e.target.orderId.value;

        if (!subject || !message) return alert("Please fill subject and message");

        setLoading(true);
        try {
            await api.post("market/complaints/", {
                subject,
                message,
                order: orderId ? parseInt(orderId.replace('#', '')) : null
            });
            alert("Complaint submitted successfully!");
            e.target.reset();
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || "Error submitting complaint";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (activeTab === "dashboard") {
        const statCards = [
            { label: "Products", value: stats.total_products, icon: <Package />, color: "blue" },
            { label: "Active Orders", value: stats.pending_orders, icon: <ShoppingBag />, color: "yellow" },
            { label: "Completed", value: stats.completed_orders, icon: <CheckCircle />, color: "green" },
            { label: "Revenue", value: `${stats.total_revenue} DA`, icon: <DollarSign />, color: "purple" }
        ];

        return (
            <div className="farmer-dashboard-home animate-in">
                {/* Weather & Location Section */}
                <div className="weather-header-section glass-panel mb-2">
                    <div className="weather-top-row">
                        <div className="location-info">
                            <div className="location-label">
                                <Truck size={18} color="#2f8f3a" />
                                <span>Farm Location:</span>
                            </div>
                            <select 
                                className="wilaya-select"
                                value={selectedWilaya.id}
                                onChange={(e) => {
                                    const w = ALGERIA_WILAYAS.find(wilaya => String(wilaya.id) === String(e.target.value));
                                    setSelectedWilaya(w);
                                }}
                            >
                                {ALGERIA_WILAYAS.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="weather-status">
                            {loadingWeather ? (
                                <span className="text-muted">Syncing climate data...</span>
                            ) : (
                                <span className="text-muted">Last updated: {weatherData?.last_updated || '--'}</span>
                            )}
                        </div>
                    </div>

                    <div className="weather-grid mt-1">
                        {/* Current Weather */}
                        <div className="weather-card-mini">
                            <div className="w-card-header">
                                <Plus size={18} color="#2f8f3a" />
                                <h4>Current Weather</h4>
                            </div>
                            {loadingWeather ? <div className="skeleton-line"></div> : (
                                <div className="w-card-body">
                                    <div className="w-main-temp">
                                        <span className="temp-val">{weatherData?.weather.temp}°C</span>
                                        <span className="temp-desc">{weatherData?.weather.description}</span>
                                    </div>
                                    <div className="w-details">
                                        <span>Humidity: <strong>{weatherData?.weather.humidity}%</strong></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Irrigation & Soil */}
                        <div className="weather-card-mini">
                            <div className="w-card-header">
                                <AlertCircle size={18} color="#f59e0b" />
                                <h4>Soil & Irrigation</h4>
                            </div>
                            {loadingWeather ? <div className="skeleton-line"></div> : (
                                <div className="w-card-body">
                                    <div className={`recommendation-badge ${weatherData?.soil.is_needed ? 'needed' : 'optimal'}`}>
                                        {weatherData?.soil.irrigation_recommendation}
                                    </div>
                                    <div className="w-details">
                                        <span>Soil Moisture: <strong>{(weatherData?.soil.moisture * 100).toFixed(0)}%</strong></span>
                                        <span>Surface Temp: <strong>{weatherData?.soil.surface_temp}°C</strong></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3-Day Forecast */}
                        <div className="weather-card-mini span-2-tablet">
                            <div className="w-card-header">
                                <Clock size={18} color="#3b82f6" />
                                <h4>3-Day Forecast</h4>
                            </div>
                            <div className="forecast-mini-list">
                                {loadingWeather ? [1,2,3].map(i => <div key={i} className="skeleton-line-sm"></div>) : (
                                    weatherData?.forecast.map((f, i) => (
                                        <div key={i} className="forecast-mini-item">
                                            <span className="f-day">{f.day}</span>
                                            <span className="f-desc">{f.desc}</span>
                                            <span className="f-temp">{f.temp}°C</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    {statCards.map((s, i) => (
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
                            <h3>Quick Add Product</h3>
                            <Plus size={20} color="#6b7280" />
                        </div>
                        <form className="mini-form" onSubmit={handleAddProduct}>
                            <select name="catalog" value={formData.catalog} onChange={handleChange} required>
                                <option value="">Select Product Type</option>
                                {catalog.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <select name="farm" value={formData.farm} onChange={handleChange} required>
                                <option value="">Select Farm</option>
                                {farms.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.wilaya})</option>
                                ))}
                            </select>
                            <div className="form-row">
                                <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                    <input
                                        type="number" name="price_per_kg"
                                        value={formData.price_per_kg} onChange={handleChange}
                                        placeholder="Price /kg"
                                        min={selectedCatalogItem?.min_price ?? undefined}
                                        max={selectedCatalogItem?.max_price ?? undefined}
                                        required
                                    />
                                    {selectedCatalogItem?.min_price && selectedCatalogItem?.max_price && (
                                        <small style={{color:'#6b7280', fontSize:'0.75rem'}}>
                                            Allowed: {selectedCatalogItem.min_price} – {selectedCatalogItem.max_price} DA / {selectedCatalogItem.unit || 'kg'}
                                        </small>
                                    )}
                                </div>
                                <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder={`Qty (${selectedCatalogItem?.unit || 'kg'})`} required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
                        </form>
                    </div>

                    <div className="glass-panel">
                        <div className="panel-header">
                            <h3>Pending Sales</h3>
                            <Clock size={20} color="#f59e0b" />
                        </div>
                        <div className="mini-list">
                            {orders.filter(o => o.status === 'PENDING').slice(0, 3).map(o => (
                                <div key={o.id} className="mini-item">
                                    <div className="item-main">
                                        <strong>{o.product_name || "Product"}</strong>
                                        <span>{o.quantity}kg • {o.total_price} DA</span>
                                    </div>
                                    <div className="flex-gap-sm">
                                        <button className="btn-sm" onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}>Accept</button>
                                        <button className="btn-sm btn-outline" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}>Reject</button>
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.status === 'PENDING').length === 0 && <p className="empty-text">No pending orders.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Manage My Products</h2>
                    <p>Add new products or update existing inventory</p>
                </div>

                <form className="expanded-form" onSubmit={handleAddProduct}>
                    <div className="grid-form">
                        <div className="form-group span-2">
                            <label>Product Type (From Official List)</label>
                            <select name="catalog" value={formData.catalog} onChange={handleChange} required>
                                <option value="">-- Choose a product type --</option>
                                {catalog.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group span-2">
                            <label>Origin Farm</label>
                            <select name="farm" value={formData.farm} onChange={handleChange} required>
                                <option value="">-- Select Farm --</option>
                                {farms.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.wilaya})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price per Kg (DA)</label>
                            <input
                                type="number" name="price_per_kg"
                                value={formData.price_per_kg} onChange={handleChange}
                                placeholder="0.00" required
                                min={selectedCatalogItem?.min_price ?? undefined}
                                max={selectedCatalogItem?.max_price ?? undefined}
                            />
                            {selectedCatalogItem?.min_price && selectedCatalogItem?.max_price && (
                                <small className="price-hint">
                                    💰 Allowed range: <strong>{selectedCatalogItem.min_price}</strong> to <strong>{selectedCatalogItem.max_price}</strong> DA / {selectedCatalogItem.unit || 'kg'}
                                </small>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Available Quantity (kg)</label>
                            <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder={`Available (${selectedCatalogItem?.unit || 'kg'})`} required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary mt-1" disabled={loading}>{loading ? "Publishing..." : "Add Product to Market"}</button>
                </form>

                <div className="inventory-list mt-2">
                    <h3>Current Inventory</h3>
                    <div className="grid-list">
                        {products.map(p => (
                            <div key={p.id} className="card-item animate-in">
                                <div className="card-content">
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                                        <h3>{p.name || "Unnamed Product"}</h3>
                                        <span className="source-farm-tag" style={{fontSize:'0.7rem', padding:'2px 8px', background:'#f3f4f6', borderRadius:'12px', color:'#374151'}}>
                                            📍 {p.farm_name || "Unknown Farm"}
                                        </span>
                                    </div>
                                    <p className="p-desc">{p.description || "No description available"}</p>
                                    <div className="product-meta">
                                        <strong>{p.price_per_kg} DA/kg</strong>
                                        <span>{p.quantity_available}kg left</span>
                                    </div>
                                </div>
                                <button className="btn-danger-outline full-width" onClick={() => handleDeleteProduct(p.id)}>Remove Product</button>
                            </div>
                        ))}
                    </div>
                </div>
                <Pagination 
                    currentPage={productsPage}
                    totalCount={productsCount}
                    pageSize={10}
                    onPageChange={setProductsPage}
                />
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Orders & Sales</h2>
                    <p>Track incoming buyer requests</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td>#{o.id}</td>
                                    <td>{o.product_name}</td>
                                    <td>{o.quantity}kg</td>
                                    <td>{o.total_price} DA</td>
                                    <td>{o.buyer_name}</td>
                                    <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                                    <td>
                                        {o.status === 'PENDING' && (
                                            <div className="flex-gap-sm">
                                                <button className="btn-success-sm" onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}>Accept</button>
                                                <button className="btn-danger-sm" onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}>Reject</button>
                                            </div>
                                        )}
                                        {o.status === 'ACCEPTED' && <span className="text-muted">Wait for Transporter</span>}
                                        {o.status === 'DELIVERED' && <CheckCircle size={16} color="#059669" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
                </div>
                <Pagination 
                    currentPage={ordersPage}
                    totalCount={ordersCount}
                    pageSize={10}
                    onPageChange={setOrdersPage}
                />
            </div>
        );
    }

    if (activeTab === "tracking") {
        const activeTracking = orders.filter(o => ['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status));
        const paginatedTracking = activeTracking.slice((trackingPage - 1) * 10, trackingPage * 10);
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Delivery Tracking</h2>
                    <p>Monitor your products en route to buyers</p>
                </div>
                <div className="grid-list">
                    {paginatedTracking.map(o => (
                        <div key={o.id} className="card-item tracking-card">
                            <div className="card-header">
                                <h3>Order #{o.id}</h3>
                                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                            </div>
                            <div className="tracking-info">
                                <div className="info-row">
                                    <Truck size={18} />
                                    <span>Transporter: {o.transporter_name || "Assigning..."}</span>
                                </div>
                                <div className="info-row">
                                    <Clock size={18} />
                                    <span>Delivery Status: {o.delivery_status || "Pending Pickup"}</span>
                                </div>
                            </div>
                            <div className="progress-track-container">
                                <div className="track-step active">Accepted</div>
                                <div className={`track-line ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}>In Transit</div>
                                <div className={`track-line ${o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'DELIVERED' ? 'active' : ''}`}>Delivered</div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && <p className="empty-state">No active deliveries to track.</p>}
                </div>
                {activeTracking.length > 0 && (
                    <Pagination 
                        currentPage={trackingPage}
                        totalCount={activeTracking.length}
                        pageSize={10}
                        onPageChange={setTrackingPage}
                    />
                )}
            </div>
        );
    }

    if (activeTab === "prices") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2><FileText size={24} /> Official Market Prices</h2>
                    <p>Price ranges set by the Ministry of Agriculture</p>
                </div>
                {catalog.length === 0 ? (
                    <p className="notice-box">
                        <AlertCircle size={20} />
                        No official price ranges have been published yet by the Ministry.
                    </p>
                ) : (
                    <table className="price-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Description</th>
                                <th>Min Price (DA)</th>
                                <th>Max Price (DA)</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalog.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.description || "—"}</td>
                                    <td style={{color:'#059669', fontWeight:600}}>{c.min_price ?? "—"}</td>
                                    <td style={{color:'#dc2626', fontWeight:600}}>{c.max_price ?? "—"}</td>
                                    <td style={{fontSize:'0.85rem', color:'#64748b'}}>{c.unit || 'kg'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <Pagination 
                    currentPage={catalogPage}
                    totalCount={catalogCount}
                    pageSize={10}
                    onPageChange={setCatalogPage}
                />
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Notifications</h2>
                    <p>Alerts and updates from the Ministry</p>
                </div>
                <div className="notifications-list">
                    {notifications.map(n => (
                        <div key={n.id} className={`notification-card ${n.is_read ? 'read' : 'unread'}`}>
                            <div className="notif-icon"><Bell size={20} /></div>
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

    if (activeTab === "farms") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Manage My Farms</h2>
                    <p>View and add your agriculture locations (Max 5)</p>
                </div>

                <div className="dashboard-sections mb-2">
                    <div className="glass-panel" style={{flex: 1}}>
                        <div className="panel-header">
                            <h3>Add New Farm</h3>
                            <Plus size={20} color="#6b7280" />
                        </div>
                        <form className="mini-form" onSubmit={handleAddFarm}>
                            <div className="form-group">
                                <label>Farm Name</label>
                                <input name="farm_name" placeholder="Name of your farm" required />
                            </div>
                            <div className="form-row">
                                <div style={{flex: 1}}>
                                    <label>Wilaya</label>
                                    <select name="wilaya" required>
                                        <option value="">Select Wilaya</option>
                                        {ALGERIA_WILAYAS.map(w => (
                                            <option key={w.id} value={w.name}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Location (Optional)</label>
                                    <input name="location" placeholder="Specific area" />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading || farms.length >= 5}>
                                {loading ? "Adding..." : farms.length >= 5 ? "Limit Reached" : "Create Farm Profile"}
                            </button>
                            {farms.length >= 5 && <p style={{color:'#ef4444', fontSize:'0.75rem', marginTop:'8px'}}>You have reached the maximum of 5 farms.</p>}
                        </form>
                    </div>

                    <div className="glass-panel" style={{flex: 1.5}}>
                        <div className="panel-header">
                            <h3>Active Farms</h3>
                            <Truck size={20} color="#059669" />
                        </div>
                        <div className="mini-list">
                            {farms.map(f => (
                                <div key={f.id} className="mini-item" style={{alignItems: 'center', padding: '15px'}}>
                                    <div className="item-main">
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#059669'}}></div>
                                            <strong style={{fontSize:'1.1rem'}}>{f.name}</strong>
                                        </div>
                                        <div style={{marginLeft: '20px', fontSize: '0.85rem', color: '#6b7280'}}>
                                            Wilaya: {f.wilaya} {f.location && `• ${f.location}`}
                                        </div>
                                    </div>
                                    <button 
                                        className="btn-danger-sm btn-outline" 
                                        onClick={() => handleDeleteFarm(f.id)}
                                        style={{opacity: farms.length > 1 ? 1 : 0.5}}
                                        disabled={farms.length <= 1}
                                        title={farms.length <= 1 ? "Minimum 1 farm required" : "Delete farm"}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            {farms.length === 0 && <p className="empty-text">No farms registered yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default FarmerDashboard;