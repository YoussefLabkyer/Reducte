import React, { useState, useEffect } from 'react';
import { Search, X, Laptop, User, ClipboardList, Wrench, ChevronRight } from 'lucide-react';
import { searchService } from '../../services/searchService';
import { SearchResults } from '../../types';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchService.search(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults =
    (results?.clients.length || 0) +
    (results?.equipements.length || 0) +
    (results?.demandes.length || 0) +
    (results?.services.length || 0);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Rechercher clients, équipements, demandes, services..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-800 focus:outline-hidden text-base placeholder-slate-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-500">
              Recherche en cours...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Aucun résultat trouvé pour « {query} »
            </div>
          )}

          {!query && (
            <div className="py-6 text-center text-slate-400 text-sm">
              Tapez au moins un mot clé (ex: "Dell", "Paris", "Serveur", "Panne")
            </div>
          )}

          {results && !loading && (
            <>
              {/* Clients */}
              {results.clients.length > 0 && (
                <div>
                  <h4 className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <User className="w-3.5 h-3.5 mr-1.5" /> Clients ({results.clients.length})
                  </h4>
                  <div className="space-y-1">
                    {results.clients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleNavigate('/clients')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {c.prenom} {c.nom}
                          </p>
                          <p className="text-xs text-slate-500">{c.societe} • {c.email} • {c.telephone}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipements */}
              {results.equipements.length > 0 && (
                <div>
                  <h4 className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <Laptop className="w-3.5 h-3.5 mr-1.5" /> Équipements ({results.equipements.length})
                  </h4>
                  <div className="space-y-1">
                    {results.equipements.map(e => (
                      <div
                        key={e.id}
                        onClick={() => handleNavigate('/equipements')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{e.nom}</p>
                          <p className="text-xs text-slate-500">
                            {e.categorie} • {e.marque} {e.modele} (S/N: {e.numeroSerie})
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demandes */}
              {results.demandes.length > 0 && (
                <div>
                  <h4 className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Demandes de services ({results.demandes.length})
                  </h4>
                  <div className="space-y-1">
                    {results.demandes.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleNavigate('/demandes')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">{d.objet}</span>
                            <Badge value={d.statut} />
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{d.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {results.services.length > 0 && (
                <div>
                  <h4 className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    <Wrench className="w-3.5 h-3.5 mr-1.5" /> Services ({results.services.length})
                  </h4>
                  <div className="space-y-1">
                    {results.services.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleNavigate('/services')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">
                              Service #{s.id.slice(-4)} - {s.objetDemande || 'Demande'}
                            </span>
                            <Badge value={s.statut} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tech: {s.technicienNom || 'Non affecté'} {s.notes ? `• ${s.notes}` : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
