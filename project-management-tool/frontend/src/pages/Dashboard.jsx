import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificationApi, projectApi } from "../services/api";
import { formatDate } from "../utils/helpers";

const demoProjects = [
  {
    _id: "demo-project-1",
    name: "Signal launch",
    description: "Orchestrate milestones, approvals, and release pacing.",
    status: "active",
    color: "#8f7bff",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "demo-project-2",
    name: "Interface shift",
    description: "Refine the component language and visual rhythm.",
    status: "planning",
    color: "#24d6c8",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const demoNotifications = [
  {
    _id: "notification-1",
    message: "Team review scheduled for Thursday.",
    createdAt: new Date().toISOString(),
    isRead: false,
  },
];

const Dashboard = () => {
  const [projects, setProjects] = useState(demoProjects);
  const [notifications, setNotifications] = useState(demoNotifications);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [projectsResponse, notificationsResponse] = await Promise.all([
          projectApi.list(),
          notificationApi.list(),
        ]);

        if (!active) {
          return;
        }

        setProjects(projectsResponse.data.length ? projectsResponse.data : demoProjects);
        setNotifications(notificationsResponse.data.length ? notificationsResponse.data : demoNotifications);
      } catch (error) {
        if (!active) {
          return;
        }
        setProjects(demoProjects);
        setNotifications(demoNotifications);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const activeProjects = projects.filter((project) => project.status !== "completed").length;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Command center</p>
          <h1>Work gets louder when the signal is clear.</h1>
          <p>
            Track projects, surface changes, and move straight into the board when the team needs focus.
          </p>
        </div>
        <div className="hero-card__stats">
          <div>
            <strong>{projects.length}</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>{activeProjects}</strong>
            <span>Active</span>
          </div>
          <div>
            <strong>{unreadNotifications}</strong>
            <span>Updates</span>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="card stat-card">
          <p className="eyebrow">Focus</p>
          <h3>Clean routing beats scattered updates.</h3>
          <p>Use the board to expose bottlenecks before they spread across the team.</p>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Cadence</p>
          <h3>{notifications[0] ? formatDate(notifications[0].createdAt) : "Today"}</h3>
          <p>The latest collaboration signal pulled from the notification stream.</p>
        </article>
      </section>

      <section className="section-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h2>Active lanes</h2>
        </div>
        <Link to="/projects/demo" className="text-link">
          Open board
        </Link>
      </section>

      <section className="project-grid">
        {projects.map((project) => (
          <article className="card project-card" key={project._id}>
            <div className="project-card__swatch" style={{ backgroundColor: project.color || "#0f766e" }} />
            <p className="eyebrow">{project.status}</p>
            <h3>{project.name}</h3>
            <p>{project.description || "No project description provided."}</p>
            <Link to={`/projects/${project._id}`} className="text-link">
              View board
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
