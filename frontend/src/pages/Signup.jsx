import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import Keypad from '../components/Keypad';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { setRegistrationInfo, pendingPhone } = useAuth();
  const inputRef = useRef(null);

  const dialCode = '+91';
  const [phone, setPhone] = useState(pendingPhone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (error) setError(null);
  };

  const handleKeypadPress = (digit) => {
    if (phone.length < 10) {
      setPhone((prev) => prev + digit);
      if (error) setError(null);
    }
  };

  const handleKeypadBackspace = () => {
    setPhone((prev) => prev.slice(0, -1));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await registerUser(phone, dialCode);
      setRegistrationInfo(phone, dialCode);
      setSuccessMsg('OTP sent successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/verify-otp');
      }, 700);
    } catch (err) {
      console.error('Registration failed:', err);
      const serverMessage = err.response?.data?.error_message || 
                            err.response?.data?.message || 
                            err.message || 
                            'Failed to send OTP. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Top Section */}
      <div className="signup-top-section">
        {/* Navigation with exact orange back arrow */}
        <nav className="signup-nav" aria-label="Signup navigation">
          <button
            type="button"
            className="signup-back-btn"
            onClick={() => navigate('/')}
            aria-label="Back"
          >
            <ArrowLeft size={24} color="#FF5701" strokeWidth={2.2} />
          </button>
        </nav>

        {/* Content Heading */}
        <div className="signup-main-content">
          <h1 className="signup-title">Sign Up to Fastor</h1>
          <p className="signup-subtitle">
            Let us know your mobile number and we will send you an OTP for verification.
          </p>

          {/* Feedback alerts if any */}
          {error && (
            <div className="signup-alert alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="signup-alert alert-success" role="status">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Phone Input Box matching Figma specs: 335px x 48px, radius 8px, #F5F5F5 */}
          <div
            className="phone-input-box"
            onClick={() => inputRef.current?.focus()}
            role="textbox"
            tabIndex={0}
          >
            <span className="phone-prefix">+91</span>
            <span className="phone-cursor" />
            {phone ? (
              <span className="phone-value">{phone}</span>
            ) : (
              <span className="phone-placeholder">- 00000</span>
            )}

            {/* Hidden native input for physical keyboard entry */}
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              className="phone-native-input-hidden"
              aria-label="Mobile Number"
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="signup-bottom-section">
        <div className="signup-action-area">
          {/* Button For Becho APP matching Figma specs: 334px x 48px, radius 10px, #FF5701 */}
          <button
            type="button"
            className="btn-primary get-otp-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : 'Get OTP'}
          </button>

          {/* Terms and Privacy text matching Figma */}
          <p className="terms-privacy-text">
            By clicking, I accept the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
          </p>
        </div>

        {/* iOS Numeric Keypad */}
        <Keypad
          onKeyPress={handleKeypadPress}
          onBackspace={handleKeypadBackspace}
        />
      </div>
    </div>
  );
}
