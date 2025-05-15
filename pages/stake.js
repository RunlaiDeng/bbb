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
  });

  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  // LP Stake contract address
  const lpStakeAddress = contracts[chainId]?.lpStake?.address || "0x123";

  // Specifically focus on PID 0
  const pid = 0;

  // Read pool info from the contract for PID 0
  const { data: poolInfo, refetch: refetchPool } = useReadContracts({
    contracts: [
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "poolInfo",
        args: [pid],
      },
    ],
  });

  // Read user info for PID 0
  const { data: userInfoData, refetch: refetchUserInfo } = useReadContracts({
    contracts: [
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
    ],
    query: {
      enabled: !!lpStakeAddress,
    },
  });

  const pool = poolInfo?.[0]?.result;
  const lpTokenAddress = pool?.[0];

  // Read LP token data
  const { data: lpTokenData, refetch: refetchLpTokenData } = useReadContracts({
    contracts: [
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
    ],
    query: {
      enabled: !!lpTokenAddress,
    },
  });

  // Read LP pool reserves to calculate price directly
  const { data: pairData, refetch: refetchPairData } = useReadContracts({
    contracts: [
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
    ],
    query: {
      enabled: !!lpTokenAddress,
    },
  });

  // Extract data for the farm
  const allowance = lpTokenData?.[0]?.result || BigInt(0);
  const balance = lpTokenData?.[1]?.result || BigInt(0);
  const symbol = lpTokenData?.[2]?.result || "LP Token";
  const lpTotalSupply = lpTokenData?.[3]?.result || BigInt(0);
  const reserves = pairData?.[0]?.result || [BigInt(0), BigInt(0), 0];
  const token0 = pairData?.[1]?.result;
  const token1 = pairData?.[2]?.result;
  const userStaked = userInfoData?.[0]?.result?.[0] || BigInt(0);
  const pendingReward = userInfoData?.[1]?.result || BigInt(0);
  const totalStaked = pool?.[4] || BigInt(0);
  const rewardPerBlock = pool?.[5] || BigInt(0);
  const isActive = pool?.[6] || false;

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
          reserves &&
          lpTotalSupply &&
          lpTotalSupply > 0 &&
          token0 &&
          token1
        ) {
          // Determine which token is BBB and which is XDC
          const bbbAddress = contracts[chainId]?.bbb?.address;
          const wxdcAddress = contracts[chainId]?.wxdc?.address;

          let bbbReserve, xdcReserve;

          if (token0?.toLowerCase() === bbbAddress?.toLowerCase()) {
            bbbReserve = reserves[0];
            xdcReserve = reserves[1];
          } else if (token1?.toLowerCase() === bbbAddress?.toLowerCase()) {
            bbbReserve = reserves[1];
            xdcReserve = reserves[0];
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
            (bbbValue + xdcValue) / Number(formatEther(lpTotalSupply));

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
    refetchLpTokenData();
    refetchPairData();
  };

  // MAX_UINT256 for approvals
  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  // Approve LP token
  const approve = {
    buttonName: "Approve",
    data: {
      address: lpTokenAddress,
      abi: ERC20ABI,
      functionName: "approve",
      args: [lpStakeAddress, MAX_UINT256],
    },
    callback: () => {
      refreshData();
    },
  };

  // Stake LP tokens
  const stake = {
    buttonName: "Stake",
    data: {
      address: lpStakeAddress,
      abi: LpStakeABI,
      functionName: "deposit",
      args: [pid, parseEther(data.stakeAmount || "0")],
    },
    callback: () => {
      refreshData();
      setData((prev) => ({ ...prev, showStakeModal: false, stakeAmount: "" }));
    },
  };

  // Unstake LP tokens
  const unstake = {
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
  };

  // Claim rewards
  const claim = {
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
  };

  // Calculate APR
  const BLOCKS_PER_YEAR = 31536000;
  const calculateAPR = () => {
    if (!totalStaked || totalStaked === BigInt(0) || !rewardPerBlock) {
      return { total: "0.00", bbbAPR: "0.00" };
    }

    // Annual rewards = reward per block * blocks per year
    const annualRewards = rewardPerBlock * BigInt(BLOCKS_PER_YEAR);

    // Get BBB price and other pricing data from the state
    const bbbPrice = data.bbbPrice || 1;
    const xdcPrice = data.xdcPrice || 1;

    // Check if this is a psXDC pool
    const isPsXdcPool =
      symbol === "psXDC" || (symbol && symbol.includes("psXDC"));

    // Calculate annual rewards value in USD
    const annualRewardsUSD = Number(formatEther(annualRewards)) * bbbPrice;

    // Calculate total staked value based on token type
    let totalStakedUSD;

    if (isPsXdcPool) {
      // For psXDC pools, use XDC price directly
      totalStakedUSD = Number(formatEther(totalStaked)) * xdcPrice;
    } else {
      // For LP tokens or other tokens, use LP token price
      totalStakedUSD =
        Number(formatEther(totalStaked)) * (data.lpTokenPrice || 1);
    }

    // Base BBB APR = (annual rewards in USD / total staked in USD) * 100
    const bbbAPR =
      totalStakedUSD > 0 ? (annualRewardsUSD / totalStakedUSD) * 100 : 0;

    // Add 6% bonus APR
    const bonusAPR = 6;
    const totalAPR = bbbAPR + bonusAPR;

    // Format with commas for thousands
    return {
      total: totalAPR.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      bbbAPR: bbbAPR.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  };

  return (
    <div className="m-auto md:w-3/4 w-96 mt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">Stake</h1>
        <div className="text-sm text-green-700">🌊 Stake to earn</div>
      </div>

      {!pool ? (
        <div className="text-center p-8">
          <p className="text-gray-600">
            Farm information is not available at this time
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{symbol} Stake</h2>
            <div
              className="text-green-600 font-bold text-lg cursor-help relative group underline"
              title={`psXDC 6% + BBB ${calculateAPR().bbbAPR}%`}
            >
              {calculateAPR().total}% APR
              <div className="opacity-0 bg-black text-white text-xs rounded p-1 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                psXDC 6% + BBB {calculateAPR().bbbAPR}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isConnected ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Your Staked</span>
                  <div className="font-medium">
                    {Number(formatEther(userStaked)).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})} {symbol}
                    <Link
                      href={"https://primestaking.xyz/xdc-liquid-staking"}
                      className="ml-1 text-xs text-green-600 hover:underline"
                      target="_blank"
                    >
                      Get {symbol}
                    </Link>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Pending Rewards</span>
                  <div className="font-medium">
                    {Number(formatEther(pendingReward)).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})} BBB
                  </div>
                </div>
              </>
            ) : null}

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Total Staked</span>
              <div className="font-medium">
                {Number(formatEther(totalStaked)).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})} {symbol}
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Rewards per Block</span>
              <div className="font-medium">
                {Number(formatEther(rewardPerBlock)).toFixed(4)} BBB
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
                    }))
                  }
                  disabled={!isActive}
                >
                  Stake
                </button>
                <button
                  className="flex-1 py-2 px-4 text-green-600 border border-green-500 rounded-md hover:bg-green-50 transition-colors"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      showUnstakeModal: true,
                    }))
                  }
                  disabled={userStaked <= 0}
                >
                  Unstake
                </button>
                {pendingReward > 0 && (
                  <WriteButton
                    {...claim}
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
      )}

      {/* Stake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showStakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
              Stake LP Tokens
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
              <div className="font-medium">{symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50"
                onClick={() => {
                  setData({
                    ...data,
                    stakeAmount: formatEther(balance),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Available</span>
              <span>
                {formatEther(balance)} {symbol}
              </span>
            </div>

            {allowance < parseEther(data.stakeAmount || "0") ? (
              <WriteButton
                {...approve}
                className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
              />
            ) : (
              <WriteButton
                {...stake}
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
              Unstake LP Tokens
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
              <div className="font-medium">{symbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-green-50"
                onClick={() => {
                  setData({
                    ...data,
                    unstakeAmount: formatEther(userStaked),
                  });
                }}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-gray-500">
              <span>Staked</span>
              <span>
                {formatEther(userStaked)} {symbol}
              </span>
            </div>

            <WriteButton
              {...unstake}
              className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;
