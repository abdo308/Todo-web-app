import React, { useState, useEffect } from "react";
import "../styles/EditTaskModal.css";

function EditTaskModal({
  isOpen,
  onClose,
  onSubmit,
  taskData: initialTaskData,
}) {
  const [taskData, setTaskData] = useState({
    title: "",
    date: "",
    priority: "Low",
    description: "",
    image: null,
  });
  const [isClosing, setIsClosing] = useState(false);

  // Update form when initialTaskData changes
  useEffect(() => {
    if (initialTaskData) {
      // Convert ISO date to YYYY-MM-DD for input
      let dateValue = "";
      if (initialTaskData.date) {
        const d = new Date(initialTaskData.date);
        dateValue = d.toISOString().slice(0, 10);
      }
      // Convert backend priority to modal value
      let priorityValue = "Low";
      if (initialTaskData.priority === "medium") priorityValue = "Moderate";
      else if (initialTaskData.priority === "high") priorityValue = "Extreme";
      else if (initialTaskData.priority === "low") priorityValue = "Low";
      setTaskData({
        title: initialTaskData.title || "",
        date: dateValue,
        priority: priorityValue,
        description: initialTaskData.description || "",
        image: initialTaskData.image || null,
      });
    }
  }, [initialTaskData]);

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
    onSubmit(taskData);
    handleClose();
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
          <h2 className="modal-title">Edit Task</h2>
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
            />
          </div>

          <div className="priority-section">
            <label className="priority-label">Priority</label>
            <div className="priority-boxes">
              <div
                className={`priority-box ${
                  taskData.priority === "Extreme" ? "selected" : ""
                } priority-extreme`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "Extreme" }))
                }
              >
                Extreme
              </div>
              <div
                className={`priority-box ${
                  taskData.priority === "Moderate" ? "selected" : ""
                } priority-moderate`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "Moderate" }))
                }
              >
                Moderate
              </div>
              <div
                className={`priority-box ${
                  taskData.priority === "Low" ? "selected" : ""
                } priority-low`}
                onClick={() =>
                  setTaskData((prev) => ({ ...prev, priority: "Low" }))
                }
              >
                Low
              </div>
            </div>
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
