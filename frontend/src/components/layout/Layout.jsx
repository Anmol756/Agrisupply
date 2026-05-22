/**
 * Root layout — sidebar + header + main content area.
 * Uses CSS margin to account for fixed sidebar width.
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

const PAGE_META = {
  '/':            { title: 'Dashboard Overview',      subtitle: 'At-a-glance summary of your supply chain' },
  '/farmers':     { title: 'Farmer Management',       subtitle: 'Manage farmer profiles and land records' },
  '/products':    { title: 'Product Management',      subtitle: 'Track inventory, categories and pricing' },
  '/warehouses':  { title: 'Warehouse Dashboard',     subtitle: 'Monitor capacity and storage conditions' },
  '/shipments':   { title: 'Shipment Tracking',       subtitle: 'End-to-end shipment pipeline view' },
  '/temperature': { title: 'Temperature Monitoring',  subtitle: 'Cold chain sensor logs and alerts' },
};

export default function Layout() {
  const location  = useLocation();
  const meta      = PAGE_META[location.pathname] ?? { title: 'AgriSupply', subtitle: '' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarW  = sidebarCollapsed ? 64 : 256;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <Header title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 px-6 py-6 overflow-x-hidden">
          <div
            className="animate-fade-in max-w-[1400px] mx-auto"
            key={location.pathname}
          >
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-[11px] text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} AgriSupply — Smart Agricultural Supply Chain Management
          </p>
        </footer>
      </div>
    </div>
  );
}
