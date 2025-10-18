import React, { useState } from "react";
import "../styles/LoginPageFigma.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loginIllustration from "../assets/undraw_sign-in_uva0 (1).svg";

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
    
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    
    e.preventDefault();
    setSuccess("");
    if (
      !username ||
      !password 
    ) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
   
    }
        setError("");
        
    const body = new URLSearchParams({
    username,
    password
  });
axios.post("http://localhost:8000/login", body, {
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
})
.then((response) => {
  const data = response.data;
  const token = data.access_token;

  // Save token and username
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("username", username);

  // Reset form state
  setUsername("");
  setPassword("");
  setShowPassword(false);

  navigate("/dashboard");
})
.catch((error) => {
  console.error("Login error:", error);

  if (error.response) {
    const data = error.response.data;

    // FastAPI typical response
    if (Array.isArray(data.detail)) {
      const messages = data.detail.map((err) => {
        const field = err.loc?.[1] || "field";
        return `${field}: ${err.msg}`;
      });
      setError(messages.join(" | "));
    } 
    else if (typeof data.detail === "string") {
      setError(data.detail); // e.g., "Incorrect username or password"
    } 
    else {
      setError("Login failed. Please check your credentials.");
    }

  } else if (error.request) {
    setError("No response from server. Please try again later.");
  } else {
    setError("An unexpected error occurred. Please try again.");
  }
});
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-bg">
      <div className="login-main">
        {/* Left: Login Form */}
        <div className="login-form-col">
          <div className="login-title">Sign In</div>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="signup-message" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <input
                type="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder=" "
              />
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder=" "
                />
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="remember-row">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <button className="login-btn" type="submit">
              Log In
            </button>
            <div className="login-links">
              <a href="#">Forgot password?</a>
            </div>
            <div className="no-account">
              Don't have an account?
              <a href="/signup">Create One</a>
            </div>
          </form>
        </div>
        {/* Right: Illustration */}
        <div className="login-illustration-col">
          <img
            className="login-illustration"
            src={loginIllustration}
            alt="Login Illustration"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
