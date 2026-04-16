import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { contracts } from "@/config";
import Head from "next/head";
import Link from "next/link";

const AssetDetail = () => {
  const router = useRouter();
  const { address: assetAddress } = router.query;
  const chainId = useChainId();
  const { address: userAddress, isConnected } = useAccount();
  
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState(null);
  const [userData, setUserData] = useState(null);

  const lendContract = contracts[chainId]?.lend;
  const bbbToken = contracts[chainId]?.bbb;

  // Ray Math functions
  const RAY = parseUnits("1", 27);
  const rayMul = (a, b) => {
    if (a === 0n || b === 0n) return 0n;
    const halfRay = RAY / 2n;
    return (a * b + halfRay) / RAY;
  };

  // Asset icon mapping
  const assetIconMap = useMemo(() => {
    const map = {
      BBB: "/bbb.jpg",
      USDB: "/usdb.png", 
      USDC: "/usdc.jpg",
      USDT: "/usdt.jpg",
      XDC: "/xdc.png",
      WETH: "/xdc.png",
    };

    if (contracts[chainId]?.bbb?.address) {
      map[contracts[chainId].bbb.address.toLowerCase()] = "/bbb.jpg";
    }
    if (contracts[chainId]?.usdb?.address) {
      map[contracts[chainId].usdb.address.toLowerCase()] = "/usdb.png";
    }
    if (contracts[chainId]?.xdcUSDC?.address) {
      map[contracts[chainId].xdcUSDC.address.toLowerCase()] = "/usdc.jpg";
    }
    if (contracts[chainId]?.stargateUSDC?.address) {
      map[contracts[chainId].stargateUSDC.address.toLowerCase()] = "/usdc.jpg";
    }
    if (contracts[chainId]?.stargateUSDT?.address) {
      map[contracts[chainId].stargateUSDT.address.toLowerCase()] = "/usdt.jpg";
    }

    return map;
  }, [chainId]);

  // Create contracts for asset data
  const createAssetContracts = useMemo(() => {
    if (!assetAddress || !lendContract) return [];
    
    return [
      // Basic asset info
      { address: assetAddress, abi: bbbToken?.abi, functionName: "symbol" },
      { address: assetAddress, abi: bbbToken?.abi, functionName: "name" },
      { address: assetAddress, abi: bbbToken?.abi, functionName: "decimals" },
      { address: assetAddress, abi: bbbToken?.abi, functionName: "totalSupply" },
      
      // Lending protocol data
      { ...lendContract, functionName: "reserves", args: [assetAddress] },
      { ...lendContract, functionName: "assetPrices", args: [assetAddress] },
      { ...lendContract, functionName: "getAssetRates", args: [assetAddress] },
    ];
  }, [assetAddress, lendContract, bbbToken]);

  // Create user data contracts
  const createUserContracts = useMemo(() => {
    if (!userAddress || !assetAddress || !lendContract) return [];
    
    return [
      { ...lendContract, functionName: "getUserAccountData", args: [userAddress] },
      { ...lendContract, functionName: "balanceOf", args: [userAddress, assetAddress] },
      { ...lendContract, functionName: "getUserVariableDebt", args: [userAddress, assetAddress] },
      { address: assetAddress, abi: bbbToken?.abi, functionName: "balanceOf", args: [userAddress] },
      { address: assetAddress, abi: bbbToken?.abi, functionName: "allowance", args: [userAddress, lendContract.address] },
    ];
  }, [userAddress, assetAddress, lendContract, bbbToken]);

  const { data: assetContractData } = useReadContracts({
    contracts: createAssetContracts,
    query: { enabled: !!(assetAddress && lendContract) },
  });

  const { data: userContractData } = useReadContracts({
    contracts: createUserContracts,
    query: { enabled: !!(userAddress && assetAddress && lendContract) },
  });

  // Process asset data
  useEffect(() => {
    if (assetContractData && assetContractData.length > 0) {
      const symbol = assetContractData[0]?.result || "Unknown";
      const name = assetContractData[1]?.result || "Unknown Asset";
      const decimals = assetContractData[2]?.result || 18;
      const totalSupply = assetContractData[3]?.result || 0n;
      const reserve = assetContractData[4]?.result;
      const assetPrice = assetContractData[5]?.result || 0n;
      const rates = assetContractData[6]?.result;

      // Get scaled values and indexes
      const scaledTotalSupply = reserve?.[7] || 0n;
      const scaledTotalVariableDebt = reserve?.[8] || 0n;
      const liquidityIndex = reserve?.[4] || parseEther("1");
      const variableBorrowIndex = reserve?.[5] || parseEther("1");

      // Calculate actual supply and borrow amounts
      const actualTotalSupply = rayMul(scaledTotalSupply, liquidityIndex);
      const actualTotalBorrow = rayMul(scaledTotalVariableDebt, variableBorrowIndex);

      // Get dynamic rates
      const supplyAPY = rates?.[0] || 0n;
      const borrowAPY = rates?.[1] || 0n;
      const utilizationRate = rates?.[2] || 0n;
      const supplyRatePercent = rates?.[3] || 0n;
      const borrowRatePercent = rates?.[4] || 0n;
      const utilizationPercent = rates?.[5] || 0n;

      const icon = assetIconMap[assetAddress?.toLowerCase()] || assetIconMap[symbol] || "/logo.png";

      setAssetData({
        address: assetAddress,
        symbol,
        name,
        decimals: Number(decimals),
        totalSupply,
        totalSupplyLending: actualTotalSupply,
        totalBorrow: actualTotalBorrow,
        availableLiquidity: actualTotalSupply > actualTotalBorrow ? actualTotalSupply - actualTotalBorrow : 0n,
        utilizationRate,
        supplyAPY,
        borrowAPY,
        supplyRatePercent,
        borrowRatePercent,
        utilizationPercent,
        price: assetPrice,
        icon,
        liquidityIndex,
        variableBorrowIndex,
      });
    }
  }, [assetContractData, assetAddress, assetIconMap]);

  // Process user data
  useEffect(() => {
    if (userContractData && userContractData.length > 0) {
      const accountData = userContractData[0]?.result;
      const userSupplied = userContractData[1]?.result || 0n;
      const userBorrowed = userContractData[2]?.result || 0n;
      const balance = userContractData[3]?.result || 0n;
      const allowance = userContractData[4]?.result || 0n;

      setUserData({
        totalCollateralBase: accountData?.[0] || 0n,
        totalDebtBase: accountData?.[1] || 0n,
        availableBorrowsBase: accountData?.[2] || 0n,
        currentLiquidationThreshold: accountData?.[3] || 0n,
        ltv: accountData?.[4] || 0n,
        healthFactor: accountData?.[5] || 0n,
        userSupplied,
        userBorrowed,
        balance,
        allowance,
      });
    }
  }, [userContractData]);

  useEffect(() => {
    if (assetData) {
      setLoading(false);
    }
  }, [assetData]);

  // Helper functions
  const formatNumber = (value, decimals = 18, displayDecimals = 4) => {
    if (!value) return "0.0000";
    return Number(formatUnits(value, decimals)).toLocaleString("en-US", {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
    });
  };

  const formatAPY = (value) => {
    if (!value) return "0.00";
    return (Number(formatUnits(value, 27)) * 100).toFixed(2);
  };

  const formatUSDValue = (tokenAmount, price, decimals) => {
    if (!tokenAmount || !price) return "0.00";
    const tokenValue = Number(formatUnits(tokenAmount, decimals));
    const priceValue = Number(formatEther(price));
    return (tokenValue * priceValue).toFixed(2);
  };

  const getUtilizationColor = (utilization) => {
    const util = Number(formatUnits(utilization, 27)) * 100;
    if (util < 50) return "text-primary";
    if (util < 80) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading || !assetData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-base-content/60">Loading asset details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{assetData.symbol} - Asset Details | BBB Finance</title>
        <meta name="description" content={`Detailed information about ${assetData.name} lending and borrowing on BBB Finance`} />
      </Head>

      <div className="min-h-screen bg-base-200">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/lend" className="text-blue-600 hover:text-blue-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Lending
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <img src={assetData.icon} alt={assetData.symbol} className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-3xl font-bold text-base-content">{assetData.name}</h1>
                <p className="text-xl text-base-content/60">{assetData.symbol}</p>
                <p className="text-sm text-base-content/50 font-mono">{assetData.address}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <div className="text-sm text-base-content/60 mb-2">Current Price</div>
              <div className="text-2xl font-bold text-base-content">
                ${Number(formatEther(assetData.price)).toFixed(4)}
              </div>
            </div>
            
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <div className="text-sm text-base-content/60 mb-2">Supply APY</div>
              <div className="text-2xl font-bold text-primary">
                {formatAPY(assetData.supplyAPY)}%
              </div>
            </div>
            
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <div className="text-sm text-base-content/60 mb-2">Borrow APY</div>
              <div className="text-2xl font-bold text-red-600">
                {formatAPY(assetData.borrowAPY)}%
              </div>
            </div>
            
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <div className="text-sm text-base-content/60 mb-2">Utilization Rate</div>
              <div className={`text-2xl font-bold ${getUtilizationColor(assetData.utilizationRate)}`}>
                {formatAPY(assetData.utilizationRate)}%
              </div>
            </div>
          </div>

          {/* Market Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-base-content mb-6">Market Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Total Supply</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatNumber(assetData.totalSupplyLending, assetData.decimals)} {assetData.symbol}
                    </div>
                    <div className="text-sm text-base-content/50">
                      ${formatUSDValue(assetData.totalSupplyLending, assetData.price, assetData.decimals)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/60">Total Borrowed</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatNumber(assetData.totalBorrow, assetData.decimals)} {assetData.symbol}
                    </div>
                    <div className="text-sm text-base-content/50">
                      ${formatUSDValue(assetData.totalBorrow, assetData.price, assetData.decimals)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/60">Available Liquidity</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatNumber(assetData.availableLiquidity, assetData.decimals)} {assetData.symbol}
                    </div>
                    <div className="text-sm text-base-content/50">
                      ${formatUSDValue(assetData.availableLiquidity, assetData.price, assetData.decimals)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/60">Token Total Supply</span>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatNumber(assetData.totalSupply, assetData.decimals)} {assetData.symbol}
                    </div>
                    <div className="text-sm text-base-content/50">
                      ${formatUSDValue(assetData.totalSupply, assetData.price, assetData.decimals)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interest Rate Model */}
            <div className="bg-base-200 border border-base-300 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-base-content mb-6">Interest Rate Model</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Supply APY</span>
                  <span className="font-semibold text-primary">
                    {formatAPY(assetData.supplyAPY)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/60">Borrow APY (Variable)</span>
                  <span className="font-semibold text-red-600">
                    {formatAPY(assetData.borrowAPY)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-base-content/60">Utilization Rate</span>
                  <span className={`font-semibold ${getUtilizationColor(assetData.utilizationRate)}`}>
                    {formatAPY(assetData.utilizationRate)}%
                  </span>
                </div>
                
                <div className="pt-4 border-t border-base-300">
                  <div className="text-sm text-base-content/60 mb-2">Utilization Progress</div>
                  <div className="w-full bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(Number(formatAPY(assetData.utilizationRate)), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-base-content/50 mt-1">
                    {formatAPY(assetData.utilizationRate)}% of supplied assets are being borrowed
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default AssetDetail; 