import React, { useState, useEffect } from "react";
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
  const [deleteMessage, setDeleteMessage] = useState("");
  const [movingTaskId, setMovingTaskId] = useState(null);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);

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
      let backendPriority = "medium";
      if (taskData.priority === "Low") backendPriority = "low";
      else if (taskData.priority === "Moderate") backendPriority = "medium";
      else if (taskData.priority === "Extreme") backendPriority = "high";
      formData.append("priority", backendPriority);
    }
    if (taskData.status && taskData.status.trim() !== "") {
      formData.append("status", taskData.status);
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
      .then((data) => {
        // Allow backend-provided message to be shown in the dashboard toast
        const msg = (data && data.message) || "Task deleted successfully!";
        setDeleteMessage(msg);
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

  // Listen for cross-page todo:deleted events so Dashboard shows the same message
  useEffect(() => {
    const onTodoDeleted = (e) => {
      try {
        const msg =
          (e && e.detail && e.detail.message) || "Task deleted successfully!";
        setDeleteMessage(msg);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("todo:deleted", onTodoDeleted);
    // Also listen for cross-tab deletes via localStorage
    const onStorage = (ev) => {
      try {
        if (ev.key === "todo:deleted" && ev.newValue) {
          const payload = JSON.parse(ev.newValue);
          const msg =
            payload && payload.message
              ? payload.message
              : "Task deleted successfully!";
          setDeleteMessage(msg);
          setShowDeleteSuccess(true);
          setTimeout(() => setShowDeleteSuccess(false), 3000);
        }
      } catch (err) {
        // ignore parse errors
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("todo:deleted", onTodoDeleted);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Toggle a task to completed (animate out from todo, animate into completed)
  const handleToggleComplete = (task) => {
    if (!task) return;
    // if already completed, do nothing for now
    if (task.status && task.status.toString().toLowerCase() === "completed")
      return;

    // Mark as 'moving' to play a removal animation in the To-Do list
    setMovingTaskId(task.id);

    // After a short animation delay, send the update to backend and update local state
    setTimeout(() => {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("status", "completed");

      fetch(`/todos/${task.id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update task status");
          return res.json();
        })
        .then(() => {
          // Optimistically update local tasks: set this task to completed
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, status: "completed" } : t
            )
          );

          // Mark as recently completed to play entrance animation in Completed panel
          setRecentlyCompletedId(task.id);
          // clear the recent flag after animation
          setTimeout(() => setRecentlyCompletedId(null), 700);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setMovingTaskId(null);
        });
    }, 180);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  // User state (loaded from backend /auth/me)
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=e07a5f&color=fff&size=128",
  });

  // Load current user info (same approach as ProfilePage)
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return; // ignore if not authenticated
        const json = await res.json();
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
        // ignore
      }
    };
    loadUser();
  }, []);

  // API base for images (empty = same-origin where nginx will proxy /uploads/ to backend)
  const apiBase = import.meta.env.VITE_API_URL || "";
  const joinUrl = (base, path) => {
    const b = (base || "").replace(/\/$/, "");
    const p = (path || "").replace(/^\//, "");
    return b ? `${b}/${p}` : `/${p}`;
  };

  // Fetch tasks from backend
  const [tasks, setTasks] = useState([]);
  React.useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // completed tasks will be derived from fetched `tasks`
  const completedTasks = tasks.filter(
    (t) => t.status && t.status.toString().toLowerCase() === "completed"
  );

  // tasks that should appear in the To-Do list (exclude completed)
  const todoTasks = tasks.filter(
    (t) => !(t.status && t.status.toString().toLowerCase() === "completed")
  );

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
              {todoTasks.map((task) => {
                // Fix image URL: if image is just a filename, prepend /uploads/ and use apiBase when provided
                let imageUrl = task.image;
                if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
                  imageUrl = joinUrl(apiBase, `uploads/${imageUrl}`);
                }
                return (
                  <div
                    key={task.id}
                    className={`task-card ${
                      movingTaskId === task.id ? "removing" : ""
                    }`}
                  >
                    <div className="task-content">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        onChange={() => handleToggleComplete(task)}
                        disabled={movingTaskId === task.id}
                      />
                      <div className="task-details">
                        <h4 className="task-title">{task.title}</h4>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className="task-priority">
                            Priority: {task.priority}
                          </span>
                          <span className="task-status status-progress">
                            Status: {task.status || "pending"}
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

            <div className="completed-header">
              <h4 className="completed-title">Completed Tasks</h4>
            </div>
            {completedTasks.length === 0 ? (
              <div className="completed-task-card">
                <div className="completed-badge">✓ Completed Task</div>
                <p className="completed-time">No completed tasks yet.</p>
              </div>
            ) : (
              completedTasks.map((ct) => {
                const img =
                  ct.image && /^https?:/.test(ct.image)
                    ? ct.image
                    : ct.image
                    ? joinUrl(apiBase, `uploads/${ct.image}`)
                    : null;
                return (
                  <div
                    key={ct.id}
                    className={`completed-task-card ${
                      recentlyCompletedId === ct.id ? "recent-complete" : ""
                    }`}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flex: 1,
                      }}
                    >
                      <div className="completed-badge">✓ {ct.title}</div>
                      <p className="completed-time">
                        {ct.date ? new Date(ct.date).toLocaleDateString() : ""}
                      </p>
                    </div>

                    {/* delete button for completed tasks */}
                    <button
                      className="completed-delete-btn"
                      title="Delete completed task"
                      onClick={() => {
                        setDeletingTask(ct);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      🗑️
                    </button>

                    {img && (
                      <img src={img} alt={ct.title} className="task-thumb" />
                    )}
                  </div>
                );
              })
            )}
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
            <span className="slide-success-text">
              {deleteMessage || "Task deleted successfully!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
