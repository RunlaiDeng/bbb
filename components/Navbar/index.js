import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAccount } from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";
import { useLanguage } from "../Context/LanguageContext";
import { useAccountModal } from "@rainbow-me/rainbowkit";
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

                    <Link
                      href="/stake"
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
                </div>
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

                  <div
                    className="btn btn-sm cursor-default rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 hover:bg-amber-50"
                    aria-label={t.nav.network}
                  >
                    XDC
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
