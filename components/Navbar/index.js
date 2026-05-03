import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAccount } from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";
import { useLanguage } from "../Context/LanguageContext";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { MORE_NAV_META } from "@/lib/navMore";
import { isMoreNavRouteActive, isMoreNavItemActive } from "@/lib/navActive";
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

  const { locale, setLocale } = useLanguage();
  const t = useTranslation();
  const openConnect = useConnectWallet();
  const { openAccountModal } = useAccountModal();

  const walletLabel = useMemo(() => {
    if (!address) return null;
    return shortenAddress(address);
  }, [address]);

  const stakeActive = router.pathname === "/stake";
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
                  className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    router.push("/");
                  }}
                />

                <div className="ml-1 sm:ml-2 hidden md:flex items-center pt-1 space-x-1 sm:space-x-2">
                  <Link
                    href={"/stake"}
                    className={
                      "btn btn-ghost transition-all duration-300 rounded-xl " +
                      (stakeActive
                        ? "text-green-700 bg-green-50 font-semibold"
                        : "hover:text-green-600 hover:bg-green-50")
                    }
                    aria-current={stakeActive ? "page" : undefined}
                  >
                    {t.nav.stake}
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
              </div>
              <div className="navbar-center hidden xl:flex"></div>
              <div className="navbar-end">
                <div className="flex items-center justify-end gap-2 shrink-0">
                  {!isConnected ? (
                    <button
                      type="button"
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl"
                      onClick={openConnect}
                      aria-label={t.nav.connect}
                    >
                      {t.nav.connect}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 font-mono text-xs max-w-[11rem] truncate px-3"
                      onClick={() => openAccountModal?.()}
                      aria-label={t.nav.walletAccount}
                    >
                      {walletLabel}
                    </button>
                  )}

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
