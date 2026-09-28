import { Client } from '../../src/types/index.js';
import { readJson, writeJson } from './jsonStore.js';

const FILENAME = 'clients.json';

export class ClientModel {
  static async findAll(): Promise<Client[]> {
    return readJson<Client>(FILENAME);
  }

  static async findById(id: string): Promise<Client | undefined> {
    const clients = await this.findAll();
    return clients.find(c => c.id === id);
  }

  static async findByUserId(userId: string): Promise<Client | undefined> {
    const clients = await this.findAll();
    return clients.find(c => c.userId === userId);
  }

  static async findByEmail(email: string): Promise<Client | undefined> {
    const clients = await this.findAll();
    return clients.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
  }

  static async create(client: Client): Promise<Client> {
    const clients = await this.findAll();
    clients.push(client);
    await writeJson(FILENAME, clients);
    return client;
  }

  static async update(id: string, updates: Partial<Client>): Promise<Client | null> {
    const clients = await this.findAll();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    clients[index] = { ...clients[index], ...updates };
    await writeJson(FILENAME, clients);
    return clients[index];
  }

  static async delete(id: string): Promise<boolean> {
    const clients = await this.findAll();
    const filtered = clients.filter(c => c.id !== id);
    if (filtered.length === clients.length) return false;

    await writeJson(FILENAME, filtered);
    return true;
  }
}
