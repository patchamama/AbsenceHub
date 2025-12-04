import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from '../FormField';

describe('FormField Component', () => {
  it('renders text input field', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/service account/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders date input field', () => {
    render(
      <FormField
        label="Start Date"
        name="start_date"
        type="date"
        value="2025-01-15"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/start date/i);
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2025-01-15');
  });

  it('renders select field with options', () => {
    const options = [
      { value: 'Urlaub', label: 'Vacation' },
      { value: 'Krankheit', label: 'Sick Leave' },
    ];

    render(
      <FormField
        label="Absence Type"
        name="absence_type"
        type="select"
        value=""
        onChange={vi.fn()}
        options={options}
      />,
    );

    const select = screen.getByLabelText(/absence type/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('Sick Leave')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={vi.fn()}
        error="Service account is required"
      />,
    );

    expect(screen.getByText('Service account is required')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={vi.fn()}
        required={true}
      />,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();

    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={handleChange}
      />,
    );

    const input = screen.getByLabelText(/service account/i);
    fireEvent.change(input, { target: { value: 's.john.doe' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('disables field when disabled prop is true', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value="s.john.doe"
        onChange={vi.fn()}
        disabled={true}
      />,
    );

    const input = screen.getByLabelText(/service account/i);
    expect(input).toBeDisabled();
  });

  it('displays placeholder text', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={vi.fn()}
        placeholder="s.john.doe"
      />,
    );

    const input = screen.getByPlaceholderText('s.john.doe');
    expect(input).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <FormField
        label="Service Account"
        name="service_account"
        type="text"
        value=""
        onChange={vi.fn()}
        error="Invalid format"
        required={true}
      />,
    );

    const input = screen.getByLabelText(/service account/i);
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});
