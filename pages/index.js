import useConnectWallet from "@/components/Hook/useConnectWallet";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAccount, useReadContracts, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { HOME_LANG_QUERY } from "@/lib/i18n/homeLocale";
import { getSiteStrings } from "@/lib/i18n/siteStrings";
import { useLanguage } from "@/components/Context/LanguageContext";
import { bsc } from "@/config/chains";

const BBB_TOKEN_ADDRESS = "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1";
const BBB_IDO_CONTRACT_ADDRESS = "0x6dfda506A1B0513d941E7778c7B8F90e8Fa1C21D";

const BBB_IDO_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalParticipatedBBB",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

function formatTokenAmount(value, decimals = 18, fractionDigits = 4) {
  if (value == null) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function parseTokenInput(value, decimals = 18) {
  const trimmed = value.trim();
  if (!trimmed || !/^(0|[1-9]\d*)(\.\d*)?$/.test(trimmed)) return 0n;
  try {
    return parseUnits(trimmed, decimals);
  } catch {
    return 0n;
  }
}

function formatIdoDateRange(locale, startTime, endTime) {
  if (startTime == null || endTime == null) return null;
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const start = formatter.format(new Date(Number(startTime) * 1000));
  const end = formatter.format(new Date(Number(endTime) * 1000));
  return `${start} - ${end} (UTC+8)`;
}

function formatCountdown(locale, nowTs, targetTime) {
  if (!nowTs || targetTime == null) return null;
  const targetTs = Number(targetTime) * 1000;
  const remainingSeconds = Math.max(0, Math.floor((targetTs - nowTs) / 1000));
  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return locale === "zh"
    ? `${days}天 ${pad(hours)}时 ${pad(minutes)}分 ${pad(seconds)}秒`
    : `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function getIdoStatus(nowTs, startTime, endTime) {
  if (!nowTs || startTime == null || endTime == null) return "loading";
  const startTs = Number(startTime) * 1000;
  const endTs = Number(endTime) * 1000;
  if (nowTs < startTs) return "upcoming";
  if (nowTs <= endTs) return "live";
  return "ended";
}

const WaveBackground = () => (
  <div className="wave-container fixed top-0 left-0 w-full h-full overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-50/90 via-white to-green-50/80" />
    <svg
      className="waves absolute bottom-0 w-full opacity-50"
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
        <use href="#wave" x="50" y="3" fill="rgba(34, 197, 94, 0.12)" />
      </g>
      <g className="wave-parallax2">
        <use href="#wave" x="50" y="0" fill="rgba(16, 185, 129, 0.1)" />
      </g>
      <g className="wave-parallax3">
        <use href="#wave" x="50" y="9" fill="rgba(74, 222, 128, 0.08)" />
      </g>
    </svg>
  </div>
);

const IdoHero = memo(
  ({ strings: t, riskOpen, onRiskToggle, status, dateRange, startCountdown, endCountdown }) => (
  <header className="text-center mb-4 sm:mb-5">
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">{t.heroTitle}</h1>
    <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-snug">{t.heroSubtitle}</p>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        <span className={`h-2 w-2 rounded-full ${status === "live" ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
        {t.idoStatusLabels?.[status] || t.idoStatusLabels?.loading}
      </span>
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
        {dateRange || t.idoDateRangeLoading}
      </span>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm shadow-emerald-900/5">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {t.startCountdown}
        </div>
        <div className="mt-1 font-mono text-base font-bold text-gray-900">
          {startCountdown || t.loadingShort}
        </div>
      </div>
      <div className="rounded-xl border border-sky-100 bg-white/75 px-4 py-3 shadow-sm shadow-sky-900/5">
        <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          {t.endCountdown}
        </div>
        <div className="mt-1 font-mono text-base font-bold text-gray-900">
          {endCountdown || t.loadingShort}
        </div>
      </div>
    </div>
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={onRiskToggle}
        aria-expanded={riskOpen}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 rounded-lg px-2 py-1 -mx-2 hover:bg-emerald-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${riskOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {t.heroRiskToggle}
      </button>
    </div>
    {riskOpen && (
      <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed mt-2 text-left sm:text-center rounded-xl bg-emerald-50/60 border border-emerald-100/80 px-3 py-2.5">
        {t.heroDisclaimer}
      </p>
    )}
  </header>
));
IdoHero.displayName = "IdoHero";

const BenyBadBoyLogo = memo(({ className = "h-8 w-8 rounded-lg" }) => (
  <Image
    src="/bbb.jpg"
    alt="Beny Bad Boy BBB"
    width={32}
    height={32}
    className={`shrink-0 border border-white shadow-sm ${className}`}
  />
));
BenyBadBoyLogo.displayName = "BenyBadBoyLogo";

const BbbfiLogo = memo(({ className = "h-8 w-8 rounded-lg" }) => (
  <span
    className={`inline-block shrink-0 border border-white bg-white bg-contain bg-center bg-no-repeat shadow-sm ${className}`}
    style={{ backgroundImage: "url('/favicon.ico')" }}
    aria-label="BBBFI BBB"
    role="img"
  />
));
BbbfiLogo.displayName = "BbbfiLogo";

const HomeIdoCard = memo(
  ({
    strings: t,
    onConnect,
    status,
    totalParticipatedBBB,
    onParticipated,
    onSwitchToBsc,
    isSwitchingToBsc,
  }) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  const tokenReadContracts = useMemo(
    () => [
      { address: BBB_TOKEN_ADDRESS, abi: ERC20ABI, functionName: "decimals" },
      ...(address
        ? [
            {
              address: BBB_TOKEN_ADDRESS,
              abi: ERC20ABI,
              functionName: "balanceOf",
              args: [address],
            },
            {
              address: BBB_TOKEN_ADDRESS,
              abi: ERC20ABI,
              functionName: "allowance",
              args: [address, BBB_IDO_CONTRACT_ADDRESS],
            },
          ]
        : []),
    ],
    [address]
  );

  const { data: tokenReads, refetch } = useReadContracts({
    contracts: tokenReadContracts,
    query: { enabled: tokenReadContracts.length > 0 },
  });

  const decimals = Number(tokenReads?.[0]?.result ?? 18);
  const balance = address ? tokenReads?.[1]?.result ?? 0n : 0n;
  const allowance = address ? tokenReads?.[2]?.result ?? 0n : 0n;
  const amountWei = useMemo(() => parseTokenInput(amount, decimals), [amount, decimals]);
  const needsApproval = amountWei > 0n && allowance < amountWei;

  const setMaxAmount = useCallback(() => {
    setAmount(formatUnits(balance, decimals));
  }, [balance, decimals]);

  const handleAmountChange = useCallback((event) => {
    const next = event.target.value;
    if (next === "" || /^(0|[1-9]\d*)(\.\d*)?$/.test(next)) setAmount(next);
  }, []);

  const handleApproveSuccess = useCallback(() => {
    refetch?.();
  }, [refetch]);

  const handleBurnSuccess = useCallback(() => {
    setAmount("");
    refetch?.();
    onParticipated?.();
  }, [onParticipated, refetch]);

  let disabledReason = null;
  if (status === "loading") disabledReason = t.idoCheckingStatus;
  else if (status === "upcoming") disabledReason = t.idoNotStarted;
  else if (status === "ended") disabledReason = t.idoEnded;
  else if (!amount.trim()) disabledReason = t.enterBbbAmount;
  else if (amountWei <= 0n) disabledReason = t.invalidAmount;
  else if (amountWei > balance) disabledReason = t.exceedsBbbBalance;

  const actionDisabled = Boolean(disabledReason);
  const approveData =
    amountWei > 0n
      ? {
          address: BBB_TOKEN_ADDRESS,
          abi: ERC20ABI,
          functionName: "approve",
          args: [BBB_IDO_CONTRACT_ADDRESS, amountWei],
        }
      : null;
  const burnData =
    amountWei > 0n
      ? {
          address: BBB_IDO_CONTRACT_ADDRESS,
          abi: BBB_IDO_ABI,
          functionName: "burn",
          args: [amountWei],
        }
      : null;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-lg shadow-emerald-900/5">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-24 shrink-0 items-center justify-center">
            <Image
              src="/bbb.jpg"
              alt="Beny Bad Boy BBB"
              width={52}
              height={52}
              className="absolute left-0 rounded-xl border border-emerald-100 shadow-sm"
            />
            <div
              className="absolute right-0 h-[52px] w-[52px] rounded-xl border border-sky-100 bg-white bg-contain bg-center bg-no-repeat shadow-sm"
              style={{ backgroundImage: "url('/favicon.ico')" }}
              aria-label="BBBFI favicon"
              role="img"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{t.idoCardTitle}</h2>
            <p className="text-sm leading-relaxed text-gray-600">{t.idoCardSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.burnTokenLabel}</div>
            <div className="mt-2 flex items-center gap-2 font-bold text-gray-900">
              <BenyBadBoyLogo />
              <span>BBB</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">{t.xdcNetwork}</div>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">{t.receiveTokenLabel}</div>
            <div className="mt-2 flex items-center gap-2 font-bold text-gray-900">
              <BbbfiLogo />
              <span>BBB</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">{t.bscNetwork}</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{t.totalParticipatedLabel}</div>
            <div className="mt-2 flex items-center gap-2 font-bold text-gray-900">
              <BenyBadBoyLogo />
              <span>
                {totalParticipatedBBB == null ? t.loadingShort : formatTokenAmount(totalParticipatedBBB, decimals, 2)} BBB
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">{t.totalParticipatedHint}</div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          {t.idoDistributionNote}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-gray-800" htmlFor="bbb-ido-amount">
              {t.burnAmountLabel}
            </label>
            {address && (
              <span className="text-xs text-gray-500">
                {t.balance}: {formatTokenAmount(balance, decimals, 4)} BBB
              </span>
            )}
          </div>
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
            <input
              id="bbb-ido-amount"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder={t.bbbAmountPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-base font-semibold text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              disabled={!address || balance <= 0n}
              className="border-l border-gray-200 px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              {t.max}
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">{t.youWillReceive}</span>
              <span className="font-bold text-gray-900">
                {amountWei > 0n ? formatTokenAmount(amountWei, decimals, 4) : "0"} BBB
              </span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-gray-500">{t.oneToOneRule}</div>
          </div>
        </div>

        {status === "ended" && (
          <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800">
            {t.idoEndedSwitchHint}
          </p>
        )}

        {address && disabledReason && status !== "ended" && (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            {disabledReason}
          </p>
        )}

        {status === "ended" ? (
          <button
            type="button"
            className="btn w-full rounded-xl border-none bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onSwitchToBsc}
            disabled={isSwitchingToBsc}
            aria-busy={isSwitchingToBsc}
          >
            {isSwitchingToBsc ? (
              <>
                <span className="loading loading-spinner loading-sm" aria-hidden />
                {t.switchingToBsc}
              </>
            ) : address ? (
              t.switchToBsc
            ) : (
              t.connectAndSwitchToBsc
            )}
          </button>
        ) : !address ? (
          <button
            type="button"
            className="btn w-full rounded-xl border-none bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            onClick={onConnect}
          >
            {t.connectWallet}
          </button>
        ) : needsApproval ? (
          <WriteButton
            data={approveData}
            buttonName={t.approveBbb}
            className="btn w-full rounded-xl border-none bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            disabled={actionDisabled}
            callback={handleApproveSuccess}
          />
        ) : (
          <WriteButton
            data={burnData}
            buttonName={t.burnForIdo}
            className="btn w-full rounded-xl border-none bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            disabled={actionDisabled}
            callback={handleBurnSuccess}
          />
        )}

        <div className="space-y-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs leading-relaxed text-gray-500">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-gray-700">{t.burnContract}</span>
            <a
              href={`https://xdcscan.com/address/${BBB_IDO_CONTRACT_ADDRESS}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-emerald-700 hover:text-emerald-800"
            >
              {BBB_IDO_CONTRACT_ADDRESS.slice(0, 10)}...{BBB_IDO_CONTRACT_ADDRESS.slice(-8)}
            </a>
          </div>
          <div>{t.contractSourceNote}</div>
        </div>
      </div>
    </section>
  );
});
HomeIdoCard.displayName = "HomeIdoCard";

const HomeFaq = memo(({ strings: t }) => {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  const items = t.faq ?? [];
  if (!items.length) return null;

  return (
    <section
      className="relative w-full border-t border-emerald-100/80 bg-gradient-to-b from-white via-emerald-50/40 to-green-50/50 px-4 py-12 sm:py-16"
      aria-labelledby={`${baseId}-faq-heading`}
    >
      <div className="mx-auto w-full max-w-md sm:max-w-xl">
        <h2
          id={`${baseId}-faq-heading`}
          className="text-left text-lg font-bold tracking-tight text-gray-900 sm:text-xl mb-5 sm:mb-6"
        >
          {t.faqTitle}
        </h2>
        <ul className="list-none m-0 p-0 space-y-3 sm:space-y-4">
          {items.map((row, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-faq-panel-${index}`;
            const qId = `${baseId}-faq-q-${index}`;
            return (
              <li key={qId} className="m-0 p-0 list-none">
                <div
                  className="rounded-2xl border border-emerald-200/80 bg-white px-5 py-4 sm:px-6 sm:py-5 shadow-md shadow-emerald-900/5"
                  data-state={isOpen ? "open" : "closed"}
                >
                  <h3 className="m-0 p-0">
                    <button
                      type="button"
                      id={qId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
                      className="group flex w-full items-center justify-between gap-3 text-left text-base font-bold text-gray-900 sm:text-lg rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white -m-0.5 p-0.5 hover:text-emerald-800 transition-colors"
                    >
                      <span className="pr-2">{row.q}</span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 group-hover:text-emerald-700 ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={qId}
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p
                        className={`text-sm sm:text-base leading-relaxed text-gray-600 border-l-2 border-emerald-200/90 pl-3.5 -ml-0.5 ${
                          isOpen ? "mt-4" : "mt-0"
                        }`}
                      >
                        {row.a}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
});
HomeFaq.displayName = "HomeFaq";

const HomeContent = memo(() => {
  const openConnect = useConnectWallet();
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  const [heroRiskOpen, setHeroRiskOpen] = useState(false);
  const [nowTs, setNowTs] = useState(null);
  const { switchChain, isPending: isSwitchingToBsc } = useSwitchChain();

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query[HOME_LANG_QUERY];
    const q = Array.isArray(raw) ? raw[0] : raw;
    if (q === "zh" || q === "zh-CN" || q === "cn") setLocale("zh");
    else if (q === "en") setLocale("en");
  }, [router.isReady, router.query, setLocale]);

  useEffect(() => {
    setNowTs(Date.now());
    const timer = window.setInterval(() => setNowTs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const t = useMemo(() => getSiteStrings(locale), [locale]);
  const idoReadContracts = useMemo(
    () => [
      { address: BBB_IDO_CONTRACT_ADDRESS, abi: BBB_IDO_ABI, functionName: "startTime" },
      { address: BBB_IDO_CONTRACT_ADDRESS, abi: BBB_IDO_ABI, functionName: "endTime" },
      {
        address: BBB_IDO_CONTRACT_ADDRESS,
        abi: BBB_IDO_ABI,
        functionName: "totalParticipatedBBB",
      },
    ],
    []
  );
  const { data: idoReads, refetch: refetchIdoReads } = useReadContracts({
    contracts: idoReadContracts,
    query: {
      enabled: true,
      refetchInterval: 30_000,
    },
  });
  const idoStartTime = idoReads?.[0]?.result;
  const idoEndTime = idoReads?.[1]?.result;
  const totalParticipatedBBB = idoReads?.[2]?.result;
  const idoStatus = useMemo(
    () => getIdoStatus(nowTs, idoStartTime, idoEndTime),
    [idoEndTime, idoStartTime, nowTs]
  );
  const idoDateRange = useMemo(
    () => formatIdoDateRange(locale, idoStartTime, idoEndTime),
    [idoEndTime, idoStartTime, locale]
  );
  const startCountdown = useMemo(() => {
    if (!nowTs || idoStartTime == null) return null;
    if (Number(idoStartTime) * 1000 <= nowTs) return t.countdownStarted;
    return formatCountdown(locale, nowTs, idoStartTime);
  }, [idoStartTime, locale, nowTs, t.countdownStarted]);
  const endCountdown = useMemo(() => {
    if (!nowTs || idoEndTime == null) return null;
    if (Number(idoEndTime) * 1000 <= nowTs) return t.countdownEnded;
    return formatCountdown(locale, nowTs, idoEndTime);
  }, [idoEndTime, locale, nowTs, t.countdownEnded]);

  const { address } = useAccount();

  const handleTryNow = useCallback(async () => {
    try {
      if (!address) {
        await openConnect();
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [openConnect, router, address]);

  const handleSwitchToBsc = useCallback(() => {
    if (!address) {
      openConnect();
      return;
    }
    switchChain?.({ chainId: bsc.id });
  }, [address, openConnect, switchChain]);

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
          animation: move-forever1 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        }
        .wave-parallax2 use {
          animation: move-forever2 20s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        }
        .wave-parallax3 use {
          animation: move-forever3 15s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
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
      `}</style>
      <WaveBackground />
      <div className="relative min-h-screen px-3 pb-8 pt-20 sm:px-4 sm:pt-24">
        <div className="mx-auto w-full max-w-md sm:max-w-xl">
          <div id="ido" className="scroll-mt-20 sm:scroll-mt-24">
            <IdoHero
              strings={t}
              riskOpen={heroRiskOpen}
              status={idoStatus}
              dateRange={idoDateRange}
              startCountdown={startCountdown}
              endCountdown={endCountdown}
              onRiskToggle={() => setHeroRiskOpen((v) => !v)}
            />
            <HomeIdoCard
              strings={t}
              onConnect={handleTryNow}
              status={idoStatus}
              totalParticipatedBBB={totalParticipatedBBB}
              onParticipated={refetchIdoReads}
              onSwitchToBsc={handleSwitchToBsc}
              isSwitchingToBsc={isSwitchingToBsc}
            />
          </div>
        </div>
        <HomeFaq strings={t} />
      </div>
    </>
  );
});

HomeContent.displayName = "HomeContent";

const Home = memo(() => <HomeContent />);
Home.displayName = "Home";

export default Home;
