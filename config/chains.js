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
