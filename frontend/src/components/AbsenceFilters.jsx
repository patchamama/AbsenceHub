import { useState } from 'react';
import FormField from '../shared/components/FormField';
import { validateDateRange } from '../utils/validators';
import { t } from '../utils/i18n';

export default function AbsenceFilters({ absenceTypes = [], onFilter, onClear }) {
  const [filterData, setFilterData] = useState({
    service_account: '',
    absence_type: '',
    start_date: '',
    end_date: '',
  });

  const [error, setError] = useState(null);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes input
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate date range if both dates are provided
    if (filterData.start_date && filterData.end_date) {
      const dateError = validateDateRange(filterData.start_date, filterData.end_date);
      if (dateError) {
        setError(dateError);
        return;
      }
    }

    // Call onFilter with non-empty filters
    const filters = {};
    if (filterData.service_account) {
      filters.service_account = filterData.service_account;
    }
    if (filterData.absence_type) {
      filters.absence_type = filterData.absence_type;
    }
    if (filterData.start_date) {
      filters.start_date = filterData.start_date;
    }
    if (filterData.end_date) {
      filters.end_date = filterData.end_date;
    }

    onFilter(filters);
  };

  // Clear all filters
  const handleClear = () => {
    setFilterData({
      service_account: '',
      absence_type: '',
      start_date: '',
      end_date: '',
    });
    setError(null);
    onClear();
  };

  // Convert absence types to FormField options
  const typeOptions = absenceTypes.map((type) => ({
    value: typeof type === 'string' ? type : type.value,
    label: typeof type === 'string' ? type : type.label,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('filter.title')}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Account Filter */}
        <FormField
          label={t('filter.serviceAccount')}
          name="service_account"
          type="text"
          value={filterData.service_account}
          onChange={handleChange}
          placeholder={t('placeholder.serviceAccount') || 's.john'}
        />

        {/* Absence Type Filter */}
        <FormField
          label={t('filter.absenceType')}
          name="absence_type"
          type="select"
          value={filterData.absence_type}
          onChange={handleChange}
          options={typeOptions}
        />

        {/* Start Date Filter */}
        <FormField
          label={t('filter.startDate')}
          name="start_date"
          type="date"
          value={filterData.start_date}
          onChange={handleChange}
        />

        {/* End Date Filter */}
        <FormField
          label={t('filter.endDate')}
          name="end_date"
          type="date"
          value={filterData.end_date}
          onChange={handleChange}
        />

        {/* Error message */}
        {error && (
          <div
            className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {t('filter.clear')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('filter.apply')}
          </button>
        </div>
      </form>
    </div>
  );
}
