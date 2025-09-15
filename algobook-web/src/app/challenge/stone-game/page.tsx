'use client';

import Layout from '@/components/layout/Layout';
import StoneGameChallenge from '@/components/interactive/StoneGameChallenge';
import Link from 'next/link';

export default function StoneGameChallengePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/challenge" className="hover:text-blue-600 transition-colors">
            Challenges
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Stone Game Challenge</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🪨</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stone Game Challenge</h1>
              <p className="text-gray-600">Master optimal game theory strategies</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-0.5">!</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Challenge Goal</h3>
                <p className="text-blue-800 text-sm">
                  Create an algorithm that can consistently win the stone game. Your solution must demonstrate 
                  optimal strategy by winning multiple consecutive games against different configurations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Component */}
        <StoneGameChallenge />
      </div>
    </Layout>
  );
}