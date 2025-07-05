import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Search } from 'lucide-react';
import { storageUtils } from '../utils/localStorage';
import { JournalEntry } from '../types';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const loadedEntries = storageUtils.getJournalEntries();
    setEntries(loadedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const saveEntries = (updatedEntries: JournalEntry[]) => {
    const sortedEntries = updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(sortedEntries);
    storageUtils.saveJournalEntries(sortedEntries);
  };

  const addEntry = () => {
    if (newEntry.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        content: newEntry.trim(),
      };
      saveEntries([...entries, entry]);
      setNewEntry('');
    }
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditingContent(entry.content);
  };

  const saveEdit = () => {
    if (editingContent.trim()) {
      const updatedEntries = entries.map(entry =>
        entry.id === editingId ? { ...entry, content: editingContent.trim() } : entry
      );
      saveEntries(updatedEntries);
    }
    setEditingId(null);
    setEditingContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? entry.date === selectedDate : true;
    return matchesSearch && matchesDate;
  });

  const getStreakInfo = () => {
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = entries.map(e => e.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const uniqueDates = [...new Set(sortedDates)];
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        tempStreak++;
        currentStreak = tempStreak;
      } else {
        break;
      }
    }
    
    // Calculate max streak
    for (let i = 0; i < uniqueDates.length; i++) {
      let streak = 1;
      for (let j = i + 1; j < uniqueDates.length; j++) {
        const currentDate = new Date(uniqueDates[j - 1]);
        const nextDate = new Date(uniqueDates[j]);
        const diffDays = Math.abs(currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      maxStreak = Math.max(maxStreak, streak);
    }
    
    return { currentStreak, maxStreak, totalEntries: entries.length };
  };

  const streakInfo = getStreakInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Productivity Journal</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your daily learning and productivity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Entries</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{streakInfo.totalEntries}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Streak</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{streakInfo.currentStreak} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Best Streak</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{streakInfo.maxStreak} days</p>
        </div>
      </div>

      {/* Add New Entry */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Today's Entry</h3>
        <div className="space-y-4">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What did you learn or accomplish today? Share your thoughts, challenges, and achievements..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={4}
          />
          <button
            onClick={addEntry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {(searchTerm || selectedDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDate('');
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center text-gray-500 dark:text-gray-400">
            {entries.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No journal entries yet!</p>
                <p>Start by adding your first entry to track your daily progress.</p>
              </div>
            ) : (
              <p>No entries found matching your search criteria.</p>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {editingId === entry.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;