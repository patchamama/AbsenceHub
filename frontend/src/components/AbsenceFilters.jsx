import { useState } from 'react';
import FormField from '../shared/components/FormField';
import { validateDateRange } from '../utils/validators';
import { t } from '../utils/i18n';

export default function AbsenceFilters({ absenceTypes = [], onFilter, onClear }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterMode, setFilterMode] = useState('range'); // 'range' or 'month'
  const [filterData, setFilterData] = useState({
    service_account: '',
    employee_fullname: '',
    absence_type: '',
    start_date: '',
    end_date: '',
    month: '',
  });

  const [error, setError] = useState(null);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilterData = { ...filterData, [name]: value };
    setFilterData(newFilterData);

    // Clear error when user changes input
    if (error) {
      setError(null);
    }

    // Validate date range in real-time for filters
    if (filterMode === 'range' && (name === 'start_date' || name === 'end_date')) {
      const startDate = name === 'start_date' ? value : filterData.start_date;
      const endDate = name === 'end_date' ? value : filterData.end_date;

      if (startDate && endDate) {
        const dateRangeError = validateDateRange(startDate, endDate);
        if (dateRangeError) {
          setError(dateRangeError);
        }
      }
    }
  };

  // Handle filter mode change
  const handleFilterModeChange = (mode) => {
    setFilterMode(mode);
    setError(null);
    // Clear opposite mode fields
    if (mode === 'month') {
      setFilterData(prev => ({ ...prev, start_date: '', end_date: '' }));
    } else {
      setFilterData(prev => ({ ...prev, month: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate date range if both dates are provided in range mode
    if (filterMode === 'range' && filterData.start_date && filterData.end_date) {
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
    if (filterData.employee_fullname) {
      filters.employee_fullname = filterData.employee_fullname;
    }
    if (filterData.absence_type) {
      filters.absence_type = filterData.absence_type;
    }

    // Add date filters based on mode
    if (filterMode === 'month' && filterData.month) {
      filters.month = filterData.month;
    } else if (filterMode === 'range') {
      if (filterData.start_date) {
        filters.start_date = filterData.start_date;
      }
      if (filterData.end_date) {
        filters.end_date = filterData.end_date;
      }
    }

    // Don't clear the form - keep filter values visible
    onFilter(filters);
  };

  // Clear all filters
  const handleClear = () => {
    setFilterData({
      service_account: '',
      employee_fullname: '',
      absence_type: '',
      start_date: '',
      end_date: '',
      month: '',
    });
    setError(null);
    setFilterMode('range');
    onClear();
  };

  // Convert absence types to FormField options
  const typeOptions = absenceTypes.map((type) => ({
    value: typeof type === 'string' ? type : type.value,
    label: typeof type === 'string' ? type : type.label,
  }));

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{t('filter.title')}</h3>
        <span className="text-2xl text-gray-500">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Service Account Filter */}
            <FormField
              label={t('filter.serviceAccount')}
              name="service_account"
              type="text"
              value={filterData.service_account}
              onChange={handleChange}
              placeholder={t('placeholder.serviceAccount') || 's.john'}
            />

            {/* Employee Name Filter (NEW) */}
            <FormField
              label={t('filter.employeeName') || 'Name des Mitarbeiters'}
              name="employee_fullname"
              type="text"
              value={filterData.employee_fullname}
              onChange={handleChange}
              placeholder="Max Müller"
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

            {/* Filter Mode Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('filter.dateMode') || 'Datumsfilter'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="filterMode"
                    value="range"
                    checked={filterMode === 'range'}
                    onChange={() => handleFilterModeChange('range')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {t('filter.dateRange') || 'Datumsbereich'}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="filterMode"
                    value="month"
                    checked={filterMode === 'month'}
                    onChange={() => handleFilterModeChange('month')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {t('filter.month') || 'Monat'}
                  </span>
                </label>
              </div>
            </div>

            {/* Date Range Filters */}
            {filterMode === 'range' && (
              <>
                <FormField
                  label={t('filter.startDate')}
                  name="start_date"
                  type="date"
                  value={filterData.start_date}
                  onChange={handleChange}
                />

                <FormField
                  label={t('filter.endDate')}
                  name="end_date"
                  type="date"
                  value={filterData.end_date}
                  onChange={handleChange}
                  min={filterData.start_date}
                />
              </>
            )}

            {/* Month Filter */}
            {filterMode === 'month' && (
              <FormField
                label={t('filter.selectMonth') || 'Monat auswählen'}
                name="month"
                type="month"
                value={filterData.month}
                onChange={handleChange}
              />
            )}

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
      )}
    </div>
  );
}
