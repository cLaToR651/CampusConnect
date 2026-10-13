import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../auth/useAuth";

const badgeOptions = [
  "Hackathon",
  "Coder",
  "Frontend",
  "Backend",
  "Designer",
  "Researcher",
  "Team lead",
  "Public speaker",
];

function Profile() {
  const { user, saveSession, logout } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
    department_id: user?.department_id || "",
    academic_year: user?.academic_year || "",
    badges: user?.badges || [],
  });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest("/departments")
      .then((data) => {
        if (active) setDepartments(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return (
      <main className="page-shell">
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>Please login to view your profile</h3>
          <p>Sign in with your campus account to customize your profile and settings.</p>
        </div>
      </main>
    );
  }

  function toggleBadge(badge) {
    setForm((current) => ({
      ...current,
      badges: current.badges.includes(badge)
        ? current.badges.filter((item) => item !== badge)
        : [...current.badges, badge],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    try {
      const data = await apiRequest("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          skills: form.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      saveSession({
        token: localStorage.getItem("campusconnect_token"),
        user: data.user,
      });
      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-shell profile-page-shell">
      <header className="page-title">
        <p className="eyebrow">PROFILE SETTINGS</p>
        <h1>Make your profile yours.</h1>
        <p>Add details so campus peers can find the right people for teams and conversations.</p>
      </header>

      <div className="profile-layout-cards">
        {/* Left Column: Form Cards */}
        <form className="profile-form-flow" onSubmit={submit}>
          {/* Card 1: Basic Information */}
          <section className="profile-card">
            <div className="card-header-row">
              <div className="card-icon-tag bg-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="card-headline">Basic Information</h3>
                <p className="card-subtext">Your public identity on CampusConnect</p>
              </div>
            </div>

            <div className="card-input-grid">
              <label className="field-group">
                <span className="field-label">Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="your.username"
                  required
                />
              </label>
            </div>

            <label className="field-group">
              <span className="field-label">MIT-WPU email <span className="label-badge">Verified</span></span>
              <div className="input-with-lock">
                <input type="email" value={user.email} disabled />
                <svg className="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="field-hint">Campus email cannot be changed</span>
            </label>
          </section>

          {/* Card 2: Academic Details */}
          <section className="profile-card">
            <div className="card-header-row">
              <div className="card-icon-tag bg-pink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <div>
                <h3 className="card-headline">Academic Details</h3>
                <p className="card-subtext">Department and year on campus</p>
              </div>
            </div>

            <div className="card-input-grid">
              <label className="field-group">
                <span className="field-label">Department</span>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-group">
                <span className="field-label">Academic year</span>
                <select
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                >
                  <option value="">Select year</option>
                  {["1st", "2nd", "3rd", "4th"].map((year) => (
                    <option key={year} value={year}>
                      {year} year
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Card 3: Bio & About */}
          <section className="profile-card">
            <div className="card-header-row">
              <div className="card-icon-tag bg-sky">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="card-headline">About You</h3>
                <p className="card-subtext">A brief introduction for prospective teammates</p>
              </div>
            </div>

            <label className="field-group">
              <span className="field-label">Bio</span>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell campus peers a little about yourself, what you are working on, and what you're interested in..."
                rows={4}
              />
            </label>
          </section>

          {/* Card 4: Skills & Badges */}
          <section className="profile-card">
            <div className="card-header-row">
              <div className="card-icon-tag bg-mint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div>
                <h3 className="card-headline">Skills & Badges</h3>
                <p className="card-subtext">Highlight your superpowers and roles</p>
              </div>
            </div>

            <label className="field-group">
              <span className="field-label">Skills (comma separated)</span>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="React, UI Design, Python, Public Speaking"
              />
            </label>

            <div className="field-group">
              <span className="field-label">Profile badges (Click to select)</span>
              <div className="badge-chip-grid">
                {badgeOptions.map((badge) => {
                  const isSelected = form.badges.includes(badge);
                  return (
                    <button
                      type="button"
                      key={badge}
                      className={`badge-chip ${isSelected ? "badge-selected" : ""}`}
                      onClick={() => toggleBadge(badge)}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {badge}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Save Bar */}
          <div className="profile-actions-bar">
            {message && (
              <div className={`status-toast ${message.includes("successfully") ? "toast-success" : "toast-error"}`}>
                {message}
              </div>
            )}
            <button className="primary-btn save-btn" type="submit" disabled={isSaving}>
              {isSaving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>

        {/* Right Column: Account Card */}
        <aside className="profile-side-col">
          <div className="profile-card account-card">
            <div className="account-avatar-banner">
              <div className="account-big-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <h3 className="account-name">{user.name || "Student"}</h3>
              <p className="account-email">{user.email}</p>
            </div>

            <div className="account-divider"></div>

            <div className="account-meta-list">
              <div className="meta-item">
                <span className="meta-title">Status</span>
                <span className="meta-pill-online">Active Member</span>
              </div>
              <div className="meta-item">
                <span className="meta-title">Role</span>
                <span className="meta-value">{user.role || "Student"}</span>
              </div>
            </div>

            <div className="account-divider"></div>

            <div className="account-danger-actions">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="logout-action-btn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Profile;
