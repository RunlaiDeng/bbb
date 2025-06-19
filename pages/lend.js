import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Lend = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Lend - BBB</title>
        <meta name="description" content="Flexible Staking and Lending - Coming Soon" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Lending Service
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible staking and lending features to generate more yield from your assets
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
                                  <p className="text-green-100 text-lg">
                    We&apos;re preparing a brand new lending experience for you
                  </p>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Left Column - Features */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Flexible Staking</h4>
                          <p className="text-gray-600">Support multiple asset staking with flexible portfolio management</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Smart Lending</h4>
                          <p className="text-gray-600">Intelligent lending matching system based on market conditions</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Security Guarantee</h4>
                          <p className="text-gray-600">Multiple security mechanisms to protect your asset safety</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">High Yield</h4>
                          <p className="text-gray-600">Competitive rates to maximize your investment returns</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Benefits */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Coming Soon</h3>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">1</span>
                          </div>
                          <span className="text-gray-700">Multi-currency staking support</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">2</span>
                          </div>
                          <span className="text-gray-700">Flexible term options</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">3</span>
                          </div>
                          <span className="text-gray-700">Real-time yield calculation</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">4</span>
                          </div>
                          <span className="text-gray-700">Auto-compounding feature</span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-white rounded-xl border border-green-200">
                        <p className="text-center text-gray-600 font-medium">
                          🎯 Expected Launch: Soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                    <h3 className="text-2xl font-bold mb-3">Stay Tuned</h3>
                    <p className="text-green-100 mb-4">
                      Follow our official channels to get launch notifications first
                    </p>
              
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Why Choose Our Lending Service?</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We are committed to providing users with the safest, most convenient, and most efficient decentralized lending services.
                  Based on mature smart contract technology and risk control mechanisms, your assets can earn stable returns in a secure environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lend;
