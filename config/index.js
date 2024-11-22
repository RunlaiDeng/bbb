import ERC20ABI from "../abi/ERC20ABI.json";
import BBBFarmerABI from "../abi/BBBFarmerABI.json";
import ReferralProgramABI from "../abi/ReferralProgramABI.json";
import mBBBABI from "../abi/mBBBABI.json";
import mBBBV2ABI from "../abi/mBBBV2ABI.json";
import BBBPumpReferralABI from "../abi/BBBPumpReferralABI.json";
import PoolABI from "../abi/PoolABI.json";

// export const dexLink =
//   "https://icecreamswap.com/swap?chain=xdc&outputCurrency=0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1&inputCurrency=XDC";
export const dexLink = "/swap/bbb";
// export const dexLink =
//   "https://app.xspswap.finance/#/swap?outputCurrency=0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1&inputCurrency=XDC";
export const chartLink =
  "https://www.geckoterminal.com/xdc/pools/0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e";

export const linktree = "https://linktr.ee/benybadboy";

export const buyXDCLink = "https://docs.bbbpump.fun/how-to-play/how-to-buy-xdc";

export const rpcUrl = "https://api.bbbpump.fun";

// export const rpcUrl = "http://127.0.0.1:10033";

export const dashboardConfig = {
  "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1": {
    imageUrl: "/bbb.jpg",
    tradeLink: dexLink,
    price: "bbb",
  },
  "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08": {
    imageUrl: "/bbb.jpg",
    price: "bbb",
  },
};

export const contracts = {
  551: {
    bbb: {
      address: "0x1796a4cAf25f1a80626D8a2D26595b19b11697c9",
      abi: ERC20ABI,
    },
    carrotFarmer: {
      address: "0x903aA9a8BEaC496c4A4649063eceCeb6Ca522Ea4",
      abi: BBBFarmerABI,
    },
    referralProgram: {
      address: "0x2828e5DfC0C71Bb92f00fBD3d6DC9A04E24b8f87",
      abi: ReferralProgramABI,
    },
    mbbb: {
      address: "0xb89D5cb86f2403ca602Ee45a687437a9F0Ce1C9c",
      abi: mBBBABI,
    },
    car: {
      address: "0x5A739D602057F217d8AEb2f26E6e57F9f05cEf78",
      abi: ERC20ABI,
    },
    mbbbv2: {
      address: "0x47Ab36821c53E574310c5cc5fabdA4467B8f8fc0",
      abi: mBBBV2ABI,
    },
  },
  50: {
    referralProgram: {
      address: "0xAf103E2E469aAA90f85310fA406E9693E79f0333",
      abi: ReferralProgramABI,
    },
    bbb: {
      address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
      abi: ERC20ABI,
    },
    carrotFarmer: {
      address: "0xd659E7D0390F19Db21c3e16f17fBD7F138f3b969",
      abi: BBBFarmerABI,
    },
    mbbb: {
      address: "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08",
      abi: mBBBABI,
    },
    mbbbv2: {
      address: "0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec",
      abi: mBBBV2ABI,
    },
    bbbpumpReferral: {
      address: "0x448918c063B031D181b785210d526819854F3f27",
      abi: BBBPumpReferralABI,
    },
    pool: {
      address: "0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e",
      abi: PoolABI,
    },
  },
};

export const socialMedia = {
  x: "https://t.me/bbbpump",
  cmc: "https://coinmarketcap.com/currencies/beny-bad-boy/",
  coingecko:
    "https://www.geckoterminal.com/xdc/pools/0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e",
  tg: "https://x.com/bbbpumpdotfun",
  website: "https://bbbpump.fun",
};
