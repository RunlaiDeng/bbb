import useConnectWallet from "@/components/Hook/useConnectWallet";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { liquidityStakingComingSoon as liquidityStakingDefault } from "@/config";
import { HOME_LANG_QUERY, getHomeStrings } from "@/lib/i18n/homeLocale";
import { useLanguage } from "@/components/Context/LanguageContext";

const XDCLiquidStakingCard = dynamic(() => import("@/components/XDCLiquidStakingCard"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 mb-6 animate-pulse min-h-[280px]" />
  ),
});

const WaveBackground = () => (
  <div className="wave-container fixed top-0 left-0 w-full h-full overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
    <svg
      className="waves absolute bottom-0 w-full opacity-40"
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
        <use href="#wave" x="50" y="3" fill="rgba(56, 189, 248, 0.06)" />
      </g>
      <g className="wave-parallax2">
        <use href="#wave" x="50" y="0" fill="rgba(34, 197, 94, 0.05)" />
      </g>
      <g className="wave-parallax3">
        <use href="#wave" x="50" y="9" fill="rgba(56, 189, 248, 0.04)" />
      </g>
    </svg>
  </div>
);

const LiquidityStakingComingSoon = memo(({ strings: t }) => (
  <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/50 backdrop-blur-md">
    <div className="relative z-10 p-8 sm:p-10">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="flex-shrink-0 relative">
          <Image
            src="/xdc.png"
            alt="XDC"
            width={72}
            height={72}
            className="rounded-2xl shadow-xl ring-2 ring-cyan-500/20 relative z-10"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-white text-xl sm:text-2xl tracking-tight mb-2">{t.comingSoonTitle}</h3>
          <p className="text-slate-400 text-sm sm:text-base mb-5 max-w-md leading-relaxed">{t.comingSoonBody}</p>
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-semibold text-sm tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {t.comingSoonBadge}
          </span>
        </div>
      </div>
    </div>
  </div>
));
LiquidityStakingComingSoon.displayName = "LiquidityStakingComingSoon";

const StakingHero = memo(({ strings: t }) => (
  <header className="text-center mb-8 sm:mb-10">
    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">{t.heroTitle}</h1>
    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">{t.heroSubtitle}</p>
    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed border-t border-slate-700/60 pt-5">
      {t.heroDisclaimer}
    </p>
  </header>
));
StakingHero.displayName = "StakingHero";

const HomeContent = memo(() => {
  const openConnect = useConnectWallet();
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

  const [liquidityStakingComingSoon, setLiquidityStakingComingSoon] = useState(liquidityStakingDefault);

  useEffect(() => {
    if (!router.isReady) return;
    const qsComing = router.query.ComingSoon;
    const comingSoon =
      qsComing === "false" ? false : qsComing === "true" ? true : liquidityStakingDefault;
    setLiquidityStakingComingSoon(comingSoon);
  }, [router.isReady, router.asPath, router.query.ComingSoon]);

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query[HOME_LANG_QUERY];
    const q = Array.isArray(raw) ? raw[0] : raw;
    if (q === "zh" || q === "zh-CN" || q === "cn") setLocale("zh");
    else if (q === "en") setLocale("en");
  }, [router.isReady, router.query, setLocale]);

  const t = getHomeStrings(locale);

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
      <div className="relative min-h-screen px-3 pb-8 pt-28 sm:px-4 sm:pt-32">
        <div className="mx-auto w-full max-w-lg">
          <div id="stake" className="scroll-mt-28">
            <StakingHero strings={t} />
            {liquidityStakingComingSoon ? (
              <LiquidityStakingComingSoon strings={t} />
            ) : (
              <XDCLiquidStakingCard strings={t} onConnect={handleTryNow} />
            )}
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
