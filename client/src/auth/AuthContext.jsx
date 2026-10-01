import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { AuthContext } from "./context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function restoreSession() {
      if (!localStorage.getItem("campusconnect_token")) return setIsLoading(false);
      try { const data = await apiRequest("/auth/me"); setUser(data.user); }
      catch { localStorage.removeItem("campusconnect_token"); }
      finally { setIsLoading(false); }
    }
    restoreSession();
  }, []);
  function saveSession(data) { localStorage.setItem("campusconnect_token", data.token); setUser(data.user); }
  function logout() { localStorage.removeItem("campusconnect_token"); setUser(null); }
  return <AuthContext.Provider value={{ user, isLoading, saveSession, logout }}>{children}</AuthContext.Provider>;
}
