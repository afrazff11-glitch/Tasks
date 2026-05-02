export const formatDate = (value) => {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const priorityLabel = (priority) => {
  if (!priority) {
    return "medium";
  }

  return priority;
};

export const groupTasksByStatus = (tasks = []) => {
  return tasks.reduce(
    (groups, task) => {
      const key = task.status || "todo";
      groups[key].push(task);
      return groups;
    },
    { todo: [], "in-progress": [], done: [] }
  );
};
