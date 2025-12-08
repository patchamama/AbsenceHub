import { useState } from 'react';
import { t } from '../utils/i18n';

export default function AbsenceList({
  absences = [],
  absenceTypes = [],
  onEdit,
  onDelete,
  onAdd,
  onFilter,
  onDateClick,
  loading = false,
  error = null,
  lastModifiedId = null,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Get color for absence type
  const getTypeColor = (typeName) => {
    const type = absenceTypes.find((t) => t.name === typeName || t.value === typeName);
    return type?.color || '#3B82F6';
  };

  // Calculate duration in days between two dates (inclusive)
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return dateString;
  };

  // Handle delete button click
  const handleDeleteClick = (absence) => {
    setDeleteConfirm(absence.id);
  };

  // Confirm delete
  const handleConfirmDelete = (absenceId) => {
    setDeleteConfirm(null);
    onDelete(absenceId);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <p className="text-gray-600">{t('status.loading')}</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  // Show empty state
  if (absences.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg">{t('list.empty')}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow overflow-x-auto"
      role="region"
      aria-label={t('list.title')}
      tabIndex="0"
    >
      <table className="w-full">
        <caption className="sr-only">
          {t('list.title')} - {absences.length} {absences.length === 1 ? t('list.day') : t('list.days')}
        </caption>
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.serviceAccount')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.employeeName')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.type')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.startDate')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.endDate')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.duration')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {absences.map((absence, index) => {
            const duration = calculateDuration(absence.start_date, absence.end_date);
            const displayName = absence.employee_fullname || absence.service_account;
            const isLastModified = lastModifiedId && absence.id === lastModifiedId;

            return (
              <tr
                key={absence.id || index}
                className={`border-b border-gray-200 transition-colors ${
                  isLastModified
                    ? 'bg-blue-50 hover:bg-blue-100 font-bold'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td
                  className="px-6 py-4 text-sm text-gray-900 cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  onClick={() => onFilter('service_account', absence.service_account)}
                  title={`Click to filter by ${absence.service_account}`}
                >
                  {absence.service_account}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-600 cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  onClick={() => onFilter('employee_fullname', displayName)}
                  title={`Click to filter by ${displayName}`}
                >
                  {displayName}
                </td>
                <td
                  className="px-6 py-4 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onFilter('absence_type', absence.absence_type)}
                  title={`Click to filter by ${absence.absence_type}`}
                >
                  <span
                    className="px-3 py-1 rounded-full text-white font-medium inline-block"
                    style={{ backgroundColor: getTypeColor(absence.absence_type) }}
                  >
                    {absence.absence_type}
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => onDateClick && onDateClick(absence.start_date, absence.service_account)}
                  title="Click to view in calendar"
                >
                  {formatDate(absence.start_date)}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  onClick={() => onDateClick && onDateClick(absence.end_date, absence.service_account)}
                  title="Click to view in calendar"
                >
                  {formatDate(absence.end_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {absence.is_half_day
                    ? t('list.halfDay')
                    : `${duration} ${duration === 1 ? t('list.day') : t('list.days')}`}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => onAdd(absence)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs font-medium min-h-[44px]"
                    aria-label={`${t('button.add')} new absence for ${absence.service_account}`}
                  >
                    {t('button.add')}
                  </button>
                  <button
                    onClick={() => onEdit(absence)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium min-h-[44px]"
                    aria-label={`${t('button.edit')} absence for ${absence.service_account} from ${absence.start_date} to ${absence.end_date}`}
                  >
                    {t('button.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(absence)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium min-h-[44px]"
                    aria-label={`${t('button.delete')} absence for ${absence.service_account} from ${absence.start_date} to ${absence.end_date}`}
                  >
                    {t('button.delete')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-6">
              <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
                {t('message.deleteConfirm')}
              </h3>
              <p id="delete-dialog-desc" className="text-gray-600 text-sm mb-6">
                {`${t('list.serviceAccount')}: ${
                  absences.find((a) => a.id === deleteConfirm)?.service_account
                }`}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px]"
                >
                  {t('button.cancel')}
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-h-[44px]"
                  aria-label={t('button.confirm')}
                >
                  {t('button.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
