import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend
} from 'recharts';
import api from '../../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShoppingBag, TrendingUp, Star, Package, AlertCircle, Download } from 'lucide-react';

const COLORS = ['#1A3A34', '#2D6A4F', '#40916C', '#52B788', '#74C69D'];

const FarmerStatistics = () => {
    const [stats, setStats] = useState({
        top_selling: [],
        weekly_sales: [],
        top_rated: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const generatePDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();
        
        // Add Header
        doc.setFontSize(20);
        doc.setTextColor(26, 58, 52); // #1A3A34
        doc.text("Farmer Business Insights Report", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${timestamp}`, 14, 30);
        doc.text("Personal Performance Data", 14, 35);
        
        let currentY = 45;

        // Table 1: Top Selling
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("1. Best Selling Products", 14, currentY);
        autoTable(doc, {
            startY: currentY + 5,
            head: [['Product Name', 'Total Sales Volume']],
            body: stats.top_selling.map(d => [d.name, d.value]),
            theme: 'striped',
            headStyles: { fillColor: [26, 58, 52] }
        });
        currentY = doc.lastAutoTable.finalY + 15;

        // Table 2: Weekly Sales
        doc.text("2. Weekly Sales Performance", 14, currentY);
        autoTable(doc, {
            startY: currentY + 5,
            head: [['Day', 'Quantity Sold']],
            body: stats.weekly_sales.map(d => [d.name, d.value]),
            theme: 'striped',
            headStyles: { fillColor: [45, 106, 79] }
        });
        currentY = doc.lastAutoTable.finalY + 15;

        // Table 3: Product Ratings
        doc.text("3. Customer Satisfaction (Ratings)", 14, currentY);
        autoTable(doc, {
            startY: currentY + 5,
            head: [['Product Name', 'Average Rating']],
            body: stats.top_rated.map(d => [d.name, `${d.rating} / 5.0`]),
            theme: 'striped',
            headStyles: { fillColor: [64, 145, 108] }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount} - AgriGov Farmer Portal`, 105, 290, { align: 'center' });
        }

        doc.save(`Farmer_Stats_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('setistics/farmer-stats/');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching farmer stats:", err);
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
            <header className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-h1 text-h1 text-on-surface mb-xs">Business Insights</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Track your sales performance and product ratings.</p>
                </div>
                <button 
                    onClick={generatePDF}
                    className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-button text-button hover:bg-primary/90 transition-all shadow-md active:scale-95"
                >
                    <Download size={20} />
                    Download Report
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
                {/* 1. Pie Chart - Best 5 Products Sold */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[450px]">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Top 5 Best Selling Products</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Total quantity sold per product.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {stats.top_selling.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.top_selling}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.top_selling.map((entry, index) => (
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
                                <p>No sales data yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Bar Chart - Sales this week */}
                <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[450px]">
                    <div className="flex items-center gap-3 mb-lg">
                        <div className="bg-secondary-container/30 p-2 rounded-lg text-secondary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-h3 text-h3 text-on-surface">Weekly Sales Volume</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Quantity sold this week.</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.weekly_sales} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                                <XAxis dataKey="name" tick={{ fill: '#414846', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#414846', fontSize: 11 }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #c1c8c5'
                                    }}
                                />
                                <Bar dataKey="value" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            {/* 3. Horizontal Bar Chart (Right to Left / Left to Right) - Most Product Rated */}
            <section className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(26,58,52,0.05)] border border-outline-variant/30 h-[450px]">
                <div className="flex items-center gap-3 mb-lg">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <Star size={24} />
                    </div>
                    <div>
                        <h3 className="font-h3 text-h3 text-on-surface">Product Ratings Overview</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Average customer feedback per product.</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {stats.top_rated.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.top_rated}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 40, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1e3e4" />
                                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#414846', fontSize: 11 }} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tick={{ fill: '#414846', fontSize: 11 }}
                                    width={100}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #c1c8c5'
                                    }}
                                />
                                <Bar dataKey="rating" radius={[0, 4, 4, 0]}>
                                    {stats.top_rated.map((entry, index) => (
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
    );
};

export default FarmerStatistics;
