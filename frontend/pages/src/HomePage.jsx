import "../styles/HomePage.css";

function HomePage() {
  return (
    <div className="homepage-bg">
      <div className="homepage-main">
        <div className="homepage-illustration-col">
          <img
            className="homepage-illustration"
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjlGNkYyIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiNFMDdBNUYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNjAiIGZpbGw9IiNFMDdBNUYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNFMDdBNUYiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNOSAxNkwxNCAyMUwyMiA4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+"
            alt="Todo App Illustration"
          />
        </div>
        <div className="homepage-content-col">
          <div className="homepage-auth-buttons">
            <a href="/login" className="homepage-auth-btn homepage-login-btn">
              Log In
            </a>
            <a href="/signup" className="homepage-auth-btn homepage-signup-btn">
              Sign Up
            </a>
          </div>

          <div className="homepage-welcome-section">
            <h1 className="homepage-title">Welcome to Todo App</h1>
            <p className="homepage-description">
              Organize your tasks, boost your productivity, and stay on top of
              your goals. Join thousands of users who trust our platform to
              manage their daily tasks efficiently.
            </p>

            <div className="homepage-features">
              <div className="homepage-feature">
                <span className="homepage-feature-icon">📝</span>
                <span className="homepage-feature-text">Create Tasks</span>
              </div>
              <div className="homepage-feature">
                <span className="homepage-feature-icon">⚡</span>
                <span className="homepage-feature-text">Set Priorities</span>
              </div>
              <div className="homepage-feature">
                <span className="homepage-feature-icon">✅</span>
                <span className="homepage-feature-text">Track Progress</span>
              </div>
            </div>

            <div className="homepage-cta">
              <a href="/signup" className="homepage-cta-btn">
                Get Started Free
              </a>
              <span className="homepage-cta-text">
                Already have an account? <a href="/login">Sign in</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
