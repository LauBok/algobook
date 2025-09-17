'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { ProgressManager } from '@/lib/utils/progress';
import { CURRICULUM_STRUCTURE } from '@/lib/data/chapterMetadata';

export default function ChallengesPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading challenges...</div>
      </div>
    );
  }

  const challenges = [
    {
      id: 'stone-game',
      title: 'Stone Game Challenge',
      description: 'Master optimal game theory strategies. Can you create an algorithm that never loses at the stone game?',
      difficulty: 'Beginner',
      estimatedTime: '30-45 minutes',
      topics: ['Game Theory', 'Optimal Strategy', 'Dynamic Programming'],
      href: '/challenge/stone-game',
      completed: ProgressManager.isChallengeCompleted('part1-challenge'),
      icon: '🪨'
    },
    {
      id: 'mastermind',
      title: 'Mastermind Challenge',
      description: 'Apply strategic thinking to crack secret codes efficiently. Build an algorithm that minimizes guesses using information theory.',
      difficulty: 'Intermediate',
      estimatedTime: '45-60 minutes',
      topics: ['Information Theory', 'Search Algorithms', 'Optimization'],
      href: '/challenge/mastermind',
      completed: ProgressManager.isChallengeCompleted('part2-challenge'),
      icon: '🧠'
    },
    {
      id: 'two-stacks',
      title: 'Two-Stacks Challenge',
      description: 'Master stack and queue operations in this strategic token-placing game. Apply data structure knowledge to build a winning algorithm.',
      difficulty: 'Intermediate',
      estimatedTime: '40-55 minutes',
      topics: ['Stacks', 'Queues', 'Game Strategy', 'Data Structures'],
      href: '/challenge/two-stacks',
      completed: ProgressManager.isChallengeCompleted('part3-challenge'),
      icon: '🎯'
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Algorithmic Challenges
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test your algorithmic thinking with these hands-on coding challenges. 
            Each challenge reinforces key concepts from the curriculum through practical problem-solving.
          </p>
        </div>

        {/* Challenge Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                {/* Challenge Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{challenge.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          challenge.difficulty === 'Beginner' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">• {challenge.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  {challenge.completed && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                      ✓ Completed
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {challenge.description}
                </p>

                {/* Topics */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {challenge.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={challenge.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {challenge.completed ? '🔄 Try Again' : '🚀 Start Challenge'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💡 How Challenges Work
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Practice Mode</h3>
                  <p className="text-gray-600 text-sm">Try the problem manually to understand the mechanics and develop intuition.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Code Your Solution</h3>
                  <p className="text-gray-600 text-sm">Write an algorithm using the provided code editor with live execution and feedback.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Master the Challenge</h3>
                  <p className="text-gray-600 text-sm">Achieve consistent optimal performance across multiple test cases to complete the challenge.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}