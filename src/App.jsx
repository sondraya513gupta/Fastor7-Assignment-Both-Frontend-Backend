import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MobileFrame from './components/MobileFrame';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import FoodDetails from './pages/FoodDetails';
import './styles/global.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }
  return children;
}

// Root Route: Redirects based on auth status
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/signup" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MobileFrame>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food/:id"
              element={
                <ProtectedRoute>
                  <FoodDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food"
              element={
                <ProtectedRoute>
                  <FoodDetails />
                </ProtectedRoute>
              }
            />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileFrame>
      </BrowserRouter>
    </AuthProvider>
  );
}
