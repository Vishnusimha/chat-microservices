import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiUserPlus, FiLogIn } from 'react-icons/fi';

const API_BASE = "http://localhost:8765";

const Login = () => {
  const { login, setIsLoading, isLoading } = useAuth();
  const { isDark } = useTheme();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    profileName: "",
  });
  const [authResult, setAuthResult] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthResult("");

    const endpoint = isLoginMode ? "/auth/login" : "/auth/register";
    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLoginMode && data.token) {
          const userData = {
            ...data,
            email: formData.email,
          };
          login(data.token, userData);
          setAuthResult("Login successful!");
        } else if (!isLoginMode) {
          setAuthResult("Registration successful! Please login.");
          setIsLoginMode(true);
          setFormData({
            userName: "",
            email: "",
            password: "",
            profileName: "",
          });
        }
      } else {
        setAuthResult(
          data.message ||
            data.error ||
            `${isLoginMode ? "Login" : "Registration"} failed`
        );
      }
    } catch (err) {
      setAuthResult("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (message) => {
    if (
      message.includes("successful") ||
      message.includes("added") ||
      message.includes("created")
    ) {
      return "status-success";
    } else if (message.includes("Error") || message.includes("failed")) {
      return "status-error";
    } else {
      return "status-loading";
    }
  };

  return (
    <div className={`login-page ${isDark ? 'dark' : 'light'}`}>
      <div className="login-container">
        <div className="login-header">
          <div className="brand-section">
            <div className="brand-icon">
              💬
            </div>
            <h1 className="brand-title">ChatSphere</h1>
            <p className="brand-subtitle">Connect, Share, and Grow Together</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(true)}
            >
              <FiLogIn />
              Sign In
            </button>
            <button
              className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(false)}
            >
              <FiUserPlus />
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {!isLoginMode && (
              <>
                <div className="form-group">
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="userName"
                      className="form-input"
                      placeholder="Username"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="profileName"
                      className="form-input"
                      placeholder="Display Name"
                      value={formData.profileName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  {isLoginMode ? <FiLogIn /> : <FiUserPlus />}
                  {isLoginMode ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {authResult && (
            <div className={`auth-result ${getStatusClass(authResult)}`}>
              {authResult}
            </div>
          )}

          <div className="auth-footer">
            <p>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setIsLoginMode(!isLoginMode)}
              >
                {isLoginMode ? "Sign up here" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;