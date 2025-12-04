import { useState } from 'react'
import { t } from '../utils/i18n'

export default function AbsenceList({
  absences = [],
  onEdit,
  onDelete,
  loading = false,
  error = null
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Calculate duration in days between two dates (inclusive)
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  // Format date for display
  const formatDate = (dateString) => {
    return dateString
  }

  // Handle delete button click
  const handleDeleteClick = (absence) => {
    setDeleteConfirm(absence.id)
  }

  // Confirm delete
  const handleConfirmDelete = (absenceId) => {
    setDeleteConfirm(null)
    onDelete(absenceId)
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('status.loading')}</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  // Show empty state
  if (absences.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-lg">{t('list.empty')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.serviceAccount')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.employeeName')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.type')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.startDate')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.endDate')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.duration')}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {t('list.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {absences.map((absence, index) => {
            const duration = calculateDuration(absence.start_date, absence.end_date)
            const displayName = absence.employee_fullname || absence.service_account

            return (
              <tr
                key={absence.id || index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  {absence.service_account}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {displayName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {absence.absence_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(absence.start_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(absence.end_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {duration} {duration === 1 ? t('list.day') : t('list.days')}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => onEdit(absence)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                  >
                    {t('button.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(absence)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                  >
                    {t('button.delete')}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('message.deleteConfirm')}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {`${t('list.serviceAccount')}: ${
                  absences.find(a => a.id === deleteConfirm)?.service_account
                }`}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {t('button.cancel')}
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  role="button"
                  aria-label="Confirm"
                >
                  {t('button.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
