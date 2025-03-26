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

const LiquidityFarm = () => {
  const [data, setData] = useState({
    showStakeModal: false,
    showUnstakeModal: false,
    stakeAmount: "",
    unstakeAmount: "",
  });

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
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
        args: [pid, address],
      },
      {
        address: lpStakeAddress,
        abi: LpStakeABI,
        functionName: "pendingReward",
        args: [pid, address],
      },
    ],
    query: {
      enabled: isConnected,
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
        args: [address, lpStakeAddress],
      },
      {
        address: lpTokenAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [address],
      },
      {
        address: lpTokenAddress,
        abi: ERC20ABI,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: !!lpTokenAddress && isConnected,
    },
  });

  // Extract data for the farm
  const allowance = lpTokenData?.[0]?.result || BigInt(0);
  const balance = lpTokenData?.[1]?.result || BigInt(0);
  const symbol = lpTokenData?.[2]?.result || "LP Token";
  const userStaked = userInfoData?.[0]?.result?.[0] || BigInt(0);
  const pendingReward = userInfoData?.[1]?.result || BigInt(0);
  const totalStaked = pool?.[4] || BigInt(0);
  const rewardPerBlock = pool?.[5] || BigInt(0);
  const isActive = pool?.[6] || false;

  console.log(pool);

  // Function to refresh all data
  const refreshData = () => {
    refetchPool();
    refetchUserInfo();
    refetchLpTokenData();
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
      return "0.00";
    }

    // Annual rewards = reward per block * blocks per year
    const annualRewards = rewardPerBlock * BigInt(BLOCKS_PER_YEAR);

    console.log(annualRewards);

    // APR = (annual rewards / total staked) * 100
    const apr =
      (Number(formatEther(annualRewards)) / Number(formatEther(totalStaked))) *
      100;

    return apr.toFixed(2);
  };

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-8">
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          Liquidity Farming
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🌊 Stake your LP tokens to earn rewards and boost your yield
        </div>

        <div className="flex justify-center mb-4">
          <Link
            href={
              "https://icecreamswap.com/v2/add/0x951857744785E80e2De051c32EE7b25f9c458C42/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1?chain=xdc"
            }
            className="btn bg-white text-green-600 hover:bg-opacity-90"
            target="_blank"
          >
            Get LP Tokens
          </Link>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <p className="mb-4 text-gray-600">
            Please connect your wallet to view your farm
          </p>
          <button
            className="btn bg-green-600 text-white hover:bg-green-700"
            onClick={privyLogin}
          >
            Connect Wallet
          </button>
        </div>
      ) : !pool ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">
            Farm information is not available at this time
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 mx-auto max-w-2xl">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <h3 className="text-xl font-bold">{symbol} Farm</h3>
            <p className="text-sm opacity-80">Pool ID: {pid}</p>
          </div>

          <div className="p-6">
            <div className="bg-green-50 rounded-lg mb-4 p-3 text-center border border-green-100">
              <p className="text-gray-600 text-sm">
                Estimated Annual Percentage Rate
              </p>
              <p className="font-bold text-xl text-green-600">
                {calculateAPR()}% APR
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Your Staked</p>
                <p className="font-semibold text-lg">
                  {formatEther(userStaked)} {symbol}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending Rewards</p>
                <p className="font-semibold text-lg">
                  {formatEther(pendingReward)} BBB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-500 text-sm">Total Staked</p>
                <p className="font-semibold">
                  {formatEther(totalStaked)} {symbol}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Rewards per Block</p>
                <p className="font-semibold">{formatEther(rewardPerBlock)} BBB</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="btn flex-1 bg-green-600 text-white hover:bg-green-700"
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
                className="btn flex-1 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
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
            </div>

            {pendingReward > 0 && (
              <div className="mt-2">
                <WriteButton
                  {...claim}
                  className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                />
              </div>
            )}
          </div>
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

export default LiquidityFarm;
