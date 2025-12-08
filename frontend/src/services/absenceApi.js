import axios from 'axios';

// Get API URL from environment variable
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fallback ports to try if the main URL fails
const FALLBACK_PORTS_ENV = import.meta.env.VITE_FALLBACK_PORTS || '5000,5001,5002';
const FALLBACK_PORTS = FALLBACK_PORTS_ENV.split(',').map(p => parseInt(p.trim()));
let currentPortIndex = 0;

// Storage key for last working API URL
const STORAGE_KEY = 'absencehub_api_url';

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
 * Save working API URL to localStorage
 */
function saveWorkingUrl(url) {
  try {
    localStorage.setItem(STORAGE_KEY, url);
    console.log(`✓ Saved working API URL: ${url}`);
  } catch (error) {
    console.warn('Could not save API URL to localStorage:', error);
  }
}

/**
 * Get last working API URL from localStorage
 */
function getLastWorkingUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Try to read backend port from file (for development)
 */
async function readBackendPort() {
  try {
    const response = await fetch('/.backend-port', {
      method: 'GET',
      cache: 'no-cache'
    });
    if (response.ok) {
      const text = await response.text();
      const port = parseInt(text.trim());
      if (!isNaN(port)) {
        console.log(`✓ Found backend running on port ${port}`);
        return port;
      }
    }
  } catch (error) {
    // File doesn't exist or fetch failed - not an error in production
  }
  return null;
}

/**
 * Test if a specific port is responding
 */
async function testPort(port) {
  const parsed = parseUrl(API_BASE_URL);
  const testUrl = `${parsed.protocol}//${parsed.hostname}:${port}${parsed.pathname}`;

  try {
    const response = await fetch(`${testUrl}/health`, {
      method: 'GET',
      cache: 'no-cache',
      signal: AbortSignal.timeout(2000)
    });

    if (response.ok) {
      console.log(`✓ Backend responding on port ${port}`);
      return testUrl;
    }
  } catch (error) {
    console.log(`✗ Port ${port} not responding`);
  }

  return null;
}

/**
 * Initialize API URL with smart detection
 */
async function initializeApiUrl() {
  console.log('🔍 Detecting backend API URL...');

  // Step 1: Try last working URL first (fastest path)
  const lastUrl = getLastWorkingUrl();
  if (lastUrl) {
    console.log(`Trying last working URL: ${lastUrl}`);
    try {
      const response = await fetch(`${lastUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        API_BASE_URL = lastUrl;
        api.defaults.baseURL = lastUrl;
        console.log(`✓ Using last working API URL: ${lastUrl}`);
        return;
      }
    } catch (error) {
      console.log('Last working URL no longer responds, trying other ports...');
    }
  }

  // Step 2: Try port from .backend-port file (if exists)
  const backendPort = await readBackendPort();
  if (backendPort) {
    console.log(`Trying port ${backendPort} from .backend-port file...`);
    const detectedUrl = await testPort(backendPort);
    if (detectedUrl) {
      API_BASE_URL = detectedUrl;
      api.defaults.baseURL = detectedUrl;
      saveWorkingUrl(detectedUrl);
      console.log(`✓ Using backend at: ${detectedUrl}`);
      return;
    }
  }

  // Step 3: Try fallback ports in order (5000, 5001, 5002, ...)
  console.log('Trying fallback ports in order...');
  for (const port of FALLBACK_PORTS) {
    console.log(`Trying port ${port}...`);
    const workingUrl = await testPort(port);
    if (workingUrl) {
      API_BASE_URL = workingUrl;
      api.defaults.baseURL = workingUrl;
      saveWorkingUrl(workingUrl);
      console.log(`✓ Found working backend at: ${workingUrl}`);
      return;
    }
  }

  // Step 4: No backend found
  console.error('❌ Could not detect any working backend API');
  console.error(`Tried ports: ${FALLBACK_PORTS.join(', ')}`);
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

// Initialize API URL detection
initializeApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to ensure we're using the latest URL
 */
api.interceptors.request.use(
  config => {
    // Ensure we're using the current API_BASE_URL
    config.baseURL = API_BASE_URL;
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Response interceptor to handle port failures
 */
api.interceptors.response.use(
  response => {
    // Save working URL on successful response
    if (API_BASE_URL !== getLastWorkingUrl()) {
      saveWorkingUrl(API_BASE_URL);
    }
    return response;
  },
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
        const retryConfig = { ...error.config, baseURL: fallbackUrl };
        return api.request(retryConfig);
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

export const getStatistics = (filters = {}) => {
  return api.get('/statistics', { params: filters });
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;
