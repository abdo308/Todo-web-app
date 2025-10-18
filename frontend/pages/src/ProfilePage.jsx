import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import axios from "axios";
import ChangePasswordModal from "./ChangePasswordModal";

function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    // Clear stored session auth
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    // Redirect to login page
    window.location.href = "/login";
  };

  const [profileData, setProfileData] = useState({
    id: "",
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    position: "",
  });

  const [editedProfileData, setEditedProfileData] = useState({
    id: "",
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    position: "",
  });

  // Mock user data (avatar only)
  const user = {
    avatar:
      "https://ui-avatars.com/api/?name=Amanuel&background=e07a5f&color=fff&size=128",
  };

  // Helper to show success toast
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Helper to show error toast
  const showError = (msg) => {
    setErrorMessage(msg || "Something went wrong. Please try again.");
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 3000);
  };

  useEffect(() => {
    if (!token) {
      showError("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        const normalized = {
          id: data.id ?? "",
          username: data.username ?? "",
          firstname: data.firstname ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? "",
          contact: data.contact ?? "",
          position: data.position ?? "",
        };
        setProfileData(normalized);
        setEditedProfileData(normalized);
      })
      .catch((error) => {
        console.error("Profile fetch error:", error);
        if (error.response) {
          const { status, data } = error.response;

          // FastAPI validation array
          if (Array.isArray(data?.detail)) {
            const messages = data.detail
              .map((err) => {
                const field = err.loc?.[1] || "field";
                return `${field}: ${err.msg}`;
              })
              .join(" | ");
            showError(messages);
            return;
          }

          if (status === 401) {
            showError("Your session has expired. Please log in again.");
            navigate("/login");
            return;
          }

          if (typeof data?.detail === "string") {
            showError(data.detail);
            return;
          }

          showError("Failed to load profile. Please try again.");
        } else if (error.request) {
          showError("No response from server. Check your connection and try again.");
        } else {
          showError("An unexpected error occurred. Please try again.");
        }
      });
  }, [token, navigate]);

  // IMPORTANT: make inputs edit the editable copy
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateInfo = async () => {
    // Client-side validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\d{11}$/; // Egypt 11 digits
    const localErrors = [];

    const payload = {
      firstname: String(editedProfileData.firstname || "").trim(),
      lastname: String(editedProfileData.lastname || "").trim(),
      email: String(editedProfileData.email || "").trim(),
      contact: String(editedProfileData.contact || "").trim(),
    };

    if (!payload.firstname) localErrors.push("firstname: cannot be empty");
    if (!payload.lastname) localErrors.push("lastname: cannot be empty");
    if (!emailRe.test(payload.email)) localErrors.push("email: invalid email format");
    if (payload.contact && !phoneRe.test(payload.contact))
      localErrors.push("contact: must be 11 digits");

    if (localErrors.length) {
      showError(localErrors.join(" | "));
      return;
    }

    if (!token) {
      showError("You’re not logged in. Please sign in again.");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.patch(
        `http://localhost:8000/update/${profileData.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const normalized = {
        id: data.id ?? "",
        username: data.username ?? "",
        firstname: data.firstname ?? "",
        lastname: data.lastname ?? "",
        email: data.email ?? "",
        contact: data.contact ?? "",
        position: data.position ?? "",
      };

      // Sync both states so UI and form reflect saved values
      setProfileData(normalized);
      setEditedProfileData(normalized);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (Array.isArray(data?.detail)) {
          const msg = data.detail
            .map((e) => {
              const field = e?.loc?.[1] ?? "field";
              return `${field}: ${e?.msg}`;
            })
            .join(" | ");
          showError(msg);
          return;
        }

        if (status === 401) {
          showError("Your session has expired. Please log in again.");
          navigate("/login");
          return;
        }
        if (status === 403) {
          showError("You don’t have permission to update this profile.");
          return;
        }
        if (status === 409) {
          showError(
            typeof data?.detail === "string"
              ? data.detail
              : "Conflict: the provided data is already in use."
          );
          return;
        }

        if (typeof data?.detail === "string") {
          showError(data.detail);
          return;
        }

        showError("Update failed. Please review your inputs and try again.");
      } else if (error.request) {
        showError("No response from server. Check your connection and try again.");
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = (passwordData) => {
    axios
      .post(
        "http://localhost:8000/change-password",
        {
          confirm_new_password: passwordData.confirmPassword,
          new_password: passwordData.newPassword,
          current_password: passwordData.currentPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        showSuccess("Password changed successfully!");
      })
      .catch((error) => {
        console.error("Change password error:", error);
        if (error.response) {
          const { status, data } = error.response;

          if (Array.isArray(data?.detail)) {
            const msg = data.detail
              .map((e) => {
                const field = e?.loc?.[1] ?? "field";
                return `${field}: ${e?.msg}`;
              })
              .join(" | ");
            showError(msg);
            return;
          }

          if (status === 401) {
            showError("Your session has expired. Please log in again.");
            navigate("/login");
            return;
          }

          if (typeof data?.detail === "string") {
            showError(data.detail);
            return;
          }

          showError("Failed to change password. Please try again.");
        } else if (error.request) {
          showError("No response from server. Check your connection and try again.");
        } else {
          showError("An unexpected error occurred. Please try again.");
        }
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload to your backend
      console.log("New profile picture selected:", file);
      // For now, just log the file
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <img src={user.avatar} alt="User" className="user-avatar" />
            <div className="user-info">
              <h3 className="user-name">
                {profileData.firstname} {profileData.lastname}
              </h3>
              <p className="user-email">{profileData.email}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a href="/vitaltask" className="nav-item">
            <span className="nav-icon">✓</span>
            <span className="nav-text">Vital Task</span>
          </a>
          <a href="/mytask" className="nav-item">
            <span className="nav-icon">📋</span>
            <span className="nav-text">My Task</span>
          </a>
          <a href="/profile" className="nav-item active">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Profile</span>
          </a>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        {/* Profile Content */}
        <div className="profile-content">
          <div className="account-card">
            <div className="account-header">
              <h2 className="account-title">Account Information</h2>
            </div>

            <div className="profile-info-section">
              <div className="profile-avatar-container">
                <img
                  src={user.avatar}
                  alt="User"
                  className="profile-avatar-large"
                />
                <div className="avatar-upload-overlay">
                  <input
                    type="file"
                    id="profileImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="avatar-upload-input"
                  />
                  <button
                    type="button"
                    className="avatar-upload-btn"
                    onClick={() =>
                      document.getElementById("profileImageUpload").click()
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="profile-basic-info">
                <h3 className="profile-name">
                  {profileData.firstname} {profileData.lastname}
                </h3>
                <p className="profile-email">{profileData.email}</p>
              </div>
            </div>

            <form className="profile-form">
              <label className="field-title">Username</label>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={editedProfileData.username || ""}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={true}
                />
              </div>

              <label className="field-title">First Name</label>
              <div className="form-group">
                <input
                  type="text"
                  name="firstname"
                  value={editedProfileData.firstname || ""}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Last Name</label>
              <div className="form-group">
                <input
                  type="text"
                  name="lastname"
                  value={editedProfileData.lastname || ""}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Email Address</label>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={editedProfileData.email || ""}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Contact Number</label>
              <div className="form-group">
                <input
                  type="tel"
                  name="contact"
                  value={editedProfileData.contact || ""}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="update-info-btn"
                  onClick={handleUpdateInfo}
                >
                  Update Info
                </button>
                <button
                  type="button"
                  className="change-password-btn"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div className="error-message">
          <div className="error-content">
            <div className="error-icon">X</div>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handleChangePasswordSubmit}
      />
    </div>
  );
}

export default ProfilePage;
