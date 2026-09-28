import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');

async function ensureDataDirExists() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory exists or created
  }
}

export async function readJson<T>(filename: string): Promise<T[]> {
  await ensureDataDirExists();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  } catch (error) {
    // If file does not exist, return empty array
    return [];
  }
}

export async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDirExists();
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}
