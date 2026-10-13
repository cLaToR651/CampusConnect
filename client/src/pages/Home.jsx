import { Link } from "react-router-dom";

const discoverSections = [
  {
    iconBg: "#ede9fe",
    iconColor: "#6366f1",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    title: "Academic Hub",
    description: "Find and share notes, previous year papers, and useful resources.",
    to: "/login",
    cardClass: "card-academics",
  },
  {
    iconBg: "#fee2e2",
    iconColor: "#ef4444",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    title: "Events Calendar",
    description: "Discover upcoming events, workshops, and competitions.",
    to: "/login",
    cardClass: "card-events",
  },
  {
    iconBg: "#e0f2fe",
    iconColor: "#0284c7",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: "Club Central",
    description: "Explore and join clubs that match your interests.",
    to: "/login",
    cardClass: "card-clubs",
  },
  {
    iconBg: "#dcfce7",
    iconColor: "#10b981",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: "Teams & Tips",
    description: "Connect with peers, form teams and get helpful advice.",
    to: "/login",
    cardClass: "card-teams",
  },
];

function Home() {
  return (
    <main className="home-canvas">
      {/* Background ambient lighting glows */}
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-center" />
      <div className="ambient-glow glow-mid-left" />
      <div className="ambient-glow glow-right" />

      {/* Hero Section */}
      <section className="hero-container">
        <div className="hero-content-col">
          <div className="hero-pill-badge">
            <span className="badge-icon">🎓</span>
            <span>YOUR CAMPUS, CONNECTED</span>
          </div>

          <h1 className="hero-headline">
            Learn together.<br />
            <span className="gradient-text">Build what matters.</span>
          </h1>

          <p className="hero-subline">
            Notes, opportunities, clubs, events, teams and advice from students who have been there.
          </p>

          <div className="hero-cta-group">
            <Link to="/login" className="cta-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Explore resources</span>
              <svg className="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link to="/login" className="cta-btn-ghost">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Browse events</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup Section with 3D Float Cards */}
        <div className="hero-visual-col">
          {/* Decorative flying paper plane & graduation cap */}
          <div className="floating-deco deco-plane">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </div>

          <div className="floating-deco deco-cap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#6366f1" opacity="0.8">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z"/>
              <path d="M5 13.18V17.18C5 19.84 8.13 22 12 22C15.87 22 19 19.84 19 17.18V13.18L12 17L5 13.18Z"/>
            </svg>
          </div>

          {/* Dotted orbit curve behind */}
          <svg className="orbit-curve" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="210" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="6 8" opacity="0.6"/>
          </svg>

          {/* Central Mockup Laptop */}
          <div className="laptop-stage">
            <div className="laptop-device">
              <div className="laptop-screen-frame">
                <div className="laptop-camera"></div>
                <div className="laptop-display">
                  <img
                    src="/campus-screen.jpg"
                    alt="Campus Courtyard and Students"
                    className="laptop-screen-img"
                    onError={(e) => {
                      // Fallback gradient if file is missing
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="screen-fallback-gradient" />
                </div>
              </div>
              <div className="laptop-base">
                <div className="laptop-notch"></div>
              </div>
              <div className="laptop-shadow"></div>
            </div>

            {/* 4 Floating Feature Action Cards */}
            {/* Top-Left: Study Notes */}
            <Link to="/login" className="hero-feature-pill pill-notes">
              <div className="pill-icon-box box-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div className="pill-content">
                <h4>Study Notes</h4>
                <p>Access study materials shared by students</p>
              </div>
              <div className="pill-arrow-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Top-Right: Upcoming Events */}
            <Link to="/login" className="hero-feature-pill pill-events">
              <div className="pill-icon-box box-pink">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="pill-content">
                <h4>Upcoming Events</h4>
                <p>Workshops, fests and more</p>
              </div>
              <div className="pill-arrow-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Bottom-Left: Student Clubs */}
            <Link to="/login" className="hero-feature-pill pill-clubs">
              <div className="pill-icon-box box-sky">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="pill-content">
                <h4>Student Clubs</h4>
                <p>Join communities that match your interests</p>
              </div>
              <div className="pill-arrow-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Bottom-Right: Team & Tips */}
            <Link to="/login" className="hero-feature-pill pill-tips">
              <div className="pill-icon-box box-mint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div className="pill-content">
                <h4>Team & Tips</h4>
                <p>Get advice and collaborate</p>
              </div>
              <div className="pill-arrow-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section className="discover-section">
        <div className="discover-header">
          <div>
            <span className="discover-eyebrow">DISCOVER</span>
            <h2 className="discover-title">Your campus, organised.</h2>
          </div>
          <Link to="/academics" className="view-all-btn">
            <span>View all</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <div className="discover-grid">
          {discoverSections.map((sec, idx) => (
            <Link to={sec.to} key={idx} className={`discover-card ${sec.cardClass}`}>
              <div className="discover-card-icon" style={{ background: sec.iconBg }}>
                {sec.icon}
              </div>
              <h3 className="discover-card-title">{sec.title}</h3>
              <p className="discover-card-desc">{sec.description}</p>
              <div className="discover-card-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
