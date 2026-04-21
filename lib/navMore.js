/** Shared desktop “More” menu + mobile “More” sheet (Bridge/Markets/IDO/USDB + extras). */
export const JUMPER_BRIDGE_URL =
  "https://jumper.exchange/zh?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toChain=50&toToken=0x0000000000000000000000000000000000000000";

/** Routes only; labels come from `navMore` in `lib/i18n/siteStrings` via useTranslation(). */
export const MORE_NAV_META = [
  { key: "bridge", href: JUMPER_BRIDGE_URL, external: true },
  {
    key: "markets",
    href: "/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
    external: false,
  },
  { key: "ido", href: "/ido", external: false },
  { key: "usdb", href: "/usdb", external: false },
  { key: "merch", href: "/merch", external: false },
  { key: "mbbb", href: "/mbbb", external: false },
  { key: "farm", href: "/farm", external: false },
  { key: "bbbubu", href: "/bbbubu", external: false },
  { key: "bbbgame", href: "/bbbgame", external: false },
  { key: "airdrophub", href: "/airdrophub", external: false },
];

