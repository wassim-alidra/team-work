import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { Truck, ClipboardList, CheckCircle, DollarSign, Save, Package, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import RouteMapModal from "./RouteMapModal";
import "../../styles/dashboard.css";
import Pagination from "../common/Pagination";

const TransporterDashboard = ({ activeTab }) => {
    const { user, setUser } = useContext(AuthContext);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [availableOrdersCount, setAvailableOrdersCount] = useState(0);
    const [availableOrdersPage, setAvailableOrdersPage] = useState(1);

    const [myDeliveries, setMyDeliveries] = useState([]);
    const [myDeliveriesCount, setMyDeliveriesCount] = useState(0);
    const [myDeliveriesPage, setMyDeliveriesPage] = useState(1);
    const [statusPage, setStatusPage] = useState(1);
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, completed_count: 0, history: [] });
    const [profileForm, setProfileForm] = useState({
        vehicle_type: "",
        license_plate: "",
        capacity: 0
    });
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (activeTab === "dashboard" || activeTab === "requests") fetchAvailableOrders(availableOrdersPage);
        if (activeTab === "dashboard" || activeTab === "status") fetchMyDeliveries(null, myDeliveriesPage);
        if (activeTab === "history") fetchMyDeliveries("DELIVERED", myDeliveriesPage);
        if (activeTab === "earnings") fetchEarnings();
        if (activeTab === "profile") {
            setProfileForm({
                vehicle_type: user.profile?.vehicle_type || "",
                license_plate: user.profile?.license_plate || "",
                capacity: user.profile?.capacity || 0
            });
        }
    }, [activeTab, availableOrdersPage, myDeliveriesPage]);

    const fetchAvailableOrders = async (page = 1) => {
        try {
            const res = await api.get(`market/deliveries/available_orders/?page=${page}`);
            if (res.data.results) {
                setAvailableOrders(res.data.results);
                setAvailableOrdersCount(res.data.count);
            } else {
                setAvailableOrders(res.data);
                setAvailableOrdersCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching available orders:", err);
        }
    };

    const fetchMyDeliveries = async (statusFilter = null, page = 1) => {
        try {
            let url = `market/deliveries/?page=${page}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            const res = await api.get(url);
            if (res.data.results) {
                setMyDeliveries(res.data.results);
                setMyDeliveriesCount(res.data.count);
            } else {
                setMyDeliveries(res.data);
                setMyDeliveriesCount(res.data.length);
            }
        } catch (err) {
            console.error("Error fetching deliveries:", err);
        }
    };

    const fetchEarnings = async () => {
        try {
            const res = await api.get("market/deliveries/earnings/");
            setEarningsData(res.data);
        } catch (err) {
            console.error("Error fetching earnings:", err);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await api.post("market/deliveries/", { order: orderId });
            alert("Delivery accepted!");
            fetchAvailableOrders();
        } catch (err) {
            alert("Error accepting delivery");
        }
    };

    const handleUpdateStatus = async (deliveryId, status) => {
        try {
            await api.patch(`market/deliveries/${deliveryId}/`, { status });
            fetchMyDeliveries();
            if (status === "DELIVERED") fetchEarnings();
        } catch (err) {
            alert("Error updating status");
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.patch("users/me/", profileForm);
            setUser({ ...user, profile: { ...user.profile, ...res.data } });
            alert("Profile updated successfully!");
        } catch (err) {
            alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────── DASHBOARD TAB ───────────────────
    if (activeTab === "dashboard") {
        const stats = [
            { label: "Available", value: availableOrders.length, icon: <ClipboardList />, color: "bg-primary text-on-primary" },
            { label: "Active", value: myDeliveries.filter(d => d.status !== "DELIVERED").length, icon: <Truck />, color: "bg-surface-container-highest text-on-surface" },
            { label: "Completed", value: myDeliveries.filter(d => d.status === "DELIVERED").length, icon: <CheckCircle />, color: "bg-secondary-container text-on-secondary-container" },
            { label: "Earnings", value: `${earningsData.total_earnings || 0} DA`, icon: <DollarSign />, color: "bg-tertiary-container text-on-tertiary-container" }
        ];

        return (
            <div className="max-w-container-max mx-auto space-y-xl animate-in">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                    {stats.map((s, i) => (
                        <div key={i} className={`${s.color} rounded-xl p-md shadow-[0_4px_20px_rgba(26,58,52,0.05)] flex flex-col justify-between min-h-[140px]`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-full bg-white/20">{s.icon}</div>
                                <span className="font-label-caps text-label-caps uppercase opacity-90">{s.label}</span>
                            </div>
                            <h3 className="font-h1 text-h2 font-bold">{s.value}</h3>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
                    <div className="md:col-span-8 flex flex-col gap-md">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mt-sm">
                            <div className="bg-surface rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20">
                                <div className="flex items-center justify-between mb-md">
                                    <h3 className="font-h3 text-[18px] text-on-surface">Active Deliveries</h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {myDeliveries.filter(d => d.status !== "DELIVERED").slice(0, 3).map(d => (
                                        <div key={d.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30 flex flex-col gap-md mb-4 border-b border-outline-variant/20 pb-4">
                                            <div className="flex items-center justify-between">
                                                <strong>Delivery #{d.id}</strong>
                                                <span className={`bg-secondary-fixed text-on-secondary-fixed-variant px-sm py-xs rounded-full font-label-caps text-label-caps inline-flex items-center gap-xs`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {d.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {myDeliveries.filter(d => d.status !== "DELIVERED").length === 0 && (
                                        <p className="font-body-md text-on-surface-variant p-4 text-center bg-surface-variant/30 rounded-lg">No active missions.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-surface rounded-xl p-md shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col border-l-4 border-l-primary-fixed">
                                <div className="flex items-center justify-between mb-md">
                                    <h3 className="font-h3 text-[18px] text-on-surface flex items-center gap-sm">
                                        <Truck className="text-primary" size={20} />
                                        Ready for Pickup
                                    </h3>
                                    <button className="text-primary font-button text-body-sm hover:underline" onClick={() => fetchAvailableOrders()}>Refresh</button>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {availableOrders.slice(0, 3).map(o => (
                                        <div key={o.id} className="flex flex-col gap-sm border-b border-outline-variant/20 pb-4">
                                            <div className="flex items-center justify-between text-on-surface font-body-md text-body-md">
                                                <strong>Order #{o.id}</strong>
                                                <span>{o.product_name}</span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded border border-primary/20 hover:bg-primary/20 transition-colors" onClick={() => setSelectedOrder(o)}>
                                                    <MapPin size={14} /> View
                                                </button>
                                                <button className="flex-1 bg-secondary-container text-on-secondary-container py-2 rounded hover:bg-secondary-fixed transition-colors" onClick={() => handleAccept(o.id)}>
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {availableOrders.length === 0 && (
                                        <p className="font-body-md text-on-surface-variant p-4 text-center bg-surface-variant/30 rounded-lg">No delivery requests available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col gap-lg">
                        <div className="bg-surface rounded-xl p-lg shadow-[0px_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20">
                            <h3 className="font-h3 text-[18px] text-on-surface mb-md">Finance Summary</h3>
                            <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Total Earnings</p>
                            <div className="flex items-end gap-sm mb-md">
                                <h2 className="font-h1 text-[48px] text-on-surface leading-none">{earningsData.total_earnings || 0} DA</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-sm pt-md border-t border-outline-variant/20">
                                <div>
                                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Missions</p>
                                    <p className="font-body-md text-body-md text-on-surface font-semibold">{earningsData.completed_count || 0} Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedOrder && (
                    <RouteMapModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onAccept={async (orderId) => { await handleAccept(orderId); setSelectedOrder(null); }}
                    />
                )}
            </div>
        );
    }

    if (activeTab === "requests") {
        return (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Available Delivery Requests</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Missions waiting for a transporter</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableOrders.map(o => (
                        <div key={o.id} className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full font-label-caps text-label-caps">Available</span>
                                <h3 className="font-h3 text-h3 text-on-surface">Order #{o.id}</h3>
                            </div>
                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                                    <Package size={16} />
                                    <span>{o.product_name} — {o.quantity} kg</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-body-sm text-outline">Value:</span>
                                    <span className="font-body-md text-secondary font-bold">{o.total_price} DA</span>
                                </div>
                            </div>
                            <div className="bg-surface-variant/30 p-3 rounded-lg mb-6 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                    <span className="font-body-sm">{o.farmer_wilaya || "Farmer"}</span>
                                </div>
                                <div className="w-[2px] h-4 bg-outline/30 ml-1"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="font-body-sm">{o.buyer_wilaya || "Buyer"}</span>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-auto">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-surface text-on-surface py-2 rounded-lg border border-outline-variant/30 hover:bg-surface-variant transition-colors" onClick={() => setSelectedOrder(o)}>
                                    <MapPin size={16} /> View Details
                                </button>
                                <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg hover:bg-tertiary transition-colors flex items-center justify-center gap-2" onClick={() => handleAccept(o.id)}>
                                    <CheckCircle size={16} /> Accept
                                </button>
                            </div>
                        </div>
                    ))}
                    {availableOrders.length === 0 && (
                        <div className="col-span-full p-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/20">No requests available at the moment.</div>
                    )}
                </div>
                <Pagination 
                    currentPage={availableOrdersPage}
                    totalCount={availableOrdersCount}
                    pageSize={10}
                    onPageChange={setAvailableOrdersPage}
                />
                
                {selectedOrder && (
                    <RouteMapModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onAccept={async (orderId) => { await handleAccept(orderId); setSelectedOrder(null); }}
                    />
                )}
            </div>
        );
    }

    if (activeTab === "status") {
        const active = myDeliveries.filter(d => d.status !== "DELIVERED");
        const paginatedActive = active.slice((statusPage - 1) * 10, statusPage * 10);
        return (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Update Delivery Status</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your active missions</p>
                </div>
                <div className="flex flex-col gap-6">
                    {paginatedActive.map(d => (
                        <div key={d.id} className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-h3 text-h3 text-on-surface">Delivery #{d.id}</h3>
                                <span className={`px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-caps text-label-caps rounded-full flex items-center gap-1`}>
                                    <Truck size={16} /> {d.status}
                                </span>
                            </div>
                            
                            <div className="mt-4 relative mb-4">
                                <div className="flex justify-between text-label-caps font-label-caps text-outline mb-2 relative z-10">
                                    <span className={['ASSIGNED','IN_TRANSIT','DELIVERED'].includes(d.status) ? "text-primary font-bold" : ""}>Assigned</span>
                                    <span className={['IN_TRANSIT','DELIVERED'].includes(d.status) ? "text-primary font-bold" : ""}>In Transit</span>
                                    <span className={['DELIVERED'].includes(d.status) ? "text-primary font-bold" : ""}>Delivered</span>
                                </div>
                                <div className="w-full bg-surface-variant rounded-full h-2 relative">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                                        style={{ 
                                            width: d.status === 'DELIVERED' ? '100%' : d.status === 'IN_TRANSIT' ? '50%' : '10%' 
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-outline-variant/20 pt-4">
                                {d.status === "ASSIGNED" ? (
                                    <button className="bg-secondary text-on-secondary px-6 py-2 rounded-lg font-button hover:bg-secondary-container hover:text-on-secondary-container transition-colors" onClick={() => handleUpdateStatus(d.id, "IN_TRANSIT")}>
                                        Start Transit
                                    </button>
                                ) : (
                                    <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-button hover:bg-tertiary transition-colors" onClick={() => handleUpdateStatus(d.id, "DELIVERED")}>
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {active.length === 0 && (
                        <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center text-center gap-4 text-on-surface-variant">
                            <Truck size={48} className="text-outline-variant/50" />
                            <p className="font-body-lg">No active deliveries to update.</p>
                        </div>
                    )}
                </div>
                {active.length > 0 && (
                    <Pagination 
                        currentPage={statusPage}
                        totalCount={active.length}
                        pageSize={10}
                        onPageChange={setStatusPage}
                    />
                )}
            </div>
        );
    }

    if (activeTab === "history") {
        const history = myDeliveries.filter(d => d.status === "DELIVERED");
        return (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Delivery History</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Your completed missions</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Delivery ID</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Order</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Date</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Fee</th>
                                    <th className="p-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {history.map(d => (
                                    <tr key={d.id} className="hover:bg-surface-bright transition-colors">
                                        <td className="p-4 font-body-md text-on-surface">#{d.id}</td>
                                        <td className="p-4 font-body-md text-on-surface">Order #{d.order}</td>
                                        <td className="p-4 font-body-md text-on-surface-variant">{new Date(d.delivery_date).toLocaleDateString()}</td>
                                        <td className="p-4 font-body-md font-bold text-primary">{d.delivery_fee} DA</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-caps text-xs">Completed</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {history.length === 0 && <p className="text-center text-outline p-8">No history found.</p>}
                </div>
                <Pagination 
                    currentPage={myDeliveriesPage}
                    totalCount={myDeliveriesCount}
                    pageSize={10}
                    onPageChange={setMyDeliveriesPage}
                />
            </div>
        );
    }

    if (activeTab === "earnings") {
        return (
            <div className="max-w-container-max mx-auto space-y-md animate-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                            <DollarSign size={32} />
                        </div>
                        <div>
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Earnings</span>
                            <h2 className="font-h1 text-[40px] text-on-surface leading-none mt-1">{earningsData.total_earnings} DA</h2>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Missions Completed</span>
                            <h2 className="font-h1 text-[40px] text-on-surface leading-none mt-1">{earningsData.completed_count}</h2>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20">
                    <h3 className="font-h3 text-h3 text-on-surface mb-6">Recent Payouts</h3>
                    <div className="flex flex-col gap-0">
                        {earningsData.history?.map(d => (
                            <div key={d.id} className="py-4 flex items-center justify-between border-b border-outline-variant/10 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <p className="font-body-md text-body-md text-on-surface font-medium">Delivery #{d.id}</p>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">Order #{d.order}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-body-md text-body-md text-primary font-semibold">+{d.delivery_fee} DA</p>
                                </div>
                            </div>
                        ))}
                        {(!earningsData.history || earningsData.history.length === 0) && (
                            <p className="text-center text-outline p-4">No recent payouts.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === "profile") {
        return (
            <div className="max-w-2xl mx-auto space-y-md animate-in">
                <div className="mb-6">
                    <h1 className="font-h1 text-h1 text-on-surface">Vehicle Profile</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your transport capabilities</p>
                </div>
                <form className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/20 flex flex-col gap-6" onSubmit={handleProfileUpdate}>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">Vehicle Type</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md"
                            value={profileForm.vehicle_type}
                            onChange={(e) => setProfileForm({ ...profileForm, vehicle_type: e.target.value })}
                            placeholder="e.g. Refrigerated Truck"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">License Plate</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md"
                            value={profileForm.license_plate}
                            onChange={(e) => setProfileForm({ ...profileForm, license_plate: e.target.value })}
                            placeholder="e.g. ABC-1234"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-label-caps text-label-caps text-on-surface uppercase">Capacity (Tons)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface focus:border-primary focus:ring-0 font-body-md"
                            value={profileForm.capacity}
                            onChange={(e) => setProfileForm({ ...profileForm, capacity: parseFloat(e.target.value) })}
                        />
                    </div>
                    <button type="submit" className="bg-primary text-on-primary py-3 rounded-xl font-button text-button hover:bg-tertiary transition-colors shadow-sm disabled:opacity-50 mt-4 flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? "Saving..." : <><Save size={20} /> Update Profile</>}
                    </button>
                </form>
            </div>
        );
    }

    return null;
};

export default TransporterDashboard;