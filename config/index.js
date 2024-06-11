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
      address: "0x314c3908E559dEBe1fCe7DfA9283867e3616501D",
      abi: BBBFarmerABI,
    },
    referralProgram: {
      address: "0x403c0a197aD872d422A53efA1e46A11ee6F9be25",
      abi: ReferralProgramABI,
    },
  },
  50: {
    referralProgram: {
      address: "0xAf103E2E469aAA90f85310fA406E9693E79f0333",
      abi: ReferralProgramABI,
    },
  },
};
