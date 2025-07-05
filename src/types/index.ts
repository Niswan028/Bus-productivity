export interface DSATopic {
  id: string;
  topic: string;
  status: 'not-started' | 'in-progress' | 'completed';
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
}

export interface SavingsEntry {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'saved' | 'spent';
}

export interface SavingsGoal {
  monthlyTarget: number;
  currentMonth: string;
}

export interface DrawingData {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: string;
}

export type Theme = 'light' | 'dark';

export type ActiveSection = 'whiteboard' | 'dsa' | 'journal' | 'savings';