import { useState, useEffect } from 'react';
import { t, getLanguage, setLanguage, getAvailableLanguages } from './utils/i18n';
import {
  getAllAbsences,
  getAbsenceTypes,
  getStatistics,
  createAbsence,
  updateAbsence,
  deleteAbsence,
} from './services/absenceApi';
import AbsenceForm from './components/AbsenceForm';
import AbsenceList from './components/AbsenceList';
import AbsenceFilters from './components/AbsenceFilters';
import './App.css';

function App() {
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

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch absences when filters change
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setLoading(true);
        setError(null);

        const absencesRes = await getAllAbsences(filters);
        setAbsences(absencesRes.data?.data || []);
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
        getAbsenceTypes(),
        getStatistics(),
      ]);

      setAbsences(absencesRes.data?.data || []);
      setAbsenceTypes(typesRes.data?.data || []);
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
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [absencesRes, statsRes] = await Promise.all([
        getAllAbsences(filters),
        getStatistics(),
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

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingAbsence) {
        // Update mode
        await updateAbsence(editingAbsence.id, formData);
        setSuccessMessage(t('message.updatedSuccess'));
      } else {
        // Create mode
        await createAbsence(formData);
        setSuccessMessage(t('message.createdSuccess'));
      }

      setShowForm(false);
      setEditingAbsence(null);
      await refreshData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('message.savingError'));
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
              >
                {getAvailableLanguages().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        {loading && !showForm ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('status.loading')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Section */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {t('stats.totalAbsences')}
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {statistics.total_absences}
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
                    {t('stats.byType')}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(statistics.by_type || {}).map(([type, count]) => (
                      <li key={type} className="text-sm text-gray-600">
                        {t(`absence.${type}`)}:{' '}
                        <span className="font-bold">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Absence Form Modal */}
            {showForm && (
              <AbsenceForm
                absence={editingAbsence}
                absenceTypes={absenceTypes}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            )}

            {/* Filters Section */}
            <AbsenceFilters
              absenceTypes={absenceTypes}
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
              onEdit={handleEditClick}
              onDelete={handleDeleteAbsence}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
