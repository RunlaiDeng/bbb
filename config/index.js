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
      addres: "0x1C209871D579C00bb2eaBe75C24eCd77caa49f71",
      abi: ReferralProgramABI,
    },
  },
};
