import React, { useState } from "react";
import "../styles/AddTaskModal.css";

function AddTaskModal({ isOpen, onClose, onSubmit }) {
  const [taskData, setTaskData] = useState({
    title: "",
    date: "",
    priority: "low",
    status: "pending",
    description: "",
    image: null,
  });
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build multipart/form-data
    const formData = new FormData();
    formData.append("title", taskData.title);
    if (taskData.date) formData.append("date", taskData.date);
    formData.append("priority", taskData.priority);
    formData.append("status", taskData.status);
    formData.append("description", taskData.description || "");
    if (taskData.image) {
      formData.append("image", taskData.image);
    }

    const token = localStorage.getItem("access_token");

    fetch("/todos", {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create todo");
        return res.json();
      })
      .then((json) => {
        if (onSubmit) onSubmit(json);
        // Reset form (include status to avoid undefined)
        setTaskData({
          title: "",
          date: "",
          priority: "low",
          status: "pending",
          description: "",
          image: null,
        });
        handleClose();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Add New Task</h2>
          <button className="modal-back" onClick={handleClose}>
            Go Back
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field-title">Title</label>
          <div className="form-group">
            <input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              className="form-input title-input"
              required
            />
          </div>

          <label className="field-title">Date</label>
          <div className="form-group">
            <input
              type="date"
              id="date"
              name="date"
              value={taskData.date}
              onChange={handleChange}
              className="form-input date-input"
              required
            />
          </div>

          <div className="priority-section">
            <label className="priority-label">Priority</label>
            <div className="priority-boxes">
              <div
                className={`priority-box ${
                  taskData.priority === "high" ? "selected" : ""
                } priority-extreme`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "high" }))
                }
              >
                High
              </div>
              <div
                className={`priority-box ${
                  taskData.priority === "medium" ? "selected" : ""
                } priority-moderate`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "medium" }))
                }
              >
                Medium
              </div>
              <div
                className={`priority-box ${
                  taskData.priority === "low" ? "selected" : ""
                } priority-low`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "low" }))
                }
              >
                Low
              </div>
            </div>
          </div>
          <label className="status-label">Status</label>
          <div className="form-group">
            <select
              name="status"
              value={taskData.status}
              onChange={handleChange}
              className="form-input status-input"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-row">
            <div className="titles-row">
              <label className="description-title">Task Description</label>
              <label className="upload-button-title">Upload Image</label>
            </div>
            <div className="description-upload-row">
              <div className="form-group form-group-description">
                <textarea
                  id="description"
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Start typing"
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="form-group form-group-upload">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="upload-input"
                />
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => document.getElementById("image").click()}
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;
