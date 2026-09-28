import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800">404 - Page non trouvée</h1>
      <p className="text-slate-500 text-sm max-w-md">
        La page que vous recherchez n existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors"
      >
        <Home className="w-4 h-4 mr-2" /> Retour au tableau de bord
      </Link>
    </div>
  );
};
