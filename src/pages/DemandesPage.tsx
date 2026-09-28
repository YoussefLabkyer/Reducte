import React, { useEffect, useState } from 'react';
import { demandeService } from '../services/demandeService';
import { equipementService } from '../services/equipementService';
import { clientService } from '../services/clientService';
import { userService } from '../services/userService';
import { serviceService } from '../services/serviceService';
import { Demande, Equipement, Client, PriorityLevel, UtilisateurDTO, ServiceItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Edit3,
  XCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  Trash2,
  UserCheck,
} from 'lucide-react';

export const DemandesPage: React.FC = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [techniciens, setTechniciens] = useState<UtilisateurDTO[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, client } = useAuth();

  // Search & Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  // Assignment Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignDemande, setAssignDemande] = useState<Demande | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Confirm cancellation & deletion
  const [cancelDemandeId, setCancelDemandeId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteDemandeId, setDeleteDemandeId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    objet: '',
    description: '',
    priorite: 'Moyenne' as PriorityLevel,
    equipementId: '',
    clientId: '',
  });

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
      const [dData, eqData, cData, uData, sData] = await Promise.all([
        demandeService.getAll(),
        equipementService.getAll(),
        clientService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
        serviceService.getAll().catch(() => []),
      ]);
      setDemandes(dData);
      setEquipements(eqData);
      setClients(cData);
      setServices(sData);

      const techs = uData.filter(u => u.role === 'technicien' && u.statut === 'Actif');
      setTechniciens(techs);

      if (eqData.length > 0) {
        setForm(f => ({ ...f, equipementId: eqData[0].id }));
      }
      if (cData.length > 0) {
        setForm(f => ({ ...f, clientId: cData[0].id }));
      }
    } catch (err: any) {
      showError(err.message || 'Erreur lors du chargement des demandes.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (demande: Demande) => {
    setAssignDemande(demande);
    setIsAssignOpen(true);
    // Fetch fresh technicians list dynamically
    try {
      const [allUsers, allServices] = await Promise.all([
        userService.getAll().catch(() => []),
        serviceService.getAll().catch(() => []),
      ]);
      const techs = allUsers.filter(u => u.role === 'technicien' && u.statut === 'Actif');
      setTechniciens(techs);
      setServices(allServices);

      // Check if there is an existing service intervention for this demande
      const existingService = allServices.find(s => s.demandeId === demande.id);
      if (existingService && existingService.technicienId) {
        setSelectedTechId(existingService.technicienId);
      } else if (techs.length > 0) {
        setSelectedTechId(techs[0].id);
      } else {
        setSelectedTechId('');
      }
    } catch {
      // Keep current state if fetch fails
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDemande || !selectedTechId) return;

    setAssignLoading(true);
    try {
      // Find service corresponding to this demande, or reload
      let sList = services;
      let serviceItem = sList.find(s => s.demandeId === assignDemande.id);

      if (!serviceItem) {
        sList = await serviceService.getAll();
        setServices(sList);
        serviceItem = sList.find(s => s.demandeId === assignDemande.id);
      }

      if (serviceItem) {
        await serviceService.assignTechnician(serviceItem.id, selectedTechId);
      } else {
        // Update demande status
        await demandeService.update(assignDemande.id, { statut: 'Affectée' });
      }

      setIsAssignOpen(false);
      setAssignDemande(null);
      showSuccess('Demande affectée au technicien avec succès.');
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'affectation du technicien.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.objet.trim() || !form.description.trim()) {
      showError("Veuillez remplir l'objet et la description.");
      return;
    }
    try {
      await demandeService.create(form);
      setIsCreateOpen(false);
      setForm({
        objet: '',
        description: '',
        priorite: 'Moyenne',
        equipementId: equipements[0]?.id || '',
        clientId: clients[0]?.id || '',
      });
      showSuccess('Demande créée avec succès.');
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la création de la demande.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;
    try {
      await demandeService.update(selectedDemande.id, {
        objet: selectedDemande.objet,
        description: selectedDemande.description,
        priorite: selectedDemande.priorite,
        statut: selectedDemande.statut,
        equipementId: selectedDemande.equipementId,
      });
      setIsEditOpen(false);
      setSelectedDemande(null);
      showSuccess('Demande mise à jour.');
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  const confirmCancelDemande = async () => {
    if (!cancelDemandeId) return;
    setCancelLoading(true);
    try {
      await demandeService.cancel(cancelDemandeId);
      setCancelDemandeId(null);
      showSuccess('Demande annulée avec succès.');
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'annulation.");
    } finally {
      setCancelLoading(false);
    }
  };

  const confirmDeleteDemande = async () => {
    if (!deleteDemandeId) return;
    const targetId = deleteDemandeId;
    setDeleteLoading(true);
    try {
      await demandeService.delete(targetId);
      setDeleteDemandeId(null);
      showSuccess('Demande supprimée avec succès.');
      setDemandes(prev => prev.filter(d => d.id !== targetId));
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClientDisplay = (clientId: string) => {
    const c = clients.find(item => item.id === clientId);
    return c ? `${c.societe} (${c.prenom} ${c.nom})` : clientId;
  };

  const getEquipementDisplay = (equipementId: string) => {
    const eq = equipements.find(item => item.id === equipementId);
    return eq ? `${eq.nom} (${eq.marque} ${eq.modele})` : equipementId;
  };

  const filteredDemandes = demandes.filter(d => {
    if (statusFilter && d.statut !== statusFilter) return false;
    if (priorityFilter && d.priorite !== priorityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const objMatch = d.objet.toLowerCase().includes(term);
      const descMatch = d.description.toLowerCase().includes(term);
      const eqDisplay = getEquipementDisplay(d.equipementId).toLowerCase();
      const clientDisplay = getClientDisplay(d.clientId).toLowerCase();
      return objMatch || descMatch || eqDisplay.includes(term) || clientDisplay.includes(term);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const paginatedDemandes = filteredDemandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* User Alerts */}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes de services</h1>
          <p className="text-sm text-slate-500">
            {user?.role === 'technicien'
              ? 'Consultez les demandes qui vous sont affectées et mettez à jour leur avancement'
              : 'Enregistrement et suivi des demandes d assistance informatique'}
          </p>
        </div>

        {user?.role === 'client' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une demande
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par objet, description, client ou équipement..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="Nouvelle">Nouvelle</option>
              <option value="Affectée">Affectée</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={e => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Toutes priorités</option>
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Élevée">Élevée</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Demande / Objet</th>
                <th className="px-6 py-3.5">Équipement & Client</th>
                <th className="px-6 py-3.5">Priorité</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDemandes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Aucune demande enregistrée.
                  </td>
                </tr>
              ) : (
                paginatedDemandes.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{d.objet}</div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{d.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-800">
                        {getEquipementDisplay(d.equipementId)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {getClientDisplay(d.clientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={d.priorite} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={d.statut} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {new Date(d.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => openAssignModal(d)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Affecter un technicien"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'technicien') && (
                        <button
                          onClick={() => {
                            let initialStatut = d.statut;
                            if (user?.role === 'technicien' && (d.statut === 'Nouvelle' || d.statut === 'Affectée')) {
                              initialStatut = 'En cours';
                            }
                            setSelectedDemande({ ...d, statut: initialStatut });
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={user?.role === 'technicien' ? 'Mettre à jour le statut' : 'Modifier la demande'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {((user?.role === 'admin' && d.statut !== 'Annulée' && d.statut !== 'Terminée') ||
                        (user?.role === 'client' && d.clientId === client?.id && d.statut === 'Nouvelle')) && (
                        <button
                          onClick={() => setCancelDemandeId(d.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Annuler la demande"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {(user?.role === 'admin' || (user?.role === 'client' && d.clientId === client?.id)) && (
                        <button
                          onClick={() => setDeleteDemandeId(d.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la demande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDemandes.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Confirm Cancellation Modal */}
      <ConfirmModal
        isOpen={!!cancelDemandeId}
        onClose={() => setCancelDemandeId(null)}
        onConfirm={confirmCancelDemande}
        title="Annuler la demande"
        message="Êtes-vous sûr de vouloir annuler cette demande de service ?"
        confirmText="Annuler la demande"
        variant="warning"
        loading={cancelLoading}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Créer une nouvelle demande de service"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {user?.role !== 'client' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client concerné</label>
              <select
                required
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.societe} - {c.prenom} {c.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Équipement concerné</label>
            <select
              required
              value={form.equipementId}
              onChange={e => setForm({ ...form, equipementId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {equipements.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.nom} ({eq.marque} {eq.modele})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Objet de la demande</label>
            <input
              type="text"
              required
              placeholder="Ex: Panne de connexion, Dysfonctionnement système..."
              value={form.objet}
              onChange={e => setForm({ ...form, objet: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description détaillée</label>
            <textarea
              required
              rows={4}
              placeholder="Décrivez précisément le problème ou le besoin d intervention..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Niveau de priorité</label>
            <select
              value={form.priorite}
              onChange={e => setForm({ ...form, priorite: e.target.value as PriorityLevel })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Élevée">Élevée</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
            >
              Créer la demande
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedDemande && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={user?.role === 'technicien' ? "Mettre à jour l'intervention" : "Modifier la demande"}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            {user?.role === 'technicien' ? (
              <>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">Objet</span>
                    <p className="font-medium text-slate-800 text-sm mt-0.5">{selectedDemande.objet}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">Description</span>
                    <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{selectedDemande.description}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div>
                      <span className="font-semibold text-slate-500 block uppercase tracking-wider text-[10px]">Priorité</span>
                      <Badge value={selectedDemande.priorite} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statut de votre intervention <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDemande.statut}
                    onChange={e => setSelectedDemande({ ...selectedDemande, statut: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    En tant que technicien, vous pouvez passer le statut à <strong>En cours</strong> ou <strong>Terminée</strong>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Objet</label>
                  <input
                    type="text"
                    required
                    value={selectedDemande.objet}
                    onChange={e => setSelectedDemande({ ...selectedDemande, objet: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={selectedDemande.description}
                    onChange={e => setSelectedDemande({ ...selectedDemande, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priorité</label>
                  <select
                    value={selectedDemande.priorite}
                    onChange={e => setSelectedDemande({ ...selectedDemande, priorite: e.target.value as PriorityLevel })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={selectedDemande.statut}
                    onChange={e => setSelectedDemande({ ...selectedDemande, statut: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="Nouvelle">Nouvelle</option>
                    <option value="Affectée">Affectée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
              >
                {user?.role === 'technicien' ? 'Enregistrer le statut' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Technician Modal */}
      {assignDemande && (
        <Modal
          isOpen={isAssignOpen}
          onClose={() => {
            setIsAssignOpen(false);
            setAssignDemande(null);
          }}
          title="Affecter un technicien à la demande"
        >
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Demande :</span> {assignDemande.objet}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sélectionnez le technicien responsable
              </label>
              {techniciens.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                  Aucun technicien actif n'est actuellement disponible dans le système. Veuillez créer ou activer un compte technicien dans la rubrique Utilisateurs.
                </div>
              ) : (
                <select
                  required
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-hidden focus:border-blue-500"
                >
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nom} ({t.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAssignOpen(false);
                  setAssignDemande(null);
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={techniciens.length === 0 || assignLoading}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg"
              >
                {assignLoading ? 'Affectation...' : 'Confirmer l affectation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Demande Modal */}
      <ConfirmModal
        isOpen={!!deleteDemandeId}
        onClose={() => setDeleteDemandeId(null)}
        onConfirm={confirmDeleteDemande}
        title="Supprimer la demande"
        message="Êtes-vous sûr de vouloir supprimer définitivement cette demande de service ?"
        confirmText="Supprimer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
