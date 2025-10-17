import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LoginPage.css";
import "../styles/SignupPage.css";
import signupIllustration from "../assets/undraw_sign-up_z2ku (1).svg";

function SignupPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !contact ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
     if (!/^\d{11}$/.test(contact)) {
      setError("Please enter a valid contact.");
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
    
    axios.post("http://localhost:8000/register",{
            firstname, lastname, email, username, password, contact
      })
      .then((response) => {
          setSuccess("Account created! You can now log in.");
          setFirstname("");
          setLastname("");
          setUsername("");
          setEmail("");
          setContact("");
          setPassword("");
          setConfirmPassword("");
          setAgree(false);
          setShowPassword(false);
          setShowConfirmPassword(false);
          navigate("/login");
  }
    )
      .catch((error) => {
        console.error("Error:", error)
        setError(error)
      });
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
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="firstname">Enter First Name</label>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="lastname">Enter Last Name</label>
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
                type="contact"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                placeholder=" "
              />
              <label htmlFor="email">Enter Contact</label>
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
