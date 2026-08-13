import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";
import { useLanguage } from "../Context/LanguageContext";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { bsc, xdc } from "@/config/chains";
import { useTranslation } from "@/lib/i18n/useTranslation";

function shortenAddress(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const Navbar = () => {
  const router = useRouter();

  const [mount, setMount] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const isSupportedChain = chainId === xdc.id || chainId === bsc.id;
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const { locale, setLocale } = useLanguage();
  const t = useTranslation();
  const openConnect = useConnectWallet();
  const { openAccountModal } = useAccountModal();

  const walletLabel = useMemo(() => {
    if (!address) return null;
    return shortenAddress(address);
  }, [address]);
  const homeTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const dexHomeActive = router.pathname === "/" && homeTab !== "liquidity";
  const liquidityHomeActive = router.pathname === "/" && homeTab === "liquidity";
  const stakeActive = router.pathname === "/stake";

  useEffect(() => {
    setMount(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.lang;
    const q = Array.isArray(raw) ? raw[0] : raw;
    if (q === "zh" || q === "zh-CN" || q === "cn") setLocale("zh");
    else if (q === "en") setLocale("en");
  }, [router.isReady, router.query.lang, setLocale]);

  const handleChainChange = useCallback(
    (event) => {
      const nextChainId = Number(event.target.value);
      if (!nextChainId || nextChainId === chainId) return;
      switchChain?.({ chainId: nextChainId });
    },
    [chainId, switchChain]
  );

  return (
    mount && (
      <header className="sticky top-0 z-[100] w-full border-b border-black/[0.05] bg-white/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex min-h-18 w-full max-w-content items-center gap-3 px-3 sm:px-5">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-xl transition hover:opacity-80 focus-visible:outline-offset-4"
            aria-label="BBBFiSwap home"
          >
            <Image
              src="/logo.png"
              height={150}
              width={150}
              alt="BBBFi"
              priority
              className="h-auto w-[92px] sm:w-[136px]"
            />
          </Link>

          {!isBscChain ? (
            <nav
              className="hidden items-center gap-1 rounded-full bg-slate-100/90 p-1 md:flex"
              aria-label="Primary navigation"
            >
              <Link
                href="/?tab=swap"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  dexHomeActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                aria-current={dexHomeActive ? "page" : undefined}
              >
                {t.nav.dex}
              </Link>
              <Link
                href="/?tab=liquidity"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  liquidityHomeActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                aria-current={liquidityHomeActive ? "page" : undefined}
              >
                {t.nav.liquidity}
              </Link>
              <Link
                href="/stake"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  stakeActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                aria-current={stakeActive ? "page" : undefined}
              >
                {t.nav.stake}
              </Link>
            </nav>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <div className="flex h-10 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-2 text-xs font-semibold text-slate-700 shadow-sm sm:gap-2 sm:px-3">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isBscChain
                    ? "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.14)]"
                    : chainId === xdc.id
                      ? "bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.12)]"
                      : "bg-slate-300"
                }`}
                aria-hidden
              />
              <select
                value={isSupportedChain ? chainId : ""}
                onChange={handleChainChange}
                disabled={isSwitchingChain}
                className="max-w-[3.9rem] cursor-pointer bg-transparent text-xs font-bold text-slate-700 outline-none disabled:cursor-wait disabled:opacity-60 sm:max-w-none"
                aria-label={t.nav.switchChain}
                aria-busy={isSwitchingChain}
              >
                {!isSupportedChain ? <option value="">—</option> : null}
                <option value={xdc.id}>XDC</option>
                <option value={bsc.id}>BSC</option>
              </select>
            </div>

            {!isConnected ? (
              <button
                type="button"
                className="h-10 rounded-full bg-emerald-500 px-3 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98] sm:px-5"
                onClick={openConnect}
                aria-label={t.nav.connect}
              >
                {t.nav.connect}
              </button>
            ) : (
              <button
                type="button"
                className="h-10 max-w-[8rem] truncate rounded-full border border-emerald-200 bg-emerald-50 px-3 font-mono text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:max-w-[11rem] sm:px-4"
                onClick={() => openAccountModal?.()}
                aria-label={t.nav.walletAccount}
              >
                {walletLabel}
              </button>
            )}

            <button
              type="button"
              className="h-10 rounded-full px-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3"
              onClick={() => setLocale(locale === "en" ? "zh" : "en")}
              aria-label={locale === "en" ? "切换到中文" : "Switch to English"}
            >
              {locale === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </header>
    )
  );
};

export default Navbar;
