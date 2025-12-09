/**
 * AbsenceTypeSettings Component
 * Settings page for managing absence types
 */
import { useState, useEffect } from 'react';
import {
  getAllAbsenceTypes,
  createAbsenceType,
  updateAbsenceType,
  deleteAbsenceType,
} from '../services/absenceTypeApi';
import AbsenceTypeForm from './AbsenceTypeForm';
import { t } from '../utils/i18n';

export default function AbsenceTypeSettings() {
  const [absenceTypes, setAbsenceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
    return localStorage.getItem('calendarWeekStart') || 'monday';
  });

  useEffect(() => {
    fetchAbsenceTypes();
  }, [showInactive]);

  // Handle calendar week start change
  const handleWeekStartChange = (value) => {
    setCalendarWeekStart(value);
    localStorage.setItem('calendarWeekStart', value);
    // Trigger a storage event so other components can react
    window.dispatchEvent(new Event('calendarWeekStartChange'));
  };

  const fetchAbsenceTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAbsenceTypes(!showInactive);
      setAbsenceTypes(response.data?.data || []);
    } catch (err) {
      setError('Fehler beim Laden der Abwesenheitstypen');
      console.error('Error fetching absence types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingType(null);
    setShowForm(true);
  };

  const handleEditClick = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingType) {
        await updateAbsenceType(editingType.id, formData);
        setSuccessMessage('Abwesenheitstyp erfolgreich aktualisiert');
      } else {
        await createAbsenceType(formData);
        setSuccessMessage('Abwesenheitstyp erfolgreich erstellt');
      }

      setShowForm(false);
      setEditingType(null);
      await fetchAbsenceTypes();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Speichern');
      console.error('Error saving absence type:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingType(null);
  };

  const handleDeleteClick = (type) => {
    setDeleteConfirm(type.id);
  };

  const handleConfirmDelete = async (typeId) => {
    try {
      setError(null);
      await deleteAbsenceType(typeId, false); // Soft delete
      setSuccessMessage('Abwesenheitstyp deaktiviert');
      setDeleteConfirm(null);
      await fetchAbsenceTypes();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Löschen');
      console.error('Error deleting absence type:', err);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Calendar Week Start Setting */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('settings.calendar')}</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 font-medium">
            {t('settings.weekStartsOn')}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="weekStart"
                value="monday"
                checked={calendarWeekStart === 'monday'}
                onChange={(e) => handleWeekStartChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300"
              />
              <span className="text-sm text-gray-700">{t('settings.monday')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="weekStart"
                value="sunday"
                checked={calendarWeekStart === 'sunday'}
                onChange={(e) => handleWeekStartChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300"
              />
              <span className="text-sm text-gray-700">{t('settings.sunday')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="showInactive" className="text-sm text-gray-700">
            {t('settings.showInactive')}
          </label>
        </div>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Neuer Typ
        </button>
      </div>

      {/* Absence Types List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Farbe
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Deutsch
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                English
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            {absenceTypes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Keine Abwesenheitstypen gefunden
                </td>
              </tr>
            ) : (
              absenceTypes.map((type) => (
                <tr
                  key={type.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    !type.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div
                      className="w-10 h-10 rounded-md border-2 border-gray-300"
                      style={{ backgroundColor: type.color }}
                      title={type.color}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {type.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {type.name_de}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {type.name_en}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {type.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Aktiv
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(type)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        Bearbeiten
                      </button>
                      {type.is_active && (
                        <>
                          {deleteConfirm === type.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleConfirmDelete(type.id)}
                                className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                              >
                                Bestätigen
                              </button>
                              <button
                                onClick={handleCancelDelete}
                                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                              >
                                Abbrechen
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(type)}
                              className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              Deaktivieren
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AbsenceTypeForm
          absenceType={editingType}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      )}
    </div>
  );
}
