import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../auth/useAuth";

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === "register";
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const data = await apiRequest(isRegister ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify(body) });
      saveSession(data); navigate("/");
    } catch (requestError) { setError(requestError.message); }
    finally { setIsSubmitting(false); }
  }
  return (
    <main className="auth-page"><section className="auth-card">
      <p className="dashboard-label">CAMPUS CONNECT</p>
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="auth-subtitle">{isRegister ? "Join your campus community in a few seconds." : "Sign in to share, learn, and collaborate."}</p>
      <form onSubmit={submit} className="auth-form">
        {isRegister && <label>Full name<input name="name" value={form.name} onChange={updateField} placeholder="Your name" required /></label>}
        <label>MIT-WPU email<input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@mitwpu.edu.in" pattern=".+@mitwpu\.edu\.in" title="Use your MIT-WPU email address" required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={updateField} placeholder="Minimum 8 characters" minLength="8" required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="primary-btn auth-submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Login"}</button>
      </form>
      {isRegister && <p className="campus-email-note">Only verified MIT-WPU email addresses can create an account.</p>}
      <p className="auth-switch">{isRegister ? "Already have an account?" : "New to CampusConnect?"}<button type="button" onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); }}>{isRegister ? " Login" : " Create an account"}</button></p>
    </section></main>
  );
}

export default Login;
