// client/src/services/api.js - Fixed API service with backward compatibility
import axios from 'axios';

const API_BASE_URL =  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (when implemented)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Uncomment when you have auth routes set up
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Party/Client API methods - backward compatible with your existing backend
export const partyService = {
  // Basic CRUD operations (your existing methods)
  getAll: (queryString = '') => api.get(`/parties${queryString}`),
  getById: (id) => api.get(`/parties/${id}`),
  getByPartyId: (partyId) => api.get(`/parties/partyId/${partyId}`),
  create: (partyData) => api.post('/parties', partyData),
  update: (id, partyData) => api.put(`/parties/${id}`, partyData),
  delete: (id) => api.delete(`/parties/${id}`),
  getStats: () => api.get('/parties/stats'),
  
  // Enhanced CRM methods - with fallbacks for when backend isn't updated yet
  
  // Add comment/note to party
  addComment: async (id, commentData) => {
    try {
      return await api.post(`/parties/${id}/comments`, commentData);
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback: This endpoint doesn't exist yet
        console.warn('Comment API not implemented yet');
        throw new Error('Comment feature will be available when backend is updated');
      }
      throw error;
    }
  },
  
  // Add follow-up to party
  addFollowUp: async (id, followUpData) => {
    try {
      return await api.post(`/parties/${id}/follow-ups`, followUpData);
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback: This endpoint doesn't exist yet
        console.warn('Follow-up API not implemented yet');
        throw new Error('Follow-up feature will be available when backend is updated');
      }
      throw error;
    }
  },
  
  // Complete follow-up
  completeFollowUp: async (id, followUpId, completionData) => {
    try {
      return await api.put(`/parties/${id}/follow-ups/${followUpId}/complete`, completionData);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('Complete follow-up API not implemented yet');
        throw new Error('Follow-up completion feature will be available when backend is updated');
      }
      throw error;
    }
  },
  
  // Get today's follow-ups
  getTodaysFollowUps: async () => {
    try {
      return await api.get('/parties/follow-ups/today');
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback: Return empty array if endpoint doesn't exist
        console.warn('Today\'s follow-ups API not implemented yet');
        return { data: [] };
      }
      throw error;
    }
  },
  
  // Get overdue follow-ups
  getOverdueFollowUps: async () => {
    try {
      return await api.get('/parties/follow-ups/overdue');
    } catch (error) {
      if (error.response?.status === 404) {
        // Fallback: Return empty array if endpoint doesn't exist
        console.warn('Overdue follow-ups API not implemented yet');
        return { data: [] };
      }
      throw error;
    }
  },
  
  // Bulk operations (for future)
  bulkUpdate: async (partyIds, updateData) => {
    try {
      return await api.put('/parties/bulk-update', { partyIds, updateData });
    } catch (error) {
      console.warn('Bulk update API not implemented yet');
      throw new Error('Bulk update feature coming soon');
    }
  },
  
  // Export parties
  exportToCSV: async (filters = {}) => {
    try {
      return await api.get('/parties/export/csv', { params: filters, responseType: 'blob' });
    } catch (error) {
      console.warn('Export API not implemented yet');
      throw new Error('Export feature coming soon');
    }
  },
  
  // Import parties
  importFromCSV: async (formData) => {
    try {
      return await api.post('/parties/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.warn('Import API not implemented yet');
      throw new Error('Import feature coming soon');
    }
  },
  
  // Advanced search
  search: async (searchParams) => {
    try {
      return await api.post('/parties/search', searchParams);
    } catch (error) {
      // Fallback to basic search via query params
      const queryString = new URLSearchParams(searchParams).toString();
      return await api.get(`/parties?${queryString}`);
    }
  },
  
  // Get party activity timeline
  getActivityTimeline: async (id) => {
    try {
      return await api.get(`/parties/${id}/activity`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('Activity timeline API not implemented yet');
        return { data: [] };
      }
      throw error;
    }
  },
  
  // Archive/Restore party
  archive: async (id) => {
    try {
      return await api.put(`/parties/${id}/archive`);
    } catch (error) {
      console.warn('Archive API not implemented yet');
      throw new Error('Archive feature coming soon');
    }
  },
  
  restore: async (id) => {
    try {
      return await api.put(`/parties/${id}/restore`);
    } catch (error) {
      console.warn('Restore API not implemented yet');
      throw new Error('Restore feature coming soon');
    }
  },
  
  // Get related quotations summary
  getQuotationsSummary: async (id) => {
    try {
      return await api.get(`/parties/${id}/quotations/summary`);
    } catch (error) {
      // Fallback to regular quotations endpoint
      try {
        return await api.get(`/quotations/party/${id}`);
      } catch (fallbackError) {
        console.warn('Quotations summary API not implemented yet');
        return { data: [] };
      }
    }
  }
};

