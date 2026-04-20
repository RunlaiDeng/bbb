import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import TokenMarkets from "@/components/TokenMarkets";
import { getXDCPrice } from "@/components/Utils";
import { liquidityStakingComingSoon as liquidityStakingDefault } from "@/config";
import {
  HOME_LANG_QUERY,
  getHomeLocale,
  getHomeStrings,
} from "@/lib/i18n/homeLocale";

const XDCLiquidStakingCard = dynamic(() => import("@/components/XDCLiquidStakingCard"), {
  ssr: false,
  loading: () => (
    <div className="card bg-white/10 backdrop-blur-sm border border-green-200/50 rounded-xl mb-6 animate-pulse min-h-[200px]" />
  ),
});

const WaveBackground = () => (
  <div className="wave-container fixed top-0 left-0 w-full h-full overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-green-50/30" />
    <svg
      className="waves absolute bottom-0 w-full"
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
        <use href="#wave" x="50" y="3" fill="rgba(34, 197, 94, 0.03)" />
      </g>
      <g className="wave-parallax2">
        <use href="#wave" x="50" y="0" fill="rgba(34, 197, 94, 0.05)" />
      </g>
      <g className="wave-parallax3">
        <use href="#wave" x="50" y="9" fill="rgba(34, 197, 94, 0.07)" />
      </g>
    </svg>
  </div>
);

const HomeLanguageSwitcher = memo(({ locale, onChange }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-gray-500 hidden sm:inline">{onChange.label}</span>
    <div className="join border border-green-200/60 rounded-lg overflow-hidden bg-white/60">
      <button
        type="button"
        className={`join-item btn btn-xs btn-ghost ${locale === "en" ? "bg-green-100 font-semibold" : ""}`}
        onClick={() => onChange.setLang("en")}
      >
        {onChange.en}
      </button>
      <button
        type="button"
        className={`join-item btn btn-xs btn-ghost ${locale === "zh" ? "bg-green-100 font-semibold" : ""}`}
        onClick={() => onChange.setLang("zh")}
      >
        {onChange.zh}
      </button>
    </div>
  </div>
));
HomeLanguageSwitcher.displayName = "HomeLanguageSwitcher";

const LiquidityStakingComingSoon = memo(({ strings: t }) => (
  <div className="coming-soon-card relative mb-6 overflow-hidden rounded-2xl backdrop-blur-md">
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-emerald-50/40 to-green-50/30" />
    <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-br from-white/20 to-green-50/20" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_0%,rgba(34,197,94,0.12)_0%,transparent_60%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.25)_50%,transparent_65%)] coming-soon-shimmer" />
    <div className="relative z-10 p-8 sm:p-10 border border-green-200/30 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="coming-soon-icon-wrap flex-shrink-0 relative">
          <Image
            src="/xdc.png"
            alt="XDC"
            width={72}
            height={72}
            className="rounded-2xl shadow-xl ring-2 ring-white/50 relative z-10"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-green-900 text-xl sm:text-2xl tracking-tight mb-2">{t.comingSoonTitle}</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-5 max-w-md leading-relaxed">{t.comingSoonBody}</p>
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/15 border border-amber-400/40 text-amber-800 font-semibold text-sm tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {t.comingSoonBadge}
          </span>
        </div>
      </div>
    </div>
    <style jsx>{`
      .coming-soon-shimmer {
        animation: comingSoonShimmer 4s ease-in-out infinite;
      }
      @keyframes comingSoonShimmer {
        0%,
        100% {
          opacity: 0;
          transform: translateX(-20%);
        }
        50% {
          opacity: 1;
          transform: translateX(20%);
        }
      }
      .coming-soon-icon-wrap::before {
        content: "";
        position: absolute;
        inset: -12px;
        background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 65%);
        border-radius: 1.5rem;
        filter: blur(16px);
        z-index: -1;
      }
    `}</style>
  </div>
));
LiquidityStakingComingSoon.displayName = "LiquidityStakingComingSoon";

