import { useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../auth/useAuth";

function Admin() {
  const { user } = useAuth();
  const [form, setForm] = useState({ type: "event", title: "", description: "", event_type: "workshop", starts_at: "", venue: "", name: "", category: "", is_recruiting: false });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  if (!user) return <main className="page-shell"><h1>Login required</h1><p className="muted">Sign in with your admin account to manage campus content.</p></main>;
  if (user.role !== "admin") return <main className="page-shell"><h1>Access denied</h1><p className="muted">This area is available only to administrators.</p></main>;
  function update(event) { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value })); }
  async function submit(event) {
    event.preventDefault(); setMessage(""); setIsSaving(true);
    const body = form.type === "event" ? { title: form.title, description: form.description, event_type: form.event_type, starts_at: form.starts_at, venue: form.venue } : { name: form.name, description: form.description, category: form.category, is_recruiting: form.is_recruiting };
    try { const data = await apiRequest(`/${form.type}s`, { method: "POST", body: JSON.stringify(body) }); setMessage(data.message); setForm((current) => ({ ...current, title: "", description: "", starts_at: "", venue: "", name: "", category: "", is_recruiting: false })); }
    catch (error) { setMessage(error.message); }
    finally { setIsSaving(false); }
  }
  return <main className="page-shell"><header className="page-title"><p className="eyebrow">ADMIN CONSOLE</p><h1>Manage campus content.</h1><p>Create events and clubs that students can discover across CampusConnect.</p></header><section className="admin-layout"><form className="settings-card" onSubmit={submit}><label>Content type<select name="type" value={form.type} onChange={update}><option value="event">Event</option><option value="club">Club</option></select></label>{form.type === "event" ? <><label>Event title<input name="title" value={form.title} onChange={update} required /></label><label>Description<textarea name="description" value={form.description} onChange={update} required /></label><label>Event type<select name="event_type" value={form.event_type} onChange={update}><option value="workshop">Workshop</option><option value="competition">Competition</option><option value="hackathon">Hackathon</option><option value="other">Other</option></select></label><label>Starts at<input name="starts_at" type="datetime-local" value={form.starts_at} onChange={update} required /></label><label>Venue<input name="venue" value={form.venue} onChange={update} /></label></> : <><label>Club name<input name="name" value={form.name} onChange={update} required /></label><label>Description<textarea name="description" value={form.description} onChange={update} required /></label><label>Category<input name="category" value={form.category} onChange={update} placeholder="Technical, cultural, sports..." /></label><label className="checkbox-label"><input name="is_recruiting" type="checkbox" checked={form.is_recruiting} onChange={update} /> Recruiting members</label></>}<button className="primary-btn" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : `Create ${form.type}`}</button>{message && <p className="settings-message" role="status">{message}</p>}</form><aside className="admin-summary"><span className="feature-mark">A</span><h2>Welcome, {user.name}.</h2><p className="muted">Your account has administrator access. New events are saved through the protected API and will appear once published.</p><p className="muted">Use the public Events and Clubs pages to verify what students can see.</p></aside></section></main>;
}

export default Admin;