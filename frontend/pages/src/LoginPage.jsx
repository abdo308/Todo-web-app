import React, { useState } from "react";
import confetti from "canvas-confetti";
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            {/* Simple SVG checkmark logo for branding */}
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
          <h2 className="login-title">Todo App</h2>
          <div className="form-group floating-label">
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
          <div className="form-group floating-label">
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
            Log In
          </button>
          <div className="login-links">
            <a href="#">Forgot password?</a>
            <span> | </span>
            <a href="#">Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
