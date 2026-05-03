import { MORE_NAV_META } from "@/lib/navMore";

/** True when pathname matches a "More" menu internal route (for desktop highlight). */
export function isMoreNavRouteActive(pathname) {
  if (!pathname) return false;
  if (pathname.startsWith("/swap")) return true;
  const internalHrefs = MORE_NAV_META.filter((i) => !i.external).map((i) => i.href);
  return internalHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`)
  );
}

/** Highlight for a single "More" dropdown item (handles /swap/[token] vs default markets href). */
export function isMoreNavItemActive(pathname, item) {
  if (!pathname || !item?.href || item.external) return false;
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  if (item.key === "markets" && pathname.startsWith("/swap")) return true;
  return false;
}
