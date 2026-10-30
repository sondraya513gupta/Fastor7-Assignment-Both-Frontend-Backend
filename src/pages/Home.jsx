import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Bike,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRestaurants } from '../services/restaurantService';

// Local Figma-matched assets
import pizzaImg from '../assets/images/pizza.jpg';
import sushiImg from '../assets/images/sushi.jpg';
import curryImg from '../assets/images/curry.jpg';
import lasagnaImg from '../assets/images/lasagna.jpg';
import cupcakeImg from '../assets/images/cupcake.jpg';
import burgerImg from '../assets/images/burger.jpg';
import shakeImg from '../assets/images/shake.jpg';

import './Home.css';

// 4 Exact Best Seller Cards from Figma Screenshot 3
const BEST_SELLERS = [
  {
    id: 'sushi-1',
    name: 'Sushi',
    price: '$103.0',
    image: sushiImg,
  },
  {
    id: 'curry-1',
    name: 'Curry',
    price: '$50.0',
    image: curryImg,
  },
  {
    id: 'lasagna-1',
    name: 'Lasagna',
    price: '$12.99',
    image: lasagnaImg,
  },
  {
    id: 'cupcake-1',
    name: 'Cupcake',
    price: '$8.20',
    image: cupcakeImg,
  },
];

// Exact Popular Items from Figma Screenshot 3
const INITIAL_POPULAR_ORDERS = [
  {
    id: 'order-shake',
    name: 'Strawberry Shake',
    date: '29 Nov, 01:20 pm',
    items: '2 items',
    price: '₹20.00',
    image: shakeImg,
  },
  {
    id: 'order-burger',
    name: 'Chicken Burger',
    date: '17 Oct, 01:20 pm',
    items: '1 item',
    price: '₹20.00',
    image: burgerImg,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Search input matching "Karan" in Figma screenshot
  const [searchTerm, setSearchTerm] = useState('Karan');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popular orders tracking & cancellation state
  const [popularOrders, setPopularOrders] = useState(INITIAL_POPULAR_ORDERS);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch real Fastor restaurants from staging API
  const fetchRestaurantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurants(118);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError('Unable to load live restaurants. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const handleCancelOrder = (orderId, orderName) => {
    setPopularOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order for "${orderName}" was cancelled.`);
  };

  const handleTrackDriver = (order) => {
    setTrackingModalOrder(order);
  };

  return (
    <div className="home-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="home-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header: Current Locations matching Figma */}
      <header className="home-header">
        <div className="location-container">
          <span className="location-label">Current Locations</span>
          <span className="location-name">Model Town, New Delhi</span>
        </div>
      </header>

      {/* Search / User Box + Two Action Icons (Phone & Wallet) */}
      <section className="search-section" aria-label="Search and Actions">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Karan"
          />
        </div>

        {/* Orange Phone Icon provided by user */}
        <button
          type="button"
          className="header-action-icon-btn"
          onClick={() => showToast('Calling support: +91 1800-FASTOR')}
          aria-label="Call support"
        >
          <img
            src="/d6c633d5-8689-4227-9870-6207052e667b.png"
            alt="Call"
            className="header-action-icon-img"
          />
        </button>

        {/* Blue Wallet Icon provided by user */}
        <button
          type="button"
          className="header-action-icon-btn"
          onClick={() => showToast('Fastor Wallet Balance: ₹500.00')}
          aria-label="Fastor Wallet"
        >
          <img
            src="/e436452b-537d-4579-8ec6-c65e1241d242.png"
            alt="Wallet"
            className="header-action-icon-img"
          />
        </button>
      </section>

      {/* Best Seller Section matching Figma */}
      <section className="section-block best-seller-section">
        <h2 className="section-title">Best Seller</h2>

        <div className="best-seller-grid" role="region" aria-label="Best selling food items">
          {BEST_SELLERS.map((item) => (
            <div
              key={item.id}
              className="best-seller-card"
              onClick={() => navigate('/food/pizza-1')}
              role="button"
              tabIndex={0}
            >
              <img src={item.image} alt={item.name} className="card-food-image" />
              <div className="card-price-badge">{item.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner: 323px x 141px matching Figma specs */}
      <section className="promo-banner-section">
        <div
          className="promo-banner"
          onClick={() => navigate('/food/pizza-1')}
          role="button"
          tabIndex={0}
        >
          {/* Decorative curved accents */}
          <div className="decorative-arc arc-top" />
          <div className="decorative-arc arc-bottom" />

          <div className="promo-left-content">
            <p className="promo-tagline">
              Experience our<br />delicious new dish
            </p>
            <h3 className="promo-discount-text">30% OFF</h3>
          </div>

          <div className="promo-right-image">
            <img src={pizzaImg} alt="Delicious Pizza" className="promo-pizza-img" />
          </div>
        </div>

        {/* 5 Carousel Pagination Indicators */}
        <div className="promo-dots-row" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot dot-active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>

      {/* Popular Items matching Figma */}
      <section className="section-block popular-items-section">
        <h2 className="section-title">Popular Items</h2>

        {popularOrders.length === 0 ? (
          <div className="empty-orders-card">
            <p>No recent orders</p>
          </div>
        ) : (
          <div className="popular-items-list">
            {popularOrders.map((order) => (
              <div key={order.id} className="popular-item-card">
                <img
                  src={order.image}
                  alt={order.name}
                  className="popular-item-image"
                  onClick={() => navigate('/food/pizza-1')}
                />

                <div className="popular-item-details">
                  <div className="popular-top-row">
                    <h3
                      className="popular-item-name"
                      onClick={() => navigate('/food/pizza-1')}
                    >
                      {order.name}
                    </h3>
                    <span className="popular-item-price">{order.price}</span>
                  </div>

                  <p className="popular-item-meta">
                    <span className="meta-date">{order.date}</span>
                    <span className="meta-items">{order.items}</span>
                  </p>

                  <div className="popular-actions-row">
                    <button
                      type="button"
                      className="btn-cancel-order"
                      onClick={() => handleCancelOrder(order.id, order.name)}
                    >
                      Cancel Order
                    </button>
                    <button
                      type="button"
                      className="btn-track-driver"
                      onClick={() => handleTrackDriver(order)}
                    >
                      Track Driver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live Fastor API Restaurants Section */}
      <section className="section-block live-restaurants-section">
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ fontSize: 16 }}>Explore Restaurants</h2>
            <span className="api-badge-indicator">Fastor API (City 118)</span>
          </div>
          <button
            type="button"
            className="refresh-api-btn"
            onClick={fetchRestaurantData}
            disabled={loading}
            title="Refresh list"
            aria-label="Refresh restaurants"
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="restaurants-skeleton-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="restaurant-skeleton-card">
                <div className="skeleton-thumb" />
                <div className="skeleton-lines">
                  <div className="skeleton-line-title" />
                  <div className="skeleton-line-sub" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="restaurant-error-box">
            <AlertCircle size={20} className="error-icon" />
            <p>{error}</p>
            <button
              type="button"
              className="btn-retry"
              onClick={fetchRestaurantData}
            >
              Retry
            </button>
          </div>
        )}

        {/* Real Restaurant Cards */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="restaurants-grid">
            {restaurants.slice(0, 10).map((rest, index) => (
              <div
                key={rest.restaurant_id || index}
                className="restaurant-api-card"
                onClick={() => navigate('/food/pizza-1')}
              >
                <div className="restaurant-logo-wrap">
                  <img
                    src={rest.logo}
                    alt={rest.restaurant_name}
                    className="restaurant-logo-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = pizzaImg;
                    }}
                  />
                </div>

                <div className="restaurant-info">
                  <div className="restaurant-title-row">
                    <h4 className="restaurant-name">{rest.restaurant_name}</h4>
                    <span className="restaurant-status-tag">Open</span>
                  </div>
                  <p className="restaurant-address">{rest.address_complete}</p>
                  <div className="restaurant-meta-row">
                    <span className="delivery-time">
                      <Clock size={12} /> 25-30 min
                    </span>
                    <span className="delivery-fee">Free Delivery</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Driver Tracking Bottom Modal */}
      {trackingModalOrder && (
        <div className="tracking-modal-backdrop" onClick={() => setTrackingModalOrder(null)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="modal-drag-handle" />
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setTrackingModalOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="driver-header">
              <div className="driver-avatar">
                <Bike size={24} color="#FF5701" />
              </div>
              <div>
                <h3 className="driver-name">Delivery Partner Assigned</h3>
                <p className="driver-order">Delivering: {trackingModalOrder.name}</p>
              </div>
            </div>

            <div className="driver-timeline">
              <div className="timeline-step done">
                <div className="timeline-dot" />
                <div className="timeline-info">
                  <span className="step-title">Order Confirmed</span>
                  <span className="step-time">08:20 PM</span>
                </div>
              </div>
              <div className="timeline-step done">
                <div className="timeline-dot" />
                <div className="timeline-info">
                  <span className="step-title">Food Prepared & Packed</span>
                  <span className="step-time">08:32 PM</span>
                </div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-dot pulse" />
                <div className="timeline-info">
                  <span className="step-title">Driver On The Way</span>
                  <span className="step-time">Estimated: 10 mins</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                showToast('Driver contacted via message');
                setTrackingModalOrder(null);
              }}
            >
              Call Delivery Partner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
