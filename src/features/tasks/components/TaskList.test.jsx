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