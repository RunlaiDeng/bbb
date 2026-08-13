import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
} from "wagmi";
import {
  erc20Abi,
  formatUnits,
  getAddress,
  isAddress,
  parseUnits,
} from "viem";
import WriteButton from "@/components/WriteButton";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { xdc } from "@/config/chains";
import {
  BBBFISWAP_FACTORY_ABI,
  BBBFISWAP_FACTORY_ADDRESS,
  BBBFISWAP_PAIR_ABI,
  BBBFISWAP_ROUTER_ABI,
  BBBFISWAP_ROUTER_ADDRESS,
  BBBFISWAP_WXDC_ADDRESS,
  XDC_USDC_ADDRESS,
  ZERO_ADDRESS,
} from "@/config/bbbfiswap";

const MAX_UINT256 = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
const XDC_GAS_RESERVE = BigInt("10000000000000000");

function normalizeAmountInput(value) {
  return value === "" || /^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(value)
    ? value
    : null;
}

function parseAmount(value, decimals) {
  if (!value || decimals == null) return 0n;
  try {
    return parseUnits(value, decimals);
  } catch {
    return 0n;
  }
}

function formatAmount(value, decimals = 18, fractionDigits = 6) {
  if (value == null) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function applySlippage(value, bps) {
  if (!value || bps < 0 || bps >= 10_000) return 0n;
  return (value * BigInt(10_000 - bps)) / 10_000n;
}

function shortenAddress(value) {
  if (!value) return "";
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function TokenMark({ symbol }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-700 text-xs font-black text-white shadow-sm ring-2 ring-white">
      {(symbol || "TKN").slice(0, 4).toUpperCase()}
    </span>
  );
}

function AssetField({
  label,
  symbol,
  value,
  onChange,
  balance,
  onMax,
  readOnly = false,
  native = false,
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/45 p-4 transition focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-500">
        <span>{label}</span>
        <span className="truncate text-right tabular-nums">
          {balance != null ? balance : "—"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder="0.0"
          aria-label={`${label} ${symbol}`}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tabular-nums text-gray-900 outline-none placeholder:text-gray-300 sm:text-3xl"
        />
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 font-bold text-gray-800 shadow-sm">
          {native ? (
            <Image src="/xdc.png" alt="XDC" width={28} height={28} className="h-7 w-7 rounded-full" />
          ) : (
            <TokenMark symbol={symbol} />
          )}
          <span className="max-w-[6rem] truncate">{symbol}</span>
        </div>
      </div>
      {onMax ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onMax}
            className="rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            MAX
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function BBBFiSwap() {
  const t = useTranslation().dexHome;
  const router = useRouter();
  const { address } = useAccount();
  const chainId = useChainId();
  const [activeTab, setActiveTab] = useState("swap");
  const [direction, setDirection] = useState("buy");
  const [tokenInput, setTokenInput] = useState(XDC_USDC_ADDRESS);
  const [swapAmount, setSwapAmount] = useState("");
  const [liquidityTokenAmount, setLiquidityTokenAmount] = useState("");
  const [liquidityXdcAmount, setLiquidityXdcAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  useEffect(() => {
    if (!router.isReady) return;
    const requestedTab = Array.isArray(router.query.tab)
      ? router.query.tab[0]
      : router.query.tab;
    setActiveTab(requestedTab === "liquidity" ? "liquidity" : "swap");

    const requestedToken = Array.isArray(router.query.token)
      ? router.query.token[0]
      : router.query.token;
    if (requestedToken && isAddress(requestedToken)) {
      setTokenInput(getAddress(requestedToken));
    }
  }, [router.isReady, router.query.tab, router.query.token]);

  const setTab = useCallback(
    (nextTab) => {
      setActiveTab(nextTab);
      const nextQuery = { ...router.query, tab: nextTab };
      router.replace({ pathname: "/", query: nextQuery }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );

  const tokenAddress = useMemo(() => {
    const trimmed = tokenInput.trim();
    if (!isAddress(trimmed)) return null;
    const normalized = getAddress(trimmed);
    if (normalized.toLowerCase() === BBBFISWAP_WXDC_ADDRESS.toLowerCase()) return null;
    return normalized;
  }, [tokenInput]);

  const tokenContracts = useMemo(() => {
    if (!tokenAddress) return [];
    const owner = address || ZERO_ADDRESS;
    return [
      { address: tokenAddress, abi: erc20Abi, functionName: "name", chainId: xdc.id },
      { address: tokenAddress, abi: erc20Abi, functionName: "symbol", chainId: xdc.id },
      { address: tokenAddress, abi: erc20Abi, functionName: "decimals", chainId: xdc.id },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
        chainId: xdc.id,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, BBBFISWAP_ROUTER_ADDRESS],
        chainId: xdc.id,
      },
    ];
  }, [address, tokenAddress]);

  const {
    data: tokenReads,
    isPending: tokenReadsPending,
    refetch: refetchToken,
  } = useReadContracts({
    contracts: tokenContracts,
    query: {
      enabled: tokenContracts.length > 0,
      refetchInterval: 15_000,
    },
  });

  const tokenName = tokenReads?.[0]?.result || "";
  const tokenSymbol = tokenReads?.[1]?.result || "TOKEN";
  const tokenDecimalsResult = tokenReads?.[2]?.result;
  const tokenDecimals = tokenDecimalsResult == null ? null : Number(tokenDecimalsResult);
  const tokenBalance = tokenReads?.[3]?.result ?? 0n;
  const tokenAllowance = tokenReads?.[4]?.result ?? 0n;
  const tokenReady = Boolean(
    tokenAddress &&
      tokenReads?.[1]?.status === "success" &&
      tokenReads?.[2]?.status === "success"
  );
  const tokenInvalid = Boolean(
    tokenAddress &&
      !tokenReadsPending &&
      tokenReads &&
      (!tokenReads?.[1] || tokenReads[1].status === "failure" || tokenReads[2]?.status === "failure")
  );

  const {
    data: xdcBalanceData,
    refetch: refetchXdcBalance,
  } = useBalance({
    address,
    chainId: xdc.id,
    query: { enabled: Boolean(address), refetchInterval: 15_000 },
  });
  const xdcBalance = xdcBalanceData?.value ?? 0n;

  const {
    data: pairAddressResult,
    refetch: refetchPair,
  } = useReadContract({
    address: BBBFISWAP_FACTORY_ADDRESS,
    abi: BBBFISWAP_FACTORY_ABI,
    functionName: "getPair",
    args: tokenAddress ? [BBBFISWAP_WXDC_ADDRESS, tokenAddress] : undefined,
    chainId: xdc.id,
    query: {
      enabled: Boolean(tokenAddress),
      refetchInterval: 15_000,
    },
  });

  const pairAddress =
    pairAddressResult && pairAddressResult.toLowerCase() !== ZERO_ADDRESS
      ? pairAddressResult
      : null;

  const pairContracts = useMemo(
    () =>
      pairAddress
        ? [
            {
              address: pairAddress,
              abi: BBBFISWAP_PAIR_ABI,
              functionName: "token0",
              chainId: xdc.id,
            },
            {
              address: pairAddress,
              abi: BBBFISWAP_PAIR_ABI,
              functionName: "getReserves",
              chainId: xdc.id,
            },
          ]
        : [],
    [pairAddress]
  );

  const { data: pairReads, refetch: refetchReserves } = useReadContracts({
    contracts: pairContracts,
    query: {
      enabled: pairContracts.length > 0,
      refetchInterval: 12_000,
    },
  });

  const pairToken0 = pairReads?.[0]?.result;
  const reserves = pairReads?.[1]?.result;
  const reserve0 = reserves?.[0] ?? 0n;
  const reserve1 = reserves?.[1] ?? 0n;
  const wxdcIsToken0 =
    pairToken0?.toLowerCase() === BBBFISWAP_WXDC_ADDRESS.toLowerCase();
  const xdcReserve = wxdcIsToken0 ? reserve0 : reserve1;
  const tokenReserve = wxdcIsToken0 ? reserve1 : reserve0;
  const hasLiquidity = Boolean(pairAddress && xdcReserve > 0n && tokenReserve > 0n);

  const swapInputDecimals = direction === "buy" ? 18 : tokenDecimals;
  const swapOutputDecimals = direction === "buy" ? tokenDecimals : 18;
  const swapAmountWei = useMemo(
    () => parseAmount(swapAmount, swapInputDecimals),
    [swapAmount, swapInputDecimals]
  );
  const swapPath = useMemo(
    () =>
      tokenAddress
        ? direction === "buy"
          ? [BBBFISWAP_WXDC_ADDRESS, tokenAddress]
          : [tokenAddress, BBBFISWAP_WXDC_ADDRESS]
        : [],
    [direction, tokenAddress]
  );

  const {
    data: quoteAmounts,
    isFetching: quoteFetching,
    refetch: refetchQuote,
  } = useReadContract({
    address: BBBFISWAP_ROUTER_ADDRESS,
    abi: BBBFISWAP_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: swapAmountWei > 0n && swapPath.length === 2 ? [swapAmountWei, swapPath] : undefined,
    chainId: xdc.id,
    query: {
      enabled: Boolean(tokenReady && hasLiquidity && swapAmountWei > 0n),
      refetchInterval: 12_000,
    },
  });

  const quoteOut = quoteAmounts?.[1] ?? 0n;
  const slippageNumber = Number(slippage);
  const slippageValid =
    Number.isFinite(slippageNumber) && slippageNumber >= 0.1 && slippageNumber <= 20;
  const slippageBps = slippageValid ? Math.round(slippageNumber * 100) : -1;
  const minimumOut = applySlippage(quoteOut, slippageBps);
  const inputReserve = direction === "buy" ? xdcReserve : tokenReserve;
  const outputReserve = direction === "buy" ? tokenReserve : xdcReserve;
  const spotOutput =
    swapAmountWei > 0n && inputReserve > 0n
      ? (swapAmountWei * outputReserve) / inputReserve
      : 0n;
  const priceImpactBps =
    spotOutput > quoteOut && spotOutput > 0n
      ? Number(((spotOutput - quoteOut) * 10_000n) / spotOutput)
      : 0;

  const swapBalance = direction === "buy" ? xdcBalance : tokenBalance;
  const swapNeedsApproval =
    direction === "sell" && swapAmountWei > 0n && tokenAllowance < swapAmountWei;
  const swapHasEnoughBalance = swapAmountWei > 0n && swapAmountWei <= swapBalance;
  const swapDisabled =
    !tokenReady ||
    !hasLiquidity ||
    !slippageValid ||
    swapAmountWei <= 0n ||
    !swapHasEnoughBalance ||
    quoteOut <= 0n;

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);

  const approveSwapData =
    tokenAddress && swapAmountWei > 0n
      ? {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [BBBFISWAP_ROUTER_ADDRESS, MAX_UINT256],
          chainId: xdc.id,
        }
      : null;

  const swapData = useMemo(() => {
    if (!address || !tokenAddress || swapAmountWei <= 0n || minimumOut <= 0n) return null;
    if (direction === "buy") {
      return {
        address: BBBFISWAP_ROUTER_ADDRESS,
        abi: BBBFISWAP_ROUTER_ABI,
        functionName: "swapExactXDCForTokens",
        args: [minimumOut, swapPath, address, deadline],
        value: swapAmountWei,
        chainId: xdc.id,
      };
    }
    return {
      address: BBBFISWAP_ROUTER_ADDRESS,
      abi: BBBFISWAP_ROUTER_ABI,
      functionName: "swapExactTokensForXDC",
      args: [swapAmountWei, minimumOut, swapPath, address, deadline],
      chainId: xdc.id,
    };
  }, [address, deadline, direction, minimumOut, swapAmountWei, swapPath, tokenAddress]);

  const refreshAll = useCallback(() => {
    refetchToken?.();
    refetchXdcBalance?.();
    refetchPair?.();
    refetchReserves?.();
    refetchQuote?.();
  }, [refetchPair, refetchQuote, refetchReserves, refetchToken, refetchXdcBalance]);

  const handleSwapSuccess = useCallback(() => {
    setSwapAmount("");
    refreshAll();
  }, [refreshAll]);

  const toggleDirection = useCallback(() => {
    setDirection((current) => (current === "buy" ? "sell" : "buy"));
    setSwapAmount("");
  }, []);

  const setSwapMax = useCallback(() => {
    if (direction === "buy") {
      const spendable = xdcBalance > XDC_GAS_RESERVE ? xdcBalance - XDC_GAS_RESERVE : 0n;
      setSwapAmount(formatUnits(spendable, 18));
    } else if (tokenDecimals != null) {
      setSwapAmount(formatUnits(tokenBalance, tokenDecimals));
    }
  }, [direction, tokenBalance, tokenDecimals, xdcBalance]);

  const liquidityTokenWei = useMemo(
    () => parseAmount(liquidityTokenAmount, tokenDecimals),
    [liquidityTokenAmount, tokenDecimals]
  );
  const liquidityXdcWei = useMemo(
    () => parseAmount(liquidityXdcAmount, 18),
    [liquidityXdcAmount]
  );
  const liquidityTokenMin = applySlippage(liquidityTokenWei, slippageBps);
  const liquidityXdcMin = applySlippage(liquidityXdcWei, slippageBps);
  const liquidityNeedsApproval =
    liquidityTokenWei > 0n && tokenAllowance < liquidityTokenWei;
  const liquidityDisabled =
    !tokenReady ||
    !slippageValid ||
    liquidityTokenWei <= 0n ||
    liquidityXdcWei <= 0n ||
    liquidityTokenWei > tokenBalance ||
    liquidityXdcWei > xdcBalance;

  const approveLiquidityData =
    tokenAddress && liquidityTokenWei > 0n
      ? {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [BBBFISWAP_ROUTER_ADDRESS, MAX_UINT256],
          chainId: xdc.id,
        }
      : null;

  const liquidityData = useMemo(() => {
    if (!address || !tokenAddress || liquidityTokenWei <= 0n || liquidityXdcWei <= 0n) {
      return null;
    }
    return {
      address: BBBFISWAP_ROUTER_ADDRESS,
      abi: BBBFISWAP_ROUTER_ABI,
      functionName: "addLiquidityXDC",
      args: [
        tokenAddress,
        liquidityTokenWei,
        liquidityTokenMin,
        liquidityXdcMin,
        address,
        deadline,
      ],
      value: liquidityXdcWei,
      chainId: xdc.id,
    };
  }, [
    address,
    deadline,
    liquidityTokenMin,
    liquidityTokenWei,
    liquidityXdcMin,
    liquidityXdcWei,
    tokenAddress,
  ]);

  const handleLiquidityTokenChange = useCallback(
    (event) => {
      const next = normalizeAmountInput(event.target.value);
      if (next == null) return;
      setLiquidityTokenAmount(next);
      if (hasLiquidity && tokenDecimals != null) {
        const nextWei = parseAmount(next, tokenDecimals);
        const matchingXdc = tokenReserve > 0n ? (nextWei * xdcReserve) / tokenReserve : 0n;
        setLiquidityXdcAmount(nextWei > 0n ? formatUnits(matchingXdc, 18) : "");
      }
    },
    [hasLiquidity, tokenDecimals, tokenReserve, xdcReserve]
  );

  const handleLiquidityXdcChange = useCallback(
    (event) => {
      const next = normalizeAmountInput(event.target.value);
      if (next == null) return;
      setLiquidityXdcAmount(next);
      if (hasLiquidity && tokenDecimals != null) {
        const nextWei = parseAmount(next, 18);
        const matchingToken = xdcReserve > 0n ? (nextWei * tokenReserve) / xdcReserve : 0n;
        setLiquidityTokenAmount(nextWei > 0n ? formatUnits(matchingToken, tokenDecimals) : "");
      }
    },
    [hasLiquidity, tokenDecimals, tokenReserve, xdcReserve]
  );

  const handleLiquiditySuccess = useCallback(() => {
    setLiquidityTokenAmount("");
    setLiquidityXdcAmount("");
    refreshAll();
  }, [refreshAll]);

  const setMaxLiquidityToken = useCallback(() => {
    if (tokenDecimals == null) return;
    setLiquidityTokenAmount(formatUnits(tokenBalance, tokenDecimals));
    if (hasLiquidity) {
      const matchingXdc = tokenReserve > 0n ? (tokenBalance * xdcReserve) / tokenReserve : 0n;
      setLiquidityXdcAmount(formatUnits(matchingXdc, 18));
    }
  }, [hasLiquidity, tokenBalance, tokenDecimals, tokenReserve, xdcReserve]);

  const setMaxLiquidityXdc = useCallback(() => {
    const spendable = xdcBalance > XDC_GAS_RESERVE ? xdcBalance - XDC_GAS_RESERVE : 0n;
    setLiquidityXdcAmount(formatUnits(spendable, 18));
    if (hasLiquidity && tokenDecimals != null) {
      const matchingToken = xdcReserve > 0n ? (spendable * tokenReserve) / xdcReserve : 0n;
      setLiquidityTokenAmount(formatUnits(matchingToken, tokenDecimals));
    }
  }, [hasLiquidity, tokenDecimals, tokenReserve, xdcBalance, xdcReserve]);

  const swapInputSymbol = direction === "buy" ? "XDC" : tokenSymbol;
  const swapOutputSymbol = direction === "buy" ? tokenSymbol : "XDC";
  const swapInputBalanceLabel = address
    ? `${t.balance}: ${formatAmount(swapBalance, swapInputDecimals ?? 18)}`
    : t.connectForBalance;
  const tokenBalanceLabel = address
    ? `${t.balance}: ${formatAmount(tokenBalance, tokenDecimals ?? 18)}`
    : t.connectForBalance;
  const xdcBalanceLabel = address
    ? `${t.balance}: ${formatAmount(xdcBalance, 18)}`
    : t.connectForBalance;

  let swapHint = t.enterAmount;
  if (!tokenAddress) swapHint = t.invalidTokenAddress;
  else if (tokenInvalid) swapHint = t.tokenReadFailed;
  else if (!pairAddress) swapHint = t.noPair;
  else if (!hasLiquidity) swapHint = t.emptyPool;
  else if (swapAmountWei > swapBalance) swapHint = t.insufficientBalance;
  else if (quoteFetching) swapHint = t.refreshingQuote;

  return (
    <section className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-[#f6fbf7] px-3 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-lime-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.networkBadge}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0">
              {t.subtitle}
            </p>
          </div>

          <div className="min-w-0 rounded-3xl border border-emerald-100/90 bg-white/95 p-4 shadow-card backdrop-blur sm:p-6">
            <div className="mb-5 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
              <button
                id="swap"
                type="button"
                onClick={() => setTab("swap")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === "swap"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.swapTab}
              </button>
              <button
                id="liquidity"
                type="button"
                onClick={() => setTab("liquidity")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  activeTab === "liquidity"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.liquidityTab}
              </button>
            </div>

            <div className="mb-5">
              <label htmlFor="bbbfiswap-token" className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                {t.tokenAddress}
              </label>
              <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 ${tokenInvalid || (!tokenAddress && tokenInput) ? "border-red-200" : "border-gray-200 focus-within:border-emerald-400"}`}>
                <TokenMark symbol={tokenReady ? tokenSymbol : "TKN"} />
                <input
                  id="bbbfiswap-token"
                  type="text"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="0x..."
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs text-gray-800 outline-none sm:text-sm"
                />
              </div>
              <div className="mt-2 flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs">
                <span className={tokenInvalid ? "text-red-600" : "text-gray-500"}>
                  {tokenReadsPending && tokenAddress
                    ? t.loadingToken
                    : tokenReady
                      ? `${tokenName || tokenSymbol} · ${tokenSymbol}`
                      : tokenInvalid
                        ? t.tokenReadFailed
                        : tokenInput.trim()
                          ? t.invalidTokenAddress
                        : t.customTokenHint}
                </span>
                {tokenAddress && tokenInput !== XDC_USDC_ADDRESS ? (
                  <button
                    type="button"
                    onClick={() => setTokenInput(XDC_USDC_ADDRESS)}
                    className="font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    {t.useUsdc}
                  </button>
                ) : null}
              </div>
            </div>

            {activeTab === "swap" ? (
              <div>
                <AssetField
                  label={t.youPay}
                  symbol={swapInputSymbol}
                  value={swapAmount}
                  onChange={(event) => {
                    const next = normalizeAmountInput(event.target.value);
                    if (next != null) setSwapAmount(next);
                  }}
                  balance={swapInputBalanceLabel}
                  onMax={setSwapMax}
                  native={direction === "buy"}
                />

                <div className="relative z-10 -my-2 flex justify-center">
                  <button
                    type="button"
                    onClick={toggleDirection}
                    aria-label={t.reversePair}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white bg-emerald-100 text-lg font-black text-emerald-800 shadow-sm transition hover:rotate-180 hover:bg-emerald-200"
                  >
                    ↓
                  </button>
                </div>

                <AssetField
                  label={t.youReceive}
                  symbol={swapOutputSymbol}
                  value={
                    quoteOut > 0n && swapOutputDecimals != null
                      ? formatAmount(quoteOut, swapOutputDecimals, 8)
                      : ""
                  }
                  onChange={() => {}}
                  readOnly
                  native={direction === "sell"}
                />

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.minimumReceived}</span>
                    <span className="font-semibold tabular-nums text-gray-800">
                      {minimumOut > 0n && swapOutputDecimals != null
                        ? `${formatAmount(minimumOut, swapOutputDecimals, 8)} ${swapOutputSymbol}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.priceImpact}</span>
                    <span className={`font-semibold ${priceImpactBps > 500 ? "text-red-600" : "text-gray-800"}`}>
                      {quoteOut > 0n ? `${(priceImpactBps / 100).toFixed(2)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.fee}</span>
                    <span className="font-semibold text-gray-800">0.30%</span>
                  </div>
                </div>

                <p className="mt-3 min-h-5 text-center text-xs text-gray-500">{swapHint}</p>

                <div className="mt-3">
                  {swapNeedsApproval ? (
                    <WriteButton
                      data={approveSwapData}
                      disabled={!tokenReady || swapAmountWei <= 0n || swapAmountWei > tokenBalance}
                      buttonName={t.approve.replace("{symbol}", tokenSymbol)}
                      className="btn h-12 w-full rounded-2xl border-none bg-emerald-600 text-white hover:bg-emerald-700"
                      callback={refetchToken}
                    />
                  ) : (
                    <WriteButton
                      data={swapData}
                      disabled={swapDisabled}
                      buttonName={
                        chainId !== xdc.id
                          ? t.switchToXdc
                          : t.swapButton
                              .replace("{from}", swapInputSymbol)
                              .replace("{to}", swapOutputSymbol)
                      }
                      className="btn h-12 w-full rounded-2xl border-none bg-gradient-to-r from-emerald-500 to-green-700 text-base font-bold text-white shadow-md hover:from-emerald-600 hover:to-green-800"
                      callback={handleSwapSuccess}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-900">
                  {hasLiquidity ? t.poolRatioHint : t.firstLiquidityHint}
                </div>

                <AssetField
                  label={t.tokenAmount}
                  symbol={tokenSymbol}
                  value={liquidityTokenAmount}
                  onChange={handleLiquidityTokenChange}
                  balance={tokenBalanceLabel}
                  onMax={setMaxLiquidityToken}
                />
                <div className="my-2 text-center text-xl font-bold text-emerald-600">+</div>
                <AssetField
                  label={t.xdcAmount}
                  symbol="XDC"
                  value={liquidityXdcAmount}
                  onChange={handleLiquidityXdcChange}
                  balance={xdcBalanceLabel}
                  onMax={setMaxLiquidityXdc}
                  native
                />

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.poolStatus}</span>
                    <span className="font-semibold text-gray-800">
                      {hasLiquidity ? t.activePool : pairAddress ? t.emptyPoolShort : t.newPool}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.minimumToken}</span>
                    <span className="font-semibold tabular-nums text-gray-800">
                      {liquidityTokenMin > 0n
                        ? `${formatAmount(liquidityTokenMin, tokenDecimals ?? 18)} ${tokenSymbol}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span>{t.minimumXdc}</span>
                    <span className="font-semibold tabular-nums text-gray-800">
                      {liquidityXdcMin > 0n
                        ? `${formatAmount(liquidityXdcMin, 18)} XDC`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {liquidityNeedsApproval ? (
                    <WriteButton
                      data={approveLiquidityData}
                      disabled={!tokenReady || liquidityTokenWei <= 0n || liquidityTokenWei > tokenBalance}
                      buttonName={t.approve.replace("{symbol}", tokenSymbol)}
                      className="btn h-12 w-full rounded-2xl border-none bg-emerald-600 text-white hover:bg-emerald-700"
                      callback={refetchToken}
                    />
                  ) : (
                    <WriteButton
                      data={liquidityData}
                      disabled={liquidityDisabled}
                      buttonName={chainId !== xdc.id ? t.switchToXdc : t.addLiquidity}
                      className="btn h-12 w-full rounded-2xl border-none bg-gradient-to-r from-emerald-500 to-green-700 text-base font-bold text-white shadow-md hover:from-emerald-600 hover:to-green-800"
                      callback={handleLiquiditySuccess}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
              <label htmlFor="bbbfiswap-slippage" className="text-xs font-semibold text-gray-500">
                {t.slippage}
              </label>
              <div className="ml-auto flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1">
                <input
                  id="bbbfiswap-slippage"
                  type="number"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={slippage}
                  onChange={(event) => setSlippage(event.target.value)}
                  className="w-14 bg-transparent text-right text-xs font-bold outline-none"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
              {!slippageValid ? <span className="text-xs text-red-600">{t.slippageRange}</span> : null}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:pt-[8.4rem]">
          <div className="rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-card backdrop-blur">
            <h2 className="text-sm font-black text-gray-900">{t.poolOverview}</h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">{t.pair}</dt>
                <dd className="font-bold text-gray-900">{tokenSymbol}/XDC</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">{t.tokenReserve}</dt>
                <dd className="max-w-[12rem] truncate font-semibold tabular-nums text-gray-900">
                  {hasLiquidity && tokenDecimals != null
                    ? `${formatAmount(tokenReserve, tokenDecimals)} ${tokenSymbol}`
                    : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">{t.xdcReserve}</dt>
                <dd className="max-w-[12rem] truncate font-semibold tabular-nums text-gray-900">
                  {hasLiquidity ? `${formatAmount(xdcReserve, 18)} XDC` : "—"}
                </dd>
              </div>
            </dl>
            {pairAddress ? (
              <a
                href={`https://xdcscan.com/address/${pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                {t.viewPair} · {shortenAddress(pairAddress)}
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-950 p-5 text-white shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-xl">✓</div>
              <div>
                <h2 className="text-sm font-black">{t.contractTitle}</h2>
                <p className="mt-0.5 text-xs text-gray-400">{t.contractSubtitle}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <a
                href={`https://xdcscan.com/address/${BBBFISWAP_FACTORY_ADDRESS}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10"
              >
                <span className="text-gray-400">Factory</span>
                <span className="font-mono">{shortenAddress(BBBFISWAP_FACTORY_ADDRESS)}</span>
              </a>
              <a
                href={`https://xdcscan.com/address/${BBBFISWAP_ROUTER_ADDRESS}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10"
              >
                <span className="text-gray-400">Router</span>
                <span className="font-mono">{shortenAddress(BBBFISWAP_ROUTER_ADDRESS)}</span>
              </a>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-400">{t.riskNote}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
