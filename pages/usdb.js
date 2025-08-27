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

  // Deposit states (no longer modal)
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC_XDC");
  const [copiedAddress, setCopiedAddress] = useState(null);



  // sUSDB V2 states
  const [sUSDBV2Amount, setSUSDBV2Amount] = useState("");
  const [withdrawV2Amount, setWithdrawV2Amount] = useState("");
  const [activeV2Tab, setActiveV2Tab] = useState("deposit"); // deposit, withdraw, manage

  // 添加客户端挂载状态
  const [isMounted, setIsMounted] = useState(false);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();
  const router = useRouter();

  // 检查客户端是否已挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 复制地址后清除提示
  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);

  // 代币配置对象
  const tokenConfigs = {
    USDC_XDC: {
      symbol: "USDC.e",
      name: "Bridged USDC(XDC)",
      icon: "/usdc.jpg",
      iconBg: "bg-blue-100",
      getContract: () => contracts[chainId]?.xdcUSDC,
      buyLink:
        "https://icecreamswap.com/swap?chain=xdc&outputCurrency=0x2A8E898b6242355c290E1f4Fc966b8788729A4D4",
    },
    USDC_STARGATE: {
      symbol: "USDCe",
      name: "USDC.e (Stargate)",
      icon: "/usdc.jpg",
      iconBg: "bg-purple-100",
      getContract: () => contracts[chainId]?.stargateUSDC,
      buyLink: null,
    },
    USDT_STARGATE: {
      symbol: "USDT",
      name: "Bridged stgUSDT",
      icon: "/usdt.jpg",
      iconBg: "bg-green-100",
      getContract: () => contracts[chainId]?.stargateUSDT,
      buyLink: null,
    },
  };

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

  // 获取各个代币的余额用于显示
  const { data: usdcXdcBalance } = useBalance({
    address,
    token: contracts[chainId]?.xdcUSDC?.address,
    query: {
      enabled: !!address && !!contracts[chainId]?.xdcUSDC?.address,
    },
  });

  const { data: usdcStargateBalance } = useBalance({
    address,
    token: contracts[chainId]?.stargateUSDC?.address,
    query: {
      enabled: !!address && !!contracts[chainId]?.stargateUSDC?.address,
    },
  });

  const { data: usdtStargateBalance } = useBalance({
    address,
    token: contracts[chainId]?.stargateUSDT?.address,
    query: {
      enabled: !!address && !!contracts[chainId]?.stargateUSDT?.address,
    },
  });

  // 获取选中代币的配置
  const getTokenConfig = () => {
    return tokenConfigs[selectedToken]?.getContract();
  };

  // 检查是否支持选中的代币
  const isTokenSupported = () => {
    return getTokenConfig()?.address;
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
      enabled:
        !!address && isTokenSupported() && !!contracts[chainId]?.usdb?.address,
    },
  });

  // 获取特定代币的余额
  const getTokenBalance = (tokenKey) => {
    switch (tokenKey) {
      case "USDC_XDC":
        return usdcXdcBalance;
      case "USDC_STARGATE":
        return usdcStargateBalance;
      case "USDT_STARGATE":
        return usdtStargateBalance;
      default:
        return null;
    }
  };



  // sUSDB V2 相关数据获取
  const { data: sUSDBV2Balance, refetch: refetchSUSDBV2Balance } = useBalance({
    address,
    token: contracts[chainId]?.sUSDBV2?.address,
    query: {
      enabled: !!address && !!contracts[chainId]?.sUSDBV2?.address,
    },
  });

  // 获取 sUSDB V2 汇率
  const { data: exchangeRateV2, refetch: refetchExchangeRateV2 } = useReadContract({
    address: contracts[chainId]?.sUSDBV2?.address,
    abi: contracts[chainId]?.sUSDBV2?.abi,
    functionName: "getExchangeRate",
    args: [],
    query: {
      enabled: !!contracts[chainId]?.sUSDBV2?.address,
    },
  });

  // 获取用户的活跃提取请求 V2
  const { data: activeWithdrawalsV2, refetch: refetchActiveWithdrawalsV2 } =
    useReadContract({
      address: contracts[chainId]?.sUSDBV2?.address,
      abi: contracts[chainId]?.sUSDBV2?.abi,
      functionName: "getActiveWithdrawalRequests",
      args: [address],
      query: {
        enabled: !!address && !!contracts[chainId]?.sUSDBV2?.address,
      },
    });

  // 获取USDB对sUSDBV2的授权额度
  const { data: usdbAllowanceV2, refetch: refetchUSDBAllowanceV2 } =
    useReadContract({
      address: contracts[chainId]?.usdb?.address,
      abi: contracts[chainId]?.usdb?.abi,
      functionName: "allowance",
      args: [address, contracts[chainId]?.sUSDBV2?.address],
      query: {
        enabled:
          !!address &&
          !!contracts[chainId]?.usdb?.address &&
          !!contracts[chainId]?.sUSDBV2?.address,
      },
    });

  // 获取sUSDBV2总供应量
  const { data: sUSDBV2TotalSupply } = useReadContract({
    address: contracts[chainId]?.sUSDBV2?.address,
    abi: contracts[chainId]?.sUSDBV2?.abi,
    functionName: "totalSupply",
    args: [],
    query: {
      enabled: !!contracts[chainId]?.sUSDBV2?.address,
    },
  });

  // 获取USDB总供应量
  const { data: usdbTotalSupply } = useReadContract({
    address: contracts[chainId]?.usdb?.address,
    abi: contracts[chainId]?.usdb?.abi,
    functionName: "totalSupply",
    args: [],
    query: {
      enabled: !!contracts[chainId]?.usdb?.address,
    },
  });

  // 检查当前用户是否是USDB合约的owner
  const { data: usdbOwner } = useReadContract({
    address: contracts[chainId]?.usdb?.address,
    abi: contracts[chainId]?.usdb?.abi,
    functionName: "owner",
    args: [],
    query: {
      enabled: !!contracts[chainId]?.usdb?.address,
    },
  });

  // 获取USDB合约中的USDC.e余额
  const { data: contractUsdcBalance, refetch: refetchContractUsdcBalance } = useBalance({
    address: contracts[chainId]?.usdb?.address,
    token: contracts[chainId]?.xdcUSDC?.address,
    query: {
      enabled: !!contracts[chainId]?.usdb?.address && !!contracts[chainId]?.xdcUSDC?.address,
    },
  });

  // 获取USDB合约中的USDT余额
  const { data: contractUsdtBalance, refetch: refetchContractUsdtBalance } = useBalance({
    address: contracts[chainId]?.usdb?.address,
    token: contracts[chainId]?.stargateUSDT?.address,
    query: {
      enabled: !!contracts[chainId]?.usdb?.address && !!contracts[chainId]?.stargateUSDT?.address,
    },
  });

  // 获取USDB合约中的Stargate USDC余额
  const { data: contractStargateUsdcBalance, refetch: refetchContractStargateUsdcBalance } = useBalance({
    address: contracts[chainId]?.usdb?.address,
    token: contracts[chainId]?.stargateUSDC?.address,
    query: {
      enabled: !!contracts[chainId]?.usdb?.address && !!contracts[chainId]?.stargateUSDC?.address,
    },
  });



  // 检查当前用户是否是USDB合约的owner
  const isOwner = () => {
    return address && usdbOwner && address.toLowerCase() === usdbOwner.toLowerCase();
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



  // sUSDB V2 相关辅助函数
  const handleSUSDBV2MaxClick = () => {
    if (usdbBalance) {
      setSUSDBV2Amount(formatUnits(usdbBalance.value, usdbBalance.decimals));
    }
  };

  const handleSUSDBV2AmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setSUSDBV2Amount(value);
    }
  };

  const handleWithdrawV2MaxClick = () => {
    if (sUSDBV2Balance) {
      setWithdrawV2Amount(formatUnits(sUSDBV2Balance.value, sUSDBV2Balance.decimals));
    }
  };

  const handleWithdrawV2AmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWithdrawV2Amount(value);
    }
  };



  // sUSDB V2 相关计算函数
  const calculateSUSDBV2FromUSDB = (usdbAmount) => {
    if (!usdbAmount || !exchangeRateV2) return "0";
    try {
      const usdbWei = parseUnits(usdbAmount, 6); // USDB is 6 decimals
      const sUSDBWei = (usdbWei * BigInt(1e6)) / exchangeRateV2; // exchangeRate is in 1e6 format
      return formatUnits(sUSDBWei, 6); // sUSDB is also 6 decimals
    } catch {
      return "0";
    }
  };

  const calculateUSDBFromSUSDBV2 = (sUSDBAmount) => {
    if (!sUSDBAmount || !exchangeRateV2) return "0";
    try {
      const sUSDBWei = parseUnits(sUSDBAmount, 6); // sUSDB is 6 decimals
      const usdbWei = (sUSDBWei * exchangeRateV2) / BigInt(1e6); // exchangeRate is in 1e6 format
      return formatUnits(usdbWei, 6); // USDB is 6 decimals
    } catch {
      return "0";
    }
  };

  // 获取当前 sUSDB V2 价值（以 USDB 计算）
  const getSUSDBV2ValueInUSDB = () => {
    if (!sUSDBV2Balance || !exchangeRateV2) return "0.00";
    try {
      const usdbValue = (sUSDBV2Balance.value * exchangeRateV2) / BigInt(1e6);
      return formatUnits(usdbValue, 6);
    } catch {
      return "0.00";
    }
  };



  // 检查USDB V2授权
  const needsUSDBV2Approval = () => {
    if (!sUSDBV2Amount || !usdbBalance) return false;
    try {
      const amountWei = parseUnits(sUSDBV2Amount, usdbBalance.decimals);
      if (amountWei <= 0) return false;
      if (usdbAllowanceV2 === undefined || usdbAllowanceV2 === null) return true;
      return usdbAllowanceV2 < amountWei;
    } catch {
      return true;
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



  // sUSDB V2 验证函数
  const isValidSUSDBV2Amount = () => {
    if (!sUSDBV2Amount || !usdbBalance) return false;
    try {
      const amountWei = parseUnits(sUSDBV2Amount, usdbBalance.decimals);
      return amountWei > 0 && amountWei <= usdbBalance.value;
    } catch {
      return false;
    }
  };

  const isValidWithdrawV2Amount = () => {
    if (!withdrawV2Amount || !sUSDBV2Balance) return false;
    try {
      const amountWei = parseUnits(withdrawV2Amount, sUSDBV2Balance.decimals);
      return amountWei > 0 && amountWei <= sUSDBV2Balance.value;
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



  // 格式化汇率显示 V2
  const formatExchangeRateV2 = () => {
    if (!exchangeRateV2) return "1.0000";
    try {
      const rate = formatUnits(exchangeRateV2, 6);
      return parseFloat(rate).toFixed(4);
    } catch {
      return "1.0000";
    }
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
      question: "What is sUSDB?",
      answer:
        "sUSDB is staked USDB that allows you to earn automatic compound interest rewards. Simply holding sUSDB earns you rewards through a dynamic exchange rate mechanism. The exchange rate is based on the ratio between USDB holdings and sUSDB supply in the contract - as arbitrage profits are converted to USDB and deposited into the sUSDB contract, this changes the ratio and users automatically benefit.",
    },
    {
      question: "How do I earn yields?",
      answer:
        "USDB's backing assets generate funding through hedged perpetual contracts and stablecoin rewards, producing 5%+ base annual yield. sUSDB holders automatically earn rewards through an increasing exchange rate - no manual claiming required.",
    },
    {
      question: "What is the 7-day withdrawal period for sUSDB?",
      answer:
        "When you request to withdraw sUSDB, there's a 7-day waiting period before you can execute the withdrawal. This security measure helps protect the protocol. You can cancel your withdrawal request at any time to restore your sUSDB tokens.",
    },
    {
      question: "How does the dynamic exchange rate work?",
      answer:
        "The sUSDB exchange rate is determined by the ratio of USDB holdings to sUSDB supply within the smart contract. As the protocol generates arbitrage profits, these are automatically converted to USDB and deposited into the sUSDB contract, increasing the USDB-to-sUSDB ratio. This means each sUSDB becomes worth more USDB over time, providing automatic compound returns to all sUSDB holders without any manual action required.",
    },
    {
      question: "What is Delta Hedging?",
      answer:
        "Delta hedging is a risk management strategy that uses perpetual contracts and deliverable futures to hedge spot assets, reducing price volatility risk while capturing funding rate yields.",
    },
    {
      question: "How do sUSDB rewards work?",
      answer:
        "sUSDB rewards work through automatic compound interest - simply holding sUSDB in your wallet earns you rewards. The protocol's arbitrage profits are converted to USDB and automatically deposited into the sUSDB contract, which increases the exchange rate ratio. This means your sUSDB becomes worth more USDB over time without any manual claiming or restaking required.",
    },
    {
      question: "What makes the sUSDB exchange rate increase?",
      answer:
        "The sUSDB exchange rate is based on the ratio between total USDB holdings and total sUSDB supply in the smart contract. When the protocol generates arbitrage profits, these profits are automatically converted to USDB and deposited into the sUSDB contract. This increases the USDB holdings while keeping sUSDB supply constant, thus improving the exchange rate and benefiting all sUSDB holders automatically.",
    },
    {
      question: "How is fund security ensured?",
      answer:
        "USDB is backed by a diversified portfolio of crypto assets and liquid stablecoins, using advanced risk management strategies with all assets undergoing strict security audits. sUSDB adds an additional layer of time-delayed withdrawals for enhanced security.",
    },
    {
      question: "How do I participate in USDB and sUSDB?",
      answer:
        "Simply connect your wallet and deposit USDB to receive sUSDB tokens. Once you hold sUSDB, you automatically start earning compound interest as arbitrage profits are deposited into the contract, increasing the value of each sUSDB token. No additional actions required - just hold and earn.",
    },
  ];

  return (
    isMounted && (
      <>
        <Head>
          <title>USDB & sUSDB - Synthetic USD Staking | BBBPump</title>
          <meta
            name="description"
            content="Earn yields with USDB and sUSDB. Deposit stablecoins to get USDB, then stake to sUSDB for automatic compound rewards. Delta hedging strategy with 5%+ yields."
          />
          <meta
            name="keywords"
            content="USDB, sUSDB, staking, synthetic USD, delta hedging, yield farming, auto-compound rewards"
          />
          <meta
            property="og:title"
            content="USDB & sUSDB - Synthetic USD Staking"
          />
          <meta
            property="og:description"
            content="Stake USDB to earn automatic compound rewards with sUSDB. Flexible withdrawal options with 7-day waiting period."
          />
          <meta property="og:image" content="/usdb.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="USDB & sUSDB - Synthetic USD Staking"
          />
          <meta
            name="twitter:description"
            content="Earn automatic compound rewards by staking your USDB to sUSDB"
          />
        </Head>

              <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Token Balances Section */}
        {isMounted && (
          <div className="pt-20 pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Token Balances</h2>
              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* USDB Card */}
                <div className="bg-white/90 backdrop-blur-sm border border-green-200/30 rounded-2xl p-6 relative group hover:bg-white hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center p-2">
                        <img
                          src="/usdb.png"
                          alt="USDB Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-gray-900 text-xl font-semibold">USDB</span>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('buy-usdb-section')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
                    >
                      Buy
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Balance</div>
                    <div className="text-gray-900 text-2xl font-bold">
                      {isConnected && usdbBalance ? formatUsdbAmount(usdbBalance.value) : "0.00"} USDB
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      ≈ ${isConnected && usdbBalance ? formatUsdbAmount(usdbBalance.value) : "0.00"} USD
                    </div>
                    {!isConnected && (
                      <div className="text-gray-400 text-xs mt-1">Connect wallet to view balance</div>
                    )}
                  </div>
                </div>



                {/* sUSDB V2 Card */}
                <div className="bg-white/90 backdrop-blur-sm border border-indigo-200/30 rounded-2xl p-6 relative group hover:bg-white hover:shadow-xl transition-all duration-300 shadow-lg hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center p-2">
                        <img
                          src="/susdb.png"
                          alt="sUSDB V2 Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                                             <div className="flex flex-col">
                         <span className="text-gray-900 text-xl font-semibold">sUSDB</span>
                         <span className="text-green-500 text-xs font-medium">Active</span>
                       </div>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('susdbv2-section')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium"
                    >
                      Earn
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Balance</div>
                    <div className="text-gray-900 text-2xl font-bold">
                      {isConnected && sUSDBV2Balance ? formatUsdbAmount(sUSDBV2Balance.value) : "0.00"} sUSDB
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      ≈ ${isConnected && sUSDBV2Balance ? getSUSDBV2ValueInUSDB() : "0.00"} USD
                    </div>
                    <div className="text-indigo-600 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L9 4.414 2.707 10.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Auto-Compounding
                    </div>
                    {!isConnected && (
                      <div className="text-gray-400 text-xs mt-1">Connect wallet to view balance</div>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

        {/* Owner Admin Section - Only visible to contract owner */}
        {isMounted && isConnected && isOwner() && (
          <div className="pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contract Administration</h2>
                  </div>
                  <div className="text-red-600 text-sm font-medium bg-red-100 px-3 py-1 rounded-lg">
                    Owner Access
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contract USDC.e Balance */}
                  <div className="bg-white rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center p-1">
                          <img
                            src="/usdc.jpg"
                            alt="USDC.e Logo"
                            className="w-full h-full object-contain rounded-full"
                          />
                        </div>
                        <div>
                          <span className="text-gray-900 text-lg font-semibold">Contract USDC.e</span>
                          <div className="text-sm text-gray-500">Available for withdrawal</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {contractUsdcBalance ? parseFloat(formatUnits(contractUsdcBalance.value, contractUsdcBalance.decimals)).toFixed(4) : "0.0000"}
                    </div>
                    <div className="text-gray-500 text-sm mb-4">
                      ≈ ${contractUsdcBalance ? (parseFloat(formatUnits(contractUsdcBalance.value, contractUsdcBalance.decimals)) * 0.999).toFixed(2) : "0.00"} USD
                    </div>
                    <WriteButton
                      data={{
                        address: contracts[chainId]?.usdb?.address,
                        abi: contracts[chainId]?.usdb?.abi,
                        functionName: "withdrawToken",
                        args: [
                          contracts[chainId]?.xdcUSDC?.address,
                          contractUsdcBalance?.value || 0,
                        ],
                      }}
                      callback={() => {
                        refetchContractUsdcBalance();
                      }}
                      disabled={!contractUsdcBalance || contractUsdcBalance.value <= 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 cursor-pointer transition-all duration-200 text-center shadow-md"
                      buttonName="Withdraw USDC.e"
                    />
                  </div>

                  {/* Contract USDT Balance */}
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center p-1">
                          <img
                            src="/usdt.jpg"
                            alt="USDT Logo"
                            className="w-full h-full object-contain rounded-full"
                          />
                        </div>
                        <div>
                          <span className="text-gray-900 text-lg font-semibold">Contract USDT</span>
                          <div className="text-sm text-gray-500">Available for withdrawal</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {contractUsdtBalance ? parseFloat(formatUnits(contractUsdtBalance.value, contractUsdtBalance.decimals)).toFixed(4) : "0.0000"}
                    </div>
                    <div className="text-gray-500 text-sm mb-4">
                      ≈ ${contractUsdtBalance ? (parseFloat(formatUnits(contractUsdtBalance.value, contractUsdtBalance.decimals)) * 0.999).toFixed(2) : "0.00"} USD
                    </div>
                    <WriteButton
                      data={{
                        address: contracts[chainId]?.usdb?.address,
                        abi: contracts[chainId]?.usdb?.abi,
                        functionName: "withdrawToken",
                        args: [
                          contracts[chainId]?.stargateUSDT?.address,
                          contractUsdtBalance?.value || 0,
                        ],
                      }}
                      callback={() => {
                        refetchContractUsdtBalance();
                      }}
                      disabled={!contractUsdtBalance || contractUsdtBalance.value <= 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 cursor-pointer transition-all duration-200 text-center shadow-md"
                      buttonName="Withdraw USDT"
                    />
                  </div>

                  {/* Contract Stargate USDC Balance */}
                  <div className="bg-white rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center p-1">
                          <img
                            src="/usdc.jpg"
                            alt="Stargate USDC Logo"
                            className="w-full h-full object-contain rounded-full"
                          />
                        </div>
                        <div>
                          <span className="text-gray-900 text-lg font-semibold">Contract Stargate USDC</span>
                          <div className="text-sm text-gray-500">Available for withdrawal</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {contractStargateUsdcBalance ? parseFloat(formatUnits(contractStargateUsdcBalance.value, contractStargateUsdcBalance.decimals)).toFixed(4) : "0.0000"}
                    </div>
                    <div className="text-gray-500 text-sm mb-4">
                      ≈ ${contractStargateUsdcBalance ? (parseFloat(formatUnits(contractStargateUsdcBalance.value, contractStargateUsdcBalance.decimals)) * 0.999).toFixed(2) : "0.00"} USD
                    </div>
                    <WriteButton
                      data={{
                        address: contracts[chainId]?.usdb?.address,
                        abi: contracts[chainId]?.usdb?.abi,
                        functionName: "withdrawToken",
                        args: [
                          contracts[chainId]?.stargateUSDC?.address,
                          contractStargateUsdcBalance?.value || 0,
                        ],
                      }}
                      callback={() => {
                        refetchContractStargateUsdcBalance();
                      }}
                      disabled={!contractStargateUsdcBalance || contractStargateUsdcBalance.value <= 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 cursor-pointer transition-all duration-200 text-center shadow-md"
                      buttonName="Withdraw Stargate USDC"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Administrator Notice</h4>
                      <p className="text-sm text-yellow-700">
                        You are viewing this section because you are the contract owner. These functions allow you to withdraw tokens from the USDB contract. Please use them responsibly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Supply Section */}
        {isMounted && (
          <div className="pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/90 backdrop-blur-sm border border-blue-200/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Total Supply Statistics</h2>
                  </div>
                  <div className="text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg">
                    Live Data
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center p-1">
                        <img
                          src="/usdb.png"
                          alt="USDB Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-gray-900 text-lg font-semibold">USDB Total Supply</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {usdbTotalSupply ? `${formatUsdbAmount(usdbTotalSupply)} USDB` : "Loading..."}
                    </div>
                  </div>
                  


                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center p-1">
                        <img
                          src="/susdb.png"
                          alt="sUSDB V2 Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                                             <div className="flex flex-col">
                         <span className="text-gray-900 text-lg font-semibold">sUSDB Total Supply</span>
                         <span className="text-green-500 text-xs font-medium">Active</span>
                       </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {sUSDBV2TotalSupply ? `${formatUsdbAmount(sUSDBV2TotalSupply)} sUSDB` : "Loading..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* <LiFiWidget integrator="Your dApp/company name" config={widgetConfig} /> */}
              
              {/* Buy USDB Section */}
              <div id="buy-usdb-section" className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center p-2">
                      <img
                        src="/usdb.png"
                        alt="USDB Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Buy USDB
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Select a stable coin to deposit and receive USDB at 1:1 ratio
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Token Selection & Information */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-fit">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Available Tokens
                    </h3>

                                          {/* 代币选择器 */}
                    <div className="mb-6">
                      <div className="space-y-3">
                        {Object.keys(tokenConfigs).map((token) => {
                          const config = tokenConfigs[token];
                          const balance = getTokenBalance(token);
                          const isSelected = selectedToken === token;
                          const contractAddress =
                            config.getContract()?.address;

                          return (
                            <button
                              key={token}
                              onClick={() => setSelectedToken(token)}
                              className={`w-full p-5 border-2 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                                isSelected
                                  ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg transform scale-[1.02]"
                                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50 hover:shadow-md"
                              }`}
                            >
                                                              {/* 左侧：图标和代币信息 */}
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ${
                                    isSelected
                                      ? "bg-gradient-to-r from-green-100 to-emerald-100 ring-2 ring-green-500"
                                      : config.iconBg
                                  }`}
                                >
                                  <img
                                    src={config.icon}
                                    alt={`${config.symbol} Logo`}
                                    className="w-9 h-9 rounded-xl object-cover"
                                  />
                                </div>
                                <div className="text-left">
                                  <div
                                    className={`font-bold text-xl ${
                                      isSelected
                                        ? "text-green-700"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {config.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {config.name}
                                  </div>
                                                                      {/* 合约地址显示 */}
                                  {contractAddress && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="bg-gray-100 rounded-md px-2 py-1">
                                        <span className="text-xs text-gray-600 font-mono">
                                          {contractAddress.slice(0, 6)}...
                                          {contractAddress.slice(-4)}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(
                                            contractAddress
                                          );
                                          setCopiedAddress(contractAddress);
                                        }}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200"
                                        title="Copy contract address"
                                      >
                                        {copiedAddress === contractAddress ? (
                                          <svg
                                            className="w-3 h-3 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        ) : (
                                          <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                  </div>
                                </div>

                                                              {/* 右侧：余额信息 */}
                              <div className="text-right">
                                {isMounted && isConnected && balance ? (
                                  <>
                                    <div
                                      className={`font-bold text-lg ${
                                        isSelected
                                          ? "text-green-700"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {parseFloat(
                                        formatUnits(
                                          balance.value,
                                          balance.decimals
                                        )
                                      ).toFixed(4)}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">
                                      ≈ $
                                      {(
                                        parseFloat(
                                          formatUnits(
                                            balance.value,
                                            balance.decimals
                                          )
                                        ) * 0.999
                                      ).toFixed(2)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-400 font-medium">
                                    {isMounted && isConnected
                                      ? "0.0000"
                                      : "-- --"}
                                  </div>
                                )}

                                {/* 选中标记 */}
                                {isSelected && (
                                  <div className="mt-2">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ml-auto">
                                      <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                              </button>
                            );
                                                  })}
                      </div>
                    </div>

                    {/* Token Information */}
                    {isMounted && isConnected && tokenBalance && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Selected Token Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Your Balance:</span>
                            <span className="font-medium">
                              {parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)} {tokenConfigs[selectedToken]?.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">USD Value:</span>
                            <span className="font-medium">
                              ≈ ${(parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) * 0.999).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exchange Rate:</span>
                            <span className="font-medium">1:1 to USDB</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deposit Amount & Actions */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-fit">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Deposit Amount
                    </h3>

                    {/* 输入金额 */}
                    <div className="mb-4">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.0"
                            className="w-full px-6 py-4 border-0 bg-white rounded-xl focus:ring-2 focus:ring-green-500 text-2xl font-bold text-gray-900 placeholder-gray-400 shadow-sm"
                            disabled={!isMounted || !isConnected}
                          />
                          <button
                            onClick={handleMaxClick}
                            disabled={!isMounted || !isConnected}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                          >
                            MAX
                          </button>
                        </div>
                        {tokenBalance && amount && (
                          <div className="mt-3 flex justify-between text-sm text-gray-600">
                            <span>Available: {parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)}</span>
                            <span>≈ ${(parseFloat(amount || "0") * 0.999).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="space-y-3">
                      {isMounted && isConnected ? (
                        <>
                          {needsApproval() ? (
                            <>
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-blue-800">Approval Required</div>
                                    <div className="text-sm text-blue-700">First approve spending to proceed with deposit</div>
                                  </div>
                                </div>
                              </div>
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
                                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-300 text-center text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                buttonName="Approve Token"
                              />
                            </>
                          ) : (
                            <>
                              {amount && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      <div>
                                        <div className="font-semibold text-green-800">You will receive</div>
                                        <div className="text-sm text-green-700">{amount} USDB tokens</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-green-800">{amount}</div>
                                      <div className="text-xs text-green-600">USDB</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <WriteButton
                                data={{
                                  address: contracts[chainId]?.usdb?.address,
                                  abi: contracts[chainId]?.usdb?.abi,
                                  functionName: "deposit",
                                  args: [
                                    getTokenConfig()?.address,
                                    parseUnits(
                                      amount || "0",
                                      tokenBalance?.decimals || 18
                                    ),
                                  ],
                                }}
                                callback={() => {
                                  setAmount("");
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
                                className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 cursor-pointer transition-all duration-300 text-center text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                                buttonName="Buy USDB"
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={privyLogin}
                            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                          >
                            Connect Wallet to Start
                          </button>
                          
                          {/* 提示信息 */}
                          <div className="text-center">
                            <div className="text-sm text-gray-600">
                              Connect your wallet to deposit and receive USDB tokens
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* sUSDB V2 Section */}
          {isMounted && (
            <div id="susdbv2-section" className="py-8 sm:py-16 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6 md:mb-8">
                  <div className="flex flex-col sm:inline-flex sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 md:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-2xl flex items-center justify-center p-2">
                      <img
                        src="/susdb.png"
                        alt="sUSDB Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
                      sUSDB - Staked USDB
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base px-4 sm:px-0">
                    Stake your USDB to earn automatic compound interest rewards with flexible withdrawal options
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* sUSDB V2 Balance & Rewards */}
                  <div className="lg:col-span-1 order-1">
                    {/* Balance Overview */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                        Your sUSDB Portfolio
                      </h3>

                      {/* sUSDB V2 Balance */}
                      <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-4 sm:p-5 mb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center p-2">
                              <img
                                src="/susdb.png"
                                alt="sUSDB Logo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                {sUSDBV2Balance
                                  ? formatUsdbAmount(sUSDBV2Balance.value)
                                  : "0.00"}
                              </div>
                              <div className="text-sm text-gray-600">
                                sUSDB Balance
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-indigo-600">
                              ≈ $
                              {sUSDBV2Balance
                                ? getSUSDBV2ValueInUSDB()
                                : "0.00"}
                            </div>
                            <div className="text-xs text-gray-500">
                              USD Value
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exchange Rate Info */}
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3m-3 3l-3-3m3 3V9a4 4 0 118 0v1.586a3 3 0 01-1.293 2.707L12 16" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
                                1 sUSDB = {formatExchangeRateV2()} USDB
                              </div>
                              <div className="text-xs text-gray-600">
                                Current exchange rate
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="text-xs font-semibold text-blue-600 bg-white/60 px-2 py-1 rounded-lg whitespace-nowrap">
                              Auto-Compound
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center relative group">
                          <div className="text-base sm:text-lg font-bold text-green-600">
                            5%+
                          </div>
                          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                            Base APY
                            <div className="relative">
                              <svg 
                                className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help transition-colors" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10">
                                <div className="font-semibold mb-1">sUSDB APY: 5.00%+</div>
                                <div className="text-gray-300 text-xs leading-relaxed mb-2">
                                  Protocol efficiency with automatic reward distribution. This figure represents current returns based on protocol performance.
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Last Updated: 18 Jun 25
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-base sm:text-lg font-bold text-indigo-600">
                            24/7
                          </div>
                          <div className="text-xs text-gray-600">
                            Auto Rewards
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Withdrawals V2 */}
                    {activeWithdrawalsV2 &&
                      activeWithdrawalsV2[0] &&
                      activeWithdrawalsV2[0].length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Active Withdrawals
                          </h3>
                          <div className="space-y-3">
                            {activeWithdrawalsV2[0].map((withdrawal, index) => {
                              const requestIndex = activeWithdrawalsV2[1][index];
                              const unlockTime =
                                Number(withdrawal.unlockTime) * 1000;
                              const now = Date.now();
                              const canExecute = now >= unlockTime;
                              const timeLeft = unlockTime - now;

                              return (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">
                                      {formatUsdbAmount(withdrawal.sUSDBAmount)}{" "}
                                      sUSDB
                                    </span>
                                    <span
                                      className={`text-sm px-2 py-1 rounded ${
                                        canExecute
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {canExecute
                                        ? "Ready"
                                        : `${Math.ceil(
                                            timeLeft / (1000 * 60 * 60 * 24)
                                          )} days left`}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {canExecute ? (
                                      <WriteButton
                                        data={{
                                          address:
                                            contracts[chainId]?.sUSDBV2?.address,
                                          abi: contracts[chainId]?.sUSDBV2?.abi,
                                          functionName: "executeWithdrawal",
                                          args: [requestIndex],
                                        }}
                                        callback={() => {
                                          refetchSUSDBV2Balance();
                                          refetchUsdbBalance();
                                          refetchActiveWithdrawalsV2();
                                          refetchExchangeRateV2();
                                        }}
                                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 cursor-pointer text-sm text-center"
                                        buttonName="Execute"
                                      />
                                    ) : null}
                                    <WriteButton
                                      data={{
                                        address:
                                          contracts[chainId]?.sUSDBV2?.address,
                                        abi: contracts[chainId]?.sUSDBV2?.abi,
                                        functionName: "cancelWithdrawal",
                                        args: [requestIndex],
                                      }}
                                      callback={() => {
                                        refetchSUSDBV2Balance();
                                        refetchActiveWithdrawalsV2();
                                        refetchExchangeRateV2();
                                      }}
                                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 cursor-pointer text-sm text-center"
                                      buttonName="Cancel"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 order-2">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                      {/* Tab Navigation */}
                      <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
                        <button
                          onClick={() => setActiveV2Tab("deposit")}
                          className={`flex-1 py-2 sm:py-3 font-medium border-b-2 transition-colors text-center ${
                            activeV2Tab === "deposit"
                              ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm sm:text-base">Deposit</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveV2Tab("withdraw")}
                          className={`flex-1 py-2 sm:py-3 font-medium border-b-2 transition-colors text-center ${
                            activeV2Tab === "withdraw"
                              ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm sm:text-base">Withdraw</span>
                          </div>
                        </button>
                      </div>

                      {/* Deposit Tab */}
                      {activeV2Tab === "deposit" && (
                        <div>
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                Deposit USDB →
                              </h3>
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center p-1">
                                <img
                                  src="/susdb.png"
                                  alt="sUSDB Logo"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                sUSDB
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                              Current rate: 1 USDB = {exchangeRateV2 ? (1 / parseFloat(formatExchangeRateV2())).toFixed(4) : "0.0000"} sUSDB • Auto-compounding rewards
                            </p>
                          </div>

                          {/* Amount Input Card */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Amount to Deposit
                              </label>
                              <div className="text-sm text-gray-500">
                                Available:{" "}
                                {usdbBalance
                                  ? formatUsdbAmount(usdbBalance.value)
                                  : "0.00"}{" "}
                                USDB
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={sUSDBV2Amount}
                                onChange={handleSUSDBV2AmountChange}
                                placeholder="0.0"
                                disabled={!isMounted || !isConnected}
                                className="w-full px-4 py-4 border-0 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-xl font-semibold text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <button
                                onClick={handleSUSDBV2MaxClick}
                                disabled={!isMounted || !isConnected}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 font-medium text-sm rounded-md transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                MAX
                              </button>
                            </div>
                            {sUSDBV2Amount && (
                              <div className="mt-2 text-sm text-gray-600">
                                You will receive: {calculateSUSDBV2FromUSDB(sUSDBV2Amount)} sUSDB
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            {isMounted && isConnected ? (
                              <>
                                {needsUSDBV2Approval() ? (
                              <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    First approve USDB spending to proceed with
                                    deposit
                                  </div>
                                </div>
                                <WriteButton
                                  data={{
                                    address: contracts[chainId]?.usdb?.address,
                                    abi: contracts[chainId]?.usdb?.abi,
                                    functionName: "approve",
                                    args: [
                                      contracts[chainId]?.sUSDBV2?.address,
                                      maxUint256,
                                    ],
                                  }}
                                  callback={() => {
                                    refetchUSDBAllowanceV2();
                                  }}
                                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-200 text-center shadow-lg"
                                  buttonName="Approve USDB"
                                />
                              </>
                            ) : (
                              <WriteButton
                                data={{
                                  address: contracts[chainId]?.sUSDBV2?.address,
                                  abi: contracts[chainId]?.sUSDBV2?.abi,
                                  functionName: "deposit",
                                  args: [
                                    parseUnits(
                                      sUSDBV2Amount || "0",
                                      usdbBalance?.decimals || 6
                                    ),
                                  ],
                                }}
                                callback={() => {
                                  setSUSDBV2Amount("");
                                  refetchSUSDBV2Balance();
                                  refetchUsdbBalance();
                                  refetchExchangeRateV2();
                                }}
                                disabled={!isValidSUSDBV2Amount()}
                                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 cursor-pointer transition-all duration-200 text-center shadow-lg"
                                buttonName="Deposit & Start Earning"
                              />
                            )}
                              </>
                            ) : (
                              <button
                                onClick={privyLogin}
                                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 text-center shadow-lg"
                              >
                                Connect Wallet to Start Staking
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Withdraw Tab */}
                      {activeV2Tab === "withdraw" && (
                        <div>
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Request Withdrawal
                            </h3>
                            <p className="text-gray-600 text-sm">
                              7-day waiting period • Cancel anytime to restore
                              sUSDB
                            </p>
                          </div>

                          {/* Amount Input Card */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Amount to Withdraw
                              </label>
                              <div className="text-sm text-gray-500">
                                Available:{" "}
                                {sUSDBV2Balance
                                  ? formatUsdbAmount(sUSDBV2Balance.value)
                                  : "0.00"}{" "}
                                sUSDB
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={withdrawV2Amount}
                                onChange={handleWithdrawV2AmountChange}
                                placeholder="0.0"
                                disabled={!isMounted || !isConnected}
                                className="w-full px-4 py-4 border-0 bg-white rounded-lg focus:ring-2 focus:ring-red-500 text-xl font-semibold text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <button
                                onClick={handleWithdrawV2MaxClick}
                                disabled={!isMounted || !isConnected}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 font-medium text-sm rounded-md transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                MAX
                              </button>
                            </div>
                            {withdrawV2Amount && (
                              <div className="mt-2 text-sm text-gray-600">
                                You will receive: {calculateUSDBFromSUSDBV2(withdrawV2Amount)} USDB (after 7 days)
                              </div>
                            )}
                          </div>

                          {isMounted && isConnected ? (
                            <WriteButton
                              data={{
                                address: contracts[chainId]?.sUSDBV2?.address,
                                abi: contracts[chainId]?.sUSDBV2?.abi,
                                functionName: "requestWithdrawal",
                                args: [
                                  parseUnits(
                                    withdrawV2Amount || "0",
                                    sUSDBV2Balance?.decimals || 6
                                  ),
                                ],
                              }}
                              callback={() => {
                                setWithdrawV2Amount("");
                                refetchSUSDBV2Balance();
                                refetchActiveWithdrawalsV2();
                                refetchExchangeRateV2();
                              }}
                              disabled={!isValidWithdrawV2Amount()}
                              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 cursor-pointer transition-all duration-200 text-center shadow-lg mb-4"
                              buttonName="Request Withdrawal"
                            />
                          ) : (
                            <button
                              onClick={privyLogin}
                              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 text-center shadow-lg mb-4"
                            >
                              Connect Wallet to Withdraw
                            </button>
                          )}

                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-amber-800 mb-1">
                                  Important Notes
                                </h4>
                                <ul className="text-sm text-amber-700 space-y-1">
                                  <li>
                                    • 7-day waiting period before execution
                                  </li>
                                  <li>
                                    • Cancel anytime to restore your sUSDB
                                  </li>
                                  <li>
                                    • Rewards stop accruing during withdrawal
                                    period
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
                  USDB is an innovative synthetic USD solution providing
                  stability and yield for digital currencies
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Synthetic USD Solution
                    </h3>
                    <p className="text-gray-600">
                      USDB provides a crypto-native scalable solution for
                      currency through advanced delta hedging strategies
                      implementing risk management across major digital assets.
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
                        <span className="text-sm text-gray-700">
                          <strong>80% of funds</strong> allocated for arbitrage
                          opportunities
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          <strong>20% of funds</strong> reserved for liquidity
                          provision
                        </span>
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
                    Stake USDB to Get sUSDB
                  </h3>
                  <p className="text-gray-600">
                    Simply stake your USDB to receive sUSDB tokens. The dynamic exchange rate ensures you automatically earn compound interest as arbitrage profits are deposited into the contract.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Hold & Earn Automatically
                  </h3>
                  <p className="text-gray-600">
                    Just hold sUSDB in your wallet and earn automatic compound interest. As arbitrage profits flow into the contract, your sUSDB becomes worth more USDB over time - no manual actions required.
                  </p>
                </div>
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => {
                    document.getElementById('susdbv2-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-lg"
                >
                  {isMounted && isConnected
                    ? "Start Staking"
                    : "Connect Wallet to Start Staking"}
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
        </div>
      </>
    )
  );
};

export default USDB;

