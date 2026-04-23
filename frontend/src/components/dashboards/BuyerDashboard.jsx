import { useState, useEffect } from "react";
import api from "../../api/axios";
import { ShoppingCart, Package, Truck, CheckCircle, Search, Filter, Trash2, CreditCard, AlertCircle, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";

const BuyerDashboard = ({ activeTab }) => {
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

    useEffect(() => {
        if (activeTab === "notifications") fetchNotifications();
        fetchMyOrders(myOrdersPage);
        fetchStats();
        fetchCategories();
        // Load cart from local storage
        const savedCart = localStorage.getItem("buyer_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
    }, [activeTab, myOrdersPage]);

    useEffect(() => {
        if (activeTab === "products" || activeTab === "dashboard") fetchProducts(productsPage);
    }, [activeTab, filters, productsPage]);


    const fetchProducts = async (page = 1) => {
        try {
            let url = "market/products/";
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
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
            console.log("API response products:", res.data); // Added for debugging

            if (res.data && res.data.results) {
                setProducts(res.data.results);
                setProductsCount(res.data.count);
                console.log("products array to render:", res.data.results);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
                setProductsCount(res.data.length);
                console.log("products array to render:", res.data);
            } else {
                setProducts([]);
                setProductsCount(0);
                console.log("products mapping fallback - set empty.");
            }
        } catch (err) {
            console.error(err);
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
            const res = await api.get(`market/orders/?page=${page}`);
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
        const qty = prompt(`How many ${product.catalog_unit || 'units'} of ${product.name} would you like?`, "1");
        if (!qty || isNaN(qty) || parseFloat(qty) <= 0) return;

        const item = {
            ...product,
            quantity: parseFloat(qty),
            totalPrice: (product.price_per_kg * parseFloat(qty)).toFixed(2)
        };
        setCart(item);
        localStorage.setItem("buyer_cart", JSON.stringify(item));
        alert("Item added to cart!");
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

    if (activeTab === "notifications") {
        return (
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

        return (
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
                            <button className="font-button text-button text-secondary hover:text-primary transition-colors" onClick={() => window.location.hash = "products"}>View All</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {products.slice(0, 4).map(p => (
                                <div key={p.id} className="bg-surface-bright rounded-lg p-md border border-outline-variant/20 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden flex items-center justify-center font-bold text-primary">
                                            {p.catalog_image ? <img src={p.catalog_image} alt={p.name} className="w-full h-full object-cover" /> : (p.name?.[0] || 'P')}
                                        </div>
                                        <div>
                                            <strong className="font-body-lg text-body-lg font-medium text-on-surface">{p.name || "Unnamed Product"}</strong>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant">{p.price_per_kg} DA / {p.catalog_unit || 'kg'}</p>
                                        </div>
                                    </div>
                                  <button
  onClick={() => addToCart(p)}
  className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 transition-all"
>
  <ShoppingCart size={24} color="white" strokeWidth={3} />
</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
                            <h2 className="font-h3 text-h3 text-on-surface">Active Deliveries</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status)).slice(0, 3).map(o => (
                                <div key={o.id} className="bg-surface-bright rounded-lg p-md border border-outline-variant/20 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-label-caps text-label-caps text-outline uppercase">Order #{o.id}</span>
                                            <h4 className="font-body-lg text-body-lg font-medium text-on-surface mt-1">{o.product_name}</h4>
                                        </div>
                                        <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-caps text-label-caps rounded-full flex items-center gap-1">
                                            <Truck size={14} /> {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status)).length === 0 && (
                                <p className="font-body-md text-on-surface-variant p-4 text-center bg-surface-variant/30 rounded-lg">No active deliveries.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="max-w-container-max mx-auto space-y-xl animate-in">
                <section className="space-y-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="font-h1 text-h1 text-on-surface">Global Marketplace</h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl">Source high-quality agricultural commodities from verified sellers nationwide.</p>
                        </div>
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
                                        <option key={c.id} value={c.id}>{c.name}</option>
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

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                    {products.map(p => (
                        <article key={p.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(26,58,52,0.05)] hover:shadow-[0_8px_30px_rgba(26,58,52,0.08)] transition-shadow duration-300 border border-outline-variant/10 flex flex-col group cursor-pointer">
                            <div className="h-48 w-full bg-surface-variant relative overflow-hidden flex items-center justify-center text-4xl text-primary font-bold">
                                {p.catalog_image ? (
                                    <img src={p.catalog_image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    (p.name?.[0] || 'P')
                                )}
                                <div className="absolute top-3 left-3 flex gap-1">
                                    <span className="px-2 py-1 bg-surface-container-lowest/90 backdrop-blur-sm text-secondary font-label-caps text-label-caps rounded border border-secondary/20 flex items-center gap-1 shadow-sm">
                                        <CheckCircle size={14} /> Verified
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-body-lg text-body-lg font-semibold text-on-surface line-clamp-2 mb-2">{p.name || "Unnamed Product"}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1 flex-1">By: {p.farmer_name}</p>
                                <p className="font-body-sm text-body-sm text-outline mb-4">{p.quantity_available} {p.catalog_unit || 'kg'} available</p>
                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="font-h3 text-h3 text-primary">{p.price_per_kg} DA</span>
                                        <span className="font-label-caps text-label-caps text-outline">per {p.catalog_unit || 'kg'}</span>
                                    </div>
                                  <button
  onClick={() => addToCart(p)}
  className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 transition-all"
>
  <ShoppingCart size={24} color="white" strokeWidth={3} />
</button>
                                </div>
                            </div>
                        </article>
                    ))}
                    {products.length === 0 && <p className="col-span-full text-center text-on-surface-variant py-8">No products found matching your filters.</p>}
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

    if (activeTab === "cart") {
        return (
            <div className="max-w-3xl mx-auto space-y-md animate-in">
                <div className="mb-8">
                    <h1 className="font-h1 text-h1 text-on-surface">Order Validation</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Confirm your selection before placing the order.</p>
                </div>

                {cart ? (
                    <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col gap-6">
                        <div className="flex items-center gap-6 pb-6 border-b border-outline-variant/20">
                            <div className="w-20 h-20 rounded bg-surface-variant flex items-center justify-center text-3xl font-bold text-primary">
                                {cart.name?.[0] || 'P'}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-h3 text-h3 text-on-surface">{cart.name || "Unnamed Product"}</h3>
                                <p className="font-body-md text-on-surface-variant">From: {cart.farmer_name}</p>
                            </div>
                            <button className="text-error hover:bg-error-container p-2 rounded-full transition-colors" onClick={removeFromCart}>
                                <Trash2 size={24} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20">
                            <span className="font-body-lg font-medium text-on-surface">Quantity</span>
                            <div className="flex items-center gap-4 bg-surface-container p-2 rounded-lg">
                                <button className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-on-surface" onClick={() => handleUpdateQuantity(cart.quantity - 1)}>-</button>
                                <input
                                    type="number"
                                    className="w-16 text-center bg-transparent border-none focus:ring-0 font-body-lg font-bold"
                                    value={cart.quantity}
                                    onChange={(e) => handleUpdateQuantity(parseFloat(e.target.value) || 0)}
                                />
                                <button className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-on-surface" onClick={() => handleUpdateQuantity(cart.quantity + 1)}>+</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Unit Price</span>
                                <span>{cart.price_per_kg} DA / {cart.catalog_unit || 'kg'}</span>
                            </div>
                            <div className="flex justify-between text-on-surface font-bold text-xl pt-4 border-t border-outline-variant/20">
                                <span>Total Order Value</span>
                                <span className="text-primary">{cart.totalPrice} DA</span>
                            </div>
                        </div>

                        <button
                            className="w-full bg-primary text-on-primary py-4 rounded-xl font-button text-button hover:bg-tertiary transition-colors shadow-sm disabled:opacity-50"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Confirm & Place Order"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/20 flex flex-col items-center text-center gap-4">
                        <ShoppingCart size={64} className="text-outline-variant" />
                        <h3 className="font-h3 text-on-surface">Your cart is empty</h3>
                        <p className="font-body-md text-on-surface-variant">Browse the marketplace to find fresh products.</p>
                        <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-button text-button mt-2" onClick={() => window.location.hash = "products"}>
                            Go to Marketplace
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
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
                                                    o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT' ? 'bg-secondary-container text-on-secondary-container' :
                                                        o.status === 'DELIVERED' ? 'bg-primary-fixed text-on-primary-fixed' :
                                                            'bg-error-container text-on-error-container'
                                                }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {o.status === 'PENDING' ? (
                                                <button className="text-error hover:bg-error-container px-3 py-1 rounded-md text-sm font-medium transition-colors border border-error" onClick={() => handleCancelOrder(o.id)}>Cancel</button>
                                            ) : (
                                                <span className="text-outline text-sm">No actions</span>
                                            )}
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
        const activeTracking = myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status));
        const paginatedTracking = activeTracking.slice((trackingPage - 1) * 10, trackingPage * 10);
        return (
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

                                <div className="mt-6 relative">
                                    <div className="flex justify-between text-label-caps font-label-caps text-outline mb-2 relative z-10">
                                        <span className={['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(o.status) ? "text-primary font-bold" : ""}>Accepted</span>
                                        <span className={['IN_TRANSIT', 'DELIVERED'].includes(o.status) ? "text-primary font-bold" : ""}>In Transit</span>
                                        <span className={['DELIVERED'].includes(o.status) ? "text-primary font-bold" : ""}>Delivered</span>
                                    </div>
                                    <div className="w-full bg-surface-variant rounded-full h-2 relative">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: o.status === 'DELIVERED' ? '100%' : o.status === 'IN_TRANSIT' ? '50%' : '10%'
                                            }}
                                        ></div>
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
        return (
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

    return null;
};

export default BuyerDashboard;