/** Shared desktop “More” menu + mobile “More” sheet (Bridge/Markets/IDO/USDB + extras). */
export const JUMPER_BRIDGE_URL =
  "https://jumper.exchange/zh?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toChain=50&toToken=0x0000000000000000000000000000000000000000";

export const MORE_NAV_ITEMS = [
  { key: "bridge", label: "Bridge", href: JUMPER_BRIDGE_URL, external: true },
  {
    key: "markets",
    label: "Markets",
    href: "/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
    external: false,
  },
  { key: "ido", label: "IDO", href: "/ido", external: false },
  { key: "usdb", label: "USDB", href: "/usdb", external: false },
  { key: "merch", label: "Merch", href: "/merch", external: false },
  { key: "mbbb", label: "mBBB", href: "/mbbb", external: false },
  { key: "farm", label: "Farm", href: "/farm", external: false },
  { key: "bbbubu", label: "BBBubu", href: "/bbbubu", external: false },
  { key: "bbbgame", label: "🎮 BBBGame", href: "/bbbgame", external: false },
  { key: "airdrophub", label: "Airdrop Hub", href: "/airdrophub", external: false },
];
