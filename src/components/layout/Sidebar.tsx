import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Laptop,
  ClipboardList,
  Wrench,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const role = user?.role;

  const links = [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/demandes', label: 'Demandes de services', icon: ClipboardList },
    { to: '/equipements', label: 'Équipements', icon: Laptop },
  ];

  if (role === 'admin' || role === 'technicien') {
    links.push({ to: '/services', label: 'Gestion des services', icon: Wrench });
  }

  if (role === 'admin') {
    links.push(
      { to: '/clients', label: 'Gestion des clients', icon: Building2 },
      { to: '/utilisateurs', label: 'Gestion utilisateurs', icon: Users }
    );
  }

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } min-h-screen`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md shadow-blue-500/20">
              R
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">Reducte</h1>
              <p className="text-[11px] text-slate-400">Services Informatiques</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Menu principal
          </div>
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Role Footer Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium">Connecté en tant que :</p>
            <p className="text-sm font-semibold text-white truncate capitalize">{user?.role || 'invité'}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

