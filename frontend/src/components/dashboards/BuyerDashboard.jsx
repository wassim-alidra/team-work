import { useState, useEffect } from "react";
import api from "../../api/axios";
import { ShoppingCart, Package, Truck, CheckCircle, Search, Filter, Trash2, CreditCard, AlertCircle } from "lucide-react";
import "../../styles/dashboard.css";

const BuyerDashboard = ({ activeTab }) => {
    const [products, setProducts] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        pending_deliveries: 0,
        delivered_count: 0,
        total_spent: 0
    });
    const [filters, setFilters] = useState({ search: "" });
    const [cart, setCart] = useState(null); // Simple one-item cart
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMyOrders();
        fetchStats();
        // Load cart from local storage
        const savedCart = localStorage.getItem("buyer_cart");
        if (savedCart) setCart(JSON.parse(savedCart));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "products") fetchProducts();
    }, [activeTab, filters]);


    const fetchProducts = async () => {
        try {
            let url = "market/products/";
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            if (params.toString()) url += `?${params.toString()}`;
            
            const res = await api.get(url);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const res = await api.get("market/orders/");
            setMyOrders(res.data);
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
        const qty = prompt(`How many kg of ${product.name} would you like?`, "1");
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
            alert("Error placing order");
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

    if (activeTab === "dashboard") {
        const statCards = [
            { label: "My Orders", value: stats.total_orders, icon: <ShoppingCart />, color: "blue" },
            { label: "On The Way", value: stats.pending_deliveries, icon: <Truck />, color: "yellow" },
            { label: "Delivered", value: stats.delivered_count, icon: <CheckCircle />, color: "green" },
            { label: "Total Spent", value: `${stats.total_spent} DA`, icon: <CreditCard />, color: "purple" }
        ];

        return (
            <div className="buyer-dashboard-home animate-in">
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
                            <h3>Marketplace Highlights</h3>
                            <button className="text-btn">View All</button>
                        </div>
                        <div className="grid-list-mini">
                            {products.slice(0, 4).map(p => (
                                <div key={p.id} className="mini-item-card">
                                    <div className="item-img">{p.name[0]}</div>
                                    <div className="item-details">
                                        <strong>{p.name}</strong>
                                        <span>{p.price_per_kg} DA/kg</span>
                                    </div>
                                    <button className="btn-icon" onClick={() => addToCart(p)}>+</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel">
                        <div className="panel-header">
                            <h3>Active Tracking</h3>
                        </div>
                        <div className="mini-list">
                            {myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status)).slice(0, 3).map(o => (
                                <div key={o.id} className="mini-item">
                                    <div className="item-main">
                                        <strong>Order #{o.id}</strong>
                                        <span className={`status-pill ${o.status.toLowerCase()}`}>{o.status}</span>
                                    </div>
                                    <Truck size={16} color="#6b7280" />
                                </div>
                            ))}
                            {myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status)).length === 0 && <p className="empty-text">No active deliveries.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "products") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header-row">
                    <h2>Fruit & Vegetable Marketplace</h2>
                    <div className="filter-bar">
                        <div className="search-input">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="product-marketplace-grid mt-2">
                    {products.map(p => (
                        <div key={p.id} className="product-card-premium">
                            <div className="product-icon-box">{p.name[0]}</div>
                            <div className="product-info">
                                <h3>{p.name}</h3>
                                <p className="farmer-name">By {p.farmer_name}</p>
                                <div className="price-tag">{p.price_per_kg} DA/kg</div>
                                <p className="stock-info">{p.quantity_available}kg available</p>
                            </div>
                            <button className="btn-buy-now" onClick={() => addToCart(p)}>Add to Cart</button>
                        </div>
                    ))}
                    {products.length === 0 && <p className="empty-state">No products found matching your filters.</p>}
                </div>
            </div>
        );
    }

    if (activeTab === "cart") {
        return (
            <div className="glass-panel animate-in max-600">
                <div className="section-header">
                    <h2><ShoppingCart size={24} /> My Cart</h2>
                    <p>Confirm your selection before placing the order</p>
                </div>
                
                {cart ? (
                    <div className="cart-checkout-card">
                        <div className="cart-item-info">
                            <div className="item-icon-lg">{cart.name[0]}</div>
                            <div className="item-text">
                                <h3>{cart.name}</h3>
                                <p>From: {cart.farmer_name}</p>
                                <div className="checkout-badge">{cart.quantity}kg</div>
                            </div>
                            <button className="btn-delete" onClick={removeFromCart}><Trash2 size={20} /></button>
                        </div>
                        <div className="checkout-summary">
                            <div className="summary-row">
                                <span>Unit Price</span>
                                <span>{cart.price_per_kg} DA/kg</span>
                            </div>
                            <div className="summary-row">
                                <span>Weight</span>
                                <span>{cart.quantity} kg</span>
                            </div>
                            <div className="summary-row total">
                                <span>Order Total</span>
                                <span>{cart.totalPrice} DA</span>
                            </div>
                        </div>
                        <button 
                            className="btn-primary-lg" 
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Confirm & Place Order"}
                        </button>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <ShoppingCart size={64} color="#e5e7eb" />
                        <p>Your cart is empty. Browse the marketplace to add items.</p>
                        <button className="btn-outline" onClick={() => window.location.hash = "products"}>Go to Marketplace</button>
                    </div>
                )}
            </div>
        );
    }

    if (activeTab === "orders") {
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>My Purchases</h2>
                    <p>History of all your orders</p>
                </div>
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Farmer</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map(o => (
                                <tr key={o.id}>
                                    <td>#{o.id}</td>
                                    <td>{o.product_name}</td>
                                    <td>{o.farmer_name}</td>
                                    <td>{o.quantity}kg</td>
                                    <td><strong>{o.total_price} DA</strong></td>
                                    <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                                    <td>
                                        {o.status === 'PENDING' ? (
                                            <button className="btn-danger-sm" onClick={() => handleCancelOrder(o.id)}>Cancel</button>
                                        ) : (
                                            <span className="text-muted">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (activeTab === "tracking") {
        const activeTracking = myOrders.filter(o => ['ACCEPTED', 'IN_TRANSIT'].includes(o.status));
        return (
            <div className="glass-panel animate-in">
                <div className="section-header">
                    <h2>Track Your Deliveries</h2>
                    <p>Real-time updates on your fresh produce</p>
                </div>
                <div className="grid-list">
                    {activeTracking.map(o => (
                        <div key={o.id} className="card-item tracking-card">
                            <div className="card-header">
                                <h3>Order #{o.id}</h3>
                                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                            </div>
                            <div className="tracking-info">
                                <div className="info-row">
                                    <Truck size={18} />
                                    <span>Transporter: {o.transporter_name || "Finding Transporter..."}</span>
                                </div>
                                <div className="info-row">
                                    <ShoppingCart size={18} />
                                    <span>Status: {o.delivery_status || "Pending Acceptance"}</span>
                                </div>
                            </div>
                            <div className="progress-track-container">
                                <div className="track-step active">Ordered</div>
                                <div className={`track-line ${o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}>Accepted</div>
                                <div className={`track-line ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'IN_TRANSIT' || o.status === 'DELIVERED' ? 'active' : ''}`}>In Transit</div>
                                <div className={`track-line ${o.status === 'DELIVERED' ? 'active' : ''}`}></div>
                                <div className={`track-step ${o.status === 'DELIVERED' ? 'active' : ''}`}>Delivered</div>
                            </div>
                        </div>
                    ))}
                    {activeTracking.length === 0 && (
                        <div className="empty-state">
                            <Truck size={48} color="#e5e7eb" />
                            <p>No active deliveries to track right now.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (activeTab === "complaints") {
        return (
            <div className="glass-panel animate-in max-600">
                <div className="section-header">
                    <h2>Submit a Complaint</h2>
                    <p>Report issues with orders or delivery quality</p>
                </div>
                <form className="complaint-form" onSubmit={(e) => { e.preventDefault(); alert("Complaint logged for review."); }}>
                    <div className="form-group">
                        <label>Reason for Complaint</label>
                        <select>
                            <option>Late Delivery</option>
                            <option>Poor Product Quality</option>
                            <option>Incorrect Quantity</option>
                            <option>Pricing Issue</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Order ID</label>
                        <input type="text" placeholder="e.g. #15" />
                    </div>
                    <div className="form-group">
                        <label>Details</label>
                        <textarea rows="4" placeholder="Briefly describe the issue..."></textarea>
                    </div>
                    <button type="submit" className="btn-danger">Report Issue</button>
                </form>
            </div>
        );
    }

    return null;
};

export default BuyerDashboard;