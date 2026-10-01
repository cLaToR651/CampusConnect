import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import Academics from "./pages/Academics";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { useAuth } from "./auth/useAuth";

import "./App.css";

function App() {
  const { user, isLoading } = useAuth();
  return (
    <BrowserRouter>

      <nav className="navbar">

        <Link to="/" className="logo">
          🎓 Campus<span>Connect</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/academics">Academics</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/clubs">Clubs</NavLink>
          <NavLink to="/community">Community</NavLink>
        </div>

        {isLoading ? null : user ? <Link to="/profile" className="login-btn">Hi, {user.name.split(" ")[0]}</Link> : <Link to="/login" className="login-btn">Login</Link>}

      </nav>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/academics"
          element={<Academics />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/clubs"
          element={<Clubs />}
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
