/**
 * API service for audit logs
 */
import axios from 'axios';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all audit logs with optional filtering
 * @param {Object} params - Query parameters
 * @param {string} params.action - Filter by action type (CREATE, UPDATE, DELETE)
 * @param {number} params.entity_id - Filter by entity ID
 * @param {number} params.limit - Limit number of results (default: 100)
 * @param {number} params.offset - Number of records to skip (default: 0)
 * @returns {Promise} - Promise with audit logs data
 */
export const getAllAuditLogs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/audit-logs`, { params });
    return response;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Get a specific audit log by ID
 * @param {number} logId - Audit log ID
 * @returns {Promise} - Promise with audit log data
 */
export const getAuditLogById = async (logId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/audit-logs/${logId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching audit log ${logId}:`, error);
    throw error;
  }
};

/**
 * Get audit log statistics
 * @returns {Promise} - Promise with statistics data
 */
export const getAuditStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/audit-logs/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

/**
 * Delete audit logs by filter
 * @param {Object} params - Filter parameters
 * @param {string} params.action - Filter by action type (CREATE, UPDATE, DELETE)
 * @returns {Promise} - Promise with deletion result
 */
export const deleteAuditLogs = async (params = {}) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/audit-logs`, { params });
    return response;
  } catch (error) {
    console.error('Error deleting audit logs:', error);
    throw error;
  }
};
