import "../styles/HomePage.css";

function HomePage() {
  return (
    <div className="homepage-root">
      {/* Animated SVG background, compatible with project style */}
      <svg
        className="homepage-bg-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="homeGradient1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6dd5ed" />
            <stop offset="100%" stopColor="#f7797d" />
          </linearGradient>
          <linearGradient id="homeGradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfe9ff" />
            <stop offset="100%" stopColor="#fbc2eb" />
          </linearGradient>
        </defs>
        <g>
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
              values="url(#homeGradient2);url(#homeGradient1);url(#homeGradient2)"
              dur="16s"
              repeatCount="indefinite"
            />
          </path>
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
              values="url(#homeGradient1);url(#homeGradient2);url(#homeGradient1)"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
      {/* Top-right login/signup buttons */}
      <div className="homepage-auth-bar">
        <a href="/login" className="homepage-auth-btn homepage-login-btn">
          Log In
        </a>
        <a href="/signup" className="homepage-auth-btn homepage-signup-btn">
          Sign Up
        </a>
      </div>
      {/* Centered content with logo */}
      <div className="homepage-center-content">
        {/* Logo above the title */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="homepage-logo"
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
        <h1 className="homepage-title">Welcome to the Todo App</h1>
        <p className="homepage-desc">
          Organize your tasks, boost your productivity, and stay on top of your
          goals.
          <br />
          <span className="homepage-cta-animate">
            Sign up or log in to get started!
          </span>
        </p>
      </div>
    </div>
  );
}

export default HomePage;
