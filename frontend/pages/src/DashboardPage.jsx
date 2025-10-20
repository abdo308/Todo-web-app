import React, { useState } from "react";
import "../styles/DashboardPage.css";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  // Ref to trigger todos reload
  const fetchTodos = React.useCallback(() => {
    const token = localStorage.getItem("access_token");
    fetch("/todos", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch todos");
        return res.json();
      })
      .then((data) => {
        setTasks(data.todos || data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleAddTask = (taskData) => {
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000); // Hide after 3 seconds
    // Refresh todos
    fetchTodos();
  };

  const handleEditTask = async (taskData) => {
    const token = localStorage.getItem("access_token");
    const priorityMap = {
      Low: "low",
      Moderate: "medium",
      Extreme: "high",
    };
    const formData = new FormData();
    if (taskData.title && taskData.title.trim() !== "")
      formData.append("title", taskData.title);
    if (taskData.description && taskData.description.trim() !== "")
      formData.append("description", taskData.description);
    if (
      taskData.priority &&
      ["Low", "Moderate", "Extreme"].includes(taskData.priority)
    ) {
      // Map frontend priority to backend values
      let backendPriority = "medium";
      if (taskData.priority === "Low") backendPriority = "low";
      else if (taskData.priority === "Moderate") backendPriority = "medium";
      else if (taskData.priority === "Extreme") backendPriority = "high";
      formData.append("priority", backendPriority);
    }
    if (taskData.date && !isNaN(new Date(taskData.date).getTime()))
      formData.append("date", new Date(taskData.date).toISOString());
    if (taskData.image && typeof taskData.image !== "string") {
      // Only send image if a new photo is selected
      formData.append("image", taskData.image);
    }
    fetch(`/todos/${editingTask?.id || initialTaskData?.id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update task");
        return res.json();
      })
      .then(() => {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        fetchTodos();
        setIsEditModalOpen(false);
      })
      .catch((err) => {
        setIsEditModalOpen(false);
      });
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    const token = localStorage.getItem("access_token");
    fetch(`/todos/${deletingTask.id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete task");
        return res.json();
      })
      .then(() => {
        setIsDeleteModalOpen(false);
        setDeletingTask(null);
        fetchTodos();
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      })
      .catch((err) => {
        setIsDeleteModalOpen(false);
        setDeletingTask(null);
      });
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // Mock user data
  const user = {
    name: "amanuel",
    email: "amanuel@gmail.com",
    avatar:
      "https://ui-avatars.com/api/?name=Amanuel&background=e07a5f&color=fff&size=128",
  };

  // Fetch tasks from backend
  const [tasks, setTasks] = useState([]);
  React.useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Mock completed task
  const completedTask = {
    title: "Completed Task",
    description: "This is a sample completed task",
    status: "Completed",
    completedTime: "3 sec ago",
  };

  // Mock current task
  const currentTask = {
    title: "Walk the dog",
    description:
      "Take the dog to the park and bring treats. [2 PM] Riverside Park]",
    status: "Completed",
    completedTime: "1 day ago",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
  };

  // Mock upcoming task
  const upcomingTask = {
    title: "Conduct meeting",
    description:
      "Meet with client and explain Figma prototype and its features [3 PM]",
    status: "Completed",
    completedTime: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=300&fit=crop",
  };

  // Task statistics
  const stats = {
    completed: 84,
    inProgress: 46,
    notStarted: 13,
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
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
          <a href="/dashboard" className="nav-item active">
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
          <a href="/profile" className="nav-item">
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
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            Dash<span className="title-highlight">board</span>
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
                18/08/2023
              </span>
            </button>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="welcome-section">
          <h2 className="welcome-text">Welcome back, {user.name}👋</h2>
        </section>

        {/* Content Grid */}
        <div className="dashboard-grid">
          {/* To-Do Section */}
          <section className="todo-section">
            <div className="section-header">
              <h3 className="section-title">📋 To-Do</h3>
              <button
                className="add-task-btn"
                onClick={() => setIsModalOpen(true)}
              >
                + Add task
              </button>
            </div>

            <div className="task-list">
              {tasks.map((task) => {
                // Fix image URL: if image is just a filename, prepend /uploads/
                let imageUrl = task.image;
                if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
                  imageUrl = `http://localhost:8000/uploads/${imageUrl}`;
                }
                return (
                  <div key={task.id} className="task-card">
                    <div className="task-content">
                      <input type="checkbox" className="task-checkbox" />
                      <div className="task-details">
                        <h4 className="task-title">{task.title}</h4>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className="task-priority">
                            Priority: {task.priority}
                          </span>
                          <span className="task-status status-progress">
                            Status: {task.status}
                          </span>
                        </div>
                      </div>
                      {/* Edit/Delete buttons wrapper - horizontal alignment */}
                      <div className="task-action-btns">
                        <button
                          className="edit-task-btn"
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                        >
                          ✏️
                        </button>
                        <button
                          className="edit-task-btn"
                          style={{ background: "#ffeaea" }}
                          title="Delete Task"
                          onClick={() => {
                            setDeletingTask(task);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {/* Thumbnail image on right */}
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={task.title}
                        className="task-image"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          marginLeft: "1rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Task Status Section */}
          <section className="status-section">
            <div className="section-header">
              <h3 className="section-title">📊 Task Status</h3>
            </div>

            <div className="status-charts">
              <div className="chart-item">
                <div
                  className="chart-circle"
                  style={{ "--progress": stats.completed }}
                >
                  <span className="chart-value">{stats.completed}%</span>
                </div>
                <span className="chart-label completed-label">● Completed</span>
              </div>

              <div className="chart-item">
                <div
                  className="chart-circle"
                  style={{ "--progress": stats.inProgress }}
                >
                  <span className="chart-value">{stats.inProgress}%</span>
                </div>
                <span className="chart-label progress-label">
                  ● In Progress
                </span>
              </div>

              <div className="chart-item">
                <div
                  className="chart-circle"
                  style={{ "--progress": stats.notStarted }}
                >
                  <span className="chart-value">{stats.notStarted}%</span>
                </div>
                <span className="chart-label notstarted-label">
                  ● Not Started
                </span>
              </div>
            </div>

            {/* Completed Task */}
            <div className="completed-task-card">
              <div className="completed-badge">✓ {completedTask.title}</div>
              <p className="completed-time">{completedTask.completedTime}</p>
            </div>

            {/* Current & Upcoming Tasks */}
            <div className="upcoming-tasks">
              <div className="upcoming-task-item">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="task-checkbox"
                />
                <div className="task-info">
                  <h4 className="task-name">{currentTask.title}</h4>
                  <p className="task-desc">{currentTask.description}</p>
                  <div className="task-footer">
                    <span className="task-status-badge">
                      {currentTask.status}
                    </span>
                    <span className="task-time">
                      {currentTask.completedTime}
                    </span>
                  </div>
                </div>
                <img
                  src={currentTask.image}
                  alt={currentTask.title}
                  className="task-thumb"
                />
              </div>

              <div className="upcoming-task-item">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="task-checkbox"
                />
                <div className="task-info">
                  <h4 className="task-name">{upcomingTask.title}</h4>
                  <p className="task-desc">{upcomingTask.description}</p>
                  <div className="task-footer">
                    <span className="task-status-badge">
                      {upcomingTask.status}
                    </span>
                    <span className="task-time">
                      {upcomingTask.completedTime}
                    </span>
                  </div>
                </div>
                <img
                  src={upcomingTask.image}
                  alt={upcomingTask.title}
                  className="task-thumb"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditTask}
        taskData={editingTask}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleDeleteTask}
        taskTitle={deletingTask?.title || ""}
      />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <span>Task edited successfully!</span>
          </div>
        </div>
      )}

      {/* Slide-in delete success message */}
      {showDeleteSuccess && (
        <div className="slide-success-message">
          <div className="slide-success-content">
            <span className="slide-success-icon">🗑️</span>
            <span>Task deleted successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
