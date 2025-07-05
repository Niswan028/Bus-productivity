import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { storageUtils } from '../utils/localStorage';
import { SavingsEntry, SavingsGoal } from '../types';

const Savings: React.FC = () => {
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'saved' | 'spent'>('saved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingType, setEditingType] = useState<'saved' | 'spent'>('saved');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    const loadedEntries = storageUtils.getSavingsEntries();
    const loadedGoal = storageUtils.getSavingsGoal();
    setEntries(loadedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setGoal(loadedGoal);
  }, []);

  const saveEntries = (updatedEntries: SavingsEntry[]) => {
    const sortedEntries = updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(sortedEntries);
    storageUtils.saveSavingsEntries(sortedEntries);
  };

  const addEntry = () => {
    if (newAmount && newDescription.trim()) {
      const entry: SavingsEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(newAmount),
        description: newDescription.trim(),
        type: newType,
      };
      saveEntries([...entries, entry]);
      setNewAmount('');
      setNewDescription('');
      setNewType('saved');
    }
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  };

  const startEdit = (entry: SavingsEntry) => {
    setEditingId(entry.id);
    setEditingAmount(entry.amount.toString());
    setEditingDescription(entry.description);
    setEditingType(entry.type);
  };

  const saveEdit = () => {
    if (editingAmount && editingDescription.trim()) {
      const updatedEntries = entries.map(entry =>
        entry.id === editingId 
          ? { 
              ...entry, 
              amount: parseFloat(editingAmount), 
              description: editingDescription.trim(),
              type: editingType
            } 
          : entry
      );
      saveEntries(updatedEntries);
    }
    setEditingId(null);
    setEditingAmount('');
    setEditingDescription('');
    setEditingType('saved');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingAmount('');
    setEditingDescription('');
    setEditingType('saved');
  };

  const setMonthlyGoal = () => {
    if (newGoal) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const goalData: SavingsGoal = {
        monthlyTarget: parseFloat(newGoal),
        currentMonth,
      };
      setGoal(goalData);
      storageUtils.saveSavingsGoal(goalData);
      setNewGoal('');
    }
  };

  const calculateTotals = () => {
    const totalSaved = entries.filter(e => e.type === 'saved').reduce((sum, e) => sum + e.amount, 0);
    const totalSpent = entries.filter(e => e.type === 'spent').reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalSaved - totalSpent;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthEntries = entries.filter(e => e.date.startsWith(currentMonth));
    const thisMonthSaved = thisMonthEntries.filter(e => e.type === 'saved').reduce((sum, e) => sum + e.amount, 0);
    const thisMonthSpent = thisMonthEntries.filter(e => e.type === 'spent').reduce((sum, e) => sum + e.amount, 0);
    const thisMonthNet = thisMonthSaved - thisMonthSpent;
    
    return { totalSaved, totalSpent, netSavings, thisMonthSaved, thisMonthSpent, thisMonthNet };
  };

  const totals = calculateTotals();

  const getProgressPercentage = () => {
    if (!goal) return 0;
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (goal.currentMonth !== currentMonth) return 0;
    return Math.min((totals.thisMonthNet / goal.monthlyTarget) * 100, 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Savings Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your daily savings and expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Total Saved
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totals.totalSaved.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            Total Spent
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">${totals.totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="text-blue-600" size={20} />
            Net Savings
          </h3>
          <p className={`text-3xl font-bold ${totals.netSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${totals.netSavings.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="text-purple-600" size={20} />
            This Month
          </h3>
          <p className={`text-3xl font-bold ${totals.thisMonthNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${totals.thisMonthNet.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Monthly Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Savings Goal</h3>
        {goal && goal.currentMonth === new Date().toISOString().slice(0, 7) ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Target: ${goal.monthlyTarget.toFixed(2)}</span>
              <span className="text-gray-600 dark:text-gray-400">
                Progress: ${totals.thisMonthNet.toFixed(2)} ({getProgressPercentage().toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  getProgressPercentage() >= 100 
                    ? 'bg-gradient-to-r from-green-500 to-blue-600' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                }`}
                style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
              />
            </div>
            <button
              onClick={() => setGoal(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Update Goal
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter monthly savings target"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={setMonthlyGoal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Set Goal
            </button>
          </div>
        )}
      </div>

      {/* Add New Entry */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'saved' | 'spent')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="saved">Saved</option>
              <option value="spent">Spent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addEntry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Entries</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {entries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No entries yet. Add your first savings or expense entry to get started!
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${entry.type === 'saved' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      {entry.type === 'saved' ? (
                        <TrendingUp className="text-green-600 dark:text-green-400" size={16} />
                      ) : (
                        <TrendingDown className="text-red-600 dark:text-red-400" size={16} />
                      )}
                    </div>
                    <div>
                      {editingId === entry.id ? (
                        <div className="flex space-x-2">
                          <select
                            value={editingType}
                            onChange={(e) => setEditingType(e.target.value as 'saved' | 'spent')}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="saved">Saved</option>
                            <option value="spent">Spent</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={editingAmount}
                            onChange={(e) => setEditingAmount(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {entry.description}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-xl font-bold ${entry.type === 'saved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {entry.type === 'saved' ? '+' : '-'}${entry.amount.toFixed(2)}
                    </span>
                    {editingId !== entry.id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;