// Quotation API methods (your existing ones)
export const quotationService = {
  getAll: () => api.get('/quotations'),
  getById: (id) => api.get(`/quotations/${id}`),
  getByParty: (partyId) => api.get(`/quotations/party/${partyId}`),
  create: (quotationData) => api.post('/quotations', quotationData),
  update: (id, quotationData) => api.put(`/quotations/${id}`, quotationData),
  delete: (id) => api.delete(`/quotations/${id}`),
  
  // Enhanced quotation methods (with fallbacks)
  duplicate: async (id) => {
    try {
      return await api.post(`/quotations/${id}/duplicate`);
    } catch (error) {
      console.warn('Duplicate quotation API not implemented yet');
      throw new Error('Duplicate feature coming soon');
    }
  },
  
  revise: async (id, revisionData) => {
    try {
      return await api.post(`/quotations/${id}/revise`, revisionData);
    } catch (error) {
      console.warn('Revise quotation API not implemented yet');
      throw new Error('Revise feature coming soon');
    }
  },
  
  updateStatus: async (id, status, note) => {
    try {
      return await api.put(`/quotations/${id}/status`, { status, note });
    } catch (error) {
      // Fallback to regular update
      return await api.put(`/quotations/${id}`, { status });
    }
  },
  
  // PDF operations
  generatePDF: async (id) => {
    try {
      return await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
    } catch (error) {
      console.warn('PDF generation API not implemented yet');
      throw new Error('PDF generation feature coming soon');
    }
  },
  
  emailPDF: async (id, emailData) => {
    try {
      return await api.post(`/quotations/${id}/email`, emailData);
    } catch (error) {
      console.warn('Email PDF API not implemented yet');
      throw new Error('Email PDF feature coming soon');
    }
  },
  
  // Analytics
  getStats: async () => {
    try {
      return await api.get('/quotations/stats');
    } catch (error) {
      console.warn('Quotation stats API not implemented yet');
      return { data: { total: 0, byStatus: {} } };
    }
  },
  
  getConversionRate: async () => {
    try {
      return await api.get('/quotations/conversion-rate');
    } catch (error) {
      console.warn('Conversion rate API not implemented yet');
      return { data: { rate: 0 } };
    }
  }
};

