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