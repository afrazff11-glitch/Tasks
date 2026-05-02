import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';

const TaskModal = ({ isOpen, title, values, onChange, onClose, onSubmit }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const node = modalRef.current;
    if (!node) return;

    // focus first focusable element inside modal
    const focusable = node.querySelectorAll(FOCUSABLE);
    if (focusable && focusable.length) {
      focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose && onClose();
        return;
      }

      if (e.key === "Tab") {
        // focus trap
        const elements = Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!elements.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <p className="eyebrow">Task composer</p>
            <h3 id="task-modal-title">{title}</h3>
          </div>
          <Button variant="ghost" type="button" onClick={onClose}>
            Close
          </Button>
        </div>

        <form className="modal__form" onSubmit={onSubmit}>
          <Input label="Title" name="title" value={values.title} onChange={onChange} placeholder="Design review" required />
          <Input label="Description" name="description" value={values.description} onChange={onChange} placeholder="Describe the work" multiline rows="4" />
          <div className="modal__grid">
            <label className="input-group">
              <span className="input-label">Status</span>
              <select className="input" name="status" value={values.status} onChange={onChange}>
                <option value="todo">Todo</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="input-group">
              <span className="input-label">Priority</span>
              <select className="input" name="priority" value={values.priority} onChange={onChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <Input label="Due date" type="date" name="dueDate" value={values.dueDate} onChange={onChange} />
          <div className="modal__actions">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
