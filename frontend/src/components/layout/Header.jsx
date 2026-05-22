/**
 * App Header — sticky top bar with page title, breadcrumb, and quick actions.
 */

import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Moon, Bell } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const roleColor = {
    admin:       { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300' },
    farmer:      { bg: 'bg-green-50  dark:bg-green-900/20',  text: 'text-green-700  dark:text-green-300' },
    transporter: { bg: 'bg-blue-50   dark:bg-blue-900/20',   text: 'text-blue-700   dark:text-blue-300' },
  }[user?.role] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 py-3.5">

        {/* Left: Page Title + Date */}
        <div>
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{today}</p>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center gap-2">

          {/* Notification bell */}
          <button
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* User chip */}
          {user && (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {user.full_name}
                </p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${roleColor.text}`}>
                  {user.role}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[13px] font-bold shadow-sm shadow-green-500/30 cursor-default"
                title={user.full_name}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
