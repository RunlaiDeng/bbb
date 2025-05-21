import LpStakeABI from "@/abi/LpStakeABI.json";
import XDCStakeABI from "@/abi/XDCStakeABI.json";
import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { buyXDCLink, contracts, dexLink } from "@/config";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContracts,
} from "wagmi";
import WriteButton from "@/components/WriteButton";
import Link from "next/link";
import ERC20ABI from "@/abi/ERC20ABI.json";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import { getBBBPrice, getPrice } from "@/components/Utils";
import { useRouter } from "next/router";

const Stake = () => {
  const [data, setData] = useState({
    showStakeModal: false,
    showUnstakeModal: false,
    stakeAmount: "",
    unstakeAmount: "",
    bbbPrice: 0,
    lpTokenPrice: 0,
    basePrice: 0, // BBB/XDC price ratio
    xdcPrice: 0, // XDC price in USD
    activePid: 0, // Track which pool the modals are for
    isXdcPool: false, // Flag to indicate if active pool is XDC pool
    expandedPools: {}, // Track which pools are expanded
  });

  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  // LP Stake contract address
  const lpStakeAddress = contracts[chainId]?.lpStake?.address || "0x123";
  const xdcStakeAddress = contracts[chainId]?.xdcStake?.address || "0x123";
  const xdcStake = contracts[chainId]?.xdcStake;

  // Native XDC balance
  const { data: xdcBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    }
  });

  // Process pool ids for hash navigation
  const POOL_HASH_MAP = {
    'xdc': 'xdc-0',
    'psxdc': 'lp-0',
    'bpsxdc': 'lp-1', 
    'bbb': 'lp-2'
  };

  // Handle hash-based navigation to expand specific pools
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash && POOL_HASH_MAP[hash]) {
        setData(prev => ({
          ...prev,
          expandedPools: {
            ...prev.expandedPools,
            [POOL_HASH_MAP[hash]]: true
          }
        }));
        
        // Scroll to the pool
        setTimeout(() => {
          const element = document.getElementById(POOL_HASH_MAP[hash]);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Handle hash on initial load
    handleHashChange();

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Read pool info from the contract for PID 0, 1, and 2
  const { data: poolInfo, refetch: refetchPool } = useReadContracts({
    contracts: [
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "poolInfo",
        args: [0],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "poolInfo",
        args: [1],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "poolInfo",
        args: [2],
      },
    ],
  });

  // Read user info for PID 0, 1, and 2
  const { data: userInfoData, refetch: refetchUserInfo } = useReadContracts({
    contracts: [
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "userInfo",
        args: [0, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "pendingReward",
        args: [0, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "userInfo",
        args: [1, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "pendingReward",
        args: [1, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "userInfo",
        args: [2, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "pendingReward",
        args: [2, address || "0x0000000000000000000000000000000000000000"],
      },
    ],
    query: {
      enabled: !!lpStakeAddress,
    },
  });

  const pools = [
    {
      pid: 0,
      poolData: poolInfo?.[0]?.result,
      userStaked: userInfoData?.[0]?.result?.[0] || BigInt(0),
      pendingReward: userInfoData?.[1]?.result || BigInt(0),
    },
    {
      pid: 1,
      poolData: poolInfo?.[1]?.result,
      userStaked: userInfoData?.[2]?.result?.[0] || BigInt(0),
      pendingReward: userInfoData?.[3]?.result || BigInt(0),
    },
    {
      pid: 2,
      poolData: poolInfo?.[2]?.result,
      userStaked: userInfoData?.[4]?.result?.[0] || BigInt(0),
      pendingReward: userInfoData?.[5]?.result || BigInt(0),
    },
  ];

  // Read LP token data for both pools
  const lpTokenAddresses = pools.map((pool) => pool.poolData?.[0]);

  const createLpTokenContracts = (lpTokenAddress) => {
    return [
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
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
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
  };

  const { data: lpTokenData0, refetch: refetchLpTokenData0 } = useReadContracts(
    {
      contracts: lpTokenAddresses[0]
        ? createLpTokenContracts(lpTokenAddresses[0])
        : [],
      query: {
        enabled: !!lpTokenAddresses[0],
      },
    }
  );

  const { data: lpTokenData1, refetch: refetchLpTokenData1 } = useReadContracts(
    {
      contracts: lpTokenAddresses[1]
        ? createLpTokenContracts(lpTokenAddresses[1])
        : [],
      query: {
        enabled: !!lpTokenAddresses[1],
      },
    }
  );

  const createPairDataContracts = (lpTokenAddress) => {
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
          {
            inputs: [],
            name: "token0",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [],
            name: "token1",
            outputs: [{ internalType: "address", name: "", type: "address" }],
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

  const { data: pairData0, refetch: refetchPairData0 } = useReadContracts({
    contracts: lpTokenAddresses[0]
      ? createPairDataContracts(lpTokenAddresses[0])
      : [],
    query: {
      enabled: !!lpTokenAddresses[0],
    },
  });

  const { data: pairData1, refetch: refetchPairData1 } = useReadContracts({
    contracts: lpTokenAddresses[1]
      ? createPairDataContracts(lpTokenAddresses[1])
      : [],
    query: {
      enabled: !!lpTokenAddresses[1],
    },
  });

  // Create contracts for BBB token
  const bbbTokenAddress = contracts[chainId]?.bbb?.address || "0x123";

  const { data: bbbTokenData, refetch: refetchBBBData } = useReadContracts({
    contracts: [
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
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: bbbTokenAddress,
        abi: ERC20ABI,
        functionName: "symbol",
      },
      {
        address: bbbTokenAddress,
        abi: ERC20ABI,
        functionName: "totalSupply",
      },
    ],
    query: {
      enabled: !!bbbTokenAddress,
    },
  });

  // Process data for all pools
  const poolsWithData = [
    {
      ...pools[0],
      allowance: lpTokenData0?.[0]?.result || BigInt(0),
      balance: lpTokenData0?.[1]?.result || BigInt(0),
      symbol: lpTokenData0?.[2]?.result || "psXDC",
      lpTotalSupply: lpTokenData0?.[3]?.result || BigInt(0),
      reserves: pairData0?.[0]?.result || [BigInt(0), BigInt(0), 0],
      token0: pairData0?.[1]?.result,
      token1: pairData0?.[2]?.result,
      totalStaked: pools[0].poolData?.[4] || BigInt(0),
      rewardPerBlock: pools[0].poolData?.[5] || BigInt(0),
      isActive: pools[0].poolData?.[6] || false,
      tokenAddress: lpTokenAddresses[0],
    },
    {
      ...pools[1],
      allowance: lpTokenData1?.[0]?.result || BigInt(0),
      balance: lpTokenData1?.[1]?.result || BigInt(0),
      symbol: lpTokenData1?.[2]?.result || "bpsXDC",
      lpTotalSupply: lpTokenData1?.[3]?.result || BigInt(0),
      reserves: pairData1?.[0]?.result || [BigInt(0), BigInt(0), 0],
      token0: pairData1?.[1]?.result,
      token1: pairData1?.[2]?.result,
      totalStaked: pools[1].poolData?.[4] || BigInt(0),
      rewardPerBlock: pools[1].poolData?.[5] || BigInt(0),
      isActive: pools[1].poolData?.[6] || false,
      tokenAddress: lpTokenAddresses[1],
    },
    {
      ...pools[2],
      allowance: bbbTokenData?.[0]?.result || BigInt(0),
      balance: bbbTokenData?.[1]?.result || BigInt(0),
      symbol: bbbTokenData?.[2]?.result || "BBB",
      lpTotalSupply: bbbTokenData?.[3]?.result || BigInt(0),
      totalStaked: pools[2].poolData?.[4] || BigInt(0),
      rewardPerBlock: pools[2].poolData?.[5] || BigInt(0),
      isActive: pools[2].poolData?.[6] || false,
      tokenAddress: bbbTokenAddress,
    },
  ];

  // Read XDC stake pool info
  const { data: xdcPoolInfo, refetch: refetchXdcPool } = useReadContracts({
    contracts: [
      {
        address: xdcStakeAddress,
        abi: XDCStakeABI,
        functionName: "poolInfo",
        args: [0],
      },
    ],
    query: {
      enabled: !!xdcStakeAddress,
    }
  });

  // Read XDC user info
  const { data: xdcUserInfoData, refetch: refetchXdcUserInfo } = useReadContracts({
    contracts: [
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
    ],
    query: {
      enabled: !!xdcStakeAddress && !!address,
    },
  });

  // Process data for XDC pool
  const xdcPool = {
    pid: 0,
    isXdcPool: true,
    poolData: xdcPoolInfo?.[0]?.result,
    userStaked: xdcUserInfoData?.[0]?.result?.[0] || BigInt(0),
    pendingReward: xdcUserInfoData?.[1]?.result || BigInt(0),
    symbol: "XDC",
    balance: xdcBalance?.value || BigInt(0),
    totalStaked: xdcPoolInfo?.[0]?.result?.[3] || BigInt(0), // Index 3 is totalStaked
    rewardPerBlock: xdcPoolInfo?.[0]?.result?.[4] || BigInt(0), // Index 4 is rewardPerBlock
    isActive: true, // Always make XDC pool active
    tokenAddress: "0x0000000000000000000000000000000000000000", // Native XDC doesn't have a token address
  };

  // Add console.log to debug pool data
  console.log("XDC Pool Info:", xdcPoolInfo?.[0]?.result);

  // Load BBB and XDC prices, then calculate LP token price directly
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Get BBB price and BBB/XDC price ratio from getPrice
        const bbbPriceData = await getBBBPrice();
        const bbbPrice = bbbPriceData.price || 0;
        const basePrice = bbbPriceData.basePrice || 0; // BBB/XDC price ratio

        // Skip LP price calculation if we don't have reserves or totalSupply
        if (
          pools[0].poolData &&
          poolsWithData[0].lpTotalSupply &&
          poolsWithData[0].lpTotalSupply > 0 &&
          poolsWithData[0].token0 &&
          poolsWithData[0].token1
        ) {
          // Determine which token is BBB and which is XDC
          const bbbAddress = contracts[chainId]?.bbb?.address;
          const wxdcAddress = contracts[chainId]?.wxdc?.address;

          let bbbReserve, xdcReserve;

          if (
            poolsWithData[0].token0?.toLowerCase() === bbbAddress?.toLowerCase()
          ) {
            bbbReserve = poolsWithData[0].reserves[0];
            xdcReserve = poolsWithData[0].reserves[1];
          } else if (
            poolsWithData[0].token1?.toLowerCase() === bbbAddress?.toLowerCase()
          ) {
            bbbReserve = poolsWithData[0].reserves[1];
            xdcReserve = poolsWithData[0].reserves[0];
          } else {
            // If neither token is BBB, we can't calculate
            return;
          }

          // Calculate LP token price based on reserves and prices
          // Using basePrice for XDC value calculation
          const bbbValue = Number(formatEther(bbbReserve)) * bbbPrice;
          const xdcPrice = bbbPrice / basePrice; // Calculate XDC price from BBB price and basePrice
          const xdcValue = Number(formatEther(xdcReserve)) * xdcPrice;
          const lpPrice =
            (bbbValue + xdcValue) /
            Number(formatEther(poolsWithData[0].lpTotalSupply));

          setData((prev) => ({
            ...prev,
            bbbPrice: bbbPrice,
            lpTokenPrice: lpPrice,
            basePrice: basePrice,
            xdcPrice: xdcPrice,
          }));
        } else {
          // Still save price data even if LP calculation isn't possible
          // Calculate XDC price from BBB price and basePrice ratio
          const xdcPrice = basePrice > 0 ? bbbPrice / basePrice : 0;

          setData((prev) => ({
            ...prev,
            bbbPrice: bbbPrice,
            basePrice: basePrice,
            xdcPrice: xdcPrice,
          }));
        }
      } catch (error) {
        console.error("Error calculating prices:", error);
      }
    };

    // Always fetch prices even without LP token data
    fetchPrices();
  }, []);

  // Function to refresh all data
  const refreshData = () => {
    refetchPool();
    refetchUserInfo();
    refetchXdcPool();
    refetchXdcUserInfo();
    refetchLpTokenData0();
    refetchLpTokenData1();
    refetchPairData0();
    refetchPairData1();
    refetchBBBData();
  };

  // MAX_UINT256 for approvals
  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  // Create actions for a specific pool
  const createPoolActions = (pid) => {
    const pool = poolsWithData[pid];

    return {
      approve: {
        buttonName: "Approve",
        data: {
          address: pool.poolData?.[0],
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
          args: [pid, parseEther(data.stakeAmount || "0")],
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
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
          args: [pid, parseEther(data.unstakeAmount || "0")],
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
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
  };

  // Create actions for XDC pool
  const createXdcPoolActions = () => {
    return {
      stake: {
        buttonName: "Stake",
        data: {
          address: xdcStakeAddress,
          abi: XDCStakeABI,
          functionName: "deposit",
          args: [0], // Only pid, no amount parameter as it's sent as value
          value: parseEther(data.stakeAmount || "0"), // Value sent with the transaction
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
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
          args: [0, parseEther(data.unstakeAmount || "0")],
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
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
  };

  // Calculate APR for a specific pool
  const BLOCKS_PER_YEAR = 31536000;
  const calculateAPR = (pool) => {
    if (
      !pool.totalStaked ||
      pool.totalStaked === BigInt(0) ||
      !pool.rewardPerBlock
    ) {
      return { total: "0.00", bbbAPR: "0.00" };
    }

    // Annual rewards = reward per block * blocks per year
    const annualRewards = pool.rewardPerBlock * BigInt(BLOCKS_PER_YEAR);

    // Get BBB price and other pricing data from the state
    const bbbPrice = data.bbbPrice || 1;
    const xdcPrice = data.xdcPrice || 1;

    // Check if this is a psXDC pool
    const isPsXdcPool =
      pool.symbol === "psXDC" || (pool.symbol && pool.symbol.includes("psXDC"));

    // Check if this is a bpsXDC pool
    const isBpsXdcPool =
      pool.symbol === "bpsXDC" ||
      (pool.symbol && pool.symbol.includes("bpsXDC"));

    // Check if this is a BBB pool
    const isBBBPool =
      pool.symbol === "BBB" || (pool.symbol && pool.symbol.includes("BBB"));

    // Calculate annual rewards value in USD
    const annualRewardsUSD = Number(formatEther(annualRewards)) * bbbPrice;

    // Calculate total staked value based on token type
    let totalStakedUSD;

    if (isPsXdcPool || isBpsXdcPool) {
      // For psXDC or bpsXDC pools, use XDC price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
    } else if (isBBBPool) {
      // For BBB pool, use BBB price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * bbbPrice;
    } else {
      // For LP tokens or other tokens, use LP token price
      totalStakedUSD =
        Number(formatEther(pool.totalStaked)) * (data.lpTokenPrice || 1);
    }

    // Base BBB APR = (annual rewards in USD / total staked in USD) * 100
    const bbbAPR =
      totalStakedUSD > 0 ? (annualRewardsUSD / totalStakedUSD) * 100 : 0;

    // Add 6% bonus APR only for psXDC or bpsXDC pools
    const bonusAPR = isPsXdcPool || isBpsXdcPool ? 6 : 0;
    const totalAPR = bbbAPR + bonusAPR;

    // Format with commas for thousands
    return {
      total: totalAPR?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      bbbAPR: bbbAPR?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  };

  // Render a pool card
  const renderPoolCard = (pool, index) => {
    const poolActions = pool.isXdcPool ? createXdcPoolActions() : createPoolActions(pool.pid);
    const apr = calculateAPR(pool);
    const poolId = pool.isXdcPool ? `xdc-${pool.pid}` : `lp-${pool.pid}`;
    const isExpanded = data.expandedPools[poolId] ?? false;

    // Get hashtag for this pool
    const getHashTag = () => {
      if (pool.isXdcPool) return '#xdc';
      if (pool.pid === 0) return '#psXDC';
      if (pool.pid === 1) return '#bpsXDC';
      if (pool.pid === 2) return '#bbb';
      return '';
    };

    // Get icon for this pool
    const getPoolIcon = () => {
      if (pool.isXdcPool || pool.pid === 0 || pool.pid === 1) {
        return "/xdc.png"; // XDC icon for XDC, psXDC, bpsXDC pools
      }
      if (pool.pid === 2) {
        return "/bbb.jpg"; // BBB icon for BBB pool
      }
      return "";
    };

    // Determine the pool title and get token link
    const getPoolTitle = () => {
      if (pool.isXdcPool) return "XDC Staking";
      if (pool.pid === 0) return `${pool.symbol} ReStaking`;
      if (pool.pid === 1) return "bpsXDC ReStaking";
      if (pool.pid === 2) return "BBB Staking";
      return `${pool.symbol} Staking`;
    };

    // Determine the 'Get Token' link
    const getTokenLink = () => {
      if (pool.isXdcPool) return buyXDCLink;
      if (pool.symbol === "bpsXDC") return "/bpsXDC";
      if (pool.symbol === "BBB") return "/buy"; // Use direct link to /buy for BBB
      return "https://primestaking.xyz/xdc-liquid-staking"; // Default for psXDC
    };

    // Determine the APR tooltip text
    const getAprTooltip = () => {
      // For psXDC or bpsXDC pools, show 6% + BBB APR
      if (pool.symbol === "psXDC" || pool.symbol === "bpsXDC") {
        return `${pool.symbol} 6% + BBB ${apr.bbbAPR}%`;
      }
      // For BBB pool, only show BBB APR
      return `BBB ${apr.bbbAPR}%`;
    };

    // Toggle pool expansion and update URL
    const toggleExpand = () => {
      const newExpanded = !isExpanded;
      setData(prev => ({
        ...prev,
        expandedPools: {
          ...prev.expandedPools,
          [poolId]: newExpanded
        }
      }));

      // Update URL hash if expanding
      if (newExpanded) {
        const hashTag = getHashTag();
        if (hashTag) {
          router.push(hashTag, undefined, { shallow: true });
        }
      }
    };

    return (
      <div
        id={poolId}
        key={pool.pid}
        className="space-y-3 mb-8 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div 
          className="p-4 md:p-6 cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={getPoolIcon()} 
                  alt={`${pool.symbol} icon`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg md:text-xl font-bold flex items-center flex-wrap gap-2">
                <a href={getHashTag()} onClick={(e) => e.preventDefault()} className="hover:text-green-600 transition-colors">
                  {getPoolTitle()}
                </a>
              </h2>
              <div className="ml-2 text-gray-500">
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Link
                  href={getTokenLink()}
                  className="text-xs text-green-600 hover:underline"
                  target="_blank"
                >
                  Get {pool.symbol}
                </Link>
                {isConnected && pool.tokenAddress && !pool.isXdcPool && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addTokenToWallet(pool.tokenAddress, pool.symbol);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                    title={`Add ${pool.symbol} to wallet`}
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
                      {Number(formatEther(pool.userStaked))?.toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                      )}{" "}
                      {pool.symbol}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Pending Rewards</span>
                    <div className="font-medium truncate max-w-[60%] text-right">
                      {Number(formatEther(pool.pendingReward))?.toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                      )}{" "}
                      BBB
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Staked</span>
                <div className="font-medium truncate max-w-[60%] text-right">
                  {Number(formatEther(pool.totalStaked))?.toLocaleString("en-US", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}{" "}
                  {pool.symbol}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Rewards per Block</span>
                <div className="font-medium truncate max-w-[60%] text-right">
                  {pool.rewardPerBlock ? Number(formatEther(pool.rewardPerBlock)).toLocaleString() : "0.00"} BBB
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
                      setData((prev) => ({
                        ...prev,
                        showStakeModal: true,
                        activePid: pool.pid,
                        isXdcPool: pool.isXdcPool || false,
                      }));
                    }}
                  >
                    Stake
                  </button>
                  <button
                    className="flex-1 py-2 px-4 text-green-600 border border-green-500 rounded-md hover:bg-green-50 transition-colors text-sm md:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      setData((prev) => ({
                        ...prev,
                        showUnstakeModal: true,
                        activePid: pool.pid,
                        isXdcPool: pool.isXdcPool || false,
                      }));
                    }}
                    disabled={pool.userStaked <= 0}
                  >
                    Unstake
                  </button>
                  {pool.pendingReward > 0 && (
                    <WriteButton
                      {...poolActions.claim}
                      className="flex-1 py-2 px-4 text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors cursor-pointer text-sm md:text-base"
                    />
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
    );
  };

  const activePool = data.isXdcPool 
    ? xdcPool 
    : poolsWithData[data.activePid] || poolsWithData[0];
  const activeActions = data.isXdcPool 
    ? createXdcPoolActions() 
    : createPoolActions(data.activePid);

  // Combine XDC pool with other pools for rendering
  const allPools = [xdcPool, ...poolsWithData];

  return (
    <div className="m-auto md:w-3/4 w-full px-4 md:px-0 mt-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">Stake</h1>
        <div className="text-sm text-green-700">🌊 Stake to earn</div>
      </div>

      {allPools.map((pool, index) => renderPoolCard(pool, index))}

      {/* Stake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showStakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-4 md:p-6 w-[90%] max-w-sm mx-2">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              Stake {activePool.symbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setData((prev) => ({ ...prev, showStakeModal: false }))
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
                value={data.stakeAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (
                    /^(0|[1-9]\d*)(\.\d*)?$/.test(newValue) ||
                    newValue === ""
                  ) {
                    setData({ ...data, stakeAmount: newValue });
                  }
                }}
              />
              <div className="font-medium">{activePool.symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50 px-3 py-1"
                onClick={() => {
                  setData({
                    ...data,
                    stakeAmount: formatEther(activePool.balance),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Available</span>
              <span className="truncate max-w-[70%] text-right">
                {formatEther(activePool.balance)} {activePool.symbol}
              </span>
            </div>

            {!data.isXdcPool && activePool.allowance < parseEther(data.stakeAmount || "0") ? (
              <WriteButton
                {...activeActions.approve}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : (
              <WriteButton
                {...activeActions.stake}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* Unstake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showUnstakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-4 md:p-6 w-[90%] max-w-sm mx-2">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              Unstake {activePool.symbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setData((prev) => ({ ...prev, showUnstakeModal: false }))
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
                value={data.unstakeAmount}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (
                    /^(0|[1-9]\d*)(\.\d*)?$/.test(newValue) ||
                    newValue === ""
                  ) {
                    setData({ ...data, unstakeAmount: newValue });
                  }
                }}
              />
              <div className="font-medium">{activePool.symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50 px-3 py-1"
                onClick={() => {
                  setData({
                    ...data,
                    unstakeAmount: formatEther(activePool.userStaked),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Staked</span>
              <span className="truncate max-w-[70%] text-right">
                {formatEther(activePool.userStaked)} {activePool.symbol}
              </span>
            </div>

            <WriteButton
              {...activeActions.unstake}
              className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;
