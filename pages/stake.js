import LpStakeABI from "@/abi/LpStakeABI.json";
import XDCStakeABI from "@/abi/XDCStakeABI.json";
import USDBStakeABI from "@/abi/USDBStakeABI.json";
import { useState, useEffect } from "react";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
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
    isUsdbPool: false, // Flag to indicate if active pool is USDB pool
    expandedPools: {}, // Track which pools are expanded
    sortBy: "apr", // apr, latest
    searchQuery: "", // Search keyword for filtering pools
  });

  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  // Add token to wallet function
  const addTokenToWallet = async (tokenAddress, symbol, decimals = 18) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: decimals,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error adding token to wallet:", error);
    }
  };

  // LP Stake contract address
  const lpStakeAddress = contracts[chainId]?.lpStake?.address || "0x123";
  const xdcStakeAddress = contracts[chainId]?.xdcStake?.address || "0x123";
  const xdcStake = contracts[chainId]?.xdcStake;
  const usdbStakeAddress = contracts[chainId]?.usdbStake?.address || "0x123";

  // Native XDC balance
  const { data: xdcBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  // USDB token balance
  const usdbTokenAddress = contracts[chainId]?.usdb?.address || "0x123";
  const { data: usdbBalance } = useReadContracts({
    contracts: [
      {
        address: usdbTokenAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: usdbTokenAddress,
        abi: ERC20ABI,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: !!address && !!usdbTokenAddress,
    },
  });

  // Process pool ids for hash navigation
  const POOL_HASH_MAP = {
    xdc: "xdc-0",
    usdb: "usdb-0",
    psxdc: "lp-0",
    bpsxdc: "lp-1",
    bbb: "lp-2",
    "xdc-bbb": "lp-3",
  };

  // Handle hash-based navigation to expand specific pools
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (hash && POOL_HASH_MAP[hash]) {
        setData((prev) => ({
          ...prev,
          expandedPools: {
            ...prev.expandedPools,
            [POOL_HASH_MAP[hash]]: true,
          },
        }));

        // Scroll to the pool
        setTimeout(() => {
          const element = document.getElementById(POOL_HASH_MAP[hash]);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Handle hash on initial load
    handleHashChange();

    // Listen to hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Read pool info from the contract for PID 0, 1, 2, and 3
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
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "poolInfo",
        args: [3],
      },
    ],
  });

  // Read user info for PID 0, 1, 2, and 3
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
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "userInfo",
        args: [3, address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "pendingReward",
        args: [3, address || "0x0000000000000000000000000000000000000000"],
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
    {
      pid: 3,
      poolData: poolInfo?.[3]?.result,
      userStaked: userInfoData?.[6]?.result?.[0] || BigInt(0),
      pendingReward: userInfoData?.[7]?.result || BigInt(0),
    },
  ];

  // Read LP token data for all pools
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

  const { data: lpTokenData2, refetch: refetchLpTokenData2 } = useReadContracts(
    {
      contracts: lpTokenAddresses[2]
        ? createLpTokenContracts(lpTokenAddresses[2])
        : [],
      query: {
        enabled: !!lpTokenAddresses[2],
      },
    }
  );

  const { data: lpTokenData3, refetch: refetchLpTokenData3 } = useReadContracts(
    {
      contracts: lpTokenAddresses[3]
        ? createLpTokenContracts(lpTokenAddresses[3])
        : [],
      query: {
        enabled: !!lpTokenAddresses[3],
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

  const { data: pairData2, refetch: refetchPairData2 } = useReadContracts({
    contracts: lpTokenAddresses[2]
      ? createPairDataContracts(lpTokenAddresses[2])
      : [],
    query: {
      enabled: !!lpTokenAddresses[2],
    },
  });

  const { data: pairData3, refetch: refetchPairData3 } = useReadContracts({
    contracts: lpTokenAddresses[3]
      ? createPairDataContracts(lpTokenAddresses[3])
      : [],
    query: {
      enabled: !!lpTokenAddresses[3],
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
    {
      ...pools[3],
      allowance: lpTokenData3?.[0]?.result || BigInt(0),
      balance: lpTokenData3?.[1]?.result || BigInt(0),
      symbol: "XDC-BBB LP",
      lpTotalSupply: lpTokenData3?.[3]?.result || BigInt(0),
      reserves: pairData3?.[0]?.result || [BigInt(0), BigInt(0), 0],
      token0: pairData3?.[1]?.result,
      token1: pairData3?.[2]?.result,
      totalStaked: pools[3].poolData?.[4] || BigInt(0),
      rewardPerBlock: pools[3].poolData?.[5] || BigInt(0),
      isActive: pools[3].poolData?.[6] || false,
      tokenAddress: lpTokenAddresses[3],
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
    },
  });

  // Read XDC user info
  const { data: xdcUserInfoData, refetch: refetchXdcUserInfo } =
    useReadContracts({
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

  // Read USDB stake pool info
  const { data: usdbPoolInfo, refetch: refetchUsdbPool } = useReadContracts({
    contracts: [
      {
        address: usdbStakeAddress,
        abi: USDBStakeABI,
        functionName: "poolInfo",
        args: [0],
      },
    ],
    query: {
      enabled: !!usdbStakeAddress,
    },
  });

  // Read USDB user info
  const { data: usdbUserInfoData, refetch: refetchUsdbUserInfo } =
    useReadContracts({
      contracts: [
        {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "userInfo",
          args: [0, address || "0x0000000000000000000000000000000000000000"],
        },
        {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "pendingReward",
          args: [0, address || "0x0000000000000000000000000000000000000000"],
        },
      ],
      query: {
        enabled: !!usdbStakeAddress && !!address,
      },
    });

  // Read USDB token allowance
  const { data: usdbTokenData, refetch: refetchUsdbTokenData } =
    useReadContracts({
      contracts: [
        {
          address: usdbTokenAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            address || "0x0000000000000000000000000000000000000000",
            usdbStakeAddress,
          ],
        },
      ],
      query: {
        enabled: !!usdbTokenAddress && !!usdbStakeAddress && !!address,
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

  // Process data for USDB pool
  const usdbPool = {
    pid: 0,
    isUsdbPool: true,
    poolData: usdbPoolInfo?.[0]?.result,
    userStaked: usdbUserInfoData?.[0]?.result?.[0] || BigInt(0),
    pendingReward: usdbUserInfoData?.[1]?.result?.[0] || BigInt(0), // BBB rewards
    pendingInterestReward: usdbUserInfoData?.[1]?.result?.[1] || BigInt(0), // USDB interest rewards
    symbol: "USDB",
    balance: usdbBalance?.[0]?.result || BigInt(0),
    allowance: usdbTokenData?.[0]?.result || BigInt(0),
    totalStaked: usdbPoolInfo?.[0]?.result?.[4] || BigInt(0), // Index 4 is totalStaked
    rewardPerBlock: usdbPoolInfo?.[0]?.result?.[5] || BigInt(0), // Index 5 is rewardPerBlock
    annualInterestRate: usdbPoolInfo?.[0]?.result?.[9] || BigInt(0), // Index 9 is annualInterestRate
    isActive: usdbPoolInfo?.[0]?.result?.[6] || false, // Index 6 is isActive
    tokenAddress: usdbTokenAddress,
    decimals: 6, // USDB uses 6 decimals
  };

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
    refetchUsdbPool();
    refetchUsdbUserInfo();
    refetchUsdbTokenData();
    refetchLpTokenData0();
    refetchLpTokenData1();
    refetchLpTokenData2();
    refetchLpTokenData3();
    refetchPairData0();
    refetchPairData1();
    refetchPairData2();
    refetchPairData3();
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

  // Create actions for USDB pool
  const createUsdbPoolActions = () => {
    // 确保我们有有效的地址
    if (!usdbStakeAddress || usdbStakeAddress === "0x123" || !usdbTokenAddress || usdbTokenAddress === "0x123") {
      return {
        approve: { buttonName: "Approve", data: null },
        stake: { buttonName: "Stake", data: null },
        unstake: { buttonName: "Unstake", data: null },
        claimReward: { buttonName: "Claim", data: null },
      };
    }

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
          args: [0, parseUnits(data.stakeAmount || "0", 6)],
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
          address: usdbStakeAddress,
          abi: USDBStakeABI,
          functionName: "withdraw",
          args: [0, parseUnits(data.unstakeAmount || "0", 6)],
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
      claimReward: {
        buttonName: "Claim",
        data: {
          address: usdbStakeAddress,
          abi: USDBStakeABI,
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

    // Check if this is native XDC pool
    const isNativeXdc = pool.isXdcPool === true;

    // Check if this is USDB pool
    const isUsdbPool = pool.isUsdbPool === true;

    // Check if this is XDC-BBB LP pool (PID 3)
    const isXdcBbbLp = pool.pid === 3;

    // Calculate annual rewards value in USD
    const annualRewardsUSD = Number(formatEther(annualRewards)) * bbbPrice;

    // Calculate total staked value based on token type
    let totalStakedUSD;

    if (isNativeXdc) {
      // For native XDC pool, use XDC price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
    } else if (
      isXdcBbbLp &&
      pool.reserves &&
      pool.lpTotalSupply &&
      pool.lpTotalSupply > 0
    ) {
      // For XDC-BBB LP pool, calculate LP token value based on reserves
      const bbbAddress = contracts[chainId]?.bbb?.address;
      let xdcReserve, bbbReserve;

      // Determine which token is BBB and which is XDC/WXDC
      if (pool.token0?.toLowerCase() === bbbAddress?.toLowerCase()) {
        bbbReserve = pool.reserves[0];
        xdcReserve = pool.reserves[1];
      } else {
        bbbReserve = pool.reserves[1];
        xdcReserve = pool.reserves[0];
      }

      // Calculate total LP value in USD
      const bbbValue = Number(formatEther(bbbReserve)) * bbbPrice;
      const xdcValue = Number(formatEther(xdcReserve)) * xdcPrice;
      const totalLpValueUSD = bbbValue + xdcValue;

      // Calculate LP token price (USD per LP token)
      const lpTokenPrice =
        totalLpValueUSD / Number(formatEther(pool.lpTotalSupply));

      // Calculate total staked value
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * lpTokenPrice;
    } else if (isUsdbPool) {
      // For USDB pool, assume USDB price is 1 USD (stablecoin)
      totalStakedUSD = Number(formatUnits(pool.totalStaked, 6)) * 1;
    } else if (isPsXdcPool || isBpsXdcPool) {
      // For psXDC or bpsXDC pools, use XDC price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
    } else if (isBBBPool) {
      // For BBB pool, use BBB price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * bbbPrice;
    } else {
      // For other LP tokens, use the general LP token price calculation
      totalStakedUSD =
        Number(formatEther(pool.totalStaked)) * (data.lpTokenPrice || 1);
    }

    // Base BBB APR = (annual rewards in USD / total staked in USD) * 100
    const bbbAPR =
      totalStakedUSD > 0 ? (annualRewardsUSD / totalStakedUSD) * 100 : 0;

    // Add 6% bonus APR only for psXDC or bpsXDC pools
    const bonusAPR = isPsXdcPool || isBpsXdcPool ? 6 : 0;

    // Add annual interest rate for USDB pools
    const interestAPR =
      isUsdbPool && pool.annualInterestRate
        ? Number(pool.annualInterestRate) / 100
        : 0;

    const totalAPR = bbbAPR + bonusAPR + interestAPR;

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
      numericTotal: totalAPR, // Keep numeric value for sorting
    };
  };

  // Sort pools by APR
  const sortPools = (pools) => {
    // Remove any potential duplicates based on unique pool identifier
    const uniquePools = pools.filter((pool, index, self) => {
      const uniqueId = pool.isXdcPool
        ? `xdc-${pool.pid}`
        : pool.isUsdbPool
        ? `usdb-${pool.pid}`
        : `lp-${pool.pid}`;
      return (
        index ===
        self.findIndex((p) => {
          const pId = p.isXdcPool
            ? `xdc-${p.pid}`
            : p.isUsdbPool
            ? `usdb-${p.pid}`
            : `lp-${p.pid}`;
          return pId === uniqueId;
        })
      );
    });

    if (data.sortBy === "latest") {
      // Return default order reversed
      return [...uniquePools].reverse();
    }

    // Default to APR sorting (from high to low)
    const poolsWithAPR = uniquePools.map((pool) => ({
      ...pool,
      aprValue: calculateAPR(pool).numericTotal || 0,
    }));

    return [...poolsWithAPR].sort((a, b) => b.aprValue - a.aprValue);
  };

  // Filter pools by search query
  const filterPools = (pools) => {
    if (!data.searchQuery.trim()) {
      return pools;
    }

    const searchTerm = data.searchQuery.toLowerCase().trim();

    return pools.filter((pool) => {
      // Search by pool symbol
      const symbolMatch = pool.symbol?.toLowerCase().includes(searchTerm);

      // For PID 3, also search by the contract symbol "icelp"
      const contractSymbolMatch =
        pool.pid === 3 && "icelp".includes(searchTerm);

      // Search by pool title
      const getPoolTitle = () => {
        if (pool.isXdcPool) return "XDC Staking";
        if (pool.isUsdbPool) return "USDB Staking";
        if (pool.pid === 0) return `${pool.symbol} ReStaking`;
        if (pool.pid === 1) return "bpsXDC ReStaking";
        if (pool.pid === 2) return "BBB Staking";
        if (pool.pid === 3) return "XDC-BBB LP Staking";
        return `${pool.symbol} Staking`;
      };
      const titleMatch = getPoolTitle().toLowerCase().includes(searchTerm);

      // Search by token type keywords
      const keywordMatch =
        (searchTerm.includes("xdc") &&
          (pool.isXdcPool || pool.symbol?.toLowerCase().includes("xdc"))) ||
        (searchTerm.includes("bbb") &&
          pool.symbol?.toLowerCase().includes("bbb")) ||
        searchTerm.includes("stake") ||
        searchTerm.includes("staking") ||
        searchTerm.includes("restake") ||
        searchTerm.includes("restaking") ||
        (searchTerm.includes("lp") && pool.pid === 3) ||
        (searchTerm.includes("icelp") && pool.pid === 3);

      return symbolMatch || contractSymbolMatch || titleMatch || keywordMatch;
    });
  };

  // Render a pool card
  const renderPoolCard = (pool, index) => {
    const poolActions = pool.isXdcPool
      ? createXdcPoolActions()
      : pool.isUsdbPool
      ? createUsdbPoolActions()
      : createPoolActions(pool.pid);
    const apr = calculateAPR(pool);
    const poolId = pool.isXdcPool
      ? `xdc-${pool.pid}`
      : pool.isUsdbPool
      ? `usdb-${pool.pid}`
      : `lp-${pool.pid}`;
    const isExpanded = data.expandedPools[poolId] ?? false;

    // Get hashtag for this pool
    const getHashTag = () => {
      if (pool.isXdcPool) return "#xdc";
      if (pool.isUsdbPool) return "#usdb";
      if (pool.pid === 0) return "#psXDC";
      if (pool.pid === 1) return "#bpsXDC";
      if (pool.pid === 2) return "#bbb";
      if (pool.pid === 3) return "#xdc-bbb";
      return "";
    };

    // Get icon for this pool
    const getPoolIcon = () => {
      if (pool.isUsdbPool) {
        return "/usdb.png"; // USDB icon for USDB pool
      }
      if (pool.isXdcPool || pool.pid === 0 || pool.pid === 1) {
        return "/xdc.png"; // XDC icon for XDC, psXDC, bpsXDC pools
      }
      if (pool.pid === 2) {
        return "/bbb.jpg"; // BBB icon for BBB pool
      }
      if (pool.pid === 3) {
        return "combined"; // Special identifier for combined XDC-BBB icon
      }
      return "";
    };

    // Determine the pool title and get token link
    const getPoolTitle = () => {
      if (pool.isXdcPool) return "XDC Staking";
      if (pool.isUsdbPool) return "USDB Staking";
      if (pool.pid === 0) return `${pool.symbol} ReStaking`;
      if (pool.pid === 1) return "bpsXDC ReStaking";
      if (pool.pid === 2) return "BBB Staking";
      if (pool.pid === 3) return "XDC-BBB LP Staking";
      return `${pool.symbol} Staking`;
    };

    // Determine the 'Get Token' link
    const getTokenLink = () => {
      if (pool.isXdcPool) return buyXDCLink;
      if (pool.isUsdbPool) return "/usdb"; // Link to get USDB
      if (pool.symbol === "bpsXDC") return "/bpsXDC";
      if (pool.symbol === "BBB") return "/buy"; // Use direct link to /buy for BBB
      if (pool.pid === 3)
        return "https://icecreamswap.com/add/XDC/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1?chain=xdc"; // IceCreamSwap link for XDC-BBB LP
      return "https://primestaking.xyz/xdc-liquid-staking"; // Default for psXDC
    };

    // Determine the APR tooltip text
    const getAprTooltip = () => {
      // For USDB pool, show BBB APR + USDB interest rate
      if (pool.isUsdbPool) {
        const interestRate = pool.annualInterestRate
          ? Number(pool.annualInterestRate) / 100
          : 0;
        return `BBB ${apr.bbbAPR}% + USDB ${interestRate.toFixed(2)}%`;
      }
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
      setData((prev) => ({
        ...prev,
        expandedPools: {
          ...prev.expandedPools,
          [poolId]: newExpanded,
        },
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
        key={
          pool.isXdcPool
            ? `xdc-${pool.pid}`
            : pool.isUsdbPool
            ? `usdb-${pool.pid}`
            : `lp-${pool.pid}`
        }
        className="space-y-3 mb-8 bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="p-4 md:p-6 cursor-pointer" onClick={toggleExpand}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 rounded-full overflow-hidden flex-shrink-0 relative">
                {getPoolIcon() === "combined" ? (
                  <div className="relative w-full h-full">
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
                  </div>
                ) : (
                  <img
                    src={getPoolIcon()}
                    alt={`${pool.symbol} icon`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold flex items-center flex-wrap gap-2">
                <a
                  href={getHashTag()}
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-green-600 transition-colors"
                >
                  {getPoolTitle()}
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
                  href={getTokenLink()}
                  className="text-xs text-green-600 hover:underline"
                  target="_blank"
                >
                  Get {pool.pid === 3 ? "XDC-BBB LP" : pool.symbol}
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
                      {pool.isUsdbPool
                        ? Number(
                            formatUnits(pool.userStaked, 6)
                          )?.toLocaleString("en-US", {
                            minimumFractionDigits: 4,
                            maximumFractionDigits: 4,
                          })
                        : Number(formatEther(pool.userStaked))?.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: pool.pid === 3 ? 8 : 4,
                              maximumFractionDigits: pool.pid === 3 ? 8 : 4,
                            }
                          )}{" "}
                      {pool.symbol}
                    </div>
                  </div>

                  {pool.isUsdbPool ? (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Pending Rewards</span>
                      <div className="font-medium truncate max-w-[60%] text-right">
                        {Number(
                          formatUnits(
                            pool.pendingInterestReward || BigInt(0),
                            6
                          )
                        )?.toLocaleString("en-US", {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6,
                        })}{" "}
                        USDB +{" "}
                        {Number(
                          formatEther(pool.pendingReward)
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
                          formatEther(pool.pendingReward)
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
                  {pool.isUsdbPool
                    ? Number(formatUnits(pool.totalStaked, 6))?.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        }
                      )
                    : Number(formatEther(pool.totalStaked))?.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: pool.pid === 3 ? 8 : 4,
                          maximumFractionDigits: pool.pid === 3 ? 8 : 4,
                        }
                      )}{" "}
                  {pool.symbol}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Rewards per Block</span>
                <div className="font-medium truncate max-w-[60%] text-right">
                  {pool.rewardPerBlock
                    ? Number(formatEther(pool.rewardPerBlock)).toLocaleString()
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
                      setData((prev) => ({
                        ...prev,
                        showStakeModal: true,
                        activePid: pool.pid,
                        isXdcPool: pool.isXdcPool || false,
                        isUsdbPool: pool.isUsdbPool || false,
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
                        isUsdbPool: pool.isUsdbPool || false,
                      }));
                    }}
                    disabled={pool.userStaked <= 0}
                  >
                    Unstake
                  </button>
                  {(pool.pendingReward > 0 || (pool.isUsdbPool && pool.pendingInterestReward > 0)) && (
                    <>
                      {pool.isUsdbPool ? (
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
    );
  };

  const activePool = data.isXdcPool
    ? xdcPool
    : data.isUsdbPool
    ? usdbPool
    : poolsWithData[data.activePid] || poolsWithData[0];
  const activeActions = data.isXdcPool
    ? createXdcPoolActions()
    : data.isUsdbPool
    ? createUsdbPoolActions()
    : createPoolActions(data.activePid);

  // Combine XDC pool with other pools for rendering
  const allPools = [xdcPool, usdbPool, ...poolsWithData];

  // Apply sorting to pools
  const sortedPools = sortPools(allPools);

  // Apply filtering to pools
  const filteredPools = filterPools(sortedPools);

  return (
    <div className="m-auto md:w-3/4 w-full px-4 md:px-0 mt-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-green-600">Stake</h1>
        <div className="text-sm text-green-700">🌊 Stake to earn</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={data.sortBy}
            onChange={(e) =>
              setData((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px]"
          >
            <option value="apr">APR</option>
            <option value="latest">Latest</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Search:</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search pools..."
              value={data.searchQuery}
              onChange={(e) =>
                setData((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="px-3 py-1 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px]"
            />
            {data.searchQuery && (
              <button
                onClick={() =>
                  setData((prev) => ({ ...prev, searchQuery: "" }))
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {data.searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredPools.length} pool
          {filteredPools.length !== 1 ? "s" : ""}
          {filteredPools.length > 0
            ? ` matching \`${data.searchQuery}\``
            : ` for \`${data.searchQuery}\``}
        </div>
      )}

      {filteredPools.length > 0 ? (
        filteredPools.map((pool, index) => renderPoolCard(pool, index))
      ) : data.searchQuery ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pools found
          </h3>
          <p className="text-gray-500 mb-4">
            No pools match your search for `{data.searchQuery}`
          </p>
          <button
            onClick={() => setData((prev) => ({ ...prev, searchQuery: "" }))}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        filteredPools.map((pool, index) => renderPoolCard(pool, index))
      )}

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
                    stakeAmount: activePool.isUsdbPool
                      ? formatUnits(activePool.balance, 6)
                      : formatEther(activePool.balance),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Available</span>
              <span className="truncate max-w-[70%] text-right">
                {activePool.isUsdbPool
                  ? Number(formatUnits(activePool.balance, 6))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      }
                    )
                  : Number(formatEther(activePool.balance))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: activePool.pid === 3 ? 8 : 4,
                        maximumFractionDigits: activePool.pid === 3 ? 8 : 4,
                      }
                    )}{" "}
                {activePool.symbol}
              </span>
            </div>

            {!data.isXdcPool &&
            !data.isUsdbPool &&
            activePool.allowance < parseEther(data.stakeAmount || "0") ? (
              <WriteButton
                {...activeActions.approve}
                className="btn w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : data.isUsdbPool &&
              activePool.allowance < parseUnits(data.stakeAmount || "0", 6) ? (
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
                    unstakeAmount: activePool.isUsdbPool
                      ? formatUnits(activePool.userStaked, 6)
                      : formatEther(activePool.userStaked),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Staked</span>
              <span className="truncate max-w-[70%] text-right">
                {activePool.isUsdbPool
                  ? Number(
                      formatUnits(activePool.userStaked, 6)
                    )?.toLocaleString("en-US", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })
                  : Number(formatEther(activePool.userStaked))?.toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: activePool.pid === 3 ? 8 : 4,
                        maximumFractionDigits: activePool.pid === 3 ? 8 : 4,
                      }
                    )}{" "}
                {activePool.symbol}
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
