import { useState, useEffect, useContext } from "react";
import api from "../../api/axios";
import { ShoppingCart, Package, Truck, CheckCircle, Search, Filter, Trash2, CreditCard, AlertCircle, Bell, ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";
import ProductPurchaseModal from "../../pages/ProductPurchaseModal";
import ProductDetailsModal from "../../pages/ProductDetailsModal";
import OrderDetailsModal from "../common/OrderDetailsModal";
import { FileText } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";

const BuyerDashboard = ({ activeTab, setActiveTab }) => {
    const { user } = useContext(AuthContext);

    // Initialize Real-time WebSockets
    useWebSocket(user, (event, data) => {
        if (event === "order_status_update") {
            fetchMyOrders(myOrdersPage);
            fetchStats();
            alert(`🎉 Order Status Updated: ${data.message}`);
        }
    });

    const [products, setProducts] = useState([]);
    const [productsCount, setProductsCount] = useState(0);
    const [productsPage, setProductsPage] = useState(1);

    const [myOrders, setMyOrders] = useState([]);
    const [myOrdersCount, setMyOrdersCount] = useState(0);
    const [myOrdersPage, setMyOrdersPage] = useState(1);
    const [trackingPage, setTrackingPage] = useState(1);

    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        pending_deliveries: 0,
        delivered_count: 0,
        total_spent: 0
    });
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ search: "", category: "all", priceRange: "all" });
    const [cart, setCart] = useState(null); // Simple one-item cart
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);

    // Frontend-only Favorites flow (No DB table needed!)
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem(`buyer_favorites_${user?.username || 'default'}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    const toggleFavorite = (productId) => {
        let updated;
        if (favorites.includes(productId)) {
            updated = favorites.filter(id => id !== productId);
        } else {
            updated = [...favorites, productId];
        }
        setFavorites(updated);
        localStorage.setItem(`buyer_favorites_${user?.username || 'default'}`, JSON.stringify(updated));
    };

    // Modal state
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [orderToRate, setOrderToRate] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingComment, setRatingComment] = useState("");
    
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Debounced search state
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 300); // 300ms for snappier feel

        return () => clearTimeout(timer);
    }, [filters.search]);

    // 1. Initial/Permanent data
    useEffect(() => {
        fetchCategories();
        const savedCart = localStorage.getItem("buyer_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    // 2. Tab-specific data fetching
    useEffect(() => {
        if (activeTab === "notifications") {
            fetchNotifications();
            api.post("market/notifications/mark_all_as_read/").catch(console.error);
        } else if (activeTab === "dashboard") {
            fetchStats();
            fetchProducts(1); // Dashboard highlights
        } else if (activeTab === "orders" || activeTab === "tracking") {
            fetchMyOrders(myOrdersPage);
        } else if (activeTab === "products") {
            fetchProducts(productsPage);
        }
    }, [activeTab, myOrdersPage, debouncedSearch, filters.category, filters.priceRange, productsPage]);


    const fetchProducts = async (page = 1) => {
        setProductsLoading(true);
        try {
            let url = "market/products/";
            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (filters.category && filters.category !== "all") params.append("category", filters.category);
            if (filters.priceRange && filters.priceRange !== "all") {
                if (filters.priceRange === "under_100") {
                    params.append("max_price", "100");
                } else if (filters.priceRange === "100_500") {
                    params.append("min_price", "100");
                    params.append("max_price", "500");
                } else if (filters.priceRange === "over_500") {
                    params.append("min_price", "500");
                }
            }
            params.append("page", page);
            url += `?${params.toString()}`;

            const res = await api.get(url);
            if (res.data && res.data.results) {
                setProducts(res.data.results);
                setProductsCount(res.data.count);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
                setProductsCount(res.data.length);
            } else {
                setProducts([]);
                setProductsCount(0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProductsLoading(false);
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

    const fetchCategories = async () => {
        try {
            const res = await api.get("market/categories/");
            const data = res.data.results || res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyOrders = async (page = 1) => {
        try {
            const trackingParam = activeTab === "tracking" ? "&tracking=true" : "";
            const res = await api.get(`market/orders/?page=${page}${trackingParam}`);
            if (res.data.results) {
                setMyOrders(res.data.results);
                setMyOrdersCount(res.data.count);
            } else {
                setMyOrders(res.data);
                setMyOrdersCount(res.data.length);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("market/orders/stats/");
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = (product) => {
        if (product.quantity_available <= 0) {
            alert("This product is out of stock.");
            return;
        }
        setSelectedProduct(product);
        setPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = () => {
        fetchMyOrders();
        fetchStats();
        fetchProducts(productsPage);
        // Optionally clear cart if this product was in it
        removeFromCart();
    };

    const removeFromCart = () => {
        setCart(null);
        localStorage.removeItem("buyer_cart");
    };

    const handleUpdateQuantity = (newQty) => {
        if (!cart) return;
        if (newQty <= 0) return removeFromCart();

        // Wait, did we save quantity_available inside cart when adding? Yes, addToCart spreads product: { ...product, quantity, totalPrice }
        if (newQty > cart.quantity_available) {
            alert(`Only ${cart.quantity_available} ${cart.catalog_unit || 'kg'} available!`);
            return;
        }

        const updatedItem = {
            ...cart,
            quantity: newQty,
            totalPrice: (cart.price_per_kg * newQty).toFixed(2)
        };
        setCart(updatedItem);
        localStorage.setItem("buyer_cart", JSON.stringify(updatedItem));
    };

    const handleCheckout = async () => {
        if (!cart) return;
        setLoading(true);
        try {
            await api.post("market/orders/", {
                product: cart.id,
                quantity: cart.quantity,
            });
            alert("Order placed successfully!");
            removeFromCart();
            fetchMyOrders();
            fetchStats();
        } catch (err) {
            const msg = err.response?.data?.quantity || err.response?.data?.detail || "Error placing order";
            alert(Array.isArray(msg) ? msg[0] : msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.patch(`market/orders/${id}/`, { status: "CANCELLED" });
            fetchMyOrders();
            fetchStats();
        } catch (err) {
            alert("Error cancelling order");
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
            alert("Complaint logged for review!");
            e.target.reset();
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || "Error submitting complaint";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRatingModal = (order) => {
        setOrderToRate(order);
        setRatingValue(order.rating || 5);
        setRatingComment(order.rating_comment || "");
        setRatingModalOpen(true);
    };

    const handleSubmitRating = async () => {
        if (!orderToRate) return;
        setLoading(true);
        try {
            await api.patch(`market/orders/${orderToRate.id}/`, {
                rating: ratingValue,
                rating_comment: ratingComment
            });
            alert("Thank you for your rating!");
            setRatingModalOpen(false);
            fetchMyOrders(myOrdersPage);
        } catch (err) {
            alert("Error submitting rating");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-outline-variant"}
                    />
                ))}
                {rating > 0 && <span className="text-xs font-bold text-on-surface ml-1">{Number(rating).toFixed(1)}</span>}
            </div>
        );
    };

    let content = null;

    if (activeTab === "notifications") {
        content = (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div>
                    <h1 className="font-h1 text-h1 text-on-surface">Notifications</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">Information and alerts from the Ministry</p>
                </div>
                <div className="flex flex-col gap-4">
                    {notifications.map(n => (
                        <div key={n.id} className={`bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border ${n.is_read ? 'border-outline-variant/20' : 'border-primary/40 bg-primary-fixed/10'} flex gap-4 items-start`}>
                            <div className="p-2 bg-surface-variant rounded-full text-primary">
                                <Bell size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="font-body-md text-body-md text-on-surface mb-1">{n.message}</p>
                                <span className="font-label-caps text-label-caps text-outline">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p className="text-on-surface-variant">No notifications yet.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "dashboard") {
        const statCards = [
            { label: "My Orders", value: stats.total_orders, icon: <ShoppingCart />, color: "bg-primary text-on-primary" },
            { label: "On The Way", value: stats.pending_deliveries, icon: <Truck />, color: "bg-surface-container-highest text-on-surface" },
            { label: "Delivered", value: stats.delivered_count, icon: <CheckCircle />, color: "bg-secondary-container text-on-secondary-container" },
            { label: "Total Spent", value: `${stats.total_spent} DA`, icon: <CreditCard />, color: "bg-tertiary-container text-on-tertiary-container" }
        ];

        content = (
            <div className="max-w-container-max mx-auto space-y-xl animate-in">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                    {statCards.map((s, i) => (
                        <div key={i} className={`${s.color} rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between min-h-[140px]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-full bg-white/20">{s.icon}</div>
                                <span className="font-label-caps text-label-caps uppercase opacity-90">{s.label}</span>
                            </div>
                            <h3 className="font-h1 text-h2 font-bold">{s.value}</h3>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                    <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
                            <h2 className="font-h3 text-h3 text-on-surface">Marketplace Highlights</h2>
 <span  onClick={() => setActiveTab("products")} className="text-sm text-primary font-semibold cursor-pointer hover:underline">View All</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {products.slice(0, 4).map(p => (
                                <div key={p.id} className="bg-surface-bright rounded-lg p-md border border-outline-variant/20 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden flex items-center justify-center font-bold text-primary">
                                            {p.product_image ? (
                                                <img src={p.product_image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : p.catalog_image ? (
                                                <img src={p.catalog_image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (p.name?.[0] || 'P')}
                                        </div>
                                        <div>
                                            <strong className="font-body-lg text-body-lg font-medium text-on-surface">{p.name || "Unnamed Product"}</strong>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant">{p.price_per_kg} DA / {p.catalog_unit || 'kg'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setDetailsModalOpen(true);
                                            }}
                                            className="circle-btn"
                                            title="View Details"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="10" x2="12" y2="16" />
                                                <circle cx="12" cy="7" r="1" />
                                            </svg>
                                        </button>
                                       
                                        <button
                                            onClick={() => toggleFavorite(p.id)}
                                            className="transition-all duration-200 hover:scale-110 active:scale-95 p-1 flex items-center justify-center"
                                            title={favorites.includes(p.id) ? "Remove from Favorites" : "Add to Favorites"}
                                            style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                                        >
                                            <Heart 
                                                size={22} 
                                                className={favorites.includes(p.id) ? "fill-red-500 text-red-500" : "text-outline hover:text-red-500"} 
                                            />
                                        </button>

                                        <button  onClick={() => addToCart(p)} className="circle-btn">
                                            <span className="material-symbols-outlined text-[24px]" data-icon="add_shopping_cart">add_shopping_cart</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
                            <h2 className="font-h3 text-h3 text-on-surface">Active Deliveries</h2>
                            <span onClick={() => setActiveTab("tracking")} className="text-sm text-primary font-semibold cursor-pointer hover:underline">View All</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {myOrders.filter(o => ['ACCEPTED', 'CHARGING', 'IN_TRANSIT'].includes(o.status)).slice(0, 3).map(o => (
                                <div key={o.id} className="bg-surface-bright rounded-lg p-md border border-outline-variant/20 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-label-caps text-label-caps text-outline uppercase">Order #{o.id}</span>
                                            <h4 className="font-body-lg text-body-lg font-medium text-on-surface mt-1">{o.product_name}</h4>
                                        </div>
                                        <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-caps text-label-caps rounded-full flex items-center gap-1">
                                            <Truck size={14} /> {o.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {myOrders.filter(o => ['ACCEPTED', 'CHARGING', 'IN_TRANSIT'].includes(o.status)).length === 0 && (
                                <p className="font-body-md text-on-surface-variant p-4 text-center bg-surface-variant/30 rounded-lg">No active deliveries.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        const displayedProducts = showOnlyFavorites
            ? products.filter(p => favorites.includes(p.id))
            : products;

        content = (
            <div className="max-w-container-max mx-auto space-y-xl animate-in">
                <section className="space-y-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="font-h1 text-h1 text-on-surface">Global Marketplace</h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">Source high-quality agricultural commodities from verified sellers nationwide.</p>
                        </div>
                        {/* Premium Favorites Toggle Button */}
                        <button
                            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                            className={`px-5 py-3 rounded-full font-button text-sm transition-all duration-300 flex items-center gap-2 border shadow-sm ${
                                showOnlyFavorites 
                                    ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
                                    : "bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:bg-surface-bright"
                            }`}
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                        >
                            <Heart size={18} className={showOnlyFavorites ? "fill-white text-white" : "text-red-500 fill-red-500"} />
                            <span>{showOnlyFavorites ? "Showing Favorites" : "Favorites Only"}</span>
                        </button>
                    </div>

                    <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                            <input
                                className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-outline-variant/30 bg-surface focus:outline-none focus:ring-0 focus:border-primary font-body-md text-body-md text-on-surface transition-colors"
                                placeholder="Search products..."
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Category</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.products_count || 0})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Price Range / kg</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-0"
                                    value={filters.priceRange}
                                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                                >
                                    <option value="all">Any Price</option>
                                    <option value="under_100">Under 100 DA</option>
                                    <option value="100_500">100 DA - 500 DA</option>
                                    <option value="over_500">Over 500 DA</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md transition-opacity duration-300 ${productsLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {displayedProducts.map(p => (
                        <article key={p.id} className="product-card-opt group">
                             <div className="h-48 w-full bg-surface-variant relative overflow-hidden flex items-center justify-center text-4xl text-primary font-bold">
                                  {p.product_image ? (
                                     <img src={p.product_image} alt={p.name} loading="lazy" className="w-full h-full object-cover product-image-gpu" />
                                 ) : p.catalog_image ? (
                                     <img src={p.catalog_image} alt={p.name} loading="lazy" className="w-full h-full object-cover product-image-gpu" />
                                 ) : (
                                     (p.name?.[0] || 'P')
                                 )}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {p.is_default_image && (
                                        <span className="px-2 py-1 bg-white/95 text-secondary font-label-caps text-label-caps rounded border border-secondary/20 flex items-center gap-1 shadow-sm w-fit">
                                            <AlertCircle size={14} /> Default Photo
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 font-label-caps text-label-caps rounded border flex items-center gap-1 shadow-sm w-fit ${
                                        p.quality_grade === 'HIGH' ? 'bg-green-600 text-white border-green-500' :
                                        p.quality_grade === 'MEDIUM' ? 'bg-amber-600 text-white border-amber-500' :
                                        'bg-red-600 text-white border-red-500'
                                    }`}>
                                        {p.quality_grade || 'HIGH'} Quality
                                    </span>
                                </div>
                                {/* Sleek Floating Favorite Heart Button on Top of the Card Image */}
                                <button
                                    onClick={() => toggleFavorite(p.id)}
                                    className="absolute top-3 right-3 z-10 p-1 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                                    title={favorites.includes(p.id) ? "Remove from Favorites" : "Add to Favorites"}
                                    style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                                >
                                    <Heart 
                                        size={26} 
                                        className={`transition-all duration-300 ${
                                            favorites.includes(p.id) 
                                                ? "fill-red-500 text-red-500 filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]" 
                                                : "text-white hover:text-red-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                        }`}
                                    />
                                </button>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-body-lg text-body-lg font-semibold text-on-surface line-clamp-2 mb-2">{p.name || "Unnamed Product"}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1 flex-1">By: {p.farmer_name}</p>
                                <p className="font-body-sm text-body-sm text-outline mb-4">
                                    {p.quantity_available > 0 ? (
                                        <>
                                            {p.quantity_available} {p.catalog_unit || 'kg'} available
                                            {p.quantity_available < 5 && <span className="text-error font-bold ml-2">Low Stock!</span>}
                                        </>
                                    ) : (
                                        <span className="text-error font-bold">This product is no longer available</span>
                                    )}
                                </p>
                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <div className="mb-2">
                                            {renderStars(p.avg_rating || 0)}
                                            {p.rating_count > 0 && <span className="text-[10px] text-outline">({p.rating_count} reviews)</span>}
                                        </div>
                                        <span className="font-h3 text-h3 text-primary">{p.price_per_kg} DA</span>
                                        <span className="font-label-caps text-label-caps text-outline">per {p.catalog_unit || 'kg'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setDetailsModalOpen(true);
                                            }}
                                            className="circle-btn"
                                            title="View Details"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="10" x2="12" y2="16" />
                                                <circle cx="12" cy="7" r="1" />
                                            </svg>
                                        </button>

                                        {p.quantity_available > 0 && (
                                            <button  onClick={() => addToCart(p)} className="circle-btn">
                                                <span className="material-symbols-outlined text-[24px]" data-icon="add_shopping_cart">add_shopping_cart</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                    {displayedProducts.length === 0 && <p className="col-span-full text-center text-on-surface-variant py-8">No products found matching your filters.</p>}
                </section>
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
        content = (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">My Purchases</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">History of all your orders</p>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Order ID</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Product</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Quantity</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {myOrders.map(o => (
                                    <tr key={o.id} className="hover:bg-surface-bright transition-colors">
                                        <td className="p-4 font-body-md text-on-surface">#{o.id}</td>
                                        <td className="p-4 font-body-md font-medium text-on-surface">{o.product_name} <span className="block text-sm text-outline font-normal">By {o.farmer_name}</span></td>
                                        <td className="p-4 font-body-md text-on-surface-variant">{o.quantity} {o.product_unit || 'kg'}</td>
                                        <td className="p-4 font-body-md font-bold text-primary">{o.total_price} DA</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full font-label-caps text-xs ${o.status === 'PENDING' ? 'bg-surface-variant text-on-surface' :
                                                ['ACCEPTED', 'CHARGING', 'ON_WAY'].includes(o.status) ? 'bg-secondary-container text-on-secondary-container' :
                                                    o.status === 'DELIVERED' ? 'bg-primary-fixed text-on-primary-fixed' :
                                                        'bg-error-container text-on-error-container'
                                                }`}>
                                                {o.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {o.status === 'PENDING' && (
                                                    <button className="px-5 py-2.5 rounded-lg font-button text-button bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors" onClick={() => handleCancelOrder(o.id)}>Cancel</button>
                                                )}
                                                {o.status === 'DELIVERED' && (
                                                    <button 
                                                        disabled={!!o.rating}
                                                        className={`px-4 py-2 rounded-lg font-button text-xs transition-colors flex items-center gap-1 ${o.rating ? 'bg-amber-50/50 text-amber-600 border border-amber-200 cursor-default shadow-none' : 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm shadow-primary/10 active:scale-95'}`}
                                                        onClick={() => handleOpenRatingModal(o)}
                                                    >
                                                        <Star size={14} className={o.rating ? "fill-amber-500 text-amber-500" : ""} />
                                                        {o.rating ? `Rated ${o.rating} ★` : "Rate Product"}
                                                    </button>
                                                )}
                                                {!['PENDING', 'DELIVERED', 'CANCELLED'].includes(o.status) && (
                                                    <button 
                                                        className="px-4 py-2 rounded-lg font-button text-xs bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                                        onClick={() => {
                                                            setSelectedOrder(o);
                                                            setOrderDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <FileText size={14} />
                                                        View Info
                                                    </button>
                                                )}
                                                {o.status === 'CANCELLED' && (
                                                     <span className="text-error text-sm font-medium">Cancelled</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {myOrders.length === 0 && <p className="text-center text-outline p-8">No purchases found.</p>}
                </div>
                <Pagination
                    currentPage={myOrdersPage}
                    totalCount={myOrdersCount}
                    pageSize={10}
                    onPageChange={setMyOrdersPage}
                />
            </div>
        );
    }

    if (activeTab === "tracking") {
        const activeTracking = myOrders.filter(o => ['ACCEPTED', 'CHARGING', 'ON_WAY', 'DELIVERED'].includes(o.status));
        const paginatedTracking = activeTracking.slice((trackingPage - 1) * 10, trackingPage * 10);
        content = (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Track Deliveries</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Real-time updates on your fresh produce.</p>
                </div>
                <div className="flex flex-col gap-6">
                    {paginatedTracking.map(o => (
                        <div key={o.id} className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="font-label-caps text-label-caps text-outline uppercase">Order #{o.id}</span>
                                        <h4 className="font-body-lg text-body-lg font-medium text-on-surface mt-1">{o.product_name}</h4>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">Transporter: {o.transporter_name || "Finding..."}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-caps text-label-caps rounded-full flex items-center gap-1">
                                        <Truck size={16} /> {o.delivery_status || o.status}
                                    </span>
                                </div>

                                <div className="mt-6 relative pt-4 px-2">
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

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-primary border-4 border-surface-container-lowest shadow-sm"></div>
                                            <span className={`text-[10px] mt-2 font-bold text-primary`}>Accepted</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${['ON_WAY', 'CHARGING', 'DELIVERED'].includes(o.status) ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                            <span className={`text-[10px] mt-2 font-bold ${['ON_WAY', 'CHARGING', 'DELIVERED'].includes(o.status) ? 'text-primary' : 'text-outline'}`}>On Way</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${['CHARGING', 'DELIVERED'].includes(o.status) ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                            <span className={`text-[10px] mt-2 font-bold ${['CHARGING', 'DELIVERED'].includes(o.status) ? 'text-primary' : 'text-outline'}`}>Loading</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-5 h-5 rounded-full border-4 border-surface-container-lowest shadow-sm ${o.status === 'DELIVERED' ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                                            <span className={`text-[10px] mt-2 font-bold ${o.status === 'DELIVERED' ? 'text-primary' : 'text-outline'}`}>Delivered</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && (
                        <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-4 text-on-surface-variant">
                            <Truck size={48} className="text-outline-variant/50" />
                            <p className="font-body-lg">No active deliveries to track right now.</p>
                        </div>
                    )}
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

    if (activeTab === "complaints") {
        content = (
            <div className="max-w-2xl mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Submit a Complaint</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Report issues with orders or delivery quality.</p>
                </div>
                <form className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col gap-6" onSubmit={handleSubmitComplaint}>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">Reason for Complaint</label>
                        <input name="subject" className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md" placeholder="Summary of the issue" required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">Details</label>
                        <textarea name="message" rows="4" className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md resize-none" placeholder="Briefly describe the issue..." required></textarea>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">Order ID (Optional)</label>
                        <input name="orderId" type="text" className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md" placeholder="e.g. #15" />
                    </div>
                    <button type="submit" className="bg-error text-on-error py-3 rounded-xl font-button text-button hover:bg-error-container hover:text-on-error-container transition-colors shadow-sm disabled:opacity-50 mt-4" disabled={loading}>
                        {loading ? "Reporting..." : "Submit Complaint"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <>
            {content}
            {detailsModalOpen && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setDetailsModalOpen(false)}
                />
            )}
            {purchaseModalOpen && (
                <ProductPurchaseModal
                    product={selectedProduct}
                    onClose={() => setPurchaseModalOpen(false)}
                    onSuccess={handlePurchaseSuccess}
                />
            )}
            {ratingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                            <h3 className="font-h3 text-h3 text-on-surface">Rate Your Purchase</h3>
                             <button className="bg-white text-red-600 hover:text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors"onClick={() => setRatingModalOpen(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>


                        </div>

                        {/* Product Info Section */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant/20">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex items-center justify-center shrink-0">
                                    {orderToRate?.product_image ? (
                                        <img src={orderToRate.product_image} alt={orderToRate.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-outline-variant" size={20} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-body-sm font-bold text-on-surface leading-tight">{orderToRate?.product_name}</h4>
                                    <p className="text-outline text-[10px] mt-0.5">Order #AN-{orderToRate?.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="p-6 space-y-6">
                            <div className="text-center">
                                <p className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-3 text-[10px]">Select Rating</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setRatingValue(val)}
                                            className="transition-all duration-200 hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={32}
                                                strokeWidth={2}
                                                className={`transition-all duration-300 ${
                                                    val <= ratingValue 
                                                    ? "fill-amber-400 text-amber-500" 
                                                    : "text-outline-variant"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Area */}
                            <div className="flex flex-col gap-2">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[10px]" htmlFor="review-comment">Your Experience</label>
                                <textarea
                                    id="review-comment"
                                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-sm resize-none transition-all placeholder:text-outline-variant/60"
                                    rows="3"
                                    placeholder="How was the product quality?"
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button className="px-5 py-2.5 rounded-lg font-button text-button  bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors"onClick={() => setRatingModalOpen(false)}>Cancel</button>
                            <button
                                onClick={handleSubmitRating}
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-xl font-button text-button bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            <OrderDetailsModal 
                order={selectedOrder}
                isOpen={orderDetailsModalOpen}
                onClose={() => setOrderDetailsModalOpen(false)}
                userRole="BUYER"
            />
        </>
    );
};

export default BuyerDashboard;