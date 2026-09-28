import { fetchApi } from './api';
import { DashboardStats } from '../types';

export const dashboardService = {
  getStats: () => fetchApi<DashboardStats>('/dashboard/stats'),
};
