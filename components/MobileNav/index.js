import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "@/lib/i18n/useTranslation";

const MobileNav = () => {
  const router = useRouter();
  const t = useTranslation();

  const homeTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const swapHomeActive = router.pathname === "/" && homeTab !== "liquidity";
  const liquidityHomeActive = router.pathname === "/" && homeTab === "liquidity";

  const stakeActive = router.pathname === "/stake";

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] border-t border-base-300/60 bg-base-100/95 pb-[env(safe-area-inset-bottom,0px)] shadow-shell backdrop-blur-md supports-[backdrop-filter]:bg-base-100/90">
        <div className="flex justify-around items-center h-16 px-2 py-1">
          <Link
            href="/?tab=swap"
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] ${
              swapHomeActive
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl ${
                swapHomeActive ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 1024 1024" width="22" height="22">
                <path
                  d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">{t.nav.dex}</span>
          </Link>

          <Link
            href="/?tab=liquidity"
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] ${
              liquidityHomeActive
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl ${
                liquidityHomeActive ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3s5 5.2 5 9a5 5 0 0 1-10 0c0-3.8 5-9 5-9Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.5 13.5a2.7 2.7 0 0 0 2.5 1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">{t.nav.liquidity}</span>
          </Link>

          <Link
            href="/stake"
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] border-0 bg-transparent ${
              stakeActive
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-current={stakeActive ? "page" : undefined}
          >
            <div
              className={`p-1.5 rounded-xl ${
                stakeActive ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M7 16l5 5 5-5" />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">{t.nav.stake}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
