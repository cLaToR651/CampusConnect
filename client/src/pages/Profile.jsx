import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../auth/useAuth";

const badgeOptions = ["Hackathon", "Coder", "Frontend", "Backend", "Designer", "Researcher", "Team lead", "Public speaker"];

function Profile() {
  const { user, saveSession, logout } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: user?.name || "", username: user?.username || "", bio: user?.bio || "", skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "", department_id: user?.department_id || "", academic_year: user?.academic_year || "", badges: user?.badges || [] });
  const [message, setMessage] = useState("");
  useEffect(() => { let active = true; apiRequest("/departments").then((data) => { if (active) setDepartments(data); }).catch(() => {}); return () => { active = false; }; }, []);
  if (!user) return <main className="page-shell"><h1>Please login to view your profile.</h1></main>;
  function toggleBadge(badge) { setForm((current) => ({ ...current, badges: current.badges.includes(badge) ? current.badges.filter((item) => item !== badge) : [...current.badges, badge] })); }
  async function submit(event) { event.preventDefault(); setMessage(""); try { const data = await apiRequest("/auth/profile", { method: "PATCH", body: JSON.stringify({ ...form, skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean) }) }); saveSession({ token: localStorage.getItem("campusconnect_token"), user: data.user }); setMessage("Profile saved successfully."); } catch (error) { setMessage(error.message); } }
  return <main className="page-shell"><header className="page-title"><p className="eyebrow">PROFILE SETTINGS</p><h1>Make your profile yours.</h1><p>Add details so campus peers can find the right people for teams and conversations.</p></header><section className="settings-layout"><form className="settings-card" onSubmit={submit}><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="your.username" required /></label><label>MIT-WPU email<input value={user.email} disabled /></label><label>Department<select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label>Academic year<select value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}><option value="">Select year</option>{["1st", "2nd", "3rd", "4th"].map((year) => <option key={year} value={year}>{year} year</option>)}</select></label><label>About you<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell campus peers a little about yourself" /></label><label>Skills<input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, design, public speaking" /></label><fieldset className="badge-selector"><legend>Profile badges</legend><div className="badge-row">{badgeOptions.map((badge) => <button type="button" className={`profile-badge ${form.badges.includes(badge) ? "selected" : ""}`} key={badge} onClick={() => toggleBadge(badge)}>{badge}</button>)}</div></fieldset>{message && <p className="settings-message">{message}</p>}<button className="primary-btn" type="submit">Save changes</button></form><aside className="settings-card danger-zone"><h3>Account</h3><p>Signed in as <b>{user.email}</b></p><button type="button" onClick={() => { logout(); navigate("/"); }} className="logout-wide">Logout</button></aside></section></main>;
}
export default Profile;
