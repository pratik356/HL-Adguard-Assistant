import React from 'react';
import { ShieldCheck, Zap, Lock, BookOpen } from 'lucide-react';

const Landing: React.FC<{ onStartChat: () => void }> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-20 pb-10 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-800 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Gemini 3 Pro Powered
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight leading-tight">
            Google Ads Compliance <br /> Made Simple.
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
            Ensure your ads are policy-compliant before you publish.
            Get instant feedback, policy citations, and safe alternatives powered by advanced AI.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartChat}
              className="px-8 py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-gray-800 dark:hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl flex items-center gap-2"
            >
              Start Compliance Check
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
            title="Policy Guard"
            desc="Automatically detects violations of Google's latest advertising policies, including trademarks and editorial standards."
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-blue-500" />}
            title="Instant Fixes"
            desc="Don't just get rejected. Get rewritten ad copy that maintains your message while staying compliant."
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-purple-500" />}
            title="Secure & Private"
            desc="Your ad drafts and conversation history are password protected and stored securely."
          />
        </div>



      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-20 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 HL Adguard Assistant. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed and prompted By <span className="font-semibold text-gray-700 dark:text-gray-300">Prasun</span>
        </p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="glass-panel p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300 dark:bg-gray-800/80 dark:border-gray-700">
    <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-gray-100 dark:border-gray-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default Landing;