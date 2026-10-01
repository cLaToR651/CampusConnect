import { Link } from "react-router-dom";

const sections = [
  ["A", "Academic hub", "Find department-wise notes, syllabi, PPTs and previous papers.", "/academics"],
  ["E", "Events calendar", "Never miss a hackathon, workshop, competition or campus activity.", "/events"],
  ["C", "Club central", "See what every club is doing and where they are recruiting.", "/clubs"],
  ["T", "Teams & tips", "Form multidisciplinary teams and learn from past participants.", "/community"],
];

function Home() {
  return <main>
    <section className="hero"><div><p className="eyebrow">ONE CAMPUS. ONE PLACE.</p><h1>Learn together.<br /><span>Build what matters.</span></h1><p>Notes, opportunities, clubs, events, teams and advice from students who have been there.</p><div className="hero-actions"><Link to="/academics" className="primary-btn">Explore resources</Link><Link to="/events" className="ghost-btn">Browse events</Link></div></div><div className="hero-orbit"><b>Campus<br />Connect</b><i>Notes</i><i>Events</i><i>Teams</i><i>Clubs</i></div></section>
    <section className="content-section"><div className="section-heading"><p className="eyebrow">DISCOVER</p><h2>Your campus, organised.</h2></div><div className="feature-grid">{sections.map(([mark, title, text, to]) => <Link to={to} className="feature-card" key={title}><span className="feature-mark">{mark}</span><h3>{title}</h3><p>{text}</p><b>Explore →</b></Link>)}</div></section>
    <section className="callout"><div><p className="eyebrow">FOR EVERY STUDENT</p><h2>From your first note to your next big idea.</h2><p>CampusConnect brings useful campus information out of scattered groups and into one reliable home.</p></div><Link to="/community" className="primary-btn">Find your people</Link></section>
  </main>;
}
export default Home;
