import { useEffect } from 'react';
import { motion } from 'framer-motion';

const BBBChain = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/kute.js@2.2.4/dist/kute.min.js';
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-green-800 mb-6">
            The Future of Smart Contracts
          </h1>
          <p className="text-2xl text-green-700 mb-8">
            BBB Chain - JavaScript Smart Contracts Made Simple
          </p>
          <div className="stats shadow bg-green-700 text-white">
            <div className="stat">
              <div className="stat-title text-green-100">Launch Date</div>
              <div className="stat-value">2026-2027</div>
            </div>
            <div className="stat">
              <div className="stat-title text-green-100">TPS</div>
              <div className="stat-value">1M</div>
            </div>
            <div className="stat">
              <div className="stat-title text-green-100">Native Token</div>
              <div className="stat-value">BBB</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card bg-white shadow-xl"
          >
            <div className="card-body">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="card-title text-green-800 justify-center">JavaScript Smart Contracts</h2>
              <p className="text-center text-green-700">Write smart contracts in JavaScript, the world's most popular programming language</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card bg-white shadow-xl"
          >
            <div className="card-body">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="card-title text-green-800 justify-center">Lightning Fast</h2>
              <p className="text-center text-green-700">1 million transactions per second for unparalleled performance</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card bg-white shadow-xl"
          >
            <div className="card-body">
              <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="card-title text-green-800 justify-center">BBB Token</h2>
              <p className="text-center text-green-700">Native token powering the future of decentralized applications</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Wave Background */}
      <div className="relative h-48 bg-green-700 overflow-hidden">
        <svg className="absolute bottom-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#f0fdf4" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl font-bold text-green-800 mb-8">Ready to Build the Future?</h2>
            <button className="btn btn-primary btn-lg bg-green-600 hover:bg-green-700 border-none">
              Stay Updated
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BBBChain;
