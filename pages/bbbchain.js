const BBBChain = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 md:py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-4 md:mb-6 animate-slide-up">
            The Future of Fast Payments
          </h1>
          <p className="text-lg md:text-2xl text-green-700 mb-6 md:mb-8 animate-slide-up delay-200 px-2">
            BBB Chain - Lightning Fast Payment Network
          </p>
          <div className="stats stats-vertical md:stats-horizontal shadow bg-green-700 text-white animate-slide-up delay-300">
            <div className="stat">
              <div className="stat-title text-green-100 text-sm md:text-base">Launch Date</div>
              <div className="stat-value text-2xl md:text-4xl">2026-2027</div>
            </div>
            <div className="stat">
              <div className="stat-title text-green-100 text-sm md:text-base">TPS</div>
              <div className="stat-value text-2xl md:text-4xl">1M</div>
            </div>
            <div className="stat">
              <div className="stat-title text-green-100 text-sm md:text-base">Native Token</div>
              <div className="stat-value text-2xl md:text-4xl">BBB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="card bg-white shadow-xl transition-transform duration-300 hover:scale-105">
            <div className="card-body p-4 md:p-8">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="card-title text-lg md:text-xl text-green-800 justify-center mt-2">Instant Payments</h2>
              <p className="text-center text-sm md:text-base text-green-700">Process payments in milliseconds with our high-performance network</p>
            </div>
          </div>

          <div className="card bg-white shadow-xl transition-transform duration-300 hover:scale-105">
            <div className="card-body p-4 md:p-8">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="card-title text-lg md:text-xl text-green-800 justify-center mt-2">Low Cost</h2>
              <p className="text-center text-sm md:text-base text-green-700">Minimal transaction fees for efficient value transfer</p>
            </div>
          </div>

          <div className="card bg-white shadow-xl transition-transform duration-300 hover:scale-105">
            <div className="card-body p-4 md:p-8">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="card-title text-lg md:text-xl text-green-800 justify-center mt-2">AI-Powered Security</h2>
              <p className="text-center text-sm md:text-base text-green-700">Advanced AI algorithms ensure secure and reliable transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Gradient Background */}
      <div className="bg-gradient-to-b from-green-700 to-green-800 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-slide-up-delayed">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8">Ready to Build the Future?</h2>
            <button className="btn btn-lg bg-white text-green-700 hover:bg-green-50 border-none transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Stay Updated
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideUpDelayed {
          0% { 
            transform: translateY(30px); 
            opacity: 0; 
          }
          30% { 
            transform: translateY(30px); 
            opacity: 0; 
          }
          100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-slide-up-delayed {
          animation: slideUpDelayed 1.5s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }

        @media (max-width: 768px) {
          .stats {
            padding: 1rem;
          }
          .stat {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BBBChain;
