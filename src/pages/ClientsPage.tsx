import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { equipementService } from '../services/equipementService';
import { Client, Equipement } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  Laptop,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientEquipmentsMap, setClientEquipmentsMap] = useState<Record<string, Equipement[]>>({});
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Feedback messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Confirm delete modal
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal view client equipments
  const [viewEquipmentsClient, setViewEquipmentsClient] = useState<Client | null>(null);
  const [clientEquipments, setClientEquipments] = useState<Equipement[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    societe: '',
    adresse: '',
    telephone: '',
    email: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const loadClients = async () => {
    try {
      const [data, allEq] = await Promise.all([
        clientService.getAll(),
        equipementService.getAll().catch(() => []),
      ]);
      setClients(data);

      const eqMap: Record<string, Equipement[]> = {};
      allEq.forEach(eq => {
        if (!eqMap[eq.clientId]) eqMap[eq.clientId] = [];
        eqMap[eq.clientId].push(eq);
      });
      setClientEquipmentsMap(eqMap);
    } catch (err: any) {
      showError(err.message || 'Erreur lors du chargement des clients.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEquipments = async (client: Client) => {
    setViewEquipmentsClient(client);
    setLoadingEquipments(true);
    try {
      const eqs = await clientService.getEquipements(client.id);
      setClientEquipments(eqs);
    } catch (err) {
      setClientEquipments(clientEquipmentsMap[client.id] || []);
    } finally {
      setLoadingEquipments(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      showError('Adresse email invalide.');
      return;
    }
    try {
      await clientService.create(form);
      setIsCreateOpen(false);
      setForm({ nom: '', prenom: '', societe: '', adresse: '', telephone: '', email: '' });
      showSuccess('Client créé avec succès.');
      await loadClients();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la création du client.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!validateEmail(selectedClient.email)) {
      showError('Adresse email invalide.');
      return;
    }
    try {
      await clientService.update(selectedClient.id, selectedClient);
      setIsEditOpen(false);
      setSelectedClient(null);
      showSuccess('Mise à jour du client effectuée.');
      await loadClients();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteClientId) return;
    const targetId = deleteClientId;
    setDeleteLoading(true);
    try {
      await clientService.delete(targetId);
      setDeleteClientId(null);
      showSuccess('Client supprimé avec succès.');
      setClients(prev => prev.filter(c => c.id !== targetId));
      await loadClients();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.societe.toLowerCase().includes(term) ||
      c.nom.toLowerCase().includes(term) ||
      c.prenom.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.telephone.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Notifications */}
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
          <h1 className="text-2xl font-bold text-slate-900">Gestion des clients</h1>
          <p className="text-sm text-slate-500">
            Répertoire des entreprises, comptes clients et consultation de leurs équipements rattachés
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setForm({
                nom: 'Martin',
                prenom: 'Alexandre',
                societe: 'Tech Innovations ' + Math.floor(Math.random() * 100),
                telephone: '01 42 68 55 00',
                email: 'contact' + Math.floor(Math.random() * 1000) + '@techinnov.fr',
                adresse: '12 Avenue des Champs-Élysées, 75008 Paris',
              });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par société, nom, téléphone ou email..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedClients.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                Aucun client ne correspond à vos critères.
              </div>
            ) : (
              paginatedClients.map(client => {
                const count = (clientEquipmentsMap[client.id] || []).length;
                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 text-base">{client.societe}</h3>
                            <p className="text-xs text-slate-500 flex items-center mt-0.5">
                              <User className="w-3.5 h-3.5 mr-1" />
                              {client.prenom} {client.nom}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          {(user?.role === 'admin' || user?.role === 'client') && (
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setIsEditOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => setDeleteClientId(client.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span>{client.telephone}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-slate-400 mr-2 mt-0.5 shrink-0" />
                          <span>{client.adresse}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenEquipments(client)}
                          className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center">
                            <Laptop className="w-4 h-4 text-purple-600 mr-2" />
                            Équipements associés
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded-full text-[11px]">
                            {count}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                      <span>ID: {client.id}</span>
                      <span>{new Date(client.dateCreation).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClients.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la fiche client"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce client ?"
        confirmText="Supprimer définitivement"
        variant="danger"
        loading={deleteLoading}
      />

      {/* View Equipments Modal */}
      {viewEquipmentsClient && (
        <Modal
          isOpen={!!viewEquipmentsClient}
          onClose={() => setViewEquipmentsClient(null)}
          title={`Équipements de ${viewEquipmentsClient.societe}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Client:</span> {viewEquipmentsClient.prenom} {viewEquipmentsClient.nom} ({viewEquipmentsClient.email})
              </div>
              <button
                onClick={() => {
                  setViewEquipmentsClient(null);
                  navigate(`/equipements?clientId=${viewEquipmentsClient.id}`);
                }}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Gérer dans l'inventaire <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {loadingEquipments ? (
              <LoadingSpinner size="md" />
            ) : clientEquipments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed rounded-lg">
                Aucun équipement enregistré pour ce client.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {clientEquipments.map(eq => (
                  <div
                    key={eq.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{eq.nom}</div>
                        <div className="text-[11px] text-slate-500">
                          {eq.categorie} • {eq.marque} {eq.modele}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        S/N: {eq.numeroSerie}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewEquipmentsClient(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Ajouter un nouveau client"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Société</label>
            <input
              type="text"
              required
              value={form.societe}
              onChange={e => setForm({ ...form, societe: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse</label>
            <input
              type="text"
              required
              value={form.adresse}
              onChange={e => setForm({ ...form, adresse: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
            <input
              type="tel"
              required
              value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
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
              Enregistrer le client
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedClient && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Modifier les informations du client"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={selectedClient.prenom}
                  onChange={e => setSelectedClient({ ...selectedClient, prenom: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={selectedClient.nom}
                  onChange={e => setSelectedClient({ ...selectedClient, nom: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Société</label>
              <input
                type="text"
                required
                value={selectedClient.societe}
                onChange={e => setSelectedClient({ ...selectedClient, societe: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Adresse</label>
              <input
                type="text"
                required
                value={selectedClient.adresse}
                onChange={e => setSelectedClient({ ...selectedClient, adresse: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
              <input
                type="tel"
                required
                value={selectedClient.telephone}
                onChange={e => setSelectedClient({ ...selectedClient, telephone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={selectedClient.email}
                onChange={e => setSelectedClient({ ...selectedClient, email: e.target.value })}
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

      {/* Confirm Delete Client Modal */}
      <ConfirmModal
        isOpen={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce client et l'ensemble de ses équipements rattachés ?"
        confirmText="Supprimer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
