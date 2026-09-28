import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { equipementService } from '../services/equipementService';
import { clientService } from '../services/clientService';
import { Equipement, Client } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Laptop,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Building2,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const EquipementsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, client } = useAuth();

  const [selectedClientIdFilter, setSelectedClientIdFilter] = useState<string>(
    searchParams.get('clientId') || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEquipement, setSelectedEquipement] = useState<Equipement | null>(null);

  // Delete confirm
  const [deleteEquipementId, setDeleteEquipementId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    clientId: '',
    nom: '',
    categorie: 'PC Portable',
    marque: '',
    modele: '',
    numeroSerie: '',
    dateInstallation: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const urlClientId = searchParams.get('clientId');
    if (urlClientId !== null && urlClientId !== selectedClientIdFilter) {
      setSelectedClientIdFilter(urlClientId);
    }
  }, [searchParams]);

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
      const [eqData, clientData] = await Promise.all([
        equipementService.getAll(),
        clientService.getAll().catch(() => []),
      ]);
      setEquipements(eqData);
      setClients(clientData);
      if (clientData.length > 0) {
        setForm(f => ({ ...f, clientId: clientData[0].id }));
      }
    } catch (err: any) {
      showError(err.message || 'Erreur lors du chargement des équipements.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (clientId: string) => {
    setSelectedClientIdFilter(clientId);
    setCurrentPage(1);
    if (clientId) {
      setSearchParams({ clientId });
    } else {
      setSearchParams({});
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.numeroSerie.trim()) {
      showError('Veuillez renseigner le nom et le numéro de série.');
      return;
    }
    try {
      const payload = {
        ...form,
        clientId: user?.role === 'client' ? (client?.id || form.clientId) : form.clientId,
      };
      await equipementService.create(payload);
      setIsCreateOpen(false);
      setForm({
        clientId: clients[0]?.id || client?.id || '',
        nom: '',
        categorie: 'PC Portable',
        marque: '',
        modele: '',
        numeroSerie: '',
        dateInstallation: new Date().toISOString().split('T')[0],
      });
      showSuccess('Équipement ajouté avec succès.');
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'ajout de l'équipement.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipement) return;
    try {
      await equipementService.update(selectedEquipement.id, selectedEquipement);
      setIsEditOpen(false);
      setSelectedEquipement(null);
      showSuccess('Équipement mis à jour.');
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  const confirmDeleteEquipement = async () => {
    if (!deleteEquipementId) return;
    const targetId = deleteEquipementId;
    setDeleteLoading(true);
    try {
      await equipementService.delete(targetId);
      setDeleteEquipementId(null);
      showSuccess('Équipement supprimé avec succès.');
      setEquipements(prev => prev.filter(e => e.id !== targetId));
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(item => item.id === clientId);
    if (c) return `${c.societe} (${c.prenom} ${c.nom})`;
    if (client && client.id === clientId) return `${client.societe} (${client.prenom} ${client.nom})`;
    return clientId;
  };

  const filteredEquipements = equipements.filter(item => {
    if (selectedClientIdFilter && item.clientId !== selectedClientIdFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const clientName = getClientName(item.clientId).toLowerCase();
      return (
        item.nom.toLowerCase().includes(term) ||
        item.categorie.toLowerCase().includes(term) ||
        item.marque.toLowerCase().includes(term) ||
        item.modele.toLowerCase().includes(term) ||
        item.numeroSerie.toLowerCase().includes(term) ||
        clientName.includes(term)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEquipements.length / itemsPerPage);
  const paginatedEquipements = filteredEquipements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingSpinner size="lg" />;

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des équipements</h1>
          <p className="text-sm text-slate-500">
            Inventaire du matériel informatique (serveurs, postes de travail, commutateurs, imprimantes...)
          </p>
        </div>

        {(user?.role === 'client' || user?.role === 'admin') && (
          <button
            onClick={() => {
              if (user?.role === 'admin' && clients.length > 0 && !form.clientId) {
                setForm(prev => ({ ...prev, clientId: clients[0].id }));
              }
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un équipement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un équipement par nom, marque, série..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {user?.role !== 'client' && (
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">Client :</span>
            <select
              value={selectedClientIdFilter}
              onChange={e => handleFilterChange(e.target.value)}
              className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tous les clients ({equipements.length})</option>
              {clients.map(c => {
                const count = equipements.filter(e => e.clientId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.societe} ({count} équipements)
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEquipements.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                Aucun équipement enregistré ou correspondant à vos filtres.
              </div>
            ) : (
              paginatedEquipements.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                          <Laptop className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-base">{item.nom}</h3>
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 mt-0.5">
                            {item.categorie}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {user?.role !== 'client' && (
                          <button
                            onClick={() => {
                              setSelectedEquipement(item);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {(user?.role === 'admin' || (user?.role === 'client' && (item.clientId === client?.id || !item.clientId))) && (
                          <button
                            onClick={() => setDeleteEquipementId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer l'équipement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Marque & Modèle :</span>
                        <span className="font-medium text-slate-800">
                          {item.marque} {item.modele}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">N° de série :</span>
                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-md text-slate-800 font-semibold border border-slate-100">
                          {item.numeroSerie}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Propriétaire :</span>
                        <span className="font-medium text-blue-600 flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1" />
                          {getClientName(item.clientId)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Installé le : {new Date(item.dateInstallation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEquipements.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteEquipementId}
        onClose={() => setDeleteEquipementId(null)}
        onConfirm={confirmDeleteEquipement}
        title="Supprimer l'équipement"
        message="Êtes-vous sûr de vouloir supprimer cet équipement de l'inventaire ?"
        confirmText="Supprimer définitivement"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Ajouter un équipement informatique"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {user?.role !== 'client' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client propriétaire</label>
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom de l'équipement</label>
            <input
              type="text"
              required
              placeholder="Ex: PC Bureau Direction, Serveur NAS..."
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Catégorie</label>
              <select
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="PC Portable">PC Portable</option>
                <option value="PC Fixe">PC Fixe</option>
                <option value="Serveur">Serveur</option>
                <option value="Réseau (Switch/Routeur)">Réseau (Switch/Routeur)</option>
                <option value="Imprimante / Scanner">Imprimante / Scanner</option>
                <option value="Stockage / NAS">Stockage / NAS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Marque</label>
              <input
                type="text"
                required
                placeholder="Dell, HP, Cisco..."
                value={form.marque}
                onChange={e => setForm({ ...form, marque: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Modèle</label>
              <input
                type="text"
                required
                placeholder="Latitude 5540, ProLiant..."
                value={form.modele}
                onChange={e => setForm({ ...form, modele: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Numéro de série</label>
              <input
                type="text"
                required
                placeholder="SN-XXXX-XXXX"
                value={form.numeroSerie}
                onChange={e => setForm({ ...form, numeroSerie: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date d'installation</label>
            <input
              type="date"
              required
              value={form.dateInstallation}
              onChange={e => setForm({ ...form, dateInstallation: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
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
              Enregistrer l équipement
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedEquipement && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Modifier l'équipement"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom de l'équipement</label>
              <input
                type="text"
                required
                value={selectedEquipement.nom}
                onChange={e => setSelectedEquipement({ ...selectedEquipement, nom: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Catégorie</label>
                <input
                  type="text"
                  required
                  value={selectedEquipement.categorie}
                  onChange={e => setSelectedEquipement({ ...selectedEquipement, categorie: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Marque</label>
                <input
                  type="text"
                  required
                  value={selectedEquipement.marque}
                  onChange={e => setSelectedEquipement({ ...selectedEquipement, marque: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Modèle</label>
                <input
                  type="text"
                  required
                  value={selectedEquipement.modele}
                  onChange={e => setSelectedEquipement({ ...selectedEquipement, modele: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Numéro de série</label>
                <input
                  type="text"
                  required
                  value={selectedEquipement.numeroSerie}
                  onChange={e => setSelectedEquipement({ ...selectedEquipement, numeroSerie: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date d'installation</label>
              <input
                type="date"
                required
                value={selectedEquipement.dateInstallation}
                onChange={e => setSelectedEquipement({ ...selectedEquipement, dateInstallation: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

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
                Mettre à jour
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Equipment Modal */}
      <ConfirmModal
        isOpen={!!deleteEquipementId}
        onClose={() => setDeleteEquipementId(null)}
        onConfirm={confirmDeleteEquipement}
        title="Supprimer l'équipement"
        message="Êtes-vous sûr de vouloir supprimer définitivement cet équipement du parc informatique ?"
        confirmText="Supprimer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
