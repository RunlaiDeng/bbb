import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { parseEther, parseUnits, formatUnits, maxUint256 } from "viem";
import WriteButton from "@/components/WriteButton";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import { contracts } from "@/config";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";

const USDB = () => {
  const [data, setData] = useState({
    currentApr: "5",
    expandedFaq: null,
  });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // Deposit Modal states
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");

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

  // 获取USDB代币余额
  const { data: usdbBalance, refetch: refetchUsdbBalance } = useBalance({
    address,
    token: contracts[chainId]?.usdb?.address,
    query: {
      enabled: !!address && !!contracts[chainId]?.usdb?.address,
    },
  });

  // 获取选中代币的配置
  const getTokenConfig = () => {
    if (selectedToken === "USDC") {
      return contracts[chainId]?.usdc;
    } else if (selectedToken === "USDT") {
      return contracts[chainId]?.usdt;
    }
    return null;
  };

  // 检查是否支持选中的代币
  const isTokenSupported = () => {
    return selectedToken === "USDC" && !!getTokenConfig()?.address;
  };

  // 获取代币余额
  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({
    address,
    token: getTokenConfig()?.address,
    query: {
      enabled: !!address && isTokenSupported(),
    },
  });

  // 获取代币的授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: getTokenConfig()?.address,
    abi: getTokenConfig()?.abi,
    functionName: "allowance",
    args: [address, contracts[chainId]?.usdb?.address],
    query: {
      enabled: !!address && isTokenSupported() && !!contracts[chainId]?.usdb?.address,
    },
  });

  const handleParticipate = () => {
    if (isConnected) {
      setIsDepositModalOpen(true);
    } else {
      privyLogin();
    }
  };

  const handleMaxClick = () => {
    if (tokenBalance) {
      setAmount(formatUnits(tokenBalance.value, tokenBalance.decimals));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const needsApproval = () => {
    if (!amount || !tokenBalance) return false;
    try {
      const amountWei = parseUnits(amount, tokenBalance.decimals);
      if (amountWei <= 0) return false;
      
      // 如果没有allowance数据，假设需要approve
      if (allowance === undefined || allowance === null) return true;
      
      return allowance < amountWei;
    } catch {
      return true;
    }
  };

  const isValidAmount = () => {
    if (!amount || !tokenBalance) return false;
    try {
      const amountWei = parseUnits(amount, tokenBalance.decimals);
      return amountWei > 0 && amountWei <= tokenBalance.value;
    } catch {
      return false;
    }
  };

  // 格式化USDB数量显示 (6位小数)
  const formatUsdbAmount = (value) => {
    if (!value) return "0.00";
    const formatted = formatUnits(value, 6); // USDB是6位小数
    return parseFloat(formatted).toFixed(2);
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
        "USDB's backing assets generate funding through hedged perpetual contracts and stablecoin rewards, producing 5%+ base annual yield plus 10-1000% BBB token rewards.",
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
        "USDB is backed by a diversified portfolio of crypto assets and liquid stablecoins, using advanced risk management strategies with all assets undergoing strict security audits.",
    },
    {
      question: "How do I participate in USDB?",
      answer:
        "Connect your wallet, select the amount you want to stake, confirm the transaction and start earning yields. You can view yields and withdraw at any time.",
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
                <button
                  onClick={handleParticipate}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {isConnected ? "Deposit" : "Connect Wallet"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* USDB Holdings Section */}
        {isConnected && (
          <div className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your USDB Holdings</h2>
                <p className="text-gray-600 mb-6">Current balance in your wallet</p>
                
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12">
                      <img 
                        src="/usdb.png" 
                        alt="USDB Logo" 
                        className="w-full h-full drop-shadow-md"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold text-gray-900">
                        {usdbBalance ? formatUsdbAmount(usdbBalance.value) : "0.00"}
                      </div>
                      <div className="text-sm text-gray-600">USDB</div>
                    </div>
                  </div>
                </div>

                {/* 估算收益 */}
                {usdbBalance && parseFloat(formatUsdbAmount(usdbBalance.value)) > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                      <div className="text-lg font-semibold text-green-700">
                        ~{(parseFloat(formatUsdbAmount(usdbBalance.value)) * 0.05).toFixed(2)} USDB
                      </div>
                      <div className="text-sm text-gray-600">Estimated Annual Yield (5%)</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                      <div className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        BBB Rewards
                      </div>
                      <div className="text-sm text-gray-600">10-1000% Additional Rewards</div>
                    </div>
                  </div>
                )}

                {/* Stake按钮 */}
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/stake#usdb')}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Stake USDB
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><strong>80% of funds</strong> allocated for arbitrage opportunities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700"><strong>20% of funds</strong> reserved for liquidity provision</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Yield Generation
                  </h3>
                  <p className="text-gray-600">
                    Backing assets generate funding through hedged perpetual
                    contracts and stablecoin rewards, creating sustainable
                    yields for holders.
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
                  Connect Wallet
                </h3>
                <p className="text-gray-600">
                  Connect your Web3 wallet to the BBBPump platform, supporting
                  multiple mainstream wallets.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Choose Amount
                </h3>
                <p className="text-gray-600">
                  Enter the amount of USDB you want to stake, and the system
                  will display expected yield rates and BBB rewards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Start Earning
                </h3>
                <p className="text-gray-600">
                  Confirm the transaction and immediately start earning 5%+ base
                  yields and BBB token rewards.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => router.push('/stake#usdb')}
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-lg"
              >
                {isConnected ? "Start Participating" : "Connect Wallet to Participate"}
              </button>
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

        {/* Deposit Modal */}
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              {/* 标题 */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Deposit {selectedToken === "USDC" ? "USDC.e" : selectedToken}</h3>
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 代币余额显示 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {tokenBalance ? `${formatUnits(tokenBalance.value, tokenBalance.decimals)} ${selectedToken === "USDC" ? "USDC.e" : selectedToken}` : "0"}
                    </span>
                    {selectedToken === "USDC" && (
                      <a
                        href="https://icecreamswap.com/swap?chain=xdc&outputCurrency=0x2A8E898b6242355c290E1f4Fc966b8788729A4D4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded-full transition-colors"
                      >
                        Get USDC
                      </a>
                    )}
                  </div>
                </div>
                {/* 显示将收到的USDB数量 */}
                {amount && isValidAmount() && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600">You will receive:</span>
                    <span className="text-sm font-medium text-green-700">
                      {amount} USDB
                    </span>
                  </div>
                )}
              </div>

              {/* 代币选择器 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Token
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedToken("USDC")}
                    className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${
                      selectedToken === "USDC"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span className="font-medium">USDC.e</span>
                    {selectedToken === "USDC" && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedToken("USDT")}
                    className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-all relative ${
                      selectedToken === "USDT"
                        ? "border-gray-400 bg-gray-50 text-gray-500"
                        : "border-gray-300 hover:border-gray-400 text-gray-500"
                    }`}
                    disabled
                  >
                    <span className="font-medium">USDT</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </button>
                </div>
              </div>

              {/* 输入金额 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                {!isConnected ? (
                  <div className="text-center py-4">
                    <span className="text-gray-500">Please connect your wallet</span>
                  </div>
                ) : selectedToken === "USDT" ? (
                  <div className="text-center py-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="text-orange-600 font-medium mb-2">USDT Deposit Coming Soon</div>
                      <div className="text-sm text-orange-500">USDT deposit functionality will be available shortly</div>
                    </div>
                  </div>
                ) : needsApproval() ? (
                  <WriteButton
                    data={{
                      address: getTokenConfig()?.address,
                      abi: getTokenConfig()?.abi,
                      functionName: "approve",
                      args: [
                        contracts[chainId]?.usdb?.address,
                        maxUint256,
                      ],
                    }}
                    callback={() => {
                      // Approve成功后刷新allowance
                      refetchAllowance();
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 text-center"
                    buttonName="Approve"
                  />
                ) : (
                  <WriteButton
                    data={{
                      address: contracts[chainId]?.usdb?.address,
                      abi: contracts[chainId]?.usdb?.abi,
                      functionName: "deposit",
                      args: [
                        getTokenConfig()?.address,
                        parseUnits(amount || "0", tokenBalance?.decimals || 18),
                      ],
                    }}
                    callback={() => {
                      setAmount("");
                      setIsDepositModalOpen(false);
                      // 刷新USDB余额和代币余额
                      refetchUsdbBalance();
                      refetchTokenBalance();
                      // 延迟一下再刷新，确保链上状态已更新
                      setTimeout(() => {
                        refetchUsdbBalance();
                        refetchTokenBalance();
                      }, 2000);
                    }}
                    disabled={!isValidAmount()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 text-center"
                    buttonName="Deposit"
                  />
                )}

                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 text-center"
                >
                  Cancel
                </button>
              </div>

              {/* 提示信息 */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                {needsApproval() ? (
                  "First approve spending, then you can deposit to receive USDB tokens"
                ) : (
                  "You will receive USDB tokens equivalent to your deposit"
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default USDB;
