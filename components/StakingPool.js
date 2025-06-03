import { useState, useEffect, useCallback } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { contracts } from "@/config";
import { useChainId, useAccount, useBalance, useReadContracts } from "wagmi";
import WriteButton from "@/components/WriteButton";
import Link from "next/link";
import { useRouter } from "next/router";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import LpStakeABI from "@/abi/LpStakeABI.json";
import XDCStakeABI from "@/abi/XDCStakeABI.json";
import USDBStakeABI from "@/abi/USDBStakeABI.json";
import ERC20ABI from "@/abi/ERC20ABI.json";

const StakingPool = ({
  pid,
  poolType, // 'xdc', 'usdb', 'lp'
  poolConfig, // Configuration from POOL_CONFIGS
  data,
  setData,
  addTokenToWallet,
  bbbTokenAddress,
  onAPRChange, // Callback to report APR to parent for sorting
}) => {
  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();

  // Local state for modals and amounts
  const [localState, setLocalState] = useState({
    showStakeModal: false,
    showUnstakeModal: false,
    stakeAmount: "",
    unstakeAmount: "",
  });

  // Pool data state
  const [poolData, setPoolData] = useState(null);

  // Parameter validation
  const hasValidParams = poolType && ['xdc', 'usdb', 'lp'].includes(poolType) && 
    (poolType !== 'lp' || (pid !== undefined && pid !== null));

  if (!hasValidParams) {
    console.error('Invalid parameters - poolType:', poolType, 'pid:', pid);
  }

  // Contract addresses
  const lpStakeAddress = contracts[chainId]?.lpStake?.address || "0x123";
  const xdcStakeAddress = contracts[chainId]?.xdcStake?.address || "0x123";
  const usdbStakeAddress = contracts[chainId]?.usdbStake?.address || "0x123";
  const usdbTokenAddress = contracts[chainId]?.usdb?.address || "0x123";

  // Native XDC balance for XDC pool
  const { data: xdcBalance } = useBalance({
    address,
    query: {
      enabled: !!address && poolType === 'xdc',
    },
  });

  // Read pool data based on pool type
  const createPoolContracts = () => {
    if (poolType === 'xdc') {
      return [
        {
          address: xdcStakeAddress,
          abi: XDCStakeABI,
          functionName: "poolInfo",
          args: [0],
        },
        {
          address: xdcStakeAddress,
          abi: XDCStakeABI,
          functionName: "userInfo",
          args: [0, address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: xdcStakeAddress,
          abi: XDCStakeABI,
          functionName: "pendingReward",
          args: [0, address || "0x0000000000000000000000000000000000000000"],
        },
      ];
    } else if (poolType === 'usdb') {
      return [
        {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "poolInfo",
          args: [pid],
        },
        {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "userInfo",
          args: [pid, address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "pendingReward",
          args: [pid, address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: usdbTokenAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: usdbTokenAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            address || "0x0000000000000000000000000000000000000000",
            usdbStakeAddress,
          ],
        },
      ];
    } else {
      // LP pool
      return [
        {
          address: lpStakeAddress,
          abi: LpStakeABI,
          functionName: "poolInfo",
          args: [pid],
        },
        {
          address: lpStakeAddress,
          abi: LpStakeABI,
          functionName: "userInfo",
          args: [pid, address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: lpStakeAddress,
          abi: LpStakeABI,
          functionName: "pendingReward",
          args: [pid, address || "0x0000000000000000000000000000000000000000"],
        },
      ];
    }
  };

  const { data: contractData, refetch: refetchData } = useReadContracts({
    contracts: createPoolContracts(),
    query: {
      enabled: !!chainId,
    },
  });

  // For LP pools, read additional token data
  const lpTokenAddress = contractData?.[0]?.result?.[0]; // LP token address from poolInfo

  const createLpTokenContracts = () => {
    if (poolType !== 'lp' || !lpTokenAddress) return [];
    
    if (pid === 2) {
      // BBB token pool
      const bbbTokenAddress = contracts[chainId]?.bbb?.address || "0x123";
      return [
        {
          address: bbbTokenAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: bbbTokenAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            address || "0x0000000000000000000000000000000000000000",
            lpStakeAddress,
          ],
        },
        {
          address: bbbTokenAddress,
          abi: ERC20ABI,
          functionName: "symbol",
        },
      ];
    } else {
      // LP token pools (pid 0, 1, 3)
      return [
        {
          address: lpTokenAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: lpTokenAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            address || "0x0000000000000000000000000000000000000000",
            lpStakeAddress,
          ],
        },
        {
          address: lpTokenAddress,
          abi: ERC20ABI,
          functionName: "symbol",
        },
        {
          address: lpTokenAddress,
          abi: ERC20ABI,
          functionName: "totalSupply",
        },
      ];
    }
  };

  const { data: tokenData, refetch: refetchTokenData } = useReadContracts({
    contracts: createLpTokenContracts(),
    query: {
      enabled: !!lpTokenAddress && poolType === 'lp',
    },
  });

  // For XDC-BBB LP pool (pid 3), read pair data
  const createPairDataContracts = () => {
    if (poolType !== 'lp' || pid !== 3 || !lpTokenAddress) return [];
    
    return [
      {
        address: lpTokenAddress,
        abi: [
          {
            inputs: [],
            name: "getReserves",
            outputs: [
              { internalType: "uint112", name: "_reserve0", type: "uint112" },
              { internalType: "uint112", name: "_reserve1", type: "uint112" },
              {
                internalType: "uint32",
                name: "_blockTimestampLast",
                type: "uint32",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getReserves",
      },
      {
        address: lpTokenAddress,
        abi: [
          {
            inputs: [],
            name: "token0",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "token0",
      },
      {
        address: lpTokenAddress,
        abi: [
          {
            inputs: [],
            name: "token1",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "token1",
      },
    ];
  };

  const { data: pairData, refetch: refetchPairData } = useReadContracts({
    contracts: createPairDataContracts(),
    query: {
      enabled: !!lpTokenAddress && poolType === 'lp' && pid === 3,
    },
  });

  // Process contract data into pool object
  useEffect(() => {
    if (!contractData) return;

    try {
      let pool = {};

      if (poolType === 'xdc') {
        pool = {
          pid: 0,
          isXdcPool: true,
          poolData: contractData[0]?.result,
          userStaked: contractData[1]?.result?.[0] || BigInt(0),
          pendingReward: contractData[2]?.result || BigInt(0),
          symbol: "XDC",
          balance: xdcBalance?.value || BigInt(0),
          totalStaked: contractData[0]?.result?.[3] || BigInt(0),
          rewardPerBlock: contractData[0]?.result?.[4] || BigInt(0),
          isActive: true,
          tokenAddress: "0x0000000000000000000000000000000000000000",
        };
      } else if (poolType === 'usdb') {
        pool = {
          pid,
          isUsdbPool: true,
          poolData: contractData[0]?.result,
          userStaked: contractData[1]?.result?.[0] || BigInt(0),
          pendingReward: contractData[2]?.result?.[0] || BigInt(0),
          pendingInterestReward: contractData[2]?.result?.[1] || BigInt(0),
          symbol: "USDB",
          balance: contractData[3]?.result || BigInt(0),
          allowance: contractData[4]?.result || BigInt(0),
          totalStaked: contractData[0]?.result?.[4] || BigInt(0),
          rewardPerBlock: contractData[0]?.result?.[5] || BigInt(0),
          annualInterestRate: contractData[0]?.result?.[9] || BigInt(0),
          isActive: contractData[0]?.result?.[6] || false,
          tokenAddress: usdbTokenAddress,
          decimals: 6,
        };
      } else {
        // LP pool - need additional token data
        const getSymbol = () => {
          if (pid === 0) return "psXDC";
          if (pid === 1) return "bpsXDC";
          if (pid === 2) return "BBB";
          if (pid === 3) return "XDC-BBB LP";
          if (pid === 4) return "XDC-bpsXDC LP";
          return tokenData?.[2]?.result || "LP";
        };
        
        pool = {
          pid,
          poolData: contractData[0]?.result,
          userStaked: contractData[1]?.result?.[0] || BigInt(0),
          pendingReward: contractData[2]?.result || BigInt(0),
          totalStaked: contractData[0]?.result?.[4] || BigInt(0),
          rewardPerBlock: contractData[0]?.result?.[5] || BigInt(0),
          isActive: contractData[0]?.result?.[6] || false,
          tokenAddress: lpTokenAddress,
          symbol: getSymbol(),
          balance: tokenData?.[0]?.result || BigInt(0),
          allowance: tokenData?.[1]?.result || BigInt(0),
          lpTotalSupply: tokenData?.[3]?.result || BigInt(0),
          // For XDC-BBB LP pool
          reserves: pairData?.[0]?.result || [BigInt(0), BigInt(0), 0],
          token0: pairData?.[1]?.result,
          token1: pairData?.[2]?.result,
        };
      }

      setPoolData(pool);
    } catch (error) {
      console.error("Error processing pool data:", error);
      // Set a fallback pool data to prevent rendering errors
      setPoolData({
        pid: pid || 0,
        symbol: "Loading...",
        totalStaked: BigInt(0),
        rewardPerBlock: BigInt(0),
        userStaked: BigInt(0),
        pendingReward: BigInt(0),
        balance: BigInt(0),
        isActive: false,
      });
    }
  }, [contractData, tokenData, pairData, xdcBalance, poolType, pid, lpTokenAddress, usdbTokenAddress]);

  // Calculate APR for this pool
  const BLOCKS_PER_YEAR = 31536000;
  const calculateAPR = useCallback((pool) => {
    if (
      !pool?.totalStaked ||
      pool.totalStaked === BigInt(0) ||
      !pool.rewardPerBlock
    ) {
      return { total: "0.00", bbbAPR: "0.00", numericTotal: 0 };
    }

    try {
      // Annual rewards = reward per block * blocks per year
      const annualRewards = pool.rewardPerBlock * BigInt(BLOCKS_PER_YEAR);

      // Get BBB price and other pricing data from the state
      const bbbPrice = data?.bbbPrice || 1;
      const xdcPrice = data?.xdcPrice || 1;

      // Check pool type
      const isPsXdcPool = pool.symbol === "psXDC" || (pool.symbol && pool.symbol.includes("psXDC"));
      const isBpsXdcPool = pool.symbol === "bpsXDC" || (pool.symbol && pool.symbol.includes("bpsXDC"));
      const isBBBPool = pool.symbol === "BBB" || (pool.symbol && pool.symbol.includes("BBB"));
      const isNativeXdc = pool.isXdcPool === true;
      const isUsdbPool = pool.isUsdbPool === true;
      const isXdcBbbLp = pool.pid === 3;

      // Calculate annual rewards value in USD
      const annualRewardsUSD = Number(formatEther(annualRewards)) * bbbPrice;

      // Calculate total staked value based on token type
      let totalStakedUSD;

      if (isNativeXdc) {
        totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
      } else if (isUsdbPool) {
        totalStakedUSD = Number(formatUnits(pool.totalStaked, 6)) * 1;
      } else if (isXdcBbbLp && pool.reserves && pool.lpTotalSupply && pool.lpTotalSupply > 0) {
        // Special handling for XDC-BBB LP pool
        const bbbAddress = contracts[chainId]?.bbb?.address;
        let xdcReserve, bbbReserve;

        if (pool.token0?.toLowerCase() === bbbAddress?.toLowerCase()) {
          bbbReserve = pool.reserves[0];
          xdcReserve = pool.reserves[1];
        } else {
          bbbReserve = pool.reserves[1];
          xdcReserve = pool.reserves[0];
        }

        const bbbValue = Number(formatEther(bbbReserve)) * bbbPrice;
        const xdcValue = Number(formatEther(xdcReserve)) * xdcPrice;
        const totalLpValueUSD = bbbValue + xdcValue;
        const lpTokenPrice = totalLpValueUSD / Number(formatEther(pool.lpTotalSupply));
        totalStakedUSD = Number(formatEther(pool.totalStaked)) * lpTokenPrice;
      } else if (isPsXdcPool || isBpsXdcPool) {
        totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
      } else if (isBBBPool) {
        totalStakedUSD = Number(formatEther(pool.totalStaked)) * bbbPrice;
      } else {
        // For LP tokens, use a fallback calculation
        totalStakedUSD = Number(formatEther(pool.totalStaked)) * (data?.lpTokenPrice || 1);
      }

      const bbbAPR = totalStakedUSD > 0 ? (annualRewardsUSD / totalStakedUSD) * 100 : 0;
      const bonusAPR = isPsXdcPool || isBpsXdcPool ? 6 : 0;
      const interestAPR = isUsdbPool && pool.annualInterestRate ? Number(pool.annualInterestRate) / 100 : 0;
      const totalAPR = bbbAPR + bonusAPR + interestAPR;

      return {
        total: totalAPR?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        bbbAPR: bbbAPR?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        numericTotal: totalAPR,
      };
    } catch (error) {
      console.error("Error calculating APR:", error);
      return { total: "0.00", bbbAPR: "0.00", numericTotal: 0 };
    }
  }, [data?.bbbPrice, data?.xdcPrice, data?.lpTokenPrice, chainId]);

  // Calculate APR and report to parent (with debouncing to prevent infinite loops)
  useEffect(() => {
    if (poolData && onAPRChange) {
      const timer = setTimeout(() => {
        try {
          const apr = calculateAPR(poolData);
          onAPRChange(apr.numericTotal || 0);
        } catch (error) {
          console.error("Error in APR calculation effect:", error);
        }
      }, 100); // Debounce by 100ms

      return () => clearTimeout(timer);
    }
  }, [poolData, calculateAPR, onAPRChange]);

  // Handle parameter validation errors
  if (!hasValidParams) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> Invalid pool parameters
        <br />
        <small>poolType: {poolType}, pid: {pid}</small>
      </div>
    );
  }

  if (!poolData) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const apr = calculateAPR(poolData);
  const poolId = poolData.isXdcPool
    ? `xdc-${poolData.pid}`
    : poolData.isUsdbPool
    ? `usdb-${poolData.pid}`
    : `lp-${poolData.pid}`;
  const isExpanded = data?.expandedPools?.[poolId] ?? false;

  // Get APR tooltip text
  const getAprTooltip = () => {
    if (poolData.isUsdbPool) {
      const interestRate = poolData.annualInterestRate ? Number(poolData.annualInterestRate) / 100 : 0;
      return `BBB ${apr.bbbAPR}% + USDB ${interestRate.toFixed(2)}%`;
    }
    if (poolData.symbol === "psXDC" || poolData.symbol === "bpsXDC") {
      return `${poolData.symbol} 6% + BBB ${apr.bbbAPR}%`;
    }
    return `BBB ${apr.bbbAPR}%`;
  };

  // Toggle pool expansion
  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setData((prev) => ({
      ...prev,
      expandedPools: {
        ...prev.expandedPools,
        [poolId]: newExpanded,
      },
    }));

    if (newExpanded && poolConfig.hashTag) {
      router.push(poolConfig.hashTag, undefined, { shallow: true });
    }
  };

  // Refresh data
  const refreshData = () => {
    refetchData();
    if (poolType === 'lp') {
      refetchTokenData?.();
      if (pid === 3) {
        refetchPairData?.();
      }
    }
  };

  // Create pool actions based on pool type
  const createPoolActions = () => {
    const MAX_UINT256 = BigInt(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );

    if (poolType === 'xdc') {
      return {
        stake: {
          buttonName: "Stake",
          data: {
            address: xdcStakeAddress,
            abi: XDCStakeABI,
            functionName: "deposit",
            args: [0],
            value: parseEther(localState.stakeAmount || "0"),
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showStakeModal: false,
              stakeAmount: "",
            }));
          },
        },
        unstake: {
          buttonName: "Unstake",
          data: {
            address: xdcStakeAddress,
            abi: XDCStakeABI,
            functionName: "withdraw",
            args: [0, parseEther(localState.unstakeAmount || "0")],
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showUnstakeModal: false,
              unstakeAmount: "",
            }));
          },
        },
        claim: {
          buttonName: "Claim",
          data: {
            address: xdcStakeAddress,
            abi: XDCStakeABI,
            functionName: "claimReward",
            args: [0],
          },
          callback: () => {
            refreshData();
          },
        },
      };
    } else if (poolType === 'usdb') {
      return {
        approve: {
          buttonName: "Approve",
          data: {
            address: usdbTokenAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [usdbStakeAddress, MAX_UINT256],
          },
          callback: () => {
            refreshData();
          },
        },
        stake: {
          buttonName: "Stake",
          data: {
            address: usdbStakeAddress,
            abi: USDBStakeABI,
            functionName: "deposit",
            args: [pid, parseUnits(localState.stakeAmount || "0", 6)],
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showStakeModal: false,
              stakeAmount: "",
            }));
          },
        },
        unstake: {
          buttonName: "Unstake",
          data: {
            address: usdbStakeAddress,
            abi: USDBStakeABI,
            functionName: "withdraw",
            args: [pid, parseUnits(localState.unstakeAmount || "0", 6)],
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showUnstakeModal: false,
              unstakeAmount: "",
            }));
          },
        },
        claimReward: {
          buttonName: "Claim",
          data: {
            address: usdbStakeAddress,
            abi: USDBStakeABI,
            functionName: "claimReward",
            args: [pid],
          },
          callback: () => {
            refreshData();
          },
        },
      };
    } else {
      // LP pool
      return {
        approve: {
          buttonName: "Approve",
          data: {
            address: poolData.tokenAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [lpStakeAddress, MAX_UINT256],
          },
          callback: () => {
            refreshData();
          },
        },
        stake: {
          buttonName: "Stake",
          data: {
            address: lpStakeAddress,
            abi: LpStakeABI,
            functionName: "deposit",
            args: [pid, parseEther(localState.stakeAmount || "0")],
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showStakeModal: false,
              stakeAmount: "",
            }));
          },
        },
        unstake: {
          buttonName: "Unstake",
          data: {
            address: lpStakeAddress,
            abi: LpStakeABI,
            functionName: "withdraw",
            args: [pid, parseEther(localState.unstakeAmount || "0")],
          },
          callback: () => {
            refreshData();
            setLocalState(prev => ({
              ...prev,
              showUnstakeModal: false,
              unstakeAmount: "",
            }));
          },
        },
        claim: {
          buttonName: "Claim",
          data: {
            address: lpStakeAddress,
            abi: LpStakeABI,
            functionName: "claimReward",
            args: [pid],
          },
          callback: () => {
            refreshData();
          },
        },
      };
    }
  };

  const poolActions = createPoolActions();

  return (
    <>
      <div
        id={poolId}
        className="space-y-3 mb-8 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="p-4 md:p-6 cursor-pointer" onClick={toggleExpand}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0 relative">
                {poolConfig.icon === "combined" ? (
                  <div className="relative w-full h-full">
                    {poolData.pid === 4 ? (
                      // Two overlapping XDC icons for XDC-bpsXDC LP
                      <>
                        <img
                          src="/xdc.png"
                          alt="XDC icon"
                          className="absolute w-4 h-4 object-cover rounded-full top-0 left-0 z-10"
                        />
                        <img
                          src="/xdc.png"
                          alt="XDC icon"
                          className="absolute w-4 h-4 object-cover rounded-full bottom-0 right-0"
                        />
                      </>
                    ) : (
                      // XDC and BBB icons for XDC-BBB LP (pid 3)
                      <>
                        <img
                          src="/xdc.png"
                          alt="XDC icon"
                          className="absolute w-4 h-4 object-cover rounded-full top-0 left-0 z-10"
                        />
                        <img
                          src="/bbb.jpg"
                          alt="BBB icon"
                          className="absolute w-4 h-4 object-cover rounded-full bottom-0 right-0"
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src={poolConfig.icon}
                    alt={`${poolData.symbol} icon`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold flex items-center flex-wrap gap-2">
                <a
                  href={poolConfig.hashTag}
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-green-600 transition-colors"
                >
                  {poolConfig.title}
                </a>
              </h2>
              <div className="ml-2 text-gray-500">
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Link
                  href={poolConfig.getTokenLink}
                  className="text-xs text-green-600 hover:underline"
                  target="_blank"
                >
                  Get {poolConfig.symbol}
                </Link>
                {isConnected && poolData.tokenAddress && !poolData.isXdcPool && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addTokenToWallet(poolData.tokenAddress, poolData.symbol);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                    title={`Add ${poolData.symbol} to wallet`}
                  >
                    Add to Wallet
                  </button>
                )}
              </div>
              <div
                className="text-green-600 font-bold text-lg cursor-help relative group underline"
                title={getAprTooltip()}
                onClick={(e) => e.stopPropagation()}
              >
                {apr.total}% APR
                <div className="opacity-0 bg-black text-white text-xs rounded p-1 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {getAprTooltip()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 px-4 md:px-6 pb-4 md:pb-6">
            <div className="space-y-4">
              {isConnected ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Your Staked</span>
                    <div className="font-medium truncate max-w-[60%] text-right">
                      {poolData.isUsdbPool
                        ? Number(
                            formatUnits(poolData.userStaked, 6)
                          )?.toLocaleString("en-US", {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          })
                        : Number(formatEther(poolData.userStaked))?.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: poolData.pid === 3 ? 8 : 4,
                              maximumFractionDigits: poolData.pid === 3 ? 8 : 4,
                            }
                          )}{" "}
                      {poolData.symbol}
                    </div>
                  </div>

                  {poolData.isUsdbPool ? (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Pending Rewards</span>
                      <div className="font-medium truncate max-w-[60%] text-right">
                        {Number(
                          formatUnits(
                            poolData.pendingInterestReward || BigInt(0),
                            6
                          )
                        )?.toLocaleString("en-US", {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6,
                        })}{" "}
                        USDB +{" "}
                        {Number(
                          formatEther(poolData.pendingReward)
                        )?.toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}{" "}
                        BBB
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Pending Rewards</span>
                      <div className="font-medium truncate max-w-[60%] text-right">
                        {Number(
                          formatEther(poolData.pendingReward)
                        )?.toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}{" "}
                        BBB
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Staked</span>
                <div className="font-medium truncate max-w-[60%] text-right">
                  {poolData.isUsdbPool
                    ? Number(formatUnits(poolData.totalStaked, 6))?.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        }
                      )
                    : Number(formatEther(poolData.totalStaked))?.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: poolData.pid === 3 ? 8 : 4,
                          maximumFractionDigits: poolData.pid === 3 ? 8 : 4,
                        }
                      )}{" "}
                  {poolData.symbol}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Rewards per Block</span>
                <div className="font-medium truncate max-w-[60%] text-right">
                  {poolData.rewardPerBlock
                    ? Number(formatEther(poolData.rewardPerBlock)).toLocaleString()
                    : "0.00"}{" "}
                  BBB
                  {isConnected && (
                    <button
                      onClick={() => addTokenToWallet(bbbTokenAddress, "BBB")}
                      className="ml-1 text-xs text-blue-600 hover:underline"
                      title="Add BBB to wallet"
                    >
                      Add to Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isConnected ? (
              <>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 pt-4">
                  <button
                    className="flex-1 py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors text-sm md:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalState(prev => ({
                        ...prev,
                        showStakeModal: true,
                      }));
                    }}
                  >
                    Stake
                  </button>
                  <button
                    className="flex-1 py-2 px-4 text-green-600 border border-green-500 rounded-md hover:bg-green-50 transition-colors text-sm md:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalState(prev => ({
                        ...prev,
                        showUnstakeModal: true,
                      }));
                    }}
                    disabled={poolData.userStaked <= 0}
                  >
                    Unstake
                  </button>
                  {(poolData.pendingReward > 0 || (poolData.isUsdbPool && poolData.pendingInterestReward > 0)) && (
                    <>
                      {poolData.isUsdbPool ? (
                        <WriteButton
                          {...poolActions.claimReward}
                          className="flex-1 py-2 px-4 text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors cursor-pointer text-sm md:text-base"
                        />
                      ) : (
                        <WriteButton
                          {...poolActions.claim}
                          className="flex-1 py-2 px-4 text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors cursor-pointer text-sm md:text-base"
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-4 mt-4 bg-gray-50 rounded-lg">
                <p className="mb-4 text-gray-600 text-sm md:text-base">
                  Connect your wallet to stake and earn rewards
                </p>
                <button
                  className="btn bg-green-600 text-white hover:bg-green-700 text-sm md:text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    privyLogin();
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          localState.showStakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-4 md:p-6 w-[90%] max-w-sm mx-2">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              Stake {poolConfig.symbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setLocalState(prev => ({ ...prev, showStakeModal: false }))
              }
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-gray-50 h-14">
              <input
                type="number"
                className="grow text-base"
                placeholder="0.00"
                value={localState.stakeAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (
                    /^(0|[1-9]\d*)(\.\d*)?$/.test(newValue) ||
                    newValue === ""
                  ) {
                    setLocalState(prev => ({ ...prev, stakeAmount: newValue }));
                  }
                }}
              />
              <div className="font-medium whitespace-nowrap">{poolConfig.symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50 px-3 py-1"
                onClick={() => {
                  setLocalState(prev => ({
                    ...prev,
                    stakeAmount: poolData.isUsdbPool
                      ? formatUnits(poolData.balance, 6)
                      : formatEther(poolData.balance),
                  }));
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Available</span>
              <span className="truncate max-w-[70%] text-right">
                {poolData.isUsdbPool
                  ? Number(formatUnits(poolData.balance, 6))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      }
                    )
                  : Number(formatEther(poolData.balance))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: poolData.pid === 3 ? 8 : 4,
                        maximumFractionDigits: poolData.pid === 3 ? 8 : 4,
                      }
                    )}{" "}
                {poolData.symbol}
              </span>
            </div>

            {!poolData.isXdcPool &&
            !poolData.isUsdbPool &&
            poolData.allowance < parseEther(localState.stakeAmount || "0") ? (
              <WriteButton
                {...poolActions.approve}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : poolData.isUsdbPool &&
              poolData.allowance < parseUnits(localState.stakeAmount || "0", 6) ? (
              <WriteButton
                {...poolActions.approve}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : (
              <WriteButton
                {...poolActions.stake}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* Unstake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          localState.showUnstakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-4 md:p-6 w-[90%] max-w-sm mx-2">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              Unstake {poolConfig.symbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setLocalState(prev => ({ ...prev, showUnstakeModal: false }))
              }
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-gray-50 h-14">
              <input
                type="number"
                className="grow text-base"
                placeholder="0.00"
                value={localState.unstakeAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (
                    /^(0|[1-9]\d*)(\.\d*)?$/.test(newValue) ||
                    newValue === ""
                  ) {
                    setLocalState(prev => ({ ...prev, unstakeAmount: newValue }));
                  }
                }}
              />
              <div className="font-medium whitespace-nowrap">{poolConfig.symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50 px-3 py-1"
                onClick={() => {
                  setLocalState(prev => ({
                    ...prev,
                    unstakeAmount: poolData.isUsdbPool
                      ? formatUnits(poolData.userStaked, 6)
                      : formatEther(poolData.userStaked),
                  }));
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Staked</span>
              <span className="truncate max-w-[70%] text-right">
                {poolData.isUsdbPool
                  ? Number(
                      formatUnits(poolData.userStaked, 6)
                    )?.toLocaleString("en-US", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })
                  : Number(formatEther(poolData.userStaked))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: poolData.pid === 3 ? 8 : 4,
                        maximumFractionDigits: poolData.pid === 3 ? 8 : 4,
                      }
                    )}{" "}
                {poolData.symbol}
              </span>
            </div>

            <WriteButton
              {...poolActions.unstake}
              className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StakingPool; 