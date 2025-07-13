import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiHome, 
  FiUser, 
  FiBookOpen, 
  FiSettings, 
  FiLogOut, 
  FiSun, 
  FiMoon,
  FiMessageSquare,
  FiBarChart2,
  FiSearch,
  FiGrid
} from 'react-icons/fi';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Feed', color: '#667eea' },
    { path: '/profile', icon: FiUser, label: 'Profile', color: '#764ba2' },
    { path: '/journal', icon: FiBookOpen, label: 'Journal', color: '#48bb78' },
    { path: '/categories', icon: FiGrid, label: 'Categories', color: '#ed8936' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics', color: '#e53e3e' },
    { path: '/search', icon: FiSearch, label: 'Search', color: '#38b2ac' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`enhanced-navbar ${isDark ? 'dark' : 'light'}`}>
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <FiMessageSquare />
            </div>
            <div className="brand-text">
              <h1 className="navbar-title">ChatSphere</h1>
              <span className="navbar-tagline">Community Platform</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          {navItems.map(({ path, icon: Icon, label, color }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              style={{ '--nav-color': color }}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(
                user?.username ||
                user?.profileName ||
                user?.userName ||
                user?.email?.split("@")[0] ||
                "User"
              )}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user?.username ||
                  user?.profileName ||
                  user?.userName ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </div>
              <div className="user-status">
                <span className="status-dot"></span>
                Online
              </div>
            </div>
          </div>

          <div className="navbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>

            <Link to="/settings" className={`action-btn ${isActive('/settings') ? 'active' : ''}`}>
              <FiSettings />
            </Link>

            <button className="logout-btn" onClick={logout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;