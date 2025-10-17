import React, { useEffect, useState } from "react";
import "../styles/ProfilePage.css";
import axios from "axios";
import ChangePasswordModal from "./ChangePasswordModal";

function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);


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

  // Mock user data
  const user = {
    avatar:
      "https://ui-avatars.com/api/?name=Amanuel&background=e07a5f&color=fff&size=128",
  };

  useEffect(()=> {
      const token = sessionStorage.getItem("token");
      axios.get("http://localhost:8000/me", 
      { headers: {Authorization: `Bearer ${token}`},})
      .then((response) => {
          const data = response.data
          // Store in sessionStorage
          setProfileData(
                 {
                    username: data.username,
                    firstName: data.firstname,
                    lastName: data.lastname,
                    email: data.email,
                    contactNumber: "",
                    position: "",
                 }
          )
      
  })
  }, [])
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateInfo = () => {
    console.log("Updated profile data:", profileData);
    // Here you would typically send the data to your backend

    // Show success message
    setSuccessMessage("Profile updated successfully!");
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = (passwordData) => {
    console.log("Password change submitted:", passwordData);
    // Here you would typically send the data to your backend

    // Show success message
    setSuccessMessage("Password changed successfully!");
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000); // Hide after 3 seconds
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
              <h3 className="user-name">{profileData.firstName} {profileData.lastName}</h3>
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
                <h3 className="profile-name">{profileData.firstName} {profileData.lastName}</h3>
                <p className="profile-email">{profileData.email}</p>
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
