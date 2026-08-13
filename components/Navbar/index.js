import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";
import { useLanguage } from "../Context/LanguageContext";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { MORE_NAV_META } from "@/lib/navMore";
import { isMoreNavRouteActive, isMoreNavItemActive } from "@/lib/navActive";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { bsc, xdc } from "@/config/chains";

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
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const { locale, setLocale } = useLanguage();
  const t = useTranslation();
  const openConnect = useConnectWallet();
  const { openAccountModal } = useAccountModal();

  const walletLabel = useMemo(() => {
    if (!address) return null;
    return shortenAddress(address);
  }, [address]);
  const currentChainLabel = isBscChain ? "BSC" : "XDC";
  const chainOptions = useMemo(
    () => [
      { id: xdc.id, label: "XDC" },
      { id: bsc.id, label: "BSC" },
    ],
    []
  );

  const homeTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const dexHomeActive = router.pathname === "/" && homeTab !== "liquidity";
  const liquidityHomeActive = router.pathname === "/" && homeTab === "liquidity";
  const moreSectionActive = isMoreNavRouteActive(router.pathname);

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

  const handleSelectChain = useCallback(
    (nextChainId) => {
      if (nextChainId === chainId) return;
      switchChain?.({ chainId: nextChainId });
    },
    [chainId, switchChain]
  );

  return (
    mount && (
      <>
        <div className="sticky top-0 z-50 w-full border-b border-emerald-100/80 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
          <div className="w-full min-h-18">
            <div className="navbar min-h-18 w-full max-w-content mx-auto items-center px-2 font-bold sm:px-4">
              <div className="navbar-start">
                <Image
                  src={"/logo.png"}
                  height={150}
                  width={150}
                  alt=""
                  className="h-auto w-[112px] cursor-pointer transform transition-all duration-300 hover:scale-105 sm:w-[150px]"
                  onClick={() => {
                    router.push("/");
                  }}
                />

                {(!isBscChain || router.pathname === "/") && (
                  <div className="ml-1 sm:ml-2 hidden md:flex items-center pt-1 space-x-1 sm:space-x-2">
                    <Link
                      href="/?tab=swap"
                      className={
                        "btn btn-ghost transition-all duration-300 rounded-xl " +
                        (dexHomeActive
                          ? "text-green-700 bg-green-50 font-semibold"
                          : "hover:text-green-600 hover:bg-green-50")
                      }
                      aria-current={dexHomeActive ? "page" : undefined}
                    >
                      {t.nav.dex}
                    </Link>
                    <Link
                      href="/?tab=liquidity"
                      className={
                        "btn btn-ghost transition-all duration-300 rounded-xl " +
                        (liquidityHomeActive
                          ? "text-green-700 bg-green-50 font-semibold"
                          : "hover:text-green-600 hover:bg-green-50")
                      }
                      aria-current={liquidityHomeActive ? "page" : undefined}
                    >
                      {t.nav.liquidity}
                    </Link>

                    <div className="dropdown dropdown-hover font-bold">
                      <div
                        tabIndex={0}
                        role="button"
                        className={
                          "btn btn-ghost transition-all duration-300 rounded-xl border-none hover:border-none focus:border-none active:border-none " +
                          (moreSectionActive
                            ? "text-green-700 bg-green-50 font-semibold"
                            : "hover:text-green-600 hover:bg-green-50")
                        }
                        aria-current={moreSectionActive ? "true" : undefined}
                      >
                        {t.nav.more}
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-white rounded-xl z-50 w-52 p-2 shadow-lg border border-green-100/50 max-h-[min(70vh,28rem)] overflow-y-auto"
                      >
                        {MORE_NAV_META.map((item) => (
                          <li key={item.key} className="rounded-lg">
                            {item.external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-600 hover:bg-green-50 rounded-lg"
                              >
                                {t.navMore[item.key]}
                              </a>
                            ) : (
                              <Link
                                href={item.href}
                                className={
                                  isMoreNavItemActive(router.pathname, item)
                                    ? "text-green-700 bg-green-50 font-semibold rounded-lg"
                                    : "hover:text-green-600 hover:bg-green-50 rounded-lg"
                                }
                                aria-current={
                                  isMoreNavItemActive(router.pathname, item)
                                    ? "page"
                                    : undefined
                                }
                              >
                                {t.navMore[item.key]}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <div className="navbar-center hidden xl:flex"></div>
              <div className="navbar-end">
                <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
                  {!isConnected ? (
                    <button
                      type="button"
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl px-2 sm:px-3"
                      onClick={openConnect}
                      aria-label={t.nav.connect}
                    >
                      {t.nav.connect}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-mono text-xs max-w-[7rem] truncate px-2 sm:max-w-[11rem] sm:px-3"
                      onClick={() => openAccountModal?.()}
                      aria-label={t.nav.walletAccount}
                    >
                      {walletLabel}
                    </button>
                  )}

                  <div className="dropdown dropdown-end">
                    <button
                      type="button"
                      tabIndex={0}
                      className="btn btn-sm rounded-xl border border-amber-200 bg-amber-50 px-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70 sm:px-3"
                      disabled={isSwitchingChain}
                      aria-label={t.nav.switchChain}
                      aria-haspopup="menu"
                      aria-busy={isSwitchingChain}
                    >
                      {isSwitchingChain ? (
                        <span className="loading loading-spinner loading-xs" aria-hidden />
                      ) : (
                        <>
                          <span>{currentChainLabel}</span>
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    <ul
                      tabIndex={0}
                      role="menu"
                      className="dropdown-content menu z-50 mt-2 w-28 rounded-xl border border-amber-100 bg-white p-2 text-sm font-bold shadow-lg"
                    >
                      {chainOptions.map((option) => {
                        const selected = option.id === chainId;
                        return (
                          <li key={option.id}>
                            <button
                              type="button"
                              role="menuitem"
                              className={
                                selected
                                  ? "rounded-lg bg-amber-50 text-amber-800"
                                  : "rounded-lg hover:bg-amber-50 hover:text-amber-800"
                              }
                              onClick={() => handleSelectChain(option.id)}
                              aria-current={selected ? "true" : undefined}
                            >
                              {option.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      className={`btn btn-ghost btn-xs rounded-lg ${locale === "en" ? "text-green-600 bg-green-50" : ""}`}
                      onClick={() => setLocale("en")}
                    >
                      EN
                    </button>
                    <span className="text-base-content/40">|</span>
                    <button
                      type="button"
                      className={`btn btn-ghost btn-xs rounded-lg ${locale === "zh" ? "text-green-600 bg-green-50" : ""}`}
                      onClick={() => setLocale("zh")}
                    >
                      中文
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default Navbar;
