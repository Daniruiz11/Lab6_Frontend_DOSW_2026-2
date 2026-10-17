# Manual del Front-end: ToDo App (React + Vite + Vitest)

Manual paso a paso de cómo se construyó el front-end del laboratorio. Incluye el código final de cada archivo, los comandos, la explicación de cada pieza y los errores que ya aparecieron. Está pensado para consultarlo en medio del parcial.

**Stack usado**

| Tecnología | Para qué |
|---|---|
| **Node.js + npm** | Entorno para ejecutar JavaScript fuera del navegador y administrar paquetes |
| **Vite** | Herramienta que crea el proyecto, levanta el servidor de desarrollo y compila |
| **React** | Librería para construir la interfaz con componentes |
| **JavaScript (JSX)** | Lenguaje de los componentes (`.jsx`) |
| **ESLint** | Linter: avisa de errores y malas prácticas en el código |
| **Vitest** | Ejecutor de pruebas (equivalente a JUnit) |
| **React Testing Library** | Renderiza componentes y los consulta como lo haría un usuario |
| **jest-dom** | Aserciones extra (`toBeInTheDocument`, `toBeRequired`) |
| **user-event** | Simula escribir y hacer clic |
| **jsdom** | Navegador simulado dentro de Node para las pruebas |

**Puertos**

| Servicio | Puerto |
|---|---|
| Front (Vite) | `5173` |
| Back (Spring Boot) | `8080` |
| PostgreSQL (Docker) | `5432` |

---

## Índice

