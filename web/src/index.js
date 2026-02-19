import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Auth from './Auth';
import AppMain from './App';
import './styles.css';
import './auth-styles.css';

function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? (
    <AppMain onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
