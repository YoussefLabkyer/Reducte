import { ServiceItem } from '../../src/types/index.js';
import { readJson, writeJson } from './jsonStore.js';

const FILENAME = 'services.json';

export class ServiceModel {
  static async findAll(): Promise<ServiceItem[]> {
    return readJson<ServiceItem>(FILENAME);
  }

  static async findById(id: string): Promise<ServiceItem | undefined> {
    const items = await this.findAll();
    return items.find(s => s.id === id);
  }

  static async findByDemandeId(demandeId: string): Promise<ServiceItem | undefined> {
    const items = await this.findAll();
    return items.find(s => s.demandeId === demandeId);
  }

  static async findByTechnicienId(technicienId: string): Promise<ServiceItem[]> {
    const items = await this.findAll();
    return items.filter(s => Boolean(s.technicienId) && s.technicienId === technicienId);
  }

  static async create(item: ServiceItem): Promise<ServiceItem> {
    const items = await this.findAll();
    items.push(item);
    await writeJson(FILENAME, items);
    return item;
  }

  static async update(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
    const items = await this.findAll();
    const index = items.findIndex(s => s.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    await writeJson(FILENAME, items);
    return items[index];
  }

  static async delete(id: string): Promise<boolean> {
    const items = await this.findAll();
    const filtered = items.filter(s => s.id !== id);
    if (filtered.length === items.length) return false;
    await writeJson(FILENAME, filtered);
    return true;
  }
}
