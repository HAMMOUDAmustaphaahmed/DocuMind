import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.params || '')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred'
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', err.response?.status, message)
    }
    
    return Promise.reject(new Error(message))
  }
)

// Individual exports
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return res.data
}

export const listDocuments = async (params = {}) => {
  const res = await api.get('/api/documents/', { params })
  return res.data
}

export const getDocument = async (id) => {
  const res = await api.get(`/api/documents/${id}`)
  return res.data
}

export const deleteDocument = async (id) => {
  const res = await api.delete(`/api/documents/${id}`)
  return res.data
}

export const askQuestion = async (doc_id, question) => {
  const res = await api.post('/api/chat/ask', { doc_id, question })
  return res.data
}

export const checkHealth = async () => {
  const res = await api.get('/health')
  return res.data
}

// API wrapper for components (matching the expected interface)
export const documentsApi = {
  list: listDocuments,
  get: getDocument,
  delete: deleteDocument,
  getTypes: async () => {
    // Return static list or fetch from backend if available
    return ['invoice', 'contract', 'cv', 'report', 'letter', 'identity_card', 'receipt', 'form', 'email', 'other']
  }
}

// Default export for direct axios usage
export default api