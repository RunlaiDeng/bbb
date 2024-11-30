import LightChart from "@/components/LightChart";
import { useEffect, useState } from "react";
import { parseEther, formatEther, erc20Abi } from "viem";
import { deleteSame, getXDCPrice, handleSrc } from "../Utils";
import WriteButton from "../WriteButton";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";
import { track } from "@vercel/analytics";
import Image from "next/image";
const TokenSwapFun = (props) => {
  const [mount, setMount] = useState(false);
  const [type, setType] = useState("buy");
  let { index, symbol, imageUrl, token, xdcPrice } = props;
  index = index?.toString();
  const [data, setData] = useState({
    sellRange: 0,
    buyRange: 0,
  });

  const chainId = useChainId();
  const { address } = useAccount();

  const { data: balance } = useBalance({ address });
  const tokenContract = { address: token, abi: erc20Abi };

  const mbbb = contracts[chainId]?.mbbbv2;

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  const tokenBalance = reads0?.[0]?.result || 0n;
  const xdcBalance = balance?.value || 0n;

  const { data: reads1, refetch: refetch1 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getBuyAmount",
        args: [index, xdcBalance?.toString()],
      },
      {
        ...mbbb,
        functionName: "getSellAmount",
        args: [index, tokenBalance?.toString()],
      },
    ],
  });

  const maxBuy = reads1?.[0]?.result;
  const maxSell = reads1?.[1]?.result;

  const refetch = () => {
    refetch0();
    setData({
      ...data,
      buyAmount: 0n,
      sellAmount: 0n,
      buyRange: 0,
      sellRange: 0,
    });
  };
  const buy = {
    buttonName: "Buy " + symbol,
    disabled: !data?.buyAmount,
    data: {
      ...mbbb,
      functionName: "buy",
      args: [index],
      value: data?.buyAmount,
    },
    before: () => {
      track("buy");
    },
    callback: () => {
      refetch();
    },
  };

  const sell = {
    buttonName: "Sell " + symbol,
    disabled: !data?.sellAmount,
    data: {
      ...mbbb,
      functionName: "sell",
      args: [index, data?.sellAmount],
    },
    before: () => {
      track("sell");
    },
    callback: () => {
      refetch();
    },
  };

  return (
    <>
      <div className="card" id="swap">
        <div className="card-body font-bold  p-2">
          <div className="grid grid-cols-2 gap-2">
            <div
              className={"btn w-full " + (type == "buy" && "btn-success")}
              onClick={() => {
                setType("buy");
                refetch();
              }}
            >
              Buy
            </div>
            <div
              className={"btn w-full " + (type == "sell" && "btn-error")}
              onClick={() => {
                setType("sell");
                refetch();
              }}
            >
              Sell
            </div>
          </div>
          {type == "buy" && (
            <>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="number"
                  className="grow"
                  value={
                    data?.buyAmount >= 0
                      ? formatEther(data?.buyAmount)
                      : undefined
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (!newValue) {
                      setData({
                        ...data,
                        buyRange: 0,
                        buyAmount: undefined,
                      });
                    }

                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      let set = parseEther(newValue);
                      const max = (xdcBalance * BigInt(99)) / BigInt(100);
                      if (set > max) {
                        set = max;
                      }
                      setData({
                        ...data,
                        buyRange: Number((100n * set) / xdcBalance),
                        buyAmount: set,
                      });
                    }
                  }}
                />
                XDC
                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src="/xdc.png"
                    alt={""}
                    className="object-cover w-full h-full"
                  />
                </div>
              </label>
              <input
                type="range"
                min={0}
                max="99"
                className="range range-xs"
                value={data?.buyRange}
                step={1}
                onChange={(e) => {
                  setData({
                    ...data,
                    buyRange: e.target.value,
                    buyAmount:
                      (xdcBalance * BigInt(e.target.value)) / BigInt(100),
                  });
                }}
              />
              <div className="flex w-full justify-between px-2 text-xs">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>99%</span>
              </div>

              {/* <label className="input input-bordered flex items-center gap-2">
                <input
                  type="number"
                  className="grow"
                  value={formatEther(buyTokenAmount || 0n)}
                  disabled
                />
                {symbol}

                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src={handleSrc(imageUrl)}
                    alt={""}
                    className="object-cover w-full h-full"
                  />
                </div>
              </label> */}
              <div className="flex justify-between text-xs">
                Avbl
                <div>
                  {xdcBalance >= 0
                    ? Number(formatEther(xdcBalance))?.toLocaleString()
                    : undefined}{" "}
                  {"XDC"}
                </div>
              </div>
              <div className="flex justify-between text-xs">
                Max Buy
                <div>
                  {maxBuy >= 0
                    ? Number(formatEther(maxBuy))?.toLocaleString()
                    : undefined}{" "}
                  {symbol}
                </div>
              </div>
              <WriteButton {...buy} className="btn btn-success" />
            </>
          )}
          {type == "sell" && (
            <>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="number"
                  className="grow"
                  value={
                    data?.sellAmount >= 0
                      ? formatEther(data?.sellAmount)
                      : undefined
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const newValue = e.target.value;

                    if (!newValue) {
                      setData({
                        ...data,
                        sellRange: 0,
                        sellAmount: undefined,
                      });
                    }
                    let set = parseEther(newValue);
                    if (set > tokenBalance) {
                      set = tokenBalance;
                    }
                    setData({
                      ...data,
                      sellRange: Number((100n * set) / tokenBalance),
                      sellAmount: set,
                    });
                  }}
                />
                {symbol}
                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src={handleSrc(imageUrl)}
                    alt={""}
                    className="object-cover w-full h-full"
                  />
                </div>
              </label>
              <input
                type="range"
                min={0}
                max="100"
                className="range range-xs"
                step={1}
                value={data?.sellRange}
                onChange={(e) => {
                  setData({
                    ...data,
                    sellRange: e.target.value,
                    sellAmount:
                      (tokenBalance * BigInt(e.target.value)) / BigInt(100),
                  });
                }}
              />
              <div className="flex w-full justify-between px-2 text-xs">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              {/* <label className="input input-bordered flex items-center gap-2">
                <input
                  type="number"
                  className="grow"
                  value={formatEther(sellXDCAmount || 0n)}
                  disabled
                />
                XDC
                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src="/xdc.png"
                    alt={""}
                    className="object-cover w-full h-full"
                  />
                </div>
              </label> */}
              <div className="flex justify-between text-xs">
                Avbl
                <div>
                  {tokenBalance >= 0
                    ? Number(formatEther(tokenBalance))?.toLocaleString()
                    : undefined}{" "}
                  {symbol}
                </div>
              </div>
              <div className="flex justify-between text-xs">
                Max Sell
                <div>
                  {maxSell >= 0
                    ? Number(formatEther(maxSell))?.toLocaleString()
                    : undefined}{" "}
                  XDC
                </div>
              </div>
              <WriteButton {...sell} className="btn btn-error" />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TokenSwapFun;
