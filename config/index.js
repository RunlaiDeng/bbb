import ERC20ABI from "../abi/ERC20ABI.json";
import BBBFarmerABI from "../abi/BBBFarmerABI.json";
import ReferralProgramABI from "../abi/ReferralProgramABI.json";
import mBBBABI from "../abi/mBBBABI.json";
import mBBBV2ABI from "../abi/mBBBV2ABI.json";
import BBBPumpReferralABI from "../abi/BBBPumpReferralABI.json";
import PoolABI from "../abi/PoolABI.json";
import ClaimRewardsABI from "../abi/ClaimRewardsABI.json";
import LpStakeABI from "../abi/LpStakeABI.json";
import IDOABI from "../abi/IDOABI.json";
import bpsXDCABI from "../abi/bpsXDCABI.json";
import XDCStakeABI from "../abi/XDCStakeABI.json";
import USDBABI from "../abi/USDBABI.json";
import USDBStakeABI from "../abi/USDBStakeABI.json";
import BBBubuABI from "../abi/BBBubuABI.json";
import mTransferABI from "../abi/mTransferABI.json";
import sUSDBABI from "../abi/sUSDBABI.json";
import lendABI from "../abi/LendABI.json";
import BBBGameABI from "../abi/BBBGameABI.json";

// export const dexLink =
//   "https://icecreamswap.com/swap?chain=xdc&outputCurrency=0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1&inputCurrency=XDC";
export const dexLink = "/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1";
export const xswapDexLink =
  "https://app.xspswap.finance/#/swap?outputCurrency=0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1&inputCurrency=XDC";
export const chartLink =
  "https://www.geckoterminal.com/xdc/pools/0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e";

export const linktree = "https://linktr.ee/benybadboy";

export const buyXDCLink =
  "https://ramp.alchemypay.org?crypto=XDC&fiat=USD&amount=1000&alpha2=US&network=XDC&type=officialWebsite#/index";

export const rpcUrl = "https://api.bbbpump.fun";

// export const rpcUrl = "http://192.168.0.145:10033";

export const dashboardConfig = {
  "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1": {
    imageUrl: "/bbb.jpg",
    tradeLink: dexLink,
    price: "bbb",
  },
  "0x37c00AE5C4b49Ab0F5fD2FFB1033588e9bC33B08": {
    imageUrl: "/bbb.jpg",
    price: "mbbb",
  },
  "0x951857744785E80e2De051c32EE7b25f9c458C42": {
    imageUrl: "/xdc.png",
    price: "wxdc",
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
    lpStake: {
      address: "0x123456789abcdef123456789abcdef123456789", // Replace with actual address when deployed
      abi: LpStakeABI,
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
    blhzRewards: {
      address: "0x1168a6D36CDD2661c84e29045F05fA2058aF48B9",
      abi: ClaimRewardsABI,
    },
    ccrRewards: {
      address: "0xeF7dfC1BcA77c46F1C02E5D13fe7C10BE405cE59",
      abi: ClaimRewardsABI,
    },
    lpStake: {
      address: "0x2B3Bb9b3265Fcee484e857506fDCf2C0776E9c43", // Replace with actual address when deployed
      abi: LpStakeABI,
    },
    idoContract: {
      address: "0x528001976DB208844CC5998cE7Bb7e635819D9f7",
      abi: IDOABI,
    },
    psXDC: {
      address: "0x9B8e12b0BAC165B86967E771d98B520Ec3F665A6",
      abi: ERC20ABI,
    },
    bpsXDC: {
      address: "0x24be372f0915b8BAf17AfA150210FFcB79C88845",
      abi: bpsXDCABI,
    },
    xdcStake: {
      address: "0x5af754f822CEd42deC729c1F1B3EDb9f13485ba7",
      abi: XDCStakeABI,
    },
    usdb: {
      address: "0xA23885c8E0743C734Bd6Da0df66e2631Ee9Bc6D8",
      abi: USDBABI,
    },
    xdcUSDC: {
      address: "0x2A8E898b6242355c290E1f4Fc966b8788729A4D4",
      abi: ERC20ABI,
    },
    stargateUSDC: {
      address: "0xCc0587aeBDa397146cc828b445dB130a94486e74",
      abi: ERC20ABI,
    },
    stargateUSDT: {
      address: "0xcdA5b77E2E2268D9E09c874c1b9A4c3F07b37555",
      abi: ERC20ABI,
    },
    usdbStake: {
      address: "0x510ef49A0aec84F1957D8aa1d7a4308782ABAD7d",
      abi: USDBStakeABI,
    },
    lpStakev2: {
      address: "0x9cbf30677b51Ba2E3Fd65dF3BD9BcA5F7dace781",
      abi: LpStakeABI,
    },
    weth: {
      address: "0x951857744785e80e2de051c32ee7b25f9c458c42",
    },
    bbbubu: {
      address: "0x7601A8BA5a4f77c6Ef424E850bab68A5C8c0473D",
      abi: BBBubuABI,
    },
    multitransfer: {
      address: "0x79F963CdE9940B4D816bf10881716644cBc9B664",
      abi: mTransferABI,
    },
    sUSDB: {
      address: "0xeA5cD2C82551f81F7298e74B291182Bd429237F6",
      abi: sUSDBABI,
    },
    sUSDBV2: {
      address: "0x1416ceC451561105B70623CDfb70e521293E919a",
      abi: sUSDBABI,
    },
    lend: {
      address: "0xABC8AA43120ff0f53749e9d8B525f50da489e0d9",
      abi: lendABI,
    },
    bbbgame: {
      address: "0xEA831F396704e741D0161A740b91126c95753212",
      abi: BBBGameABI,
    },
  },
};
// IDO项目额外信息
export const idos = {
  0: {
    description: "this is good project",
    website: "https://google.com",
    image: "/logo.png",
  },
  1: {
    description: "this is good project",
    website: "https://google.com",
    image: "/logo.png",
  },
};

export const icecreamswap = "0x2a9a2D31819cD71B60F25729Bc60a2D7E7545233";

export const markets = [
  {
    name: "Beny Bad Boy",
    symbol: "BBB",
    imageUrl: "/bbb.jpg",
    description:
      "$BBB isn't just a meme; it's the heartbeat of a wild, unstoppable community. Powered by the BBB Cult, we're rewriting the rules of memecoins. Together, the BBB Community creates the fun, fuels the pumps, and spreads the megadrops like wildfire.",
    x: "https://x.com/bbbpump",
    cmc: "https://coinmarketcap.com/currencies/beny-bad-boy/",
    coingecko:
      "https://www.geckoterminal.com/xdc/pools/0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e",
    tg: "https://t.me/bbbpump",
    website: "https://bbbpump.fun",
    youtube: "https://www.youtube.com/@bbbpump",
    substack: "https://bbbpump.substack.com/",
    createTime: "09/06/24",
    deployer: "0x2475Dcd4Fe333bE814Ef7C8f8CE8A1E9B5FcDEA0",
    address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
    pool: "0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e",
  },
  {
    name: "USDB",
    symbol: "USDB",
    imageUrl: "/usdb.png",
    description: "USDB token",
    address: "0xA23885c8E0743C734Bd6Da0df66e2631Ee9Bc6D8",
    pool: "0x9c15dc1c8991e852ceaf623b30162a98a1c83f3d",
  },
];

// Keep backward compatibility
export const bbbInfo = markets[0];
export const usdbInfo = markets[1];

export const mux = {
  ws: "ws://127.0.0.1:4000/",
};
