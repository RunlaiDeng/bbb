export const xdc = {
  id: 50,
  name: "XinFin Network",
  nativeCurrency: {
    decimals: 18,
    name: "XDC",
    symbol: "XDC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/xdc"] },
  },
  blockExplorers: {
    default: {
      name: "xdcscan",
      url: "https://xdcscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF",
      blockCreated: 75884020,
    },
  },
};

export const bsc = {
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BNB",
    symbol: "BNB",
  },
  rpcUrls: {
    default: { http: ["https://bsc-dataseed.binance.org"] },
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://bscscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 15921452,
    },
  },
};

export const xdcParentNet = {
  id: 551,
  name: "XDC Devnet",
  network: "XDC Devnet",
  nativeCurrency: {
    decimals: 18,
    name: "XDC",
    symbol: "XDC",
  },
  rpcUrls: {
    default: { http: ["https://devnetstats.apothem.network/devnet"] },
  },
  iconUrl: "/bbb.jpg",
};
