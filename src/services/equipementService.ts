import { fetchApi } from './api';
import { Equipement } from '../types';

export const equipementService = {
  getAll: (clientId?: string) => {
    const query = clientId ? `?clientId=${clientId}` : '';
    return fetchApi<Equipement[]>(`/equipements${query}`);
  },
  getById: (id: string) => fetchApi<Equipement>(`/equipements/${id}`),
  create: (data: Omit<Equipement, 'id'>) =>
    fetchApi<Equipement>('/equipements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Equipement>) =>
    fetchApi<Equipement>(`/equipements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/equipements/${id}`, {
      method: 'DELETE',
    }),
};
