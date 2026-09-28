import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { ClientDashboard } from '../components/dashboard/ClientDashboard';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  ClipboardList,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // For Client role, render the specialized Mon espace client dashboard
  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  // Chart 1: Demandes par Statut
  const statutData = {
    labels: ['Nouvelle', 'Affectée', 'En cours', 'Terminée', 'Annulée'],
    datasets: [
      {
        label: 'Nombre de demandes',
        data: [
          stats?.demandesParStatut?.['Nouvelle'] || 0,
          stats?.demandesParStatut?.['Affectée'] || 0,
          stats?.demandesParStatut?.['En cours'] || 0,
          stats?.demandesParStatut?.['Terminée'] || 0,
          stats?.demandesParStatut?.['Annulée'] || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          '#3b82f6',
          '#6366f1',
          '#f59e0b',
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Chart 2: Répartition par Priorité
  const prioriteData = {
    labels: ['Faible', 'Moyenne', 'Élevée'],
    datasets: [
      {
        data: [
          stats?.demandesParPriorite?.['Faible'] || 0,
          stats?.demandesParPriorite?.['Moyenne'] || 0,
          stats?.demandesParPriorite?.['Élevée'] || 0,
        ],
        backgroundColor: [
          '#94a3b8',
          '#3b82f6',
          '#ef4444',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        cornerRadius: 8,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour, {user?.nom} 👋
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 capitalize">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === 'technicien'
              ? 'Suivi en direct de vos interventions affectées et indicateurs de traitement.'
              : 'Aperçu analytique et indicateurs clés de la plateforme de maintenance Reducte.'}
          </p>
        </div>
      </div>

      {/* Modern Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Clients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clients</span>
            <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-800">{stats?.nbClients || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">Sociétés & partenaires</span>
          </div>
        </div>

        {/* Techniciens */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Techniciens</span>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-800">{stats?.nbTechniciens || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">Agents d'intervention actifs</span>
          </div>
        </div>

        {/* Demandes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {user?.role === 'technicien' ? 'Mes demandes' : 'Demandes'}
            </span>
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-800">{stats?.nbDemandes || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">
              {user?.role === 'technicien' ? 'Demandes qui vous sont affectées' : 'Total des tickets créés'}
            </span>
          </div>
        </div>

        {/* Services en cours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {user?.role === 'technicien' ? 'En cours' : 'Services en cours'}
            </span>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-amber-600">{stats?.nbServicesEnCours || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">
              {user?.role === 'technicien' ? 'Vos interventions en cours' : 'Interventions en cours'}
            </span>
          </div>
        </div>

        {/* Services terminés */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {user?.role === 'technicien' ? 'Terminées' : 'Services terminés'}
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-emerald-600">{stats?.nbServicesTermines || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">
              {user?.role === 'technicien' ? 'Vos interventions résolues' : 'Interventions résolues'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics / Chart.js Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Demandes par Statut */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Répartition des demandes par statut
              </h3>
              <p className="text-xs text-slate-500">Volume de tickets par étape de traitement</p>
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Chart.js
            </span>
          </div>
          <div className="h-64 w-full">
            <Bar data={statutData} options={barOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Priorité des Demandes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base flex items-center">
                <PieIcon className="w-5 h-5 mr-2 text-purple-600" />
                Niveau de priorité
              </h3>
              <p className="text-xs text-slate-500">Distribution de l'urgence</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut data={prioriteData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Latest Requests Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Dernières demandes de services</h3>
            <p className="text-xs text-slate-500">Aperçu chronologique des plus récentes demandes soumises</p>
          </div>
          <Link
            to="/demandes"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center cursor-pointer"
          >
            Voir toutes les demandes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {!stats?.dernieresDemandes || stats.dernieresDemandes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Aucune demande de service enregistrée pour le moment.
            </div>
          ) : (
            stats.dernieresDemandes.map(demande => (
              <div
                key={demande.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{demande.objet}</span>
                    <Badge value={demande.priorite} />
                    <Badge value={demande.statut} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{demande.description}</p>
                  <p className="text-xs text-slate-400">
                    Client: <span className="text-slate-600 font-medium">{demande.clientNom}</span> • Équipement: <span className="text-slate-600 font-medium">{demande.equipementNom}</span>
                  </p>
                </div>

                <div className="text-xs text-slate-400 shrink-0 font-mono">
                  {new Date(demande.dateCreation).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

