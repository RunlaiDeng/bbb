import Head from "next/head";
import Image from "next/image";
import Navbar from "../Navbar";
import MobileNav from "../MobileNav";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { bsc } from "@/config/chains";
import { useRouter } from "next/router";
import { formatUnits } from "viem";
import copy from "copy-to-clipboard";
import { bscBbbPancakeSwapLink, bscBbbPoolAddress, bscBbbTokenAddress } from "@/config";
import TokenChartPool from "../TokenChartPool";
import { getPrice } from "../Utils";

function formatBalanceAmount(value, decimals = 18, fractionDigits = 4) {
  const amount = Number(formatUnits(value ?? 0n, decimals));
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  });
}

function formatUsdApprox(value) {
  if (value == null || !Number.isFinite(value)) return null;
  if (value >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function shortenAddress(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const BscHome = ({ t }) => {
  const { address } = useAccount();
  const [copyHint, setCopyHint] = useState(t.bscHome.copyAddress);
  const [bbbPriceUsd, setBbbPriceUsd] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  const {
    data: bbbBalance,
    isLoading: isLoadingBalance,
    isError: balanceError,
  } = useBalance({
    address,
    token: bscBbbTokenAddress,
    chainId: bsc.id,
    query: { enabled: !!address },
  });

  useEffect(() => {
    let cancelled = false;

    const fetchPrice = async () => {
      setIsLoadingPrice(true);
      try {
        const { price } = await getPrice(bscBbbPoolAddress, "bsc");
        if (!cancelled) setBbbPriceUsd(Number(price) || 0);
      } catch (error) {
        console.error("Failed to load BBB price:", error);
        if (!cancelled) setBbbPriceUsd(null);
      } finally {
        if (!cancelled) setIsLoadingPrice(false);
      }
    };

    fetchPrice();
    const timer = setInterval(fetchPrice, 60_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const balanceUsd =
    address &&
    bbbBalance?.value != null &&
    bbbPriceUsd != null &&
    !balanceError
      ? Number(formatUnits(bbbBalance.value, bbbBalance.decimals ?? 18)) * bbbPriceUsd
      : null;

  const balanceText = !address
    ? t.bscHome.connectToViewBalance
    : isLoadingBalance
      ? t.bscHome.loadingBalance
      : balanceError
        ? t.bscHome.balanceUnavailable
        : `${formatBalanceAmount(bbbBalance?.value, bbbBalance?.decimals ?? 18, 4)} BBB`;

  const balanceUsdText =
    !address || balanceError
      ? null
      : isLoadingBalance || isLoadingPrice
        ? t.bscHome.loadingBalanceUsd
        : balanceUsd == null
          ? t.bscHome.balanceUsdUnavailable
          : t.bscHome.balanceUsdApprox.replace("{amount}", formatUsdApprox(balanceUsd));

  const handleCopyAddress = () => {
    copy(bscBbbTokenAddress);
    setCopyHint(t.bscHome.addressCopied);
    setTimeout(() => setCopyHint(t.bscHome.copyAddress), 1500);
  };

  return (
    <section className="relative h-[calc(100vh-4.5rem)] w-full overflow-hidden bg-white">
      <div className="absolute inset-0">
        <TokenChartPool
          poolAddress={bscBbbPoolAddress}
          network="bsc"
          plain
          resolution="15m"
          chartType="line"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl bg-white/92 px-4 py-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <Image
              src="/favicon.ico"
              alt={t.bscHome.imageAlt}
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1 text-left">
              <h1 className="text-lg font-bold tracking-tight text-gray-900">{t.bscHome.title}</h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <a
                  href={`https://bscscan.com/token/${bscBbbTokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-emerald-700 hover:text-emerald-900 hover:underline"
                  title={bscBbbTokenAddress}
                >
                  {shortenAddress(bscBbbTokenAddress)}
                </a>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="shrink-0 text-gray-400 transition hover:text-gray-600"
                  title={copyHint}
                  aria-label={copyHint}
                >
                  {copyHint === t.bscHome.addressCopied ? "✓" : "⎘"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 text-left">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {t.bscHome.balanceLabel}
              </p>
              <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-gray-900 sm:text-xl">
                {balanceText}
              </p>
              {balanceUsdText ? (
                <p className="mt-0.5 text-sm tabular-nums text-gray-500">{balanceUsdText}</p>
              ) : null}
            </div>
            <a
              href={bscBbbPancakeSwapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:min-w-[9rem]"
            >
              {t.bscHome.buyBbb}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Layout = ({ children }) => {
  const t = useTranslation();
  const router = useRouter();
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const { isReady, pathname, replace } = router;
  const siteOrigin = useMemo(() => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit.replace(/\/$/, "");
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "";
  }, []);
  const ogImage = siteOrigin ? `${siteOrigin}/bbb.jpg` : "";

  useEffect(() => {
    if (!isBscChain || !isReady || pathname === "/") return;
    replace("/");
  }, [isBscChain, isReady, pathname, replace]);

  return (
    <main className="min-h-screen">
      <Head>
        <title>{t.layout.defaultTitle}</title>
        <meta name="description" content={t.layout.defaultDescription} />
        <meta property="og:title" content={t.layout.defaultTitle} />
        <meta property="og:description" content={t.layout.defaultDescription} />
        <meta property="og:type" content="website" />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className={`min-h-screen ${isBscChain ? "bg-white" : "mobile-safe-bottom"}`}>
        <Navbar />
        {isBscChain ? <BscHome t={t} /> : children}
      </div>

      {!isBscChain && <MobileNav />}
    </main>
  );
};

export default Layout;
