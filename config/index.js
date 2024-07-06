import ERC20ABI from "../abi/ERC20ABI.json";
import BBBFarmerABI from "../abi/BBBFarmerABI.json";
import ReferralProgramABI from "../abi/ReferralProgramABI.json";
import mBBBABI from "../abi/mBBBABI.json";

export const dexLink =
  "https://app.xspswap.finance/#/swap?outputCurrency=0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1";

export const chartLink =
  "https://www.geckoterminal.com/xdc/pools/0xf8ca0db7eba5e0760b66d77cb83a15fde9ad0e20";

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
      address: "0x281902021DE6D51da90B5Fc47F8b4F036Af8E336",
      abi: mBBBABI,
    },
    car: {
      address: "0x5A739D602057F217d8AEb2f26E6e57F9f05cEf78",
      abi: ERC20ABI,
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
    multicallAddress: { address: "0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF" },
  },
};
