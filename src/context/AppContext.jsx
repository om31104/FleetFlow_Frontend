// frontend/src/context/AppContext.jsx
import React, { createContext, useReducer, useCallback } from 'react';
import { vehicleAPI, driverAPI, tripAPI, authAPI } from '../services/api';

export const AppContext = createContext();

const initialState = {
  vehicles: [],
  drivers: [],
  trips: [],
  currentUser: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [action.payload, ...state.vehicles] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(v => v.id === action.payload.id ? action.payload : v),
      };
    case 'DELETE_VEHICLE':
      return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };
    case 'SET_DRIVERS':
      return { ...state, drivers: action.payload };
    case 'ADD_DRIVER':
      return { ...state, drivers: [action.payload, ...state.drivers] };
    case 'UPDATE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.map(d => d.id === action.payload.id ? action.payload : d),
      };
    case 'DELETE_DRIVER':
      return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [action.payload, ...state.trips] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TRIP':
      return { ...state, trips: state.trips.filter(t => t.id !== action.payload) };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ============ AUTH METHODS ============
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ============ VEHICLE METHODS ============
  const fetchVehicles = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await vehicleAPI.getVehicles();
      dispatch({ type: 'SET_VEHICLES', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch vehicles';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addVehicle = useCallback(async (vehicleData) => {
    try {
      const response = await vehicleAPI.addVehicle(vehicleData);
      dispatch({ type: 'ADD_VEHICLE', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, vehicle: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add vehicle';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateVehicle = useCallback(async (id, vehicleData) => {
    try {
      const response = await vehicleAPI.updateVehicle(id, vehicleData);
      dispatch({ type: 'UPDATE_VEHICLE', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, vehicle: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update vehicle';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    try {
      await vehicleAPI.deleteVehicle(id);
      dispatch({ type: 'DELETE_VEHICLE', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete vehicle';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const logMaintenance = useCallback(async (vehicleId, issueDescription) => {
    try {
      const response = await vehicleAPI.logMaintenance(vehicleId, issueDescription);
      dispatch({ type: 'UPDATE_VEHICLE', payload: response.data.vehicle });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, vehicle: response.data.vehicle };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to log maintenance';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const removeFromMaintenance = useCallback(async (vehicleId, maintenanceLogId) => {
    try {
      const response = await vehicleAPI.removeFromMaintenance(vehicleId, maintenanceLogId);
      dispatch({ type: 'UPDATE_VEHICLE', payload: response.data.vehicle });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, vehicle: response.data.vehicle };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to remove from maintenance';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  // ============ DRIVER METHODS ============
  const fetchDrivers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await driverAPI.getDrivers();
      dispatch({ type: 'SET_DRIVERS', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch drivers';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addDriver = useCallback(async (driverData) => {
    try {
      const response = await driverAPI.addDriver(driverData);
      dispatch({ type: 'ADD_DRIVER', payload: response.data.driver });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, driver: response.data.driver };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add driver';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateDriver = useCallback(async (id, driverData) => {
    try {
      const response = await driverAPI.updateDriver(id, driverData);
      dispatch({ type: 'UPDATE_DRIVER', payload: response.data.driver });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, driver: response.data.driver };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update driver';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const deleteDriver = useCallback(async (id) => {
    try {
      await driverAPI.deleteDriver(id);
      dispatch({ type: 'DELETE_DRIVER', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete driver';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  // ============ TRIP METHODS ============
  const fetchTrips = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await tripAPI.getTrips();
      dispatch({ type: 'SET_TRIPS', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch trips';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createTrip = useCallback(async (tripData) => {
    try {
      const response = await tripAPI.createTrip(tripData);
      dispatch({ type: 'ADD_TRIP', payload: response.data });
      // Update the vehicle status to 'OnTrip'
      if (state.vehicles.length > 0) {
        const updated = state.vehicles.map(v =>
          v.id === tripData.vehicleId ? { ...v, status: 'OnTrip' } : v
        );
        dispatch({ type: 'SET_VEHICLES', payload: updated });
      }
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, trip: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create trip';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [state.vehicles]);

  const completeTrip = useCallback(async (tripId, finalOdometer) => {
    try {
      const response = await tripAPI.completeTrip(tripId, finalOdometer);
      dispatch({ type: 'UPDATE_TRIP', payload: response.data.trip });
      // Update vehicle status back to 'Available'
      if (state.vehicles.length > 0) {
        const trip = state.trips.find(t => t.id === tripId);
        if (trip) {
          const updated = state.vehicles.map(v =>
            v.id === trip.vehicleId ? { ...v, status: 'Available', odometer: finalOdometer } : v
          );
          dispatch({ type: 'SET_VEHICLES', payload: updated });
        }
      }
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, trip: response.data.trip };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to complete trip';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, [state.vehicles, state.trips]);

  const cancelTrip = useCallback(async (tripId) => {
    try {
      const response = await tripAPI.cancelTrip(tripId);
      dispatch({ type: 'UPDATE_TRIP', payload: response.data.trip });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, trip: response.data.trip };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to cancel trip';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const linkFuelCost = useCallback(async (tripId, fuelData) => {
    try {
      const response = await tripAPI.linkFuelCost(tripId, fuelData);
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, fuelRecord: response.data.fuelRecord };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to record fuel cost';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const updateTripExpenses = useCallback(async (tripId, expenseData) => {
    try {
      const response = await tripAPI.updateTripExpenses(tripId, expenseData);
      dispatch({ type: 'UPDATE_TRIP', payload: response.data.trip });
      dispatch({ type: 'SET_ERROR', payload: null });
      return { success: true, trip: response.data.trip };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update expenses';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  // Initialize user from localStorage
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(user) });
    }
  }, []);

  const value = {
    // State
    ...state,
    // Auth
    login,
    logout,
    // Vehicles
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    logMaintenance,
    removeFromMaintenance,
    // Drivers
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    // Trips
    fetchTrips,
    createTrip,
    completeTrip,
    cancelTrip,
    linkFuelCost,
    updateTripExpenses,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
