import { contracts } from "@/config";
import { erc20Abi, formatEther } from "viem";
import { useChainId, useReadContracts } from "wagmi";
import Image from "next/image";

const TokenHeadFun = (props) => {
  let { index, name, symbol, token, xdcPrice, createTime, deployer } = props;
  index = index?.toString();
  const chainId = useChainId();

  const mbbb = contracts[chainId]?.mbbbv2;
  const tokenContract = { address: token, abi: erc20Abi };
  const { data: reads0 } = useReadContracts({
    contracts: [
      { ...tokenContract, functionName: "totalSupply" },
      {
        ...mbbb,
        functionName: "price",
        args: [index],
      },
    ],
  });
  const totalSupply = reads0?.[0]?.result;
  const price = reads0?.[1]?.result;
  const poolCap =
    xdcPrice *
    Number(formatEther(totalSupply || 0n) * formatEther(price || 0n) * 2);

  return (
    <div className="card outline rounded-none outline-gray-200 sm:mx-2 py-1">
      <div className="card-body p-0">
        <div className="px-4 sm:flex gap-1 ">
          <div className="font-bold">
            {name} (${symbol})
          </div>

          <div
            className="hover:underline cursor-pointer flex gap-1 items-center"
            onClick={(e) => {
              router.push("/dashboard/" + deployer);
            }}
          >
            by
            <div className="h-4 w-4 overflow-hidden">
              <Image
                height={400}
                width={400}
                src={"/bbb.jpg"}
                alt={""}
                className="object-cover w-full h-full"
              />
            </div>
            {deployer?.substr(36)}
          </div>
          <div>at {createTime}</div>
          <div>cap: ${Number(poolCap)?.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenHeadFun;
