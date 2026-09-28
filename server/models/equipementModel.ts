import { Equipement } from '../../src/types/index.js';
import { readJson, writeJson } from './jsonStore.js';

const FILENAME = 'equipements.json';

export class EquipementModel {
  static async findAll(): Promise<Equipement[]> {
    return readJson<Equipement>(FILENAME);
  }

  static async findById(id: string): Promise<Equipement | undefined> {
    const items = await this.findAll();
    return items.find(e => e.id === id);
  }

  static async findByClientId(clientId: string): Promise<Equipement[]> {
    const items = await this.findAll();
    return items.filter(e => e.clientId === clientId);
  }

  static async create(item: Equipement): Promise<Equipement> {
    const items = await this.findAll();
    items.push(item);
    await writeJson(FILENAME, items);
    return item;
  }

  static async update(id: string, updates: Partial<Equipement>): Promise<Equipement | null> {
    const items = await this.findAll();
    const index = items.findIndex(e => e.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    await writeJson(FILENAME, items);
    return items[index];
  }

  static async delete(id: string): Promise<boolean> {
    const items = await this.findAll();
    const filtered = items.filter(e => e.id !== id);
    if (filtered.length === items.length) return false;

    await writeJson(FILENAME, filtered);
    return true;
  }
}
