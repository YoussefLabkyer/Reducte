import { UserModel } from '../models/userModel.js';
import { ClientModel } from '../models/clientModel.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { UtilisateurDTO, AuthResponse } from '../../src/types/index.js';

export class AuthService {
  static async registerClient(data: {
    nom: string;
    prenom: string;
    societe: string;
    adresse: string;
    telephone: string;
    email: string;
    motDePasse: string;
  }): Promise<{ message: string; userId: string }> {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw { status: 400, message: 'Un compte avec cette adresse email existe déjà.' };
    }

    const hashedPassword = await hashPassword(data.motDePasse);
    const userId = 'usr-' + Date.now();

    // 1. Create user in pending state
    const newUser = await UserModel.create({
      id: userId,
      nom: `${data.prenom} ${data.nom}`,
      email: data.email.trim(),
      motDePasse: hashedPassword,
      role: 'client',
      statut: 'En attente',
      dateCreation: new Date().toISOString()
    });

    // 2. Create client record linked to userId
    await ClientModel.create({
      id: 'cli-' + Date.now(),
      userId: newUser.id,
      nom: data.nom,
      prenom: data.prenom,
      societe: data.societe,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email.trim(),
      dateCreation: new Date().toISOString()
    });

    return {
      message: 'Inscription enregistrée avec succès. Votre compte est en attente de validation par un administrateur.',
      userId: newUser.id
    };
  }

  static async login(email: string, motDePasse: string): Promise<AuthResponse> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Identifiants incorrects.' };
    }

    const isValid = await comparePassword(motDePasse, user.motDePasse);
    if (!isValid) {
      throw { status: 401, message: 'Identifiants incorrects.' };
    }

    if (user.statut === 'En attente') {
      throw { status: 403, message: 'Votre compte est en attente de validation par un administrateur.' };
    }

    if (user.statut === 'Rejeté') {
      throw { status: 403, message: 'Votre demande d inscription a été rejetée.' };
    }

    if (user.statut === 'Désactivé') {
      throw { status: 403, message: 'Votre compte a été désactivé.' };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      statut: user.statut
    });

    const userDto: UtilisateurDTO = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      statut: user.statut,
      dateCreation: user.dateCreation
    };

    let clientRecord = undefined;
    if (user.role === 'client') {
      clientRecord = await ClientModel.findByUserId(user.id);
    }

    return { token, user: userDto, client: clientRecord };
  }

  static async changePassword(userId: string, ancienMotDePasse: string, nouveauMotDePasse: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }

    const isValid = await comparePassword(ancienMotDePasse, user.motDePasse);
    if (!isValid) {
      throw { status: 400, message: 'Ancien mot de passe incorrect.' };
    }

    const newHashed = await hashPassword(nouveauMotDePasse);
    await UserModel.update(userId, { motDePasse: newHashed });
  }
}
