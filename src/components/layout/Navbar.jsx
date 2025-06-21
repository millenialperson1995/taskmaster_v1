import { Moon, Sun, Bell, LogOut, CheckSquare } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({ onRequestNotificationPermission, notificationPermission }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800 dark:text-white">TaskMaster</span>
          </div>
          <div className="flex items-center gap-2">
            {notificationPermission !== 'granted' && (
              <button onClick={onRequestNotificationPermission} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Ativar notificações" title="Ativar notificações"><Bell size={22} /></button>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button onClick={logout} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" aria-label="Sair" title="Sair">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};