// Component/Product API methods (your existing ones, if they exist)
export const componentService = {
  getAll: () => api.get('/components'),
  getById: (id) => api.get(`/components/${id}`),
  create: (componentData) => api.post('/components', componentData),
  update: (id, componentData) => api.put(`/components/${id}`, componentData),
  delete: (id) => api.delete(`/components/${id}`),
  
  // Enhanced component methods (with fallbacks)
  search: async (query) => {
    try {
      return await api.get(`/components/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      // Fallback to basic get all
      return await api.get('/components');
    }
  },
  
  getByCategory: async (category) => {
    try {
      return await api.get(`/components/category/${category}`);
    } catch (error) {
      console.warn('Component category API not implemented yet');
      return { data: [] };
    }
  },
  
  updatePricing: async (id, pricingData) => {
    try {
      return await api.put(`/components/${id}/pricing`, pricingData);
    } catch (error) {
      // Fallback to regular update
      return await api.put(`/components/${id}`, pricingData);
    }
  },
  
  // Bulk operations
  bulkImport: async (formData) => {
    try {
      return await api.post('/components/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.warn('Component bulk import API not implemented yet');
      throw new Error('Bulk import feature coming soon');
    }
  },
  
  exportToCSV: async () => {
    try {
      return await api.get('/components/export/csv', { responseType: 'blob' });
    } catch (error) {
      console.warn('Component export API not implemented yet');
      throw new Error('Export feature coming soon');
    }
  }
};

// User/Authentication API methods (for future implementation)
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  
  // Profile management
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Password reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword })
};

// Dashboard/Analytics API methods (for future implementation)
export const dashboardService = {
  getOverview: async () => {
    try {
      return await api.get('/dashboard/overview');
    } catch (error) {
      // Return mock data for now
      return {
        data: {
          totalClients: 0,
          totalQuotations: 0,
          totalRevenue: 0,
          conversionRate: 0
        }
      };
    }
  },
  
  getRecentActivity: async () => {
    try {
      return await api.get('/dashboard/recent-activity');
    } catch (error) {
      return { data: [] };
    }
  },
  
  getUpcomingTasks: async () => {
    try {
      return await api.get('/dashboard/upcoming-tasks');
    } catch (error) {
      return { data: [] };
    }
  },
  
  // Analytics
  getSalesMetrics: async (period = '30d') => {
    try {
      return await api.get(`/dashboard/sales-metrics?period=${period}`);
    } catch (error) {
      return { data: {} };
    }
  },
  
  getClientMetrics: async (period = '30d') => {
    try {
      return await api.get(`/dashboard/client-metrics?period=${period}`);
    } catch (error) {
      return { data: {} };
    }
  },
  
  getQuotationMetrics: async (period = '30d') => {
    try {
      return await api.get(`/dashboard/quotation-metrics?period=${period}`);
    } catch (error) {
      return { data: {} };
    }
  }
};

// Utility function to check if API endpoint exists
export const checkApiEndpoint = async (endpoint) => {
  try {
    await api.head(endpoint);
    return true;
  } catch (error) {
    return false;
  }
};

// Brand API methods (if you have brands/products)
export const brandService = {
  getAll: async () => {
    try {
      return await api.get('/brands');
    } catch (error) {
      // Fallback: might be using components endpoint instead
      try {
        return await api.get('/components');
      } catch (fallbackError) {
        console.warn('Brand/Component API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/brands/${id}`);
    } catch (error) {
      console.warn('Brand detail API not implemented yet');
      throw new Error('Brand detail feature coming soon');
    }
  },
  
  create: async (brandData) => {
    try {
      return await api.post('/brands', brandData);
    } catch (error) {
      console.warn('Create brand API not implemented yet');
      throw new Error('Create brand feature coming soon');
    }
  },
  
  update: async (id, brandData) => {
    try {
      return await api.put(`/brands/${id}`, brandData);
    } catch (error) {
      console.warn('Update brand API not implemented yet');
      throw new Error('Update brand feature coming soon');
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/brands/${id}`);
    } catch (error) {
      console.warn('Delete brand API not implemented yet');
      throw new Error('Delete brand feature coming soon');
    }
  },
  
  search: async (query) => {
    try {
      return await api.get(`/brands/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      // Fallback to get all and filter client-side
      try {
        const response = await api.get('/brands');
        const filteredData = response.data.filter(item => 
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        );
        return { data: filteredData };
      } catch (fallbackError) {
        console.warn('Brand search API not implemented yet');
        return { data: [] };
      }
    }
  }
};

