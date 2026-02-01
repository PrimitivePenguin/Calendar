import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const storageService = {
  /**
   * Read data from a JSON file
   */
  read<T>(filename: string): T[] {
    const filepath = path.join(DATA_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      // Create empty file if it doesn't exist
      fs.writeFileSync(filepath, JSON.stringify([], null, 2));
      return [];
    }
    
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data) as T[];
  },

  /**
   * Write data to a JSON file
   */
  write<T>(filename: string, data: T[]): void {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  },

  /**
   * Find a single item by ID
   */
  findById<T extends { id: string }>(filename: string, id: string): T | undefined {
    const data = this.read<T>(filename);
    return data.find(item => item.id === id);
  },

  /**
   * Create a new item
   */
  create<T>(filename: string, item: T): T {
    const data = this.read<T>(filename);
    data.push(item);
    this.write(filename, data);
    return item;
  },

  /**
   * Update an existing item
   */
  update<T extends { id: string }>(filename: string, id: string, updates: Partial<T>): T | null {
    const data = this.read<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates };
    this.write(filename, data);
    return data[index];
  },

  /**
   * Delete an item by ID
   */
  delete<T extends { id: string }>(filename: string, id: string): boolean {
    const data = this.read<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    data.splice(index, 1);
    this.write(filename, data);
    return true;
  }
};