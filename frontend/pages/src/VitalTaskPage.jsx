import React, { useState, useEffect, useRef } from "react";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "../styles/VitalTaskPage.css";
import "../styles/DashboardPage.css";

function VitalTaskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  // User state (loaded from backend /auth/me)
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=e07a5f&color=fff&size=128",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
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

  // Vital tasks loaded from backend (high priority)
  const [vitalTasks, setVitalTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const detailRef = useRef(null);

  // normalize image urls from backend
  const apiBase = import.meta.env.VITE_API_URL || "";
  const joinUrl = (base, path) => {
    const b = (base || "").replace(/\/$/, "");
    const p = (path || "").replace(/^\//, "");
    return b ? `${b}/${p}` : `/${p}`;
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (/^https?:\/\//.test(image)) return image;
    // remove a leading slash if present, then normalize
    const cleaned = image.startsWith("/") ? image.slice(1) : image;
    if (cleaned.startsWith("uploads/")) return joinUrl(apiBase, cleaned);
    return joinUrl(apiBase, `uploads/${cleaned}`);
  };
  const [detailImgError, setDetailImgError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Helper: map backend priority to friendly label
  const displayPriority = (p) => {
    if (!p) return "";
    const val = p.toString().toLowerCase();
    if (val === "high") return "Extreme";
    if (val === "medium") return "Moderate";
    if (val === "low") return "Low";
    return p;
  };

  // Helper: map backend status to friendly label
  const displayStatus = (s) => {
    if (!s) return "";
    const val = s.toString().toLowerCase();
    if (val === "in_progress" || val === "in-progress" || val === "in progress")
      return "In Progress";
    if (val === "pending") return "Not Started";
    if (val === "completed") return "Completed";
    return s;
  };

  // Fetch high-priority todos for current user
  const fetchVitalTasks = React.useCallback(() => {
    const token = localStorage.getItem("access_token");
    // request only high priority tasks
    fetch(`/todos?priority=high&size=20`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vital tasks");
        return res.json();
      })
      .then((data) => {
        const items = data.todos || data;
        setVitalTasks(items || []);
        if (!selectedTask && items && items.length > 0)
          setSelectedTask(items[0]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [selectedTask]);

  useEffect(() => {
    fetchVitalTasks();
  }, [fetchVitalTasks]);

  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0;
    // debug: print selected task and resolved image URL
    if (selectedTask) {
      try {
        // eslint-disable-next-line no-console
        console.log("[VitalTaskPage] selectedTask:", selectedTask);
        // eslint-disable-next-line no-console
        console.log(
          "[VitalTaskPage] resolved image:",
          getImageUrl(selectedTask.image)
        );
        // reset any previous image error whenever selection changes
        setDetailImgError(false);
      } catch (e) {
        // ignore
      }
    }
  }, [selectedTask]);

  // resolved image URL for the selected task (empty if none)
  const selectedImageUrl = selectedTask ? getImageUrl(selectedTask.image) : "";
  const imageUrlWithRetry = selectedImageUrl
    ? `${selectedImageUrl}${
        selectedImageUrl.includes("?") ? "&" : "?"
      }r=${retryKey}`
    : "";

  // Handle edit task (open modal for a given task)
  const handleEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setIsEditModalOpen(true);
  };

  // Handle selecting a task (clear image error and set selection)
  const handleSelect = (task) => {
    // reset image error so image will attempt to load again
    setDetailImgError(false);
    // set selection
    setSelectedTask(task);
    // bump retry key to force re-request of image (cache-bust)
    setRetryKey((k) => k + 1);
    // eslint-disable-next-line no-console
    console.log("[VitalTaskPage] task selected:", task?.id);
  };

  // Handle delete task (open delete confirm for a given task)
  const handleDeleteTask = (task) => {
    setSelectedTaskForDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle edit task submission
  const handleEditSubmit = (updatedTaskData) => {
    // send updated fields to backend for the selected task
    if (!selectedTask) {
      setIsEditModalOpen(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    const url = `/todos/${selectedTask.id}`;

    const form = new FormData();
    if (updatedTaskData.title) form.append("title", updatedTaskData.title);
    if (updatedTaskData.description)
      form.append("description", updatedTaskData.description);
    if (updatedTaskData.date) form.append("date", updatedTaskData.date);
    // convert modal priority values back to backend values
    const p = (updatedTaskData.priority || "").toString().toLowerCase();
    let priorityValue = "";
    if (p.includes("extreme") || p === "extreme") priorityValue = "high";
    else if (p.includes("moderate") || p === "moderate")
      priorityValue = "medium";
    else if (p.includes("low")) priorityValue = "low";
    if (priorityValue) form.append("priority", priorityValue);
    if (updatedTaskData.status) form.append("status", updatedTaskData.status);
    // image may be a File or a string (existing filename)
    if (updatedTaskData.image && typeof updatedTaskData.image !== "string") {
      form.append("image", updatedTaskData.image);
    }

    fetch(url, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update task");
        return res.json();
      })
      .then((updated) => {
        // update local list and selected task
        setVitalTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        setSelectedTask(updated);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setIsEditModalOpen(false));
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!selectedTaskForDelete) {
      setIsDeleteModalOpen(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    const url = `/todos/${selectedTaskForDelete.id}`;
    fetch(url, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete task");
        return res.json();
      })
      .then((resp) => {
        setVitalTasks((prev) =>
          prev.filter((t) => t.id !== selectedTaskForDelete.id)
        );
        // pick next selected task (first in list) or null
        setSelectedTask((prev) => {
          const remaining = vitalTasks.filter(
            (t) => t.id !== selectedTaskForDelete.id
          );
          return remaining.length > 0 ? remaining[0] : null;
        });
        const msg = (resp && resp.message) || "Todo deleted";
        // notify Dashboard (if open) to show its slide-success message
        try {
          window.dispatchEvent(
            new CustomEvent("todo:deleted", { detail: { message: msg } })
          );
        } catch (e) {}
        // also show the same slide-success message locally
        setDeleteMessage(msg);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsDeleteModalOpen(false));
  };

  // If no selectedTask yet, show placeholder
  const emptySelected = {
    title: "No vital task selected",
    priority: "",
    status: "",
    description: "Select a task from the list to see details.",
    detailedDescription: "",
    activities: [],
  };

  // prefer explicit task.date or known backend fields; fallback to created_at
  const formatTaskDate = (task) => {
    if (!task) return "";
    const candidates = [
      task.date,
      task.due_date,
      task.dueDate,
      task.created_at,
      task.createdAt,
    ];
    const found = candidates.find((c) => c);
    if (!found) return "";
    try {
      return new Date(found).toLocaleDateString();
    } catch (e) {
      return String(found);
    }
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
      <main className="vitaltask-main">
        {/* Slide-in delete message (same markup as Dashboard) */}
        {showDeleteSuccess && (
          <div className="slide-success-message">
            <div className="slide-success-content">
              <span className="slide-success-icon">🗑️</span>
              <span className="slide-success-text">
                {deleteMessage || "Todo deleted successfully!"}
              </span>
            </div>
          </div>
        )}
        {notification && (
          <div className="notification-banner">
            {notification}
            <button className="close-btn" onClick={() => setNotification(null)}>
              
            </button>
          </div>
        )}
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
              {vitalTasks.length === 0 ? (
                <div className="empty-vital">No vital tasks found.</div>
              ) : (
                vitalTasks.map((task) => {
                  // normalize image URL
                  const imageUrl = getImageUrl(task.image);
                  const isSelected =
                    selectedTask && selectedTask.id === task.id;
                  return (
                    <div
                      key={task.id}
                      className={`vital-task-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleSelect(task)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="vital-task-main">
                        <input
                          type="checkbox"
                          className="vital-task-checkbox"
                        />
                        <div className="vital-task-content">
                          <h4 className="vital-task-title">{task.title}</h4>
                          <p className="vital-task-description">
                            {task.description}
                          </p>
                          <div className="vital-task-meta">
                            <span
                              className={`vital-task-priority priority-${(
                                task.priority || ""
                              )
                                .toString()
                                .toLowerCase()}`}
                            >
                              Priority: {displayPriority(task.priority)}
                            </span>
                            <span
                              className={`vital-task-status status-${(
                                task.status || ""
                              )
                                .toString()
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              Status: {displayStatus(task.status)}
                            </span>
                          </div>
                          <p className="vital-task-date">
                            {formatTaskDate(task)}
                          </p>
                        </div>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={task.title}
                            className="vital-task-image"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Task Details Section */}
          <section className="vital-detail-section" ref={detailRef}>
            <div className="vital-detail-card">
              <div className="vital-detail-header">
                {selectedImageUrl ? (
                  !detailImgError ? (
                    <img
                      key={imageUrlWithRetry}
                      src={imageUrlWithRetry}
                      alt={
                        (selectedTask && selectedTask.title) ||
                        emptySelected.title
                      }
                      className="detail-header-image"
                      onError={(e) => {
                        // eslint-disable-next-line no-console
                        console.warn(
                          "detail image failed to load:",
                          e?.target?.src
                        );
                        setDetailImgError(true);
                      }}
                    />
                  ) : (
                    <div
                      className="detail-header-image-fallback"
                      style={{
                        backgroundImage: `url(${imageUrlWithRetry})`,
                      }}
                    />
                  )
                ) : null}
                <div className="detail-header-info">
                  <h3 className="detail-header-title">
                    {(selectedTask && selectedTask.title) ||
                      emptySelected.title}
                  </h3>
                  <div className="detail-header-meta">
                    <span
                      className={`detail-priority priority-${(
                        (selectedTask && selectedTask.priority) ||
                        ""
                      )
                        .toString()
                        .toLowerCase()}`}
                    >
                      Priority:{" "}
                      {displayPriority(
                        (selectedTask && selectedTask.priority) ||
                          emptySelected.priority
                      )}
                    </span>
                    <span
                      className={`detail-status status-${(
                        (selectedTask && selectedTask.status) ||
                        ""
                      )
                        .toString()
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      Status:{" "}
                      {displayStatus(
                        (selectedTask && selectedTask.status) ||
                          emptySelected.status
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vital-detail-content">
                <p className="detail-short-desc">
                  {(selectedTask && selectedTask.description) ||
                    emptySelected.description}
                </p>
                <p className="detail-long-desc">
                  {(selectedTask && selectedTask.detailedDescription) ||
                    emptySelected.detailedDescription}
                </p>

                <div className="detail-activities">
                  <ol className="activities-list">
                    {(selectedTask &&
                    selectedTask.activities &&
                    selectedTask.activities.length > 0
                      ? selectedTask.activities
                      : emptySelected.activities
                    ).map((activity, index) => (
                      <li key={index} className="activity-item">
                        {activity}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="detail-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditTask(selectedTask)}
                  disabled={!selectedTask}
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteTask(selectedTask)}
                  disabled={!selectedTask}
                >
                  🗑️
                </button>
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
