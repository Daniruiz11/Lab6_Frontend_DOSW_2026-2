import { useState } from "react";
import useTasks from "../hooks/useTasks";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

function TasksPage() {
  const { tasks, loading, error, addTask, editTask, removeTask } = useTasks();
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleSubmit = async (data) => {
    if (taskToEdit) {
      // el PUT exige status, y el formulario no lo trae: se conserva el de la tarea
      const ok = await editTask(taskToEdit.id, {
        ...data,
        status: taskToEdit.status,
      });
      if (ok) setTaskToEdit(null);
      return ok;
    }
    return addTask(data);
  };

  const handleChangeStatus = (task, newStatus) =>
    editTask(task.id, {
      title: task.title,
      description: task.description,
      status: newStatus,
      priority: task.priority,
      dueDate: task.dueDate,
    });

  const handleDelete = async (id) => {
    const ok = await removeTask(id);
    if (ok && taskToEdit?.id === id) setTaskToEdit(null);
  };

  return (
    <main>
      <h1>TO DO</h1>

      {error && <p role="alert">Error: {error}</p>}

      <TaskForm
        key={taskToEdit?.id ?? "new"}
        taskToEdit={taskToEdit}
        onSubmit={handleSubmit}
        onCancel={() => setTaskToEdit(null)}
      />

      <hr />

      {loading ? (
        <p>Cargando tareas...</p>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={setTaskToEdit}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}

export default TasksPage;