import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Books from './pages/Books';
import Login from './pages/Login';
import Register from './pages/Register';
import TourGuide from './components/TourGuide';

const AppContent = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user has completed the 5-step tour
    const completed = localStorage.getItem('mern_catalog_tour_completed');
    if (!completed) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="app-container">
      <Navbar onRestartTour={() => setIsTourOpen(true)} />
      <main className="main-content">
        <Routes>
          {/* Public authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected book management dashboard */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />

          {/* Root redirect to /books */}
          <Route path="/" element={<Navigate to="/books" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </main>

      {/* 5-step interactive tour guide */}
      <TourGuide isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;

