import React, { useState } from "react";
import "../styles/DeleteConfirmModal.css";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, taskTitle }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`delete-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`delete-modal-content ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-header">
          <h2 className="delete-modal-title">Delete Task</h2>
        </div>

        <div className="delete-modal-body">
          <div className="delete-icon">🗑️</div>
          <p className="delete-message">
            Are you sure you want to delete the task <strong>"{taskTitle}"</strong>?
          </p>
          <p className="delete-warning">
            This action cannot be undone.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button className="cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={handleConfirm}>
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;