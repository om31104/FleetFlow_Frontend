// frontend/src/pages/Analytics.jsx
import { useContext, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Percent, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Analytics = () => {
  const { vehicles, trips, loading, error, fetchVehicles, fetchTrips } = useContext(AppContext);

  useEffect(() => {
    fetchVehicles();
    fetchTrips();
  }, [fetchVehicles, fetchTrips]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const dispatchedTrips = trips.filter(t => t.status === 'Dispatched');
    
    const totalFuelCost = completedTrips.reduce((sum, trip) => {
      return sum + (trip.fuelExpense || 0);
    }, 0);
    
    // Fleet ROI: (Revenue from trips) / (Fleet Investment Cost) * 100
    // Revenue assumption: ₹500 per trip
    // Fleet investment: ₹50,000 per vehicle
    const fleetRevenue = (completedTrips.length + dispatchedTrips.length) * 500;
    const fleetInvestment = vehicles.length * 50000;
    const fleetRoi = fleetInvestment > 0 ? Math.round((fleetRevenue / fleetInvestment) * 100) : 0;
    
    const utilizationRate = (completedTrips.length + dispatchedTrips.length) > 0
      ? Math.round(((completedTrips.length + dispatchedTrips.length) / trips.length) * 100)
      : 0;
    
    // Avg Completion Rate: (Completed Trips / Total Trips) * 100
    const avgCompletionRate = trips.length > 0 
      ? Math.round((completedTrips.length / trips.length) * 100)
      : 0;

    return { totalFuelCost, fleetRoi, utilizationRate, avgCompletionRate };
  }, [trips, vehicles.length]);

  // Fuel Efficiency Trend (LineChart) - Mock data for 12 months
  const fuelEfficiencyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      efficiency: Math.random() * 3 + 6, // 6-9 km/liter
    }));
  }, []);

  // Top 5 Costliest Vehicles (BarChart)
  const costliestVehicles = useMemo(() => {
    return vehicles
      .map(v => {
        const vehicleTrips = trips.filter(t => t.vehicleId === v.id);
        const totalCost = vehicleTrips.reduce((sum, trip) => sum + (trip.fuelExpense || 0), 0);
        return {
          name: v.licensePlate,
          cost: totalCost,
        };
      })
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [vehicles, trips]);

  // Monthly Financial Summary (AreaChart)
  const monthlyFinancial = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      fuel: Math.random() * 5000 + 2000,
      maintenance: Math.random() * 3000 + 1000,
    }));
  }, []);

  // Utilization by Status (PieChart)
  const utilizationByStatus = useMemo(() => {
    return [
      { name: 'Available', value: vehicles.filter(v => v.status === 'Available').length },
      { name: 'On Trip', value: vehicles.filter(v => v.status === 'OnTrip').length },
      { name: 'In Maintainance', value: vehicles.filter(v => v.status === 'InShop').length },
      { name: 'Out of Service', value: vehicles.filter(v => v.status === 'OutOfService').length },
    ];
  }, [vehicles]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const metricCards = [
    {
      title: 'Fleet ROI',
      value: `${metrics.fleetRoi}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Total Fuel Cost',
      value: `₹ ${metrics.totalFuelCost.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Utilization Rate',
      value: `${metrics.utilizationRate}%`,
      icon: Percent,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Avg Completion Rate',
      value: `${metrics.avgCompletionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
        <p className="text-slate-500 mt-1">Key metrics and insights for fleet performance.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">{metric.title}</p>
              <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Fuel Efficiency Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Fuel Efficiency Trend</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} km/l`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Avg km/liter"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fleet Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Fleet Status Distribution</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Top 5 Costliest Vehicles */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Costliest Vehicles (by Fuel)</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costliestVehicles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹ ${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="cost" fill="#f59e0b" name="Total Fuel Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Monthly Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Financial Summary</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyFinancial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹ ${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="fuel"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="Fuel Cost"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="maintenance"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  name="Maintenance Cost"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">Fleet Summary</h4>
          <p className="text-sm text-slate-600">Total Vehicles: <strong>{vehicles.length}</strong></p>
          <p className="text-sm text-slate-600">Total Trips: <strong>{trips.length}</strong></p>
          <p className="text-sm text-slate-600">Completed Trips: <strong>{trips.filter(t => t.status === 'Completed').length}</strong></p>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">Current Status</h4>
          <p className="text-sm text-slate-600">Available: <strong className="text-green-600">{vehicles.filter(v => v.status === 'Available').length}</strong></p>
          <p className="text-sm text-slate-600">In Shop: <strong className="text-orange-600">{vehicles.filter(v => v.status === 'InShop').length}</strong></p>
          <p className="text-sm text-slate-600">On Trip: <strong className="text-blue-600">{vehicles.filter(v => v.status === 'OnTrip').length}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
