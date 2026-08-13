import ERC20ABI from "../abi/ERC20ABI.json";
import LpStakeABI from "../abi/LpStakeABI.json";

export const contracts = {
  50: {
    bbb: {
      address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
      abi: ERC20ABI,
    },
    usdc: {
      address: "0xfA2958CB79b0491CC627c1557F441eF849Ca8eb1",
      abi: ERC20ABI,
    },
    lpStake: {
      address: "0x2B3Bb9b3265Fcee484e857506fDCf2C0776E9c43",
      abi: LpStakeABI,
    },
    lpStakev2: {
      address: "0x9cbf30677b51Ba2E3Fd65dF3BD9BcA5F7dace781",
      abi: LpStakeABI,
    },
  },
};