const FloatingCoins = () => (
  <div className="floating-coins absolute w-full h-full overflow-hidden pointer-events-none">
    <div className="coin coin1">
      <Image src="/xdc.png" alt="XDC" width={40} height={40} className="rounded-full" />
    </div>
    <div className="coin coin2">
      <Image src="/bbb.jpg" alt="BBB" width={40} height={40} className="rounded-full" />
    </div>
    <div className="coin coin3">
      <Image src="/logosm.png" alt="Coin" width={40} height={40} className="rounded-full" />
    </div>
  </div>
);

const HomeContent = memo(() => {
  const privyLogin = usePrivyLogin();
  const router = useRouter();

  /** Stable first paint (matches SSR) — avoids hydration mismatch from empty `router.query` */
  const [homeUi, setHomeUi] = useState(() => ({
    locale: "en",
    liquidityStakingComingSoon: liquidityStakingDefault,
  }));

  useEffect(() => {
    if (!router.isReady) return;
    const qsComing = router.query.ComingSoon;
    const comingSoon =
      qsComing === "false" ? false : qsComing === "true" ? true : liquidityStakingDefault;
    setHomeUi({
      locale: getHomeLocale(router),
      liquidityStakingComingSoon: comingSoon,
    });
  }, [router.isReady, router.asPath]);

  const { locale, liquidityStakingComingSoon } = homeUi;
  const t = getHomeStrings(locale);

  const setLang = useCallback(
    (lang) => {
      const next = { ...router.query, [HOME_LANG_QUERY]: lang === "zh" ? "zh" : "en" };
      router.push({ pathname: router.pathname, query: next }, undefined, { shallow: true });
    },
    [router]
  );

  const { address } = useAccount();

  const [price, setPrice] = useState({});

  const fetchData = useCallback(async () => {
    const xdc = await getXDCPrice();

    setPrice((prevPrice) => ({ ...prevPrice, xdc }));
  }, []);

  const xdcPrice = price?.xdc?.price;

  const xdcPriceChangeH24 = price?.xdc?.priceChange24h;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTryNow = useCallback(async () => {
    try {
      if (!address) {
        await privyLogin();
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [privyLogin, router, address]);

  const tMarkets = {
    showBar: false,
    searchBar: false,
    pageSize: 4,
    xdcPrice,
    xdcPriceChangeH24,
    showLogo: true,
    tableSize: "lg",
  };

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
        .floating-coins .coin {
          position: absolute;
          animation: float 6s infinite;
          opacity: 0.7;
        }
        .coin1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .coin2 {
          top: 40%;
          right: 10%;
          animation-delay: -2s;
        }
        .coin3 {
          top: 60%;
          left: 20%;
          animation-delay: -4s;
        }
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }
        .glow-effect {
          position: relative;
        }
        .glow-effect::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #22c55e, #15803d);
          border-radius: 0.5rem;
          z-index: -1;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-effect:hover::before {
          opacity: 1;
        }
      `}</style>
      <WaveBackground />
      <FloatingCoins />
      <div className="relative min-h-screen px-3 pb-8 pt-28 sm:px-4 sm:pt-32">
        <div className="mx-auto w-full max-w-content">
          <div className="flex justify-end mb-2">
            <HomeLanguageSwitcher
              locale={locale}
              onChange={{
                label: t.language,
                en: t.en,
                zh: t.zh,
                setLang,
              }}
            />
          </div>
          <div className="card border border-base-300/40 bg-white/80 shadow-card backdrop-blur-md">
            <div className="card-body gap-6 rounded-2xl p-4 sm:p-6 md:p-8">
              {liquidityStakingComingSoon ? (
                <LiquidityStakingComingSoon strings={t} />
              ) : (
                <XDCLiquidStakingCard strings={t} onConnect={handleTryNow} />
              )}
              <div className="mt-2 border-t border-base-300/30 pt-6">
                <div className="rounded-2xl border border-base-300/30 bg-white/60 p-3 shadow-inner backdrop-blur-sm sm:p-4">
                  <TokenMarkets {...tMarkets} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

HomeContent.displayName = "HomeContent";

const Home = memo(() => <HomeContent />);
Home.displayName = "Home";

export default Home;
