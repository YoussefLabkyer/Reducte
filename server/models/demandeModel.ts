import { Demande } from '../../src/types/index.js';
import { readJson, writeJson } from './jsonStore.js';

const FILENAME = 'demandes.json';

export class DemandeModel {
  static async findAll(): Promise<Demande[]> {
    return readJson<Demande>(FILENAME);
  }

  static async findById(id: string): Promise<Demande | undefined> {
    const items = await this.findAll();
    return items.find(d => d.id === id);
  }

  static async findByClientId(clientId: string): Promise<Demande[]> {
    const items = await this.findAll();
    return items.filter(d => d.clientId === clientId);
  }

  static async create(item: Demande): Promise<Demande> {
    const items = await this.findAll();
    items.push(item);
    await writeJson(FILENAME, items);
    return item;
  }

  static async update(id: string, updates: Partial<Demande>): Promise<Demande | null> {
    const items = await this.findAll();
    const index = items.findIndex(d => d.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    await writeJson(FILENAME, items);
    return items[index];
  }

  static async delete(id: string): Promise<boolean> {
    const items = await this.findAll();
    const filtered = items.filter(d => d.id !== id);
    if (filtered.length === items.length) return false;
    await writeJson(FILENAME, filtered);
    return true;
  }
}
