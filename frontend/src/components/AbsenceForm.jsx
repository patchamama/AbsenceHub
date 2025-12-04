import { useState, useEffect, useRef } from 'react';
import FormField from '../shared/components/FormField';
import { validateServiceAccount, validateDateRange } from '../utils/validators';
import { t } from '../utils/i18n';

export default function AbsenceForm({
  absence = null,
  absenceTypes = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    service_account: '',
    employee_fullname: '',
    absence_type: '',
    start_date: '',
    end_date: '',
  });

  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (absence) {
      setFormData({
        service_account: absence.service_account,
        employee_fullname: absence.employee_fullname || '',
        absence_type: absence.absence_type,
        start_date: absence.start_date,
        end_date: absence.end_date,
      });
    }
  }, [absence]);

  // Focus trap and Escape key handler for modal
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Get all focusable elements
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus close button on modal open
    closeButtonRef.current?.focus();

    // Handle Tab key and Escape key
    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Handle Tab key for focus trap
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'service_account':
        return validateServiceAccount(value);

      case 'start_date':
      case 'end_date':
        if (!value) {
          return t('error.required');
        }
        // Validate date range if both dates are present
        if (formData.start_date && formData.end_date) {
          return validateDateRange(formData.start_date, formData.end_date);
        }
        return null;

      case 'absence_type':
        if (!value) {
          return t('error.required');
        }
        return null;

      default:
        return null;
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Clear form
  const handleClear = () => {
    setFormData({
      service_account: '',
      employee_fullname: '',
      absence_type: '',
      start_date: '',
      end_date: '',
    });
    setErrors({});
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};

    // Validate service account
    const serviceAccountError = validateServiceAccount(formData.service_account);
    if (serviceAccountError) {
      newErrors.service_account = serviceAccountError;
    }

    // Validate absence type
    if (!formData.absence_type) {
      newErrors.absence_type = t('error.required');
    }

    // Validate start date
    if (!formData.start_date) {
      newErrors.start_date = t('error.required');
    }

    // Validate end date
    if (!formData.end_date) {
      newErrors.end_date = t('error.required');
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const dateRangeError = validateDateRange(formData.start_date, formData.end_date);
      if (dateRangeError) {
        newErrors.dateRange = dateRangeError;
      }
    }

    // If there are errors, display them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call onSubmit with form data
    onSubmit({
      service_account: formData.service_account,
      employee_fullname: formData.employee_fullname || null,
      absence_type: formData.absence_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
  };

  // Convert absence types to FormField options
  const typeOptions = absenceTypes.map((type) => ({
    value: typeof type === 'string' ? type : type.value,
    label: typeof type === 'string' ? type : type.label,
  }));

  const isEditMode = !!absence;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {isEditMode ? t('form.editAbsence') : t('form.createAbsence')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('button.close')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Account */}
          <FormField
            label={t('field.serviceAccount')}
            name="service_account"
            type="text"
            value={formData.service_account}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.service_account}
            placeholder="s.firstname.lastname"
            disabled={isEditMode}
            required={true}
          />

          {/* Employee Full Name */}
          <FormField
            label={t('field.employeeFullname')}
            name="employee_fullname"
            type="text"
            value={formData.employee_fullname}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.employee_fullname}
            placeholder={t('placeholder.employeeName')}
            required={false}
          />

          {/* Absence Type */}
          <FormField
            label={t('field.absenceType')}
            name="absence_type"
            type="select"
            value={formData.absence_type}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.absence_type}
            options={typeOptions}
            required={true}
          />

          {/* Start Date */}
          <FormField
            label={t('field.startDate')}
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.start_date}
            required={true}
          />

          {/* End Date */}
          <FormField
            label={t('field.endDate')}
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.end_date}
            required={true}
          />

          {/* Date Range Error */}
          {errors.dateRange && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
              role="alert"
              aria-live="polite"
            >
              {errors.dateRange}
            </div>
          )}

          {/* Loading message */}
          {loading && (
            <div
              className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm"
              role="status"
              aria-live="polite"
            >
              {t('status.loading')}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('button.clear')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('button.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('status.loading') : t('button.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
