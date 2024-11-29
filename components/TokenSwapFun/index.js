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
  let { index, symbol, imageUrl, token, xdcPrice } = props;
  index = index?.toString();
  const [data, setData] = useState({
    state: "buy",
  });

  const chainId = useChainId();
  const { address } = useAccount();

  const { data: balance } = useBalance({ address });
  const tokenContract = { address: token, abi: erc20Abi };

  const mbbb = contracts[chainId]?.mbbbv2;

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getBuyAmount",
        args: [index, data?.buyAmount?.toString()],
      },
      {
        ...mbbb,
        functionName: "getSellAmount",
        args: [index, data?.sellAmount?.toString()],
      },
      {
        ...mbbb,
        functionName: "getKlineLength",
        args: [index],
      },
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  const buyTokenAmount = reads0?.[0]?.result;
  const sellXDCAmount = reads0?.[1]?.result;
  const klineLength = reads0?.[2]?.result;
  const tokenBalance = reads0?.[4]?.result || 0n;
  const xdcBalance = balance?.value || 0n;

  const searchKline = [];
  for (let i = 0; i < klineLength; i++) {
    searchKline.push({
      ...mbbb,
      functionName: "klineMap",
      args: [index, i],
    });
  }
  const { data: reads2, refetch: refetch2 } = useReadContracts({
    contracts: searchKline,
  });
  let klineMap = reads2?.map((item) => {
    const kline = item?.result;
    let high;
    let low;
    let color;
    const time = Number(kline?.[0] || 0);
    const open = xdcPrice * Number(formatEther(kline?.[1] || 0)) * 2;
    const close = xdcPrice * Number(formatEther(kline?.[2] || 0)) * 2;
    const value = xdcPrice * Number(formatEther(kline?.[3] || 0));

    if (open > close) {
      low = open;
      high = close;
      color = "red";
    } else {
      low = close;
      high = open;
    }
    return {
      time,
      open,
      close,
      value,
      high,
      low,
      color,
    };
  });

  klineMap = deleteSame(klineMap);

  const trade = {
    trade: klineMap,
    volume: klineMap,
  };

  const refetch = () => {
    refetch0();
    refetch2();
  };
  const buy = {
    buttonName: "Place Trade",
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
    buttonName: "Place Trade",
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
      <div className="card outline rounded-none outline-gray-200" id="chart">
        <div className="card-body p-2">
          <div className="text-left font-bold text-sm">Chart</div>
          <LightChart {...trade} />
        </div>
      </div>
      <div className="card outline rounded-none outline-gray-200" id="swap">
        <div className="card-body font-bold  p-2">
          <div className="grid grid-cols-2 gap-2">
            <div
              className={
                "btn w-full " + (data?.state == "buy" && "btn-success")
              }
              onClick={() => {
                setData({ ...data, state: "buy" });
              }}
            >
              Buy
            </div>
            <div
              className={"btn w-full " + (data?.state == "sell" && "btn-error")}
              onClick={() => {
                setData({ ...data, state: "sell" });
              }}
            >
              Sell
            </div>
          </div>
          {data?.state == "buy" && (
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
                        buyAmount: undefined,
                      });
                    }

                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      setData({
                        ...data,
                        buyAmount: parseEther(newValue),
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
              <div role="tablist" className="tabs">
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      buyAmount: 0n,
                    });
                  }}
                >
                  0%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      buyAmount: (xdcBalance * BigInt(25)) / BigInt(100),
                    });
                  }}
                >
                  25%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      buyAmount: (xdcBalance * BigInt(50)) / BigInt(100),
                    });
                  }}
                >
                  50%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      buyAmount: (xdcBalance * BigInt(75)) / BigInt(100),
                    });
                  }}
                >
                  75%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      buyAmount: xdcBalance,
                    });
                  }}
                >
                  100%
                </a>
              </div>
              <label className="input input-bordered flex items-center gap-2">
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
              </label>
              <div className="text-right text-xs">
                Avbl :{" "}
                {xdcBalance >= 0
                  ? Number(formatEther(xdcBalance))?.toLocaleString()
                  : undefined}{" "}
                {"XDC"}
              </div>
              <WriteButton {...buy} className="btn btn-success" />
            </>
          )}
          {data?.state == "sell" && (
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
                        sellAmount: undefined,
                      });
                    }
                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      setData({
                        ...data,
                        sellAmount: parseEther(newValue),
                      });
                    }
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
              <div role="tablist" className="tabs">
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({ ...data, sellAmount: 0n });
                  }}
                >
                  0%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      sellAmount: (tokenBalance * BigInt(25)) / BigInt(100),
                    });
                  }}
                >
                  25%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      sellAmount: (tokenBalance * BigInt(50)) / BigInt(100),
                    });
                  }}
                >
                  50%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      sellAmount: (tokenBalance * BigInt(75)) / BigInt(100),
                    });
                  }}
                >
                  75%
                </a>
                <a
                  role="tab"
                  className="tab btn btn-xs"
                  onClick={() => {
                    setData({
                      ...data,
                      sellAmount: tokenBalance,
                    });
                  }}
                >
                  100%
                </a>
              </div>
              <label className="input input-bordered flex items-center gap-2">
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
              </label>
              <div className="text-right text-xs">
                Avbl :{" "}
                {tokenBalance >= 0
                  ? Number(formatEther(tokenBalance))?.toLocaleString()
                  : undefined}{" "}
                {symbol}
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
