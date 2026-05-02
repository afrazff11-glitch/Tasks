import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Column from "../components/board/Column";
import TaskModal from "../components/board/TaskModal";
import { Button } from "../components/ui/Button";
import { projectApi, taskApi } from "../services/api";
import { groupTasksByStatus } from "../utils/helpers";

const demoProject = {
  _id: "demo-project-1",
  name: "Launch planning",
  description: "A simple board to demonstrate columns, tasks, and quick edits.",
  status: "active",
};

const demoTasks = [
  {
    _id: "task-1",
    title: "Confirm launch checklist",
    description: "Review dependencies before moving the release forward.",
    status: "todo",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    _id: "task-2",
    title: "Refine landing page copy",
    description: "Tighten the headline and support the new product angle.",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    _id: "task-3",
    title: "Finalize sign-off notes",
    description: "Capture approvals and next-step reminders.",
    status: "done",
    priority: "low",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
  },
];

const emptyTaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(demoProject);
  const [tasks, setTasks] = useState(demoTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyTaskForm);
  const [initialStatus, setInitialStatus] = useState("todo");

  useEffect(() => {
    let active = true;

    const loadBoard = async () => {
      try {
        const [projectResponse, tasksResponse] = await Promise.all([
          projectApi.getById(projectId).catch(() => ({ data: demoProject })),
          taskApi.list(projectId).catch(() => ({ data: demoTasks })),
        ]);

        if (!active) {
          return;
        }

        setProject(projectResponse.data || demoProject);
        setTasks(tasksResponse.data?.length ? tasksResponse.data : demoTasks);
      } catch (error) {
        if (!active) {
          return;
        }
        setProject(demoProject);
        setTasks(demoTasks);
      }
    };

    loadBoard();

    return () => {
      active = false;
    };
  }, [projectId]);

  const tasksByStatus = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const openTaskModal = (status = "todo") => {
    setInitialStatus(status);
    setDraft({ ...emptyTaskForm, status });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      project: project._id,
      ...draft,
      dueDate: draft.dueDate || null,
    };

    try {
      const { data } = await taskApi.create(payload);
      setTasks((current) => [data, ...current]);
    } catch (error) {
      setTasks((current) => [
        {
          _id: `local-${Date.now()}`,
          ...payload,
          createdBy: { name: "You" },
        },
        ...current,
      ]);
    }

    setModalOpen(false);
    setDraft(emptyTaskForm);
  };

  return (
    <div className="page-stack">
      <section className="hero-card hero-card--compact">
        <div>
          <p className="eyebrow">Project board</p>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <Button onClick={() => openTaskModal("todo")} type="button">
          New task
        </Button>
      </section>

      <div className="board-grid">
        <Column title="Todo" accent="var(--tone-warm)" tasks={tasksByStatus.todo} onAddTask={() => openTaskModal("todo")} />
        <Column title="In progress" accent="var(--tone-calm)" tasks={tasksByStatus["in-progress"]} onAddTask={() => openTaskModal("in-progress")} />
        <Column title="Done" accent="var(--tone-hot)" tasks={tasksByStatus.done} onAddTask={() => openTaskModal("done")} />
      </div>

      <TaskModal
        isOpen={modalOpen}
        title={`Add task to ${project.name}`}
        values={{ ...draft, status: initialStatus }}
        onChange={handleChange}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ProjectBoard;
