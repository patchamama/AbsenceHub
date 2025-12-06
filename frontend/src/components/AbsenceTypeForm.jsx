/**
 * AbsenceTypeForm Component
 * Form for creating/editing absence types
 */
import { useState, useEffect } from 'react';
import FormField from '../shared/components/FormField';
import ColorPicker from './ColorPicker';

export default function AbsenceTypeForm({
  absenceType = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    name_de: '',
    name_en: '',
    color: '#3B82F6',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form if editing
  useEffect(() => {
    if (absenceType) {
      setFormData({
        name: absenceType.name || '',
        name_de: absenceType.name_de || '',
        name_en: absenceType.name_en || '',
        color: absenceType.color || '#3B82F6',
        is_active: absenceType.is_active !== undefined ? absenceType.is_active : true,
      });
    }
  }, [absenceType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleColorChange = (color) => {
    setFormData((prev) => ({ ...prev, color }));
    if (errors.color) {
      setErrors((prev) => ({ ...prev, color: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name ist erforderlich';
    }
    if (!formData.name_de) {
      newErrors.name_de = 'Deutscher Name ist erforderlich';
    }
    if (!formData.name_en) {
      newErrors.name_en = 'Englischer Name ist erforderlich';
    }
    if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Ungültige Farbe (Format: #RRGGBB)';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const isEditMode = !!absenceType;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 id="form-title" className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Abwesenheitstyp bearbeiten' : 'Neuer Abwesenheitstyp'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name (Internal ID) */}
          <FormField
            label="Interner Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Urlaub"
            required={true}
            disabled={isEditMode}
          />
          {isEditMode && (
            <p className="text-xs text-gray-500 -mt-2">
              Der interne Name kann nicht geändert werden
            </p>
          )}

          {/* German Name */}
          <FormField
            label="Deutscher Name"
            name="name_de"
            type="text"
            value={formData.name_de}
            onChange={handleChange}
            error={errors.name_de}
            placeholder="Urlaub"
            required={true}
          />

          {/* English Name */}
          <FormField
            label="Englischer Name"
            name="name_en"
            type="text"
            value={formData.name_en}
            onChange={handleChange}
            error={errors.name_en}
            placeholder="Vacation"
            required={true}
          />

          {/* Color Picker */}
          <ColorPicker
            label="Farbe"
            value={formData.color}
            onChange={handleColorChange}
          />
          {errors.color && (
            <p className="text-sm text-red-600 -mt-2">{errors.color}</p>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Aktiv
            </label>
          </div>

          {/* Loading message */}
          {loading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
              Wird gespeichert...
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
