import { UserModel } from '../models/userModel.js';
import { hashPassword } from '../utils/password.js';
import { Utilisateur, UtilisateurDTO, UserRole, AccountStatus } from '../../src/types/index.js';

export class UserService {
  static async getAllUsers(): Promise<UtilisateurDTO[]> {
    const users = await UserModel.findAll();
    return users.map(u => ({
      id: u.id,
      nom: u.nom,
      email: u.email,
      role: u.role,
      statut: u.statut,
      dateCreation: u.dateCreation
    }));
  }

  static async getPendingUsers(): Promise<UtilisateurDTO[]> {
    const users = await UserModel.findAll();
    return users
      .filter(u => u.statut === 'En attente')
      .map(u => ({
        id: u.id,
        nom: u.nom,
        email: u.email,
        role: u.role,
        statut: u.statut,
        dateCreation: u.dateCreation
      }));
  }

  static async createUser(data: {
    nom: string;
    email: string;
    motDePasse: string;
    role: UserRole;
  }): Promise<UtilisateurDTO> {
    const existing = await UserModel.findByEmail(data.email);
    if (existing) {
      throw { status: 400, message: 'Un utilisateur avec cet email existe déjà.' };
    }

    const hashed = await hashPassword(data.motDePasse);
    const user: Utilisateur = {
      id: 'usr-' + Date.now(),
      nom: data.nom,
      email: data.email.trim(),
      motDePasse: hashed,
      role: data.role,
      statut: 'Actif',
      dateCreation: new Date().toISOString()
    };

    const created = await UserModel.create(user);
    return {
      id: created.id,
      nom: created.nom,
      email: created.email,
      role: created.role,
      statut: created.statut,
      dateCreation: created.dateCreation
    };
  }

  static async validateRegistration(userId: string): Promise<UtilisateurDTO> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }

    const updated = await UserModel.updateStatus(userId, 'Actif');
    if (!updated) {
      throw { status: 500, message: 'Erreur lors de la mise à jour.' };
    }

    return {
      id: updated.id,
      nom: updated.nom,
      email: updated.email,
      role: updated.role,
      statut: updated.statut,
      dateCreation: updated.dateCreation
    };
  }

  static async rejectRegistration(userId: string): Promise<UtilisateurDTO> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }

    const updated = await UserModel.updateStatus(userId, 'Rejeté');
    if (!updated) {
      throw { status: 500, message: 'Erreur lors de la mise à jour.' };
    }

    return {
      id: updated.id,
      nom: updated.nom,
      email: updated.email,
      role: updated.role,
      statut: updated.statut,
      dateCreation: updated.dateCreation
    };
  }

  static async updateUser(userId: string, updates: { nom?: string; email?: string; role?: UserRole }): Promise<UtilisateurDTO> {
    const updated = await UserModel.update(userId, updates);
    if (!updated) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }

    return {
      id: updated.id,
      nom: updated.nom,
      email: updated.email,
      role: updated.role,
      statut: updated.statut,
      dateCreation: updated.dateCreation
    };
  }

  static async toggleUserStatus(userId: string, statut: AccountStatus): Promise<UtilisateurDTO> {
    const updated = await UserModel.updateStatus(userId, statut);
    if (!updated) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }

    return {
      id: updated.id,
      nom: updated.nom,
      email: updated.email,
      role: updated.role,
      statut: updated.statut,
      dateCreation: updated.dateCreation
    };
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const deleted = await UserModel.delete(userId);
    if (!deleted) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }
    return true;
  }
}
