import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function HomePage() {
  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">AlgoBook</span>
          </h1>
          <p className="text-xl text-gray-900 mb-8 max-w-2xl mx-auto">
            Master Python, algorithms, and data structures through interactive learning. 
            Solve real problems from day one with hands-on coding exercises and instant feedback.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/chapter/01-getting-started"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </Link>
            <Link
              href="/chapters"
              className="border border-gray-300 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Browse Chapters
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Code Editor</h3>
            <p className="text-gray-900">
              Write and run Python code directly in your browser with instant feedback and results.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Automated Testing</h3>
            <p className="text-gray-900">
              Get immediate feedback on your solutions with our automated testing and grading system.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Progressive Learning</h3>
            <p className="text-gray-900">
              Learn Python, algorithms, and data structures together in a carefully designed sequence.
            </p>
          </div>
        </div>

        {/* Learning Path Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Path</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Programming Foundations</h3>
                <p className="text-gray-900 text-sm">
                  Start solving problems immediately while learning Python basics: variables, loops, functions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Algorithm Efficiency</h3>
                <p className="text-gray-900 text-sm">
                  Understand why some solutions are faster than others. Learn Big O notation and optimization.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Structures</h3>
                <p className="text-gray-900 text-sm">
                  Learn powerful data structures exactly when you need them to solve interesting problems.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Advanced Techniques</h3>
                <p className="text-gray-900 text-sm">
                  Master dynamic programming, graph algorithms, and specialized problem-solving patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/chapter/01-getting-started"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Begin Your Journey
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats/Social Proof */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose AlgoBook?</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600">26</div>
              <div className="text-sm text-gray-600">Chapters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">200+</div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Interactive</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">Free</div>
              <div className="text-sm text-gray-600">Forever</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
