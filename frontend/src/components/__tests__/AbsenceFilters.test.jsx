import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AbsenceFilters from '../AbsenceFilters'

describe('AbsenceFilters Component', () => {
  const mockAbsenceTypes = [
    { value: 'Urlaub', label: 'Vacation' },
    { value: 'Krankheit', label: 'Sick Leave' },
    { value: 'Home Office', label: 'Home Office' },
    { value: 'Sonstige', label: 'Other' }
  ]

  const mockOnFilter = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all filter fields', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByLabelText(/service account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/absence type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/from date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument()
    })

    it('renders apply and clear buttons', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText(/apply filters/i)).toBeInTheDocument()
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })
  })

  describe('Filter Fields', () => {
    it('allows entering service account', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const serviceAccountInput = screen.getByLabelText(/service account/i)
      fireEvent.change(serviceAccountInput, { target: { value: 's.john' } })

      expect(serviceAccountInput.value).toBe('s.john')
    })

    it('allows selecting absence type', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const typeSelect = screen.getByLabelText(/absence type/i)
      fireEvent.change(typeSelect, { target: { value: 'Urlaub' } })

      expect(typeSelect.value).toBe('Urlaub')
    })

    it('allows selecting start date', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const startDateInput = screen.getByLabelText(/from date/i)
      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } })

      expect(startDateInput.value).toBe('2025-01-01')
    })

    it('allows selecting end date', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const endDateInput = screen.getByLabelText(/to date/i)
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } })

      expect(endDateInput.value).toBe('2025-12-31')
    })
  })

  describe('Filter Application', () => {
    it('calls onFilter with filter values when apply button is clicked', () => {
      const { container } = render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const serviceAccountInput = screen.getByLabelText(/service account/i)
      const typeSelect = screen.getByLabelText(/absence type/i)
      const startDateInput = screen.getByLabelText(/from date/i)
      const endDateInput = screen.getByLabelText(/to date/i)

      fireEvent.change(serviceAccountInput, { target: { value: 's.john.doe' } })
      fireEvent.change(typeSelect, { target: { value: 'Urlaub' } })
      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } })
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      expect(mockOnFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          service_account: 's.john.doe',
          absence_type: 'Urlaub',
          start_date: '2025-01-01',
          end_date: '2025-12-31'
        })
      )
    })

    it('calls onFilter with partial filters', () => {
      const { container } = render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const serviceAccountInput = screen.getByLabelText(/service account/i)
      fireEvent.change(serviceAccountInput, { target: { value: 's.john' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      expect(mockOnFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          service_account: 's.john'
        })
      )
    })

    it('shows error when end date is before start date', async () => {
      const { container } = render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const startDateInput = screen.getByLabelText(/from date/i)
      const endDateInput = screen.getByLabelText(/to date/i)

      fireEvent.change(startDateInput, { target: { value: '2025-12-31' } })
      fireEvent.change(endDateInput, { target: { value: '2025-01-01' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText(/cannot be before/i)).toBeInTheDocument()
      })

      expect(mockOnFilter).not.toHaveBeenCalled()
    })

    it('does not call onFilter if validation fails', async () => {
      const { container } = render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const startDateInput = screen.getByLabelText(/from date/i)
      const endDateInput = screen.getByLabelText(/to date/i)

      fireEvent.change(startDateInput, { target: { value: '2025-12-31' } })
      fireEvent.change(endDateInput, { target: { value: '2025-01-01' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnFilter).not.toHaveBeenCalled()
      })
    })
  })

  describe('Clear Filters', () => {
    it('clears all filter values when clear button is clicked', async () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const serviceAccountInput = screen.getByLabelText(/service account/i)
      const typeSelect = screen.getByLabelText(/absence type/i)
      const startDateInput = screen.getByLabelText(/from date/i)
      const endDateInput = screen.getByLabelText(/to date/i)

      fireEvent.change(serviceAccountInput, { target: { value: 's.john.doe' } })
      fireEvent.change(typeSelect, { target: { value: 'Urlaub' } })
      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } })
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } })

      const clearButton = screen.getByText(/clear filters/i)
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(serviceAccountInput.value).toBe('')
        expect(typeSelect.value).toBe('')
        expect(startDateInput.value).toBe('')
        expect(endDateInput.value).toBe('')
      })
    })

    it('calls onClear when clear button is clicked', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByText(/clear filters/i)
      fireEvent.click(clearButton)

      expect(mockOnClear).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper label associations', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const serviceAccountInput = screen.getByLabelText(/service account/i)
      expect(serviceAccountInput).toHaveAttribute('id')
    })

    it('announces error messages to screen readers', async () => {
      const { container } = render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const startDateInput = screen.getByLabelText(/from date/i)
      const endDateInput = screen.getByLabelText(/to date/i)

      fireEvent.change(startDateInput, { target: { value: '2025-12-31' } })
      fireEvent.change(endDateInput, { target: { value: '2025-01-01' } })

      const form = container.querySelector('form')
      fireEvent.submit(form)

      await waitFor(() => {
        const errorElement = screen.getByText(/cannot be before/i)
        expect(errorElement).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('Absence Types Display', () => {
    it('displays all absence types in dropdown', () => {
      render(
        <AbsenceFilters
          absenceTypes={mockAbsenceTypes}
          onFilter={mockOnFilter}
          onClear={mockOnClear}
        />
      )

      const typeSelect = screen.getByLabelText(/absence type/i)
      const options = typeSelect.querySelectorAll('option')

      expect(options.length).toBeGreaterThan(mockAbsenceTypes.length)
      mockAbsenceTypes.forEach(type => {
        expect(screen.getByText(type.label)).toBeInTheDocument()
      })
    })
  })
})
