import { useState, useEffect } from 'react';
import { t, getLanguage, setLanguage, getAvailableLanguages } from './utils/i18n';
import {
  getAllAbsences,
  getStatistics,
  createAbsence,
  updateAbsence,
  deleteAbsence,
} from './services/absenceApi';
import { getAllAbsenceTypes } from './services/absenceTypeApi';
import AbsenceForm from './components/AbsenceForm';
import AbsenceList from './components/AbsenceList';
import AbsenceFilters from './components/AbsenceFilters';
import AbsenceTypeSettings from './components/AbsenceTypeSettings';
import AbsenceCalendar from './components/AbsenceCalendar';
import AuditLogViewer from './components/AuditLogViewer';
import OverlapErrorModal from './components/OverlapErrorModal';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'calendar', 'settings', 'audit'
  const [absences, setAbsences] = useState([]);
  const [absenceTypes, setAbsenceTypes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());
  const [showForm, setShowForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [filters, setFilters] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [lastModifiedId, setLastModifiedId] = useState(null);
  const [overlapError, setOverlapError] = useState(null);

  // Fetch initial data and sync HTML lang attribute
  useEffect(() => {
    fetchData();
    // Sync HTML lang attribute on mount
    document.documentElement.lang = getLanguage();
  }, []);

  // Fetch absences and statistics when filters change
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setLoading(true);
        setError(null);

        const [absencesRes, statsRes] = await Promise.all([
          getAllAbsences(filters),
          getStatistics(filters),  // Pass filters to statistics
        ]);

        setAbsences(absencesRes.data?.data || []);
        setStatistics(statsRes.data?.data || null);
      } catch (err) {
        setError(t('message.loadingError'));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [absencesRes, typesRes, statsRes] = await Promise.all([
        getAllAbsences(),
        getAllAbsenceTypes(true), // Get from database
        getStatistics(),
      ]);

      setAbsences(absencesRes.data?.data || []);

      // Format types for compatibility with existing code
      const types = (typesRes.data?.data || []).map(type => ({
        value: type.name,
        label: currentLanguage === 'de' ? type.name_de : type.name_en,
        color: type.color,
        ...type
      }));
      setAbsenceTypes(types);

      setStatistics(statsRes.data?.data || null);
    } catch (err) {
      setError(t('message.loadingError'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [absencesRes, statsRes] = await Promise.all([
        getAllAbsences(filters),
        getStatistics(filters),  // Pass filters to statistics
      ]);

      setAbsences(absencesRes.data?.data || []);
      setStatistics(statsRes.data?.data || null);
    } catch (err) {
      setError(t('message.loadingError'));
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingAbsence(null);
    setShowForm(true);
  };

  const handleEditClick = (absence) => {
    setEditingAbsence(absence);
    setShowForm(true);
  };

  const handleAddClick = (absence) => {
    // Create a new absence template with pre-filled data
    const absenceTemplate = {
      service_account: absence.service_account || '',
      employee_fullname: absence.employee_fullname || '',
      start_date: absence.start_date || '',
      end_date: absence.end_date || '',
    };
    setEditingAbsence(absenceTemplate);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      let result;
      if (editingAbsence && editingAbsence.id) {
        // Update mode (only if we have an actual ID)
        result = await updateAbsence(editingAbsence.id, formData);
        setSuccessMessage(t('message.updatedSuccess'));
        setLastModifiedId(editingAbsence.id);
      } else {
        // Create mode (includes new entries and "Add" duplicates without ID)
        result = await createAbsence(formData);
        setSuccessMessage(t('message.createdSuccess'));
        // Set the ID of the newly created absence
        if (result.data?.data?.id) {
          setLastModifiedId(result.data.data.id);
        }
      }

      setShowForm(false);
      setEditingAbsence(null);
      await refreshData();

      // Clear success message and highlight after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setLastModifiedId(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('message.savingError');

      // Check if it's an overlap error
      if (errorMessage.startsWith('OVERLAP_ERROR|')) {
        setOverlapError(errorMessage);
        // Don't close the form, keep it open so user can modify dates
      } else {
        setError(errorMessage);
      }

      console.error('Error saving absence:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAbsence(null);
  };

  const handleDeleteAbsence = async (absenceId) => {
    try {
      setError(null);
      await deleteAbsence(absenceId);
      setSuccessMessage(t('message.deletedSuccess'));
      await refreshData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('message.deletingError'));
      console.error('Error deleting absence:', err);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleCellFilter = (filterType, filterValue) => {
    // Apply filter for the specific cell clicked
    setFilters({ [filterType]: filterValue });
  };

  const handleStatisticClick = (absenceType) => {
    // Apply filter when clicking on a statistic by type
    if (absenceType) {
      setFilters({ absence_type: absenceType });
    }
  };

  const handleDateClick = (dateString, serviceAccount) => {
    // Navigate to calendar view and set filters for the clicked date
    if (dateString && serviceAccount) {
      // Extract year and month from date (YYYY-MM-DD format)
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthFilter = `${year}-${month}`;

      // Set filters and switch to calendar view
      setFilters({
        service_account: serviceAccount,
        month: monthFilter,
      });
      setCurrentView('calendar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-gray-600 text-sm">{t('app.subtitle')}</p>
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label={t('nav.language')}
                id="language-selector"
              >
                {getAvailableLanguages().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex gap-2">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 {t('nav.list')}
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 {t('nav.calendar')}
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚙️ {t('nav.settings')}
            </button>
            <button
              onClick={() => setCurrentView('audit')}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === 'audit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 {t('nav.auditLogs')}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {loading && !showForm ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="text-gray-600">{t('status.loading')}</p>
          </div>
        ) : (
          <>
            {/* List View */}
            {currentView === 'list' && (
              <div className="space-y-8">
                {/* Active Filters Display */}
                {Object.keys(filters).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-blue-900">
                        Aktive Filter:
                      </h3>
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-blue-700 hover:text-blue-900 underline"
                      >
                        Alle löschen
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filters.service_account && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Service Account: <strong className="ml-1">{filters.service_account}</strong>
                        </span>
                      )}
                      {filters.employee_fullname && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Name: <strong className="ml-1">{filters.employee_fullname}</strong>
                        </span>
                      )}
                      {filters.absence_type && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Typ: <strong className="ml-1">{filters.absence_type}</strong>
                        </span>
                      )}
                      {filters.month && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Monat: <strong className="ml-1">{filters.month}</strong>
                        </span>
                      )}
                      {filters.start_date && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Von: <strong className="ml-1">{filters.start_date}</strong>
                        </span>
                      )}
                      {filters.end_date && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Bis: <strong className="ml-1">{filters.end_date}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistics Section */}
                {statistics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">
                        {t('stats.totalDays')}
                      </h3>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {statistics.total_days || 0}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        (including 0.5 for half days)
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">
                        {t('stats.uniqueEmployees')}
                      </h3>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {statistics.unique_employees}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase">
                        {t('stats.daysByType')}
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {Object.entries(statistics.by_type || {}).map(([type, days]) => (
                          <li
                            key={type}
                            onClick={() => handleStatisticClick(type)}
                            className="text-sm text-gray-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                            title={`Click to filter by ${t(`absence.${type}`)}`}
                          >
                            {t(`absence.${type}`)}:{' '}
                            <span className="font-bold">{days} {days === 1 ? 'day' : 'days'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Filters Section */}
                <AbsenceFilters
                  absenceTypes={absenceTypes}
                  currentFilters={filters}
                  onFilter={handleApplyFilters}
                  onClear={handleClearFilters}
                />

                {/* Add Absence Button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">{t('list.title')}</h2>
                  <button
                    onClick={handleCreateClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('button.add')}
                  </button>
                </div>

                {/* Absences List Section */}
                <AbsenceList
                  absences={absences}
                  absenceTypes={absenceTypes}
                  onAdd={handleAddClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteAbsence}
                  onFilter={handleCellFilter}
                  onDateClick={handleDateClick}
                  loading={loading}
                  error={error}
                  lastModifiedId={lastModifiedId}
                />
              </div>
            )}

            {/* Calendar View */}
            {currentView === 'calendar' && (
              <>
                {/* Active Filters Display for Calendar */}
                {Object.keys(filters).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-blue-900">
                        Aktive Filter:
                      </h3>
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-blue-700 hover:text-blue-900 underline"
                      >
                        Alle löschen
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {filters.service_account && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Service Account: <strong className="ml-1">{filters.service_account}</strong>
                        </span>
                      )}
                      {filters.employee_fullname && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Name: <strong className="ml-1">{filters.employee_fullname}</strong>
                        </span>
                      )}
                      {filters.absence_type && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          Typ: <strong className="ml-1">{filters.absence_type}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <AbsenceCalendar
                  absences={absences}
                  absenceTypes={absenceTypes}
                  initialMonth={filters.month || null}
                  onAddClick={handleAddClick}
                  onEditClick={handleEditClick}
                  currentFilters={filters}
                />
              </>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
              <AbsenceTypeSettings />
            )}

            {/* Audit Logs View */}
            {currentView === 'audit' && (
              <AuditLogViewer />
            )}
          </>
        )}

        {/* Absence Form Modal - Always available regardless of view */}
        {showForm && (
          <AbsenceForm
            absence={editingAbsence}
            absenceTypes={absenceTypes}
            absences={absences}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            onDelete={handleDeleteAbsence}
            loading={formLoading}
            overlapError={overlapError}
          />
        )}

        {/* Overlap Error Modal - Always available regardless of view */}
        <OverlapErrorModal
          error={overlapError}
          onClose={() => setOverlapError(null)}
        />
      </main>
    </div>
  );
}

export default App;
