/**
 * Sidebar navigation — clean enterprise-grade design with role-based sections.
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, Package, Warehouse, Truck,
  Thermometer, LogOut, Leaf, ChevronLeft, ChevronRight,
} from 'lucide-react';

const commonNavItems = [
  { path: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/temperature',label: 'Temperature', icon: Thermometer },
];

const adminNavItems = [
  { path: '/farmers',    label: 'Farmers',     icon: Users },
  { path: '/products',   label: 'Products',    icon: Package },
  { path: '/warehouses', label: 'Warehouses',  icon: Warehouse },
  { path: '/shipments',  label: 'Shipments',   icon: Truck },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path));

    return (
      <NavLink
        to={item.path}
        className={`sidebar-item ${isActive ? 'active' : ''} ${
          collapsed ? 'justify-center !mx-2 !px-0' : ''
        }`}
        title={collapsed ? item.label : ''}
      >
        <Icon
          className={`w-[17px] h-[17px] flex-shrink-0 ${
            isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          }`}
        />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={`sidebar fixed left-0 top-0 z-30 transition-all duration-300 ${
        collapsed ? 'w-[64px]' : 'w-[256px]'
      }`}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/30">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">AgriSupply</p>
            <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold tracking-widest uppercase">
              Supply Chain
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {/* Overview section */}
        {!collapsed && (
          <p className="sidebar-section-label">Overview</p>
        )}
        {commonNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* Management section (admin only) */}
        {isAdmin && (
          <>
            {!collapsed
              ? <p className="sidebar-section-label mt-4">Management</p>
              : <div className="border-t border-gray-100 dark:border-gray-800 my-2 mx-3" />
            }
            {adminNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* ── Footer: User + Collapse ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-2">

        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                {user.full_name}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}

        {/* Logout + Collapse buttons */}
        <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-1`}>
          <button
            onClick={logout}
            className={`sidebar-item text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/15 ${
              collapsed ? 'justify-center !mx-0 !px-0 flex-1' : 'flex-1'
            }`}
            title="Logout"
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`sidebar-item text-gray-400 hover:text-gray-600 ${
              collapsed ? 'justify-center !mx-0 !px-0' : '!px-2.5'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight className="w-[17px] h-[17px]" />
              : <ChevronLeft  className="w-[17px] h-[17px]" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
