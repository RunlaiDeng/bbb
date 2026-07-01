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
import { bscBbbPancakeSwapLink, bscBbbTokenAddress } from "@/config";

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
    <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div className="mt-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
          BSC
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-900/5">
          <div className="flex flex-col items-center px-6 pb-6 pt-8">
            <Image
              src="/bbb.jpg"
              alt={t.bscHome.imageAlt}
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
            />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">{t.bscHome.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.bscHome.tokenName}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t.bscHome.description}</p>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t.bscHome.contractAddressLabel}
            </div>
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
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                title={copyHint}
              >
                {copyHint === t.bscHome.addressCopied ? "✓" : "⎘"}
              </button>
            </div>
            <a
              href={`https://bscscan.com/token/${bscBbbTokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-gray-400 hover:text-emerald-700"
            >
              {t.bscHome.viewOnBscscan}
            </a>
          </div>

          <div className="border-t border-emerald-100 bg-emerald-50/70 px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t.bscHome.balanceLabel}
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{balanceText}</div>
          </div>
        </div>

        <a
          href={bscBbbPancakeSwapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex w-full max-w-md items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-700"
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