1. [Cómo funciona el front: visión general](#1-cómo-funciona-el-front-visión-general)
2. [Requisitos previos](#2-requisitos-previos)
3. [Crear el proyecto con Vite](#3-crear-el-proyecto-con-vite)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Capa API: taskApi.js](#5-capa-api-taskapijs)
6. [Hook: useTasks.js](#6-hook-usetasksjs)
7. [Componentes](#7-componentes)
8. [Página: TasksPage.jsx y App.jsx](#8-página-taskspagejsx-y-appjsx)
9. [CORS: configurar el back](#9-cors-configurar-el-back)
10. [Pruebas del front](#10-pruebas-del-front)
11. [Ejecutar el sistema completo](#11-ejecutar-el-sistema-completo)
12. [Comandos principales (chuleta)](#12-comandos-principales-chuleta)
13. [Conceptos clave explicados](#13-conceptos-clave-explicados)
14. [Errores comunes y soluciones](#14-errores-comunes-y-soluciones)
15. [Checklist: hacer un front nuevo desde cero](#15-checklist-hacer-un-front-nuevo-desde-cero)

---

## 1. Cómo funciona el front: visión general

```
Usuario (navegador)
      │  clics, escribe en el formulario
      ▼
 TasksPage            la pantalla: junta el hook y los componentes
   │      │
   │      └──> TaskForm / TaskList / TaskItem     (solo pintan y avisan eventos)
   ▼
 useTasks             estado (tasks, loading, error) y acciones (add, edit, remove)
   ▼
 taskApi.js           llamadas HTTP con fetch
   ▼
 Back-end :8080       API REST de Spring Boot  ──> PostgreSQL
```

La separación es la misma idea de capas del back:

| Back-end | Front-end |
|---|---|
| Repository (habla con la BD) | `taskApi.js` (habla con la API) |
| Service (lógica) | `useTasks.js` (estado y acciones) |
| Controller (entrada) | `TasksPage.jsx` (orquesta la pantalla) |
| DTO / vista | Componentes (`TaskForm`, `TaskList`, `TaskItem`) |

**Regla clave:** los componentes **no llaman a la API directamente**. Solo reciben datos y funciones por *props*. Quien habla con el back es `taskApi.js`, y quien lo usa es `useTasks`.

---

## 2. Requisitos previos

Verificar Node y npm:

```powershell
node -v
npm -v
```

Si no se reconocen, instalar Node LTS y abrir una PowerShell **nueva**:

```powershell
winget install -e --id OpenJS.NodeJS.LTS
```

Para ver la app funcionando con datos reales hay que tener encendidos PostgreSQL y el back (ver sección 11).

---

## 3. Crear el proyecto con Vite

Si el front va en una subcarpeta (la guía original):

```powershell
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm run dev
```

Si ya existe una carpeta/repositorio vacío y se quiere generar el proyecto **dentro de ella**, usar un punto en vez del nombre:

```powershell
cd "RUTA\A\TU\REPO-FRONT"
npm create vite@latest . -- --template react
npm install
npm run dev
```

Preguntas que hace Vite (los textos exactos pueden variar según la versión):

| Pregunta | Respuesta usada |
|---|---|
| Framework | **React** |
| Variant | **JavaScript** (no TypeScript; la guía usa `.jsx` y `.js`) |
| Linter (ESLint u Oxlint) | **ESLint** (el estándar y el más documentado) |
| Opciones experimentales | **No** |
| Instalar y arrancar ahora | **No** (se hace a mano con `npm install` y `npm run dev`) |
| Carpeta no vacía | Ignorar los archivos existentes y continuar. **No** elegir "remove existing files" |

La app queda en `http://localhost:5173`. `npm run dev` ocupa la terminal; se detiene con `Ctrl + C`.

### Instalar las dependencias de pruebas

```powershell
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`-D` las guarda como dependencias de desarrollo (solo se usan para probar).

---

## 4. Estructura de carpetas

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── src/
    ├── main.jsx                     punto de entrada (monta React)
    ├── App.jsx                      componente raíz
    ├── setupTests.js                configuración de las pruebas
    ├── api/
    │   └── taskApi.js               llamadas HTTP al back
    └── features/
        └── tasks/
            ├── components/
            │   ├── TaskForm.jsx
            │   ├── TaskForm.test.jsx
            │   ├── TaskItem.jsx
            │   ├── TaskList.jsx
            │   └── TaskList.test.jsx
            ├── hooks/
            │   └── useTasks.js
            └── pages/
                ├── TasksPage.jsx
                └── TasksPage.test.jsx
```

Crear las carpetas y archivos vacíos (PowerShell, desde la carpeta del front):

```powershell
New-Item -ItemType Directory -Force -Path `
  src\api, `
  src\features\tasks\components, `
  src\features\tasks\hooks, `
  src\features\tasks\pages

New-Item -ItemType File -Force -Path `
  src\api\taskApi.js, `
  src\features\tasks\components\TaskForm.jsx, `
  src\features\tasks\components\TaskList.jsx, `
  src\features\tasks\components\TaskItem.jsx, `
  src\features\tasks\hooks\useTasks.js, `
  src\features\tasks\pages\TasksPage.jsx
```

> **Ojo con `-Force`:** si el archivo ya existe, lo sobrescribe y lo deja **vacío**. Para `App.jsx` y `main.jsx` (que ya los crea Vite) **no** usar `-Force`.

Verificar:

```powershell
Get-ChildItem -Recurse src -File | Select-Object -ExpandProperty FullName
```

La estructura de carpetas **no necesita** que el back esté corriendo: son solo archivos.

Los archivos de plantilla de Vite (`App.css`, `index.css`, `assets/`) pueden quedarse.

---

## 5. Capa API: taskApi.js

`src/api/taskApi.js`

```js
const API_URL = "http://localhost:8080/api/v1/tasks";

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // la respuesta no trae JSON; se deja el mensaje genérico
    }
    throw new Error(message);
  }

  // DELETE responde 204 sin cuerpo
  if (response.status === 204) return null;

  return response.json();
}

export async function getTasks() {
  const response = await fetch(API_URL);
  return handleResponse(response);
}

export async function getTask(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return handleResponse(response);
}

export async function createTask(task) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return handleResponse(response);
}

export async function updateTask(id, task) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  return handleResponse(response);
}
```

### Qué hace cada parte

| Pieza | Explicación |
|---|---|
| `API_URL` | Dirección base del back. Es el único lugar que conoce la URL. |
| `fetch(url, opciones)` | Función nativa del navegador para hacer peticiones HTTP. Devuelve una promesa. |
| `async` / `await` | Permiten esperar la respuesta sin bloquear la pantalla. |
| `method`, `headers`, `body` | Verbo HTTP, tipo de contenido (`application/json`) y el cuerpo. |
| `JSON.stringify(task)` | Convierte el objeto JavaScript a texto JSON para enviarlo. |
| `response.ok` | `true` si el código es 200-299. Con 404 o 400 es `false`. |
| `throw new Error(...)` | **`fetch` no lanza error con un 404 o 400**; hay que lanzarlo a mano. |
| `response.status === 204` | El DELETE no devuelve cuerpo; llamar a `.json()` fallaría. |
| `body.message` | Usa el mensaje del `GlobalExceptionHandler` del back (ej. "Task with id 99 was not found"). |

### Contrato con el back

| Función | Método | URL | Respuesta |
|---|---|---|---|
| `getTasks()` | GET | `/api/v1/tasks` | 200, lista |
| `getTask(id)` | GET | `/api/v1/tasks/{id}` | 200 / 404 |
| `createTask(task)` | POST | `/api/v1/tasks` | 201 / 400 |
| `updateTask(id, task)` | PUT | `/api/v1/tasks/{id}` | 200 / 404 / 400 |
| `deleteTask(id)` | DELETE | `/api/v1/tasks/{id}` | 204 / 404 |

---

## 6. Hook: useTasks.js

`src/features/tasks/hooks/useTasks.js`

```js
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
```

### Qué hace cada parte

| Pieza | Explicación |
|---|---|
| `useState` | Guarda un valor que, al cambiar, vuelve a pintar el componente. Aquí: `tasks`, `loading`, `error`. |
| `useEffect(fn, [dep])` | Ejecuta `fn` después de pintar. Con `[loadTasks]` se ejecuta al montar el componente: **carga la lista al abrir la página**. |
| `useCallback` | Mantiene la misma referencia de `loadTasks` entre renders. Sin él, `useEffect` la vería "nueva" cada vez y haría un bucle. |
| `try / catch / finally` | `catch` guarda el error; `finally` apaga el `loading` pase lo que pase. |
| `setTasks((prev) => ...)` | Actualiza usando el valor anterior. Nunca se modifica el arreglo directamente: se crea uno nuevo. |
| `[...prev, created]` | Copia el arreglo y agrega la tarea nueva al final. |
| `prev.map(...)` | Reemplaza solo la tarea editada. |
| `prev.filter(...)` | Quita la tarea eliminada. |
| `return true / false` | Le dice a quien llama si salió bien. El formulario lo usa para decidir si se limpia. |

El hook devuelve un objeto con el estado y las acciones: la página los usa sin saber nada de `fetch`.

---

## 7. Componentes

Los tres componentes **solo reciben props** (datos y funciones) y pintan. No llaman a la API.

### `TaskForm.jsx` (crear y editar)

`src/features/tasks/components/TaskForm.jsx`

```jsx
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
```

Puntos clave:

- **Un solo formulario para crear y editar**, según la prop `taskToEdit`: `null` = crea; con una tarea = precarga los campos, cambia el título a "Editar tarea" y muestra "Cancelar".
- **Componente controlado:** cada campo tiene `value={form.campo}` y `onChange`. React es la fuente de la verdad del valor.
- `handleChange` usa el `name` del input (`[name]: value`) para actualizar el campo correcto con una sola función.
- `e.preventDefault()` evita que el formulario recargue la página.
- **`dueDate` vacío se envía como `null`**, no como `""`: el back espera un `LocalDate` y un texto vacío da 400. Lo mismo con la descripción.
- `required` y `maxLength` replican las validaciones del back (título obligatorio, 120 y 500 caracteres).
- `if (ok && ...)`: el formulario solo se limpia si el back aceptó la petición; si falló, conserva lo escrito.
- `htmlFor` + `id` unen la etiqueta con su campo (accesibilidad y pruebas).

### `TaskItem.jsx` (una tarea)

`src/features/tasks/components/TaskItem.jsx`

```jsx
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
```

- `NEXT_STATUS` es un mapa: de `PENDING` se pasa a `IN_PROGRESS` ("Iniciar") y de `IN_PROGRESS` a `COMPLETED` ("Completar"). Una tarea `COMPLETED` no tiene siguiente, así que no muestra botón.
- **La fecha se formatea partiendo el texto** (`2026-09-25` -> `25/09/2026`). No se usa `new Date(...)`: en Colombia (UTC-5) puede mostrar un día antes.
- `{next && (...)}`: renderizado condicional; si `next` es `undefined`, no pinta nada.
- `onClick={() => onEdit(task)}`: la función flecha evita ejecutar `onEdit` al pintar; solo se ejecuta al hacer clic.

### `TaskList.jsx` (la lista)

`src/features/tasks/components/TaskList.jsx`

```jsx
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
```

- `tasks.map(...)` convierte cada tarea en un `TaskItem`.
- **`key={task.id}`** es obligatoria al renderizar listas: le permite a React identificar cada elemento.
- Si no hay tareas muestra "No hay tareas."

---

## 8. Página: TasksPage.jsx y App.jsx

### `TasksPage.jsx`

`src/features/tasks/pages/TasksPage.jsx`

```jsx
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
```

Puntos clave:

- **Es el "controller" del front:** usa `useTasks` y decide qué mostrar.
- `taskToEdit` es el estado que dice si el formulario está en modo crear (`null`) o editar (una tarea).
- **`key={taskToEdit?.id ?? "new"}`**: al cambiar la `key`, React destruye y recrea el formulario. Así se precargan los campos de la tarea elegida (el `useState` inicial solo se evalúa al montar).
- **El PUT del back exige `status`**, pero el formulario no lo tiene: al editar se agrega `status: taskToEdit.status`.
- **"Cambiar estado" también es un PUT** con todos los campos de la tarea y el `status` nuevo.
- `role="alert"` marca el mensaje de error (y permite encontrarlo en las pruebas).
- `loading ? ... : ...`: muestra "Cargando tareas..." hasta que llegue la lista.
- `taskToEdit?.id`: el `?.` evita error si `taskToEdit` es `null`.

### `App.jsx`

`src/App.jsx` (reemplazar **todo** el contenido de la plantilla de Vite: contador, logos, enlaces)

```jsx
import TasksPage from "./features/tasks/pages/TasksPage";

function App() {
  return <TasksPage />;
}

export default App;
```

`main.jsx` se deja como lo genera Vite (monta `<App />` en el `div#root` de `index.html`).

`index.css` de la plantilla centra el contenido y cambia colores. Es solo estética; si estorba, se reemplaza por estilos mínimos.

---

## 9. CORS: configurar el back

**Problema:** el front (`localhost:5173`) llama al back (`localhost:8080`). Son orígenes distintos (el puerto cuenta) y el navegador **bloquea** la respuesta, mostrando en la consola:

```
blocked by CORS policy
```

**Solución:** en el back, permitir el origen del front. Se crea un archivo **en el proyecto Spring Boot**:

`src/main/java/edu/eci/dosw/todo/config/WebConfig.java`

```java
package edu.eci.dosw.todo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

- Después de crearlo hay que **reiniciar el back** (`Ctrl + C` y `mvn spring-boot:run`); no se aplica en caliente.
- `OPTIONS` es necesario: antes de un POST/PUT con JSON, el navegador envía una petición previa (*preflight*) para preguntar si está permitido.
- **El origen debe coincidir exactamente** (`http://localhost:5173`). Si Vite arranca en otro puerto (ver errores), CORS vuelve a fallar.
- CORS es una protección del **navegador**: `curl` y Postman nunca la sufren.

---

## 10. Pruebas del front

### 10.1 Configuración

**`vite.config.js`** (conservar el import del plugin de React que haya generado tu plantilla):

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
```

| Opción | Para qué |
|---|---|
| `defineConfig` de `vitest/config` | Permite que el archivo acepte el bloque `test` |
| `environment: 'jsdom'` | Simula un navegador para poder renderizar componentes |
| `globals: true` | Permite usar `describe`, `it`, `expect` sin importarlos |
| `setupFiles` | Archivo que se ejecuta antes de todas las pruebas |

**`src/setupTests.js`** (si falta, **ninguna prueba corre**):

```js
import '@testing-library/jest-dom/vitest'
```

Crearlo desde PowerShell:

```powershell
Set-Content -Path src\setupTests.js -Value "import '@testing-library/jest-dom/vitest'"
```

**`package.json`**, dentro de `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

### 10.2 `TaskForm.test.jsx`

`src/features/tasks/components/TaskForm.test.jsx`

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'

describe('TaskForm', () => {
  it('renderiza el formulario', () => {
    render(<TaskForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Nueva tarea' })).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha límite/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('permite escribir un título', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={vi.fn()} />)

    const title = screen.getByLabelText(/título/i)
    await user.type(title, 'Mi tarea')

    expect(title).toHaveValue('Mi tarea')
  })

  it('ejecuta la acción guardar con los datos del formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<TaskForm onSubmit={onSubmit} />)

    const title = screen.getByLabelText(/título/i)
    await user.type(title, 'Mi tarea')
    await user.selectOptions(screen.getByLabelText(/prioridad/i), 'HIGH')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mi tarea',
      description: null,
      priority: 'HIGH',
      dueDate: null,
    })
    await waitFor(() => expect(title).toHaveValue(''))
  })

  it('valida el título obligatorio', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)

    expect(screen.getByLabelText(/título/i)).toBeRequired()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
```

### 10.3 `TaskList.test.jsx`

`src/features/tasks/components/TaskList.test.jsx`

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskList from './TaskList'

const tasks = [
  {
    id: 1,
    title: 'Terminar laboratorio',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-25',
  },
  {
    id: 2,
    title: 'Preparar parcial',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '2026-09-27',
  },
]

function renderList(overrides = {}) {
  const props = {
    tasks,
    onEdit: vi.fn(),
    onChangeStatus: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  render(<TaskList {...props} />)
  return props
}

describe('TaskList', () => {
  it('renderiza las tareas', () => {
    renderList()

    expect(screen.getByText(/Terminar laboratorio/)).toBeInTheDocument()
    expect(screen.getByText(/Preparar parcial/)).toBeInTheDocument()
    expect(screen.getByText('Fecha: 25/09/2026')).toBeInTheDocument()
  })

  it('muestra el estado', () => {
    renderList()

    expect(screen.getByText('Estado: IN_PROGRESS')).toBeInTheDocument()
    expect(screen.getByText('Estado: PENDING')).toBeInTheDocument()
  })

  it('muestra la prioridad', () => {
    renderList()

    expect(screen.getByText(/\[HIGH\]/)).toBeInTheDocument()
    expect(screen.getByText(/\[MEDIUM\]/)).toBeInTheDocument()
  })

  it('ejecuta eliminar con el id de la tarea', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderList()

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' })
    await user.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
```

### 10.4 `TasksPage.test.jsx`

`src/features/tasks/pages/TasksPage.test.jsx`

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TasksPage from './TasksPage'
import { getTasks } from '../../../api/taskApi'

vi.mock('../../../api/taskApi')

const tasks = [
  {
    id: 1,
    title: 'Terminar laboratorio',
    description: null,
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2026-09-25',
  },
]

describe('TasksPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('carga tareas', async () => {
    getTasks.mockResolvedValue(tasks)

    render(<TasksPage />)

    expect(await screen.findByText(/Terminar laboratorio/)).toBeInTheDocument()
    expect(screen.queryByText('Cargando tareas...')).not.toBeInTheDocument()
  })

  it('muestra loading mientras carga', () => {
    getTasks.mockReturnValue(new Promise(() => {}))

    render(<TasksPage />)

    expect(screen.getByText('Cargando tareas...')).toBeInTheDocument()
  })

  it('muestra error cuando falla la API', async () => {
    getTasks.mockRejectedValue(new Error('Failed to fetch'))

    render(<TasksPage />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Failed to fetch')
  })
})
```

### 10.5 Ejecutar

```powershell
npm test
```

Resultado esperado: **3 archivos, 11 pruebas pasando** (4 + 4 + 3). Para dejarlas corriendo y repetirlas al guardar: `npm run test:watch`.

### 10.6 Cómo funcionan las pruebas

| Pieza | Explicación |
|---|---|
| `describe('X', () => {...})` | Agrupa pruebas de un componente |
| `it('hace algo', () => {...})` | Una prueba individual |
| `render(<Componente />)` | Dibuja el componente en el navegador simulado |
| `screen` | Para buscar elementos como los ve un usuario |
| `getByText`, `getByRole`, `getByLabelText` | Buscan un elemento; **fallan si no existe** |
| `getAllByRole` | Cuando hay varios elementos iguales (ej. varios botones "Eliminar") |
| `queryByText` | Devuelve `null` si no existe (para comprobar que **no** está) |
| `findByText` | Espera a que el elemento aparezca (para lo asíncrono) |
| `userEvent.setup()` + `await user.type / click / selectOptions` | Simula acciones reales del usuario |
| `vi.fn()` | Función espía/falsa; permite `toHaveBeenCalledWith(...)` |
| `vi.mock('ruta')` | Reemplaza **todo un módulo** por versiones falsas. Aquí evita llamar al back real (como Mockito con el repository) |
| `mockResolvedValue(x)` | La función falsa devuelve una promesa que resuelve `x` |
| `mockRejectedValue(err)` | La promesa falla con `err` |
| `new Promise(() => {})` | Promesa que nunca termina: deja la pantalla en "Cargando" |
| `waitFor(() => expect(...))` | Reintenta la aserción hasta que se cumple |
| `beforeEach(() => vi.resetAllMocks())` | Limpia los mocks antes de cada prueba |
| `toBeInTheDocument()`, `toHaveValue()`, `toBeRequired()`, `toHaveTextContent()` | Aserciones de jest-dom |

Notas:

- Las pruebas **no necesitan** back, Docker ni PostgreSQL encendidos.
- **Título obligatorio:** el campo tiene el atributo `required`; jsdom bloquea el envío si está vacío, por eso `onSubmit` no se llama.
- Si cambias un texto de un componente ("Guardar", "Cargando tareas...", "Estado: ..."), hay que ajustar la prueba que lo busca.
- Limitación conocida: un título con solo espacios pasa `required`, el componente lo recorta con `trim()` y envía `""`, y el back responde 400. No está cubierto por las pruebas mínimas.

---

## 11. Ejecutar el sistema completo

Se necesitan **tres cosas encendidas**, cada una en su propia terminal:

| Orden | Qué | Comando | Dónde |
|---|---|---|---|
| 1 | PostgreSQL | `docker start todo-postgres` y luego `docker ps` | cualquiera |
| 2 | Back-end (8080) | `mvn spring-boot:run` | carpeta `backend` |
| 3 | Front-end (5173) | `npm run dev` | carpeta del front |

Abrir `http://localhost:5173` y probar:

1. Se ve "TO DO", el formulario y las tareas existentes (o "No hay tareas.").
2. Crear una tarea: aparece en la lista con estado `PENDING`.
3. **Iniciar** -> `IN_PROGRESS`; **Completar** -> `COMPLETED`.
4. **Editar** precarga el formulario; al guardar se actualiza la lista.
5. **Eliminar** la quita.
6. Con el back apagado, aparece el mensaje de error en la página.

Para depurar: `F12` -> pestaña **Console** (errores de CORS y JavaScript) y pestaña **Network** (cada petición, su código de estado y su respuesta).

Detener todo: `Ctrl + C` en las terminales del back y del front; `docker stop todo-postgres`.

---

## 12. Comandos principales (chuleta)

### npm / Vite

| Comando | Qué hace |
|---|---|
| `npm create vite@latest frontend -- --template react` | Crea el proyecto |
| `npm install` | Instala las dependencias de `package.json` |
| `npm install -D <paquete>` | Instala una dependencia de desarrollo |
| `npm run dev` | Levanta el servidor de desarrollo (`http://localhost:5173`) |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión compilada para probarla |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Pruebas en modo observación |

### PowerShell útil

| Comando | Qué hace |
|---|---|
| `Get-ChildItem -Recurse src -File` | Lista los archivos de `src` |
| `Set-Content -Path archivo -Value "texto"` | Crea/sobrescribe un archivo con texto |
| `New-Item -ItemType File -Path archivo` | Crea un archivo vacío (sin `-Force` no sobrescribe) |
| `node -v` / `npm -v` | Versiones instaladas |

### Archivos de configuración

| Archivo | Para qué sirve |
|---|---|
| `package.json` | Nombre, scripts y dependencias del proyecto |
| `package-lock.json` | Versiones exactas instaladas (se sube a Git) |
| `vite.config.js` | Configuración de Vite y de Vitest |
| `eslint.config.js` | Reglas del linter |
| `index.html` | Página base; contiene `<div id="root">` y carga `main.jsx` |
| `node_modules/` | Paquetes descargados. **No se sube a Git** (va en `.gitignore`) |

---

## 13. Conceptos clave explicados

| Concepto | Explicación |
|---|---|
| **Componente** | Función que devuelve JSX (HTML dentro de JavaScript). Se usa como etiqueta: `<TaskForm />`. Su nombre empieza en mayúscula. |
| **JSX** | Sintaxis que mezcla HTML y JS. Las expresiones van entre llaves `{}`. Se usa `className` en vez de `class` y `htmlFor` en vez de `for`. |
| **Props** | Datos y funciones que un componente padre le pasa al hijo (`<TaskItem task={task} onDelete={...} />`). Son de solo lectura. |
| **Estado (`useState`)** | Memoria de un componente. Al cambiar con su `set...`, React vuelve a pintar. |
| **Efecto (`useEffect`)** | Código que se ejecuta después de pintar (cargar datos, suscripciones). Las dependencias `[...]` dicen cuándo repetirlo; `[]` o una función estable = solo al montar. |
| **Hook** | Función que empieza con `use` y da capacidades a un componente. Reglas: solo se llaman en el nivel superior del componente, nunca dentro de `if` ni bucles. |
| **Hook personalizado** | Tu propia función `useX` que agrupa estado y lógica reutilizable (`useTasks`). |
| **Componente controlado** | Campo cuyo valor vive en el estado de React (`value` + `onChange`). |
| **Levantar el estado** | El estado compartido vive en el padre (`TasksPage`) y baja por props a los hijos. |
| **Renderizado condicional** | `cond && <X />` o `cond ? <A /> : <B />` para mostrar u ocultar. |
| **Listas y `key`** | `array.map(...)` pinta listas; cada elemento necesita una `key` única y estable (el `id`). |
| **Inmutabilidad** | Nunca se modifica el estado directamente; se crea una copia (`[...prev, x]`, `map`, `filter`). |
| **Promesa / `async-await`** | Representan algo que terminará más tarde. `await` espera el resultado dentro de una función `async`. |
| **`fetch`** | API del navegador para peticiones HTTP. No lanza error por códigos 4xx/5xx: hay que revisar `response.ok`. |
| **CORS** | Regla del navegador que bloquea llamadas entre orígenes distintos, salvo que el servidor lo permita. |
| **`??` y `?.`** | `a ?? b` usa `b` si `a` es `null`/`undefined`. `a?.b` evita error si `a` es `null`. |
| **Desestructurar** | `const { tasks, loading } = useTasks()` toma propiedades de un objeto. |
| **Spread `...`** | Copia un objeto o arreglo: `{ ...data, status }`, `[...prev, created]`. |
| **Mock** | Versión falsa de una dependencia para aislar lo que se prueba (`vi.mock`, `vi.fn`). |
| **Lint** | Análisis estático del código; avisa de errores sin ejecutarlo. |

### Equivalencias con el back (para entenderlo rápido)

| Back (Spring Boot) | Front (React) |
|---|---|
| `TaskRepository` | `taskApi.js` |
| `TaskServiceImpl` | `useTasks.js` |
| `TaskController` | `TasksPage.jsx` |
| DTO `TaskCreateRequest` | Objeto que arma `TaskForm` al enviar |
| DTO `TaskResponse` | Objeto `task` que recibe `TaskItem` |
| `@Valid` / `@NotBlank` | `required` / `maxLength` en los inputs |
| `GlobalExceptionHandler` (404) | `handleResponse` + `error` mostrado en la página |
| Mockito `@Mock` | `vi.mock` / `vi.fn` |
| MockMvc / JUnit | Testing Library / Vitest |
| JaCoCo | (cobertura de Vitest, opcional; no se configuró) |

---

## 14. Errores comunes y soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| `blocked by CORS policy` en la consola | falta `WebConfig.java` en el back, o no se reinició el back | crear `WebConfig` (sección 9) y reiniciar `mvn spring-boot:run` |
| CORS falla de repente aunque ya estaba configurado | Vite arrancó en otro puerto (5174...) porque el 5173 estaba ocupado | cerrar el otro `npm run dev` y volver a ejecutarlo; el origen permitido es solo `http://localhost:5173` |
| `Failed to fetch` / `ERR_CONNECTION_REFUSED` | back apagado, o no está en el puerto 8080 | `mvn spring-boot:run` y verificar `API_URL` |
| El back arranca pero responde error de BD | contenedor apagado | `docker start todo-postgres` y `docker ps` |
| `npm` o `node` no se reconocen | Node no instalado o terminal abierta antes de instalar | `winget install -e --id OpenJS.NodeJS.LTS` y abrir una PowerShell nueva |
| `npm test`: `Cannot find module '.../src/setupTests.js'` y "no tests" | falta el archivo de configuración | `Set-Content -Path src\setupTests.js -Value "import '@testing-library/jest-dom/vitest'"` |
| `toBeInTheDocument is not a function` | falta `setupTests.js` o no está en `setupFiles` | revisar sección 10.1 |
| `document is not defined` / `window is not defined` en pruebas | falta `environment: 'jsdom'` o no está instalado `jsdom` | revisar `vite.config.js` e instalar `jsdom` |
| `describe is not defined` | falta `globals: true` o el import de `vitest` | agregar `globals: true` o importar desde `'vitest'` |
| Prueba no encuentra un texto | se cambió el texto del componente | ajustar la prueba o el componente |
| `Unable to find a label with the text...` | el `<label>` no está unido al `<input>` | usar `htmlFor` en el label e `id` igual en el input |
| Al crear tarea responde 400 | título vacío o solo espacios, o `dueDate` enviado como `""` | validar título; enviar `null` en fecha/descripción vacías |
| Al editar responde 400 | el PUT no incluye `status` | agregar `status: taskToEdit.status` (sección 8) |
| La fecha se ve un día antes | se usó `new Date('2026-09-25')` (zona horaria) | formatear partiendo el texto (`split('-')`) |
| El formulario no precarga al presionar "Editar" | falta la `key` en `<TaskForm>` | `key={taskToEdit?.id ?? "new"}` |
| La lista se actualiza solo al recargar | se modificó el estado directamente | usar `setTasks((prev) => [...prev, x])`, `map`, `filter` |
| Bucle infinito de peticiones | `useEffect` con una función sin `useCallback` en dependencias | envolver `loadTasks` en `useCallback` |
| Warning: "each child in a list should have a unique key" | falta `key` en el `map` | `key={task.id}` |
| `Unexpected token '<'` / la API devuelve HTML | URL equivocada (cae en `index.html`) | revisar `API_URL` |
| `DELETE` falla con `Unexpected end of JSON input` | se llamó `.json()` sobre un 204 | devolver `null` cuando `status === 204` |
| La pantalla se ve centrada/oscura y rara | estilos de la plantilla en `index.css` / `App.css` | reemplazar por estilos propios mínimos |
| Se sobrescribió `App.jsx` o `main.jsx` quedando vacío | `New-Item -Force` sobre archivo existente | restaurar el contenido (secciones 8) |
| Aviso de `npm audit` tras `npm install` | vulnerabilidades en dependencias de desarrollo | no bloquea el laboratorio; no ejecutar `npm audit fix --force` sin entender el cambio |

---

## 15. Checklist: hacer un front nuevo desde cero

Orden recomendado; se prueba cada paso antes de pasar al siguiente.

1. **Node**: `node -v` y `npm -v`.
2. **Proyecto**: `npm create vite@latest <nombre> -- --template react` (JavaScript, ESLint), `cd <nombre>`, `npm install`.
3. **Arrancar**: `npm run dev` y abrir `http://localhost:5173` para confirmar que funciona.
4. **Estructura**: crear `src/api`, `src/features/<recurso>/{components,hooks,pages}`.
5. **Limpiar la plantilla**: reemplazar `App.jsx` por un componente que monte la página.
6. **CORS en el back**: `WebConfig` con el origen `http://localhost:5173`; reiniciar el back.
7. **`<recurso>Api.js`**: `API_URL`, `handleResponse` (revisar `response.ok`, 204) y las 5 funciones (get todas, get una, crear, actualizar, eliminar).
8. **`use<Recurso>.js`**: `useState` (lista, loading, error), `useEffect` + `useCallback` para cargar, y las acciones (add, edit, remove) que devuelven `true/false`.
9. **Componentes**: formulario (crear y editar con `taskToEdit`), lista (`map` con `key`) e ítem (botones).
10. **Página**: unir el hook y los componentes; manejar el estado del elemento en edición, `loading` y `error`.
11. **Probar a mano** con back y BD encendidos: crear, listar, editar, cambiar estado, eliminar y un error.
12. **Pruebas**: instalar dependencias, configurar `vite.config.js`, crear `setupTests.js`, agregar scripts y escribir las pruebas con la API simulada (`vi.mock`).
13. **`npm test`** hasta ver todo en verde.

### Datos que hay que alinear con el back (si cambia la entidad)

| En el front | Debe coincidir con |
|---|---|
| Nombres de campos (`title`, `dueDate`...) | Los campos del DTO del back (en JSON, camelCase) |
| Valores de enums (`LOW`, `PENDING`...) | Los enums del back, en mayúsculas |
| Campos obligatorios en el PUT | Las validaciones `@NotNull` del `UpdateRequest` |
| Campos vacíos | Enviar `null`, no `""`, para fechas y opcionales |
| URL base | El `@RequestMapping` del controller |
| Origen permitido | `allowedOrigins` del CORS |
