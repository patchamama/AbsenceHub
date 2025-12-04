/**
 * Frontend validation utilities for absence forms
 */

export const ALLOWED_ABSENCE_TYPES = ['Urlaub', 'Krankheit', 'Home Office', 'Sonstige'];

/**
 * Validate service account format
 * @param {string} serviceAccount - Service account to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateServiceAccount = (serviceAccount) => {
  if (!serviceAccount) {
    return 'Service account is required';
  }

  if (!serviceAccount.startsWith('s.')) {
    return "Service account must start with 's.'";
  }

  const parts = serviceAccount.split('.');
  if (parts.length < 3) {
    return 'Service account must follow format: s.firstname.lastname';
  }

  return null;
};

/**
 * Validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string|null} Error message or null if valid
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate) {
    return 'Start date is required';
  }

  if (!endDate) {
    return 'End date is required';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return 'Invalid start date format';
  }

  if (isNaN(end.getTime())) {
    return 'Invalid end date format';
  }

  if (end < start) {
    return 'End date cannot be before start date';
  }

  return null;
};

/**
 * Validate absence type
 * @param {string} absenceType - Type of absence
 * @returns {string|null} Error message or null if valid
 */
export const validateAbsenceType = (absenceType) => {
  if (!absenceType) {
    return 'Absence type is required';
  }

  if (!ALLOWED_ABSENCE_TYPES.includes(absenceType)) {
    return `Invalid absence type. Allowed types: ${ALLOWED_ABSENCE_TYPES.join(', ')}`;
  }

  return null;
};

/**
 * Validate employee fullname (optional)
 * @param {string} fullname - Employee fullname
 * @returns {string|null} Error message or null if valid
 */
export const validateEmployeeFullname = (fullname) => {
  if (fullname && fullname.length > 200) {
    return 'Employee fullname must be less than 200 characters';
  }

  return null;
};

/**
 * Validate entire absence form
 * @param {Object} formData - Form data object
 * @returns {Object} Errors object with field keys
 */
export const validateAbsenceForm = (formData) => {
  const errors = {};

  const serviceAccountError = validateServiceAccount(formData.service_account);
  if (serviceAccountError) {
    errors.service_account = serviceAccountError;
  }

  const dateRangeError = validateDateRange(formData.start_date, formData.end_date);
  if (dateRangeError) {
    errors.dates = dateRangeError;
  }

  const absenceTypeError = validateAbsenceType(formData.absence_type);
  if (absenceTypeError) {
    errors.absence_type = absenceTypeError;
  }

  const fullnameError = validateEmployeeFullname(formData.employee_fullname);
  if (fullnameError) {
    errors.employee_fullname = fullnameError;
  }

  return errors;
};

/**
 * Check if form has errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if there are errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
