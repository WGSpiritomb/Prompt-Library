import { Mix, MixFormData } from '../types';
import { STORAGE_KEY } from '../constants';

export const getMixes = (): Mix[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load mixes', e);
    return [];
  }
};

export const saveMixes = (mixes: Mix[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
  } catch (e) {
    console.error('Failed to save mixes', e);
  }
};

const generateId = (): string => {
  // Use crypto.randomUUID if available (modern browsers, https)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto is not available
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createMix = (data: MixFormData): Mix => {
  return {
    id: generateId(),
    createdAt: Date.now(),
    ...data,
  };
};