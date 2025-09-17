'use client';

import Layout from '@/components/layout/Layout';
import TwoStacksChallenge from '@/components/interactive/TwoStacksChallenge';
import Link from 'next/link';

export default function TwoStacksChallengePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/challenge" className="hover:text-blue-600 transition-colors">
            Challenges
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Two-Stacks Challenge</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Two-Stacks, One Queue Challenge</h1>
              <p className="text-gray-600">Master stack and queue operations in this strategic token-placing game</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-0.5">!</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Challenge Goal</h3>
                <p className="text-yellow-800 text-sm">
                  Write an algorithm that can consistently beat the AI in this strategic game. 
                  Your solution must win 5 consecutive games to complete the challenge and demonstrate 
                  mastery of stack and queue data structures.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Component */}
        <TwoStacksChallenge />
      </div>
    </Layout>
  );
}