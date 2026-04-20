import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useBlockNumber, useChainId, useReadContracts } from "wagmi";
import { formatEther, parseEther } from "viem";
import TokenMarkets from "@/components/TokenMarkets";
import { getXDCPrice } from "@/components/Utils";
import { contracts, liquidityStakingComingSoon as liquidityStakingComingSoonDefault } from "@/config";
import ERC20ABI from "@/abi/ERC20ABI.json";
import WriteButton from "@/components/WriteButton";

const WaveBackground = () => (
  <div className="wave-container fixed top-0 left-0 w-full h-full overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-green-50/30" />
    <svg
      className="waves absolute bottom-0 w-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
    >
      <defs>
        <path
          id="wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>
      <g className="wave-parallax1">
        <use href="#wave" x="50" y="3" fill="rgba(34, 197, 94, 0.03)" />
      </g>
      <g className="wave-parallax2">
        <use href="#wave" x="50" y="0" fill="rgba(34, 197, 94, 0.05)" />
      </g>
      <g className="wave-parallax3">
        <use href="#wave" x="50" y="9" fill="rgba(34, 197, 94, 0.07)" />
      </g>
    </svg>
  </div>
);

const XDCStakeCard = memo(({ address, chainId, onConnect }) => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);

  const effectiveChainId = chainId ?? 50;
  const stakeAddress = contracts[effectiveChainId]?.liqudityStaking?.address;
  const stakeAbi = contracts[effectiveChainId]?.liqudityStaking?.abi;

  const { data: xdcBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const createContracts = useCallback(() => {
    if (!stakeAddress || !stakeAbi) return [];
    const contractsList = [
      { address: stakeAddress, abi: stakeAbi, functionName: "bxdcToken" },
      { address: stakeAddress, abi: stakeAbi, functionName: "getExchangeRate" },
      { address: stakeAddress, abi: stakeAbi, functionName: "totalPooledXDC" },
      { address: stakeAddress, abi: stakeAbi, functionName: "minStakeAmount" },
      { address: stakeAddress, abi: stakeAbi, functionName: "minWithdrawAmount" },
      { address: stakeAddress, abi: stakeAbi, functionName: "withdrawDelayBlocks" },
    ];
    return contractsList;
  }, [stakeAddress, stakeAbi]);

  const { data: poolData, refetch: refetchPool } = useReadContracts({
    contracts: createContracts(),
    query: { enabled: !!stakeAddress },
  });

  const bxdcTokenAddress = poolData?.[0]?.result;
  const exchangeRate = poolData?.[1]?.result ?? 1n * BigInt(1e18);
  const totalPooled = poolData?.[2]?.result ?? 0n;
  const minStake = poolData?.[3]?.result ?? parseEther("1");
  const minWithdraw = poolData?.[4]?.result ?? 0n;
  const withdrawDelayBlocks = poolData?.[5]?.result ?? 0n;

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: userData, refetch: refetchUser } = useReadContracts({
    contracts:
      bxdcTokenAddress && address && stakeAddress
        ? [
            { address: bxdcTokenAddress, abi: ERC20ABI, functionName: "balanceOf", args: [address] },
            {
              address: bxdcTokenAddress,
              abi: ERC20ABI,
              functionName: "allowance",
              args: [address, stakeAddress],
            },
            {
              address: stakeAddress,
              abi: stakeAbi,
              functionName: "getUserWithdrawalBatchCount",
              args: [address],
            },
          ]
        : [],
    query: { enabled: !!bxdcTokenAddress && !!address },
  });

  const bxdcBalance = userData?.[0]?.result ?? 0n;
  const bxdcAllowance = userData?.[1]?.result ?? 0n;
  const batchCount = userData?.[2]?.result ?? 0n;

  const batchIdContracts =
    Number(batchCount) > 0 && stakeAddress && address
      ? Array.from({ length: Number(batchCount) }, (_, i) => ({
          address: stakeAddress,
          abi: stakeAbi,
          functionName: "userWithdrawalBatches",
          args: [address, BigInt(i)],
        }))
      : [];

  const { data: batchIdsData, refetch: refetchBatchIds } = useReadContracts({
    contracts: batchIdContracts,
    query: { enabled: batchIdContracts.length > 0 },
  });

  const batchIds = batchIdsData?.map((d) => d?.result).filter((id) => id !== undefined && id !== null) ?? [];

  const withdrawalDetailContracts =
    batchIds.length > 0 && stakeAddress
      ? batchIds.map((batchId) => ({
          address: stakeAddress,
          abi: stakeAbi,
          functionName: "withdrawalBatches",
          args: [batchId],
        }))
      : [];

  const { data: withdrawalDetails, refetch: refetchWithdrawals } = useReadContracts({
    contracts: withdrawalDetailContracts,
    query: { enabled: withdrawalDetailContracts.length > 0 },
  });

  const withdrawalOrders =
    batchIds.length > 0 && withdrawalDetails
      ? batchIds.map((batchId, i) => {
          const detail = withdrawalDetails[i]?.result;
          if (!detail) return null;
          const [xdcAmount, unlockBlock, redeemed] = detail;
          const bxdcAmount = exchangeRate > 0n ? (xdcAmount * BigInt(1e18)) / exchangeRate : 0n;
          return {
            id: batchId,
            bxdcAmount,
            xdcAmount,
            unlockBlock,
            redeemed,
          };
        }).filter(Boolean)
      : [];

  const refreshStake = useCallback(() => {
    refetchPool();
    refetchUser();
    refetchBatchIds?.();
    refetchWithdrawals?.();
  }, [refetchPool, refetchUser, refetchBatchIds, refetchWithdrawals]);

  const { data: supplyData } = useReadContracts({
    contracts: bxdcTokenAddress
      ? [{ address: bxdcTokenAddress, abi: ERC20ABI, functionName: "totalSupply" }]
      : [],
    query: { enabled: !!bxdcTokenAddress },
  });
  const bxdcTotalSupply = supplyData?.[0]?.result ?? 1n;
  const userXdcValueCalc =
    bxdcBalance > 0n && totalPooled > 0n && bxdcTotalSupply > 0n
      ? (bxdcBalance * totalPooled) / bxdcTotalSupply
      : 0n;

  const handleStakeClick = () => {
    if (!address) {
      onConnect?.();
      return;
    }
    setShowStakeModal(true);
  };

  const handleUnstakeClick = () => {
    if (!address) {
      onConnect?.();
      return;
    }
    setShowUnstakeModal(true);
  };

  if (!stakeAddress) return null;

  const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  const needsApprove = unstakeAmount && parseEther(unstakeAmount || "0") > bxdcAllowance;

  return (
    <>
      <div className="card bg-white/10 backdrop-blur-sm border border-green-200/50 rounded-xl mb-6 overflow-hidden">
        <div className="card-body p-5">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/xdc.png" alt="XDC" width={32} height={32} className="rounded-full" />
            <h3 className="font-semibold text-green-800 text-lg">Liquidity Staking</h3>
          </div>

          {/* Balance section - XDC and bXDC display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/30 rounded-lg p-4 border border-green-100/60">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Balance</p>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">XDC</span>
                  <span className="font-semibold text-green-800 tabular-nums">
                    {address ? formatEther(xdcBalance?.value ?? 0n) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">bXDC</span>
                  <span className="font-semibold text-green-800 tabular-nums">
                    {address ? formatEther(bxdcBalance) : "—"}
                  </span>
                </div>
                {address && userXdcValueCalc > 0n && (
                  <div className="pt-2 mt-2 border-t border-green-200/50">
                    <span className="text-xs text-gray-500">bXDC ≈ </span>
                    <span className="text-xs font-medium text-green-700">{formatEther(userXdcValueCalc)} XDC</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/30 rounded-lg p-4 border border-green-100/60">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pool Info</p>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">Total Staked</span>
                  <span className="font-semibold text-green-800 tabular-nums">{formatEther(totalPooled)} XDC</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">Rate</span>
                  <span className="font-semibold text-green-800 tabular-nums">1 bXDC = {formatEther(exchangeRate)} XDC</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-success" onClick={handleStakeClick}>
              {address ? "Stake" : "Connect Wallet"}
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleUnstakeClick}
              disabled={!!address && bxdcBalance === 0n}
            >
              {address ? "Withdraw" : "Connect Wallet"}
            </button>
          </div>
          {withdrawalOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200/50">
              <h4 className="font-medium text-sm mb-2 text-green-800">Withdrawal Orders</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {withdrawalOrders.map((order) => {
                  const canRedeem = blockNumber !== undefined && !order.redeemed && blockNumber >= order.unlockBlock;
                  return (
                    <div
                      key={String(order.id)}
                      className="flex justify-between items-center text-sm p-2 bg-white/20 rounded-lg gap-2"
                    >
                      <span>
                        {formatEther(order.xdcAmount)} XDC
                        <span className="text-gray-500 ml-1">
                          ({formatEther(order.bxdcAmount)} bXDC)
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            order.redeemed
                              ? "text-green-600 font-medium"
                              : canRedeem
                                ? "text-green-600 font-medium"
                                : "text-amber-600 font-medium"
                          }
                        >
                          {order.redeemed ? "Redeemed" : canRedeem ? "Ready" : "Pending"}
                        </span>
                        {canRedeem && (
                          <WriteButton
                            className="btn btn-ghost btn-xs text-green-600"
                            buttonName="Redeem"
                            data={{
                              address: stakeAddress,
                              abi: stakeAbi,
                              functionName: "redeemWithdrawal",
                              args: [order.id],
                            }}
                            callback={refreshStake}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-2">
            <Link href="/stake" className="btn btn-ghost btn-sm text-green-600">
              View all pools →
            </Link>
          </div>
        </div>
      </div>

      {showStakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowStakeModal(false)} aria-hidden />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Stake XDC</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowStakeModal(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount</span>
                <span className="label-text-alt">Balance: {formatEther(xdcBalance?.value ?? 0n)} XDC</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered flex-1"
                  value={stakeAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^(0|[1-9]\d*)(\.\d*)?$/.test(v) || v === "") setStakeAmount(v);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setStakeAmount(formatEther(xdcBalance?.value ?? 0n))}
                >
                  Max
                </button>
              </div>
            </div>
            <div className="modal-action mt-6 gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setShowStakeModal(false)}>
                Cancel
              </button>
              <WriteButton
                className="btn btn-success flex-1"
              buttonName="Stake"
              disabled={
                !stakeAmount ||
                parseEther(stakeAmount || "0") < minStake ||
                parseEther(stakeAmount || "0") > (xdcBalance?.value ?? 0n)
              }
              data={{
                address: stakeAddress,
                abi: stakeAbi,
                functionName: "stake",
                value: parseEther(stakeAmount || "0"),
              }}
                callback={() => {
                  refreshStake();
                  setShowStakeModal(false);
                  setStakeAmount("");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showUnstakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowUnstakeModal(false)} aria-hidden />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Request Withdrawal</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowUnstakeModal(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Withdrawals unlock after {String(withdrawDelayBlocks)} blocks. Min: {formatEther(minWithdraw)} bXDC.
            </p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">bXDC Amount</span>
                <span className="label-text-alt">Balance: {formatEther(bxdcBalance)} bXDC</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered flex-1"
                  value={unstakeAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^(0|[1-9]\d*)(\.\d*)?$/.test(v) || v === "") setUnstakeAmount(v);
                  }}
                />
                <button type="button" className="btn btn-sm" onClick={() => setUnstakeAmount(formatEther(bxdcBalance))}>
                  Max
                </button>
              </div>
            </div>
            <div className="modal-action mt-6 gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setShowUnstakeModal(false)}>
                Cancel
              </button>
              {needsApprove ? (
                <WriteButton
                  className="btn btn-outline flex-1"
                  buttonName="Approve"
                  data={{
                    address: bxdcTokenAddress,
                    abi: ERC20ABI,
                    functionName: "approve",
                    args: [stakeAddress, MAX_UINT256],
                  }}
                  callback={refreshStake}
                />
              ) : (
                <WriteButton
                  className="btn btn-success flex-1"
                  buttonName="Withdraw"
                  disabled={
                    !unstakeAmount ||
                    parseEther(unstakeAmount || "0") < minWithdraw ||
                    parseEther(unstakeAmount || "0") > bxdcBalance
                  }
                  data={{
                    address: stakeAddress,
                    abi: stakeAbi,
                    functionName: "withdraw",
                    args: [parseEther(unstakeAmount || "0")],
                  }}
                  callback={() => {
                    refreshStake();
                    setShowUnstakeModal(false);
                    setUnstakeAmount("");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

XDCStakeCard.displayName = "XDCStakeCard";

const LiquidityStakingComingSoon = memo(() => (
  <div className="coming-soon-card relative mb-6 overflow-hidden rounded-2xl backdrop-blur-md">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-emerald-50/40 to-green-50/30" />
    <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-br from-white/20 to-green-50/20" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_0%,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.25)_50%,transparent_65%)] coming-soon-shimmer" />
    <div className="relative z-10 p-8 sm:p-10 border border-green-200/30 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="coming-soon-icon-wrap flex-shrink-0 relative">
          <Image src="/xdc.png" alt="XDC" width={72} height={72} className="rounded-2xl shadow-xl ring-2 ring-white/50 relative z-10" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-green-900 text-xl sm:text-2xl tracking-tight mb-2">Liquidity Staking</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-5 max-w-md leading-relaxed">
            Stake XDC to earn rewards. Convert to bXDC and participate in the staking pool.
          </p>
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/15 border border-amber-400/40 text-amber-800 font-semibold text-sm tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon
          </span>
        </div>
      </div>
    </div>
    <style jsx>{`
      .coming-soon-shimmer {
        animation: comingSoonShimmer 4s ease-in-out infinite;
      }
      @keyframes comingSoonShimmer {
        0%, 100% { opacity: 0; transform: translateX(-20%); }
        50% { opacity: 1; transform: translateX(20%); }
      }
      .coming-soon-icon-wrap::before {
        content: "";
        position: absolute;
        inset: -12px;
        background: radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 65%);
        border-radius: 1.5rem;
        filter: blur(16px);
        z-index: -1;
      }
    `}</style>
  </div>
));
LiquidityStakingComingSoon.displayName = "LiquidityStakingComingSoon";

const FloatingCoins = () => (
  <div className="floating-coins absolute w-full h-full overflow-hidden pointer-events-none">
    <div className="coin coin1">
      <Image
        src="/xdc.png"
        alt="XDC"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
    <div className="coin coin2">
      <Image
        src="/bbb.jpg"
        alt="BBB"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
    <div className="coin coin3">
      <Image
        src="/logosm.png"
        alt="Coin"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
  </div>
);



const HomeContent = memo(() => {
  const privyLogin = usePrivyLogin();
  const router = useRouter();
  const [mount, setMount] = useState(false);
  /** Default from config; ?ComingSoon=true 显示占位，?ComingSoon=false 强制完整功能 */
  const comingSoonParam = router.query.ComingSoon;
  const liquidityStakingComingSoon =
    comingSoonParam === "true"
      ? true
      : comingSoonParam === "false"
        ? false
        : liquidityStakingComingSoonDefault;
  const { address } = useAccount();
  const chainId = useChainId();

  const [price, setPrice] = useState({});

  const fetchData = useCallback(async () => {
    setMount(false);
    const xdc = await getXDCPrice();

    setPrice(prevPrice => ({ ...prevPrice, xdc }));
    setMount(true);
  }, []);

  const xdcPrice = price?.xdc?.price;

  const xdcPriceChangeH24 = price?.xdc?.priceChange24h;

  useEffect(() => {
    // router.push("/markets");
    fetchData();
  }, [fetchData]);

  const handleTryNow = useCallback(async () => {
    try {
      if (!address) {
        await privyLogin();
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [privyLogin, router, address]);

  const tMarkets = {
    showBar: false,
    searchBar: false,
    pageSize: 4,
    xdcPrice,
    xdcPriceChangeH24,
    showLogo: true,
    tableSize: "lg",
  };

  return (
    <>
      <style jsx global>{`
        .wave-container {
          z-index: -1;
        }
        .waves {
          height: 100vh;
          min-height: 100px;
        }
        .wave-parallax1 use {
          animation: move-forever1 25s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        .wave-parallax2 use {
          animation: move-forever2 20s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        .wave-parallax3 use {
          animation: move-forever3 15s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        @keyframes move-forever1 {
          0% {
            transform: translate(85px, 0%);
          }
          100% {
            transform: translate(-90px, 0%);
          }
        }
        @keyframes move-forever2 {
          0% {
            transform: translate(-90px, 0%);
          }
          100% {
            transform: translate(85px, 0%);
          }
        }
        @keyframes move-forever3 {
          0% {
            transform: translate(-90px, 0%);
          }
          100% {
            transform: translate(85px, 0%);
          }
        }
        .floating-coins .coin {
          position: absolute;
          animation: float 6s infinite;
          opacity: 0.7;
        }
        .coin1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .coin2 {
          top: 40%;
          right: 10%;
          animation-delay: -2s;
        }
        .coin3 {
          top: 60%;
          left: 20%;
          animation-delay: -4s;
        }
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }
        .glow-effect {
          position: relative;
        }
        .glow-effect::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #22c55e, #15803d);
          border-radius: 0.5rem;
          z-index: -1;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-effect:hover::before {
          opacity: 1;
        }
      `}</style>
      <WaveBackground />
      <FloatingCoins />
      <div className="relative min-h-screen px-3 pb-8 pt-28 sm:px-4 sm:pt-32">
        <div className="mx-auto w-full max-w-content">
          <div className="card border border-base-300/40 bg-white/80 shadow-card backdrop-blur-md">
            <div className="card-body gap-6 rounded-2xl p-4 sm:p-6 md:p-8">
            {!liquidityStakingComingSoon && (
              <div className="mb-2 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700/80">Liquidity staking</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-green-900 sm:text-3xl">
                  Stake XDC · bXDC
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  连接钱包即可质押原生 XDC、持有流动性质押凭证 bXDC，并在解锁后赎回。更多奖励矿池请前往{" "}
                  <Link href="/stake" className="font-medium text-green-700 underline-offset-2 hover:underline">
                    Stake
                  </Link>
                  页面。
                </p>
              </div>
            )}
            {liquidityStakingComingSoon ? (
              <LiquidityStakingComingSoon />
            ) : (
              <XDCStakeCard address={address} chainId={chainId ?? 50} onConnect={handleTryNow} />
            )}
            <div className="mt-2 border-t border-base-300/30 pt-6">
              <div className="rounded-2xl border border-base-300/30 bg-white/60 p-3 shadow-inner backdrop-blur-sm sm:p-4">
                <TokenMarkets {...tMarkets} />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

HomeContent.displayName = "HomeContent";

const Home = memo(() => <HomeContent />);
Home.displayName = "Home";

export default Home;
