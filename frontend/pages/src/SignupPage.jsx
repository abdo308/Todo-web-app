import React, { useState } from "react";
import "../styles/LoginPage.css";
import "../styles/SignupPage.css";
import signupIllustration from "../assets/undraw_sign-up_z2ku (1).svg";

function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [contact, setContact] = useState("");
  const [position, setPosition] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !contact ||
      !position
    ) {
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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("You must agree to all terms.");
      return;
    }
    setError("");
    // Send signup data to backend
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          contact,
          position,
          username,
          email,
          password,
        }),
      });
      if (response.ok) {
        setSuccess("Account created! You can now log in.");
        setError("");
        setFirstName("");
        setLastName("");
        setContact("");
        setPosition("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgree(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      } else {
        const data = await response.json();
        setError(data.detail || "Registration failed.");
        setSuccess("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-bg">
      <div className="signup-main">
        <div className="signup-illustration-col">
          <img
            className="signup-illustration"
            src={signupIllustration}
            alt="Signup Illustration"
          />
        </div>
        <div className="signup-form-col">
          <h2 className="signup-title">Sign Up</h2>
          {error && <div className="signup-message">{error}</div>}
          {success && <div className="signup-success">{success}</div>}
          <form
            className="signup-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="form-group">
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="firstName">Enter First Name</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="lastName">Enter Last Name</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="username">Enter Username</label>
            </div>
            <div className="form-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="email">Enter Email</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="contact">Enter Contact</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="position">Enter Position</label>
            </div>
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                />
                <label htmlFor="password">Enter Password</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder=" "
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="terms-row">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <label htmlFor="agree">I agree to all terms</label>
            </div>
            <button className="signup-btn" type="submit">
              Register
            </button>
            <div className="no-account">
              Already have an account?
              <a href="/login">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
