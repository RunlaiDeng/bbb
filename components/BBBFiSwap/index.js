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
  BBB_TOKEN_ADDRESS,
  XDC_USDC_ADDRESS,
  ZERO_ADDRESS,
} from "@/config/bbbfiswap";

const MAX_UINT256 = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
const XDC_GAS_RESERVE = BigInt("10000000000000000");
const COMMON_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: XDC_USDC_ADDRESS,
  },
  {
    symbol: "BBB",
    name: "BBBFi",
    address: BBB_TOKEN_ADDRESS,
  },
];

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

function TokenMark({ symbol, address, native = false, size = "md" }) {
  const normalizedAddress = address?.toLowerCase();
  const isBbb =
    normalizedAddress === BBB_TOKEN_ADDRESS.toLowerCase() || symbol === "BBB";
  const imageSrc =
    native || symbol === "XDC"
      ? "/xdc.png"
      : normalizedAddress === XDC_USDC_ADDRESS.toLowerCase() || symbol === "USDC"
        ? "/usdc.jpg"
        : null;
  const dimensions = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  if (isBbb) {
    return (
      <span
        className={`relative ${dimensions} shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-black/5`}
      >
        <Image
          src="/logo.png"
          alt="BBB carrot token logo"
          width={86}
          height={36}
          className="absolute left-0 top-0 h-full w-auto max-w-none object-contain object-left"
        />
      </span>
    );
  }

  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={`${symbol || "Token"} icon`}
        width={36}
        height={36}
        className={`${dimensions} shrink-0 rounded-full object-cover ring-1 ring-black/5`}
      />
    );
  }

  return (
    <span
      className={`inline-flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 text-[10px] font-black text-white ring-1 ring-black/10`}
    >
      {(symbol || "TKN").slice(0, 4).toUpperCase()}
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TokenPill({ symbol, address, native, onClick, selectLabel = "Select token" }) {
  const content = (
    <>
      <TokenMark symbol={symbol} address={address} native={native} />
      <span className="max-w-[7rem] truncate text-base font-semibold tracking-tight text-slate-950">
        {symbol}
      </span>
      {onClick ? <ChevronDownIcon /> : null}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-2.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:border-black/10 hover:bg-slate-50"
      aria-label={`${selectLabel}: ${symbol}`}
    >
      {content}
    </button>
  ) : (
    <div className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-2.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      {content}
    </div>
  );
}

function AssetField({
  label,
  symbol,
  address,
  value,
  onChange,
  balance,
  onMax,
  readOnly = false,
  native = false,
  onSelectToken,
  selectLabel,
  hasError = false,
}) {
  return (
    <div
      className={`rounded-[1.35rem] border p-4 transition sm:p-4 ${
        hasError
          ? "border-red-200 bg-red-50/70"
          : "border-transparent bg-[#f4f4f4] hover:border-black/[0.06] focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-sm font-medium text-slate-500">
        <span className="font-semibold">{label}</span>
        <span className="flex min-w-0 items-center gap-1.5 truncate text-right text-xs tabular-nums">
          {balance != null ? balance : "—"}
          {onMax ? (
            <button
              type="button"
              onClick={onMax}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 transition hover:bg-emerald-200"
            >
              MAX
            </button>
          ) : null}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder="0.0"
          aria-label={`${label} ${symbol}`}
          className="min-w-0 flex-1 bg-transparent text-[2rem] font-medium leading-none tracking-[-0.03em] tabular-nums text-slate-950 outline-none placeholder:text-slate-300 sm:text-[2.15rem]"
        />
        <TokenPill
          symbol={symbol}
          address={address}
          native={native}
          onClick={onSelectToken}
          selectLabel={selectLabel}
        />
      </div>
    </div>
  );
}

function TokenSelectorModal({ open, onClose, onSelect, currentAddress, t }) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    setSearchValue("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const normalizedSearch = searchValue.trim().toLowerCase();
  const visibleTokens = COMMON_TOKENS.filter((token) =>
    !normalizedSearch ||
    token.symbol.toLowerCase().includes(normalizedSearch) ||
    token.name.toLowerCase().includes(normalizedSearch) ||
    token.address.toLowerCase().includes(normalizedSearch)
  );
  const customAddress = isAddress(searchValue.trim())
    ? getAddress(searchValue.trim())
    : null;
  const customAddressAllowed = Boolean(
    customAddress &&
      customAddress.toLowerCase() !== BBBFISWAP_WXDC_ADDRESS.toLowerCase() &&
      !COMMON_TOKENS.some(
        (token) => token.address.toLowerCase() === customAddress.toLowerCase()
      )
  );

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-selector-title"
        className="w-full max-w-md rounded-t-[2rem] border border-black/[0.06] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:rounded-[2rem]"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="token-selector-title" className="text-lg font-semibold tracking-tight text-slate-950">
            {t.selectToken}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden className="shrink-0 text-slate-400">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t.searchToken}
            autoComplete="off"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <p className="mt-5 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {t.commonTokens}
        </p>
        <div className="mt-2 space-y-1">
          {visibleTokens.map((token) => {
            const selected = currentAddress?.toLowerCase() === token.address.toLowerCase();
            return (
              <button
                key={token.address}
                type="button"
                onClick={() => onSelect(token.address)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100"
              >
                <TokenMark symbol={token.symbol} address={token.address} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-950">{token.symbol}</span>
                  <span className="block truncate text-xs text-slate-500">{token.name}</span>
                </span>
                {selected ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                    {t.current}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {customAddressAllowed ? (
          <button
            type="button"
            onClick={() => onSelect(customAddress)}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-left transition hover:bg-emerald-100"
          >
            <TokenMark symbol="TKN" address={customAddress} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-emerald-950">{t.useCustomToken}</span>
              <span className="block truncate font-mono text-xs text-emerald-700">
                {customAddress}
              </span>
            </span>
          </button>
        ) : null}

        {visibleTokens.length === 0 && !customAddressAllowed ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.noTokenResults}</p>
        ) : null}

        <p className="mt-4 border-t border-slate-100 px-1 pt-4 text-xs leading-relaxed text-slate-500">
          {t.tokenSafety}
        </p>
      </div>
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
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quoteDetailsOpen, setQuoteDetailsOpen] = useState(false);

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
      setSettingsOpen(false);
      const nextQuery = { ...router.query, tab: nextTab };
      router.replace({ pathname: "/", query: nextQuery }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );

  const closeTokenSelector = useCallback(() => {
    setTokenSelectorOpen(false);
  }, []);

  const selectToken = useCallback(
    (nextAddress) => {
      const normalized = getAddress(nextAddress);
      setTokenInput(normalized);
      setSwapAmount("");
      setLiquidityTokenAmount("");
      setLiquidityXdcAmount("");
      setQuoteDetailsOpen(false);
      setTokenSelectorOpen(false);
      const nextQuery = { ...router.query, token: normalized };
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
  const swapOutputBalance = direction === "buy" ? tokenBalance : xdcBalance;
  const swapOutputBalanceLabel = address
    ? `${t.balance}: ${formatAmount(swapOutputBalance, swapOutputDecimals ?? 18)}`
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
  else if (!address && swapAmountWei > 0n) swapHint = t.connectToTrade;
  else if (address && swapAmountWei > swapBalance) swapHint = t.insufficientBalance;
  else if (quoteFetching) swapHint = t.refreshingQuote;

  const swapRate =
    quoteOut > 0n && swapAmountWei > 0n && swapInputDecimals != null && swapOutputDecimals != null
      ? Number(formatUnits(quoteOut, swapOutputDecimals)) /
        Number(formatUnits(swapAmountWei, swapInputDecimals))
      : 0;
  const swapRateLabel =
    Number.isFinite(swapRate) && swapRate > 0
      ? `1 ${swapInputSymbol} ≈ ${swapRate.toLocaleString(undefined, {
          maximumSignificantDigits: 7,
        })} ${swapOutputSymbol}`
      : t.liveQuote;
  const tokenStatus = tokenReadsPending && tokenAddress
    ? t.loadingToken
    : tokenInvalid
      ? t.tokenReadFailed
      : tokenReady
        ? `${tokenName || tokenSymbol} · ${shortenAddress(tokenAddress)}`
        : t.invalidTokenAddress;

  return (
    <>
      <section className="dex-surface relative min-h-[calc(100vh-4.5rem)] overflow-hidden px-3 pb-24 pt-8 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="dex-orb dex-orb-left" />
          <div className="dex-orb dex-orb-right" />
          <div className="dex-grid absolute inset-0 opacity-30" />
        </div>

        <div className="relative mx-auto w-full max-w-[31rem]">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              {t.networkBadge}
            </span>
            <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-xl">
              {t.nonCustodial}
            </span>
          </div>

          <div className="relative rounded-[2rem] border border-black/[0.06] bg-white/90 p-2 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.42)] backdrop-blur-2xl">
            <div className="relative flex items-center justify-between px-3 pb-3 pt-2">
              <div className="flex items-center gap-1 rounded-full bg-slate-100/90 p-1">
                <button
                  id="swap"
                  type="button"
                  onClick={() => setTab("swap")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "swap"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.swapTab}
                </button>
                <button
                  id="liquidity"
                  type="button"
                  onClick={() => setTab("liquidity")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "liquidity"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.liquidityTab}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen((current) => !current)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  settingsOpen
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-label={t.settings}
                aria-expanded={settingsOpen}
              >
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden>
                  <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m19.2 13.1 1.4 1.1-1.8 3.1-1.7-.7c-.5.4-1 .7-1.6.9l-.2 1.8h-3.6l-.2-1.8a7 7 0 0 1-1.6-.9l-1.7.7-1.8-3.1 1.4-1.1a7 7 0 0 1 0-2.2L5.8 9.8l1.8-3.1 1.7.7c.5-.4 1-.7 1.6-.9l.2-1.8h3.6l.2 1.8c.6.2 1.1.5 1.6.9l1.7-.7L20 9.8l-1.4 1.1a7 7 0 0 1 0 2.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {settingsOpen ? (
                <div className="absolute right-2 top-14 z-30 w-[18rem] rounded-[1.35rem] border border-black/[0.07] bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-950">{t.transactionSettings}</h2>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {t.settingsApplied}
                    </span>
                  </div>
                  <label htmlFor="bbbfiswap-slippage" className="mt-4 block text-xs font-medium text-slate-500">
                    {t.slippage}
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {["0.5", "1", "3"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSlippage(preset)}
                        className={`rounded-xl px-2 py-2 text-xs font-bold transition ${
                          slippage === preset
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                    <div className={`flex items-center rounded-xl border px-2 ${slippageValid ? "border-slate-200" : "border-red-300"}`}>
                      <input
                        id="bbbfiswap-slippage"
                        type="number"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={slippage}
                        onChange={(event) => setSlippage(event.target.value)}
                        className="min-w-0 w-full bg-transparent text-right text-xs font-bold outline-none"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                  <p className={`mt-2 text-xs ${slippageValid ? "text-slate-400" : "text-red-600"}`}>
                    {slippageValid ? t.slippageHelper : t.slippageRange}
                  </p>
                </div>
              ) : null}
            </div>

            {activeTab === "swap" ? (
              <div>
                <AssetField
                  label={t.youPay}
                  symbol={swapInputSymbol}
                  address={direction === "sell" ? tokenAddress : undefined}
                  value={swapAmount}
                  onChange={(event) => {
                    const next = normalizeAmountInput(event.target.value);
                    if (next != null) setSwapAmount(next);
                  }}
                  balance={swapInputBalanceLabel}
                  onMax={address ? setSwapMax : undefined}
                  native={direction === "buy"}
                  onSelectToken={direction === "sell" ? () => setTokenSelectorOpen(true) : undefined}
                  selectLabel={t.selectToken}
                  hasError={Boolean(address && swapAmountWei > swapBalance && swapAmountWei > 0n)}
                />

                <div className="relative z-10 -my-2.5 flex justify-center">
                  <button
                    type="button"
                    onClick={toggleDirection}
                    aria-label={t.reversePair}
                    className="group flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white bg-slate-100 text-slate-700 shadow-sm transition hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden className="transition duration-300 group-hover:rotate-180">
                      <path d="M12 5v14m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <AssetField
                  label={t.youReceive}
                  symbol={swapOutputSymbol}
                  address={direction === "buy" ? tokenAddress : undefined}
                  value={
                    quoteOut > 0n && swapOutputDecimals != null
                      ? formatAmount(quoteOut, swapOutputDecimals, 8)
                      : ""
                  }
                  onChange={() => {}}
                  readOnly
                  balance={swapOutputBalanceLabel}
                  native={direction === "sell"}
                  onSelectToken={direction === "buy" ? () => setTokenSelectorOpen(true) : undefined}
                  selectLabel={t.selectToken}
                />

                <div className={`mx-2 mt-3 flex items-start gap-2 text-xs leading-relaxed ${tokenInvalid ? "text-red-600" : "text-slate-500"}`}>
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${tokenInvalid ? "bg-red-500" : tokenReady ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className="min-w-0 flex-1 truncate">{tokenStatus}</span>
                </div>

                <div className="mx-2 mt-2 rounded-2xl border border-slate-100 bg-white/80">
                  <button
                    type="button"
                    onClick={() => setQuoteDetailsOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs transition hover:bg-slate-50"
                    aria-expanded={quoteDetailsOpen}
                  >
                    <span className="min-w-0 truncate font-semibold text-slate-700">{swapRateLabel}</span>
                    <span className={`shrink-0 text-slate-400 transition ${quoteDetailsOpen ? "rotate-180" : ""}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>
                  {quoteDetailsOpen ? (
                    <dl className="space-y-2 border-t border-slate-100 px-3 py-3 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">{t.minimumReceived}</dt>
                        <dd className="text-right font-semibold tabular-nums text-slate-800">
                          {minimumOut > 0n && swapOutputDecimals != null
                            ? `${formatAmount(minimumOut, swapOutputDecimals, 8)} ${swapOutputSymbol}`
                            : "—"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">{t.priceImpact}</dt>
                        <dd className={`font-semibold ${priceImpactBps > 500 ? "text-red-600" : "text-slate-800"}`}>
                          {quoteOut > 0n ? `${(priceImpactBps / 100).toFixed(2)}%` : "—"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">{t.fee}</dt>
                        <dd className="font-semibold text-slate-800">0.30%</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">{t.route}</dt>
                        <dd className="font-semibold text-slate-800">{swapInputSymbol} → {swapOutputSymbol}</dd>
                      </div>
                    </dl>
                  ) : null}
                </div>

                <p className="mx-3 mt-3 min-h-5 text-center text-xs text-slate-500">{swapHint}</p>

                <div className="mt-2">
                  {swapNeedsApproval ? (
                    <WriteButton
                      data={approveSwapData}
                      disabled={!tokenReady || swapAmountWei <= 0n || swapAmountWei > tokenBalance}
                      buttonName={t.approve.replace("{symbol}", tokenSymbol)}
                      className="btn h-14 w-full rounded-[1.35rem] border-none bg-emerald-600 text-base font-semibold text-white shadow-none hover:bg-emerald-700"
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
                      className="btn h-14 w-full rounded-[1.35rem] border-none bg-emerald-500 text-base font-semibold text-white shadow-none transition hover:bg-emerald-600 disabled:bg-emerald-100"
                      callback={handleSwapSuccess}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="mx-1 mb-2 rounded-[1.2rem] border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs leading-relaxed text-emerald-900">
                  <span className="font-semibold">{tokenSymbol}/XDC · </span>
                  {hasLiquidity ? t.poolRatioHint : t.firstLiquidityHint}
                </div>

                <AssetField
                  label={t.tokenAmount}
                  symbol={tokenSymbol}
                  address={tokenAddress}
                  value={liquidityTokenAmount}
                  onChange={handleLiquidityTokenChange}
                  balance={tokenBalanceLabel}
                  onMax={address ? setMaxLiquidityToken : undefined}
                  onSelectToken={() => setTokenSelectorOpen(true)}
                  selectLabel={t.selectToken}
                  hasError={Boolean(address && liquidityTokenWei > tokenBalance && liquidityTokenWei > 0n)}
                />
                <div className="relative z-10 -my-2 flex justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-4 border-white bg-slate-100 text-lg font-medium text-slate-500">+</div>
                </div>
                <AssetField
                  label={t.xdcAmount}
                  symbol="XDC"
                  value={liquidityXdcAmount}
                  onChange={handleLiquidityXdcChange}
                  balance={xdcBalanceLabel}
                  onMax={address ? setMaxLiquidityXdc : undefined}
                  native
                  hasError={Boolean(address && liquidityXdcWei > xdcBalance && liquidityXdcWei > 0n)}
                />

                <dl className="mx-2 mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">{t.poolStatus}</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      {hasLiquidity ? t.activePool : pairAddress ? t.emptyPoolShort : t.newPool}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">{t.pair}</dt>
                    <dd className="mt-1 truncate font-semibold text-slate-900">{tokenSymbol}/XDC</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">{t.tokenReserve}</dt>
                    <dd className="mt-1 truncate font-semibold tabular-nums text-slate-900">
                      {hasLiquidity && tokenDecimals != null
                        ? `${formatAmount(tokenReserve, tokenDecimals)} ${tokenSymbol}`
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">{t.xdcReserve}</dt>
                    <dd className="mt-1 truncate font-semibold tabular-nums text-slate-900">
                      {hasLiquidity ? `${formatAmount(xdcReserve, 18)} XDC` : "—"}
                    </dd>
                  </div>
                </dl>

                {(liquidityTokenMin > 0n || liquidityXdcMin > 0n) ? (
                  <div className="mx-2 mt-2 rounded-2xl border border-slate-100 px-3 py-2.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between gap-3 py-1">
                      <span>{t.minimumToken}</span>
                      <span className="font-semibold tabular-nums text-slate-800">
                        {liquidityTokenMin > 0n
                          ? `${formatAmount(liquidityTokenMin, tokenDecimals ?? 18)} ${tokenSymbol}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-1">
                      <span>{t.minimumXdc}</span>
                      <span className="font-semibold tabular-nums text-slate-800">
                        {liquidityXdcMin > 0n
                          ? `${formatAmount(liquidityXdcMin, 18)} XDC`
                          : "—"}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3">
                  {liquidityNeedsApproval ? (
                    <WriteButton
                      data={approveLiquidityData}
                      disabled={!tokenReady || liquidityTokenWei <= 0n || liquidityTokenWei > tokenBalance}
                      buttonName={t.approve.replace("{symbol}", tokenSymbol)}
                      className="btn h-14 w-full rounded-[1.35rem] border-none bg-emerald-600 text-base font-semibold text-white shadow-none hover:bg-emerald-700"
                      callback={refetchToken}
                    />
                  ) : (
                    <WriteButton
                      data={liquidityData}
                      disabled={liquidityDisabled}
                      buttonName={chainId !== xdc.id ? t.switchToXdc : t.addLiquidity}
                      className="btn h-14 w-full rounded-[1.35rem] border-none bg-emerald-500 text-base font-semibold text-white shadow-none transition hover:bg-emerald-600"
                      callback={handleLiquiditySuccess}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-3 pb-2 pt-4 text-[11px] text-slate-400">
              <span>{t.poweredBy}</span>
              <a
                href={`https://xdcscan.com/address/${BBBFISWAP_ROUTER_ADDRESS}#code`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-500 transition hover:text-emerald-700"
              >
                Router {shortenAddress(BBBFISWAP_ROUTER_ADDRESS)} ↗
              </a>
              {pairAddress ? (
                <a
                  href={`https://xdcscan.com/address/${pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-500 transition hover:text-emerald-700"
                >
                  {t.viewPair} ↗
                </a>
              ) : null}
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-md text-center text-[11px] leading-relaxed text-slate-500">
            {t.riskNote}
          </p>
        </div>
      </section>

      <TokenSelectorModal
        open={tokenSelectorOpen}
        onClose={closeTokenSelector}
        onSelect={selectToken}
        currentAddress={tokenAddress}
        t={t}
      />
    </>
  );
}
