// frontend/src/pages/VehicleRegistry.jsx
import { useContext, useEffect, useState } from 'react';
import { Trash2, Edit2, Eye, Download } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { exportVehiclesToCSV } from '../utils/exportUtils';

const VehicleRegistry = () => {
  const { vehicles, loading, error, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useContext(AppContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    licensePlate: '',
    type: 'Truck',
    maxCapacity: '',
    odometer: '',
    status: 'Available',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.model || !formData.licensePlate || !formData.maxCapacity) {
      setFormError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      maxCapacity: parseInt(formData.maxCapacity),
      odometer: parseInt(formData.odometer) || 0,
    };

    if (editingId) {
      const result = await updateVehicle(editingId, submitData);
      if (result.success) {
        setEditingId(null);
        setFormData({
          name: '',
          model: '',
          licensePlate: '',
          type: 'Truck',
          maxCapacity: '',
          odometer: '',
          status: 'Available',
        });
        setIsFormOpen(false);
      } else {
        setFormError(result.error || 'Update failed');
      }
    } else {
      const result = await addVehicle(submitData);
      if (result.success) {
        setFormData({
          name: '',
          model: '',
          licensePlate: '',
          type: 'Truck',
          maxCapacity: '',
          odometer: '',
          status: 'Available',
        });
        setIsFormOpen(false);
      } else {
        setFormError(result.error || 'Add failed');
      }
    }
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle.id);
    setIsFormOpen(true);
    setShowDetails(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      const result = await deleteVehicle(id);
      if (!result.success) {
        alert(result.error || 'Delete failed');
      }
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetails(true);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Available': 'bg-green-100 text-green-800',
      'OnTrip': 'bg-blue-100 text-blue-800',
      'InShop': 'bg-yellow-100 text-yellow-800',
      'OutOfService': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Vehicle Registry</h2>
          <p className="text-slate-500 mt-1">Manage your fleet inventory with full CRUD capabilities.</p>
        </div>
        <button
          onClick={() => exportVehiclesToCSV(vehicles)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <Download size={20} />
          Export CSV
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Form Section */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Vehicle Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Fleet-Van-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ford Transit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">License Plate</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AB12CD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Max Capacity (kg)</label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Odometer (km)</label>
              <input
                type="number"
                name="odometer"
                value={formData.odometer}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="OnTrip">On Trip</option>
                <option value="InShop">In Maintainance</option>
                <option value="OutOfService">Out of Service</option>
              </select>
            </div>

            {formError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                {formError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: '',
                      model: '',
                      licensePlate: '',
                      type: 'Truck',
                      maxCapacity: '',
                      odometer: '',
                      status: 'Available',
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Vehicle List */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">
                Vehicles ({vehicles.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-sm">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">License</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Capacity</th>
                    <th className="px-6 py-3 font-medium">Odometer</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-slate-500">
                        Loading vehicles...
                      </td>
                    </tr>
                  ) : vehicles.length > 0 ? (
                    vehicles.map(vehicle => (
                      <tr key={vehicle.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">{vehicle.name}</td>
                        <td className="px-6 py-4 text-slate-600">{vehicle.licensePlate}</td>
                        <td className="px-6 py-4 text-slate-600">{vehicle.type}</td>
                        <td className="px-6 py-4 text-slate-600">{vehicle.maxCapacity} kg</td>
                        <td className="px-6 py-4 text-slate-600">{vehicle.odometer} km</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => handleViewDetails(vehicle)}
                            className="text-green-600 hover:text-green-700"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-slate-500">
                        No vehicles found. Add one to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              {selectedVehicle.name} Details
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500">Model</p>
                <p className="text-lg font-medium text-slate-800">{selectedVehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">License Plate</p>
                <p className="text-lg font-medium text-slate-800">{selectedVehicle.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <p className="text-lg font-medium text-slate-800">{selectedVehicle.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Max Capacity</p>
                <p className="text-lg font-medium text-slate-800">{selectedVehicle.maxCapacity} kg</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Odometer</p>
                <p className="text-lg font-medium text-slate-800">{selectedVehicle.odometer} km</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
