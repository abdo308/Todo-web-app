import React, { useState } from "react";
import "../styles/LoginPageFigma.css";
import loginIllustration from "../assets/undraw_sign-in_uva0 (1).svg";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login failure for demonstration
    if (email !== "admin@example.com" || password !== "password123") {
      setError("Invalid email or password. Please try again.");
    } else {
      setError("");
      alert(`Email: ${email}\nPassword: ${password}`);
    }
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
              <label htmlFor="email">Email or Username</label>
            </div>
            <div className="form-group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder=" "
              />
              <label htmlFor="password">Password</label>
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
