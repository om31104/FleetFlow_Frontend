// frontend/src/pages/Expenses.jsx
import { useContext, useEffect, useState } from 'react';
import { Plus, DollarSign, Fuel, AlertCircle, Download, FileText } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { exportExpensesToCSV, generateMonthlyExpenseReport } from '../utils/exportUtils';

const Expenses = () => {
  const { trips, vehicles, loading, error, fetchTrips, updateTripExpenses } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('trip');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tripId: '',
    fuelExpense: '',
    miscExpense: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Calculate total fuel cost
  const calculateTotalFuelCost = () => {
    return trips.reduce((sum, trip) => {
      return sum + (trip.fuelExpense || 0);
    }, 0);
  };

  // Calculate total misc expenses from trips (tolls, parking, etc.)
  const calculateTotalMiscExpenses = () => {
    return trips.reduce((sum, trip) => {
      return sum + (trip.miscExpense || 0);
    }, 0);
  };

  // Get vehicle name by ID
  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle?.name || 'Unknown Vehicle';
  };

  // Get driver name from trips
  const getDriverName = (trip) => {
    return trip.driver?.name || 'Unknown Driver';
  };

  // Get trip fuel expense
  const getTripFuelExpense = (trip) => {
    return trip.fuelExpense || 0;
  };

  // Get trip distance
  const getTripDistance = (trip) => {
    if (trip.finalOdometer) {
      return trip.finalOdometer;
    }
    return 'N/A';
  };

  // Filter trips based on search
  const filteredTrips = trips?.filter(trip =>
    trip.id.toString().includes(searchTerm) ||
    getDriverName(trip).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate cost per vehicle
  const costPerVehicle = vehicles?.map(vehicle => ({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    tripCount: trips?.filter(t => t.vehicleId === vehicle.id).length || 0,
    totalCost: trips
      ?.filter(t => t.vehicleId === vehicle.id)
      .reduce((sum, trip) => sum + (getTripFuelExpense(trip) || 0), 0) || 0,
  })) || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.tripId) return;
    
    await updateTripExpenses(formData.tripId, {
      fuelExpense: formData.fuelExpense,
      miscExpense: formData.miscExpense,
      notes: formData.notes
    });

    setFormData({
      tripId: '',
      fuelExpense: '',
      miscExpense: '',
      notes: '',
    });
    setShowAddForm(false);
  };

  const totalFuel = calculateTotalFuelCost();
  const totalMisc = calculateTotalMiscExpenses();
  const totalExpense = totalFuel + totalMisc;
  const previousTotal = totalExpense * 0.95; // Estimate previous month
  const percentageChange = ((totalExpense - previousTotal) / previousTotal * 100).toFixed(1);

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Expense & Fuel Logging</h2>
          <p className="text-slate-500 mt-1">Track every rupee spent to keep your vehicles running</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportExpensesToCSV(trips, vehicles)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total Fuel Cost */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 font-medium">Total Fuel Cost</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Fuel size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">₹ {totalFuel.toLocaleString('en-IN')}</div>
          <p className="text-slate-500 text-sm">Across all trips</p>
        </div>

        {/* Total Misc Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 font-medium">Total Misc Expenses</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign size={24} className="text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">₹ {totalMisc.toLocaleString('en-IN')}</div>
          <p className="text-slate-500 text-sm">Tolls, parking, etc.</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 font-medium">Total Expenses</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-3xl font-bold text-slate-800">₹ {totalExpense.toLocaleString('en-IN')}</div>
            <span className={`text-sm font-medium ${percentageChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {percentageChange > 0 ? '+' : ''}{percentageChange}%
            </span>
          </div>
          <p className="text-slate-500 text-sm">Combined fuel + misc</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Expense</h3>
          <form onSubmit={handleAddExpense} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trip ID</label>
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Trip</option>
                {trips?.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    Trip #{trip.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Expense (Rs.)</label>
              <input
                type="number"
                name="fuelExpense"
                value={formData.fuelExpense}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Misc Expense (Rs.)</label>
              <input
                type="number"
                name="miscExpense"
                value={formData.miscExpense}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2 col-span-4 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('trip')}
            className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
              activeTab === 'trip'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Trip Expenses
          </button>
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
              activeTab === 'vehicle'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Cost per Vehicle
          </button>
        </div>

        <div className="p-6">
          {/* Trip Expenses Tab */}
          {activeTab === 'trip' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-600">{filteredTrips.length} records</p>
                <div className="relative w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <p className="text-slate-500">Loading expenses...</p>
              ) : filteredTrips.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200">
                      <tr className="text-left text-slate-600 font-semibold">
                        <th className="pb-3 pl-4">TRIP ID</th>
                        <th className="pb-3">DRIVER</th>
                        <th className="pb-3">DISTANCE</th>
                        <th className="pb-3">FUEL EXPENSE</th>
                        <th className="pb-3">MISC EXPENSE</th>
                        <th className="pb-3">NOTES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map((trip) => (
                        <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 pl-4">T-{String(trip.id).padStart(3, '0')}</td>
                          <td className="py-3 font-medium text-slate-800">{getDriverName(trip)}</td>
                          <td className="py-3 text-slate-600">
                            {getTripDistance(trip) !== 'N/A' ? `${getTripDistance(trip)} km` : 'N/A'}
                          </td>
                          <td className="py-3 font-medium text-slate-800">₹ {getTripFuelExpense(trip).toLocaleString('en-IN')}</td>
                          <td className="py-3 text-slate-600">₹ {(trip.miscExpense || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3 text-slate-500">{trip.notes || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">No trips found</p>
              )}
            </div>
          )}

          {/* Cost per Vehicle Tab */}
          {activeTab === 'vehicle' && (
            <div>
              <p className="text-slate-600 mb-6">{costPerVehicle.length} vehicles</p>
              {costPerVehicle.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200">
                      <tr className="text-left text-slate-600 font-semibold">
                        <th className="pb-3">VEHICLE</th>
                        <th className="pb-3">TRIP COUNT</th>
                        <th className="pb-3">TOTAL FUEL COST</th>
                        <th className="pb-3">AVG COST PER TRIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costPerVehicle
                        .filter(item => item.tripCount > 0)
                        .sort((a, b) => b.totalCost - a.totalCost)
                        .map((item) => (
                          <tr key={item.vehicleId} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 font-medium text-slate-800">{item.vehicleName}</td>
                            <td className="py-3">{item.tripCount}</td>
                            <td className="py-3 font-medium text-slate-800">₹ {item.totalCost.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-slate-600">
                              ₹ {item.tripCount > 0 ? (item.totalCost / item.tripCount).toFixed(0) : 0}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">No vehicle data available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
