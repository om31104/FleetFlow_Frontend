// frontend/src/pages/Drivers.jsx
import { useContext, useEffect, useState } from 'react';
import { Trash2, Edit2, Eye, Download } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { exportDriversToCSV } from '../utils/exportUtils';

const Drivers = () => {
  const { drivers, loading, error, fetchDrivers, addDriver, updateDriver, deleteDriver } = useContext(AppContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseExpiry: '',
    completionRate: '0',
    safetyScore: '100',
    noOfComplaints: '0',
    dutyStatus: 'OffDuty',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.licenseNumber || !formData.licenseExpiry) {
      setFormError('Name, License Number, and Expiry are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      completionRate: parseFloat(formData.completionRate) || 0,
      safetyScore: parseFloat(formData.safetyScore) || 100,
      noOfComplaints: parseInt(formData.noOfComplaints) || 0,
      licenseExpiry: new Date(formData.licenseExpiry).toISOString(),
    };

    if (editingId) {
      const result = await updateDriver(editingId, submitData);
      if (result.success) {
        setEditingId(null);
        setFormData({
          name: '',
          licenseNumber: '',
          licenseExpiry: '',
          completionRate: '0',
          safetyScore: '100',
          noOfComplaints: '0',
          dutyStatus: 'OffDuty',
        });
        setIsFormOpen(false);
      } else {
        setFormError(result.error || 'Update failed');
      }
    } else {
      const result = await addDriver(submitData);
      if (result.success) {
        setFormData({
          name: '',
          licenseNumber: '',
          licenseExpiry: '',
          completionRate: '0',
          safetyScore: '100',
          noOfComplaints: '0',
          dutyStatus: 'OffDuty',
        });
        setIsFormOpen(false);
      } else {
        setFormError(result.error || 'Add failed');
      }
    }
  };

  const handleEdit = (driver) => {
    const expiry = driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '';
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: expiry,
      completionRate: driver.completionRate.toString(),
      safetyScore: driver.safetyScore.toString(),
      noOfComplaints: driver.noOfComplaints.toString(),
      dutyStatus: driver.dutyStatus,
    });
    setEditingId(driver.id);
    setIsFormOpen(true);
    setShowDetails(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      const result = await deleteDriver(id);
      if (!result.success) {
        alert(result.error || 'Delete failed');
      }
    }
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDetails(true);
  };

  const getDutyStatusColor = (status) => {
    const statusMap = {
      'OnDuty': 'bg-green-100 text-green-800',
      'OffDuty': 'bg-gray-100 text-gray-800',
      'OnLeave': 'bg-yellow-100 text-yellow-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Driver Management</h2>
          <p className="text-slate-500 mt-1">Manage your drivers with full CRUD capabilities.</p>
        </div>
        <button
          onClick={() => exportDriversToCSV(drivers)}
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
            {editingId ? 'Edit Driver' : 'Add New Driver'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DL-123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">License Expiry</label>
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Completion Rate (%)</label>
              <input
                type="number"
                name="completionRate"
                value={formData.completionRate}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Safety Score</label>
              <input
                type="number"
                name="safetyScore"
                value={formData.safetyScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Complaints</label>
              <input
                type="number"
                name="noOfComplaints"
                value={formData.noOfComplaints}
                onChange={handleInputChange}
                min="0"
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Duty Status</label>
              <select
                name="dutyStatus"
                value={formData.dutyStatus}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OnDuty">On Duty</option>
                <option value="OffDuty">Off Duty</option>
                <option value="OnLeave">On Leave</option>
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
                      licenseNumber: '',
                      licenseExpiry: '',
                      completionRate: '0',
                      safetyScore: '100',
                      noOfComplaints: '0',
                      dutyStatus: 'OffDuty',
                    });
                    setIsFormOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            Drivers List ({drivers?.length || 0})
          </h3>
          {loading ? (
            <p className="text-slate-500">Loading drivers...</p>
          ) : drivers && drivers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-left text-slate-600 font-semibold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">License</th>
                    <th className="pb-3">Duty</th>
                    <th className="pb-3">Safety</th>
                    <th className="pb-3">Completion</th>
                    <th className="pb-3">Complaints</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3">{driver.name}</td>
                      <td className="py-3">{driver.licenseNumber}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDutyStatusColor(driver.dutyStatus)}`}>
                          {driver.dutyStatus}
                        </span>
                      </td>
                      <td className={`py-3 font-semibold ${getSafetyColor(driver.safetyScore)}`}>
                        {driver.safetyScore.toFixed(1)}
                      </td>
                      <td className="py-3">{driver.completionRate.toFixed(1)}%</td>
                      <td className="py-3">{driver.noOfComplaints}</td>
                      <td className="py-3 flex gap-2">
                        <button
                          onClick={() => handleViewDetails(driver)}
                          className="p-2 hover:bg-blue-100 rounded transition"
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleEdit(driver)}
                          className="p-2 hover:bg-yellow-100 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="p-2 hover:bg-red-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500">No drivers found. Add one to get started.</p>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{selectedDriver.name}</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-600">License Number:</span>
                <span className="text-slate-800 ml-2">{selectedDriver.licenseNumber}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">License Expiry:</span>
                <span className="text-slate-800 ml-2">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Duty Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getDutyStatusColor(selectedDriver.dutyStatus)}`}>
                  {selectedDriver.dutyStatus}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Safety Score:</span>
                <span className={`ml-2 font-semibold ${getSafetyColor(selectedDriver.safetyScore)}`}>
                  {selectedDriver.safetyScore.toFixed(1)}/100
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Completion Rate:</span>
                <span className="text-slate-800 ml-2">{selectedDriver.completionRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Complaints:</span>
                <span className="text-slate-800 ml-2">{selectedDriver.noOfComplaints}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
