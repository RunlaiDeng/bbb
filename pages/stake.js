import LpStakeABI from "@/abi/LpStakeABI.json";
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
  });

  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  // LP Stake contract address
  const lpStakeAddress = contracts[chainId]?.lpStake?.address || "0x123";
  const psXDC = contracts[chainId]?.psXDC;
  const bpsXDC = contracts[chainId]?.bpsXDC;

  // Read pool info from the contract for PID 0 and 1
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
    ],
  });

  // Read user info for PID 0 and 1
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

  // Process data for both pools
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
    },
  ];

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
    refetchLpTokenData0();
    refetchLpTokenData1();
    refetchPairData0();
    refetchPairData1();
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

    // Calculate annual rewards value in USD
    const annualRewardsUSD = Number(formatEther(annualRewards)) * bbbPrice;

    // Calculate total staked value based on token type
    let totalStakedUSD;

    if (isPsXdcPool || isBpsXdcPool) {
      // For psXDC or bpsXDC pools, use XDC price directly
      totalStakedUSD = Number(formatEther(pool.totalStaked)) * xdcPrice;
    } else {
      // For LP tokens or other tokens, use LP token price
      totalStakedUSD =
        Number(formatEther(pool.totalStaked)) * (data.lpTokenPrice || 1);
    }

    // Base BBB APR = (annual rewards in USD / total staked in USD) * 100
    const bbbAPR =
      totalStakedUSD > 0 ? (annualRewardsUSD / totalStakedUSD) * 100 : 0;

    // Add 6% bonus APR
    const bonusAPR = 6;
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
    const poolActions = createPoolActions(pool.pid);
    const apr = calculateAPR(pool);

    return (
      <div
        key={pool.pid}
        className="space-y-6 mb-8 p-6 bg-white rounded-lg shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            {pool.pid === 1 ? "bpsXDC ReStaking" : `${pool.symbol} ReStaking`}
            <Link
              href={pool.symbol === "bpsXDC" ? "/bpsXDC" : "https://primestaking.xyz/xdc-liquid-staking"}
              className="ml-2 text-xs text-green-600 hover:underline"
              target="_blank"
            >
              Get {pool.symbol}
            </Link>
          </h2>
          <div
            className="text-green-600 font-bold text-lg cursor-help relative group underline"
            title={`${pool.symbol} 6% + BBB ${apr.bbbAPR}%`}
          >
            {apr.total}% APR
            <div className="opacity-0 bg-black text-white text-xs rounded p-1 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {pool.symbol} 6% + BBB {apr.bbbAPR}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Your Staked</span>
                <div className="font-medium">
                  {Number(formatEther(pool.userStaked))?.toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                  )}{" "}
                  {pool.symbol}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Pending Rewards</span>
                <div className="font-medium">
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
            <div className="font-medium">
              {Number(formatEther(pool.totalStaked))?.toLocaleString("en-US", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{" "}
              {pool.symbol}
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-500">Rewards per Block</span>
            <div className="font-medium">
              {Number(formatEther(pool.rewardPerBlock)).toLocaleString()} BBB
            </div>
          </div>
        </div>

        {isConnected ? (
          <>
            <div className="flex gap-4 pt-4">
              <button
                className="flex-1 py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    showStakeModal: true,
                    activePid: pool.pid,
                  }))
                }
                disabled={!pool.isActive}
              >
                Stake
              </button>
              <button
                className="flex-1 py-2 px-4 text-green-600 border border-green-500 rounded-md hover:bg-green-50 transition-colors"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    showUnstakeModal: true,
                    activePid: pool.pid,
                  }))
                }
                disabled={pool.userStaked <= 0}
              >
                Unstake
              </button>
              {pool.pendingReward > 0 && (
                <WriteButton
                  {...poolActions.claim}
                  className="flex-1 py-2 px-4 text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors cursor-pointer"
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-center p-4 mt-4 bg-gray-50 rounded-lg">
            <p className="mb-4 text-gray-600">
              Connect your wallet to stake and earn rewards
            </p>
            <button
              className="btn bg-green-600 text-white hover:bg-green-700"
              onClick={privyLogin}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    );
  };

  const activePool = poolsWithData[data.activePid] || poolsWithData[0];
  const activeActions = createPoolActions(data.activePid);

  return (
    <div className="m-auto md:w-3/4 w-96 mt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">Stake</h1>
        <div className="text-sm text-green-700">🌊 Stake to earn</div>
      </div>

      {poolsWithData.map((pool, index) => renderPoolCard(pool, index))}

      {/* Stake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showStakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
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
            <label className="input input-bordered flex items-center gap-2 w-full bg-gray-50">
              <input
                type="number"
                className="grow"
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
                className="kbd kbd-sm cursor-pointer hover:bg-green-50"
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
              <span>
                {formatEther(activePool.balance)} {activePool.symbol}
              </span>
            </div>

            {activePool.allowance < parseEther(data.stakeAmount || "0") ? (
              <WriteButton
                {...activeActions.approve}
                className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : (
              <WriteButton
                {...activeActions.stake}
                className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
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
        <div className="bg-white rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
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
            <label className="input input-bordered flex items-center gap-2 w-full bg-gray-50">
              <input
                type="number"
                className="grow"
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
                className="kbd kbd-sm cursor-pointer hover:bg-green-50"
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
              <span>
                {formatEther(activePool.userStaked)} {activePool.symbol}
              </span>
            </div>

            <WriteButton
              {...activeActions.unstake}
              className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;
