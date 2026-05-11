// frontend/src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LayoutDashboard, Truck, Map, Wrench, FileText, Users, BarChart3, DollarSign, LogOut } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Vehicle Registry', icon: Truck, path: '/vehicles' },
    { name: 'Trip Dispatcher', icon: Map, path: '/dispatch' },
    { name: 'Maintenance', icon: Wrench, path: '/maintenance' },
    { name: 'Driver Profiles', icon: Users, path: '/drivers' },
    { name: 'Expenses', icon: DollarSign, path: '/expenses' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-800 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">FLEET<span className="text-white">FLOW</span></h1>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="mb-2">
                <Link 
                  to={item.path} 
                  className={`flex items-center px-6 py-3 transition-colors ${
                    isActive ? 'bg-slate-900 border-l-4 border-blue-500' : 'hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="flex items-center text-slate-300 hover:text-white transition-colors cursor-pointer w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;