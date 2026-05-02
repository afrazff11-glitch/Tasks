import { render, screen, fireEvent } from '@testing-library/react';
import TaskModal from '../TaskModal';
import { vi } from 'vitest';

describe('TaskModal', () => {
  const baseProps = {
    isOpen: true,
    title: 'Test modal',
    values: { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' },
    onChange: () => {},
    onClose: () => {},
    onSubmit: (e) => e.preventDefault(),
  };

  it('renders and focuses first input', () => {
    render(<TaskModal {...baseProps} />);
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeInTheDocument();
    // initial focus is on title
    expect(document.activeElement).toBe(titleInput);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<TaskModal {...baseProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
