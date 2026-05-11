// frontend/src/pages/Maintenance.jsx
import { useContext, useEffect, useState } from 'react';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Maintenance = () => {
  const { vehicles, loading, error, fetchVehicles, logMaintenance, removeFromMaintenance } = useContext(AppContext);
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Get active maintenance logs (vehicles in 'InShop' status)
  const vehiclesInMaintenance = vehicles.filter(v => v.status === 'InShop');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedVehicle || !issueDescription.trim()) {
      setFormError('Please select a vehicle and describe the issue');
      return;
    }

    const result = await logMaintenance(parseInt(selectedVehicle), issueDescription);
    if (result.success) {
      setIssueDescription('');
      setSelectedVehicle('');
      setFormError('');
      setFormSuccess('Vehicle added to maintenance. Status changed to "In Maintainance"');
      setTimeout(() => setFormSuccess(''), 3000);
      fetchVehicles();
    } else {
      setFormError(result.error || 'Failed to log maintenance');
    }
  };

  const handleCompleteService = async (vehicleId, maintenanceLogId) => {
    if (window.confirm('Mark this service as complete? Vehicle will return to "Available" status.')) {
      const result = await removeFromMaintenance(vehicleId, maintenanceLogId);
      if (result.success) {
        setFormSuccess('Service completed! Vehicle status changed to "Available"');
        setTimeout(() => setFormSuccess(''), 3000);
        fetchVehicles();
      } else {
        setFormError(result.error || 'Failed to complete service');
      }
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Maintenance Service Log</h2>
        <p className="text-slate-500 mt-1">Manage vehicle maintenance and service requests with auto-status updates.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
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
        {/* Add Service Log Form */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Wrench size={24} className="text-orange-600" />
            Log Service
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => {
                  setSelectedVehicle(e.target.value);
                  setFormError('');
                }}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.licensePlate}) - Status: {v.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Issue Description</label>
              <textarea
                value={issueDescription}
                onChange={(e) => {
                  setIssueDescription(e.target.value);
                  setFormError('');
                }}
                rows="5"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the maintenance issue or service needed..."
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
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                loading
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {loading ? 'Logging...' : 'Log Service'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Adding a vehicle to maintained automatically changes its status to "In Shop", removing it from the dispatch pool.
            </p>
          </div>
        </div>

        {/* Active Service Logs */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Wrench size={20} className="text-orange-600" />
                Active Service Logs ({vehiclesInMaintenance.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-500">
                Loading service logs...
              </div>
            ) : vehiclesInMaintenance.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {vehiclesInMaintenance.map(vehicle => (
                  <div key={vehicle.id} className="p-6 hover:bg-slate-50">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">{vehicle.name}</h4>
                          <p className="text-sm text-slate-500">{vehicle.licensePlate} • {vehicle.type}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          In Maintainance
                        </span>
                      </div>

                      {vehicle.maintenanceLogs && vehicle.maintenanceLogs.length > 0 ? (
                        <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                          <p className="text-sm text-slate-600">
                            <strong>Latest Issue:</strong> {vehicle.maintenanceLogs[0].issueDescription}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Entry Date: {new Date(vehicle.maintenanceLogs[0].entryDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 italic">No maintenance details recorded</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleCompleteService(vehicle.id, vehicle.maintenanceLogs?.[0]?.id)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition"
                    >
                      Mark Service Complete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
                <p className="font-medium">All vehicles are operating normally!</p>
                <p className="text-sm mt-1">No vehicles in maintenance at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Status Overview */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-3xl font-bold text-green-600">{vehicles.filter(v => v.status === 'Available').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500">In Shop</p>
          <p className="text-3xl font-bold text-orange-600">{vehiclesInMaintenance.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500">On Trip</p>
          <p className="text-3xl font-bold text-blue-600">{vehicles.filter(v => v.status === 'OnTrip').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
          <p className="text-sm text-slate-500">Total Fleet</p>
          <p className="text-3xl font-bold text-slate-800">{vehicles.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
