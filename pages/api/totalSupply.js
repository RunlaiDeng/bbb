import { createPublicClient, http } from "viem";
import { xdc } from "viem/chains";
import { getContract } from "viem";
import { erc20Abi } from "viem";

const publicClient = createPublicClient({
  chain: xdc,
  transport: http(),
});

const contract = getContract({
  address: "0xfa4ddcfa8e3d0475f544d0de469277cf6e0a6fd1",
  abi: erc20Abi,
  client: publicClient,
});

export default async function handler(req, res) {
  const result = await contract.read.totalSupply();

  res.status(200).send((result / BigInt(10e18))?.toString());
}
