import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Package, ShoppingBag, Clock, CheckCircle, DollarSign, Plus, Truck, AlertCircle, FileText, Bell, ChevronLeft, ChevronRight, Wrench, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
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
    const [equipment, setEquipment] = useState([]);
    const [equipmentBookings, setEquipmentBookings] = useState([]);
    const [bookingFormId, setBookingFormId] = useState(null);
    const [bookingData, setBookingData] = useState({ requested_quantity: 1, rental_days: 1 });

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

    useEffect(() => {
        if (activeTab === "equipment") {
            fetchEquipment();
            fetchEquipmentBookings();
        }
    }, [activeTab]);

    const fetchEquipment = async () => {
        try {
            const res = await api.get("market/equipment/");
            setEquipment(res.data);
        } catch (err) {
            console.error("Error fetching equipment:", err);
        }
    };

    const handleBookEquipment = async (e) => {
        try {
            await api.post("market/equipment-bookings/", {
                equipment: e.id,
                requested_quantity: bookingData.requested_quantity,
                rental_days: bookingData.rental_days
            });
            alert(`Booking request sent successfully to ${e.provider_name} for ${e.name}. You will be notified when they accept or reject it.`);
            setBookingFormId(null);
            fetchEquipmentBookings();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Failed to send booking request. Are you sure you're a farmer?");
        }
    };

    const fetchEquipmentBookings = async () => {
        try {
            const res = await api.get("market/equipment-bookings/");
            setEquipmentBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
            <div className="animate-in pb-20 md:pb-0 font-body-md antialiased text-on-background w-full">
                <div className="mb-xl">
                    <h1 className="font-h1 text-h1 text-on-background mb-2">Farmer Dashboard</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back. Here is the latest overview of your farm's operations.</p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
                    {/* Climate Widget */}
                    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] p-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-10">
                            <span className="material-symbols-outlined text-[150px]">partly_cloudy_day</span>
                        </div>
                        <div className="flex items-center justify-between mb-md z-10">
                            <h2 className="font-h3 text-h3 text-on-surface">Climate Widget</h2>
                            <select
                                className="bg-surface border border-outline-variant rounded-lg px-2 py-1 text-sm font-medium text-on-surface focus:outline-none focus:border-primary"
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
                        <div className="flex items-center justify-between mb-md z-10">
                            <h2 className="font-h3 text-h3 text-on-surface">Climate Widget</h2>
                            <span className="material-symbols-outlined text-primary">thermostat</span>
                        </div>
                        <div className="z-10">
                            {loadingWeather ? (
                                <div className="text-sm text-on-surface-variant">Syncing climate data...</div>
                            ) : (
                                <>
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-5xl font-bold text-primary">{weatherData?.weather?.temp || '24'}°</span>
                                        <span className="text-xl text-on-surface-variant mb-1">C</span>
                                        <span className="text-sm text-on-surface-variant ml-2 mb-2">{weatherData?.weather?.description || 'Partly Cloudy'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-surface p-2 rounded-lg">
                                            <div className="text-on-surface-variant text-xs mb-1">Humidity</div>
                                            <div className="font-semibold text-primary">{weatherData?.weather?.humidity || '65'}%</div>
                                        </div>
                                        <div className="bg-surface p-2 rounded-lg">
                                            <div className="text-on-surface-variant text-xs mb-1">Wind</div>
                                            <div className="font-semibold text-primary">12 km/h</div>
                                        </div>
                                        <div className="bg-surface p-2 rounded-lg">
                                            <div className="text-on-surface-variant text-xs mb-1">Rain Chance</div>
                                            <div className="font-semibold text-primary">20%</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Soil Advisor */}
                    <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] p-md flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Soil Advisor</h2>
                            {weatherData?.soil && (
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${weatherData.soil.is_needed ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                    <span className="material-symbols-outlined text-sm">{weatherData.soil.is_needed ? 'warning' : 'water_drop'}</span> 
                                    {weatherData.soil.irrigation_recommendation}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                            {/* Sensor 1 */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">grass</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Field Moisture</div>
                                    <div className="font-bold text-primary">Moisture: {weatherData?.soil ? (weatherData.soil.moisture * 100).toFixed(0) : '42'}%</div>
                                    <div className="text-xs text-on-surface-variant">Status: {weatherData?.soil?.is_needed ? 'Low' : 'Optimal'}</div>
                                </div>
                            </div>
                            {/* Sensor 2 */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">device_thermostat</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Surface Temp</div>
                                    <div className="font-bold text-primary">Temp: {weatherData?.soil?.surface_temp || '22'}°C</div>
                                    <div className="text-xs text-on-surface-variant">Status: Stable</div>
                                </div>
                            </div>
                            {/* Sensor 3 (Placeholder as per design) */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">eco</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Soil Health</div>
                                    <div className="font-bold text-primary">Index: 85/100</div>
                                    <div className="text-xs text-on-surface-variant">Status: Excellent</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farm Manager */}
                    <div className="col-span-1 md:col-span-6 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Farm Manager</h2>
                            <button className="bg-primary text-on-primary font-button text-button px-4 py-2 rounded-lg hover:bg-tertiary transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span> New Location
                            </button>
                        </div>
                        <div className="space-y-3">
                            {farms.length > 0 ? farms.slice(0, 3).map(farm => (
                                <div key={farm.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant hover:shadow-[0_8px_30px_rgba(26,58,52,0.08)] transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-md bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                            <span className="material-symbols-outlined">agriculture</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-on-surface">{farm.name}</div>
                                            <div className="text-xs text-on-surface-variant">{farm.wilaya} • {farm.location || "Registered"}</div>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                                </div>
                            )) : (
                                <p className="text-sm text-on-surface-variant">No farms added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sales Manager */}
                    <div className="col-span-1 md:col-span-6 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Sales Manager</h2>
                            <span className="text-sm text-primary font-semibold cursor-pointer hover:underline">View All Orders</span>
                        </div>
                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'PENDING').length > 0 ? orders.filter(o => o.status === 'PENDING').slice(0, 2).map(o => (
                                <div key={o.id} className="border-b border-surface-variant pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-on-surface">Order #{o.id} - {o.product_name}</div>
                                            <div className="text-sm text-on-surface-variant">Buyer: {o.buyer_name}</div>
                                        </div>
                                        <div className="font-bold text-primary">{o.total_price} DA</div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')} className="bg-primary text-on-primary font-button text-sm px-3 py-1.5 rounded flex-1 hover:bg-tertiary transition-colors">Accept</button>
                                        <button onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')} className="bg-surface-variant text-on-surface-variant font-button text-sm px-3 py-1.5 rounded flex-1 hover:bg-surface-dim transition-colors">Reject</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-on-surface-variant">No pending orders.</p>
                            )}
                        </div>
                    </div>

                    {/* Inventory Control */}
                    <div className="col-span-1 md:col-span-12 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Inventory Control & Marketplace</h2>
                            <button className="bg-secondary text-on-secondary font-button text-button px-4 py-2 rounded-lg hover:bg-secondary-fixed hover:text-on-secondary-container transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">publish</span> Publish Listing
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Product</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Quantity</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Market Price</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Status</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? products.slice(0, 5).map(p => (
                                        <tr key={p.id} className="border-b border-surface-variant hover:bg-surface transition-colors">
                                            <td className="py-3 px-4 font-medium text-on-surface">{p.name || "Unnamed Product"}</td>
                                            <td className="py-3 px-4 text-on-surface-variant">{p.quantity_available} kg</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-primary">{p.price_per_kg} DA/kg</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block bg-secondary-fixed text-on-secondary-container px-2 py-1 rounded text-xs font-semibold">Published</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-primary hover:underline text-sm font-medium">Delete</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="py-3 px-4 text-sm text-on-surface-variant">No products in inventory.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">My Products</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Manage your inventory, pricing, and availability.</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)] mb-lg">
                    <h3 className="font-h3 text-h3 text-on-surface mb-4">Add New Product</h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddProduct}>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-on-surface mb-1">Product Type (From Official List)</label>
                            <select name="catalog" value={formData.catalog} onChange={handleChange} required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2">
                                <option value="">-- Choose a product type --</option>
                                {catalog.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-on-surface mb-1">Origin Farm</label>
                            <select name="farm" value={formData.farm} onChange={handleChange} required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2">
                                <option value="">-- Select Farm --</option>
                                {farms.map(f => <option key={f.id} value={f.id}>{f.name} ({f.wilaya})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1">Price per Kg (DA)</label>
                            <input type="number" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} placeholder="0.00" required min={selectedCatalogItem?.min_price ?? undefined} max={selectedCatalogItem?.max_price ?? undefined} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2" />
                            {selectedCatalogItem?.min_price && selectedCatalogItem?.max_price && (
                                <small className="text-xs text-on-surface-variant block mt-1">
                                    Allowed range: {selectedCatalogItem.min_price} to {selectedCatalogItem.max_price} DA
                                </small>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1">Available Quantity</label>
                            <input type="number" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder={`Available (${selectedCatalogItem?.unit || 'kg'})`} required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2" />
                        </div>
                        <div className="col-span-1 md:col-span-2 mt-2">
                            <button type="submit" className="bg-primary text-on-primary font-button px-4 py-2 rounded-lg w-full md:w-auto hover:bg-tertiary transition-colors" disabled={loading}>{loading ? "Publishing..." : "Add Product to Market"}</button>
                        </div>
                    </form>
                </div>

                {/* Inventory Data Grid */}
                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,58,52,0.05)] overflow-hidden flex flex-col mb-4">
                    <div className="hidden md:grid grid-cols-12 gap-gutter px-lg py-sm border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider items-center">
                        <div className="col-span-4">Product Details</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-3">Market Price</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>
                    <div className="flex flex-col p-4 md:p-0 gap-4 md:gap-0 bg-surface-container-low md:bg-transparent">
                        {products.map(p => (
                            <div key={p.id} className="bg-surface-container-lowest rounded-xl md:rounded-none p-4 md:px-lg md:py-md md:border-b border-outline-variant/20 shadow-[0px_4px_20px_rgba(26,58,52,0.05)] md:shadow-none hover:bg-surface-bright transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter items-center">
                                <div className="md:col-span-4 flex items-center gap-md">
                                    <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                                        {p.catalog_image ? <img src={p.catalog_image} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-outline">inventory_2</span>}
                                    </div>
                                    <div>
                                        <h3 className="font-h3 text-h3 text-primary">{p.name || "Unnamed Product"}</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">📍 {p.farm_name || "Unknown Farm"}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex md:block justify-between items-center">
                                    <span className="md:hidden font-label-caps text-label-caps text-outline">Quantity</span>
                                    <span className="font-body-md text-body-md text-on-surface">{p.quantity_available} kg</span>
                                </div>
                                <div className="md:col-span-3 flex md:block justify-between items-center">
                                    <span className="md:hidden font-label-caps text-label-caps text-outline">Price</span>
                                    <span className="font-body-md text-body-md text-on-surface font-medium">{p.price_per_kg} DA / kg</span>
                                </div>
                                <div className="md:col-span-2 flex md:block justify-between items-center">
                                    <span className="md:hidden font-label-caps text-label-caps text-outline">Status</span>
                                    <span className="inline-flex bg-primary-container text-on-primary-container rounded-full px-3 py-1 font-label-caps text-[10px] items-center gap-1 uppercase tracking-wider">
                                        Published
                                    </span>
                                </div>
                                <div className="md:col-span-1 flex justify-end gap-sm md:gap-xs border-t md:border-none pt-4 md:pt-0 mt-2 md:mt-0 border-outline-variant/20">
                                    <button onClick={() => handleDeleteProduct(p.id)} className="text-outline hover:text-error transition-colors p-1" title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <p className="p-4 text-center text-on-surface-variant text-sm">No products added yet.</p>}
                    </div>
                </div>
                <Pagination currentPage={productsPage} totalCount={productsCount} pageSize={10} onPageChange={setProductsPage} />
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Orders & Sales</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Track incoming buyer requests</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,58,52,0.05)] overflow-hidden flex flex-col mb-4">
                    <div className="hidden md:grid grid-cols-12 gap-gutter px-lg py-sm border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider items-center">
                        <div className="col-span-2">Order ID</div>
                        <div className="col-span-3">Product</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Total Price</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>
                    <div className="flex flex-col p-4 md:p-0 gap-4 md:gap-0 bg-surface-container-low md:bg-transparent">
                        {orders.map(o => (
                            <div key={o.id} className="bg-surface-container-lowest rounded-xl md:rounded-none p-4 md:px-lg md:py-md md:border-b border-outline-variant/20 shadow-[0px_4px_20px_rgba(26,58,52,0.05)] md:shadow-none hover:bg-surface-bright transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter items-center">
                                <div className="md:col-span-2 font-medium text-on-surface">#{o.id}</div>
                                <div className="md:col-span-3">
                                    <div className="font-bold text-on-surface">{o.product_name}</div>
                                    <div className="text-xs text-on-surface-variant">{o.buyer_name}</div>
                                </div>
                                <div className="md:col-span-2 text-on-surface">{o.quantity}kg</div>
                                <div className="md:col-span-2 font-medium text-primary">{o.total_price} DA</div>
                                <div className="md:col-span-2">
                                    <span className={`inline-flex rounded-full px-3 py-1 font-label-caps text-[10px] items-center gap-1 uppercase tracking-wider ${o.status === 'PENDING' ? 'bg-surface-variant text-on-surface-variant' : o.status === 'ACCEPTED' || o.status === 'DELIVERED' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                                        {o.status}
                                    </span>
                                </div>
                                <div className="md:col-span-1 flex justify-end gap-sm">
                                    {o.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')} className="text-primary hover:text-on-primary-fixed-variant p-1" title="Accept"><span className="material-symbols-outlined">check_circle</span></button>
                                            <button onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')} className="text-error hover:text-on-error-container p-1" title="Reject"><span className="material-symbols-outlined">cancel</span></button>
                                        </>
                                    )}
                                    {o.status === 'ACCEPTED' && <span className="text-xs text-on-surface-variant">Wait for Transporter</span>}
                                    {o.status === 'DELIVERED' && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="p-4 text-center text-on-surface-variant text-sm">No orders yet.</p>}
                    </div>
                </div>
                <Pagination currentPage={ordersPage} totalCount={ordersCount} pageSize={10} onPageChange={setOrdersPage} />
            </div>
        );
    }

    if (activeTab === "tracking") {
        const activeTracking = orders.filter(o => ['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status));
        const paginatedTracking = activeTracking.slice((trackingPage - 1) * 10, trackingPage * 10);
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Delivery Tracking</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Monitor your products en route to buyers</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {paginatedTracking.map(o => (
                        <div key={o.id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/30">
                                <h3 className="font-bold text-primary">Order #{o.id}</h3>
                                <span className={`inline-flex rounded-full px-3 py-1 font-label-caps text-[10px] uppercase tracking-wider ${o.status === 'DELIVERED' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>{o.status}</span>
                            </div>
                            <div className="space-y-3 mb-6 text-sm text-on-surface">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">local_shipping</span>
                                    <span>Transporter: <strong>{o.transporter_name || "Assigning..."}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">schedule</span>
                                    <span>Status: <strong>{o.delivery_status || "Pending Pickup"}</strong></span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="flex justify-between items-center relative w-full pt-2">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container -z-10 -translate-y-1/2"></div>
                                <div className={`absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all ${o.status === 'DELIVERED' ? 'w-full' : o.status === 'IN_TRANSIT' ? 'w-1/2' : 'w-0'}`}></div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest"></div>
                                    <span className="text-[10px] mt-1 font-semibold text-primary">Accepted</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-4 h-4 rounded-full border-4 border-surface-container-lowest ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                    <span className={`text-[10px] mt-1 font-semibold ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'text-primary' : 'text-outline'}`}>In Transit</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-4 h-4 rounded-full border-4 border-surface-container-lowest ${o.status === 'DELIVERED' ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                    <span className={`text-[10px] mt-1 font-semibold ${o.status === 'DELIVERED' ? 'text-primary' : 'text-outline'}`}>Delivered</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && <div className="col-span-full p-4 text-center text-on-surface-variant">No active deliveries to track.</div>}
                </div>
                {activeTracking.length > 0 && <Pagination currentPage={trackingPage} totalCount={activeTracking.length} pageSize={10} onPageChange={setTrackingPage} />}
            </div>
        );
    }

    if (activeTab === "prices") {
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs flex items-center gap-2"><span className="material-symbols-outlined">receipt_long</span> Official Market Prices</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Price ranges set by the Ministry of Agriculture</p>
                    </div>
                </div>

                {catalog.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)] text-center text-on-surface-variant flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-outline">info</span>
                        <p>No official price ranges have been published yet by the Ministry.</p>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,58,52,0.05)] overflow-hidden flex flex-col mb-4">
                        <div className="hidden md:grid grid-cols-12 gap-gutter px-lg py-sm border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider items-center">
                            <div className="col-span-3">Product</div>
                            <div className="col-span-4">Description</div>
                            <div className="col-span-2">Min Price</div>
                            <div className="col-span-2">Max Price</div>
                            <div className="col-span-1">Unit</div>
                        </div>
                        <div className="flex flex-col p-4 md:p-0 gap-4 md:gap-0 bg-surface-container-low md:bg-transparent">
                            {catalog.map(c => (
                                <div key={c.id} className="bg-surface-container-lowest rounded-xl md:rounded-none p-4 md:px-lg md:py-md md:border-b border-outline-variant/20 shadow-[0px_4px_20px_rgba(26,58,52,0.05)] md:shadow-none hover:bg-surface-bright transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter items-center">
                                    <div className="md:col-span-3 font-bold text-on-surface">{c.name}</div>
                                    <div className="md:col-span-4 text-on-surface-variant text-sm">{c.description || "—"}</div>
                                    <div className="md:col-span-2 font-medium text-secondary">{c.min_price ? `${c.min_price} DA` : "—"}</div>
                                    <div className="md:col-span-2 font-medium text-error">{c.max_price ? `${c.max_price} DA` : "—"}</div>
                                    <div className="md:col-span-1 text-outline text-sm">{c.unit || 'kg'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Pagination currentPage={catalogPage} totalCount={catalogCount} pageSize={10} onPageChange={setCatalogPage} />
            </div>
        );
    }

    if (activeTab === "notifications") {
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Notifications</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Alerts and updates from the Ministry</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className={`bg-surface-container-lowest rounded-xl p-4 shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border-l-4 flex gap-4 items-start ${n.is_read ? 'border-outline-variant' : 'border-primary bg-primary-fixed/10'}`}>
                            <div className={`p-2 rounded-full ${n.is_read ? 'bg-surface text-outline' : 'bg-primary-container text-on-primary-container'}`}>
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            <div className="flex-1">
                                <p className={`text-on-surface ${n.is_read ? '' : 'font-semibold'}`}>{n.message}</p>
                                <span className="text-xs text-on-surface-variant mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <div className="text-center p-8 text-on-surface-variant">No notifications yet.</div>}
                </div>
            </div>
        );
    }

    if (activeTab === "farms") {
        return (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Manage My Farms</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">View and add your agriculture locations (Max 5)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
                    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)]">
                        <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline">add_circle</span> Add New Farm
                        </h3>
                        <form className="flex flex-col gap-4" onSubmit={handleAddFarm}>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Farm Name</label>
                                <input name="farm_name" placeholder="Name of your farm" required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Wilaya</label>
                                <select name="wilaya" required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2">
                                    <option value="">Select Wilaya</option>
                                    {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Location (Optional)</label>
                                <input name="location" placeholder="Specific area" className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2" />
                            </div>
                            <button type="submit" className="bg-primary text-on-primary font-button px-4 py-2 rounded-lg w-full hover:bg-tertiary transition-colors disabled:opacity-50 mt-2" disabled={loading || farms.length >= 5}>
                                {loading ? "Adding..." : farms.length >= 5 ? "Limit Reached" : "Create Farm Profile"}
                            </button>
                            {farms.length >= 5 && <p className="text-error text-xs mt-1">You have reached the maximum of 5 farms.</p>}
                        </form>
                    </div>

                    <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)]">
                        <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline">agriculture</span> Active Farms
                        </h3>
                        <div className="space-y-3">
                            {farms.map(f => (
                                <div key={f.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/30 hover:shadow-[0_8px_30px_rgba(26,58,52,0.08)] transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-md bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                            <span className="material-symbols-outlined">landscape</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-on-surface">{f.name}</div>
                                            <div className="text-xs text-on-surface-variant">Wilaya: {f.wilaya} {f.location && `• ${f.location}`}</div>
                                        </div>
                                    </div>
                                    <button 
                                        className="text-outline hover:text-error transition-colors p-2 disabled:opacity-50" 
                                        onClick={() => handleDeleteFarm(f.id)}
                                        disabled={farms.length <= 1}
                                        title={farms.length <= 1 ? "Minimum 1 farm required" : "Delete farm"}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                            {farms.length === 0 && <p className="p-4 text-center text-on-surface-variant text-sm">No farms registered yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "equipment") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2><Wrench size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Agricultural Equipment Rental</h2>
                    <p>Browse and book machinery for your farm operations</p>
                </div>

                {equipmentBookings.length > 0 && (
                    <div className="history-table-container mt-2 mb-3">
                        <h3 className="mb-1">My Rental Requests</h3>
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Machine</th>
                                    <th>Provider</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipmentBookings.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.equipment_name}</strong></td>
                                        <td>{b.provider_name}</td>
                                        <td>{new Date(b.created_at).toLocaleDateString()}</td>
                                        <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="inventory-list mt-2">
                    <h3 className="mb-1">Available Fleet</h3>
                    <div className="grid-list">
                        {equipment.map(e => (
                            <div key={e.id} className={`card-item animate-in ${!e.is_available ? 'unavailable-card' : ''}`}>
                                <div className="card-image-box" style={{height: '160px', overflow: 'hidden', background: '#f1f5f9', position: 'relative'}}>
                                    {e.images && e.images.length > 0 ? (
                                        <img src={e.images[0].image} alt={e.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                    ) : (
                                        <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
                                             <ImageIcon size={40} color="#cbd5e1" />
                                        </div>
                                    )}
                                    <div style={{position:'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#166534', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                        {e.price_per_day} DA/day
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3>{e.name}</h3>
                                            <p className="p-type" style={{ fontWeight: 600, color: '#2f8f3a', fontSize: '0.85rem', display:'flex', alignItems:'center', gap:'4px' }}>
                                                {e.equipment_type} 
                                                {e.year_of_manufacture && <span>({e.year_of_manufacture})</span>}
                                            </p>
                                        </div>
                                        {e.quantity_available === 0 && e.earliest_return_date ? (
                                            <span className="status-badge pending" style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #fde047' }}>
                                                Unavailable until {e.earliest_return_date}
                                            </span>
                                        ) : (
                                            <span className={`status-badge ${e.is_available && e.quantity_available > 0 ? 'approved' : 'pending'}`}>
                                                {e.is_available && e.quantity_available > 0 ? 'Available' : 'Unavailable'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="product-meta mt-1" style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                        <div className="meta-item">
                                            <MapPin size={14} /> <span>{e.location || "Location not specified"}</span>
                                        </div>
                                        <div className="meta-item">
                                            <strong>Condition:</strong> <span>{e.condition}</span>
                                        </div>
                                        <div className="meta-item">
                                            <strong>Provider:</strong> <span>{e.provider_name}</span>
                                        </div>
                                    </div>

                                    <div className="tech-specs-summary mt-1" style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                                        {e.horsepower && <span className="spec-tag">{e.horsepower}</span>}
                                        {e.fuel_type && <span className="spec-tag">{e.fuel_type}</span>}
                                        {e.transmission && <span className="spec-tag">{e.transmission}</span>}
                                        {e.weight && <span className="spec-tag">{e.weight}</span>}
                                    </div>

                                    {!e.is_available && e.expected_available_date && (
                                        <div className="notice-box mt-1" style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', padding: '8px', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Calendar size={16} />
                                            <span style={{ fontSize: '0.85rem' }}>Expected back on: <strong>{e.expected_available_date}</strong></span>
                                        </div>
                                    )}
                                </div>
                                {bookingFormId === e.id ? (
                                    <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Quantity ({e.quantity_available} available):</label>
                                            <input type="number" min="1" max={e.quantity_available} value={bookingData.requested_quantity} onChange={(ev) => setBookingData(p => ({ ...p, requested_quantity: parseInt(ev.target.value) || 1 }))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Rental Duration (Days):</label>
                                            <input type="number" min="1" value={bookingData.rental_days} onChange={(ev) => setBookingData(p => ({ ...p, rental_days: parseInt(ev.target.value) || 1 }))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                                            Total: <strong style={{color:'#166534'}}>{(e.price_per_day * bookingData.requested_quantity * bookingData.rental_days).toFixed(2)} DA</strong>
                                        </div>
                                        <div className="flex-gap-sm mt-1">
                                            <button className="btn-success-sm full-width" onClick={() => handleBookEquipment(e)}>Confirm</button>
                                            <button className="btn-danger-outline" style={{padding:'0.5rem 1rem'}} onClick={() => setBookingFormId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className={`btn-primary full-width mt-1 ${(e.quantity_available === 0 || !e.is_available) ? 'disabled' : ''}`}
                                        disabled={e.quantity_available === 0 || !e.is_available}
                                        onClick={() => { setBookingFormId(e.id); setBookingData({ requested_quantity: 1, rental_days: 1 }); }}
                                        style={e.quantity_available === 0 ? {background: '#9ca3af', border: 'none'} : {}}
                                    >
                                        {e.quantity_available === 0 ? 'Out of Stock' : (!e.is_available ? 'Currently Unavailable' : 'Inquire Now (Book)')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {equipment.filter(e => e.is_available).length === 0 && equipment.length > 0 && (
                        <p className="notice-box mt-2">
                            <AlertCircle size={20} />
                            All equipment is currently rented out. Please check back later or contact providers for reservations.
                        </p>
                    )}
                    {equipment.length === 0 && <p className="empty-state">No equipment available in your area yet.</p>}
                </div>
            </div>
        );
    }

    return null;
};

export default FarmerDashboard;