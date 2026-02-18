import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  User,
  LogOut,
  Home,
  IndianRupee,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard/overview', icon: Home, label: 'Overview' },
  { to: '/dashboard/client-profile', icon: Users, label: 'Client Profile' },
  { to: '/dashboard/billing', icon: FileText, label: 'Filing Kanban' },
  { to: '/dashboard/finance', icon: IndianRupee, label: 'Billing & Due' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear auth tokens / localStorage in real app
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <aside
      className={`
        bg-slate-900 text-slate-100 
        h-screen fixed top-0 left-0 z-30 
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-4">
        <div className="flex items-center gap-3">
          {!isCollapsed && <span className="text-xl font-semibold">CA Flow</span>}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
               ${isCollapsed ? 'justify-center' : ''}
               ${isActive 
                 ? 'bg-slate-800 text-white font-medium' 
                 : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
               }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile Dropdown Section */}
      <div className="border-t border-slate-700/60 p-3">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center' : ''}
            text-slate-300 hover:bg-slate-800/70 hover:text-white
          `}
        >
          <User size={20} className="shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">Admin Profile</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {/* Dropdown content - only shown when expanded */}
        {isProfileOpen && !isCollapsed && (
          <div className="mt-2 bg-slate-800/70 rounded-lg overflow-hidden border border-slate-700/50">
            <NavLink
              to="/dashboard/admin-profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors
                 ${isActive ? 'bg-slate-700/50 text-white' : ''}`
              }
            >
              <User size={18} />
              <span>View Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors text-left"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Collapsed mode → quick logout icon */}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="mt-3 w-full flex justify-center p-3 rounded-lg text-slate-300 hover:bg-slate-800/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
};

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <main
        className={`
          flex-1 transition-all duration-300
          ${isCollapsed ? 'ml-16' : 'ml-60'}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;