import React, { useState, useEffect, useMemo } from "react";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import "../styles/MyTaskPage.css";
import "../styles/VitalTaskPage.css";

// normalize image urls from backend (same logic as other pages)
const apiBase = import.meta.env.VITE_API_URL || "";
const joinUrl = (base, path) => {
  const b = (base || "").replace(/\/$/, "");
  const p = (path || "").replace(/^\//, "");
  return b ? `${b}/${p}` : `/${p}`;
};
const getImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  const cleaned = image.startsWith("/") ? image.slice(1) : image;
  if (cleaned.startsWith("uploads/")) return joinUrl(apiBase, cleaned);
  return joinUrl(apiBase, `uploads/${cleaned}`);
};

function MyTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [lastFetchStatus, setLastFetchStatus] = useState(null);
  const [lastFetchCount, setLastFetchCount] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [showSyncMessage, setShowSyncMessage] = useState(false);

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

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // request up to backend max size (backend enforces size <= 100)
      const res = await fetch(`/todos?size=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          setNotification("Not authenticated. Please log in.");
        } else {
          setNotification(
            `Failed to fetch tasks: ${res.status} ${res.statusText}`
          );
        }
        throw new Error("Failed to fetch tasks");
      }
      const data = await res.json();
      // backend sometimes returns { todos: [...] } or the array directly
      const items = data.todos || data;
      const arr = Array.isArray(items) ? items : [];
      setTasks(arr);
      setLastFetchStatus(res.status);
      setLastFetchCount(arr.length);
      if (arr.length > 0 && !selectedTask) setSelectedTask(arr[0]);
      // clear notification on success
      setNotification(null);
    } catch (err) {
      console.error(err);
      // keep notification already set above (or set generic error)
      if (!notification)
        setNotification(err.message || "Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Derived list with search, filters, and sorting
  const displayedTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const score = (p) => {
      if (!p) return 0;
      const s = p.toString().toLowerCase();
      if (s === "extreme" || s === "high") return 3;
      if (s === "moderate" || s === "medium") return 2;
      if (s === "low") return 1;
      return 0;
    };

    return tasks
      .filter((t) => {
        if (q) {
          const hay = `${t.title || ""} ${t.description || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (statusFilter) {
          if (!t.status) return false;
          if (t.status.toString().toLowerCase() !== statusFilter) return false;
        }
        if (priorityFilter) {
          if (!t.priority) return false;
          if (t.priority.toString().toLowerCase() !== priorityFilter)
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.date || b.created_at || b.createdAt || 0) -
            new Date(a.date || a.created_at || a.createdAt || 0)
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.date || a.created_at || a.createdAt || 0) -
            new Date(b.date || b.created_at || b.createdAt || 0)
          );
        }
        if (sortBy === "priority-high") {
          return score(b.priority) - score(a.priority);
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);
  const displayStatusFriendly = (s) => {
    if (!s) return "Not Started";
    const val = s.toString().toLowerCase();
    if (val === "in_progress" || val === "in-progress" || val === "in progress")
      return "In Progress";
    if (val === "pending" || val === "not started" || val === "not_started")
      return "Not Started";
    if (val === "completed") return "Completed";
    return s;
  };

  const formatTaskDate = (d) => {
    const raw = d || "";
    if (!raw) return "";
    try {
      const dt = new Date(raw);
      if (isNaN(dt)) return raw;
      return dt.toLocaleDateString();
    } catch (err) {
      return raw;
    }
  };

  const handleEditTask = (task) => {
    setSelectedTaskForEdit(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setSelectedTaskForDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (modalData, id) => {
    // modalData is a plain object coming from EditTaskModal
    try {
      const token = localStorage.getItem("access_token");
      const todoId = id || (selectedTaskForEdit && selectedTaskForEdit.id);
      if (!todoId) {
        console.error("No todo id provided for edit");
        return;
      }

      const fd = new FormData();
      if (modalData.title && modalData.title.trim() !== "")
        fd.append("title", modalData.title);
      if (modalData.description && modalData.description.trim() !== "")
        fd.append("description", modalData.description);
      if (modalData.priority) {
        // Convert modal priority labels to backend values if necessary
        const p = modalData.priority.toString().toLowerCase();
        let backendPriority = p;
        if (p === "extreme") backendPriority = "high";
        if (p === "moderate") backendPriority = "medium";
        if (p === "low") backendPriority = "low";
        fd.append("priority", backendPriority);
      }
      if (modalData.status && modalData.status.trim() !== "")
        fd.append("status", modalData.status);
      if (modalData.date && !isNaN(new Date(modalData.date).getTime()))
        fd.append("date", new Date(modalData.date).toISOString());

      // If the image is a File (new upload), append it. If it's a string (existing filename/url), skip.
      if (modalData.image && typeof modalData.image !== "string") {
        fd.append("image", modalData.image);
      }

      const res = await fetch(`/todos/${todoId}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Failed to update task: ${res.status} ${errText}`);
      }
      await fetchTasks();
      setIsEditModalOpen(false);
      setSelectedTaskForEdit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskForDelete) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/todos/${selectedTaskForDelete.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete");
      const data = await res.json();
      // dispatch an event so other pages (Dashboard) can show the message
      window.dispatchEvent(
        new CustomEvent("todo:deleted", {
          detail: { message: data.message || "Task deleted" },
        })
      );
      // also write to localStorage so other browser tabs/windows can pick it up
      try {
        localStorage.setItem(
          "todo:deleted",
          JSON.stringify({
            message: data.message || "Task deleted",
            ts: Date.now(),
          })
        );
      } catch (err) {
        // ignore storage errors
      }
      // show the same slide-in message locally so user sees it even if Dashboard isn't mounted
      setDeleteMessage(data.message || "Task deleted");
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
      await fetchTasks();
      setIsDeleteModalOpen(false);
      setSelectedTaskForDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true);
    setSyncMessage("");

    try {
      const token = localStorage.getItem("access_token");

      // First, check if user is already connected
      const statusRes = await fetch("/google-calendar/status", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!statusRes.ok) throw new Error("Failed to check calendar status");
      const statusData = await statusRes.json();

      if (!statusData.connected) {
        // Need to authenticate first
        const authRes = await fetch("/google-calendar/auth", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!authRes.ok) throw new Error("Failed to initiate Google auth");
        const authData = await authRes.json();

        // Open Google OAuth in new window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const authWindow = window.open(
          authData.authorization_url,
          "Google Calendar Authorization",
          `width=${width},height=${height},top=${top},left=${left}`
        );

        let authCompleted = false;

        // Listen for postMessage from popup
        const messageHandler = (event) => {
          if (event.data && event.data.type === "GOOGLE_CALENDAR_SUCCESS") {
            if (!authCompleted) {
              authCompleted = true;
              window.removeEventListener("message", messageHandler);
              setTimeout(() => syncTasksToCalendar(), 1000);
            }
          }
        };
        window.addEventListener("message", messageHandler);

        // Also poll for localStorage (backup method)
        let lastAuthTime = localStorage.getItem("google_calendar_auth_time");
        const pollTimer = setInterval(async () => {
          const authStatus = localStorage.getItem(
            "google_calendar_auth_status"
          );
          const authTime = localStorage.getItem("google_calendar_auth_time");

          if (authStatus === "success" && authTime !== lastAuthTime) {
            if (!authCompleted) {
              authCompleted = true;
              clearInterval(pollTimer);
              window.removeEventListener("message", messageHandler);
              localStorage.removeItem("google_calendar_auth_status");
              localStorage.removeItem("google_calendar_auth_time");

              // Token was saved by backend, now sync the tasks
              setTimeout(() => syncTasksToCalendar(), 1000);
            }
          } else if (authStatus === "error") {
            if (!authCompleted) {
              authCompleted = true;
              clearInterval(pollTimer);
              window.removeEventListener("message", messageHandler);
              const errorMsg =
                localStorage.getItem("google_calendar_auth_error") ||
                "Unknown error";
              localStorage.removeItem("google_calendar_auth_status");
              localStorage.removeItem("google_calendar_auth_error");
              setSyncMessage("Authorization failed: " + errorMsg);
              setShowSyncMessage(true);
              setTimeout(() => setShowSyncMessage(false), 4000);
              setIsSyncing(false);
            }
          }
        }, 500);

        setSyncMessage("Opening Google authorization...");
        setShowSyncMessage(true);
      } else {
        // Already connected, just sync
        await syncTasksToCalendar();
      }
    } catch (error) {
      console.error("Calendar sync error:", error);
      setSyncMessage("Failed to connect to Google Calendar: " + error.message);
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncTasksToCalendar = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const syncRes = await fetch("/google-calendar/sync", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!syncRes.ok) {
        const errorData = await syncRes.json();
        throw new Error(errorData.detail || "Failed to sync tasks");
      }

      const syncData = await syncRes.json();
      setSyncMessage(
        `✓ Successfully synced ${syncData.successful} tasks to Google Calendar!`
      );
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 5000);
    } catch (error) {
      setSyncMessage("Failed to sync: " + error.message);
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 4000);
    }
  };

  // Listen for cross-page delete events to show slide toast
  useEffect(() => {
    const onTodoDeleted = (e) => {
      try {
        const msg = (e && e.detail && e.detail.message) || "Task deleted";
        setDeleteMessage(msg);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      } catch (err) {
        // ignore
      }
    };

    const onStorage = (ev) => {
      try {
        if (ev.key === "todo:deleted" && ev.newValue) {
          const payload = JSON.parse(ev.newValue);
          const msg = (payload && payload.message) || "Task deleted";
          setDeleteMessage(msg);
          setShowDeleteSuccess(true);
          setTimeout(() => setShowDeleteSuccess(false), 3000);
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("todo:deleted", onTodoDeleted);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("todo:deleted", onTodoDeleted);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

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
          <a href="/vitaltask" className="nav-item">
            <span className="nav-icon">✓</span>
            <span className="nav-text">Vital Task</span>
          </a>
          <a href="/mytask" className="nav-item active">
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
            <button
              className="icon-btn calendar-btn"
              onClick={handleGoogleCalendarSync}
              disabled={isSyncing}
              title="Sync tasks to Google Calendar"
            >
              <span>{isSyncing ? "⏳" : "📅"}</span>
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
          {/* Task List Section */}
          <section className="vital-list-section">
            <div className="section-header">
              <h3 className="section-title">My Tasks</h3>
            </div>

            {/* filters removed per user request */}

            <div className="vital-task-list">
              {displayedTasks.length === 0 ? (
                <div className="empty-mytask">There is no task.</div>
              ) : (
                displayedTasks.map((task) => {
                  const imageUrl = getImageUrl(task.image);
                  return (
                    <div
                      key={task.id}
                      className={`vital-task-card ${
                        selectedTask && selectedTask.id === task.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedTask(task)}
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
                              Priority: {task.priority}
                            </span>
                            <span
                              className={`vital-task-status status-${(
                                task.status || "pending"
                              )
                                .toString()
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              Status: {displayStatusFriendly(task.status)}
                            </span>
                          </div>
                          <p className="vital-task-date">
                            {formatTaskDate(
                              task.date ||
                                task.created_at ||
                                task.createdAt ||
                                task.createdDate
                            )}
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
          <section className="vital-detail-section">
            {selectedTask ? (
              <div className="detail-card">
                <div className="detail-header">
                  {selectedTask.image && (
                    <img
                      src={getImageUrl(selectedTask.image)}
                      alt={selectedTask.title}
                      className="detail-header-image"
                    />
                  )}
                  <div className="detail-header-info">
                    <h3 className="detail-header-title">
                      {selectedTask.title}
                    </h3>
                    <div className="detail-header-meta">
                      <span
                        className={`detail-priority priority-${(
                          selectedTask.priority || ""
                        )
                          .toString()
                          .toLowerCase()}`}
                      >
                        Priority: {selectedTask.priority}
                      </span>
                      <span
                        className={`detail-status status-${(
                          selectedTask.status || "pending"
                        )
                          .toString()
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        Status: {displayStatusFriendly(selectedTask.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-content">
                  <p className="detail-short-desc">
                    {selectedTask.shortDescription || selectedTask.description}
                  </p>
                  <p className="detail-long-desc">{selectedTask.description}</p>

                  <div className="detail-activities">
                    <h4 className="field-label">Activities:</h4>
                    <ol className="activities-list">
                      {(selectedTask.activities || []).map(
                        (activity, index) => (
                          <li key={index} className="activity-item">
                            {activity}
                          </li>
                        )
                      )}
                    </ol>
                  </div>

                  <div className="detail-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditTask(selectedTask)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteTask(selectedTask)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="detail-card">
                <div className="detail-header-info">
                  <h3 className="detail-header-title">No task selected</h3>
                  <p className="detail-short-desc">
                    Select a task from the list to see details.
                  </p>
                </div>
              </div>
            )}
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

      {/* Slide-in delete success message (same style as Dashboard) */}
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

      {/* Google Calendar sync message */}
      {showSyncMessage && (
        <div className="slide-success-message">
          <div className="slide-success-content">
            <span className="slide-success-icon">📅</span>
            <span className="slide-success-text">{syncMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTaskPage;
