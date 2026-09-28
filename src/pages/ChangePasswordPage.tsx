import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { changePassword } = useAuth();
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (nouveau !== confirmation) {
      setError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const authService = (await import('../services/authService')).authService;
      const res = await authService.changePassword(ancien, nouveau);
      setMessage(res.message);
      setAncien('');
      setNouveau('');
      setConfirmation('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modification du mot de passe</h1>
        <p className="text-sm text-slate-500">
          Changer votre mot de passe pour sécuriser votre compte Reducte
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        {message && (
          <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              required
              value={ancien}
              onChange={e => setAncien(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={nouveau}
              onChange={e => setNouveau(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              required
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Modification...' : 'Changer mon mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};
