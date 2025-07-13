import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiBook, FiPlus, FiCalendar, FiTrendingUp, FiTarget, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const Journal = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [reflection, setReflection] = useState('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const moods = [
    { value: 'very-happy', emoji: '😄', label: 'Very Happy', color: '#48bb78' },
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#68d391' },
    { value: 'neutral', emoji: '😐', label: 'Neutral', color: '#a0aec0' },
    { value: 'sad', emoji: '😔', label: 'Sad', color: '#f6ad55' },
    { value: 'very-sad', emoji: '😢', label: 'Very Sad', color: '#fc8181' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#ed8936' },
    { value: 'excited', emoji: '🤩', label: 'Excited', color: '#667eea' },
    { value: 'calm', emoji: '😌', label: 'Calm', color: '#38b2ac' },
  ];

  const loadJournalData = useCallback(() => {
    // Load from localStorage for now (in real app, this would be from backend)
    const savedEntries = localStorage.getItem(`journal_${user?.userId}`);
    const savedGoals = localStorage.getItem(`goals_${user?.userId}`);
    
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
    
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, [user?.userId]);

  useEffect(() => {
    loadJournalData();
  }, [loadJournalData]);

  const saveJournalData = (entries, goals) => {
    localStorage.setItem(`journal_${user?.userId}`, JSON.stringify(entries));
    localStorage.setItem(`goals_${user?.userId}`, JSON.stringify(goals));
  };

  const addJournalEntry = () => {
    if (!newEntry.trim()) return;

    const entry = {
      id: Date.now(),
      content: newEntry,
      mood: selectedMood,
      date: new Date().toISOString(),
      reflection: reflection
    };

    const updatedEntries = [entry, ...journalEntries];
    setJournalEntries(updatedEntries);
    saveJournalData(updatedEntries, goals);
    
    setNewEntry('');
    setReflection('');
    setSelectedMood('neutral');
    setIsAddingEntry(false);
  };

  const deleteJournalEntry = (id) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updatedEntries);
    saveJournalData(updatedEntries, goals);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;

    const goal = {
      id: Date.now(),
      title: newGoal,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    saveJournalData(journalEntries, updatedGoals);
    
    setNewGoal('');
    setIsAddingGoal(false);
  };

  const toggleGoal = (id) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id 
        ? { 
            ...goal, 
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : null
          }
        : goal
    );
    setGoals(updatedGoals);
    saveJournalData(journalEntries, updatedGoals);
  };

  const deleteGoal = (id) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    saveJournalData(journalEntries, updatedGoals);
  };

  const editGoal = (id, newTitle) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, title: newTitle } : goal
    );
    setGoals(updatedGoals);
    saveJournalData(journalEntries, updatedGoals);
    setEditingGoal(null);
  };

  const getMoodData = (moodValue) => {
    return moods.find(mood => mood.value === moodValue) || moods[2];
  };

  const getMoodStats = () => {
    const moodCounts = {};
    journalEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    return moods.map(mood => ({
      ...mood,
      count: moodCounts[mood.value] || 0
    }));
  };

  const getRecentMoodTrend = () => {
    const recentEntries = journalEntries.slice(0, 7);
    if (recentEntries.length === 0) return 'No data';
    
    const moodValues = {
      'very-sad': 1,
      'sad': 2,
      'anxious': 2.5,
      'neutral': 3,
      'calm': 3.5,
      'happy': 4,
      'excited': 4.5,
      'very-happy': 5
    };
    
    const avgMood = recentEntries.reduce((sum, entry) => 
      sum + (moodValues[entry.mood] || 3), 0
    ) / recentEntries.length;
    
    if (avgMood >= 4) return 'Positive 📈';
    if (avgMood >= 3) return 'Stable 📊';
    return 'Needs attention 📉';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const completedGoalsCount = goals.filter(goal => goal.completed).length;
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  return (
    <div className="journal-page">
      <div className="journal-header">
        <div className="header-content">
          <div className="header-text">
            <h1><FiBook /> Personal Journal</h1>
            <p>Track your thoughts, moods, and personal growth</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{journalEntries.length}</span>
              <span className="stat-label">Entries</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{getRecentMoodTrend()}</span>
              <span className="stat-label">Recent Trend</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{goalCompletionRate}%</span>
              <span className="stat-label">Goals Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="journal-content">
        {/* Quick Stats Dashboard */}
        <div className="dashboard-section">
          <h2><FiTrendingUp /> Mood Overview</h2>
          <div className="mood-stats">
            {getMoodStats().map(mood => (
              <div key={mood.value} className="mood-stat" style={{ borderColor: mood.color }}>
                <div className="mood-emoji">{mood.emoji}</div>
                <div className="mood-count">{mood.count}</div>
                <div className="mood-label">{mood.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div className="goals-section">
          <div className="section-header">
            <h2><FiTarget /> Personal Goals</h2>
            <button 
              className="add-btn"
              onClick={() => setIsAddingGoal(true)}
            >
              <FiPlus /> Add Goal
            </button>
          </div>
          
          {isAddingGoal && (
            <div className="add-goal-form">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter your goal..."
                className="goal-input"
                autoFocus
              />
              <div className="form-actions">
                <button onClick={addGoal} className="save-btn">
                  <FiSave /> Save
                </button>
                <button onClick={() => setIsAddingGoal(false)} className="cancel-btn">
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="goals-list">
            {goals.map(goal => (
              <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                {editingGoal === goal.id ? (
                  <div className="edit-goal-form">
                    <input
                      type="text"
                      defaultValue={goal.title}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          editGoal(goal.id, e.target.value);
                        }
                      }}
                      className="goal-edit-input"
                      autoFocus
                    />
                    <button onClick={() => setEditingGoal(null)} className="cancel-edit-btn">
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="goal-content">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal.id)}
                        className="goal-checkbox"
                      />
                      <span className="goal-text">{goal.title}</span>
                      {goal.completed && (
                        <span className="completion-date">
                          Completed {formatDate(goal.completedAt)}
                        </span>
                      )}
                    </div>
                    <div className="goal-actions">
                      <button 
                        onClick={() => setEditingGoal(goal.id)}
                        className="edit-goal-btn"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="delete-goal-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {goals.length === 0 && !isAddingGoal && (
              <div className="empty-goals">
                <FiTarget className="empty-icon" />
                <p>No goals yet. Set your first goal to start tracking your progress!</p>
              </div>
            )}
          </div>
        </div>

        {/* Add New Entry */}
        <div className="add-entry-section">
          <div className="section-header">
            <h2><FiPlus /> New Journal Entry</h2>
            {!isAddingEntry && (
              <button 
                className="add-btn"
                onClick={() => setIsAddingEntry(true)}
              >
                <FiPlus /> Write Entry
              </button>
            )}
          </div>
          
          {isAddingEntry && (
            <div className="new-entry-form">
              <div className="mood-selector">
                <label>How are you feeling?</label>
                <div className="mood-options">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                      onClick={() => setSelectedMood(mood.value)}
                      style={{ borderColor: selectedMood === mood.value ? mood.color : 'transparent' }}
                    >
                      <span className="mood-emoji">{mood.emoji}</span>
                      <span className="mood-name">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="entry-input">
                <label>What's on your mind?</label>
                <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="Write about your day, thoughts, or experiences..."
                  className="entry-textarea"
                  rows={4}
                />
              </div>
              
              <div className="reflection-input">
                <label>Daily Reflection (Optional)</label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What did you learn today? What are you grateful for?"
                  className="reflection-textarea"
                  rows={2}
                />
              </div>
              
              <div className="form-actions">
                <button onClick={addJournalEntry} className="save-entry-btn">
                  <FiSave /> Save Entry
                </button>
                <button onClick={() => setIsAddingEntry(false)} className="cancel-btn">
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Journal Entries */}
        <div className="entries-section">
          <h2><FiCalendar /> Recent Entries</h2>
          
          {journalEntries.length === 0 ? (
            <div className="empty-entries">
              <FiBook className="empty-icon" />
              <p>No journal entries yet. Start writing to track your journey!</p>
            </div>
          ) : (
            <div className="entries-list">
              {journalEntries.map(entry => {
                const moodData = getMoodData(entry.mood);
                return (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-header">
                      <div className="entry-mood" style={{ color: moodData.color }}>
                        <span className="mood-emoji">{moodData.emoji}</span>
                        <span className="mood-label">{moodData.label}</span>
                      </div>
                      <div className="entry-date">
                        <FiCalendar />
                        {formatDate(entry.date)}
                      </div>
                      <button 
                        onClick={() => deleteJournalEntry(entry.id)}
                        className="delete-entry-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div className="entry-content">
                      <p>{entry.content}</p>
                      {entry.reflection && (
                        <div className="entry-reflection">
                          <strong>Reflection:</strong> {entry.reflection}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;