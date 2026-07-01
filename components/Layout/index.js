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

function formatTokenAmount(value, decimals = 18, fractionDigits = 4) {
  if (value == null) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function shortenAddress(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const BscHome = ({ t }) => {
  const { address } = useAccount();
  const [copyHint, setCopyHint] = useState(t.bscHome.copyAddress);

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

  const balanceText = !address
    ? t.bscHome.connectToViewBalance
    : isLoadingBalance
      ? t.bscHome.loadingBalance
      : balanceError
        ? t.bscHome.balanceUnavailable
        : `${formatTokenAmount(bbbBalance?.value, bbbBalance?.decimals ?? 18, 4)} BBB`;

  const handleCopyAddress = () => {
    copy(bscBbbTokenAddress);
    setCopyHint(t.bscHome.addressCopied);
    setTimeout(() => setCopyHint(t.bscHome.copyAddress), 1500);
  };

  return (
    <section className="min-h-[calc(100vh-4.5rem)] bg-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/favicon.ico"
          alt={t.bscHome.imageAlt}
          width={80}
          height={80}
          priority
          className="h-20 w-20 object-contain"
        />

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">{t.bscHome.title}</h1>

        <div className="mt-8 w-full space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {t.bscHome.contractAddressLabel}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <a
                href={`https://bscscan.com/token/${bscBbbTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
                title={bscBbbTokenAddress}
              >
                {shortenAddress(bscBbbTokenAddress)}
              </a>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-gray-400 transition hover:text-gray-600"
                title={copyHint}
                aria-label={copyHint}
              >
                {copyHint === t.bscHome.addressCopied ? "✓" : "⎘"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {t.bscHome.balanceLabel}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-gray-900">{balanceText}</p>
          </div>
        </div>

        <div className="mt-8 w-full">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {t.bscHome.chartLabel}
          </p>
          <div className="mt-2 h-[320px] w-full overflow-hidden sm:h-[360px]">
            <TokenChartPool poolAddress={bscBbbPoolAddress} network="bsc" plain />
          </div>
        </div>

        <a
          href={bscBbbPancakeSwapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-700"
        >
          {t.bscHome.buyBbb}
        </a>
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
