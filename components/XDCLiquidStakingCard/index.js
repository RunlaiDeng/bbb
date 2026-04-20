import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useMemo, useState } from "react";
import useWindowSize from "@/components/Hook/useWindowSize";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  useReadContracts,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { toBigIntSafe } from "@/lib/safeBigInt";
import { contracts } from "@/config";
import ERC20ABI from "@/abi/ERC20ABI.json";
import ERC721EnumerableABI from "@/abi/ERC721EnumerableABI.json";
import WriteButton from "@/components/WriteButton";

/**
 * XDCLiquidityStaking (spec v1.5): native stake, burn bXDC to withdraw,
 * delayed exits via NFT + claimWithdrawalHead, optional instant redeem when buffer allows.
 */
const MOBILE_MAX_WIDTH = 767;

const XDCLiquidStakingCard = memo(({ strings: t, onConnect }) => {
  const router = useRouter();
  const { width } = useWindowSize();
  const isMobileLayout =
    typeof width === "number" ? width <= MOBILE_MAX_WIDTH : false;

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);

  const { address } = useAccount();
  const chainId = useChainId();
  const effectiveChainId = chainId ?? 50;
  const stakeAddress = contracts[effectiveChainId]?.liqudityStaking?.address;
  const stakeAbi = contracts[effectiveChainId]?.liqudityStaking?.abi;

  const { data: xdcBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const poolReads = useMemo(() => {
    if (!stakeAddress || !stakeAbi) return [];
    return [
      { address: stakeAddress, abi: stakeAbi, functionName: "bxdcToken" },
      { address: stakeAddress, abi: stakeAbi, functionName: "withdrawalNFT" },
      { address: stakeAddress, abi: stakeAbi, functionName: "getExchangeRate" },
      { address: stakeAddress, abi: stakeAbi, functionName: "totalPooledXDC" },
      { address: stakeAddress, abi: stakeAbi, functionName: "minStakeAmount" },
      { address: stakeAddress, abi: stakeAbi, functionName: "minWithdrawAmount" },
      { address: stakeAddress, abi: stakeAbi, functionName: "withdrawDelayBlocks" },
      { address: stakeAddress, abi: stakeAbi, functionName: "getBufferHealthPercent" },
      { address: stakeAddress, abi: stakeAbi, functionName: "instantExitBuffer" },
    ];
  }, [stakeAddress, stakeAbi]);

  const { data: poolData, refetch: refetchPool } = useReadContracts({
    contracts: poolReads,
    query: { enabled: !!stakeAddress },
  });

  const ONE_ETHER = BigInt("1000000000000000000");

  const bxdcTokenAddress = poolData?.[0]?.result;
  const withdrawalNftAddress = poolData?.[1]?.result;
  const exchangeRate = toBigIntSafe(poolData?.[2]?.result, ONE_ETHER);
  const totalPooled = toBigIntSafe(poolData?.[3]?.result, 0n);
  const minStake = toBigIntSafe(poolData?.[4]?.result, parseEther("1"));
  const minWithdrawXdc = toBigIntSafe(poolData?.[5]?.result, 0n);
  const withdrawDelayBlocks = toBigIntSafe(poolData?.[6]?.result, 0n);
  const bufferHealth = toBigIntSafe(poolData?.[7]?.result, 0n);
  const instantExitBuffer = toBigIntSafe(poolData?.[8]?.result, 0n);

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const currentBlock =
    blockNumber !== undefined && blockNumber !== null
      ? toBigIntSafe(blockNumber, 0n)
      : undefined;

  const { data: userBase, refetch: refetchUser } = useReadContracts({
    contracts:
      bxdcTokenAddress && address && stakeAddress
        ? [
            {
              address: bxdcTokenAddress,
              abi: ERC20ABI,
              functionName: "balanceOf",
              args: [address],
            },
          ]
        : [],
    query: { enabled: !!bxdcTokenAddress && !!address },
  });

  const bxdcBalance = toBigIntSafe(userBase?.[0]?.result, 0n);

  const { data: nftBalData } = useReadContracts({
    contracts:
      withdrawalNftAddress && address
        ? [
            {
              address: withdrawalNftAddress,
              abi: ERC721EnumerableABI,
              functionName: "balanceOf",
              args: [address],
            },
          ]
        : [],
    query: { enabled: !!withdrawalNftAddress && !!address },
  });

  const nftBalance = toBigIntSafe(nftBalData?.[0]?.result, 0n);
  const nftCountRaw = typeof nftBalance === "bigint" ? Number(nftBalance) : Number(nftBalance ?? 0);
  const nftCount = Number.isFinite(nftCountRaw) ? nftCountRaw : 0;
  const safeNftCount = Math.min(Math.max(0, Math.floor(nftCount)), 64);

  const tokenIndexContracts = useMemo(() => {
    if (!withdrawalNftAddress || !address || safeNftCount <= 0) return [];
    return Array.from({ length: safeNftCount }, (_, i) => ({
      address: withdrawalNftAddress,
      abi: ERC721EnumerableABI,
      functionName: "tokenOfOwnerByIndex",
      args: [address, BigInt(i)],
    }));
  }, [withdrawalNftAddress, address, safeNftCount]);

  const { data: tokenIdRows, refetch: refetchTokenIds } = useReadContracts({
    contracts: tokenIndexContracts,
    query: {
      enabled: tokenIndexContracts.length > 0,
    },
  });

  const ticketIds = useMemo(
    () =>
      tokenIdRows?.map((row) => row?.result).filter((id) => id !== undefined && id !== null) ?? [],
    [tokenIdRows]
  );

  const ticketDetailContracts = useMemo(() => {
    if (!stakeAddress || !stakeAbi || ticketIds.length === 0) return [];
    return ticketIds.map((ticketId) => ({
      address: stakeAddress,
      abi: stakeAbi,
      functionName: "withdrawalTickets",
      args: [ticketId],
    }));
  }, [stakeAddress, stakeAbi, ticketIds]);

  const { data: ticketDetails, refetch: refetchTickets } = useReadContracts({
    contracts: ticketDetailContracts,
    query: { enabled: ticketDetailContracts.length > 0 },
  });

  const stakeWei = useMemo(() => {
    try {
      return stakeAmount && /^(0|[1-9]\d*)(\.\d*)?$/.test(stakeAmount)
        ? parseEther(stakeAmount)
        : 0n;
    } catch {
      return 0n;
    }
  }, [stakeAmount]);

  const unstakeWei = useMemo(() => {
    try {
      return unstakeAmount && /^(0|[1-9]\d*)(\.\d*)?$/.test(unstakeAmount)
        ? parseEther(unstakeAmount)
        : 0n;
    } catch {
      return 0n;
    }
  }, [unstakeAmount]);

  const { data: previewStakeOut } = useReadContracts({
    contracts:
      stakeAddress && stakeAbi && stakeWei > 0n
        ? [
            {
              address: stakeAddress,
              abi: stakeAbi,
              functionName: "getbXDCByXDC",
              args: [stakeWei],
            },
          ]
        : [],
    query: { enabled: !!stakeAddress && stakeWei > 0n },
  });

  const previewBxdcReceive = toBigIntSafe(previewStakeOut?.[0]?.result, 0n);

  const { data: previewOut } = useReadContracts({
    contracts:
      stakeAddress && stakeAbi && unstakeWei > 0n
        ? [
            {
              address: stakeAddress,
              abi: stakeAbi,
              functionName: "getXDCBybXDC",
              args: [unstakeWei],
            },
          ]
        : [],
    query: { enabled: !!stakeAddress && unstakeWei > 0n },
  });

  const previewXdcOut = toBigIntSafe(previewOut?.[0]?.result, 0n);
  const canInstantExit =
    unstakeWei > 0n &&
    previewXdcOut >= minWithdrawXdc &&
    previewXdcOut > 0n &&
    previewXdcOut <= instantExitBuffer &&
    unstakeWei <= bxdcBalance;

  const withdrawalOrders = useMemo(() => {
    if (!ticketDetails || ticketIds.length === 0) return [];
    return ticketIds
      .map((id, i) => {
        const detail = ticketDetails[i]?.result;
        if (!detail) return null;
        const [xdcAmountRaw, unlockBlockRaw, redeemed] = detail;
        return {
          id,
          xdcAmount: toBigIntSafe(xdcAmountRaw, 0n),
          unlockBlock: toBigIntSafe(unlockBlockRaw, 0n),
          redeemed,
        };
      })
      .filter(Boolean);
  }, [ticketDetails, ticketIds]);

  const refreshStake = useCallback(() => {
    refetchPool();
    refetchUser();
    refetchTokenIds?.();
    refetchTickets?.();
  }, [refetchPool, refetchUser, refetchTokenIds, refetchTickets]);

  const handlePrimaryStake = () => {
    if (!address) {
      onConnect?.();
    }
  };

  const goStakePage = useCallback(() => {
    router.push("/stake");
  }, [router]);

  const nftListBroken = address && withdrawalNftAddress && nftCount > 0 && ticketIds.length === 0;

  const xdcBal = xdcBalance?.value ?? 0n;
  let stakeDisabledReason = null;
  if (address) {
    if (!stakeAmount.trim()) stakeDisabledReason = t.enterAmount;
    else if (stakeWei < minStake) stakeDisabledReason = t.belowMinStake;
    else if (stakeWei > xdcBal) stakeDisabledReason = t.exceedsBalance;
  }

  if (!stakeAddress) return null;

  return (
    <>
      <div className="rounded-2xl border border-emerald-200/90 bg-white shadow-xl shadow-emerald-900/5 overflow-hidden mb-6">
        <div className="p-5 sm:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.liquidityStaking}</h3>
                <p className="text-xs text-gray-500 mt-1">{t.specHint}</p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Image src="/xdc.png" alt="XDC" width={36} height={36} className="rounded-full" />
                  <div className="flex-1 min-w-0">
                    <label className="text-xs text-emerald-700/80 uppercase tracking-wide" htmlFor="stake-xdc-inline">
                      XDC
                    </label>
                    <input
                      id="stake-xdc-inline"
                      type="text"
                      inputMode="decimal"
                      placeholder={t.xdcAmountPlaceholder}
                      className="w-full bg-transparent text-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none tabular-nums"
                      value={stakeAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^(0|[1-9]\d*)(\.\d*)?$/.test(v) || v === "") setStakeAmount(v);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 shrink-0"
                    onClick={() => address && setStakeAmount(formatEther(xdcBal))}
                    disabled={!address}
                  >
                    {t.max}
                  </button>
                </div>
                {address && (
                  <div className="flex justify-between text-xs text-gray-500 border-t border-emerald-100 pt-3">
                    <span>
                      {t.balance} · bXDC
                    </span>
                    <span className="tabular-nums text-gray-800">{formatEther(bxdcBalance)}</span>
                  </div>
                )}
              </div>

              {!address ? (
                <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 transition-colors shadow-md shadow-emerald-900/10"
                  onClick={handlePrimaryStake}
                >
                  {t.connectWallet}
                </button>
              ) : isMobileLayout ? (
                <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 min-h-[52px] shadow-md shadow-emerald-900/10"
                  onClick={goStakePage}
                >
                  {t.stake}
                </button>
              ) : (
                <WriteButton
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 border-0 min-h-[52px] flex items-center justify-center"
                  buttonName={t.stake}
                  disabled={!!stakeDisabledReason || stakeWei === 0n}
                  data={{
                    address: stakeAddress,
                    abi: stakeAbi,
                    functionName: "stake",
                    value: stakeWei,
                  }}
                  callback={() => {
                    refreshStake();
                    setStakeAmount("");
                  }}
                />
              )}
              {address && stakeDisabledReason && stakeAmount.trim() !== "" && !isMobileLayout && (
                <p className="text-xs text-amber-700 mt-2 text-center">{stakeDisabledReason}</p>
              )}

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.youWillReceive}</dt>
                  <dd className="text-emerald-600 font-medium tabular-nums text-right">
                    {stakeWei > 0n ? `${formatEther(previewBxdcReceive)} bXDC` : `0 bXDC`}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.rate}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">
                    1 bXDC = {formatEther(exchangeRate)} XDC
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.protocolApr}</dt>
                  <dd className="text-gray-600 text-right">{t.aprNotOnChain}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.totalStaked}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">{formatEther(totalPooled)} XDC</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.bufferHealth}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">{String(bufferHealth)}%</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.instantBuffer}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">{formatEther(instantExitBuffer)} XDC</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.minStake}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">{formatEther(minStake)} XDC</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.unbondingDelay}</dt>
                  <dd className="text-gray-800 tabular-nums text-right">{String(withdrawDelayBlocks)} blocks</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{t.estimatedNetworkFee}</dt>
                  <dd className="text-gray-600 text-right">~0.002 XDC</dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => {
                    if (!address) onConnect?.();
                    else setShowUnstakeModal(true);
                  }}
                >
                  {address ? t.withdraw : t.connectWallet}
                </button>
                <Link href="/stake" className="text-sm text-gray-500 hover:text-emerald-600">
                  {t.viewPools} →
                </Link>
              </div>

          {withdrawalOrders.length > 0 && (
            <div className="mt-6 pt-4 border-t border-emerald-100">
              <h4 className="font-medium text-sm mb-2 text-gray-800">{t.withdrawalTickets}</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {withdrawalOrders.map((order) => {
                  const matured =
                    currentBlock !== undefined && !order.redeemed && currentBlock >= order.unlockBlock;
                  const blocksLeft =
                    currentBlock !== undefined && !order.redeemed && currentBlock < order.unlockBlock
                      ? order.unlockBlock - currentBlock
                      : 0n;
                  let statusLabel = t.pending;
                  if (order.redeemed) statusLabel = t.redeemed;
                  else if (matured) statusLabel = t.ready;

                  return (
                    <div
                      key={String(order.id)}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm p-2 rounded-lg bg-emerald-50/80 border border-emerald-100"
                    >
                      <div>
                        <span className="font-mono text-xs text-gray-500">
                          {t.ticketId} #{String(order.id)}
                        </span>
                        <span className="ml-2 text-gray-800">{formatEther(order.xdcAmount)} XDC {t.xdcOut}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            order.redeemed
                              ? "text-emerald-600 font-medium"
                              : matured
                                ? "text-emerald-600 font-medium"
                                : "text-amber-700 font-medium"
                          }
                        >
                          {statusLabel}
                          {!order.redeemed && blocksLeft > 0n && (
                            <span className="text-gray-500 font-normal ml-1">
                              ({String(blocksLeft)} {t.blocksLeft})
                            </span>
                          )}
                        </span>
                        {matured && (
                          <WriteButton
                            className="btn btn-ghost btn-xs text-emerald-600"
                            buttonName={t.claim}
                            data={{
                              address: stakeAddress,
                              abi: stakeAbi,
                              functionName: "claimWithdrawalHead",
                              args: [toBigIntSafe(order.id, 0n)],
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

          {nftListBroken && <p className="text-xs mt-3 text-amber-700">{t.nftEnumerableHint}</p>}
        </div>
      </div>

      {showUnstakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowUnstakeModal(false)} aria-hidden />
          <div
            className="relative bg-white border border-emerald-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">{t.requestWithdrawal}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle text-gray-400"
                onClick={() => setShowUnstakeModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{t.delayNote}</p>
            <p className="text-xs text-gray-500 mb-2">
              {t.blocksDelay}: {String(withdrawDelayBlocks)} · {t.minWithdrawXdc}: {formatEther(minWithdrawXdc)} XDC
            </p>
            {unstakeWei > 0n && previewXdcOut > 0n && (
              <p className="text-xs text-gray-600 mb-3">
                ≈ {formatEther(previewXdcOut)} XDC {t.xdcOut}
                {canInstantExit ? <span className="text-emerald-600 font-medium ml-1">({t.ready})</span> : null}
              </p>
            )}
            <div className="form-control">
              <label className="label" htmlFor="unstake-amt">
                <span className="label-text text-gray-600">{t.bxdcAmount}</span>
                <span className="label-text-alt text-gray-500">
                  {t.balance}: {formatEther(bxdcBalance)} bXDC
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="unstake-amt"
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered flex-1 bg-white border-emerald-200 text-gray-900"
                  value={unstakeAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^(0|[1-9]\d*)(\.\d*)?$/.test(v) || v === "") setUnstakeAmount(v);
                  }}
                />
                <button type="button" className="btn btn-sm bg-emerald-50 border-emerald-200 text-emerald-800" onClick={() => setUnstakeAmount(formatEther(bxdcBalance))}>
                  {t.max}
                </button>
              </div>
            </div>
            <div className="modal-action mt-6 gap-2 flex-col sm:flex-row">
              <button
                type="button"
                className="btn btn-ghost flex-1 w-full sm:w-auto text-gray-500"
                onClick={() => setShowUnstakeModal(false)}
              >
                {t.cancel}
              </button>
              {canInstantExit ? (
                <WriteButton
                  className="btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 flex-1 w-full sm:w-auto"
                  buttonName={t.ready}
                  disabled={!unstakeAmount || unstakeWei > bxdcBalance || !address}
                  data={{
                    address: stakeAddress,
                    abi: stakeAbi,
                    functionName: "redeem",
                    args: [unstakeWei, address, address],
                  }}
                  callback={() => {
                    refreshStake();
                    setShowUnstakeModal(false);
                    setUnstakeAmount("");
                  }}
                />
              ) : (
                <WriteButton
                  className="btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 flex-1 w-full sm:w-auto"
                  buttonName={t.withdraw}
                  disabled={
                    !unstakeAmount || unstakeWei > bxdcBalance || previewXdcOut < minWithdrawXdc || unstakeWei === 0n
                  }
                  data={{
                    address: stakeAddress,
                    abi: stakeAbi,
                    functionName: "withdraw",
                    args: [unstakeWei],
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

XDCLiquidStakingCard.displayName = "XDCLiquidStakingCard";

export default XDCLiquidStakingCard;
