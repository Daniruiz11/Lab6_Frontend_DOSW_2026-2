const NEXT_STATUS = {
  PENDING: { status: 'IN_PROGRESS', label: 'Iniciar' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Completar' },
};

function formatDate(isoDate) {
  if (!isoDate) return 'Sin fecha';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function TaskItem({ task, onEdit, onChangeStatus, onDelete }) {
  const next = NEXT_STATUS[task.status];

  return (
    <li>
      <strong>[{task.priority}] {task.title}</strong>
      <div>Estado: {task.status}</div>
      <div>Fecha: {formatDate(task.dueDate)}</div>

      <div>
        <button onClick={() => onEdit(task)}>Editar</button>
        {next && (
          <button onClick={() => onChangeStatus(task, next.status)}>
            {next.label}
          </button>
        )}
        <button onClick={() => onDelete(task.id)}>Eliminar</button>
      </div>
    </li>
  );
}

export default TaskItem;