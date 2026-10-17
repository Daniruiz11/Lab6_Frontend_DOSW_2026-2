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