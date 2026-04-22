import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/layout/DashboardLayout";
import { ArrowLeft, Search, Package, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import Pagination from "../components/common/Pagination";

/**
 * CategoryProductsPage component to show products (catalog items) belonging to an admin category.
 */
const CategoryProductsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [productsCount, setProductsCount] = useState(0);
    const [productsPage, setProductsPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData(productsPage);
    }, [id, productsPage]);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            // Fetch category details
            const catRes = await api.get(`market/categories/${id}/`);
            setCategory(catRes.data);

            // Fetch catalog items for this category
            const prodRes = await api.get(`market/catalog/?category=${id}&page=${page}`);
            if (prodRes.data.results) {
                setProducts(prodRes.data.results);
                setProductsCount(prodRes.data.count);
            } else {
                setProducts(prodRes.data);
                setProductsCount(prodRes.data.length);
            }
        } catch (err) {
            console.error("Error fetching category products:", err);
            setError("Failed to load products. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout activeTab="categories" setActiveTab={() => navigate("/dashboard")}>
            <div className="category-products-container animate-fade-in">
                
                {/* Header Section */}
                <div className="section-header-row mb-6">
                    <div className="header-left">
                        <button 
                            className="back-btn-modern" 
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft size={18} />
                            <span>Categories</span>
                        </button>
                        <div className="title-section mt-4">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                {loading ? "Loading..." : `${category?.name} Products`}
                                <span className="cat-count-badge">{filteredProducts.length}</span>
                            </h1>
                            <p className="text-gray-500 mt-1">Manage official regulated prices and products for this category</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="search-wrapper w-full md:max-w-md">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find a product..." 
                            className="search-input-premium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="product-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton-card glass-panel h-48"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="error-state glass-panel">
                        <AlertCircle size={40} className="text-red-500 mb-2" />
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button className="btn-retry mt-4" onClick={fetchData}>Try Again</button>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <div className="empty-icon-container">
                            <Package size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold mt-4">No products found</h3>
                        <p className="text-gray-500">There are no products listed in this category yet.</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card-saas glass-panel group">
                                {product.image && (
                                    <div className="catalog-product-image">
                                        <img src={product.image} alt={product.name} />
                                    </div>
                                )}
                                <div className="card-content">
                                    <div className="meta-row">
                                        <div className="product-type-badge">Official Listing</div>
                                        <div className="dot-menu-placeholder">
                                            <TrendingUp size={16} className="text-green-500" />
                                        </div>
                                    </div>
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="price-box">
                                        <div className="price-range">
                                            <span className="min-p">{product.min_price}</span>
                                            <span className="dash">—</span>
                                            <span className="max-p">{product.max_price}</span>
                                            <span className="currency">DA</span>
                                        </div>
                                        <div className="unit-label">per {product.unit || 'kg'}</div>
                                    </div>
                                    
                                    <div className="details-info mt-4">
                                        <div className="info-item">
                                            <span className="label">Last Updated:</span>
                                            <span className="value">{new Date(product.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Pagination 
                    currentPage={productsPage}
                    totalCount={productsCount}
                    pageSize={10}
                    onPageChange={setProductsPage}
                />
            </div>

            <style>{`
                .category-products-container {
                    padding: 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }

                .back-btn-modern {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748b;
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    transition: 0.2s;
                    cursor: pointer;
                }
                .back-btn-modern:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                    transform: translateX(-4px);
                }

                .cat-count-badge {
                    font-size: 0.9rem;
                    background: #dcfce7;
                    color: #166534;
                    padding: 0.2rem 0.75rem;
                    border-radius: 20px;
                    font-weight: 700;
                    border: 1px solid #bbf7d0;
                }

                .search-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    left: 1rem;
                    color: #94a3b8;
                }
                .search-input-premium {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 3rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 1rem;
                    outline: none;
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .search-input-premium:focus {
                    border-color: #2f8f3a;
                    box-shadow: 0 0 0 4px rgba(47, 143, 58, 0.1);
                    transform: translateY(-1px);
                }

                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .product-card-saas {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #f1f5f9;
                    position: relative;
                    overflow: hidden;
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                }
                .product-card-saas:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: #dcfce7;
                }

                .meta-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }
                .product-type-badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #94a3b8;
                    letter-spacing: 0.05em;
                }

                .product-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }

                .price-box {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 18px;
                    border: 1px solid #f1f5f9;
                }
                .price-range {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-weight: 800;
                    font-size: 1.35rem;
                    color: #0f172a;
                }
                .dash { color: #cbd5e1; font-weight: 400; }
                .currency { font-size: 0.85rem; color: #64748b; margin-left: 2px; }
                .unit-label {
                    margin-top: 2px;
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                }
                .label { color: #94a3b8; }
                .value { color: #475569; font-weight: 600; }

                /* States */
                .empty-state, .error-state {
                    padding: 5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .empty-icon-container {
                    width: 80px;
                    height: 80px;
                    background: #f8fafc;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .skeleton-card {
                    animation: skeleton-pulse 1.5s infinite ease-in-out;
                    border-radius: 24px;
                }
                @keyframes skeleton-pulse {
                    0% { background: #f1f5f9; }
                    50% { background: #e2e8f0; }
                    100% { background: #f1f5f9; }
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </DashboardLayout>
    );
};

export default CategoryProductsPage;