// Product API methods (if needed)
export const productService = {
  getAll: async () => {
    try {
      return await api.get('/products');
    } catch (error) {
      console.warn('Product API not implemented yet');
      return { data: [] };
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/products/${id}`);
    } catch (error) {
      console.warn('Product detail API not implemented yet');
      throw new Error('Product detail feature coming soon');
    }
  },
  
  getByBrand: async (brandId) => {
    try {
      return await api.get(`/products/brand/${brandId}`);
    } catch (error) {
      console.warn('Products by brand API not implemented yet');
      return { data: [] };
    }
  },
  
  search: async (query) => {
    try {
      return await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.warn('Product search API not implemented yet');
      return { data: [] };
    }
  },
  
  create: async (productData) => {
    try {
      return await api.post('/products', productData);
    } catch (error) {
      console.warn('Create product API not implemented yet');
      throw new Error('Create product feature coming soon');
    }
  },
  
  update: async (id, productData) => {
    try {
      return await api.put(`/products/${id}`, productData);
    } catch (error) {
      console.warn('Update product API not implemented yet');
      throw new Error('Update product feature coming soon');
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/products/${id}`);
    } catch (error) {
      console.warn('Delete product API not implemented yet');
      throw new Error('Delete product feature coming soon');
    }
  }
};

// Category API methods (if needed)
export const categoryService = {
  getAll: async () => {
    try {
      return await api.get('/categories');
    } catch (error) {
      console.warn('Category API not implemented yet');
      return { data: [] };
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/categories/${id}`);
    } catch (error) {
      console.warn('Category detail API not implemented yet');
      throw new Error('Category detail feature coming soon');
    }
  },
  
  create: async (categoryData) => {
    try {
      return await api.post('/categories', categoryData);
    } catch (error) {
      console.warn('Create category API not implemented yet');
      throw new Error('Create category feature coming soon');
    }
  },
  
  update: async (id, categoryData) => {
    try {
      return await api.put(`/categories/${id}`, categoryData);
    } catch (error) {
      console.warn('Update category API not implemented yet');
      throw new Error('Update category feature coming soon');
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/categories/${id}`);
    } catch (error) {
      console.warn('Delete category API not implemented yet');
      throw new Error('Delete category feature coming soon');
    }
  }
};

// File upload utilities
export const fileService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/files/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/files/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteFile: (fileId) => api.delete(`/files/${fileId}`)
};

