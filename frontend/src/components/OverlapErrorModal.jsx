/**
 * Modal component for displaying overlap errors
 */
import React from 'react';
import { t } from '../utils/i18n';

export default function OverlapErrorModal({ error, onClose }) {
  if (!error) return null;

  // Parse the overlap error message
  // Format: OVERLAP_ERROR|absenceType|id|existingStart|existingEnd|newStart|newEnd
  const parts = error.split('|');

  if (parts[0] !== 'OVERLAP_ERROR' || parts.length !== 7) {
    // Fallback for non-overlap errors
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('button.close') || 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [, absenceType, conflictId, existingStart, existingEnd, newStart, newEnd] = parts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {t('error.overlapTitle') || 'Date Overlap Detected'}
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              <p className="mb-3">
                {t('error.overlapMessage') || 'The selected date range overlaps with an existing absence.'}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                <p className="font-semibold text-red-900 mb-1">
                  {t('error.existingAbsence') || 'Existing Absence'}:
                </p>
                <ul className="space-y-1 text-red-800">
                  <li>• {t('form.absenceType') || 'Type'}: <strong>{t(`absence.${absenceType}`) || absenceType}</strong></li>
                  <li>• ID: <strong>{conflictId}</strong></li>
                  <li>• {t('form.startDate') || 'Start'}: <strong>{existingStart}</strong></li>
                  <li>• {t('form.endDate') || 'End'}: <strong>{existingEnd}</strong></li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="font-semibold text-yellow-900 mb-1">
                  {t('error.yourDates') || 'Your Selected Dates'}:
                </p>
                <ul className="space-y-1 text-yellow-800">
                  <li>• {t('form.startDate') || 'Start'}: <strong>{newStart}</strong></li>
                  <li>• {t('form.endDate') || 'End'}: <strong>{newEnd}</strong></li>
                </ul>
              </div>

              <p className="mt-3 text-gray-700">
                {t('error.overlapAction') || 'Please modify or delete the existing absence before creating this new one.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            autoFocus
          >
            {t('button.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
