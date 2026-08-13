import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";
import ERC20ABI from "@/abi/ERC20ABI.json";
import LpStakeABI from "@/abi/LpStakeABI.json";
import WriteButton from "@/components/WriteButton";
import useConnectWallet from "@/components/Hook/useConnectWallet";
import { formatSiteString } from "@/lib/i18n/siteStrings";

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BLOCKS_PER_YEAR = 31_536_000;

function parseAmount(value, decimals) {
  try {
    return value ? parseUnits(value, decimals) : 0n;
  } catch {
    return 0n;
  }
}

function formatAmount(value, decimals, fractionDigits = 4) {
  const amount = Number(formatUnits(value || 0n, decimals));
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export default function StakingPool({
  pid,
  poolType,
  poolConfig,
  data,
  setData,
  addTokenToWallet,
  bbbTokenAddress,
  onAPRChange,
  strings: s,
}) {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const openConnect = useConnectWallet();
  const decimals = poolConfig.decimals ?? 18;
  const poolContract =
    poolType === "lpstakev2"
      ? contracts[chainId]?.lpStakev2
      : contracts[chainId]?.lpStake;

  const [modal, setModal] = useState(null);
  const [amount, setAmount] = useState("");

  const poolReads = useMemo(() => {
    if (!poolContract) return [];
    const owner = address || ZERO_ADDRESS;
    return [
      { ...poolContract, functionName: "poolInfo", args: [pid] },
      { ...poolContract, functionName: "userInfo", args: [pid, owner] },
      { ...poolContract, functionName: "pendingReward", args: [pid, owner] },
    ];
  }, [address, pid, poolContract]);

  const {
    data: poolResults,
    refetch: refetchPool,
    isPending: poolPending,
  } = useReadContracts({
    contracts: poolReads,
    query: { enabled: poolReads.length > 0, refetchInterval: 15_000 },
  });

  const poolInfo = poolResults?.[0]?.result;
  const tokenAddress = poolInfo?.[0];
  const tokenReads = useMemo(() => {
    if (!tokenAddress || !poolContract) return [];
    const owner = address || ZERO_ADDRESS;
    return [
      { address: tokenAddress, abi: ERC20ABI, functionName: "balanceOf", args: [owner] },
      {
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [owner, poolContract.address],
      },
    ];
  }, [address, poolContract, tokenAddress]);

  const { data: tokenResults, refetch: refetchToken } = useReadContracts({
    contracts: tokenReads,
    query: { enabled: tokenReads.length > 0, refetchInterval: 15_000 },
  });

  const poolData = useMemo(
    () => ({
      tokenAddress,
      userStaked: poolResults?.[1]?.result?.[0] || 0n,
      pendingReward: poolResults?.[2]?.result || 0n,
      totalStaked: poolInfo?.[4] || 0n,
      rewardPerBlock: poolInfo?.[5] || 0n,
      balance: tokenResults?.[0]?.result || 0n,
      allowance: tokenResults?.[1]?.result || 0n,
    }),
    [poolInfo, poolResults, tokenAddress, tokenResults]
  );

  const apr = useMemo(() => {
    if (!poolData.totalStaked || !poolData.rewardPerBlock || !data.bbbPrice) return 0;
    const annualRewardsUsd =
      Number(formatEther(poolData.rewardPerBlock * BigInt(BLOCKS_PER_YEAR))) *
      data.bbbPrice;
    const stakedUsd =
      poolConfig.symbol === "USDC"
        ? Number(formatUnits(poolData.totalStaked, decimals))
        : Number(formatUnits(poolData.totalStaked, decimals)) * data.bbbPrice;
    return stakedUsd > 0 ? (annualRewardsUsd / stakedUsd) * 100 : 0;
  }, [data.bbbPrice, decimals, poolConfig.symbol, poolData]);

  const poolId = `${poolType === "lpstakev2" ? "lpv2" : "lp"}-${pid}`;

  useEffect(() => {
    onAPRChange?.(poolId, apr);
  }, [apr, onAPRChange, poolId]);

  const expanded = data.expandedPools?.[poolId] ?? false;

  const refresh = useCallback(() => {
    void Promise.all([refetchPool(), refetchToken()]);
  }, [refetchPool, refetchToken]);

  const closeModal = useCallback(() => {
    setModal(null);
    setAmount("");
  }, []);

  const parsedAmount = parseAmount(amount, decimals);
  const approveAction = {
    buttonName: s.stakingPool.approve,
    data:
      tokenAddress && poolContract
        ? {
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [poolContract.address, MAX_UINT256],
          }
        : null,
    callback: refresh,
  };
  const stakeAction = {
    buttonName: s.stakingPool.stake,
    data: poolContract
      ? {
          address: poolContract.address,
          abi: LpStakeABI,
          functionName: "deposit",
          args: [pid, parsedAmount],
        }
      : null,
    disabled: parsedAmount <= 0n || parsedAmount > poolData.balance,
    callback: () => {
      refresh();
      closeModal();
    },
  };
  const unstakeAction = {
    buttonName: s.stakingPool.unstake,
    data: poolContract
      ? {
          address: poolContract.address,
          abi: LpStakeABI,
          functionName: "withdraw",
          args: [pid, parsedAmount],
        }
      : null,
    disabled: parsedAmount <= 0n || parsedAmount > poolData.userStaked,
    callback: () => {
      refresh();
      closeModal();
    },
  };
  const claimAction = {
    buttonName: s.stakingPool.claim,
    data: poolContract
      ? {
          address: poolContract.address,
          abi: LpStakeABI,
          functionName: "claimReward",
          args: [pid],
        }
      : null,
    callback: refresh,
  };

  if (poolPending && !poolResults) {
    return (
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-20 animate-pulse bg-gray-100" />
      </div>
    );
  }

  return (
    <>
      <section id={poolId} className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <button
          type="button"
          className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between md:p-6"
          onClick={() =>
            setData((previous) => ({
              ...previous,
              expandedPools: {
                ...previous.expandedPools,
                [poolId]: !expanded,
              },
            }))
          }
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-3">
            <Image
              src={poolConfig.icon}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span>
              <span className="block text-lg font-bold text-gray-900">{poolConfig.title}</span>
              <span className="text-sm text-gray-500">{poolConfig.symbol}</span>
            </span>
          </span>
          <span className="flex items-center gap-4">
            <span
              className="font-bold text-emerald-700"
              title={formatSiteString(s.stakingPool.aprTooltipBbb, {
                bbbApr: apr.toFixed(2),
              })}
            >
              {apr.toFixed(2)}{s.stakingPool.aprSuffix}
            </span>
            <span aria-hidden>{expanded ? "▲" : "▼"}</span>
          </span>
        </button>

        {expanded ? (
          <div className="space-y-5 border-t border-gray-100 px-4 py-5 md:px-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                label={s.stakingPool.yourStaked}
                value={`${formatAmount(poolData.userStaked, decimals)} ${poolConfig.symbol}`}
              />
              <Stat
                label={s.stakingPool.pendingRewards}
                value={`${formatAmount(poolData.pendingReward, 18)} BBB`}
              />
              <Stat
                label={s.stakingPool.totalStaked}
                value={`${formatAmount(poolData.totalStaked, decimals)} ${poolConfig.symbol}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href={poolConfig.getTokenLink} className="font-semibold text-emerald-700 hover:underline">
                {formatSiteString(s.stakingPool.getToken, { symbol: poolConfig.symbol })}
              </Link>
              {isConnected && tokenAddress ? (
                <button
                  type="button"
                  className="font-semibold text-blue-700 hover:underline"
                  onClick={() => addTokenToWallet(tokenAddress, poolConfig.symbol, decimals)}
                >
                  {s.stakingPool.addToWallet}
                </button>
              ) : null}
              {isConnected ? (
                <button
                  type="button"
                  className="font-semibold text-blue-700 hover:underline"
                  onClick={() => addTokenToWallet(bbbTokenAddress, "BBB", 18)}
                >
                  {s.stakingPool.addBbbToWallet}
                </button>
              ) : null}
            </div>

            {isConnected ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setModal("stake")}
                >
                  {s.stakingPool.stake}
                </button>
                <button
                  type="button"
                  className="btn flex-1 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                  disabled={poolData.userStaked <= 0n}
                  onClick={() => setModal("unstake")}
                >
                  {s.stakingPool.unstake}
                </button>
                {poolData.pendingReward > 0n ? (
                  <WriteButton
                    {...claimAction}
                    className="btn flex-1 bg-amber-500 text-white hover:bg-amber-600"
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="mb-3 text-sm text-gray-600">{s.stakingPool.connectToStake}</p>
                <button type="button" className="btn bg-emerald-600 text-white" onClick={openConnect}>
                  {s.stakingPool.connectWallet}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {modal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {formatSiteString(
                  modal === "stake"
                    ? s.stakingPool.stakeModalTitle
                    : s.stakingPool.unstakeModalTitle,
                  { symbol: poolConfig.symbol }
                )}
              </h2>
              <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={closeModal}>
                ✕
              </button>
            </div>

            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                className="grow"
                value={amount}
                placeholder="0.0"
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === "" || /^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(next)) setAmount(next);
                }}
              />
              <span className="text-sm font-semibold">{poolConfig.symbol}</span>
              <button
                type="button"
                className="text-xs font-bold text-emerald-700"
                onClick={() =>
                  setAmount(
                    formatUnits(
                      modal === "stake" ? poolData.balance : poolData.userStaked,
                      decimals
                    )
                  )
                }
              >
                {s.stakingPool.max}
              </button>
            </label>

            <div className="mb-5 mt-2 flex justify-between text-sm text-gray-500">
              <span>
                {modal === "stake" ? s.stakingPool.available : s.stakingPool.staked}
              </span>
              <span>
                {formatAmount(
                  modal === "stake" ? poolData.balance : poolData.userStaked,
                  decimals
                )}{" "}
                {poolConfig.symbol}
              </span>
            </div>

            {modal === "stake" && poolData.allowance < parsedAmount ? (
              <WriteButton
                {...approveAction}
                className="btn w-full bg-emerald-600 text-white hover:bg-emerald-700"
              />
            ) : (
              <WriteButton
                {...(modal === "stake" ? stakeAction : unstakeAction)}
                className="btn w-full bg-emerald-600 text-white hover:bg-emerald-700"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 truncate font-semibold tabular-nums text-gray-900" title={value}>
        {value}
      </div>
    </div>
  );
}
