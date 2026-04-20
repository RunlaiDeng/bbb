import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MORE_NAV_ITEMS } from "@/lib/navMore";

function isMoreSectionActive(router) {
  const p = router.pathname;
  if (p.startsWith("/swap")) return true;
  return ["/merch", "/mbbb", "/farm", "/bbbubu", "/bbbgame", "/airdrophub", "/ido", "/usdb"].includes(p);
}

const MobileNav = () => {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const onStake =
    router.pathname === "/" && (router.asPath.includes("#stake") || router.asPath.includes("/#stake"));

  const moreActive = useMemo(() => isMoreSectionActive(router), [router.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onRoute = () => setMoreOpen(false);
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [moreOpen, router.events]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 border-0 cursor-default"
            onClick={closeMore}
            aria-label="Close menu"
          />
          <div className="relative bg-base-100 rounded-t-2xl border-t border-base-300/60 shadow-2xl max-h-[min(78vh,520px)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/50">
              <span className="font-bold text-base">More</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closeMore}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <nav className="overflow-y-auto px-3 pb-[env(safe-area-inset-bottom,12px)] pt-2">
              <ul className="grid grid-cols-2 gap-2 pb-4">
                {MORE_NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-center min-h-[3rem] px-3 py-2 rounded-xl bg-base-200/80 hover:bg-green-50 text-sm font-medium text-base-content"
                        onClick={closeMore}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center justify-center text-center min-h-[3rem] px-3 py-2 rounded-xl bg-base-200/80 hover:bg-green-50 text-sm font-medium text-base-content"
                        onClick={closeMore}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] border-t border-base-300/60 bg-base-100/95 pb-[env(safe-area-inset-bottom,0px)] shadow-shell backdrop-blur-md supports-[backdrop-filter]:bg-base-100/90">
        <div className="flex justify-around items-center h-16 px-2 py-1">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] ${
              router.pathname === "/" && !onStake
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl ${
                router.pathname === "/" && !onStake ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 1024 1024" width="22" height="22">
                <path
                  d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">Home</span>
          </Link>

          <Link
            href="/#stake"
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] ${
              onStake || router.pathname === "/stake"
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl ${
                onStake || router.pathname === "/stake" ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3 3H21V21H3V3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">Stake</span>
          </Link>

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 flex-1 max-w-[5.5rem] border-0 bg-transparent ${
              moreOpen || moreActive
                ? "text-green-600 font-semibold bg-green-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <div
              className={`p-1.5 rounded-xl ${
                moreOpen || moreActive ? "bg-green-100" : "bg-transparent"
              }`}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="19" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="19" cy="18" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="text-[11px] mt-0.5 font-medium leading-tight">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
