import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { Package, ShoppingBag, Clock, CheckCircle, DollarSign, Plus, Truck, AlertCircle, FileText, Bell, ChevronLeft, ChevronRight, Wrench, Calendar, MapPin, Users, Image as ImageIcon, Activity } from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/equipment_provider.css";
import Pagination from "../common/Pagination";
import AskAgriButton from '../chat/AskAgriButton';
import OrderDetailsModal from "../common/OrderDetailsModal";
import FarmerStatistics from "./FarmerStatistics";
import AuthContext from "../../context/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";

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

const FarmerDashboard = ({ activeTab, setActiveTab }) => {
    const { user } = useContext(AuthContext);

    // Initialize Real-time WebSockets
    useWebSocket(user, (event, data) => {
        if (event === "new_order") {
            fetchOrders(ordersPage);
            fetchStats();
            alert(`🎉 Real-Time Order: ${data.message}`);
        } else if (event === "booking_status_update") {
            fetchEquipmentBookings();
            alert(`🚜 Booking Update: ${data.message}`);
        } else if (event === "fire_alert") {
            fetchActiveFireAlerts();
            alert(`🚨 EMERGENCY: ${data.message}`);
        }
    });

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
        quality_grade: "Premium",
        farm: "",
        description: ""
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [equipment, setEquipment] = useState([]);
    const [equipmentBookings, setEquipmentBookings] = useState([]);
    const [bookingFormId, setBookingFormId] = useState(null);
    const [bookingData, setBookingData] = useState({ requested_quantity: 1, rental_days: 1 });
    const [editingFarm, setEditingFarm] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [farmImage, setFarmImage] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);
    const [productImage, setProductImage] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // IoT Fire Alert States
    const [fireAlerts, setFireAlerts] = useState([]);
    const [isFireAlertOpen, setIsFireAlertOpen] = useState(false);

    // Order Details Modal state
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Weather Feature States
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
const [selectedFarm, setSelectedFarm] = useState(null);
    useEffect(() => {
        fetchProducts(productsPage);
        fetchOrders(ordersPage);
        fetchStats();
        fetchNotifications();
        fetchCatalog(catalogPage);
        fetchFarms();
    }, [activeTab, productsPage, ordersPage, catalogPage]);

    useEffect(() => {
        if (isUserModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isUserModalOpen]);

   useEffect(() => {
    if (selectedFarm) {
        fetchWeatherData();
    }
}, [selectedFarm]);

    useEffect(() => {
        if (activeTab === "equipment") {
            fetchEquipment();
            fetchEquipmentBookings();
        }
        if (activeTab === "notifications") {
            api.post("market/notifications/mark_all_as_read/").catch(console.error);
        }
    }, [activeTab]);
   useEffect(() => {
    if (farms.length > 0 && !selectedFarm) {
        setSelectedFarm(farms[0]);
    }
}, [farms, selectedFarm]);
    useEffect(() => {
        // Initial fetch
        fetchActiveFireAlerts();
        
        // Polling for fire alerts
        const interval = setInterval(() => {
            fetchActiveFireAlerts();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchActiveFireAlerts = async () => {
        try {
            const res = await api.get("iot/active-alerts/");
            if (res.data && res.data.has_fire) {
                setFireAlerts(res.data.alerts);
                setIsFireAlertOpen(true);
            } else {
                setIsFireAlertOpen(false);
            }
        } catch (err) {
            // Silently handle network errors to avoid console spam when server is down
            if (err.code === 'ERR_NETWORK' || !err.response) {
                console.log("Server is offline. Retrying fire check later...");
            } else {
                console.error("Error fetching fire alerts:", err);
            }
        }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            await api.post(`iot/resolve-alert/${alertId}/`);
            fetchActiveFireAlerts();
        } catch (err) {
            console.error("Error resolving alert:", err);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await api.get("market/equipment/");
            const data = res.data.results || res.data;
            setEquipment(Array.isArray(data) ? data : []);
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
            const data = res.data.results || res.data;
            setEquipmentBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWeatherData = async () => {
    if (!selectedFarm) return;

    setLoadingWeather(true);

    try {
        const wilayaData = ALGERIA_WILAYAS.find(
            w => w.name.toLowerCase() === selectedFarm.wilaya.toLowerCase()
        );

        if (!wilayaData) {
            console.error("Wilaya not found:", selectedFarm.wilaya);
            return;
        }

        const res = await api.get(`weather/?lat=${wilayaData.lat}&lon=${wilayaData.lon}`);
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

    const fetchPriceHistory = async (catalogId) => {
        try {
            const res = await api.get(`market/price-history/?catalog_id=${catalogId}`);
            setPriceHistory(res.data);
            setShowHistoryModal(true);
        } catch (err) {
            console.error("Error fetching price history:", err);
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
            const trackingParam = activeTab === "tracking" ? "&tracking=true" : "";
            const res = await api.get(`market/orders/?page=${page}${trackingParam}`);
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

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setFormData({
            catalog: product.catalog,
            price_per_kg: product.price_per_kg,
            quantity_available: product.quantity_available,
            farm: product.farm,
            quality_grade: product.quality_grade || "HIGH",
        });
        setShowAddForm(true);
        if (activeTab !== "products") {
            setActiveTab("products");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.catalog || !formData.price_per_kg || !formData.quantity_available || !formData.farm) {
            alert("Please select a product type, farm, and fill all fields.");
            setLoading(false);
            return;
        }

        const data = new FormData();
        if (formData.catalog) data.append("catalog", formData.catalog);
        if (formData.price_per_kg) data.append("price_per_kg", formData.price_per_kg);
        if (formData.quantity_available) data.append("quantity_available", formData.quantity_available);
        if (formData.farm) data.append("farm", formData.farm);
        if (formData.quality_grade) data.append("quality_grade", formData.quality_grade);
        
        if (productImage) {
            data.append("image", productImage);
        }

        // Debug: Log FormData content
        for (let pair of data.entries()) {
            console.log(pair[0]+ ': ' + pair[1]); 
        }

        try {
            const config = {
                headers: { "Content-Type": undefined }
            };

            if (editingProduct) {
                await api.patch(`market/products/${editingProduct.id}/`, data, config);
                alert("Product updated successfully!");
            } else {
                await api.post("market/products/", data, config);
                alert("Product added to your inventory!");
            }
            setEditingProduct(null);
            setProductImage(null);
            setFormData({
                catalog: "",
                price_per_kg: "",
                quantity_available: "",
                farm: farms.length > 0 ? farms[0].id : "",
                quality_grade: "HIGH",
            });
            setShowAddForm(false);
            fetchProducts();
            fetchStats();
        } catch (err) {
            console.error("Error saving product:", err);
            const errorMsg = err.response?.data 
                ? (typeof err.response.data === 'object' 
                    ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join('\n') 
                    : err.response.data)
                : "Error saving product. Please ensure all fields are correct.";
            alert(errorMsg);
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
        const formData = new FormData();
        formData.append("name", name);
        formData.append("wilaya", wilaya);
        formData.append("location", location);
        if (farmImage) {
            formData.append("image", farmImage);
        }

        try {
            await api.post("farms/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Farm added successfully!");
            e.target.reset();
            setFarmImage(null);
            fetchFarms();
        } catch (err) {
            alert(err.response?.data?.detail || "Error adding farm.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFarm = async (e) => {
        e.preventDefault();
        const name = e.target.farm_name.value;
        const location = e.target.location.value;

        if (!name) return alert("Farm name is required.");

        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("location", location);
        if (farmImage) {
            formData.append("image", farmImage);
        }

        try {
            await api.patch(`farms/${editingFarm.id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Farm updated successfully!");
            setEditingFarm(null);
            setFarmImage(null);
            fetchFarms();
        } catch (err) {
            alert(err.response?.data?.detail || "Error updating farm.");
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

    const handleDeleteNotification = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        try {
            await api.delete(`market/notifications/${id}/`);
            fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
            alert("Failed to delete notification.");
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

    let content = null;

    if (activeTab === "dashboard") {
        const statCards = [
            { label: "Products", value: stats.total_products, icon: <Package />, color: "blue" },
            { label: "Active Orders", value: stats.pending_orders, icon: <ShoppingBag />, color: "yellow" },
            { label: "Completed", value: stats.completed_orders, icon: <CheckCircle />, color: "green" },
            { label: "Revenue", value: `${stats.total_revenue} DA`, icon: <DollarSign />, color: "purple" }
        ];

        content = (
            <div className="animate-in pb-20 md:pb-0 font-body-md antialiased text-on-background w-full">
                <div className="mb-xl">
                    <h1 className="font-h1 text-h1 text-on-background mb-2">Farmer Dashboard</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back. Here is the latest overview of your farm's operations.</p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
                    {/* Climate Widget */}
                    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm p-md flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-10">
                            <span className="material-symbols-outlined text-[150px]">partly_cloudy_day</span>
                        </div>
                        <div className="flex items-center justify-between mb-md z-10">
                            <h2 className="font-h3 text-h3 text-on-surface">Climate Widget</h2>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">thermostat</span>
                               <select
    className="bg-surface border border-outline-variant rounded-lg px-2 py-1 text-sm font-medium text-on-surface focus:outline-none focus:border-primary"
    value={selectedFarm?.id || ""}
    onChange={(e) => {
        const farm = farms.find(f => String(f.id) === String(e.target.value));
        setSelectedFarm(farm);
    }}
>
    {farms.length > 0 ? (
        farms.map(farm => (
            <option key={farm.id} value={farm.id}>
                {farm.name} - {farm.wilaya}
            </option>
        ))
    ) : (
        <option value="">No farms</option>
    )}
</select>
                            </div>
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
                    <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm p-md flex flex-col gap-md">
                        <div className="flex items-center justify-between">
                            <h2 className="font-h3 text-h3 text-on-surface">Soil Advisor</h2>
                            {weatherData?.irrigation && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${weatherData.irrigation.is_needed ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                                    <span className="material-symbols-outlined text-sm">{weatherData.irrigation.is_needed ? 'warning' : 'check_circle'}</span>
                                    {weatherData.irrigation.is_needed ? 'Irrigation Needed' : 'No Irrigation Needed'}
                                </span>
                            )}
                        </div>

                        {/* Prominent Recommendation Banner */}
                        {weatherData?.irrigation && (
                            <div className={`w-full rounded-xl px-4 py-3 flex items-start gap-3 border-l-4 ${
                                weatherData.irrigation.is_needed
                                    ? 'bg-red-50 border-red-500 text-red-800'
                                    : 'bg-green-50 border-green-500 text-green-800'
                            }`}>
                                <span className={`material-symbols-outlined text-2xl mt-0.5 ${weatherData.irrigation.is_needed ? 'text-red-500' : 'text-green-500'}`}>
                                    {weatherData.irrigation.is_needed ? 'water_damage' : 'water_drop'}
                                </span>
                                <div>
                                    <p className="font-bold text-sm mb-0.5">
                                        {weatherData.irrigation.is_needed ? '🚨 Action Required' : '✅ All Good'}
                                    </p>
                                    <p className="text-sm leading-snug">{weatherData.irrigation.recommendation}</p>
                                    {typeof weatherData.irrigation.urgency_score === 'number' && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium opacity-70">Stress Level:</span>
                                                <div className="flex-1 bg-white/60 rounded-full h-2 overflow-hidden border border-current/20">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${weatherData.irrigation.is_needed ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min((weatherData.irrigation.urgency_score / 9) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold">{weatherData.irrigation.urgency_score}/9</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                            {/* Sensor 1 — Humidity from real API */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">humidity_mid</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Air Humidity</div>
                                    <div className="font-bold text-primary">{weatherData?.weather?.humidity ?? '--'}%</div>
                                    <div className="text-xs text-on-surface-variant">
                                        Status: {(weatherData?.weather?.humidity ?? 50) < 35 ? 'Very Dry' : (weatherData?.weather?.humidity ?? 50) < 55 ? 'Moderate' : 'Humid'}
                                    </div>
                                </div>
                            </div>
                            {/* Sensor 2 — Surface Temp from real API */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">device_thermostat</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Surface Temp</div>
                                    <div className="font-bold text-primary">{weatherData?.irrigation?.surface_temp ?? weatherData?.weather?.temp ?? '--'}°C</div>
                                    <div className="text-xs text-on-surface-variant">
                                        Status: {(weatherData?.weather?.temp ?? 22) >= 34 ? 'Hot' : (weatherData?.weather?.temp ?? 22) >= 28 ? 'Warm' : 'Stable'}
                                    </div>
                                </div>
                            </div>
                            {/* Sensor 3 — Wind from real API */}
                            <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">air</span>
                                </div>
                                <div>
                                    <div className="font-label-caps text-label-caps text-outline uppercase">Wind Speed</div>
                                    <div className="font-bold text-primary">{weatherData?.wind?.speed_kmh ?? '--'} km/h</div>
                                    <div className="text-xs text-on-surface-variant">
                                        Status: {(weatherData?.wind?.speed_kmh ?? 0) >= 30 ? 'Strong' : (weatherData?.wind?.speed_kmh ?? 0) >= 15 ? 'Moderate' : 'Calm'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Farm Manager */}
                    <div className="col-span-1 md:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Farm Manager</h2>
                            <span
                                onClick={() => setActiveTab("farms")}
                                className="text-primary font-semibold cursor-pointer hover:underline flex items-center gap-1"
                            >
                                View All

                            </span>
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

                                </div>
                            )) : (
                                <p className="text-sm text-on-surface-variant">No farms added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sales Manager */}
                    <div className="col-span-1 md:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Sales Manager</h2>
                            <span onClick={() => setActiveTab("orders")} className="text-sm text-primary font-semibold cursor-pointer hover:underline">View All</span>
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
                    <div className="col-span-1 md:col-span-12 bg-surface-container-lowest rounded-xl shadow-sm p-md">
                        <div className="flex items-center justify-between mb-md">
                            <h2 className="font-h3 text-h3 text-on-surface">Inventory Control & Marketplace</h2>
                            <span onClick={() => setActiveTab("products")} className="text-sm text-primary font-semibold cursor-pointer hover:underline">View All</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant">
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Product Details</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Quantity </th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Market Price</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Quality</th>
                                        <th className="py-3 px-4 font-label-caps text-label-caps text-outline uppercase">Status</th>
                                       <th className="py-3 pl-2 pr-4 font-label-caps text-label-caps text-outline uppercase text-left"> Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? products.slice(0, 5).map(p => (
                                        <tr key={p.id} className="border-b border-surface-variant hover:bg-surface transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-md">
                                                    <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                                                        {p.product_image ? (
                                                            <img src={p.product_image} className="w-full h-full object-cover" />
                                                        ) : p.catalog_image ? (
                                                            <img src={p.catalog_image} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-outline">inventory_2</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-h3 text-h3 text-primary">{p.name || "Unnamed Product"}</h3>
                                                       <p className="font-body-sm text-body-sm text-on-surface-variant">📍 {p.farm_name || "Unknown Farm"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-on-surface-variant">{p.quantity_available} kg</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-primary">{p.price_per_kg} DA/kg</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    p.quality_grade === 'HIGH' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    p.quality_grade === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                    'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                    {p.quality_grade || 'HIGH'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {p.quantity_available > 0 ? (
                                                    <span className="inline-block bg-secondary-fixed text-on-secondary-container px-2 py-1 rounded text-xs font-semibold">Available</span>
                                                ) : (
                                                    <span className="inline-block bg-error-container text-on-error-container px-2 py-1 rounded text-xs font-semibold">Out of Stock</span>
                                                )}
                                            </td>
                                           <td className="py-3 pl-2 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditProduct(p)} className="action-icon-btn btn-edit" title="Edit Product">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="action-icon-btn btn-delete" title="Remove Product">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
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
    } else if (activeTab === "products") {
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">My Products</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Manage your inventory, pricing, and availability.</p>
                    </div>
                    {/* Premium Toggle Button for Add Product Form */}
                    <button
                        onClick={() => {
                            if (showAddForm) {
                                setEditingProduct(null);
                                setFormData({
                                    catalog: "",
                                    price_per_kg: "",
                                    quantity_available: "",
                                    farm: farms.length > 0 ? farms[0].id : "",
                                    quality_grade: "HIGH",
                                });
                            }
                            setShowAddForm(!showAddForm);
                        }}
                        className={`px-5 py-2.5 rounded-lg font-button text-sm transition-all duration-200 flex items-center gap-2 shadow-sm ${
                            showAddForm 
                                ? "bg-surface-variant text-on-surface-variant hover:bg-surface-dim" 
                                : "bg-primary text-on-primary hover:bg-tertiary"
                        }`}
                    >
                        {showAddForm ? (
                            <>
                                <span className="material-symbols-outlined text-[18px]">close</span>
                                Close Form
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Add Product
                            </>
                        )}
                    </button>
                </div>

                {/* Collapsible Form Section */}
                {showAddForm && (
                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm mb-lg animate-in fade-in-slide">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-h3 text-h3 text-on-surface">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                            {editingProduct ? (
                                <button onClick={() => {
                                    setEditingProduct(null);
                                    setFormData({
                                        catalog: "",
                                        price_per_kg: "",
                                        quantity_available: "",
                                        farm: farms.length > 0 ? farms[0].id : "",
                                        quality_grade: "HIGH",
                                    });
                                    setShowAddForm(false);
                                }} className="text-sm text-primary hover:underline">Cancel Edit</button>
                            ) : (
                                <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-outline hover:underline">Close Form</button>
                            )}
                        </div>
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
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Quality Grade</label>
                                <select name="quality_grade" value={formData.quality_grade} onChange={handleChange} required className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2">
                                    <option value="HIGH">High (Premium)</option>
                                    <option value="MEDIUM">Medium (Standard)</option>
                                    <option value="LOW">Low (Basic)</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-on-surface mb-1">Product Photo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setProductImage(e.target.files[0])} 
                                        className="hidden" 
                                        id="product-image-upload" 
                                    />
                                    <label 
                                        htmlFor="product-image-upload" 
                                        className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
                                    >
                                        <ImageIcon size={18} />
                                        {productImage ? productImage.name : (editingProduct?.product_image ? "Change Photo" : "Choose Photo")}
                                    </label>
                                    {(productImage || editingProduct?.product_image) && (
                                        <div className="flex items-center gap-2">
                                            {(productImage || editingProduct?.product_image) && (
                                                <div className="w-10 h-10 rounded border border-outline-variant/30 overflow-hidden bg-surface-container">
                                                    <img 
                                                        src={productImage ? URL.createObjectURL(productImage) : editingProduct.product_image} 
                                                        className="w-full h-full object-cover" 
                                                        alt="Preview"
                                                    />
                                                </div>
                                            )}
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setProductImage(null);
                                                }} 
                                                className="text-xs text-error hover:underline"
                                            >
                                                {productImage ? "Remove New" : ""}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-1">Upload a custom photo for your product. If not provided, the default system photo will be used.</p>
                            </div>
                            <div className="col-span-1 md:col-span-2 mt-2">
                                <button type="submit" className="bg-primary text-on-primary font-button px-4 py-2 rounded-lg w-full md:w-auto hover:bg-tertiary transition-colors" disabled={loading}>
                                    {loading ? "Saving..." : (editingProduct ? "Update Product" : "Add Product to Market")}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Inventory Data Grid */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                                    <th className="px-lg py-sm font-medium">Product Details</th>
                                    <th className="px-lg py-sm font-medium">Quantity</th>
                                    <th className="px-lg py-sm font-medium">Market Price</th>
                                    <th className="px-lg py-sm font-medium">Quality</th>
                                    <th className="px-lg py-sm font-medium">Status</th>
                                    <th className="px-lg py-sm font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-bright transition-colors">
                                        <td className="px-lg py-md">
                                            <div className="flex items-center gap-md">
                                                <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                                                    {p.product_image ? (
                                                        <img src={p.product_image} className="w-full h-full object-cover" />
                                                    ) : p.catalog_image ? (
                                                        <img src={p.catalog_image} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-outline">inventory_2</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-h3 text-h3 text-primary">{p.name || "Unnamed Product"}</h3>
                                                    <p className="font-body-sm text-body-sm text-on-surface-variant">📍 {p.farm_name || "Unknown Farm"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-lg py-md font-body-md text-on-surface">{p.quantity_available} kg</td>
                                        <td className="px-lg py-md font-body-md text-on-surface font-medium">{p.price_per_kg} DA / kg</td>
                                        <td className="px-lg py-md">
                                            <span className={`inline-flex px-2 py-0.5 rounded font-label-caps text-[10px] border uppercase ${
                                                p.quality_grade === 'HIGH' ? 'bg-green-50 text-green-700 border-green-200' :
                                                p.quality_grade === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {p.quality_grade || 'HIGH'}
                                            </span>
                                        </td>
                                        <td className="px-lg py-md">
                                            <div className="flex flex-col items-start gap-1">
                                                {p.quantity_available > 0 ? (
                                                    <span className="inline-flex bg-primary-container text-on-primary-container rounded-full px-3 py-1 font-label-caps text-[10px] items-center gap-1 uppercase tracking-wider">
                                                        Available
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex bg-error-container text-on-error-container rounded-full px-3 py-1 font-label-caps text-[10px] items-center gap-1 uppercase tracking-wider">
                                                        Out of Stock
                                                    </span>
                                                )}
                                                {p.quantity_available > 0 && p.quantity_available < 5 && (
                                                    <span className="text-[10px] text-error font-bold">Low Stock!</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-lg py-md text-right">
                                            <div className="flex justify-end gap-xs">
                                                <button onClick={() => handleEditProduct(p)} className="action-icon-btn btn-edit" title="Edit Product">
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="action-icon-btn btn-delete" title="Remove Product">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-on-surface-variant text-sm">No products added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination currentPage={productsPage} totalCount={productsCount} pageSize={10} onPageChange={setProductsPage} />
            </div>
        );
    } else if (activeTab === "orders") {
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Orders & Sales</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Track incoming buyer requests</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                                    <th className="px-lg py-sm font-medium">Order ID</th>
                                    <th className="px-lg py-sm font-medium">Product</th>
                                    <th className="px-lg py-sm font-medium">Quantity</th>
                                    <th className="px-lg py-sm font-medium">Total Price</th>
                                    <th className="px-lg py-sm font-medium">Status</th>
                                    <th className="px-lg py-sm font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id} className="border-b border-outline-variant/20 hover:bg-surface-bright transition-colors">
                                        <td className="px-lg py-md font-medium text-on-surface">#{o.id}</td>
                                        <td className="px-lg py-md">
                                            <div className="font-bold text-on-surface">{o.product_name}</div>
                                            <div className="text-xs text-on-surface-variant">{o.buyer_name}</div>
                                        </td>
                                        <td className="px-lg py-md text-on-surface">{o.quantity}kg</td>
                                        <td className="px-lg py-md font-medium text-primary">{o.total_price} DA</td>
                                        <td className="px-lg py-md">
                                            <span className={`inline-flex rounded-full px-3 py-1 font-label-caps text-[10px] items-center gap-1 uppercase tracking-wider ${o.status === 'PENDING' ? 'bg-surface-variant text-on-surface-variant' : o.status === 'ACCEPTED' || o.status === 'DELIVERED' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-lg py-md text-right">
                                            <div className="flex justify-end gap-sm">
                                                {o.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')} className="action-icon-btn btn-approve" title="Accept Order"><span className="material-symbols-outlined">check_circle</span></button>
                                                        <button onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')} className="action-icon-btn btn-reject" title="Reject Order"><span className="material-symbols-outlined">cancel</span></button>
                                                    </>
                                                )}
                                                {o.status !== 'PENDING' && (
                                                    <button 
                                                        className="px-4 py-2 rounded-lg font-button text-xs bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                                        title="View Full Details & Download PDF"
                                                        onClick={() => {
                                                            setSelectedOrder(o);
                                                            setOrderDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <FileText size={14} />
                                                        View Info
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-on-surface-variant text-sm">No orders yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination currentPage={ordersPage} totalCount={ordersCount} pageSize={10} onPageChange={setOrdersPage} />
            </div>
        );
    } else if (activeTab === "tracking") {
        const activeTracking = orders.filter(o => ['ACCEPTED', 'CHARGING', 'ON_WAY', 'DELIVERED'].includes(o.status));
        const paginatedTracking = activeTracking.slice((trackingPage - 1) * 10, trackingPage * 10);
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Delivery Tracking</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Monitor your products en route to buyers</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {paginatedTracking.map(o => (
                        <div key={o.id} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/30">
                                <h3 className="font-bold text-primary">Order #{o.id}</h3>
                                <span className={`inline-flex rounded-full px-3 py-1 font-label-caps text-[10px] uppercase tracking-wider ${o.status === 'DELIVERED' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>{o.status.replace('_', ' ')}</span>
                            </div>
                            <div className="space-y-3 mb-6 text-sm text-on-surface">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">local_shipping</span>
                                    <span>Transporter: <strong>{o.transporter_name || "Assigning..."}</strong></span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-outline">schedule</span>
                                    <span>Status: <strong>{(o.delivery_status || o.status).replace('_', ' ')}</strong></span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="flex justify-between items-center relative w-full pt-4 px-2">
                                {/* Background Line */}
                                <div className="absolute top-[25px] left-[20px] right-[20px] h-1.5 bg-surface-variant/50 rounded-full"></div>
                                
                                {/* Active Line */}
                                <div 
                                    className="absolute top-[25px] left-[20px] h-1.5 bg-primary rounded-full transition-all duration-500"
                                    style={{ 
                                        width: o.status === 'DELIVERED' ? 'calc(100% - 40px)' : 
                                               o.status === 'CHARGING' ? '66%' : 
                                               o.status === 'ON_WAY' ? '33%' : '0%' 
                                    }}
                                ></div>

                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-5 h-5 rounded-full bg-primary border-4 border-surface-container-lowest shadow-sm"></div>
                                    <span className="text-[10px] mt-2 font-bold text-primary">Accepted</span>
                                </div>
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${['ON_WAY', 'CHARGING', 'DELIVERED'].includes(o.status) ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                    <span className={`text-[10px] mt-2 font-bold ${['ON_WAY', 'CHARGING', 'DELIVERED'].includes(o.status) ? 'text-primary' : 'text-outline'}`}>On Way</span>
                                </div>
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${['CHARGING', 'DELIVERED'].includes(o.status) ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                    <span className={`text-[10px] mt-2 font-bold ${['CHARGING', 'DELIVERED'].includes(o.status) ? 'text-primary' : 'text-outline'}`}>Loading</span>
                                </div>
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${o.status === 'DELIVERED' ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                    <span className={`text-[10px] mt-2 font-bold ${o.status === 'DELIVERED' ? 'text-primary' : 'text-outline'}`}>Delivered</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && <div className="col-span-full p-4 text-center text-on-surface-variant">No active deliveries to track.</div>}
                </div>
                {activeTracking.length > 0 && <Pagination currentPage={trackingPage} totalCount={activeTracking.length} pageSize={10} onPageChange={setTrackingPage} />}
            </div>
        );
    } else if (activeTab === "prices") {
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs flex items-center gap-2"><span className="material-symbols-outlined">receipt_long</span> Official Market Prices</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Price ranges set by the Ministry of Agriculture</p>
                    </div>
                </div>

                {catalog.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm text-center text-on-surface-variant flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-outline">info</span>
                        <p>No official price ranges have been published yet by the Ministry.</p>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant/30 bg-surface-bright font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                                        <th className="px-lg py-sm font-medium">Product</th>
                                        <th className="px-lg py-sm font-medium">Description</th>
                                        <th className="px-lg py-sm font-medium">Last Update</th>
                                        <th className="px-lg py-sm font-medium">Min Price</th>
                                        <th className="px-lg py-sm font-medium">Max Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {catalog.map(c => (
                                        <tr key={c.id} className="border-b border-outline-variant/20 hover:bg-surface-bright transition-colors">
                                            <td className="px-lg py-md font-bold text-on-surface">{c.name}</td>
                                            <td className="px-lg py-md text-on-surface-variant text-sm">{c.description || "—"}</td>
                                            <td className="px-lg py-md">
                                                <p className="text-on-surface font-body-sm text-body-sm font-bold">{new Date(c.updated_at).toLocaleString()}</p>
                                            </td>
                                            <td className="px-lg py-md font-medium text-secondary">{c.min_price ? `${c.min_price} DA` : "—"}</td>
                                            <td className="px-lg py-md font-medium text-error">{c.max_price ? `${c.max_price} DA` : "—"} <span className="text-[10px] text-outline font-normal">/{c.unit || 'kg'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                <Pagination currentPage={catalogPage} totalCount={catalogCount} pageSize={10} onPageChange={setCatalogPage} />
            </div>
        );
    } else if (activeTab === "notifications") {
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Notifications</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Alerts and updates from the Ministry</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm border-l-4 flex gap-4 items-start ${n.is_read ? 'border-outline-variant' : 'border-primary bg-primary-fixed/10'}`}>
                            <div className={`p-2 rounded-full ${n.is_read ? 'bg-surface text-outline' : 'bg-primary-container text-on-primary-container'}`}>
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            <div className="flex-1">
                                <p className={`text-on-surface ${n.is_read ? '' : 'font-semibold'}`}>{n.message}</p>
                                <span className="text-xs text-on-surface-variant mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => handleDeleteNotification(n.id)}
                                className="p-2 text-error hover-bg-error-container rounded-full transition-colors bg-error-container/30"
                                title="Delete Notification"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))}
                    {notifications.length === 0 && <div className="text-center p-8 text-on-surface-variant">No notifications yet.</div>}
                </div>
            </div>
        );
    } else if (activeTab === "farms") {
        content = (
            <div className="animate-in w-full pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl mt-4">
                    <div>
                        <h1 className="font-h1 text-h1 text-primary mb-xs">Manage My Farms</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">View and add your agriculture locations (Max 5)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
                    <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-md shadow-sm">
                        <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline">
                                {editingFarm ? "edit_location" : "add_circle"}
                            </span>
                            {editingFarm ? "Edit Farm" : "Add New Farm"}
                        </h3>
                        <form className="flex flex-col gap-4" onSubmit={editingFarm ? handleUpdateFarm : handleAddFarm}>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Farm Name</label>
                                <input
                                    name="farm_name"
                                    defaultValue={editingFarm?.name || ""}
                                    key={editingFarm?.id || 'new'}
                                    placeholder="Name of your farm"
                                    required
                                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Wilaya</label>
                                <select
                                    name="wilaya"
                                    defaultValue={editingFarm?.wilaya || ""}
                                    disabled={!!editingFarm}
                                    required
                                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2 disabled:opacity-50"
                                >
                                    <option value="">Select Wilaya</option>
                                    {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                                {editingFarm && <p className="text-[10px] text-on-surface-variant mt-1">Wilaya cannot be changed after creation.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Location (Optional)</label>
                                <input
                                    name="location"
                                    defaultValue={editingFarm?.location || ""}
                                    placeholder="Specific area"
                                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Farm Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFarmImage(e.target.files[0])}
                                    className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-tertiary transition-all"
                                />
                                {(editingFarm?.image || farmImage) && (
                                    <div className="mt-2 rounded-lg overflow-hidden h-32 border border-outline-variant">
                                        <img
                                            src={farmImage ? URL.createObjectURL(farmImage) : editingFarm.image}
                                            className="w-full h-full object-cover"
                                            alt="Farm preview"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-primary text-on-primary font-button px-4 py-2 rounded-lg flex-1 hover:bg-tertiary transition-colors disabled:opacity-50 mt-2" disabled={loading || (!editingFarm && farms.length >= 5)}>
                                    {loading ? (editingFarm ? "Updating..." : "Adding...") : (editingFarm ? "Save Changes" : (farms.length >= 5 ? "Limit Reached" : "Create Farm Profile"))}
                                </button>
                                {editingFarm && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingFarm(null); setFarmImage(null); }}
                                        className="bg-surface-variant text-on-surface-variant font-button px-4 py-2 rounded-lg hover:bg-surface-dim transition-colors mt-2"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-md shadow-sm">
                        <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline">agriculture</span> Active Farms
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {farms.map(f => (
                                <div key={f.id} className="flex flex-col bg-surface rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300 will-change-transform overflow-hidden group">
                                    <div className="h-32 bg-surface-container-high relative overflow-hidden">
                                        {f.image ? (
                                            <img src={f.image} className="w-full h-full object-cover" alt={f.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-outline-variant">
                                                <span className="material-symbols-outlined text-4xl">landscape</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            {f.is_approved ? (
                                                <span className="bg-primary/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Approved</span>
                                            ) : (
                                                <span className="bg-warning/90 text-on-warning text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Pending Approval</span>
                                            )}
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingFarm(f); setFarmImage(null); }}
                                                className="bg-white/90 p-1.5 rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                title="Edit Farm"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFarm(f.id)}
                                                disabled={farms.length <= 1}
                                                className="bg-white/90 p-1.5 rounded-full text-error hover-bg-error transition-all shadow-sm disabled:opacity-50"
                                                title="Delete Farm"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="font-bold text-on-surface line-clamp-1">{f.name}</div>
                                        <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[14px]">map</span>
                                            {f.wilaya} {f.location && `• ${f.location}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {farms.length === 0 && <p className="col-span-full p-4 text-center text-on-surface-variant text-sm">No farms registered yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (activeTab === "equipment") {
        content = (
            <div className="ep-dashboard-container animate-in pb-20 md:pb-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-lg mt-4">
                    <div>
                        <span className="ep-label-caps">Rental Services</span>
                        <h1 className="ep-h1">Machinery Rental</h1>
                        <p className="text-on-surface-variant mt-2 max-w-2xl">Access professional agricultural equipment from verified providers.</p>
                    </div>
                </header>

                {equipmentBookings.length > 0 && (
                    <div className="ep-card mb-xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-lg">
                            <h3 className="ep-h3 text-secondary"><Clock size={24} /> My Rental History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="history-table w-full">
                                <thead>
                                    <tr className="border-b border-surface-container-highest">
                                        <th className="py-4 font-label-caps" style={{ fontSize: '10px' }}>Machine</th>
                                        <th className="py-4 font-label-caps" style={{ fontSize: '10px' }}>Provider</th>
                                        <th className="py-4 font-label-caps" style={{ fontSize: '10px' }}>Date</th>
                                        <th className="py-4 font-label-caps" style={{ fontSize: '10px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container">
                                    {equipmentBookings.map(b => (
                                        <tr key={b.id}>
                                            <td className="py-4 font-bold text-primary">{b.equipment_name}</td>
                                            <td className="py-4 text-sm">
                                                <div className="font-medium flex flex-col items-start gap-1">
                                                    {b.provider_name}
                                                    <button onClick={() => { setSelectedUser({name: b.provider_name, phone: b.provider_phone, email: b.provider_email, wilaya: b.provider_wilaya, role: 'Equipment Provider'}); setIsUserModalOpen(true); }} className="px-3 py-1.5 rounded-lg font-button text-[10px] bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-sm active:scale-95"><Users size={12}/> Provider Info</button>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">{new Date(b.created_at).toLocaleDateString()}</td>
                                            <td className="py-4"><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mb-lg">
                    <h3 className="ep-h3 mb-lg"><Package size={24} className="text-secondary" /> Available Fleet</h3>
                    <div className="ep-equipment-grid">
                        {equipment.map(e => (
                            <div key={e.id} className={`ep-equipment-card ${(!e.is_available || e.quantity_available === 0) ? 'opacity-60' : ''}`}>
                                <div className="ep-card-img-container">
                                    {e.images && e.images.length > 0 ? (
                                        <img src={e.images[0].image} alt={e.name} className="ep-card-img" />
                                    ) : (
                                        <div className="flex items-center justify-center bg-surface-container h-full">
                                            <ImageIcon size={40} className="text-outline-variant" />
                                        </div>
                                    )}
                                    <div className="ep-card-badge flex items-center gap-1">
                                        {e.is_electric && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mr-1">⚡ Electric</span>}
                                        <span>{e.is_available && e.quantity_available > 0 ? 'Available' : 'Booked Out'}</span>
                                    </div>
                                </div>
                                <div className="ep-card-body">
                                    <p className="ep-label-caps" style={{ fontSize: '10px' }}>{e.equipment_type}</p>
                                    <h3 className="font-bold text-lg text-primary truncate" title={e.name}>{e.name}</h3>
 
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 my-4 text-xs">
                                        <div className="ep-meta-item"><MapPin size={14} className="truncate" /> <span className="truncate">{e.location || "Nearby"}</span></div>
                                        <div className="ep-meta-item"><Package size={14} /> <span>{e.quantity_available} Available</span></div>
                                        
                                        {e.is_electric ? (
                                            <>
                                                {e.flight_time ? (
                                                    <div className="ep-meta-item text-emerald-600 font-medium" title="Flight/Operating Time"><Clock size={14} /> <span className="truncate">{e.flight_time}</span></div>
                                                ) : e.battery_capacity ? (
                                                    <div className="ep-meta-item text-emerald-600 font-medium" title="Battery Capacity"><Activity size={14} /> <span className="truncate">{e.battery_capacity}</span></div>
                                                ) : (
                                                    <div className="ep-meta-item text-emerald-600 font-medium"><Activity size={14} /> <span>Electric</span></div>
                                                )}
                                                {e.payload_capacity && (
                                                    <div className="ep-meta-item col-span-2 text-on-surface-variant" title="Payload Capacity">🔋 Range/Payload: {e.max_range ? `${e.max_range} / ` : ""}{e.payload_capacity}</div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {e.horsepower && <div className="ep-meta-item" title="Horsepower"><Activity size={14} /> <span>{e.horsepower} HP</span></div>}
                                            </>
                                        )}
                                        <div className="ep-meta-item col-span-2 text-on-surface-variant font-medium truncate"><Users size={14} /> <span className="truncate">Provider: {e.provider_name}</span></div>
                                    </div>
 
                                    {bookingFormId === e.id ? (
                                        <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/30 space-y-4">
                                            <div>
                                                <label className="font-bold text-xs uppercase text-on-surface-variant block mb-1">Quantity</label>
                                                <input type="number" min="1" max={e.quantity_available} value={bookingData.requested_quantity} onChange={(ev) => setBookingData(p => ({ ...p, requested_quantity: parseInt(ev.target.value) || 1 }))} className="w-full bg-white border border-outline-variant/50 rounded-lg px-3 py-2 text-sm" />
                                            </div>
                                            <div>
                                                <label className="font-bold text-xs uppercase text-on-surface-variant block mb-1">Duration (Days)</label>
                                                <input type="number" min="1" value={bookingData.rental_days} onChange={(ev) => setBookingData(p => ({ ...p, rental_days: parseInt(ev.target.value) || 1 }))} className="w-full bg-white border border-outline-variant/50 rounded-lg px-3 py-2 text-sm" />
                                            </div>
                                            <div className="text-sm font-bold text-primary flex justify-between items-center">
                                                <span>Estimated Total:</span>
                                                <span className="text-secondary">{(e.price_per_day * bookingData.requested_quantity * bookingData.rental_days).toLocaleString()} DA</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="ep-btn-secondary flex-1 text-xs py-2" onClick={() => handleBookEquipment(e)}>Confirm Request</button>
                                                <button className="ep-btn-outline text-xs py-2" onClick={() => setBookingFormId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="ep-card-footer">
                                            <div>
                                                <span className="ep-price">{e.price_per_day} DA</span>
                                                <span className="text-on-surface-variant text-sm">/day</span>
                                            </div>
                                            <button
                                                className={`ep-btn-primary text-xs ${(e.quantity_available === 0 || !e.is_available) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                                disabled={e.quantity_available === 0 || !e.is_available}
                                                onClick={() => { setBookingFormId(e.id); setBookingData({ requested_quantity: 1, rental_days: 1 }); }}
                                            >
                                                {e.quantity_available === 0 ? 'Fully Booked' : 'Rent Now'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    } else if (activeTab === "complaints") {
        content = (
            <div className="max-w-2xl mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Submit a Complaint</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                        Report issues with orders, buyers, delivery, or platform services.
                    </p>
                </div>

                <form
                    className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-6"
                    onSubmit={handleSubmitComplaint}
                >
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">
                            Reason for Complaint
                        </label>
                        <input
                            name="subject"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md"
                            placeholder="Summary of the issue"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">
                            Details
                        </label>
                        <textarea
                            name="message"
                            rows="4"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md resize-none"
                            placeholder="Briefly describe the issue..."
                            required
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">
                            Order ID (Optional)
                        </label>
                        <input
                            name="orderId"
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md"
                            placeholder="e.g. #15"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-error text-on-error py-3 rounded-xl font-button text-button hover:bg-error-container hover:text-on-error-container transition-colors shadow-sm disabled:opacity-50 mt-4"
                        disabled={loading}
                    >
                        {loading ? "Reporting..." : "Submit Complaint"}
                    </button>
                </form>
            </div>
        );
    } else if (activeTab === "setistics") {
        content = <FarmerStatistics />;
    }

    return (
        <>
            {content}
            
            {showHistoryModal && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-primary/5">
                            <div>
                                <h3 className="font-h3 text-h3 text-primary">{selectedCatalogItem?.name} - Price History</h3>
                                <p className="text-xs text-on-surface-variant mt-1 uppercase font-bold tracking-wider">Official Pricing Evolution</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {/* Current Price Header */}
                                <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-primary font-bold text-lg">{selectedCatalogItem?.min_price} - {selectedCatalogItem?.max_price} <span className="text-sm font-normal">DA/{selectedCatalogItem?.unit}</span></span>
                                        <span className="bg-primary text-on-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Current</span>
                                    </div>
                                </div>

                                {/* History List */}
                                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
                                    {priceHistory.map((h, idx) => (
                                        <div key={h.id} className="relative pl-8">
                                            <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-surface-container-lowest border-2 border-primary/50 flex items-center justify-center z-10">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            </div>
                                            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">{new Date(h.updated_at).toLocaleString()}</p>
                                            <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                                                <div className="font-semibold text-on-surface mb-1">{h.min_price} - {h.max_price} <span className="text-sm font-normal text-on-surface-variant">DA/{selectedCatalogItem?.unit}</span></div>
                                                <div className="text-xs text-on-surface-variant flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(h.updated_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {priceHistory.length === 0 && (
                                        <div className="text-center py-4 text-on-surface-variant">No historical data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-surface-variant/20 border-t border-outline-variant/30 flex justify-end">
                            <button onClick={() => setShowHistoryModal(false)} className="bg-primary text-on-primary font-button px-6 py-2 rounded-lg hover:bg-tertiary transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {isFireAlertOpen && (
                <div className="fixed inset-0 bg-red-600/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border-4 border-red-500">
                        <div className="p-8 text-center">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-red-600 text-6xl animate-pulse">local_fire_department</span>
                            </div>
                            <h2 className="text-3xl font-black text-red-700 mb-4 uppercase tracking-tighter">🔥 FIRE DETECTED! 🔥</h2>
                            <div className="space-y-4 mb-8">
                                {fireAlerts.map(alert => (
                                    <div key={alert.id} className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                        <p className="font-bold text-red-800 text-xl">{alert.farm_name}</p>
                                        <p className="text-red-600">Detected at: {new Date(alert.timestamp).toLocaleTimeString()}</p>
                                        <button 
                                            onClick={() => handleResolveAlert(alert.id)}
                                            className="mt-4 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg"
                                        >
                                            I HAVE HANDLED THIS
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-red-500 font-medium text-sm">A notification has also been sent to your alert system.</p>
                        </div>
                    </div>
                </div>
            )}
            <AskAgriButton />
            <OrderDetailsModal 
                order={selectedOrder}
                isOpen={orderDetailsModalOpen}
                onClose={() => setOrderDetailsModalOpen(false)}
                userRole="FARMER"
            />
            {isUserModalOpen && selectedUser && (
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
            )}
        </>
    );
};

export default FarmerDashboard;