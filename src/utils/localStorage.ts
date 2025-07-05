import { DSATopic, JournalEntry, SavingsEntry, SavingsGoal, DrawingData } from '../types';

const STORAGE_KEYS = {
  DSA_TOPICS: 'dsa-topics',
  JOURNAL_ENTRIES: 'journal-entries',
  SAVINGS_ENTRIES: 'savings-entries',
  SAVINGS_GOAL: 'savings-goal',
  DRAWINGS: 'drawings',
};

export const storageUtils = {
  // DSA Topics
  getDSATopics: (): DSATopic[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DSA_TOPICS);
    return data ? JSON.parse(data) : [];
  },
  saveDSATopics: (topics: DSATopic[]): void => {
    localStorage.setItem(STORAGE_KEYS.DSA_TOPICS, JSON.stringify(topics));
  },

  // Journal Entries
  getJournalEntries: (): JournalEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    return data ? JSON.parse(data) : [];
  },
  saveJournalEntries: (entries: JournalEntry[]): void => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
  },

  // Savings Entries
  getSavingsEntries: (): SavingsEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_ENTRIES);
    return data ? JSON.parse(data) : [];
  },
  saveSavingsEntries: (entries: SavingsEntry[]): void => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_ENTRIES, JSON.stringify(entries));
  },

  // Savings Goal
  getSavingsGoal: (): SavingsGoal | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL);
    return data ? JSON.parse(data) : null;
  },
  saveSavingsGoal: (goal: SavingsGoal): void => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL, JSON.stringify(goal));
  },

  // Drawings
  getDrawings: (): DrawingData[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DRAWINGS);
    return data ? JSON.parse(data) : [];
  },
  saveDrawings: (drawings: DrawingData[]): void => {
    localStorage.setItem(STORAGE_KEYS.DRAWINGS, JSON.stringify(drawings));
  },
};