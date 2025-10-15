import React, { useState } from "react";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "../styles/VitalTaskPage.css";

function VitalTaskPage() {
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

  // Mock vital tasks data
  const vitalTasks = [
    {
      id: 1,
      title: "Walk the dog",
      description: "Take the dog to the park and bring treats as well...",
      priority: "Extreme",
      status: "Not Started",
      createdDate: "Created on 20/08/2023",
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Take grandma to hospital",
      description: "Go back home and take grandma to the hosp...",
      priority: "Moderate",
      status: "In Progress",
      createdDate: "Created on 20/08/2023",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
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

  // Selected task details (right panel)
  const selectedTask = {
    title: "Walk the dog",
    priority: "Extreme",
    status: "Not Started",
    description: "Take the dog to the park and bring treats as well.",
    detailedDescription:
      "Take Luffy and Jiro for a leisurely stroll around the neighborhood. Enjoy the fresh air and give them the exercise and mental stimulation they need for a happy and healthy day. Don't forget to bring along squeaky and fluffy for some extra fun along the way!",
    activities: [
      "Listen to a podcast or audiobook",
      "Practice mindfulness or meditation",
      "Take photos of interesting sights along the way",
      "Practice obedience training with your dog",
      "Chat with neighbors or other dog walkers",
      "Listen to music or an upbeat playlist",
    ],
  };

  return (
    <div className="vitaltask-container">
      {/* Sidebar */}
      <aside className="vitaltask-sidebar">
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
          <a href="/vitaltask" className="nav-item active">
            <span className="nav-icon">✓</span>
            <span className="nav-text">Vital Task</span>
          </a>
          <a href="/mytask" className="nav-item">
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
      <main className="vitaltask-main">
        {/* Header */}
        <header className="vitaltask-header">
          <h1 className="vitaltask-title">
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
        <div className="vitaltask-grid">
          {/* Vital Tasks List Section */}
          <section className="vital-list-section">
            <div className="section-header">
              <h3 className="section-title">Vital Tasks</h3>
            </div>

            <div className="vital-task-list">
              {vitalTasks.map((task) => (
                <div key={task.id} className="vital-task-card">
                  <div className="vital-task-main">
                    <input type="checkbox" className="vital-task-checkbox" />
                    <div className="vital-task-content">
                      <h4 className="vital-task-title">{task.title}</h4>
                      <p className="vital-task-description">
                        {task.description}
                      </p>
                      <div className="vital-task-meta">
                        <span
                          className={`vital-task-priority priority-${task.priority.toLowerCase()}`}
                        >
                          Priority: {task.priority}
                        </span>
                        <span
                          className={`vital-task-status status-${task.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          Status: {task.status}
                        </span>
                      </div>
                      <p className="vital-task-date">{task.createdDate}</p>
                    </div>
                    <img
                      src={task.image}
                      alt={task.title}
                      className="vital-task-image"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Task Details Section */}
          <section className="vital-detail-section">
            <div className="vital-detail-card">
              <div className="vital-detail-header">
                <img
                  src={vitalTasks[0].image}
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

              <div className="vital-detail-content">
                <p className="detail-short-desc">{selectedTask.description}</p>
                <p className="detail-long-desc">
                  {selectedTask.detailedDescription}
                </p>

                <div className="detail-activities">
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

export default VitalTaskPage;
