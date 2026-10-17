import { useState } from 'react';

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
};

function TaskForm({ onSubmit, taskToEdit = null, onCancel }) {
  const [form, setForm] = useState(
    taskToEdit
      ? {
          title: taskToEdit.title,
          description: taskToEdit.description ?? '',
          priority: taskToEdit.priority,
          dueDate: taskToEdit.dueDate ?? '',
        }
      : EMPTY_FORM
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      dueDate: form.dueDate || null,
    });

    if (ok && !taskToEdit) {
      setForm(EMPTY_FORM);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{taskToEdit ? 'Editar tarea' : 'Nueva tarea'}</h2>

      <div>
        <label htmlFor="title">Título:</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          maxLength={120}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Descripción:</label>
        <input
          id="description"
          name="description"
          type="text"
          value={form.description}
          onChange={handleChange}
          maxLength={500}
        />
      </div>

      <div>
        <label htmlFor="priority">Prioridad:</label>
        <select
          id="priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div>
        <label htmlFor="dueDate">Fecha límite:</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Guardar</button>
      {taskToEdit && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
}

export default TaskForm;