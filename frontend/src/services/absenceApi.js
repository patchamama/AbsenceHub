import axios from 'axios';

// Get API URL from environment variable
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fallback ports to try if the main URL fails
const FALLBACK_PORTS = [5000, 5001, 5002];
let currentPortIndex = 0;

/**
 * Extract host and port from URL
 */
function parseUrl(url) {
  const urlObj = new URL(url);
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80),
    pathname: urlObj.pathname,
  };
}

/**
 * Try to use fallback ports if the main URL fails
 */
function getFallbackUrl() {
  const parsed = parseUrl(API_BASE_URL);

  if (currentPortIndex < FALLBACK_PORTS.length) {
    const port = FALLBACK_PORTS[currentPortIndex];
    currentPortIndex++;
    const fallbackUrl = `${parsed.protocol}//${parsed.hostname}:${port}${parsed.pathname}`;
    console.warn(`⚠ API failed on ${parsed.port}. Trying fallback port ${port}...`);
    return fallbackUrl;
  }

  return null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor to handle port failures
 */
api.interceptors.response.use(
  response => response,
  async error => {
    // If the request failed and we haven't tried fallback ports yet
    if (error.response === undefined && currentPortIndex < FALLBACK_PORTS.length) {
      const fallbackUrl = getFallbackUrl();

      if (fallbackUrl) {
        // Update the API base URL and retry
        api.defaults.baseURL = fallbackUrl;
        API_BASE_URL = fallbackUrl;
        console.log(`✓ Using fallback API URL: ${fallbackUrl}`);

        // Retry the original request with the new URL
        return api.request(error.config);
      }
    }

    return Promise.reject(error);
  }
);

// Absence endpoints
export const getAllAbsences = (filters = {}) => {
  return api.get('/absences', { params: filters });
};

export const getAbsenceById = (id) => {
  return api.get(`/absences/${id}`);
};

export const createAbsence = (data) => {
  return api.post('/absences', data);
};

export const updateAbsence = (id, data) => {
  return api.put(`/absences/${id}`, data);
};

export const deleteAbsence = (id) => {
  return api.delete(`/absences/${id}`);
};

// Metadata endpoints
export const getAbsenceTypes = () => {
  return api.get('/absence-types');
};

export const getStatistics = () => {
  return api.get('/statistics');
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;
