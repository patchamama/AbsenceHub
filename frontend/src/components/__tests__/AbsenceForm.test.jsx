import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AbsenceForm from '../AbsenceForm';

describe('AbsenceForm Component', () => {
  const mockAbsenceTypes = [
    { value: 'Urlaub', label: 'Vacation' },
    { value: 'Krankheit', label: 'Sick Leave' },
    { value: 'Home Office', label: 'Home Office' },
    { value: 'Sonstige', label: 'Other' },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all required form fields', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      expect(screen.getByLabelText(/service account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/employee.*name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/absence type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      expect(screen.getByText(/submit/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it('renders clear button', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      expect(screen.getByText(/clear/i)).toBeInTheDocument();
    });
  });

  describe('Create Mode (absence=null)', () => {
    it('shows empty form fields in create mode', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      const nameInput = screen.getByLabelText(/employee.*name/i);
      const typeSelect = screen.getByLabelText(/absence type/i);
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      expect(serviceAccountInput.value).toBe('');
      expect(nameInput.value).toBe('');
      expect(typeSelect.value).toBe('');
      expect(startDateInput.value).toBe('');
      expect(endDateInput.value).toBe('');
    });

    it('enables service account field in create mode', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      expect(serviceAccountInput).not.toBeDisabled();
    });
  });

  describe('Edit Mode (absence!=null)', () => {
    const existingAbsence = {
      id: 1,
      service_account: 's.john.doe',
      employee_fullname: 'John Doe',
      absence_type: 'Urlaub',
      start_date: '2025-01-15',
      end_date: '2025-01-20',
    };

    it('pre-fills form with existing absence data', () => {
      render(
        <AbsenceForm
          absence={existingAbsence}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      expect(screen.getByLabelText(/service account/i).value).toBe('s.john.doe');
      expect(screen.getByLabelText(/employee.*name/i).value).toBe('John Doe');
      expect(screen.getByLabelText(/absence type/i).value).toBe('Urlaub');
      expect(screen.getByLabelText(/start date/i).value).toBe('2025-01-15');
      expect(screen.getByLabelText(/end date/i).value).toBe('2025-01-20');
    });

    it('disables service account field in edit mode', () => {
      render(
        <AbsenceForm
          absence={existingAbsence}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      expect(serviceAccountInput).toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('shows error when service account is invalid', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      fireEvent.change(serviceAccountInput, { target: { value: 'invalid' } });
      fireEvent.blur(serviceAccountInput);

      await waitFor(() => {
        expect(screen.getByText(/must start with 's.'/i)).toBeInTheDocument();
      });
    });

    it('shows error when end date is before start date', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2025-01-20' } });
      fireEvent.change(endDateInput, { target: { value: '2025-01-15' } });
      fireEvent.blur(endDateInput);

      await waitFor(() => {
        expect(screen.getByText(/cannot be before/i)).toBeInTheDocument();
      });
    });

    it('shows error when required fields are empty on submit', async () => {
      const { container } = render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const form = container.querySelector('form');
      fireEvent.submit(form);

      await waitFor(() => {
        // Should show error for service account (required)
        expect(screen.getByText(/service account is required/i)).toBeInTheDocument();
      });
    });

    it('clears error messages when user corrects input', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      fireEvent.change(serviceAccountInput, { target: { value: 'invalid' } });
      fireEvent.blur(serviceAccountInput);

      await waitFor(() => {
        expect(screen.getByText(/must start with 's.'/i)).toBeInTheDocument();
      });

      fireEvent.change(serviceAccountInput, { target: { value: 's.john.doe' } });
      fireEvent.blur(serviceAccountInput);

      await waitFor(() => {
        expect(screen.queryByText(/must start with 's.'/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Actions', () => {
    it('calls onSubmit with valid data when form is submitted', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      const typeSelect = screen.getByLabelText(/absence type/i);
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const submitButton = screen.getByText(/submit/i);

      fireEvent.change(serviceAccountInput, { target: { value: 's.john.doe' } });
      fireEvent.change(typeSelect, { target: { value: 'Urlaub' } });
      fireEvent.change(startDateInput, { target: { value: '2025-01-15' } });
      fireEvent.change(endDateInput, { target: { value: '2025-01-20' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            service_account: 's.john.doe',
            absence_type: 'Urlaub',
            start_date: '2025-01-15',
            end_date: '2025-01-20',
          }),
        );
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('clears form fields when clear button is clicked', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      const nameInput = screen.getByLabelText(/employee.*name/i);
      const clearButton = screen.getByText(/clear/i);

      fireEvent.change(serviceAccountInput, { target: { value: 's.john.doe' } });
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(serviceAccountInput.value).toBe('');
        expect(nameInput.value).toBe('');
      });
    });
  });

  describe('Loading State', () => {
    it('disables submit button when loading is true', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />,
      );

      const submitButton = screen.getByRole('button', { name: /loading/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading indicator when loading is true', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />,
      );

      const loadingElements = screen.getAllByText(/loading/i);
      expect(loadingElements.length).toBeGreaterThan(0);
      expect(loadingElements[0]).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('includes all absence types in the select dropdown', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const typeSelect = screen.getByLabelText(/absence type/i);
      const options = typeSelect.querySelectorAll('option');

      expect(options.length).toBeGreaterThan(mockAbsenceTypes.length);
      mockAbsenceTypes.forEach((type) => {
        expect(screen.getByText(type.label)).toBeInTheDocument();
      });
    });

    it('marks required fields', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      const typeSelect = screen.getByLabelText(/absence type/i);
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      expect(serviceAccountInput).toHaveAttribute('required');
      expect(typeSelect).toHaveAttribute('required');
      expect(startDateInput).toHaveAttribute('required');
      expect(endDateInput).toHaveAttribute('required');
    });
  });

  describe('Accessibility', () => {
    it('has proper label associations', () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      expect(serviceAccountInput).toHaveAttribute('id');
    });

    it('announces error messages to screen readers', async () => {
      render(
        <AbsenceForm
          absence={null}
          absenceTypes={mockAbsenceTypes}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={false}
        />,
      );

      const serviceAccountInput = screen.getByLabelText(/service account/i);
      fireEvent.change(serviceAccountInput, { target: { value: 'invalid' } });
      fireEvent.blur(serviceAccountInput);

      await waitFor(() => {
        const errorElement = screen.getByText(/must start with 's.'/i);
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });
  });
});
