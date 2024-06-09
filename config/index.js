import ERC20ABI from "../abi/ERC20ABI.json";
import BBBFarmerABI from "../abi/BBBFarmerABI.json";

export const contracts = {
  551: {
    bbb: {
      address: "0x1796a4cAf25f1a80626D8a2D26595b19b11697c9",
      abi: ERC20ABI,
    },
    carrotfarmer: {
      address: "0x710DA3C5C6a69A466FB1c456172103B3761BB422",
      abi: BBBFarmerABI,
    },
  },
};
