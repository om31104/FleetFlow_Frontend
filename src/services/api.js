// frontend/src/services/api.js
import axios from 'axios';
import.meta.env.VITE_API_URL

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initialize Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  signup: (email, password) =>
    api.post('/auth/signup', { email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// ============ VEHICLE ENDPOINTS ============
export const vehicleAPI = {
  addVehicle: (vehicleData) =>
    api.post('/vehicles', vehicleData),
  getVehicles: () =>
    api.get('/vehicles'),
  getAvailableVehicles: () =>
    api.get('/vehicles/available'),
  getVehicleById: (id) =>
    api.get(`/vehicles/${id}`),
  updateVehicle: (id, vehicleData) =>
    api.put(`/vehicles/${id}`, vehicleData),
  deleteVehicle: (id) =>
    api.delete(`/vehicles/${id}`),
  logMaintenance: (id, issueDescription) =>
    api.put(`/vehicles/${id}/maintenance`, { issueDescription }),
  removeFromMaintenance: (id, maintenanceLogId) =>
    api.put(`/vehicles/${id}/maintenance/complete`, { maintenanceLogId }),
};

// ============ DRIVER ENDPOINTS ============
export const driverAPI = {
  addDriver: (driverData) =>
    api.post('/drivers', driverData),
  getDrivers: () =>
    api.get('/drivers'),
  getDriverById: (id) =>
    api.get(`/drivers/${id}`),
  updateDriver: (id, driverData) =>
    api.put(`/drivers/${id}`, driverData),
  deleteDriver: (id) =>
    api.delete(`/drivers/${id}`),
};

// ============ TRIP ENDPOINTS ============
export const tripAPI = {
  createTrip: (tripData) =>
    api.post('/trips', tripData),
  getTrips: () =>
    api.get('/trips'),
  getTripById: (id) =>
    api.get(`/trips/${id}`),
  completeTrip: (id, finalOdometer) =>
    api.put(`/trips/${id}/complete`, { finalOdometer }),
  cancelTrip: (id) =>
    api.put(`/trips/${id}/cancel`),
  linkFuelCost: (id, fuelData) =>
    api.post(`/trips/${id}/fuel`, fuelData),
  updateTripExpenses: (id, expenseData) =>
    api.put(`/trips/${id}/expenses`, expenseData),
};

export default api;
