// frontend/src/pages/TripDispatcher.jsx
import { useContext, useEffect, useState } from 'react';
import { Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const TripDispatcher = () => {
  const { vehicles, drivers, trips, loading, error, fetchVehicles, fetchDrivers, fetchTrips, createTrip, completeTrip } = useContext(AppContext);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
  });

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchTrips();
  }, [fetchVehicles, fetchDrivers, fetchTrips]);

  const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const activateTrips = trips.filter(t => t.status === 'Dispatched');

  // Cargo weight validation
  const isCargoExceeded = selectedVehicle && parseInt(formData.cargoWeight) > selectedVehicle.maxCapacity;
  const isCargoValid = selectedVehicle && formData.cargoWeight && !isCargoExceeded;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.driverId || !formData.cargoWeight || !formData.origin || !formData.destination) {
      setFormError('All fields are required');
      return;
    }

    if (isCargoExceeded) {
      setFormError('Cargo weight exceeds vehicle capacity');
      return;
    }

    const tripData = {
      vehicleId: parseInt(formData.vehicleId),
      driverId: parseInt(formData.driverId),
      cargoWeight: parseInt(formData.cargoWeight),
      origin: formData.origin,
      destination: formData.destination,
    };

    const result = await createTrip(tripData);
    if (result.success) {
      setFormData({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        origin: '',
        destination: '',
      });
      setFormError('');
      setFormSuccess('Trip created successfully! Vehicle status updated to "OnTrip"');
      setTimeout(() => setFormSuccess(''), 3000);
      fetchTrips();
    } else {
      setFormError(result.error || 'Failed to create trip');
    }
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    
    if (!finalOdometer) {
      setFormError('Final odometer reading is required');
      return;
    }

    const result = await completeTrip(selectedTripId, finalOdometer);
    if (result.success) {
      setShowCompleteModal(false);
      setFinalOdometer('');
      setSelectedTripId(null);
      setFormSuccess('Trip completed successfully! Vehicle status updated to "Available"');
      setTimeout(() => setFormSuccess(''), 3000);
      fetchTrips();
      fetchVehicles();
    } else {
      setFormError(result.error || 'Failed to complete trip');
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Trip Dispatcher</h2>
        <p className="text-slate-500 mt-1">Create and manage trips with smart validation.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {formSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {formSuccess}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Dispatch Form */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Create New Trip</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Vehicle</label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose available vehicle...</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.licensePlate}) - Capacity: {v.maxCapacity}kg
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicle && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-800">
                  <strong>Max Capacity:</strong> {selectedVehicle.maxCapacity} kg
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Select Driver</label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose driver...</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} (License: {d.licenseNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Cargo Weight (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  name="cargoWeight"
                  value={formData.cargoWeight}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
                {formData.cargoWeight && selectedVehicle && (
                  <div className="absolute right-3 top-3">
                    {isCargoExceeded ? (
                      <AlertCircle size={20} className="text-red-600" />
                    ) : (
                      <CheckCircle size={20} className="text-green-600" />
                    )}
                  </div>
                )}
              </div>
              {isCargoExceeded && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} /> Exceeds by {parseInt(formData.cargoWeight) - selectedVehicle.maxCapacity} kg
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Warehouse A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Store B"
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isCargoExceeded || loading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                isCargoExceeded || loading
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Dispatch Trip'}
            </button>
          </form>
        </div>

        {/* Active Trips */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Truck size={20} />
                Active Trips ({activateTrips.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-500">
                Loading trips...
              </div>
            ) : activateTrips.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 p-6">
                {activateTrips.map(trip => (
                  <div key={trip.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Trip ID</p>
                        <p className="text-lg font-bold text-slate-800">TRP-{trip.id}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trip.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Vehicle</p>
                        <p className="font-medium text-slate-800">{trip.vehicle?.licensePlate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Driver</p>
                        <p className="font-medium text-slate-800">{trip.driver?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Cargo</p>
                        <p className="font-medium text-slate-800">{trip.cargoWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Route</p>
                        <p className="font-medium text-slate-800">{trip.origin} → {trip.destination}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTripId(trip.id);
                        setShowCompleteModal(true);
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                      Complete Trip
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                No active trips. Dispatch a trip to get started!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Complete Trip</h3>
            
            <form onSubmit={handleCompleteTrip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Final Odometer Reading (km)</label>
                <input
                  type="number"
                  value={finalOdometer}
                  onChange={(e) => {
                    setFinalOdometer(e.target.value);
                    setFormError('');
                  }}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15450"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                  {formError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setFinalOdometer('');
                    setFormError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDispatcher;
