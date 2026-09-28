import { Utilisateur } from '../../src/types/index.js';
import { readJson, writeJson } from './jsonStore.js';

const FILENAME = 'utilisateurs.json';

export class UserModel {
  static async findAll(): Promise<Utilisateur[]> {
    return readJson<Utilisateur>(FILENAME);
  }

  static async findById(id: string): Promise<Utilisateur | undefined> {
    const users = await this.findAll();
    return users.find(u => u.id === id);
  }

  static async findByEmail(email: string): Promise<Utilisateur | undefined> {
    const users = await this.findAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  static async create(user: Utilisateur): Promise<Utilisateur> {
    const users = await this.findAll();
    users.push(user);
    await writeJson(FILENAME, users);
    return user;
  }

  static async update(id: string, updates: Partial<Utilisateur>): Promise<Utilisateur | null> {
    const users = await this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    await writeJson(FILENAME, users);
    return users[index];
  }

  static async updateStatus(id: string, statut: Utilisateur['statut']): Promise<Utilisateur | null> {
    return this.update(id, { statut });
  }

  static async delete(id: string): Promise<boolean> {
    const users = await this.findAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    await writeJson(FILENAME, filtered);
    return true;
  }
}
