import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Download, User, Phone, MapPin, Package, CreditCard, Truck, Calendar } from "lucide-react";

const OrderDetailsModal = ({ order, isOpen, onClose, userRole }) => {
    if (!isOpen || !order) return null;

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(26, 58, 52); // Primary color
        doc.text("Order Receipt", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Order ID: #${order.id}`, 105, 30, { align: "center" });
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 105, 37, { align: "center" });

        // Content
        autoTable(doc, {
            startY: 50,
            head: [['Detail', 'Information']],
            body: [
                ['Product', order.product_name],
                ['Quantity', `${order.quantity} ${order.product_unit || 'kg'}`],
                ['Total Price', `${order.total_price} DA`],
                ['Order Status', order.status],
                userRole !== 'FARMER' ? ['Farmer Name', order.farmer_name] : null,
                userRole !== 'FARMER' ? ['Farmer Phone', order.farmer_phone || 'N/A'] : null,
                userRole !== 'BUYER' ? ['Buyer Name', order.buyer_name] : null,
                userRole !== 'BUYER' ? ['Buyer Phone', order.buyer_phone || 'N/A'] : null,
                userRole !== 'TRANSPORTER' ? ['Transporter', order.transporter_name || 'N/A'] : null,
                userRole !== 'TRANSPORTER' ? ['Transporter Phone', order.transporter_phone || 'N/A'] : null,
            ].filter(Boolean),
            theme: 'striped',
            headStyles: { fillColor: [26, 58, 52] },
        });

        // Footer
        const finalY = doc.lastAutoTable?.finalY || 150;
        doc.setFontSize(10);
        doc.text("Thank you for using AgriGov!", 105, finalY + 20, { align: "center" });

        doc.save(`Order_${order.id}_Details.pdf`);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between text-on-primary">
                    <div className="flex items-center gap-3">
                        <Package className="w-6 h-6" />
                        <h2 className="text-xl font-bold font-h2">Order Details #{order.id}</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Order Info */}
                        <section className="space-y-4">
                            <h3 className="font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                                <Package className="w-4 h-4" /> Product Info
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider">Product</p>
                                    <p className="font-bold text-on-surface">{order.product_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider">Quantity</p>
                                        <p className="font-medium">{order.quantity} {order.product_unit || 'kg'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider">Total Price</p>
                                        <p className="font-bold text-primary">{order.total_price} DA</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider">Current Status</p>
                                    <span className="inline-flex mt-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase">
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Contacts */}
                        <section className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="font-bold text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                                    <User className="w-4 h-4" /> Contact Information
                                </h3>
                                
                                {/* Farmer (Hidden for Farmer) */}
                                {userRole !== 'FARMER' && (
                                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Farmer (Seller)</p>
                                        <div className="space-y-2">
                                            <p className="flex items-center gap-2 font-medium">
                                                <User className="w-4 h-4 text-on-surface-variant" /> {order.farmer_name}
                                            </p>
                                            <p className="flex items-center gap-2 text-on-surface-variant">
                                                <Phone className="w-4 h-4" /> {order.farmer_phone || 'Not available'}
                                            </p>
                                            <p className="flex items-center gap-2 text-on-surface-variant text-sm">
                                                <MapPin className="w-4 h-4" /> {order.farmer_wilaya || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Transporter (Hidden for Transporter) */}
                                {userRole !== 'TRANSPORTER' && (
                                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Transporter (Delivery)</p>
                                        {order.transporter_name && order.transporter_name !== 'N/A' ? (
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-2 font-medium">
                                                    <Truck className="w-4 h-4 text-on-surface-variant" /> {order.transporter_name}
                                                </p>
                                                <p className="flex items-center gap-2 text-on-surface-variant">
                                                    <Phone className="w-4 h-4" /> {order.transporter_phone || 'Not available'}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-on-surface-variant italic">Transporter will be assigned soon...</p>
                                        )}
                                    </div>
                                )}

                                {/* Buyer */}
                                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Buyer (Customer)</p>
                                    <div className="space-y-2">
                                        <p className="flex items-center gap-2 font-medium">
                                            <User className="w-4 h-4 text-on-surface-variant" /> {order.buyer_name}
                                        </p>
                                        <p className="flex items-center gap-2 text-on-surface-variant">
                                            <Phone className="w-4 h-4" /> {order.buyer_phone || 'Not available'}
                                        </p>
                                        <p className="flex items-center gap-2 text-on-surface-variant text-sm">
                                            <MapPin className="w-4 h-4" /> {order.buyer_wilaya || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-surface-container-low border-t border-outline-variant/30 flex justify-between gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold border border-outline hover:bg-surface-container transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={generatePDF}
                        className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
