import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Check, Loader2, Minus, Plus } from 'lucide-react';
import './ProductPurchaseModal.css';
import api from '../api/axios';

const ProductPurchaseModal = ({ product, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const totalPrice = (product.price_per_kg * quantity).toFixed(2);

    const handleConfirm = async () => {
        if (quantity <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }
        if (quantity > product.quantity_available) {
            setError(`Only ${product.quantity_available} available.`);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post("market/orders/", {
                product: product.id,
                quantity: quantity,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.quantity || err.response?.data?.detail || "Error placing order. Please try again.";
            setError(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !loading) onClose();
    };

    if (!product) return null;

    return (
        <div className="ppm-overlay" onClick={handleOverlayClick}>
            <div className="ppm-modal">
                <div className="ppm-header">
                    <h2>Confirm Purchase</h2>
                   <button className="bg-white text-red-600 hover:text-red-600 hover:bg-red-100 p-1 rounded-full transition-colors" onClick={onClose} disabled={loading}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                </div>

                {success ? (
                    <div className="ppm-success-state">
                        <div className="ppm-success-icon">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <h2>Order Placed!</h2>
                        <p>Your order for <strong>{quantity} {product.catalog_unit || 'kg'}</strong> of <strong>{product.name}</strong> has been successfully created.</p>
                    </div>
                ) : (
                    <div className="ppm-content">
                        <div className="ppm-product-card">
                            <div className="ppm-img-container">
                                {product.catalog_image ? (
                                    <img src={product.catalog_image} alt={product.name} />
                                ) : (
                                    product.name?.[0] || 'P'
                                )}
                            </div>
                            <div className="ppm-product-info">
                                <h3>{product.name}</h3>
                                <div className="ppm-price-tag">
                                    Price: <strong>{product.price_per_kg} DA</strong> / {product.catalog_unit || 'kg'}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">{product.quantity_available} {product.catalog_unit || ' kg'} available</div>
                                <div className="text-xs text-slate-400 mt-1">Seller: {product.farmer_name}</div>
                            </div>
                        </div>

                        <div className="ppm-form-group">
                            <label className="ppm-label">Select Quantity</label>
                            <div className="ppm-qty-control">
                                <div className="ppm-qty-input-wrapper">
                                    <button
                                        className="ppm-qty-btn"
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        disabled={quantity <= 1 || loading}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <input
                                        type="number"
                                        className="ppm-qty-input"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                        min="1"
                                        max={product.quantity_available}
                                        disabled={loading}
                                    />
                                    <button
                                        className="ppm-qty-btn"
                                        onClick={() => setQuantity(prev => Math.min(product.quantity_available, prev + 1))}
                                        disabled={quantity >= product.quantity_available || loading}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                               
                            </div>
                            {error && <div className="text-red-500 text-sm mt-2 font-medium">{error}</div>}
                        </div>

                        <div className="ppm-summary">
                            <div className="ppm-summary-row">
                                <span className="ppm-total-label">Total Amount</span>
                                <span className="ppm-total-value">{totalPrice} DA</span>
                            </div>
                        </div>

                        <button
                            className="ppm-confirm-btn"
                            onClick={handleConfirm}
                            disabled={loading || quantity <= 0}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <ShoppingBag size={20} />
                            )}
                            {loading ? "Processing..." : "Confirme Order"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPurchaseModal;
