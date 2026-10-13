import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Academics from "./pages/Academics";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { useAuth } from "./auth/useAuth";
import { apiRequest } from "./api";

import "./App.css";

function NavbarContent({ user, isLoading, logout }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [resources, events, clubs] = await Promise.all([
          apiRequest("/resources").catch(() => []),
          apiRequest("/events").catch(() => []),
          apiRequest("/clubs").catch(() => []),
        ]);

        const q = searchQuery.toLowerCase();
        const matched = [];

        resources.filter(r => r.title.toLowerCase().includes(q) || (r.subject_name && r.subject_name.toLowerCase().includes(q)))
          .slice(0, 3)
          .forEach(r => matched.push({ type: "Resource", title: r.title, sub: r.subject_name || "Academic", link: "/academics" }));

        events.filter(e => e.title.toLowerCase().includes(q) || (e.venue && e.venue.toLowerCase().includes(q)))
          .slice(0, 3)
          .forEach(e => matched.push({ type: "Event", title: e.title, sub: e.venue || "Campus Event", link: "/events" }));

        clubs.filter(c => c.name.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q)))
          .slice(0, 3)
          .forEach(c => matched.push({ type: "Club", title: c.name, sub: c.category || "Student Club", link: "/clubs" }));

        setSearchResults(matched);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch dynamic notifications periodically when user is logged in
  useEffect(() => {
    if (!user) return;
    let active = true;

    async function fetchNotifications() {
      try {
        const notifs = await apiRequest("/social/notifications");
        if (!active) return;
        setNotifications(notifs);
        const unread = notifs.filter(n => n.unread).length;
        setUnreadCount(unread);
      } catch (err) {
        // Silently handle if network error
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  function formatRelativeTime(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  function getNotifIcon(type) {
    switch (type) {
      case "event": return "📅";
      case "resource": return "📄";
      case "friend": return "👋";
      case "message": return "💬";
      default: return "🔔";
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to={user ? "/academics" : "/"} className="brand-logo">
          <span className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="#5850EC"/>
              <path d="M5 13.18V17.18C5 19.84 8.13 22 12 22C15.87 22 19 19.84 19 17.18V13.18L12 17L5 13.18Z" fill="#5850EC"/>
            </svg>
          </span>
          <span className="brand-text">Campus<span className="brand-accent">Connect</span></span>
        </Link>

        <div className="nav-links">
          {user && (
            <>
              <NavLink to="/academics">Academics</NavLink>
              <NavLink to="/events">Events</NavLink>
              <NavLink to="/clubs">Clubs</NavLink>
              <NavLink to="/community">Community</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <>
            {/* Interactive Search Bar */}
            <div className="nav-search-wrapper" ref={searchRef}>
              <div className="nav-search-bar">
                <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search notes, events, clubs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchQuery.trim() && (
                <div className="search-dropdown-menu">
                  <div className="dropdown-section-title">
                    {isSearching ? "Searching campus..." : searchResults.length ? "Search Results" : "No results found"}
                  </div>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="search-result-row"
                      onClick={() => {
                        navigate(item.link);
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                      }}
                    >
                      <span className={`search-type-tag tag-${item.type.toLowerCase()}`}>{item.type}</span>
                      <div className="search-result-info">
                        <span className="search-result-title">{item.title}</span>
                        <span className="search-result-sub">{item.sub}</span>
                      </div>
                      <span className="search-arrow">➔</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responsive Interactive Notifications */}
            <div className="nav-notif-wrapper" ref={notifRef}>
              <button
                className="nav-icon-btn"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="nav-badge-dot"></span>}
              </button>

              {showNotifications && (
                <div className="notif-dropdown-menu">
                  <div className="notif-dropdown-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 && (
                      <span className="notif-read-all" onClick={() => setUnreadCount(0)}>All caught up</span>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${n.unread ? "notif-unread" : ""}`}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="notif-icon-circle">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="notif-info">
                            <p className="notif-text">{n.title}</p>
                            <span className="notif-time">{formatRelativeTime(n.time)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">
                        <span>🔔</span>
                        <p>No new campus notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="nav-profile-wrapper" ref={userMenuRef}>
              <button
                type="button"
                className="user-profile-pill"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <span>Hi, {user.name ? user.name.split(" ")[0] : "Student"}</span>
                <svg className={`user-chevron ${showUserMenu ? "rotate-chevron" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {showUserMenu && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <span className="user-dropdown-name">{user.name || "Student"}</span>
                    <span className="user-dropdown-handle">@{user.username || "student"}</span>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>View Profile</span>
                  </button>
                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate("/", { replace: true });
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="nav-login-btn">
            <span className="login-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </span>
            <span>Login</span>
          </Link>
        )}
      </div>

    </nav>
  );
}

function App() {
  const { user, isLoading, logout } = useAuth();
  return (
    <BrowserRouter>

      <NavbarContent user={user} isLoading={isLoading} logout={logout} />

      <Routes>

        <Route
          path="/"
          element={
            isLoading ? null : user ? <Navigate to="/academics" replace /> : <Home />
          }
        />

        <Route
          path="/academics"
          element={
            isLoading ? null : user ? <Academics /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/events"
          element={
            isLoading ? null : user ? <Events /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/clubs"
          element={
            isLoading ? null : user ? <Clubs /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/community"
          element={
            isLoading ? null : user ? <Community /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/academics" replace /> : <Login />}
        />

        <Route
          path="/profile"
          element={
            isLoading ? null : user ? <Profile /> : <Navigate to="/" replace />
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={user ? "/academics" : "/"} replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
