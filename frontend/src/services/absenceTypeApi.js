/**
 * API service for absence types
 */
import axios from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all absence types
 * @param {boolean} activeOnly - Filter only active types
 * @returns {Promise} API response
 */
export const getAllAbsenceTypes = async (activeOnly = true) => {
  return axios.get(`${API_BASE_URL}/api/absence-types`, {
    params: { active_only: activeOnly },
  });
};

/**
 * Get single absence type by ID
 * @param {number} id - Absence type ID
 * @returns {Promise} API response
 */
export const getAbsenceType = async (id) => {
  return axios.get(`${API_BASE_URL}/api/absence-types/${id}`);
};

/**
 * Create new absence type
 * @param {Object} data - Absence type data
 * @returns {Promise} API response
 */
export const createAbsenceType = async (data) => {
  return axios.post(`${API_BASE_URL}/api/absence-types`, data);
};

/**
 * Update absence type
 * @param {number} id - Absence type ID
 * @param {Object} data - Updated data
 * @returns {Promise} API response
 */
export const updateAbsenceType = async (id, data) => {
  return axios.put(`${API_BASE_URL}/api/absence-types/${id}`, data);
};

/**
 * Delete absence type (soft delete)
 * @param {number} id - Absence type ID
 * @param {boolean} hard - Hard delete if true
 * @returns {Promise} API response
 */
export const deleteAbsenceType = async (id, hard = false) => {
  return axios.delete(`${API_BASE_URL}/api/absence-types/${id}`, {
    params: { hard },
  });
};
