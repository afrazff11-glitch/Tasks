import { formatDate } from "../../utils/helpers";

const priorityTone = {
  low: "var(--tone-calm)",
  medium: "var(--tone-warm)",
  high: "var(--tone-hot)",
};

const TaskCard = ({ task }) => {
  const tone = priorityTone[task.priority] || "var(--tone-warm)";

  return (
    <article className="task-card">
      <div className="task-card__meta">
        <span className="task-card__priority" style={{ backgroundColor: tone }}>
          {task.priority || "medium"}
        </span>
        <span className="task-card__date">{formatDate(task.dueDate)}</span>
      </div>
      <h4>{task.title}</h4>
      <p>{task.description || "No description provided."}</p>
    </article>
  );
};

export default TaskCard;
