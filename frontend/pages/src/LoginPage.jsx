import React, { useState } from "react";
import "../styles/LoginPageFigma.css";
import loginIllustration from "../assets/undraw_sign-in_uva0 (1).svg";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        window.location.href = "/dashboard";
      } else {
        const data = await response.json();
        setError(data.detail || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
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
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder=" "
              />
              <label htmlFor="email">Email</label>
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
