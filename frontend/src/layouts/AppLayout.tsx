import { LogOut, MessageSquare, Settings } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';

export function AppLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="min-w-0 flex flex-col">
        <header className="h-14 border-b border-line bg-ink/80 backdrop-blur flex items-center justify-between px-4">
          <NavLink to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <MessageSquare size={18} />
            Chat
          </NavLink>
          <div className="flex items-center gap-2">
            <NavLink to="/settings" className="h-9 w-9 grid place-items-center rounded-md hover:bg-white/10" title="Settings">
              <Settings size={18} />
            </NavLink>
            <button
              className="h-9 w-9 grid place-items-center rounded-md hover:bg-white/10"
              title="Log out"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

