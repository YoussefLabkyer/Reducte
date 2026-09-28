import { fetchApi } from './api';
import { AuthResponse } from '../types';

export const authService = {
  login: (email: string, motDePasse: string) => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });
  },

  register: (data: {
    nom: string;
    prenom: string;
    societe: string;
    adresse: string;
    telephone: string;
    email: string;
    motDePasse: string;
  }) => {
    return fetchApi<{ message: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me: () => {
    return fetchApi<AuthResponse>('/auth/me');
  },

  changePassword: (ancienMotDePasse: string, nouveauMotDePasse: string) => {
    return fetchApi<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
    });
  },
};
