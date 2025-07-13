import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Journal from './pages/Journal';
import Categories from './pages/Categories';
import './components/EnhancedStyles.css';

// Create placeholder components for missing pages
const Analytics = () => (
  <div className="page-placeholder">
    <h1>📊 Analytics</h1>
    <p>Coming soon! This will show user engagement metrics and community insights.</p>
  </div>
);

const Search = () => (
  <div className="page-placeholder">
    <h1>🔍 Search</h1>
    <p>Coming soon! Advanced search functionality for posts and users.</p>
  </div>
);

const Settings = () => (
  <div className="page-placeholder">
    <h1>⚙️ Settings</h1>
    <p>Coming soon! Customize your ChatSphere experience.</p>
  </div>
);

// Protected Route component (removed unused component)

// Main App Layout
const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppLayout />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;