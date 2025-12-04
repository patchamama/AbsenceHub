import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AbsenceList from '../AbsenceList'

describe('AbsenceList Component', () => {
  const mockAbsences = [
    {
      id: 1,
      service_account: 's.john.doe',
      employee_fullname: 'John Doe',
      absence_type: 'Urlaub',
      start_date: '2025-01-15',
      end_date: '2025-01-20',
      created_at: '2024-12-01T10:00:00'
    },
    {
      id: 2,
      service_account: 's.jane.smith',
      employee_fullname: 'Jane Smith',
      absence_type: 'Krankheit',
      start_date: '2025-01-10',
      end_date: '2025-01-12',
      created_at: '2024-12-02T10:00:00'
    }
  ]

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders table with all columns', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText(/service account/i)).toBeInTheDocument()
      expect(screen.getByText(/employee name/i)).toBeInTheDocument()
      expect(screen.getByText(/type/i)).toBeInTheDocument()
      expect(screen.getByText(/start date/i)).toBeInTheDocument()
      expect(screen.getByText(/end date/i)).toBeInTheDocument()
      expect(screen.getByText(/duration/i)).toBeInTheDocument()
      expect(screen.getByText(/actions/i)).toBeInTheDocument()
    })

    it('renders all absence rows', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText('s.john.doe')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('s.jane.smith')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Absence Data Display', () => {
    it('displays absence type correctly', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText('Urlaub')).toBeInTheDocument()
      expect(screen.getByText('Krankheit')).toBeInTheDocument()
    })

    it('displays absence dates correctly', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText('2025-01-15')).toBeInTheDocument()
      expect(screen.getByText('2025-01-20')).toBeInTheDocument()
    })

    it('calculates and displays duration correctly', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      // 2025-01-15 to 2025-01-20 = 6 days (inclusive)
      expect(screen.getByText(/6\s+days/i)).toBeInTheDocument()
    })

    it('displays employee name when available', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('displays service account when employee name not available', () => {
      const absencesWithoutNames = [
        {
          id: 3,
          service_account: 's.bob.wilson',
          employee_fullname: null,
          absence_type: 'Home Office',
          start_date: '2025-02-01',
          end_date: '2025-02-01',
          created_at: '2024-12-03T10:00:00'
        }
      ]

      const { container } = render(
        <AbsenceList
          absences={absencesWithoutNames}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const cells = container.querySelectorAll('td')
      const serviceAccountCells = Array.from(cells).filter(cell => cell.textContent === 's.bob.wilson')
      expect(serviceAccountCells.length).toBeGreaterThan(0)
    })
  })

  describe('Actions', () => {
    it('calls onEdit when edit button is clicked', () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const editButtons = screen.getAllByText(/edit/i)
      fireEvent.click(editButtons[0])

      expect(mockOnEdit).toHaveBeenCalledWith(mockAbsences[0])
    })

    it('shows delete confirmation before deleting', async () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const deleteButtons = screen.getAllByText(/delete/i)
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })
    })

    it('calls onDelete when confirmed in delete dialog', async () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const deleteButtons = screen.getAllByText(/delete/i)
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      expect(mockOnDelete).toHaveBeenCalledWith(mockAbsences[0].id)
    })

    it('does not call onDelete when cancelled in delete dialog', async () => {
      render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const deleteButtons = screen.getAllByText(/delete/i)
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getAllByText(/cancel/i)[0]
      fireEvent.click(cancelButton)

      expect(mockOnDelete).not.toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('shows empty state message when no absences', () => {
      render(
        <AbsenceList
          absences={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(screen.getByText(/no absences found/i)).toBeInTheDocument()
    })

    it('does not show table when no absences', () => {
      const { container } = render(
        <AbsenceList
          absences={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      expect(container.querySelector('table')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading message when loading is true', () => {
      render(
        <AbsenceList
          absences={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={true}
          error={null}
        />
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error message when error prop is provided', () => {
      render(
        <AbsenceList
          absences={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error="Failed to load absences"
        />
      )

      expect(screen.getByText(/failed to load absences/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible table structure', () => {
      const { container } = render(
        <AbsenceList
          absences={mockAbsences}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
          error={null}
        />
      )

      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()

      const thead = table.querySelector('thead')
      expect(thead).toBeInTheDocument()

      const tbody = table.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
    })
  })
})
