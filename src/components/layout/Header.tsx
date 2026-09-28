import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, LogOut, KeyRound, Menu } from 'lucide-react';
import { Badge } from '../common/Badge';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-2">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button for Mobile */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar Button Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center text-sm text-slate-400 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 w-auto sm:w-64 md:w-72 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0 sm:mr-2.5" />
            <span className="hidden sm:inline-block flex-1 text-left truncate">
              Recherche globale...
            </span>
            <kbd className="hidden md:inline-block text-[10px] font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 ml-2">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Section: User Info & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs sm:text-sm shrink-0">
                {user.nom.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden xs:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[100px] sm:max-w-[140px]">
                    {user.nom}
                  </span>
                  <span className="hidden sm:inline-block">
                    <Badge value={user.role} />
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-500 block truncate max-w-[140px] sm:max-w-[180px] hidden md:block">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/changement-mot-de-passe')}
            title="Changer de mot de passe"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            title="Déconnexion"
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

