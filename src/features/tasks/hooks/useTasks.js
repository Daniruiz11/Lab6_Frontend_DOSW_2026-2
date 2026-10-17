import { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../../api/taskApi";

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await getTasks());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (data) => {
    setError(null);
    try {
      const created = await createTask(data);
      setTasks((prev) => [...prev, created]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const editTask = async (id, data) => {
    setError(null);
    try {
      const updated = await updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const removeTask = async (id) => {
    setError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { tasks, loading, error, loadTasks, addTask, editTask, removeTask };
}

export default useTasks;