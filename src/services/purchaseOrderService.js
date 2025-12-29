import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/purchase-orders`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        console.error('Authentication required');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.error('Forbidden: You do not have permission to perform this action');
      } else if (error.response.status === 404) {
        console.error('The requested resource was not found');
      } else if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Get all purchase orders with optional filters
const getPurchaseOrders = async (filters = {}) => {
  try {
    const response = await api.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

// Alias for getPurchaseOrders for backward compatibility
const getAllPOs = getPurchaseOrders;

const purchaseOrderService = {
  getPurchaseOrders,
  getAllPOs,
  
  // Get a single purchase order by ID
  async getPurchaseOrderById(id) {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase order ${id}:`, error);
      throw error;
    }
  },

  // Create a new purchase order
  async createPurchaseOrder(poData) {
    try {
      const response = await api.post(API_URL, poData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  },

  // Update an existing purchase order
  async updatePurchaseOrder(id, poData) {
    try {
      const response = await api.put(`${API_URL}/${id}`, poData);
      return response.data;
    } catch (error) {
      console.error(`Error updating purchase order ${id}:`, error);
      throw error;
    }
  },

  // Delete a purchase order
  async deletePurchaseOrder(id) {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting purchase order ${id}:`, error);
      throw error;
    }
  },

  // Update purchase order status
  async updateStatus(id, status, notes = '') {
    try {
      const response = await api.patch(`${API_URL}/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for PO ${id}:`, error);
      throw error;
    }
  },

  // Get purchase orders by status
  async getPurchaseOrdersByStatus(status) {
    try {
      const response = await api.get(`${API_URL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${status} purchase orders:`, error);
      throw error;
    }
  },

  // Get purchase orders by supplier
  async getPurchaseOrdersBySupplier(supplierId) {
    try {
      const response = await api.get(`${API_URL}/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase orders for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  // Get purchase order statistics
  async getPurchaseOrderStats() {
    try {
      const response = await api.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase order statistics:', error);
      throw error;
    }
  }
};

export { purchaseOrderService };
