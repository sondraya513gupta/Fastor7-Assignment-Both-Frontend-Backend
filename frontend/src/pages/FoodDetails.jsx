import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import pizzaImg from '../assets/images/pizza.jpg';
import './FoodDetails.css';

// 4 Exact portion options from Figma Screenshot
const PORTION_OPTIONS = [
  { id: 'personal', name: 'Personal (4 Slides)', price: '$0.00' },
  { id: 'medium', name: 'Medium (8 Slides)', price: '$3.00' },
  { id: 'familiar', name: 'Familiar (10 Slides)', price: '$6.00' },
  { id: 'jumbo', name: 'Jumbo (12 Slides)', price: '$10.00' },
];

export default function FoodDetails() {
  const navigate = useNavigate();

  // State: default quantity 3 and Jumbo (12 Slides) selected matching Figma screenshot
  const [quantity, setQuantity] = useState(3);
  const [selectedPortion, setSelectedPortion] = useState('jumbo');
  const [toast, setToast] = useState(null);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    const selectedOpt = PORTION_OPTIONS.find((p) => p.id === selectedPortion);
    setToast(`Added ${quantity}x ${selectedOpt?.name} to cart!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="food-details-page">
      {/* Toast Notification */}
      {toast && (
        <div className="details-toast" role="status">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Transparent hotspot in top-left to navigate back if needed */}
      <div
        className="details-back-hotspot"
        onClick={() => navigate('/home')}
        title="Back to Home"
        aria-label="Back to Home"
        role="button"
        tabIndex={0}
      />

      <div className="details-inner-container">
        {/* Large Rounded Hero Image matching Figma: radius 28px */}
        <div className="hero-image-wrapper">
          <img
            src={pizzaImg}
            alt="Pepperoni Pizza"
            className="hero-food-img"
          />
        </div>

        {/* Price and Quantity Stepper Row framed with top and bottom lines */}
        <div className="price-stepper-row">
          <div className="price-amount">₹14.00</div>

          <div className="stepper-controls" role="group" aria-label="Quantity selector">
            <button
              type="button"
              className="stepper-btn"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="stepper-value">{quantity}</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Title and Description matching Figma inspect: subtitulo League Spartan 500 20px 100% */}
        <div className="product-info-block">
          <h1 className="product-title">Lorem ipsum dolor sit amet</h1>
          <p className="product-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
          </p>
        </div>

        {/* Personal portion section matching Figma */}
        <div className="portion-section">
          <h2 className="portion-heading">Personal portion</h2>

          <div className="portion-options-list" role="radiogroup" aria-label="Portion size options">
            {PORTION_OPTIONS.map((opt) => {
              const isSelected = selectedPortion === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`portion-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPortion(opt.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                >
                  <span className="portion-name">{opt.name}</span>
                  <div className="portion-dotted-leader" />
                  <span className="portion-price">{opt.price}</span>

                  {/* Concentric circle radio button matching Figma */}
                  <div className="portion-radio-icon">
                    {isSelected ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" stroke="#E95322" strokeWidth="1.5" />
                        <circle cx="9" cy="9" r="4.5" fill="#E95322" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8" stroke="#E95322" strokeWidth="1.5" />
                        <circle cx="9" cy="9" r="4" stroke="#E95322" strokeWidth="1.2" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* "Add to cart" Button matching Figma specs: 334px x 48px, radius 10px, #FF5701 */}
        <button
          type="button"
          className="btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
