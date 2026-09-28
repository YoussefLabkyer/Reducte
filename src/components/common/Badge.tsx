import React from 'react';
import { AccountStatus, PriorityLevel, ServiceStatus, UserRole } from '../../types';

interface BadgeProps {
  type?: 'status' | 'priority' | 'role' | 'service';
  value: AccountStatus | PriorityLevel | ServiceStatus | UserRole | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ value, className = '' }) => {
  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  // Account status & Service status
  if (value === 'Actif' || value === 'Terminée') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (value === 'En attente' || value === 'Nouvelle') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (value === 'Affectée' || value === 'En cours') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (value === 'Rejeté' || value === 'Désactivé' || value === 'Annulée') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  // Priorities
  if (value === 'Élevée') {
    colorClasses = 'bg-red-50 text-red-700 border-red-200 font-semibold';
  } else if (value === 'Moyenne') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (value === 'Faible') {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  // Roles
  if (value === 'admin') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
  } else if (value === 'technicien') {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium';
  } else if (value === 'client') {
    colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      {value}
    </span>
  );
};
