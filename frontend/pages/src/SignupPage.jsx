import React, { useState } from "react";
import confetti from "canvas-confetti";
import "../styles/LoginPage.css";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    // Simple frontend validation
    if (!email || !username || !password) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError("");
    // TODO: Replace with real API call
    setSuccess("Account created! You can now log in.");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Animated SVG Waves Background */}
      <svg
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6dd5ed" />
            <stop offset="100%" stopColor="#f7797d" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfe9ff" />
            <stop offset="100%" stopColor="#fbc2eb" />
          </linearGradient>
        </defs>
        <g>
          <path>
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="M0,700 Q360,600 720,700 T1440,700 V900 H0Z;
                      M0,700 Q360,800 720,700 T1440,700 V900 H0Z;
                      M0,700 Q360,600 720,700 T1440,700 V900 H0Z"
            />
            <animate
              attributeName="fill"
              values="url(#waveGradient1);url(#waveGradient2);url(#waveGradient1)"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
          <path opacity="0.7">
            <animate
              attributeName="d"
              dur="16s"
              repeatCount="indefinite"
              values="M0,800 Q480,850 960,800 T1440,800 V900 H0Z;
                      M0,800 Q480,750 960,800 T1440,800 V900 H0Z;
                      M0,800 Q480,850 960,800 T1440,800 V900 H0Z"
            />
            <animate
              attributeName="fill"
              values="url(#waveGradient2);url(#waveGradient1);url(#waveGradient2)"
              dur="16s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
      <div
        className="login-container"
        style={{ position: "relative", zIndex: 1 }}
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            {/* Logo for branding */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: "0.2rem" }}
            >
              <circle cx="22" cy="22" r="22" fill="url(#logoGradient)" />
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6dd5ed" />
                  <stop offset="100%" stopColor="#f7797d" />
                </linearGradient>
              </defs>
              <path
                d="M14 23.5L20 29L30 17"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="login-title">Sign Up</h2>
          {error && (
            <div
              style={{
                color: "#ff4d4f",
                background: "rgba(255, 77, 79, 0.08)",
                border: "1px solid #ff4d4f",
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                marginBottom: "1.1rem",
                textAlign: "center",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: "0.01em",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                color: "#22c55e",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid #22c55e",
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                marginBottom: "1.1rem",
                textAlign: "center",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: "0.01em",
              }}
            >
              {success}
            </div>
          )}
          <div className="form-group floating-label">
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder=" "
            />
            <label htmlFor="signup-email">Email</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="text"
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder=" "
            />
            <label htmlFor="signup-username">Username</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder=" "
            />
            <label htmlFor="signup-password">Password</label>
          </div>
          <button
            className="login-btn"
            type="submit"
            onClick={(e) => {
              // Ripple effect
              const btn = e.currentTarget;
              const circle = document.createElement("span");
              const diameter = Math.max(btn.clientWidth, btn.clientHeight);
              const radius = diameter / 2;
              circle.classList.add("ripple");
              circle.style.width = circle.style.height = `${diameter}px`;
              circle.style.left = `${
                e.clientX - btn.getBoundingClientRect().left - radius
              }px`;
              circle.style.top = `${
                e.clientY - btn.getBoundingClientRect().top - radius
              }px`;
              const ripple = btn.getElementsByClassName("ripple")[0];
              if (ripple) ripple.remove();
              btn.appendChild(circle);
            }}
          >
            Sign Up
          </button>
          <div className="login-links">
            <a href="/login">Already have an account? Log in</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
