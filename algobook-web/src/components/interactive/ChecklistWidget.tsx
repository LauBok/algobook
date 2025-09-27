'use client';

import React, { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  priority?: 'must-master' | 'important' | 'good-to-know';
  category?: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

interface ChecklistWidgetProps {
  id?: string;
  title?: string;
  sections?: ChecklistSection[];
  items?: ChecklistItem[];
}

type ConfidenceLevel = 'confident' | 'somewhat' | 'needs-work' | 'unchecked';

interface ChecklistState {
  [itemId: string]: {
    confidence: ConfidenceLevel;
    notes: string;
  };
}

export default function ChecklistWidget({
  id = 'checklist-widget',
  title = 'Learning Checklist',
  sections = [],
  items = []
}: ChecklistWidgetProps) {
  const [checklistState, setChecklistState] = useState<ChecklistState>({});
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'section' | 'priority'>('section');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`algobook_checklist_${id}`);
    if (savedState) {
      try {
        setChecklistState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to load checklist state:', e);
      }
    }
  }, [id]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`algobook_checklist_${id}`, JSON.stringify(checklistState));
  }, [checklistState, id]);

  // Get all items (from sections or direct items)
  const allItems = sections.length > 0
    ? sections.flatMap(section => section.items.map(item => ({ ...item, sectionTitle: section.title })))
    : items;

  // Sort items based on selected sort method
  const getSortedItemsAndSections = () => {
    if (sortBy === 'priority') {
      // Sort by priority: must-master, important, good-to-know, undefined
      const priorityOrder = { 'must-master': 0, 'important': 1, 'good-to-know': 2, undefined: 3 };
      const sortedItems = [...allItems].sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        return aPriority - bPriority;
      });

      // Group by priority for display
      const priorityGroups = {
        'must-master': sortedItems.filter(item => item.priority === 'must-master'),
        'important': sortedItems.filter(item => item.priority === 'important'),
        'good-to-know': sortedItems.filter(item => item.priority === 'good-to-know'),
        'other': sortedItems.filter(item => !item.priority)
      };

      return {
        sections: [
          { title: '🔥 Must Master', items: priorityGroups['must-master'] },
          { title: '⭐ Important', items: priorityGroups['important'] },
          { title: '💡 Good to Know', items: priorityGroups['good-to-know'] },
          ...(priorityGroups['other'].length > 0 ? [{ title: '📋 Other', items: priorityGroups['other'] }] : [])
        ].filter(section => section.items.length > 0),
        items: []
      };
    } else {
      // Sort by section (original structure)
      if (sections.length > 0) {
        // We have sections, return them as-is
        return { sections, items: [] };
      } else {
        // No sections, create a default section for direct items
        return {
          sections: items.length > 0 ? [{ title: '📋 Items', items }] : [],
          items: []
        };
      }
    }
  };

  const { sections: displaySections, items: displayItems } = getSortedItemsAndSections();

  // Update confidence level for an item
  const updateConfidence = (itemId: string, confidence: ConfidenceLevel) => {
    setChecklistState(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        confidence,
        notes: prev[itemId]?.notes || ''
      }
    }));
  };

  // Update notes for an item
  const updateNotes = (itemId: string, notes: string) => {
    setChecklistState(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        confidence: prev[itemId]?.confidence || 'unchecked',
        notes
      }
    }));
  };

  // Toggle section collapse
  const toggleSectionCollapse = (sectionTitle: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  // Reset all progress
  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setChecklistState({});
      setExpandedNotes(null);
    }
  };

  // Calculate progress
  const totalItems = allItems.length;
  const completedItems = allItems.filter(item => {
    const state = checklistState[item.id];
    return state && state.confidence !== 'unchecked';
  }).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const masteredItems = allItems.filter(item => {
    const state = checklistState[item.id];
    return state && state.confidence === 'confident';
  }).length;

  // Get confidence icon and color
  const getConfidenceDisplay = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'confident':
        return { icon: '🟢', color: 'text-green-700', bg: 'bg-gradient-to-br from-green-50 to-green-100', border: 'border-green-300', shadow: 'shadow-green-200' };
      case 'somewhat':
        return { icon: '🟡', color: 'text-amber-700', bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-300', shadow: 'shadow-amber-200' };
      case 'needs-work':
        return { icon: '🔴', color: 'text-red-700', bg: 'bg-gradient-to-br from-red-50 to-red-100', border: 'border-red-300', shadow: 'shadow-red-200' };
      default:
        return { icon: '⚪', color: 'text-gray-500', bg: 'bg-gradient-to-br from-gray-50 to-gray-100', border: 'border-gray-300', shadow: 'shadow-gray-200' };
    }
  };

  // Get priority display
  const getPriorityDisplay = (priority?: string) => {
    switch (priority) {
      case 'must-master':
        return { label: '🔥 Must Master', color: 'text-red-700', bg: 'bg-gradient-to-r from-red-100 to-red-200', border: 'border-red-300' };
      case 'important':
        return { label: '⭐ Important', color: 'text-orange-700', bg: 'bg-gradient-to-r from-orange-100 to-orange-200', border: 'border-orange-300' };
      case 'good-to-know':
        return { label: '💡 Good to Know', color: 'text-blue-700', bg: 'bg-gradient-to-r from-blue-100 to-blue-200', border: 'border-blue-300' };
      default:
        return null;
    }
  };

  // Render individual item
  const renderItem = (item: ChecklistItem & { sectionTitle?: string }) => {
    const state = checklistState[item.id] || { confidence: 'unchecked', notes: '' };
    const confidenceDisplay = getConfidenceDisplay(state.confidence);
    const priorityDisplay = getPriorityDisplay(item.priority);
    const isNotesExpanded = expandedNotes === item.id;

    return (
      <div
        key={item.id}
        className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${confidenceDisplay.bg} ${confidenceDisplay.border} ${
          state.confidence === 'confident' ? 'transform hover:scale-[1.02]' : ''
        } relative`}
      >
        <div className="flex items-center gap-4">
          {/* Item Content */}
          <div className="flex-1">
            {/* Priority and Category Badges */}
            <div className="flex items-center gap-2 mb-3">
              {priorityDisplay && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityDisplay.bg} ${priorityDisplay.color} ${priorityDisplay.border}`}>
                  {priorityDisplay.label}
                </span>
              )}
              {item.category && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300">
                  📂 {item.category}
                </span>
              )}
            </div>

            {/* Item Text */}
            <div className={`text-base font-medium leading-relaxed ${
              state.confidence === 'confident'
                ? 'line-through text-gray-500 opacity-75'
                : confidenceDisplay.color
            }`}>
              {state.confidence === 'confident' && <span className="mr-2">✓</span>}
              {item.text}
            </div>

          </div>

          {/* Confidence Selector and Notes - Moved to right side */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {(['confident', 'somewhat', 'needs-work', 'unchecked'] as ConfidenceLevel[]).map(level => {
                const display = getConfidenceDisplay(level);
                const isSelected = state.confidence === level;
                return (
                  <button
                    key={level}
                    onClick={() => updateConfidence(item.id, level)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200 transform hover:scale-110 ${
                      isSelected
                        ? `${display.bg} ${display.border} border-2 shadow-lg ${display.shadow}`
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    title={level === 'unchecked' ? 'Not started' : level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                  >
                    {display.icon}
                  </button>
                );
              })}
            </div>

            {/* Notes Button */}
            <button
              onClick={() => setExpandedNotes(isNotesExpanded ? null : item.id)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <span>📝</span>
              <span>Notes</span>
              {state.notes && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{state.notes.trim().split(/\s+/).filter(word => word.length > 0).length}</span>}
              <span className={`transition-transform duration-200 ${isNotesExpanded ? 'rotate-90' : ''}`}>▶</span>
            </button>
          </div>
        </div>

        {/* Notes Panel - Appears on the right side */}
        {isNotesExpanded && (
          <div className="absolute top-0 left-full ml-4 w-80 bg-white rounded-xl border-2 border-gray-200 shadow-lg z-10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span className="font-medium text-gray-700 text-sm">Notes</span>
              </div>
              <button
                onClick={() => setExpandedNotes(null)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
              >
                ✕
              </button>
            </div>
            <textarea
              value={state.notes}
              onChange={(e) => updateNotes(item.id, e.target.value)}
              placeholder="Add your personal notes..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={6}
              autoFocus
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg p-6 overflow-visible">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={resetProgress}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 hover:border-red-300 transition-all duration-200"
          >
            <span>🔄</span>
            Reset
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>Progress: {completedItems}/{totalItems} items</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-600">{progressPercentage}%</span>
              <span className="text-green-600">🏆 {masteredItems} mastered</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Sort Controls and Legend */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-3">
          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">Sort by:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('section')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  sortBy === 'section'
                    ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-md'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                }`}
              >
                📋 Section
              </button>
              <button
                onClick={() => setSortBy('priority')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  sortBy === 'priority'
                    ? 'bg-purple-500 text-white border-2 border-purple-500 shadow-md'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                }`}
              >
                🎯 Priority
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span> <span className="font-medium">Confident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span> <span className="font-medium">Somewhat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span> <span className="font-medium">Needs work</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚪</span> <span className="font-medium">Not started</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 overflow-visible">
        {displaySections.length > 0 ? (
          // Render by sections (or priority groups when sorting by priority)
          displaySections.map((section, sectionIndex) => {
            const isCollapsed = collapsedSections.has(section.title);
            const completedInSection = section.items.filter(item => {
              const state = checklistState[item.id];
              return state && state.confidence !== 'unchecked';
            }).length;

            return (
              <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-visible">
                <button
                  onClick={() => toggleSectionCollapse(section.title)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 border-b border-gray-200 flex items-center justify-between transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                      ▶
                    </span>
                    <h4 className="font-medium text-gray-700 text-left">
                      {section.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-white px-2 py-1 rounded-full border border-gray-300">
                      {completedInSection}/{section.items.length}
                    </span>
                    {completedInSection === section.items.length && section.items.length > 0 && (
                      <span className="text-green-600">✓</span>
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-4 space-y-2 bg-white overflow-visible">
                    {section.items.map(item => renderItem({ ...item, sectionTitle: section.title }))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Render direct items
          displayItems.map(item => renderItem(item))
        )}
      </div>

      {totalItems === 0 && (
        <div className="text-center text-gray-500 py-8">
          No checklist items defined
        </div>
      )}
    </div>
  );
}