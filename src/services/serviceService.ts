import { fetchApi } from './api';
import { ServiceItem, ServiceStatus } from '../types';

export const serviceService = {
  getAll: () => fetchApi<ServiceItem[]>('/services'),
  getById: (id: string) => fetchApi<ServiceItem>(`/services/${id}`),
  assignTechnician: (serviceId: string, technicienId: string) =>
    fetchApi<{ message: string; service: ServiceItem }>(`/services/${serviceId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ technicienId }),
    }),
  updateStatus: (serviceId: string, statut: ServiceStatus, notes?: string) =>
    fetchApi<{ message: string; service: ServiceItem }>(`/services/${serviceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statut, notes }),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),
};
