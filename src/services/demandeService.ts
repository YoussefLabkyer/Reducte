import { fetchApi } from './api';
import { Demande, PriorityLevel } from '../types';

export const demandeService = {
  getAll: () => fetchApi<Demande[]>('/demandes'),
  getById: (id: string) => fetchApi<Demande>(`/demandes/${id}`),
  create: (data: { objet: string; description: string; priorite: PriorityLevel; equipementId: string; clientId?: string }) =>
    fetchApi<{ demande: Demande; serviceId: string }>('/demandes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Demande>) =>
    fetchApi<Demande>(`/demandes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  cancel: (id: string) =>
    fetchApi<{ message: string; demande: Demande }>(`/demandes/${id}/cancel`, {
      method: 'POST',
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/demandes/${id}`, {
      method: 'DELETE',
    }),
};
