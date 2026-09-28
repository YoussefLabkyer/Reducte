import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { UtilisateurDTO, UserRole, AccountStatus } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { UserPlus, CheckCircle, XCircle, Shield, Edit3, Power, Clock, Trash2, AlertCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UtilisateurDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UtilisateurDTO | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    role: 'technicien' as UserRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await userService.create(form);
      setIsCreateOpen(false);
      const createdRole = form.role;
      const createdNom = form.nom;
      setForm({ nom: '', email: '', motDePasse: '', role: 'technicien' });
      showSuccess(`Le compte ${createdRole} "${createdNom}" a été créé et activé avec succès.`);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await userService.validate(id);
      showSuccess('Inscription validée avec succès.');
      await loadUsers();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la validation.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await userService.reject(id);
      showSuccess('Inscription rejetée.');
      await loadUsers();
    } catch (err: any) {
      showError(err.message || 'Erreur lors du rejet.');
    }
  };

  const handleToggleStatus = async (user: UtilisateurDTO) => {
    const nextStatus: AccountStatus = user.statut === 'Actif' ? 'Désactivé' : 'Actif';
    try {
      await userService.toggleStatus(user.id, nextStatus);
      showSuccess(`Statut mis à jour : ${nextStatus}`);
      await loadUsers();
    } catch (err: any) {
      showError(err.message || 'Erreur lors du changement de statut.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userService.update(selectedUser.id, {
        nom: selectedUser.nom,
        email: selectedUser.email,
        role: selectedUser.role,
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      showSuccess('Utilisateur modifié avec succès.');
      await loadUsers();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la modification.');
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    const targetId = deleteUserId;
    setDeleteLoading(true);
    try {
      await userService.delete(targetId);
      setDeleteUserId(null);
      setUsers(prev => prev.filter(u => u.id !== targetId));
      showSuccess('Utilisateur supprimé avec succès.');
      await loadUsers();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const pendingUsers = users.filter(u => u.statut === 'En attente');
  const displayedUsers = activeTab === 'pending' ? pendingUsers : users;

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-between text-sm shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-slate-500">
            Gestion des comptes administrateurs, techniciens et validation des inscriptions clients
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un agent (Admin / Tech)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tous les utilisateurs ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${
            activeTab === 'pending'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 mr-1.5" />
          Inscriptions en attente
          {pendingUsers.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Nom & E-mail</th>
                <th className="px-6 py-3.5">Rôle</th>
                <th className="px-6 py-3.5">Statut du compte</th>
                <th className="px-6 py-3.5">Date création</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                displayedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{user.nom}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={user.statut} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {user.statut === 'En attente' ? (
                        <>
                          <button
                            onClick={() => handleValidate(user.id)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg inline-flex items-center transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Valider
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg inline-flex items-center transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeter
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.statut === 'Actif'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={user.statut === 'Actif' ? 'Désactiver le compte' : 'Activer le compte'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer l utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Ajouter un utilisateur (Admin / Technicien)"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe provisoire</label>
            <input
              type="password"
              required
              value={form.motDePasse}
              onChange={e => setForm({ ...form, motDePasse: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rôle de l'utilisateur</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500 bg-white"
            >
              <option value="technicien">Technicien</option>
              <option value="admin">Administrateur</option>
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
              Créer l utilisateur
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Modifier l'utilisateur"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={selectedUser.nom}
                onChange={e => setSelectedUser({ ...selectedUser, nom: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={selectedUser.email}
                onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Rôle</label>
              <select
                value={selectedUser.role}
                onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="admin">Administrateur</option>
                <option value="technicien">Technicien</option>
                <option value="client">Client</option>
              </select>
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
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDeleteUser}
        title="Supprimer l utilisateur"
        message="Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?"
        confirmText="Supprimer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
