import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  useReadContracts,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { contracts } from "@/config";
import ERC20ABI from "@/abi/ERC20ABI.json";
import ERC721EnumerableABI from "@/abi/ERC721EnumerableABI.json";
import WriteButton from "@/components/WriteButton";

/**
 * Home-page card for XDCLiquidityStaking (spec v1.5): native stake, burn bXDC to withdraw,
 * delayed exits via NFT + claimWithdrawalHead, optional instant redeem when buffer allows.
 */
const XDCLiquidStakingCard = memo(({ strings: t, onConnect }) => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [showStakeModal, setShowStakeModal] = useState(false);
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

  const bxdcTokenAddress = poolData?.[0]?.result;
  const withdrawalNftAddress = poolData?.[1]?.result;
  const exchangeRate = poolData?.[2]?.result ?? 10n ** 18n;
  const totalPooled = poolData?.[3]?.result ?? 0n;
  const minStake = poolData?.[4]?.result ?? parseEther("1");
  const minWithdrawXdc = poolData?.[5]?.result ?? 0n;
  const withdrawDelayBlocks = poolData?.[6]?.result ?? 0n;
  const bufferHealth = poolData?.[7]?.result ?? 0n;
  const instantExitBuffer = poolData?.[8]?.result ?? 0n;

  const { data: blockNumber } = useBlockNumber({ watch: true });

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

  const bxdcBalance = userBase?.[0]?.result ?? 0n;

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

  const nftBalance = nftBalData?.[0]?.result ?? 0n;
  const nftCount = Number(nftBalance);
  const safeNftCount = Math.min(nftCount, 64);

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

  const unstakeWei = useMemo(() => {
    try {
      return unstakeAmount && /^(0|[1-9]\d*)(\.\d*)?$/.test(unstakeAmount)
        ? parseEther(unstakeAmount)
        : 0n;
    } catch {
      return 0n;
    }
  }, [unstakeAmount]);

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

  const previewXdcOut = previewOut?.[0]?.result ?? 0n;
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
        const [xdcAmount, unlockBlock, redeemed] = detail;
        return {
          id,
          xdcAmount,
          unlockBlock,
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

  const nftListBroken = address && withdrawalNftAddress && nftCount > 0 && ticketIds.length === 0;

  if (!stakeAddress) return null;

  return (
    <>
      <div className="card bg-white/10 backdrop-blur-sm border border-green-200/50 rounded-xl mb-6 overflow-hidden">
        <div className="card-body p-5">
          <div className="flex items-center gap-2 mb-4">
            <Image src="/xdc.png" alt="XDC" width={32} height={32} className="rounded-full" />
            <div>
              <h3 className="font-semibold text-green-800 text-lg">{t.liquidityStaking}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t.specHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/30 rounded-lg p-4 border border-green-100/60">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t.yourBalance}
              </p>
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
                    <span className="text-xs text-gray-500">{t.approxValue} </span>
                    <span className="text-xs font-medium text-green-700">
                      {formatEther(userXdcValueCalc)} XDC
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/30 rounded-lg p-4 border border-green-100/60">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t.poolInfo}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">{t.totalStaked}</span>
                  <span className="font-semibold text-green-800 tabular-nums">
                    {formatEther(totalPooled)} XDC
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">{t.rate}</span>
                  <span className="font-semibold text-green-800 tabular-nums text-right">
                    1 bXDC = {formatEther(exchangeRate)} XDC
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">{t.bufferHealth}</span>
                  <span className="font-semibold text-green-800 tabular-nums">{String(bufferHealth)}%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">{t.instantBuffer}</span>
                  <span className="font-semibold text-green-800 tabular-nums">
                    {formatEther(instantExitBuffer)} XDC
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm btn-success" onClick={handleStakeClick}>
              {address ? t.stake : t.connectWallet}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleUnstakeClick}
              disabled={!!address && bxdcBalance === 0n}
            >
              {address ? t.withdraw : t.connectWallet}
            </button>
          </div>

          {withdrawalOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200/50">
              <h4 className="font-medium text-sm mb-2 text-green-800">{t.withdrawalTickets}</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {withdrawalOrders.map((order) => {
                  const matured =
                    blockNumber !== undefined && !order.redeemed && blockNumber >= order.unlockBlock;
                  const blocksLeft =
                    blockNumber !== undefined && !order.redeemed && blockNumber < order.unlockBlock
                      ? order.unlockBlock - blockNumber
                      : 0n;
                  let statusLabel = t.pending;
                  if (order.redeemed) statusLabel = t.redeemed;
                  else if (matured) statusLabel = t.ready;

                  return (
                    <div
                      key={String(order.id)}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm p-2 bg-white/20 rounded-lg"
                    >
                      <div>
                        <span className="font-mono text-xs text-gray-600">
                          {t.ticketId} #{String(order.id)}
                        </span>
                        <span className="ml-2">
                          {formatEther(order.xdcAmount)} XDC {t.xdcOut}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            order.redeemed
                              ? "text-green-600 font-medium"
                              : matured
                                ? "text-green-600 font-medium"
                                : "text-amber-600 font-medium"
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
                            className="btn btn-ghost btn-xs text-green-600"
                            buttonName={t.claim}
                            data={{
                              address: stakeAddress,
                              abi: stakeAbi,
                              functionName: "claimWithdrawalHead",
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

          {nftListBroken && (
            <p className="text-xs text-amber-700 mt-3">{t.nftEnumerableHint}</p>
          )}

          <div className="mt-2">
            <Link href="/stake" className="btn btn-ghost btn-sm text-green-600">
              {t.viewPools} →
            </Link>
          </div>
        </div>
      </div>

      {showStakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowStakeModal(false)} aria-hidden />
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t.stakeXdc}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowStakeModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {t.minStake}: {formatEther(minStake)} XDC
            </p>
            <div className="form-control">
              <label className="label" htmlFor="stake-amt">
                <span className="label-text">{t.amount}</span>
                <span className="label-text-alt">
                  {t.balance}: {formatEther(xdcBalance?.value ?? 0n)} XDC
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="stake-amt"
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
                  {t.max}
                </button>
              </div>
            </div>
            <div className="modal-action mt-6 gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowStakeModal(false)}>
                {t.cancel}
              </button>
              <WriteButton
                className="btn btn-success flex-1"
                buttonName={t.stake}
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
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowUnstakeModal(false)} aria-hidden />
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t.requestWithdrawal}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowUnstakeModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">{t.delayNote}</p>
            <p className="text-xs text-gray-500 mb-2">
              {t.blocksDelay}: {String(withdrawDelayBlocks)} · {t.minWithdrawXdc}:{" "}
              {formatEther(minWithdrawXdc)} XDC
            </p>
            {unstakeWei > 0n && previewXdcOut > 0n && (
              <p className="text-xs text-gray-600 mb-3">
                ≈ {formatEther(previewXdcOut)} XDC {t.xdcOut}
                {canInstantExit ? (
                  <span className="text-green-700 font-medium ml-1">({t.ready})</span>
                ) : null}
              </p>
            )}
            <div className="form-control">
              <label className="label" htmlFor="unstake-amt">
                <span className="label-text">{t.bxdcAmount}</span>
                <span className="label-text-alt">
                  {t.balance}: {formatEther(bxdcBalance)} bXDC
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  id="unstake-amt"
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered flex-1"
                  value={unstakeAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^(0|[1-9]\d*)(\.\d*)?$/.test(v) || v === "") setUnstakeAmount(v);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setUnstakeAmount(formatEther(bxdcBalance))}
                >
                  {t.max}
                </button>
              </div>
            </div>
            <div className="modal-action mt-6 gap-2 flex-col sm:flex-row">
              <button
                type="button"
                className="btn btn-ghost flex-1 w-full sm:w-auto"
                onClick={() => setShowUnstakeModal(false)}
              >
                {t.cancel}
              </button>
              {canInstantExit ? (
                <WriteButton
                  className="btn btn-success flex-1 w-full sm:w-auto"
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
                  className="btn btn-success flex-1 w-full sm:w-auto"
                  buttonName={t.withdraw}
                  disabled={
                    !unstakeAmount ||
                    unstakeWei > bxdcBalance ||
                    previewXdcOut < minWithdrawXdc ||
                    unstakeWei === 0n
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
