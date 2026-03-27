import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import { Bell, Moon, Sun, CheckCircle } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const dummyNotifications = [
    { id: 1, title: 'New lead assigned', time: '5m ago', read: false },
    { id: 2, title: 'Meeting scheduled with Acme Corp', time: '1h ago', read: false },
    { id: 3, title: 'Weekly report generated', time: '1d ago', read: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 transition-colors duration-200">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight transition-colors duration-200">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5 transition-colors duration-200">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-500 dark:hover:text-blue-400"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl bg-white border border-gray-100 shadow-xl py-2 animate-scale-in">
                <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {dummyNotifications.map(notification => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          <CheckCircle className={`h-4 w-4 ${notification.read ? 'text-gray-400' : 'text-primary-500'}`} />
                        </div>
                        <div>
                          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 transition-colors duration-200">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 transition-colors duration-200">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
