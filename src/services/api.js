import axios from 'axios';

// const baseURL = 'https://quote24server.onrender.com/api';
const baseURL = 'http://localhost:5000/api';


const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Party services
export const partyService = {
  getAll: () => api.get('/parties'),
  getById: (id) => api.get(`/parties/${id}`),
  create: (data) => api.post('/parties', data),
  update: (id, data) => api.put(`/parties/${id}`, data),
  delete: (id) => api.delete(`/parties/${id}`)
};

// Category services
export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
};

// Brand services
export const brandService = {
  getAll: () => api.get('/brands'),
  create: (data) => api.post('/brands', data)
};

// Model services
export const modelService = {
  getAll: () => api.get('/models'),
  search: (term) => api.get(`/models/search?term=${term}`),
  create: (data) => api.post('/models', data)
};

// Quotation services
export const quotationService = {
  getAll: () => api.get('/quotations'),
  getByParty: (partyId) => api.get(`/quotations/party/${partyId}`),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  revise: (id, data) => api.post(`/quotations/${id}/revise`, data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  delete: (id) => api.delete(`/quotations/${id}`)
};

export default {
  partyService,
  categoryService,
  brandService,
  modelService,
  quotationService
};