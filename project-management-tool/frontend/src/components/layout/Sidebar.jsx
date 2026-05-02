import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__card">
        <p className="eyebrow">Workspace</p>
        <h2>Cut through the noise.</h2>
        <p>
          Track projects, move tasks across columns, and keep the team aligned without
          losing the shape of the work.
        </p>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/projects/demo" className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}>
          Project Board
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
