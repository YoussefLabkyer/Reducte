import { fetchApi } from './api';
import { Client, Equipement } from '../types';

export const clientService = {
  getAll: () => fetchApi<Client[]>('/clients'),
  getById: (id: string) => fetchApi<Client>(`/clients/${id}`),
  getEquipements: (id: string) => fetchApi<Equipement[]>(`/clients/${id}/equipements`),
  create: (data: Omit<Client, 'id' | 'dateCreation'>) =>
    fetchApi<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, updates: Partial<Client>) =>
    fetchApi<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};
