import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Absence endpoints
export const getAllAbsences = (filters = {}) => {
  return api.get('/absences', { params: filters })
}

export const getAbsenceById = (id) => {
  return api.get(`/absences/${id}`)
}

export const createAbsence = (data) => {
  return api.post('/absences', data)
}

export const updateAbsence = (id, data) => {
  return api.put(`/absences/${id}`, data)
}

export const deleteAbsence = (id) => {
  return api.delete(`/absences/${id}`)
}

// Metadata endpoints
export const getAbsenceTypes = () => {
  return api.get('/absence-types')
}

export const getStatistics = () => {
  return api.get('/statistics')
}

// Health check
export const healthCheck = () => {
  return api.get('/health')
}

export default api