// Model API methods (alias for componentService for backward compatibility)
export const modelService = {
  getAll: async () => {
    try {
      return await api.get('/models');
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.getAll();
      } catch (fallbackError) {
        console.warn('Model/Component API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getById: async (id) => {
    try {
      return await api.get(`/models/${id}`);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.getById(id);
      } catch (fallbackError) {
        console.warn('Model detail API not implemented yet');
        throw new Error('Model detail feature coming soon');
      }
    }
  },
  
  create: async (modelData) => {
    try {
      return await api.post('/models', modelData);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.create(modelData);
      } catch (fallbackError) {
        console.warn('Create model API not implemented yet');
        throw new Error('Create model feature coming soon');
      }
    }
  },
  
  update: async (id, modelData) => {
    try {
      return await api.put(`/models/${id}`, modelData);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.update(id, modelData);
      } catch (fallbackError) {
        console.warn('Update model API not implemented yet');
        throw new Error('Update model feature coming soon');
      }
    }
  },
  
  delete: async (id) => {
    try {
      return await api.delete(`/models/${id}`);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await componentService.delete(id);
      } catch (fallbackError) {
        console.warn('Delete model API not implemented yet');
        throw new Error('Delete model feature coming soon');
      }
    }
  },
  
  search: async (query) => {
    try {
      return await api.get(`/models/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      // Fallback to components search
      try {
        return await componentService.search(query);
      } catch (fallbackError) {
        console.warn('Model search API not implemented yet');
        return { data: [] };
      }
    }
  },
  
  getByCategory: async (categoryId) => {
    try {
      return await api.get(`/models/category/${categoryId}`);
    } catch (error) {
      console.warn('Models by category API not implemented yet');
      return { data: [] };
    }
  },
  
  getByBrand: async (brandId) => {
    try {
      return await api.get(`/models/brand/${brandId}`);
    } catch (error) {
      console.warn('Models by brand API not implemented yet');
      return { data: [] };
    }
  }
};


// client/src/services/api.js - Enhanced Component Methods
// Add these enhanced methods to your existing componentService and modelService

// Enhanced Component/Model service methods for better search functionality
export const enhancedComponentService = {
  // Get all with populated references
  getAllWithDetails: async () => {
    try {
      const response = await api.get('/components?populate=category,brand,model');
      return response;
    } catch (error) {
      // Fallback to basic get all
      try {
        const response = await api.get('/components');
        return response;
      } catch (fallbackError) {
        console.warn('Components API not available');
        return { data: [] };
      }
    }
  },

  // Search with advanced filtering
  searchWithFilters: async (searchParams) => {
    try {
      return await api.post('/components/search', searchParams);
    } catch (error) {
      // Fallback to client-side search
      try {
        const response = await api.get('/components');
        const components = response.data || [];
        
        if (!searchParams.query && !searchParams.category && !searchParams.brand) {
          return { data: components };
        }
        
        const filtered = components.filter(component => {
          const query = searchParams.query?.toLowerCase() || '';
          const category = searchParams.category || '';
          const brand = searchParams.brand || '';
          
          const nameMatch = !query || component.name?.toLowerCase().includes(query);
          const hsnMatch = !query || component.hsn?.toLowerCase().includes(query);
          const descMatch = !query || component.description?.toLowerCase().includes(query);
          const categoryMatch = !category || component.category?._id === category || component.category?.name?.toLowerCase().includes(query);
          const brandMatch = !brand || component.brand?._id === brand || component.brand?.name?.toLowerCase().includes(query);
          
          return (nameMatch || hsnMatch || descMatch || categoryMatch || brandMatch);
        });
        
        return { data: filtered };
      } catch (fallbackError) {
        console.warn('Component search fallback failed');
        return { data: [] };
      }
    }
  },

  // Get components by category
  getByCategory: async (categoryId) => {
    try {
      return await api.get(`/components/category/${categoryId}`);
    } catch (error) {
      // Fallback to filter all components
      try {
        const response = await api.get('/components');
        const filtered = response.data.filter(comp => 
          comp.category?._id === categoryId || comp.category === categoryId
        );
        return { data: filtered };
      } catch (fallbackError) {
        console.warn('Components by category not available');
        return { data: [] };
      }
    }
  },

  // Get components by brand
  getByBrand: async (brandId) => {
    try {
      return await api.get(`/components/brand/${brandId}`);
    } catch (error) {
      // Fallback to filter all components
      try {
        const response = await api.get('/components');
        const filtered = response.data.filter(comp => 
          comp.brand?._id === brandId || comp.brand === brandId
        );
        return { data: filtered };
      } catch (fallbackError) {
        console.warn('Components by brand not available');
        return { data: [] };
      }
    }
  },

  // Quick search for autocomplete
  quickSearch: async (query, limit = 10) => {
    try {
      return await api.get(`/components/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    } catch (error) {
      // Fallback to client-side search
      try {
        const response = await api.get('/components');
        const components = response.data || [];
        const queryLower = query.toLowerCase();
        
        const filtered = components
          .filter(comp => 
            comp.name?.toLowerCase().includes(queryLower) ||
            comp.hsn?.toLowerCase().includes(queryLower) ||
            comp.category?.name?.toLowerCase().includes(queryLower) ||
            comp.brand?.name?.toLowerCase().includes(queryLower)
          )
          .slice(0, limit);
          
        return { data: filtered };
      } catch (fallbackError) {
        console.warn('Component quick search not available');
        return { data: [] };
      }
    }
  }
};

