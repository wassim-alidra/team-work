import React from 'react';
import { X, MapPin, Phone, User, Package, Star } from 'lucide-react';
import './ProductPurchaseModal.css'; // Reuse the overlay styles

const ProductDetailsModal = ({ product, onClose }) => {
    if (!product) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="ppm-overlay" onClick={handleOverlayClick} style={{ zIndex: 1000 }}>
            <div className="ppm-modal" style={{ maxWidth: '500px' }}>
                <div className="ppm-header">
                    <h2>Product Details</h2>
                    <button className="bg-white text-red-600 hover:text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="ppm-content" style={{ padding: '20px' }}>
                    <div className="flex flex-col gap-6">
                        {/* Product Info */}
                        <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 rounded-lg bg-surface-variant flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/30">
                                {product.catalog_image ? (
                                    <img src={product.catalog_image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-primary font-bold">{product.name?.[0] || 'P'}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-on-surface mb-1">{product.name}</h3>
                                <p className="text-primary font-bold text-lg mb-2">{product.price_per_kg} DA <span className="text-sm font-normal text-outline">/ {product.catalog_unit || 'kg'}</span></p>
                                
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase border ${
                                    product.quality_grade === 'HIGH' ? 'bg-green-50 text-green-700 border-green-200' :
                                    product.quality_grade === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {product.quality_grade || 'HIGH'} Quality
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30">
                                <h4 className="font-bold text-on-surface flex items-center gap-2 mb-2 text-sm">
                                    <Package size={16} className="text-primary" /> Description
                                </h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Seller Details */}
                        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30">
                            <h4 className="font-bold text-on-surface flex items-center gap-2 mb-4 text-sm border-b border-outline-variant/20 pb-2">
                                <User size={16} className="text-primary" /> Seller Information
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-outline font-medium uppercase tracking-wider">Farmer</p>
                                        <p className="text-sm font-bold text-on-surface">{product.farmer_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-outline font-medium uppercase tracking-wider">Phone Number</p>
                                        <p className="text-sm font-bold text-on-surface">{product.farmer_phone || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-outline font-medium uppercase tracking-wider">Location</p>
                                        <p className="text-sm font-bold text-on-surface">
                                            {product.farm_wilaya ? `${product.farm_wilaya}` : 'Unknown'} 
                                            {product.farm_name ? ` • ${product.farm_name}` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <Star size={14} className="fill-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-outline font-medium uppercase tracking-wider">Rating</p>
                                        <p className="text-sm font-bold text-on-surface">
                                            {product.avg_rating ? `${Number(product.avg_rating).toFixed(1)} / 5.0` : 'No ratings yet'}
                                            <span className="text-xs font-normal text-outline ml-1">({product.rating_count || 0} reviews)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
