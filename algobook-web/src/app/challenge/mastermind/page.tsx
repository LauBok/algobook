'use client';

import Layout from '@/components/layout/Layout';
import MastermindChallenge from '@/components/interactive/MastermindChallenge';
import Link from 'next/link';

export default function MastermindChallengePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/challenge" className="hover:text-blue-600 transition-colors">
            Challenges
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Mastermind Challenge</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🧠</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mastermind Challenge</h1>
              <p className="text-gray-600">Apply strategic thinking to crack secret codes efficiently</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mt-0.5">!</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Challenge Goal</h3>
                <p className="text-yellow-800 text-sm">
                  Build an algorithm that can crack any Mastermind code in 5 guesses or fewer. 
                  Your solution must consistently achieve optimal performance by solving 10 consecutive games 
                  within the guess limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Component */}
        <MastermindChallenge />
      </div>
    </Layout>
  );
}