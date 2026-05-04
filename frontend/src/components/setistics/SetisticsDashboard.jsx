import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend
} from 'recharts';
import api from '../../api/axios';
import { Users, Package, ShoppingBag, BarChart3, ChevronDown, Star } from 'lucide-react';

const COLORS = ['#1A3A34', '#2D6A4F', '#40916C', '#52B788', '#74C69D'];

const SetisticsDashboard = () => {
    const [farmersData, setFarmersData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [ratedFarmersData, setRatedFarmersData] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [weeklySalesData, setWeeklySalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [histogramLoading, setHistogramLoading] = useState(false);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [farmersRes, salesRes, productsRes, ratedRes] = await Promise.all([
                api.get('setistics/farmers-by-wilaya/'),
                api.get('setistics/top-selling-products/'),
                api.get('setistics/products-list/'),
                api.get('setistics/top-rated-farmers/')
            ]);
            setFarmersData(farmersRes.data);
            setSalesData(salesRes.data);
            setProducts(productsRes.data);
            setRatedFarmersData(ratedRes.data);
            
            if (productsRes.data.length > 0) {
                const firstProd = productsRes.data[0];
                setSelectedProduct(firstProd.id);
                fetchWeeklySales(firstProd.id);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklySales = async (productId) => {
        setHistogramLoading(true);
        try {
            const res = await api.get(`setistics/product-weekly-sales/?product_id=${productId}`);
            setWeeklySalesData(res.data);
        } catch (err) {
            console.error("Error fetching weekly sales:", err);
        } finally {
            setHistogramLoading(false);
        }
    };

    const handleProductChange = (e) => {
        const prodId = e.target.value;
        setSelectedProduct(prodId);
        fetchWeeklySales(prodId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-lg p-lg animate-in pb-xl">
            <header className="mb-xl">
                <h1 className="font-h1 text-h1 text-on-surface mb-xs">National Agricultural Statistics</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Comprehensive data analysis of farmers, sales, and product trends.</p>
            </header>

            {/* Row 1: Top Wilayas and Sales Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
                {/* Phase 1: Bar Chart - Farmers per Wilaya */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[450px]">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Top Wilayas by Farmer Count</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Registered farmers with approved farms.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={farmersData}
                                margin={{ top: 20, right: 30, left: -20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                                <XAxis 
                                    dataKey="wilaya" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    interval={0} 
                                    height={80}
                                    tick={{ fill: '#414846', fontSize: 11, fontFamily: 'Inter' }}
                                />
                                <YAxis tick={{ fill: '#414846', fontSize: 11, fontFamily: 'Inter' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #c1c8c5',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {farmersData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1A3A34' : '#2D6A4F'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Phase 2: Pie Chart - Most Selling Products */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[450px]">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-secondary-container/30 p-2 rounded-lg text-secondary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Product Sales Distribution</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Top selling products by quantity.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={salesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {salesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '8px', 
                                            border: '1px solid #c1c8c5'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant italic">
                                <Package size={48} className="mb-2 opacity-20" />
                                <p>No sales data available yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Row 2: Weekly Sales Analysis and Top Rated Farmers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {/* Phase 3: Histogram - Dynamic Product Weekly Sales */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[500px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="font-h3 text-h3 text-on-surface">Weekly Sales</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">Trends for specific products.</p>
                            </div>
                        </div>

                        <div className="relative min-w-[150px]">
                            <select 
                                value={selectedProduct}
                                onChange={handleProductChange}
                                className="w-full pl-3 pr-8 py-1.5 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="" disabled>Select product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative">
                        {histogramLoading && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        
                        {weeklySalesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={weeklySalesData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                                    <XAxis 
                                        dataKey="week" 
                                        tick={{ fill: '#414846', fontSize: 10, fontFamily: 'Inter' }}
                                        tickFormatter={(val) => `${new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`}
                                    />
                                    <YAxis tick={{ fill: '#414846', fontSize: 10, fontFamily: 'Inter' }} />
                                    <Tooltip 
                                        labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '8px', 
                                            border: '1px solid #c1c8c5'
                                        }}
                                    />
                                    <Bar dataKey="quantity" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant italic border-2 border-dashed border-outline-variant/30 rounded-xl">
                                <BarChart3 size={32} className="mb-2 opacity-20" />
                                <p className="text-xs">No sales recorded.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* New Phase: Bar Chart - Top Rated Farmers */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[500px]">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                            <Star size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Top Rated Farmers</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Average customer ratings.</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {ratedFarmersData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={ratedFarmersData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1e3e4" />
                                    <XAxis type="number" domain={[0, 5]} tick={{ fill: '#414846', fontSize: 11 }} />
                                    <YAxis 
                                        dataKey="username" 
                                        type="category" 
                                        tick={{ fill: '#414846', fontSize: 11 }}
                                        width={80}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '8px', 
                                            border: '1px solid #c1c8c5'
                                        }}
                                    />
                                    <Bar dataKey="rating" radius={[0, 4, 4, 0]}>
                                        {ratedFarmersData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant italic">
                                <Star size={48} className="mb-2 opacity-20" />
                                <p>No ratings available yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SetisticsDashboard;
