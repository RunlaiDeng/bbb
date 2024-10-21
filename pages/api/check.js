import { createPublicClient, http } from "viem";
import { xdc } from "viem/chains";
import { getContract } from "viem";
import { erc20Abi } from "viem";
import mBBBV2ABI from "../../abi/mBBBV2ABI";

const publicClient = createPublicClient({
  chain: xdc,
  transport: http(),
});

export default async function handler(req, res) {
  const { token, deployer } = req.query;

  const result = await publicClient.readContract({
    address: "0x2E24BFdE1EEDa0F1EA3E57Ba7Ff10ac6516ab5Ec",
    abi: mBBBV2ABI,
    functionName: "getDropTokenByAddress",
    args: [token],
  });

  res.status(200).send(deployer == result?.deployer);
}