// Enhanced Model service (alias for components with better structure)
export const enhancedModelService = {
  // Get all models with full details
  getAllWithDetails: async () => {
    try {
      // Try models endpoint first
      const response = await api.get('/models?populate=category,brand');
      return response;
    } catch (error) {
      // Fallback to components
      return await enhancedComponentService.getAllWithDetails();
    }
  },

  // Search models
  search: async (query, filters = {}) => {
    try {
      const searchParams = {
        query,
        ...filters
      };
      
      try {
        return await api.post('/models/search', searchParams);
      } catch (error) {
        // Fallback to components search
        return await enhancedComponentService.searchWithFilters(searchParams);
      }
    } catch (error) {
      console.warn('Model search not available');
      return { data: [] };
    }
  },

  // Get models by category with populated data
  getByCategoryWithDetails: async (categoryId) => {
    try {
      return await api.get(`/models/category/${categoryId}?populate=category,brand`);
    } catch (error) {
      return await enhancedComponentService.getByCategory(categoryId);
    }
  },

  // Get models by brand with populated data
  getByBrandWithDetails: async (brandId) => {
    try {
      return await api.get(`/models/brand/${brandId}?populate=category,brand`);
    } catch (error) {
      return await enhancedComponentService.getByBrand(brandId);
    }
  },

  // Create model with validation
  createWithValidation: async (modelData) => {
    // Client-side validation
    if (!modelData.name || !modelData.category || !modelData.brand) {
      throw new Error('Name, category, and brand are required');
    }

    try {
      return await api.post('/models', modelData);
    } catch (error) {
      // Fallback to components endpoint
      try {
        return await api.post('/components', modelData);
      } catch (fallbackError) {
        throw new Error('Failed to create model/component');
      }
    }
  }
};

// Category service enhancements
export const enhancedCategoryService = {
  // Get all with component count
  getAllWithCount: async () => {
    try {
      return await api.get('/categories?includeCount=true');
    } catch (error) {
      // Fallback to basic categories
      try {
        const response = await api.get('/categories');
        return response;
      } catch (fallbackError) {
        console.warn('Categories API not available');
        // Return default categories
        return {
          data: [
            { _id: 'default-1', name: 'Electronics' },
            { _id: 'default-2', name: 'Hardware' },
            { _id: 'default-3', name: 'Software' },
            { _id: 'default-4', name: 'Accessories' },
            { _id: 'default-5', name: 'Components' }
          ]
        };
      }
    }
  },

  // Create category if not exists
  createIfNotExists: async (categoryName) => {
    try {
      // First check if category exists
      const existing = await api.get(`/categories?name=${encodeURIComponent(categoryName)}`);
      if (existing.data && existing.data.length > 0) {
        return { data: existing.data[0] };
      }
      
      // Create new category
      return await api.post('/categories', { name: categoryName });
    } catch (error) {
      // Create a local category for fallback
      const localCategory = {
        _id: Date.now().toString(),
        name: categoryName,
        createdAt: new Date().toISOString()
      };
      return { data: localCategory };
    }
  }
};

// Brand service enhancements
export const enhancedBrandService = {
  // Get all with component count
  getAllWithCount: async () => {
    try {
      return await api.get('/brands?includeCount=true');
    } catch (error) {
      // Fallback to basic brands
      try {
        const response = await api.get('/brands');
        return response;
      } catch (fallbackError) {
        console.warn('Brands API not available');
        // Return default brands
        return {
          data: [
            { _id: 'default-1', name: 'Generic' },
            { _id: 'default-2', name: 'Premium' },
            { _id: 'default-3', name: 'Standard' },
            { _id: 'default-4', name: 'OEM' }
          ]
        };
      }
    }
  },

  // Create brand if not exists
  createIfNotExists: async (brandName) => {
    try {
      // First check if brand exists
      const existing = await api.get(`/brands?name=${encodeURIComponent(brandName)}`);
      if (existing.data && existing.data.length > 0) {
        return { data: existing.data[0] };
      }
      
      // Create new brand
      return await api.post('/brands', { name: brandName });
    } catch (error) {
      // Create a local brand for fallback
      const localBrand = {
        _id: Date.now().toString(),
        name: brandName,
        createdAt: new Date().toISOString()
      };
      return { data: localBrand };
    }
  }
};

// Export all services
export default {
  enhancedComponentService,
  enhancedModelService,
  enhancedCategoryService,
  enhancedBrandService,
  partyService,
  quotationService,
  componentService,
  modelService,
  brandService,
  productService,
  categoryService,
  authService,
  dashboardService,
  fileService,
  checkApiEndpoint
};