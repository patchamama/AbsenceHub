/**
 * Audit Log Viewer Component
 * Displays audit logs with filtering capabilities
 */
import React, { useState, useEffect } from 'react';
import { getAllAuditLogs, deleteAuditLogs } from '../services/auditApi';
import { t } from '../utils/i18n';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [meta, setMeta] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filter !== 'ALL') {
        params.action = filter;
      }
      params.limit = 100;

      const response = await getAllAuditLogs(params);
      if (response.data?.success) {
        setLogs(response.data.data || []);
        setMeta(response.data.meta);
      } else {
        setError(response.data?.error || t('audit.error'));
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(t('audit.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogs = async () => {
    setDeleteConfirm(false);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const params = {};
      if (filter !== 'ALL') {
        params.action = filter;
      }

      const response = await deleteAuditLogs(params);
      if (response.data?.success) {
        setSuccessMessage(t('audit.deleteSuccess'));
        fetchLogs(); // Refresh the list
      } else {
        setError(response.data?.error || t('audit.deleteError'));
      }
    } catch (err) {
      console.error('Error deleting audit logs:', err);
      setError(t('audit.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      CREATE: t('audit.action.create'),
      UPDATE: t('audit.action.update'),
      DELETE: t('audit.action.delete'),
    };
    return labels[action] || action;
  };

  const getFilterLabel = () => {
    const labels = {
      ALL: t('audit.filter.all').toLowerCase(),
      CREATE: t('audit.filter.created').toLowerCase(),
      UPDATE: t('audit.filter.updated').toLowerCase(),
      DELETE: t('audit.filter.deleted').toLowerCase(),
    };
    return labels[filter] || t('audit.filter.all').toLowerCase();
  };

  const renderChangeDetails = (log) => {
    if (log.action === 'CREATE') {
      return (
        <div className="text-sm text-gray-600">
          <strong>{t('audit.newValues')}:</strong>
          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
            {JSON.stringify(log.new_values, null, 2)}
          </pre>
        </div>
      );
    }

    if (log.action === 'UPDATE') {
      return (
        <div className="text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t('audit.oldValues')}:</strong>
              <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-x-auto">
                {JSON.stringify(log.old_values, null, 2)}
              </pre>
            </div>
            <div>
              <strong>{t('audit.newValues')}:</strong>
              <pre className="mt-1 p-2 bg-green-50 rounded text-xs overflow-x-auto">
                {JSON.stringify(log.new_values, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    if (log.action === 'DELETE') {
      return (
        <div className="text-sm text-gray-600">
          <strong>{t('audit.deletedValues')}:</strong>
          <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-x-auto">
            {JSON.stringify(log.old_values, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="audit-log-viewer">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('audit.title')}</h2>

          {/* Delete Logs Button */}
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={loading || logs.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {t('audit.button.deleteLogs')}
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('audit.filter.all')}
          </button>
          <button
            onClick={() => setFilter('CREATE')}
            className={`px-4 py-2 rounded ${
              filter === 'CREATE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('audit.filter.created')}
          </button>
          <button
            onClick={() => setFilter('UPDATE')}
            className={`px-4 py-2 rounded ${
              filter === 'UPDATE'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('audit.filter.updated')}
          </button>
          <button
            onClick={() => setFilter('DELETE')}
            className={`px-4 py-2 rounded ${
              filter === 'DELETE'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('audit.filter.deleted')}
          </button>
        </div>

        {/* Meta information */}
        {meta && (
          <div className="text-sm text-gray-600 mb-4">
            {t('audit.showing', '', { returned: meta.returned, total: meta.total })}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('audit.loading')}</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Audit logs list */}
      {!loading && !error && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('audit.empty')}
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ID: {log.entity_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>

                {log.description && (
                  <div className="mb-3 text-gray-700">{log.description}</div>
                )}

                {renderChangeDetails(log)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('button.confirm')}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {t('audit.confirmDelete', '', { filter: getFilterLabel() })}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors min-h-[44px]"
                >
                  {t('button.cancel')}
                </button>
                <button
                  onClick={handleDeleteLogs}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-h-[44px]"
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
