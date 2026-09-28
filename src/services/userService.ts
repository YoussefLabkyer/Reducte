import { fetchApi } from './api';
import { UtilisateurDTO, UserRole, AccountStatus } from '../types';

export const userService = {
  getAll: () => fetchApi<UtilisateurDTO[]>('/utilisateurs'),
  getPending: () => fetchApi<UtilisateurDTO[]>('/utilisateurs/pending'),
  create: (data: { nom: string; email: string; motDePasse: string; role: UserRole }) =>
    fetchApi<UtilisateurDTO>('/utilisateurs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  validate: (id: string) =>
    fetchApi<{ message: string; user: UtilisateurDTO }>(`/utilisateurs/${id}/validate`, {
      method: 'POST',
    }),
  reject: (id: string) =>
    fetchApi<{ message: string; user: UtilisateurDTO }>(`/utilisateurs/${id}/reject`, {
      method: 'POST',
    }),
  update: (id: string, updates: Partial<UtilisateurDTO>) =>
    fetchApi<UtilisateurDTO>(`/utilisateurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  toggleStatus: (id: string, statut: AccountStatus) =>
    fetchApi<{ message: string; user: UtilisateurDTO }>(`/utilisateurs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/utilisateurs/${id}`, {
      method: 'DELETE',
    }),
};
