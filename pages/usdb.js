import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { parseEther } from "viem";
import WriteButton from "@/components/WriteButton";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import { contracts } from "@/config";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

const USDB = () => {
  const [data, setData] = useState({
    currentApr: "6.25",
    expandedFaq: null,
  });

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();
  const router = useRouter();

  const { data: balance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  const handleParticipate = () => {
    router.push('/stake#usdb');
  };

  const toggleFaq = (index) => {
    setData((prev) => ({
      ...prev,
      expandedFaq: prev.expandedFaq === index ? null : index,
    }));
  };

  const faqData = [
    {
      question: "What is USDB?",
      answer:
        "USDB is a synthetic USD that uses delta hedging on Bitcoin, Ethereum, and Solana spot assets while holding liquid stablecoins like USDC, USDT, USDe, and USDtb to achieve stability.",
    },
    {
      question: "How do I earn yields?",
      answer:
        "USDB's backing assets generate funding through hedged perpetual contracts and stablecoin rewards, producing 6%+ base annual yield plus 10-1000% BBB token rewards.",
    },
    {
      question: "How are funds allocated?",
      answer:
        "USDB employs a strategic fund allocation model: 80% of deposited funds are actively deployed in delta-neutral arbitrage strategies across major crypto exchanges to maximize returns, while 20% is reserved for liquidity management to ensure instant withdrawals and maintain stability.",
    },
    {
      question: "What is Delta Hedging?",
      answer:
        "Delta hedging is a risk management strategy that uses perpetual contracts and deliverable futures to hedge spot assets, reducing price volatility risk while capturing funding rate yields.",
    },
    {
      question: "How are BBB rewards calculated?",
      answer:
        "BBB rewards are based on your staking amount and holding time, ranging from 10% to 1000% depending on market conditions and protocol parameters.",
    },
    {
      question: "How is fund security ensured?",
      answer:
        "USDB is backed by a diversified portfolio of crypto assets and liquid stablecoins, using advanced risk management strategies with all assets undergoing strict security audits. The 80/20 allocation strategy ensures both growth and liquidity protection.",
    },
    {
      question: "How do I participate in USDB?",
      answer:
        "Connect your wallet, select the amount you want to stake, confirm the transaction and start earning yields. You can view yields and withdraw at any time thanks to our 20% liquidity reserve.",
    },
  ];

  return (
    <>
      <Head>
        <title>USDB - Synthetic USD | BBBPump</title>
        <meta name="description" content="USDB is a synthetic USD that provides 6%+ annual yield and BBB token rewards through delta hedging strategies." />
        <link rel="icon" href="/favicon-usdb.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/usdb-icon.svg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16">
                  <img 
                    src="/usdb.png" 
                    alt="USDB Logo" 
                    className="w-full h-full drop-shadow-lg"
                  />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  USDB
                </h1>
              </div>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Synthetic USD providing stable digital asset solutions through
                delta hedging strategies
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {data.currentApr}%+
                  </div>
                  <div className="text-sm text-gray-600">Base Annual Yield</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                    10-1000%
                  </div>
                  <div className="text-sm text-gray-600">BBB Token Rewards</div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                {isConnected ? (
                  <button
                    onClick={handleParticipate}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Participate Now
                  </button>
                ) : (
                  <button
                    onClick={privyLogin}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* What is USDB Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What is USDB?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                USDB is an innovative synthetic USD solution providing stability
                and yield for digital currencies
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Synthetic USD Solution
                  </h3>
                  <p className="text-gray-600">
                    USDB provides a crypto-native scalable solution for currency
                    through advanced delta hedging strategies implementing risk
                    management across major digital assets.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Delta Hedging Strategy
                  </h3>
                  <p className="text-gray-600">
                    Uses perpetual contracts and deliverable futures to hedge
                    Bitcoin, Ethereum, and Solana spot assets while holding
                    liquid stablecoins like USDC, USDT, USDe, and USDtb.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Yield Generation
                  </h3>
                  <p className="text-gray-600">
                    Backing assets generate funding through hedged perpetual
                    contracts and stablecoin rewards, creating sustainable
                    yields for holders. 80% of funds are allocated for arbitrage
                    opportunities, while 20% maintains liquidity for instant redemptions.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-8 rounded-3xl">
                  <svg viewBox="0 0 400 300" className="w-full h-auto">
                    <defs>
                      <linearGradient
                        id="coinGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#10b981", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#059669", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>

                    {/* Central USDB */}
                    <circle
                      cx="200"
                      cy="150"
                      r="40"
                      fill="url(#coinGradient)"
                      opacity="0.9"
                    >
                      <animate
                        attributeName="r"
                        values="40;45;40"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="200"
                      y="155"
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      USDB
                    </text>

                    {/* Surrounding assets */}
                    {/* Bitcoin */}
                    <circle
                      cx="120"
                      cy="80"
                      r="25"
                      fill="#f7931a"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 120 80;360 120 80"
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="120"
                      y="85"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      BTC
                    </text>

                    {/* Ethereum */}
                    <circle
                      cx="280"
                      cy="80"
                      r="25"
                      fill="#627eea"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 280 80;-360 280 80"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="280"
                      y="85"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      ETH
                    </text>

                    {/* Solana */}
                    <circle
                      cx="320"
                      cy="200"
                      r="25"
                      fill="#9945ff"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 320 200;360 320 200"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="320"
                      y="205"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      SOL
                    </text>

                    {/* Stablecoins */}
                    <circle
                      cx="80"
                      cy="200"
                      r="20"
                      fill="#2775ca"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 80 200;-360 80 200"
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="80"
                      y="205"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      USDC
                    </text>

                    <circle
                      cx="200"
                      cy="250"
                      r="20"
                      fill="#26a17b"
                      opacity="0.8"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 200 250;360 200 250"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <text
                      x="200"
                      y="255"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      USDT
                    </text>

                    {/* Connection lines */}
                    <line
                      x1="160"
                      y1="120"
                      x2="120"
                      y2="80"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <line
                      x1="240"
                      y1="120"
                      x2="280"
                      y2="80"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.8;0.3;0.8"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <line
                      x1="240"
                      y1="180"
                      x2="320"
                      y2="200"
                      stroke="#059669"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <line
                      x1="160"
                      y1="180"
                      x2="80"
                      y2="200"
                      stroke="#059669"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.8;0.3;0.8"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <line
                      x1="200"
                      y1="190"
                      x2="200"
                      y2="230"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.5;1;0.5"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Participate Section */}
        <div className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                How to Participate
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start earning USDB yields in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Asset Collateralization
                </h3>
                <p className="text-gray-600">
                  USDB is backed by a diversified portfolio of crypto assets (BTC, ETH, SOL) 
                  and liquid stablecoins (USDC, USDT, USDe, USDtb) with strategic 80/20 allocation 
                  for maximum efficiency.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Smart Fund Allocation
                </h3>
                <p className="text-gray-600">
                  80% of funds are actively deployed in delta-neutral arbitrage strategies 
                  across major exchanges, while 20% maintains liquidity reserves for instant 
                  withdrawals and stability.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Yield Distribution
                </h3>
                <p className="text-gray-600">
                  Generated income from arbitrage strategies and stablecoin rewards is 
                  distributed to USDB holders as base yield plus additional BBB token rewards, 
                  ensuring sustainable returns.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              {isConnected ? (
                <button
                  onClick={handleParticipate}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-lg"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={privyLogin}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-lg"
                >
                  Connect Wallet to Start
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Common questions and answers about USDB
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-green-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-green-600 transform transition-transform ${
                        data.expandedFaq === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {data.expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default USDB;
