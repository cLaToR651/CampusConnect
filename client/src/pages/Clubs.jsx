import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../auth/useAuth";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [chatClub, setChatClub] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [form, setForm] = useState({ name: "", description: "", category: "", is_recruiting: false });
  const { user } = useAuth();
  const navigate = useNavigate();

  async function loadClubs() {
    const data = await apiRequest("/clubs");
    setClubs(data);
  }

  useEffect(() => { let active = true; apiRequest("/clubs").then(async (data) => { if (!active) return; setClubs(data); if (user) { const memberships = await Promise.all(data.map((club) => apiRequest(`/clubs/${club.id}/membership`).catch(() => ({ joined: false })))); if (active) setJoinedClubs(data.filter((_, index) => memberships[index].joined).map((club) => club.id)); } }).catch((error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user]);
  useEffect(() => { if (!chatClub) return undefined; const interval = window.setInterval(() => { apiRequest(`/clubs/${chatClub.id}/messages`).then(setChatMessages).catch(() => {}); }, 2000); return () => window.clearInterval(interval); }, [chatClub]);

  async function joinClub(club) {
    if (!user) { navigate("/login"); return; }
    try { await apiRequest(`/clubs/${club.id}/join`, { method: "POST" }); setJoinedClubs((current) => [...new Set([...current, club.id])]); setMessage(`You joined ${club.name}`); openChat(club, true); }
    catch (error) { if (error.message === "Already a club member") { setJoinedClubs((current) => [...new Set([...current, club.id])]); openChat(club, true); } else setMessage(error.message); }
  }

  async function openChat(club, joined = false) {
    if (!user) { navigate("/login"); return; }
    if (!joined && !joinedClubs.includes(club.id)) { setMessage("Join this club before opening its chat"); return; }
    try { setChatMessages(await apiRequest(`/clubs/${club.id}/messages`)); setChatClub(club); setMessage(""); }
    catch (error) { setMessage(error.message); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!chatMessage.trim()) return;
    try { await apiRequest(`/clubs/${chatClub.id}/messages`, { method: "POST", body: JSON.stringify({ message: chatMessage }) }); setChatMessage(""); setChatMessages(await apiRequest(`/clubs/${chatClub.id}/messages`)); }
    catch (error) { setMessage(error.message); }
  }

  async function removeClub(club) { if (!window.confirm(`Remove ${club.name}?`)) return; try { await apiRequest(`/clubs/${club.id}`, { method: "DELETE" }); setClubs((current) => current.filter((item) => item.id !== club.id)); if (chatClub?.id === club.id) setChatClub(null); setMessage("Club removed"); } catch (error) { setMessage(error.message); } }
  async function saveClub(event) { event.preventDefault(); setMessage(""); try { const data = await apiRequest(editing ? `/clubs/${editing.id}` : "/clubs", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) }); setMessage(data.message); setEditing(null); setForm({ name: "", description: "", category: "", is_recruiting: false }); await loadClubs(); } catch (error) { setMessage(error.message); } }
  function editClub(club) { setEditing(club); setForm({ name: club.name, description: club.description, category: club.category || "", is_recruiting: Boolean(club.is_recruiting) }); }

  return <main className="page-shell">
    <header className="page-title"><p className="eyebrow">CAMPUS CLUBS</p><h1>Find your people.</h1><p>Join a club to unlock its private member chat.</p></header>
    {(user?.role === "admin" || user?.role === "club_coordinator") && <form className="admin-inline-form" onSubmit={saveClub}><h2>{editing ? "Edit club" : "Add club"}</h2><input placeholder="Club name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><label className="checkbox-label"><input type="checkbox" checked={form.is_recruiting} onChange={(e) => setForm({ ...form, is_recruiting: e.target.checked })} /> Recruiting members</label><div><button className="primary-btn" type="submit">{editing ? "Save changes" : "Add club"}</button>{editing && <button className="outline-btn" type="button" onClick={() => setEditing(null)}>Cancel</button>}</div></form>}
    {message && <p className="settings-message" role="status">{message}</p>}
    <section className="club-grid">{loading ? <Empty title="Loading clubs" /> : clubs.length ? clubs.map((club) => <article className="club-card" key={club.id}><div className="club-avatar">{club.name[0]}</div><p className="tag">{club.category || "Campus club"}</p><h3>{club.name}</h3><p>{club.description}</p><footer><span>{club.member_count} members</span>{club.is_recruiting ? <b>Recruiting now</b> : <span>Established club</span>}{user && !joinedClubs.includes(club.id) && <button className="primary-btn" type="button" onClick={() => joinClub(club)}>Join club</button>}{user && joinedClubs.includes(club.id) && <button className="outline-btn" type="button" onClick={() => openChat(club)}>Open chat</button>}{(user?.role === "admin" || user?.role === "club_coordinator") && <><button className="outline-btn" type="button" onClick={() => editClub(club)}>Edit</button><button className="danger-btn" type="button" onClick={() => removeClub(club)}>Remove</button></>}</footer></article>) : <Empty title="No clubs listed yet" text="The clubs you follow will appear here." />}</section>
    {chatClub && <section className="club-chat"><div className="club-chat-heading"><div><p className="eyebrow">PRIVATE CLUB CHAT</p><h2>{chatClub.name}</h2></div><button className="outline-btn" type="button" onClick={() => setChatClub(null)}>Close</button></div><div className="club-chat-messages">{chatMessages.length ? chatMessages.map((item) => <article key={item.id}><b>{item.author_name}</b><p>{item.message}</p><time>{new Date(item.created_at).toLocaleString("en-IN")}</time></article>) : <p className="muted">No messages yet. Start the conversation.</p>}</div><form className="club-chat-form" onSubmit={sendMessage}><input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Write to club members..." /><button className="primary-btn" type="submit">Send</button></form></section>}
  </main>;
}

function Empty({ title, text = "Please check back soon." }) { return <div className="empty-panel"><span>+</span><h3>{title}</h3><p>{text}</p></div>; }
export default Clubs;
