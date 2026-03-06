import fs from 'fs';
import path from 'path';
import { Innovation } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'innovations.json');

export function getInnovations(): Innovation[] {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function getInnovationById(id: number): Innovation | undefined {
  return getInnovations().find((item) => item.id === id);
}

export function addInnovation(data: Omit<Innovation, 'id'>): Innovation {
  const innovations = getInnovations();
  const maxId = innovations.reduce((max, item) => Math.max(max, item.id), 0);
  const newItem: Innovation = { id: maxId + 1, ...data };
  innovations.push(newItem);
  fs.writeFileSync(DATA_PATH, JSON.stringify(innovations, null, 2), 'utf-8');
  return newItem;
}

export function updateInnovation(id: number, data: Partial<Omit<Innovation, 'id'>>): Innovation | null {
  const innovations = getInnovations();
  const index = innovations.findIndex((item) => item.id === id);
  if (index === -1) return null;
  innovations[index] = { ...innovations[index], ...data };
  fs.writeFileSync(DATA_PATH, JSON.stringify(innovations, null, 2), 'utf-8');
  return innovations[index];
}

export function deleteInnovation(id: number): boolean {
  const innovations = getInnovations();
  const filtered = innovations.filter((item) => item.id !== id);
  if (filtered.length === innovations.length) return false;
  fs.writeFileSync(DATA_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
