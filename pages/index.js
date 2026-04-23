import useConnectWallet from "@/components/Hook/useConnectWallet";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { liquidityStakingComingSoon as liquidityStakingDefault } from "@/config";
import { HOME_LANG_QUERY } from "@/lib/i18n/homeLocale";
import { getSiteStrings } from "@/lib/i18n/siteStrings";
import { useLanguage } from "@/components/Context/LanguageContext";

const XDCLiquidStakingCard = dynamic(() => import("@/components/XDCLiquidStakingCard"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-emerald-100 bg-white mb-6 animate-pulse min-h-[280px] shadow-md" />
  ),
});

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

const LiquidityStakingComingSoon = memo(({ strings: t }) => (
  <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-lg shadow-emerald-900/5">
    <div className="relative z-10 p-8 sm:p-10">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="flex-shrink-0 relative">
          <Image
            src="/xdc.png"
            alt="XDC"
            width={72}
            height={72}
            className="rounded-2xl shadow-lg ring-2 ring-emerald-200/80 relative z-10"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-gray-900 text-xl sm:text-2xl tracking-tight mb-2">{t.comingSoonTitle}</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-5 max-w-md leading-relaxed">{t.comingSoonBody}</p>
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-sm tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {t.comingSoonBadge}
          </span>
        </div>
      </div>
    </div>
  </div>
));
LiquidityStakingComingSoon.displayName = "LiquidityStakingComingSoon";

const StakingHero = memo(({ strings: t, riskOpen, onRiskToggle }) => (
  <header className="text-center mb-4 sm:mb-5">
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">{t.heroTitle}</h1>
    <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-snug">{t.heroSubtitle}</p>
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
StakingHero.displayName = "StakingHero";

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

  const [liquidityStakingComingSoon, setLiquidityStakingComingSoon] = useState(liquidityStakingDefault);
  const [heroRiskOpen, setHeroRiskOpen] = useState(false);

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

  const t = useMemo(() => getSiteStrings(locale), [locale]);

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
      <div className="relative min-h-screen px-3 pb-8 pt-20 sm:px-4 sm:pt-24">
        <div className="mx-auto w-full max-w-md sm:max-w-xl">
          <div id="stake" className="scroll-mt-20 sm:scroll-mt-24">
            <StakingHero
              strings={t}
              riskOpen={heroRiskOpen}
              onRiskToggle={() => setHeroRiskOpen((v) => !v)}
            />
            {liquidityStakingComingSoon ? (
              <LiquidityStakingComingSoon strings={t} />
            ) : (
              <XDCLiquidStakingCard strings={t} onConnect={handleTryNow} />
            )}
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
