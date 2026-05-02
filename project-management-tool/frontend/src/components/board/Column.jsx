import TaskCard from "./TaskCard";
import { Button } from "../ui/Button";

const Column = ({ title, accent, tasks = [], onAddTask }) => {
  return (
    <section className="column" style={{ borderTopColor: accent }}>
      <div className="column__header">
        <div>
          <p className="eyebrow">{tasks.length} cards</p>
          <h3>{title}</h3>
        </div>
        <Button variant="ghost" onClick={onAddTask} type="button">
          Add
        </Button>
      </div>

      <div className="column__list">
        {tasks.length ? tasks.map((task) => <TaskCard key={task._id || task.title} task={task} />) : <div className="column__empty">Nothing here yet.</div>}
      </div>
    </section>
  );
};

export default Column;
