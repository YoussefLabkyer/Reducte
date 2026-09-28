import React, { useEffect, useState } from 'react';
import { serviceService } from '../services/serviceService';
import { userService } from '../services/userService';
import { demandeService } from '../services/demandeService';
import { clientService } from '../services/clientService';
import { equipementService } from '../services/equipementService';
import { ServiceItem, UtilisateurDTO, Demande, Client, Equipement, ServiceStatus } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  UserCheck,
  Search,
  Filter,
  User,
  Building2,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [techniciens, setTechniciens] = useState<UtilisateurDTO[]>([]);
  const [demandesMap, setDemandesMap] = useState<Record<string, Demande>>({});
  const [clientsMap, setClientsMap] = useState<Record<string, Client>>({});
  const [equipementsMap, setEquipementsMap] = useState<Record<string, Equipement>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Search & Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const [selectedTechId, setSelectedTechId] = useState('');
  const [newStatus, setNewStatus] = useState<ServiceStatus>('En cours');
  const [notes, setNotes] = useState('');
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const loadData = async () => {
    try {
      const [sData, uData, dData, cData, eData] = await Promise.all([
        serviceService.getAll(),
        userService.getAll().catch(() => []),
        demandeService.getAll().catch(() => []),
        clientService.getAll().catch(() => []),
        equipementService.getAll().catch(() => []),
      ]);

      setServices(sData);

      const techs = uData.filter(u => u.role === 'technicien' && u.statut === 'Actif');
      setTechniciens(techs);
      if (techs.length > 0 && !selectedTechId) setSelectedTechId(techs[0].id);

      const dMap: Record<string, Demande> = {};
      dData.forEach(d => {
        dMap[d.id] = d;
      });
      setDemandesMap(dMap);

      const cMap: Record<string, Client> = {};
      cData.forEach(c => {
        cMap[c.id] = c;
      });
      setClientsMap(cMap);

      const eMap: Record<string, Equipement> = {};
      eData.forEach(e => {
        eMap[e.id] = e;
      });
      setEquipementsMap(eMap);
    } catch (err: any) {
      showError(err.message || 'Erreur lors du chargement des services.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (service: ServiceItem) => {
    setSelectedService(service);
    setIsAssignOpen(true);
    try {
      const uData = await userService.getAll();
      const techs = uData.filter(u => u.role === 'technicien' && u.statut === 'Actif');
      setTechniciens(techs);
      if (service.technicienId && techs.some(t => t.id === service.technicienId)) {
        setSelectedTechId(service.technicienId);
      } else if (techs.length > 0) {
        setSelectedTechId(techs[0].id);
      } else {
        setSelectedTechId('');
      }
    } catch {
      setSelectedTechId(service.technicienId || techniciens[0]?.id || '');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTechId) return;
    try {
      await serviceService.assignTechnician(selectedService.id, selectedTechId);
      setIsAssignOpen(false);
      setSelectedService(null);
      showSuccess('Service affecté avec succès au technicien.');
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'affectation du technicien.");
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await serviceService.updateStatus(selectedService.id, newStatus, notes);
      setIsStatusOpen(false);
      setSelectedService(null);
      setNotes('');
      showSuccess('Statut du service mis à jour.');
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la mise à jour du statut.');
    }
  };

  const confirmDeleteService = async () => {
    if (!deleteServiceId) return;
    const targetId = deleteServiceId;
    setDeleteLoading(true);
    try {
      await serviceService.delete(targetId);
      setDeleteServiceId(null);
      showSuccess('Service supprimé avec succès.');
      setServices(prev => prev.filter(s => s.id !== targetId));
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTechName = (techId?: string) => {
    if (!techId) return 'Non affecté';
    const tech = techniciens.find(t => t.id === techId);
    return tech ? tech.nom : techId;
  };

  const filteredServices = services
    .filter(s => {
      if (user?.role === 'technicien') {
        return Boolean(s.technicienId) && s.technicienId === user.id;
      }
      return true;
    })
    .filter(s => {
      if (statusFilter !== 'TOUS' && s.statut !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const demande = demandesMap[s.demandeId];
        const client = demande ? clientsMap[demande.clientId] : undefined;
        const equipement = demande ? equipementsMap[demande.equipementId] : undefined;
        const techName = getTechName(s.technicienId).toLowerCase();

        return (
          s.id.toLowerCase().includes(term) ||
          techName.includes(term) ||
          (s.notes && s.notes.toLowerCase().includes(term)) ||
          (demande && demande.objet.toLowerCase().includes(term)) ||
          (client && (client.societe.toLowerCase().includes(term) || client.nom.toLowerCase().includes(term))) ||
          (equipement && (equipement.nom.toLowerCase().includes(term) || equipement.numeroSerie.toLowerCase().includes(term)))
        );
      }
      return true;
    });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingSpinner size="lg" />;

  const statusOptions: (ServiceStatus | 'TOUS')[] = [
    'TOUS',
    'Nouvelle',
    'Affectée',
    'En cours',
    'Terminée',
    'Annulée',
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-between text-sm shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 flex items-center justify-between text-sm shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestion des services & interventions</h1>
        <p className="text-sm text-slate-500">
          Affectation des demandes aux techniciens et suivi du cycle de vie des interventions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par référence, technicien, objet, client ou équipement..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {statusOptions.map(st => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'TOUS' ? 'Tous' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Réf. Service</th>
                <th className="px-6 py-3.5">Demande & Client</th>
                <th className="px-6 py-3.5">Équipement concerné</th>
                <th className="px-6 py-3.5">Technicien affecté</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5">Dernière mise à jour</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Aucun service trouvé.
                  </td>
                </tr>
              ) : (
                paginatedServices.map(s => {
                  const demande = demandesMap[s.demandeId];
                  const client = demande ? clientsMap[demande.clientId] : undefined;
                  const equipement = demande ? equipementsMap[demande.equipementId] : undefined;
                  const isAssignedToMe = user?.role === 'technicien' && s.technicienId === user.id;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900">
                        {s.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {demande ? demande.objet : s.demandeId}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center mt-0.5">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                          {client ? client.societe : 'Client inconnu'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800 flex items-center">
                          <Laptop className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                          {equipement ? equipement.nom : 'Matériel inconnu'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {equipement?.numeroSerie}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-medium text-slate-700 flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                          {getTechName(s.technicienId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge value={s.statut} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {new Date(s.dateMiseAJour).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => openAssignModal(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Affecter un technicien"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {(user?.role === 'admin' || isAssignedToMe) && (
                          <button
                            onClick={() => {
                              setSelectedService(s);
                              let initialStatut = s.statut;
                              if (user?.role === 'technicien' && (s.statut === 'Nouvelle' || s.statut === 'Affectée')) {
                                initialStatut = 'En cours';
                              }
                              setNewStatus(initialStatut);
                              setNotes(s.notes || '');
                              setIsStatusOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier le statut"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}

                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setDeleteServiceId(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer le service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredServices.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Assign Technician Modal (Admin) */}
      {selectedService && (
        <Modal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          title="Affecter un technicien au service"
        >
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sélectionnez le technicien responsable
              </label>
              {techniciens.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                  Aucun technicien actif n'est actuellement disponible dans le système. Veuillez créer un compte technicien.
                </div>
              ) : (
                <select
                  required
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nom} ({t.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={techniciens.length === 0}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-medium rounded-lg"
              >
                Valider l'affectation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Status Modal */}
      {selectedService && (
        <Modal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          title="Mettre à jour le statut du service"
        >
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nouveau statut</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as ServiceStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {user?.role === 'technicien' ? (
                  <>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                  </>
                ) : (
                  <>
                    <option value="Nouvelle">Nouvelle</option>
                    <option value="Affectée">Affectée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </>
                )}
              </select>
              {user?.role === 'technicien' && (
                <p className="text-[11px] text-slate-500 mt-1">
                  En tant que technicien, vous pouvez définir le statut sur <strong>En cours</strong> ou <strong>Terminée</strong>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Journal d'intervention</label>
              <textarea
                rows={4}
                placeholder="Rédigez un résumé des actions effectuées ou du diagnostic..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsStatusOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
              >
                Enregistrer la mise à jour
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Service Modal */}
      <ConfirmModal
        isOpen={!!deleteServiceId}
        onClose={() => setDeleteServiceId(null)}
        onConfirm={confirmDeleteService}
        title="Supprimer l intervention de service"
        message="Êtes-vous sûr de vouloir supprimer définitivement cette intervention de service ?"
        confirmText="Supprimer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
