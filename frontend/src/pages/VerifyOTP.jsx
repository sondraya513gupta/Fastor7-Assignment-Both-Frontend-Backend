import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../services/authService';
import Keypad from '../components/Keypad';
import './VerifyOTP.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { pendingPhone, pendingDialCode, login } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for Resend code (starting at 30s matching Figma (00:30))
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone display: "+91 12345 67890" or entered phone
  const displayPhone = pendingPhone
    ? `${pendingDialCode || '+91'} ${pendingPhone}`
    : '+91 12345 67890';

  const handleBoxClick = (idx) => {
    setFocusedIndex(idx);
    inputRefs.current[idx]?.focus();
  };

  const handleChange = (index, value) => {
    if (error) setError(null);
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setFocusedIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasteData.length, 5);
    setFocusedIndex(nextIndex);
    inputRefs.current[nextIndex]?.focus();
  };

  // Keypad integration
  const handleKeypadPress = (digit) => {
    if (error) setError(null);
    const firstEmpty = otp.findIndex((val) => val === '');
    if (firstEmpty !== -1) {
      const newOtp = [...otp];
      newOtp[firstEmpty] = digit;
      setOtp(newOtp);
      const nextIndex = firstEmpty < 5 ? firstEmpty + 1 : 5;
      setFocusedIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeypadBackspace = () => {
    if (error) setError(null);
    let lastFilled = -1;
    for (let i = 5; i >= 0; i--) {
      if (otp[i] !== '') {
        lastFilled = i;
        break;
      }
    }
    if (lastFilled !== -1) {
      const newOtp = [...otp];
      newOtp[lastFilled] = '';
      setOtp(newOtp);
      setFocusedIndex(lastFilled);
      inputRefs.current[lastFilled]?.focus();
    }
  };

  // Submit OTP Verification
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otpCode = otp.join('');
    if (loading) return;

    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    const phoneToVerify = pendingPhone || '9876543210';
    const dialCodeToVerify = pendingDialCode || '+91';

    try {
      const response = await loginUser(phoneToVerify, otpCode, dialCodeToVerify);
      const token = response.data?.token;
      const userData = response.data;

      if (!token) {
        throw new Error('Authentication succeeded but token was not returned.');
      }

      login(token, userData);
      setToast('Verification successful! Welcome to Fastor.');

      setTimeout(() => {
        navigate('/home');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      const serverMessage =
        err.response?.data?.error_message ||
        err.response?.data?.message ||
        err.message ||
        'Invalid OTP. Please check the code and try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Action
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const phoneToResend = pendingPhone || '9876543210';
      const dialCodeToResend = pendingDialCode || '+91';
      await registerUser(phoneToResend, dialCodeToResend);
      setCountdown(30);
      setToast('A new OTP has been sent!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setError('Could not resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="verify-page">
      {/* Top Section */}
      <div className="verify-top-section">
        {/* Navigation with exact orange back arrow */}
        <nav className="verify-nav" aria-label="OTP navigation">
          <button
            type="button"
            className="verify-back-btn"
            onClick={() => navigate('/signup')}
            aria-label="Back to Signup"
          >
            <ArrowLeft size={24} color="#FF5701" strokeWidth={2.2} />
          </button>
        </nav>

        {/* Content Heading */}
        <div className="verify-main-content">
          <h1 className="verify-title">6-digit code</h1>
          <p className="verify-subtitle">
            Please enter the code we've sent to<br />
            <strong className="verify-phone-number">{displayPhone}</strong>
          </p>

          {/* Feedback Alerts */}
          {error && (
            <div className="signup-alert alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {toast && (
            <div className="signup-alert alert-success" role="status">
              <CheckCircle2 size={16} />
              <span>{toast}</span>
            </div>
          )}

          {/* 6 OTP Input Boxes: 3 on left, dash, 3 on right */}
          <div className="otp-boxes-group" onPaste={handlePaste}>
            <div className="otp-half">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`otp-digit-wrapper ${focusedIndex === idx ? 'focused' : ''} ${
                    otp[idx] ? 'filled' : ''
                  }`}
                  onClick={() => handleBoxClick(idx)}
                >
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onFocus={() => setFocusedIndex(idx)}
                    className="otp-digit-input"
                    autoComplete="one-time-code"
                  />
                  {!otp[idx] && focusedIndex === idx && (
                    <span className="otp-cursor" />
                  )}
                </div>
              ))}
            </div>

            <span className="otp-dash" aria-hidden="true">-</span>

            <div className="otp-half">
              {[3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`otp-digit-wrapper ${focusedIndex === idx ? 'focused' : ''} ${
                    otp[idx] ? 'filled' : ''
                  }`}
                  onClick={() => handleBoxClick(idx)}
                >
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onFocus={() => setFocusedIndex(idx)}
                    className="otp-digit-input"
                  />
                  {!otp[idx] && focusedIndex === idx && (
                    <span className="otp-cursor" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resend Code: 183 Hug x 15 Hug matching Figma Mulish 14px 15px -2% */}
          <div className="resend-container">
            <span className="resend-text">I didn't receive a code </span>
            {countdown > 0 ? (
              <span className="resend-timer">({formatTimer(countdown)})</span>
            ) : (
              <button
                type="button"
                className="resend-action-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="verify-bottom-section">
        <div className="verify-action-area">
          <button
            type="button"
            className="btn-primary continue-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : 'Continue'}
          </button>
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
