import React, { useState } from "react";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "../styles/MyTaskPage.css";

function MyTaskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);

  // Mock user data
  const user = {
    name: "amanuel",
    email: "amanuel@gmail.com",
    avatar:
      "https://ui-avatars.com/api/?name=Amanuel&background=e07a5f&color=fff&size=128",
  };

  // Mock tasks data
  const tasks = [
    {
      id: 1,
      title: "Submit Documents",
      description: "Make sure to submit all the necessary documents...",
      priority: "Extreme",
      status: "Not Started",
      notes: "Success",
      createdDate: "Created on 20/06/2023",
      image:
        "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Complete assignments",
      description: "The assignments must be completed to pass final year...",
      priority: "Success",
      status: "In Progress",
      notes: "Success",
      createdDate: "Created on 20/06/2023",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    },
  ];

  // Handle edit task
  const handleEditTask = () => {
    setSelectedTaskForEdit(selectedTask);
    setIsEditModalOpen(true);
  };

  // Handle delete task
  const handleDeleteTask = () => {
    setSelectedTaskForDelete(selectedTask);
    setIsDeleteModalOpen(true);
  };

  // Handle edit task submission
  const handleEditSubmit = (updatedTaskData) => {
    console.log("Updated task data:", updatedTaskData);
    // Here you would typically update the task in your state/database
    setIsEditModalOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    console.log("Deleting task:", selectedTaskForDelete.title);
    // Here you would typically remove the task from your state/database
    setIsDeleteModalOpen(false);
  };

  // Task details (right panel)
  const selectedTask = {
    title: "Document Submission",
    priority: "Extreme",
    status: "Not Started",
    image:
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=400&fit=crop",
    shortDescription: "To submit required documents for something important",
    description:
      "Review the list of documents required for submission and ensure all necessary documents are ready. Organize the documents accordingly and scan them if physical copies need to be submitted digitally. Rename the scanned files appropriately for easy identification and verify the accepted file formats. Upload the documents securely to the designated platform, double-check for accuracy, and obtain confirmation of successful submission. Follow up if necessary to ensure proper processing.",
    activities: [
      "Ensure that the documents are authentic and up-to-date.",
      "Maintain confidentiality and security of sensitive information during the submission process.",
      "If there are specific guidelines or deadlines for submission, adhere to them diligently.",
    ],
  };

  return (
    <div className="mytask-container">
      {/* Sidebar */}
      <aside className="mytask-sidebar">
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
          <a href="/mytask" className="nav-item active">
            <span className="nav-icon">📋</span>
            <span className="nav-text">My Task</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📂</span>
            <span className="nav-text">Task Categories</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">❓</span>
            <span className="nav-text">Help</span>
          </a>
        </nav>

        <button className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="mytask-main">
        {/* Header */}
        <header className="mytask-header">
          <h1 className="mytask-title">
            To-<span className="title-highlight">Do</span>
          </h1>

          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search your task here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            <button className="icon-btn">🔔</button>
            <button className="icon-btn calendar-btn">
              <span>📅</span>
              <span className="date-text">
                Tuesday
                <br />
                28/08/2023
              </span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="mytask-grid">
          {/* Task List Section */}
          <section className="tasklist-section">
            <div className="section-header">
              <h3 className="section-title">My Tasks</h3>
            </div>

            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <input type="checkbox" className="task-checkbox" />
                  <div className="task-content">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span
                        className={`task-priority priority-${task.priority.toLowerCase()}`}
                      >
                        Priority: {task.priority}
                      </span>
                      <span
                        className={`task-status status-${task.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        Status: {task.status}
                      </span>
                    </div>
                    <p className="task-date">{task.createdDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Task Details Section */}
          <section className="taskdetail-section">
            <div className="detail-card">
              <div className="detail-header">
                <img
                  src={selectedTask.image}
                  alt={selectedTask.title}
                  className="detail-header-image"
                />
                <div className="detail-header-info">
                  <h3 className="detail-header-title">{selectedTask.title}</h3>
                  <div className="detail-header-meta">
                    <span
                      className={`detail-priority priority-${selectedTask.priority.toLowerCase()}`}
                    >
                      Priority: {selectedTask.priority}
                    </span>
                    <span
                      className={`detail-status status-${selectedTask.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      Status: {selectedTask.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-content">
                <p className="detail-short-desc">
                  {selectedTask.shortDescription}
                </p>

                <p className="detail-long-desc">{selectedTask.description}</p>

                <div className="detail-activities">
                  <h4 className="field-label">Activities:</h4>
                  <ol className="activities-list">
                    {selectedTask.activities.map((activity, index) => (
                      <li key={index} className="activity-item">
                        {activity}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="detail-actions">
                  <button className="action-btn edit-btn" onClick={handleEditTask}>✏️</button>
                  <button className="action-btn delete-btn" onClick={handleDeleteTask}>🗑️</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        taskData={selectedTaskForEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={selectedTaskForDelete?.title || ""}
      />
    </div>
  );
}

export default MyTaskPage;
