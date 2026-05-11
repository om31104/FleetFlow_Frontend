// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import TripDispatcher from './pages/TripDispatcher';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Drivers from './pages/Drivers';
import Expenses from './pages/Expenses';
import { AppContext } from './context/AppContext';

function App() {
  const { currentUser } = useContext(AppContext);
  
  // Check if user is logged in
  const isAuthenticated = currentUser || localStorage.getItem('authToken');

  return (
    <Router>
      {isAuthenticated ? (
        // Authenticated Layout with Sidebar
        <div className="flex h-screen bg-slate-50">
          {/* Fixed Sidebar */}
          <Sidebar />
          
          {/* Main Content Area - offset by sidebar width (ml-64) */}
          <div className="flex-1 ml-64 overflow-y-auto">
            <Routes>
              <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/vehicles" element={<ProtectedRoute element={<VehicleRegistry />} />} />
              <Route path="/drivers" element={<ProtectedRoute element={<Drivers />} />} />
              <Route path="/dispatch" element={<ProtectedRoute element={<TripDispatcher />} />} />
              <Route path="/maintenance" element={<ProtectedRoute element={<Maintenance />} />} />
              <Route path="/expenses" element={<ProtectedRoute element={<Expenses />} />} />
              <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
              <Route path="*" element={<ProtectedRoute element={<Dashboard />} />} />
            </Routes>
          </div>
        </div>
      ) : (
        // Unauthenticated Layout (Auth Pages Only)
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;