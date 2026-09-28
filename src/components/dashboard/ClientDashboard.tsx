import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { equipementService } from '../../services/equipementService';
import { demandeService } from '../../services/demandeService';
import { DashboardStats, Equipement, Demande, PriorityLevel } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  Laptop,
  UserCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  HardDrive,
  FileText,
  Plus,
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { user, client } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading] = useState(true);

  // New Request Modal state
  const [isNewDemandeOpen, setIsNewDemandeOpen] = useState(false);
  const [demandeForm, setDemandeForm] = useState({
    objet: '',
    description: '',
    priorite: 'Moyenne' as PriorityLevel,
    equipementId: '',
  });
  const [submittingDemande, setSubmittingDemande] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Equipment Modal state
  const [isNewEquipementOpen, setIsNewEquipementOpen] = useState(false);
  const [equipementForm, setEquipementForm] = useState({
    nom: '',
    categorie: 'PC Portable',
    marque: '',
    modele: '',
    numeroSerie: '',
    dateInstallation: new Date().toISOString().split('T')[0],
  });
  const [submittingEquipement, setSubmittingEquipement] = useState(false);

  const categories = [
    'PC Portable',
    'PC Fixe',
    'Serveur',
    'Imprimante',
    'Scanner',
    'Réseau (Switch/Routeur)',
    'Sécurité (Pare-feu)',
    'Périphérique',
    'Autre',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4500);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  const loadData = async () => {
    try {
      const [statsData, eqData] = await Promise.all([
        dashboardService.getStats(),
        equipementService.getAll().catch(() => []),
      ]);
      setStats(statsData);
      setEquipements(eqData);
      if (eqData.length > 0) {
        setDemandeForm(f => ({ ...f, equipementId: eqData[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement tableau de bord client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandeForm.objet.trim() || !demandeForm.description.trim()) {
      showError("Veuillez renseigner l'objet et la description de votre demande.");
      return;
    }
    if (!demandeForm.equipementId && equipements.length > 0) {
      demandeForm.equipementId = equipements[0].id;
    }
    if (!demandeForm.equipementId) {
      showError("Veuillez d'abord enregistrer un équipement avant de créer une demande.");
      return;
    }

    setSubmittingDemande(true);
    try {
      await demandeService.create({
        objet: demandeForm.objet.trim(),
        description: demandeForm.description.trim(),
        priorite: demandeForm.priorite,
        equipementId: demandeForm.equipementId,
        clientId: client?.id,
      });

      setIsNewDemandeOpen(false);
      setDemandeForm({
        objet: '',
        description: '',
        priorite: 'Moyenne',
        equipementId: equipements[0]?.id || '',
      });
      showSuccess('Votre demande de service a été créée avec succès !');
      await loadData();
    } catch (err: any) {
      showError(err.message || 'Erreur lors de la création de la demande.');
    } finally {
      setSubmittingDemande(false);
    }
  };

  const handleCreateEquipement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipementForm.nom.trim() || !equipementForm.marque.trim() || !equipementForm.modele.trim()) {
      showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSubmittingEquipement(true);
    try {
      await equipementService.create({
        ...equipementForm,
        clientId: client?.id || '',
      });

      setIsNewEquipementOpen(false);
      setEquipementForm({
        nom: '',
        categorie: 'PC Portable',
        marque: '',
        modele: '',
        numeroSerie: '',
        dateInstallation: new Date().toISOString().split('T')[0],
      });
      showSuccess('Votre équipement a été ajouté avec succès.');
      await loadData();
    } catch (err: any) {
      showError(err.message || "Erreur lors de l'ajout de l'équipement.");
    } finally {
      setSubmittingEquipement(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const clientStats = stats?.clientStats || {
    enAttente: (stats?.demandesParStatut?.['Nouvelle'] || 0) + (stats?.demandesParStatut?.['Affectée'] || 0),
    enCours: stats?.demandesParStatut?.['En cours'] || 0,
    terminees: stats?.demandesParStatut?.['Terminée'] || 0,
    annulees: stats?.demandesParStatut?.['Annulée'] || 0,
    total: stats?.nbDemandes || 0,
  };

  const derniereDemande = stats?.derniereDemande || (stats?.dernieresDemandes && stats.dernieresDemandes.length > 0 ? stats.dernieresDemandes[0] : null);
  const displayEquipements = equipements.length > 0 ? equipements : (stats?.clientEquipements || []);

  const clientNomComplet = client
    ? `${client.prenom} ${client.nom}`
    : user?.nom || 'Client';
  const clientSociete = client?.societe || 'Société Partenaire';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-xs">
          <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center shadow-xs">
          <AlertCircle className="w-5 h-5 mr-3 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{actionError}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-7 sm:p-8 rounded-2xl border border-slate-700 shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Mon espace client
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {clientSociete}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bonjour, {clientNomComplet} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Bienvenue sur votre portail d'assistance informatique Reducte. Suivez vos équipements, vos tickets d'intervention et déclarez un nouvel incident en quelques clics.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewDemandeOpen(true)}
              className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/40 transition-all transform active:scale-98 cursor-pointer group"
            >
              <PlusCircle className="w-5 h-5 mr-2.5 transition-transform group-hover:rotate-90" />
              Créer une demande de service
            </button>
            <Link
              to="/demandes"
              className="inline-flex items-center justify-center px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-600/60 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              Historique
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Section 1: Statistiques des propres demandes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Suivi de vos demandes de service</h2>
            <p className="text-xs text-slate-500">Statut en direct de l'ensemble de vos sollicitations</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Total : {clientStats.total} {clientStats.total > 1 ? 'demandes' : 'demande'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* En attente */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">En attente</span>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">{clientStats.enAttente}</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Prise en charge
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Nouvelles & en attente d'affectation</p>
          </div>

          {/* En cours */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">En cours</span>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-600">{clientStats.enCours}</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Intervention active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">En cours de traitement technique</p>
          </div>

          {/* Terminées */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Terminées</span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-emerald-600">{clientStats.terminees}</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Résolues
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Interventions clôturées avec succès</p>
          </div>

          {/* Annulées */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Annulées</span>
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-700">{clientStats.annulees}</span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Non traitées
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Demandes annulées ou caduques</p>
          </div>
        </div>
      </div>

      {/* Grid: Dernière Demande & Informations Client */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highlight Card: Dernière Demande avec Statut et Technicien */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-base">Votre dernière demande de service</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Détail du dernier ticket soumis et technicien en charge</p>
            </div>
            <Link
              to="/demandes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {derniereDemande ? (
              <div className="space-y-5">
                {/* Header with Title and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{derniereDemande.objet}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Créée le {new Date(derniereDemande.dateCreation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge value={derniereDemande.priorite} />
                    <Badge value={derniereDemande.statut} />
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed">
                  <p className="font-medium text-xs text-slate-500 uppercase tracking-wider mb-1">Description du problème :</p>
                  <p className="text-slate-800">{derniereDemande.description}</p>
                </div>

                {/* Meta details grid: Equipement & Technicien */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Equipment detail */}
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-white flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 block font-medium">Équipement concerné</span>
                      <span className="text-sm font-semibold text-slate-800 truncate block">
                        {derniereDemande.equipementNom || 'Équipement client'}
                      </span>
                    </div>
                  </div>

                  {/* Technician detail */}
                  <div className={`p-3.5 rounded-xl border ${derniereDemande.technicienNom ? 'border-indigo-100 bg-indigo-50/30' : 'border-amber-100 bg-amber-50/30'} flex items-center gap-3`}>
                    <div className={`p-2.5 rounded-lg ${derniereDemande.technicienNom ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'} shrink-0`}>
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 block font-medium">Technicien affecté</span>
                      {derniereDemande.technicienNom ? (
                        <span className="text-sm font-bold text-indigo-900 truncate block">
                          {derniereDemande.technicienNom}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-amber-700 block">
                          En attente d'affectation
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {derniereDemande.notes && (
                  <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-semibold">Note d'intervention :</span> {derniereDemande.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base">Aucune demande enregistrée</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Vous n'avez pas encore soumis de demande d'assistance technique. Cliquez ci-dessous pour ouvrir votre premier ticket.
                </p>
                <button
                  onClick={() => setIsNewDemandeOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Créer ma première demande
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Client Profile & Quick Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                {client?.prenom?.[0] || user?.nom?.[0] || 'C'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{clientNomComplet}</h3>
                <p className="text-xs text-slate-500 font-medium">{clientSociete}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 pt-2 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Email :</span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]">
                  {client?.email || user?.email}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Téléphone :</span>
                <span className="font-medium text-slate-800">
                  {client?.telephone || 'Non renseigné'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Adresse :</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">
                  {client?.adresse || 'Maroc'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Statut du compte :</span>
                <span className="inline-flex items-center font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Actif
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
            <button
              onClick={() => setIsNewDemandeOpen(true)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Créer une demande de service
            </button>
            <button
              onClick={() => setIsNewEquipementOpen(true)}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              Ajouter un équipement
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Ses Équipements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Vos équipements sous contrat</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Parc informatique enregistré et couvert par l'assistance technique
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewEquipementOpen(true)}
              className="inline-flex items-center px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Ajouter un équipement
            </button>
            <Link
              to="/equipements"
              className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            >
              Voir la liste complète <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {displayEquipements.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Laptop className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Aucun équipement enregistré</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Enregistrez vos matériels (ordinateurs, serveurs, routeurs, etc.) pour pouvoir déclarer des incidents et demander une maintenance.
            </p>
            <button
              onClick={() => setIsNewEquipementOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Ajouter mon premier équipement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {displayEquipements.slice(0, 6).map(eq => (
              <div
                key={eq.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-100/70 text-blue-800">
                      {eq.categorie}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {eq.numeroSerie || 'S/N: N/A'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {eq.nom}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {eq.marque} • <span className="font-medium text-slate-700">{eq.modele}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Installé le : {eq.dateInstallation || 'N/A'}</span>
                  <button
                    onClick={() => {
                      setDemandeForm(f => ({ ...f, equipementId: eq.id }));
                      setIsNewDemandeOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Demander support <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Créer une demande de service */}
      <Modal
        isOpen={isNewDemandeOpen}
        onClose={() => setIsNewDemandeOpen(false)}
        title="Créer une demande de service"
      >
        <form onSubmit={handleCreateDemande} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Équipement concerné *
            </label>
            {equipements.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-2">
                Vous n'avez pas encore d'équipement enregistré.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewDemandeOpen(false);
                    setIsNewEquipementOpen(true);
                  }}
                  className="font-bold underline cursor-pointer"
                >
                  Ajouter un équipement d'abord
                </button>
              </div>
            ) : (
              <select
                value={demandeForm.equipementId}
                onChange={e => setDemandeForm({ ...demandeForm, equipementId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                {equipements.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom} ({eq.marque} {eq.modele}) - {eq.categorie}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Objet de la demande *
            </label>
            <input
              type="text"
              placeholder="Ex: Panne de connexion réseau, Écran noir, Lenteur système..."
              value={demandeForm.objet}
              onChange={e => setDemandeForm({ ...demandeForm, objet: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Niveau d'urgence / Priorité *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Faible', 'Moyenne', 'Élevée'] as PriorityLevel[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDemandeForm({ ...demandeForm, priorite: p })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    demandeForm.priorite === p
                      ? p === 'Élevée'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : p === 'Moyenne'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-100 border-slate-400 text-slate-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description détaillée du problème *
            </label>
            <textarea
              rows={4}
              placeholder="Décrivez précisément le dysfonctionnement constaté, les messages d'erreur affichés et les circonstances..."
              value={demandeForm.description}
              onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewDemandeOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submittingDemande || equipements.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingDemande ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Ajouter un équipement */}
      <Modal
        isOpen={isNewEquipementOpen}
        onClose={() => setIsNewEquipementOpen(false)}
        title="Ajouter un équipement"
      >
        <form onSubmit={handleCreateEquipement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom de l'équipement *
            </label>
            <input
              type="text"
              placeholder="Ex: PC Direction, Routeur BGP, Serveur Stockage..."
              value={equipementForm.nom}
              onChange={e => setEquipementForm({ ...equipementForm, nom: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catégorie *
              </label>
              <select
                value={equipementForm.categorie}
                onChange={e => setEquipementForm({ ...equipementForm, categorie: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date d'installation
              </label>
              <input
                type="date"
                value={equipementForm.dateInstallation}
                onChange={e => setEquipementForm({ ...equipementForm, dateInstallation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Marque *
              </label>
              <input
                type="text"
                placeholder="Ex: Dell, Lenovo, HP, Cisco..."
                value={equipementForm.marque}
                onChange={e => setEquipementForm({ ...equipementForm, marque: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Modèle *
              </label>
              <input
                type="text"
                placeholder="Ex: Latitude 5520, ThinkPad X1..."
                value={equipementForm.modele}
                onChange={e => setEquipementForm({ ...equipementForm, modele: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Numéro de Série (S/N)
            </label>
            <input
              type="text"
              placeholder="Ex: SN-98432-XYZ"
              value={equipementForm.numeroSerie}
              onChange={e => setEquipementForm({ ...equipementForm, numeroSerie: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewEquipementOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submittingEquipement}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {submittingEquipement ? 'Ajout en cours...' : 'Ajouter l équipement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
