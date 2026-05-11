// frontend/src/pages/Dashboard.jsx
import { Activity, AlertTriangle, Truck, Package } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const Dashboard = () => {
  const { vehicles, trips, loading, error, fetchVehicles, fetchTrips } = useContext(AppContext);

  useEffect(() => {
    fetchVehicles();
    fetchTrips();
  }, [fetchVehicles, fetchTrips]);

  // Calculate KPIs from real data
  const activeFleet = vehicles.filter(v => v.status === 'Available').length;
  const inShopAlerts = vehicles.filter(v => v.status === 'InShop').length;
  const utilizationRate = vehicles.length > 0 
    ? Math.round(((vehicles.length - activeFleet) / vehicles.length) * 100)
    : 0;
  const pendingCargo = trips.filter(t => t.status === 'Dispatched').length;

  const kpis = [
    { title: 'Availaible Fleet', value: activeFleet, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'In Maintainance', value: inShopAlerts, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Utilization Rate', value: `${utilizationRate}%`, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending Cargo', value: pendingCargo, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // Get recent trips
  const recentTrips = trips.slice(0, 5);

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      'Dispatched': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-700' },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return statusMap[status] || statusMap['Draft'];
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Command Center</h2>
        <p className="text-slate-500 mt-1">High-level overview of your fleet operations.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center">
            <div className={`p-4 rounded-lg ${kpi.bg} mr-4`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trip Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Trip Activity</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline" disabled={loading}>
            {loading ? 'Loading...' : 'View All'}
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm">
              <th className="px-6 py-3 font-medium">Trip ID</th>
              <th className="px-6 py-3 font-medium">Vehicle</th>
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">Cargo (kg)</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr className="border-t border-slate-100">
                <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                  Loading trips...
                </td>
              </tr>
            ) : recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <tr key={trip.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-700">TRP-{trip.id}</td>
                  <td className="px-6 py-4">{trip.vehicle?.licensePlate || 'N/A'}</td>
                  <td className="px-6 py-4">{trip.driver?.name || 'N/A'}</td>
                  <td className="px-6 py-4">{trip.cargoWeight}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(trip.status).bg} ${getStatusBadge(trip.status).text}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-slate-100">
                <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                  No trips found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;