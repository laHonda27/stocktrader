import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSignalR } from './hooks/useSignalR'; // Ajouter
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import PortfolioPage from './pages/Portfolio';
import './index.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  useSignalR(); // Ajouter cette ligne

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <main className={user ? 'pt-0' : ''}>
          <Routes>
            {/* Routes publiques */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
            />
            
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stocks" 
              element={
                <ProtectedRoute>
                  <Stocks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <ProtectedRoute>
                  <PortfolioPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirection par défaut */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
            
            {/* 404 - Page non trouvée */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="btn-primary"
                    >
                      Retour à l'accueil
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;