import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend, Sector
} from 'recharts';
import api from '../../api/axios';
import { BarChart2, TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';

const COLORS = ['#1A3A34', '#2D6A4F', '#40916C', '#52B788', '#74C69D'];

const SetisticsDashboard = () => {
    const [farmersData, setFarmersData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [farmersRes, salesRes] = await Promise.all([
                api.get('setistics/farmers-by-wilaya/'),
                api.get('setistics/top-selling-products/')
            ]);
            setFarmersData(farmersRes.data);
            setSalesData(salesRes.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {/* Phase 1: Bar Chart - Farmers per Wilaya */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-full">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Top 10 Wilayas by Farmer Count</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Registered farmers with approved farms.</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={farmersData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
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
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-full">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-secondary-container/30 p-2 rounded-lg text-secondary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Product Sales Distribution</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Top selling products by quantity (excluding cancelled orders).</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={salesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
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
        </div>
    );
};

export default SetisticsDashboard;
