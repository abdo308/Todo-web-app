import React, { useState, useEffect } from "react";
import "../styles/ProfilePage.css";
import ChangePasswordModal from "./ChangePasswordModal";

function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  const [profileData, setProfileData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    position: "",
  });

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=e07a5f&color=fff&size=128",
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (res.status === 401) {
            setError("Not authenticated. Please log in.");
            setLoading(false);
            return;
          }
          throw new Error(`Failed to load profile: ${res.status}`);
        }
        const json = await res.json();
        setProfileData({
          username: json.username || "",
          firstName: json.firstname || json.firstName || "",
          lastName: json.lastname || json.lastName || "",
          email: json.email || "",
          contactNumber: json.contact || "",
          position: json.position || "",
        });
        const displayName =
          json.firstname || json.username || json.email || "User";
        setUser({
          name: displayName,
          email: json.email || "",
          avatar:
            json.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              displayName
            )}&background=e07a5f&color=fff&size=128`,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateInfo = () => {
    const doUpdate = async () => {
      setError(null);
      setUpdateLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const payload = {
          email: profileData.email || undefined,
          username: profileData.username || undefined,
          firstname: profileData.firstName || undefined,
          lastname: profileData.lastName || undefined,
          contact: profileData.contactNumber || undefined,
          position: profileData.position || undefined,
        };

        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/auth/me", {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed to update profile: ${res.status}`);
        }

        const json = await res.json();
        // Update UI state
        setProfileData({
          username: json.username || "",
          firstName: json.firstname || json.firstName || "",
          lastName: json.lastname || json.lastName || "",
          email: json.email || "",
          contactNumber: json.contact || "",
          position: json.position || "",
        });

        const displayName =
          json.firstname || json.username || json.email || "User";
        setUser((u) => ({
          ...u,
          name: displayName,
          email: json.email || u.email,
        }));

        setSuccessMessage("Profile updated successfully!");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to update profile");
      } finally {
        setUpdateLoading(false);
      }
    };

    doUpdate();
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async (passwordData) => {
    // Send change password request to backend
    try {
      const token = localStorage.getItem("access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body = JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      // prefer an explicit backend URL so requests hit the FastAPI server
      // default to same-origin (empty string) so nginx can proxy requests in k8s
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/auth/change-password`, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        // Try to parse JSON error body for a friendly message
        let msg = `Failed: ${res.status}`;
        try {
          const json = await res.json();
          msg = json.detail || json.message || JSON.stringify(json);
        } catch (e) {
          const txt = await res.text().catch(() => "");
          if (txt) msg = txt;
        }
        // return failure so modal stays open and displays error
        return { success: false, message: msg };
      }

      // success
      setSuccessMessage("Password changed successfully!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.message || "Failed to change password",
      };
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Here you would typically upload to your backend
        console.log("New profile picture selected:", file);
        // For now, just log the file
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-email">{user.email}</p>
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
                  alt={user.name}
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
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>

            <form className="profile-form">
              <label className="field-title">Username</label>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">First Name</label>
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Last Name</label>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Email Address</label>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Contact Number</label>
              <div className="form-group">
                <input
                  type="tel"
                  name="contactNumber"
                  value={profileData.contactNumber}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <label className="field-title">Position</label>
              <div className="form-group">
                <input
                  type="text"
                  name="position"
                  value={profileData.position}
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
