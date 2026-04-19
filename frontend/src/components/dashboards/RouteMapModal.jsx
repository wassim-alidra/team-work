import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RouteMapModal.css";
import api from "../../api/axios";

// Fix Leaflet default marker icon paths in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom coloured dot markers
const createDotIcon = (color, label) =>
  new L.DivIcon({
    className: "",
    html: `
      <div style="position:relative;">
        <div style="
          width:18px;height:18px;border-radius:50%;
          background:${color};border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.5);
        "></div>
        <div style="
          position:absolute;top:22px;left:50%;transform:translateX(-50%);
          background:rgba(0,0,0,0.75);color:#fff;
          font-size:10px;font-weight:700;padding:2px 6px;
          border-radius:4px;white-space:nowrap;letter-spacing:0.04em;
        ">${label}</div>
      </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const farmerIcon = createDotIcon("#22c55e", "🌾 Farmer");
const buyerIcon  = createDotIcon("#3b82f6", "🛒 Buyer");

// Auto-zoom to fit route or markers
function AutoFitBounds({ routePolyline, farmerCoords, buyerCoords }) {
  const map = useMap();
  useEffect(() => {
    if (routePolyline && routePolyline.length > 0) {
      map.fitBounds(L.latLngBounds(routePolyline), { padding: [40, 40] });
    } else if (farmerCoords && buyerCoords) {
      map.fitBounds(L.latLngBounds([farmerCoords, buyerCoords]), { padding: [50, 50] });
    }
  }, [routePolyline, farmerCoords, buyerCoords, map]);
  return null;
}

/**
 * RouteMapModal
 * Props:
 *   order      — the order object (from available_orders API)
 *   onClose    — called when modal is dismissed
 *   onAccept   — called when transporter accepts the mission
 */
const RouteMapModal = ({ order, onClose, onAccept }) => {
  const [routePolyline, setRoutePolyline] = useState(null);
  const [farmerCoords, setFarmerCoords] = useState(null);
  const [buyerCoords,  setBuyerCoords]  = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [accepting, setAccepting] = useState(false);

  const defaultCenter = [28.0339, 1.6596]; // Algeria centre

  const fetchRoute = useCallback(async () => {
    if (!order?.farmer_wilaya || !order?.buyer_wilaya) {
      setError("Wilaya location data is missing for this order. Cannot calculate route.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.get("routing/calculate/", {
        params: {
          farmer_wilaya: order.farmer_wilaya,
          buyer_wilaya:  order.buyer_wilaya,
        },
      });

      const { distance_km, duration_mins, geometry, farmer_coords, buyer_coords } = res.data;

      setStats({ distance: distance_km, duration: duration_mins });
      setFarmerCoords([farmer_coords.lat, farmer_coords.lng]);
      setBuyerCoords([buyer_coords.lat,  buyer_coords.lng]);

      // ORS returns [Lng, Lat] → Leaflet needs [Lat, Lng]
      setRoutePolyline(geometry.map(([lng, lat]) => [lat, lng]));
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to calculate route. Check connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(order.id);
      onClose();
    } finally {
      setAccepting(false);
    }
  };

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!order) return null;

  return (
    <div className="rmap-overlay" onClick={handleOverlayClick}>
      <div className="rmap-modal">

        {/* ── Header ── */}
        <div className="rmap-header">
          <div className="rmap-header-left">
            <div className="rmap-header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </div>
            <div>
              <h2>Order #{order.id} — Route Details</h2>
              <p>Review the delivery route before accepting</p>
            </div>
          </div>
          <button className="rmap-close-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* ── Order Info Grid ── */}
        <div className="rmap-order-info">
          <div className="rmap-info-cell">
            <div className="cell-label">Product</div>
            <div className="cell-value">{order.product_name || "—"}</div>
          </div>
          <div className="rmap-info-cell">
            <div className="cell-label">Quantity</div>
            <div className="cell-value yellow">{order.quantity} kg</div>
          </div>
          <div className="rmap-info-cell">
            <div className="cell-label">Total Value</div>
            <div className="cell-value orange">{order.total_price} DA</div>
          </div>
          <div className="rmap-info-cell">
            <div className="cell-label">Farmer</div>
            <div className="cell-value green">{order.farmer_name || "—"}</div>
          </div>
          <div className="rmap-info-cell">
            <div className="cell-label">Buyer</div>
            <div className="cell-value blue">{order.buyer_name || "—"}</div>
          </div>
          <div className="rmap-info-cell">
            <div className="cell-label">Est. Fee (10%)</div>
            <div className="cell-value green">
              {order.total_price
                ? `${Math.max(5, (order.total_price * 0.1).toFixed(2))} DA`
                : "—"}
            </div>
          </div>
        </div>

        {/* ── Route Stats Bar ── */}
        {stats && (
          <div className="rmap-stats">
            <div className="rmap-stat-chip">
              <span className="stat-icon">📏</span>
              Distance: <strong>{stats.distance} km</strong>
            </div>
            <div className="rmap-stat-chip">
              <span className="stat-icon">⏱️</span>
              Est. Drive: <strong>{stats.duration} min</strong>
            </div>
            {stats.duration && (
              <div className="rmap-stat-chip">
                <span className="stat-icon">🕐</span>
                (~{Math.round(stats.duration / 60)} hrs)
              </div>
            )}
            <div className="rmap-route-arrow">
              <span className="rmap-wilaya-badge farmer">
                🌾 {order.farmer_wilaya || "Unknown"}
              </span>
              <span className="rmap-arrow-line">→</span>
              <span className="rmap-wilaya-badge buyer">
                🛒 {order.buyer_wilaya || "Unknown"}
              </span>
            </div>
          </div>
        )}

        {/* ── No-stats wilaya row (shown before route loads) ── */}
        {!stats && !loading && (
          <div className="rmap-stats">
            <div className="rmap-route-arrow" style={{ marginLeft: 0 }}>
              <span className="rmap-wilaya-badge farmer">
                🌾 {order.farmer_wilaya || "Unknown Wilaya"}
              </span>
              <span className="rmap-arrow-line">→</span>
              <span className="rmap-wilaya-badge buyer">
                🛒 {order.buyer_wilaya || "Unknown Wilaya"}
              </span>
            </div>
          </div>
        )}

        {/* ── Map ── */}
        <div className="rmap-map-wrapper">
          {/* Loading overlay */}
          {loading && (
            <div className="rmap-loading-overlay">
              <div className="rmap-spinner" />
              <p>Calculating road route…</p>
            </div>
          )}

          {/* Error state inside map area */}
          {error && !loading && (
            <div className="rmap-loading-overlay">
              <div className="rmap-error-state">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button
                  onClick={fetchRoute}
                  style={{
                    marginTop: 8, padding: "8px 20px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)", background: "transparent",
                    color: "#fff", cursor: "pointer", fontSize: "0.8rem"
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <MapContainer
            center={farmerCoords || defaultCenter}
            zoom={5}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%", minHeight: 340 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <AutoFitBounds
              routePolyline={routePolyline}
              farmerCoords={farmerCoords}
              buyerCoords={buyerCoords}
            />

            {farmerCoords && (
              <Marker position={farmerCoords} icon={farmerIcon}>
                <Popup>
                  <strong>🌾 Farmer Pickup</strong><br />
                  {order.farmer_name}<br />
                  <em>{order.farmer_wilaya}</em>
                </Popup>
              </Marker>
            )}

            {buyerCoords && (
              <Marker position={buyerCoords} icon={buyerIcon}>
                <Popup>
                  <strong>🛒 Buyer Destination</strong><br />
                  {order.buyer_name}<br />
                  <em>{order.buyer_wilaya}</em>
                </Popup>
              </Marker>
            )}

            {routePolyline && (
              <Polyline
                pathOptions={{
                  color: "#22c55e",
                  weight: 5,
                  opacity: 0.85,
                  dashArray: null,
                }}
                positions={routePolyline}
              />
            )}
          </MapContainer>
        </div>

        {/* ── Footer ── */}
        <div className="rmap-footer">
          <span className="rmap-footer-note">
            Route data powered by OpenRouteService · Map © OpenStreetMap
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="rmap-decline-btn" onClick={onClose}>
              Close
            </button>
            <button
              className="rmap-accept-btn"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                "Accepting…"
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Accept Mission
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RouteMapModal;
