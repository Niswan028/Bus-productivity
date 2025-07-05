import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Circle } from 'lucide-react';
import { storageUtils } from '../utils/localStorage';
import { DSATopic } from '../types';

const DSATracker: React.FC = () => {
  const [topics, setTopics] = useState<DSATopic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState('');

  useEffect(() => {
    const loadedTopics = storageUtils.getDSATopics();
    setTopics(loadedTopics);
  }, []);

  const saveTopics = (updatedTopics: DSATopic[]) => {
    setTopics(updatedTopics);
    storageUtils.saveDSATopics(updatedTopics);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      const topic: DSATopic = {
        id: Date.now().toString(),
        topic: newTopic.trim(),
        status: 'not-started',
        date: new Date().toISOString().split('T')[0],
      };
      saveTopics([...topics, topic]);
      setNewTopic('');
    }
  };

  const updateTopicStatus = (id: string, status: DSATopic['status']) => {
    const updatedTopics = topics.map(topic =>
      topic.id === id ? { ...topic, status, date: new Date().toISOString().split('T')[0] } : topic
    );
    saveTopics(updatedTopics);
  };

  const deleteTopic = (id: string) => {
    const updatedTopics = topics.filter(topic => topic.id !== id);
    saveTopics(updatedTopics);
  };

  const startEdit = (topic: DSATopic) => {
    setEditingId(topic.id);
    setEditingTopic(topic.topic);
  };

  const saveEdit = () => {
    if (editingTopic.trim()) {
      const updatedTopics = topics.map(topic =>
        topic.id === editingId ? { ...topic, topic: editingTopic.trim() } : topic
      );
      saveTopics(updatedTopics);
    }
    setEditingId(null);
    setEditingTopic('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTopic('');
  };

  const getStatusIcon = (status: DSATopic['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'in-progress':
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return <Circle className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: DSATopic['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in-progress':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getProgressStats = () => {
    const total = topics.length;
    const completed = topics.filter(t => t.status === 'completed').length;
    const inProgress = topics.filter(t => t.status === 'in-progress').length;
    const notStarted = topics.filter(t => t.status === 'not-started').length;

    return { total, completed, inProgress, notStarted };
  };

  const stats = getProgressStats();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">DSA Learning Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your Data Structures and Algorithms learning progress</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Topics</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Not Started</h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.notStarted}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Complete
          </p>
        </div>
      )}

      {/* Add New Topic */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Topic</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Enter DSA topic (e.g., Arrays, Binary Trees, Dynamic Programming)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addTopic()}
          />
          <button
            onClick={addTopic}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Topic
          </button>
        </div>
      </div>

      {/* Topics List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">DSA Topics</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {topics.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No topics added yet. Add your first DSA topic to get started!
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(topic.status)}
                    <div>
                      {editingId === topic.id ? (
                        <input
                          type="text"
                          value={editingTopic}
                          onChange={(e) => setEditingTopic(e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          onBlur={saveEdit}
                          autoFocus
                        />
                      ) : (
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{topic.topic}</h4>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {topic.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(topic.status)}`}>
                      {topic.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updateTopicStatus(topic.id, 'not-started')}
                        className={`p-1 rounded ${topic.status === 'not-started' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        title="Mark as Not Started"
                      >
                        <Circle size={16} />
                      </button>
                      <button
                        onClick={() => updateTopicStatus(topic.id, 'in-progress')}
                        className={`p-1 rounded ${topic.status === 'in-progress' ? 'bg-yellow-200 dark:bg-yellow-600' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        title="Mark as In Progress"
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        onClick={() => updateTopicStatus(topic.id, 'completed')}
                        className={`p-1 rounded ${topic.status === 'completed' ? 'bg-green-200 dark:bg-green-600' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        title="Mark as Completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => startEdit(topic)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Edit Topic"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTopic(topic.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-400"
                        title="Delete Topic"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default DSATracker;