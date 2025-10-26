import React, { useState } from "react";
import "../styles/ChangePasswordModal.css";

function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Reset form and errors when closing
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    }, 300); // Match animation duration
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // onSubmit should return an object { success: boolean, message?: string }
      const result = await onSubmit(passwordData);
      if (result && result.success) {
        handleClose();
      } else {
        setErrors((prev) => ({
          ...prev,
          form: result?.message || "Failed to change password",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Failed to change password",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`password-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`password-modal-content ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="password-modal-header">
          <h2 className="password-modal-title">Change Password</h2>
          <button className="password-modal-back" onClick={handleClose}>
            Go Back
          </button>
        </div>

        <form className="password-modal-form" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="password-form-error">{errors.form}</div>
          )}
          <label className="password-field-title">Current Password</label>
          <div className="password-form-group">
            <div className="password-input-container">
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className={`form-input ${
                  errors.currentPassword ? "error" : ""
                }`}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("currentPassword")}
              >
                {showPasswords.currentPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="password-error-message">
                {errors.currentPassword}
              </span>
            )}
          </div>

          <label className="password-field-title">New Password</label>
          <div className="password-form-group">
            <div className="password-input-container">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className={`form-input ${errors.newPassword ? "error" : ""}`}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                {showPasswords.newPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.newPassword && (
              <span className="password-error-message">
                {errors.newPassword}
              </span>
            )}
          </div>

          <label className="password-field-title">Confirm New Password</label>
          <div className="password-form-group">
            <div className="password-input-container">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showPasswords.confirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="password-error-message">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="password-form-actions">
            <button type="submit" className="password-submit-btn">
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
