import ERC20ABI from "../abi/ERC20ABI.json";
import BBBFarmerABI from "../abi/BBBFarmerABI.json";
import ReferralProgramABI from "../abi/ReferralProgramABI.json";

export const contracts = {
  551: {
    bbb: {
      address: "0x1796a4cAf25f1a80626D8a2D26595b19b11697c9",
      abi: ERC20ABI,
    },
    carrotfarmer: {
      address: "0x0048b0b5040CB106Adb96dF5Fa6E053D48B8C0EA",
      abi: BBBFarmerABI,
    },
    referralProgram: {
      address: "0x403c0a197aD872d422A53efA1e46A11ee6F9be25",
      abi: ReferralProgramABI,
    },
  },
  51: {
    referralProgram: {
      address: "0x1c880eF8B4AD49f615820f6fab33f9a6c8D36fb2",
      abi: ReferralProgramABI,
    },
  },
};
