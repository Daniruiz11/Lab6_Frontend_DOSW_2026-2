import TaskItem from './TaskItem';

function TaskList({ tasks, onEdit, onChangeStatus, onDelete }) {
  return (
    <section>
      <h2>TAREAS</h2>

      {tasks.length === 0 ? (
        <p>No hay tareas.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;