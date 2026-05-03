import LightChart from "@/components/LightChart";
import { useEffect, useState } from "react";
import { parseEther, formatEther, erc20Abi } from "viem";
import { deleteSame, getXDCPrice, handleSrc } from "../Utils";
import WriteButton from "../WriteButton";
import { useAccount, useBalance, useChainId, useReadContracts, useSwitchChain } from "wagmi";
import { contracts } from "@/config";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { xdc } from "@/config/chains";

const TokenSwapFun = (props) => {
  const t = useTranslation();
  const [mount, setMount] = useState(false);
  const [type, setType] = useState("buy");
  let { index, symbol, imageUrl, token, xdcPrice } = props;
  index = index?.toString();
  const [data, setData] = useState({
    sellRange: 0,
    buyRange: 0,
  });

  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { address } = useAccount();
  const wrongChain = chainId !== xdc.id;

  const { data: balance } = useBalance({ address });
  const tokenContract = { address: token, abi: erc20Abi };

  const mbbb = contracts[chainId]?.mbbbv2;

  const { data: reads0, refetch: refetch0, isFetching: isFetching0 } = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...tokenContract,
        functionName: "totalSupply",
      },
    ],
  });

  const tokenBalance = reads0?.[0]?.result || 0n;
  const totalSupply = reads0?.[1]?.result || 0n;
  const xdcBalance = balance?.value || 0n;

  const { data: reads1, refetch: refetch1, isFetching: isFetching1 } = useReadContracts({
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
      {
        ...mbbb,
        functionName: "getBuyAmount",
        args: [index, data?.buyAmount?.toString()],
      },
      {
        ...mbbb,
        functionName: "getSellAmount",
        args: [
          index,
          data?.sellAmount?.toString() > totalSupply
            ? totalSupply?.toString()
            : data?.sellAmount?.toString(),
        ],
      },
    ],
  });

  const maxBuy = reads1?.[0]?.result;
  const maxSell = reads1?.[1]?.result;
  const buyTokenAmount = reads1?.[2]?.result;
  const sellXDCAmount = reads1?.[3]?.result;

  const buyAmountBn = data?.buyAmount;
  const sellAmountBn = data?.sellAmount;
  const invalidBuyZero =
    buyAmountBn !== undefined &&
    buyAmountBn !== null &&
    typeof buyAmountBn === "bigint" &&
    buyAmountBn <= 0n;
  const invalidSellZero =
    sellAmountBn !== undefined &&
    sellAmountBn !== null &&
    typeof sellAmountBn === "bigint" &&
    sellAmountBn <= 0n;
  const buyMissing = buyAmountBn === undefined || buyAmountBn === null;
  const sellMissing = sellAmountBn === undefined || sellAmountBn === null;
  const buyExceedsBalance =
    !buyMissing &&
    typeof buyAmountBn === "bigint" &&
    buyAmountBn > 0n &&
    buyAmountBn > xdcBalance;
  const sellExceedsBalance =
    !sellMissing &&
    typeof sellAmountBn === "bigint" &&
    sellAmountBn > 0n &&
    sellAmountBn > tokenBalance;

  const disableBuy =
    wrongChain ||
    buyMissing ||
    invalidBuyZero ||
    buyExceedsBalance ||
    isFetching0 ||
    isFetching1;
  const disableSell =
    wrongChain ||
    sellMissing ||
    invalidSellZero ||
    sellExceedsBalance ||
    isFetching0 ||
    isFetching1;

  const isRefreshingQuotes = isFetching0 || isFetching1;

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

  useEffect(() => {
    async function fetchQuote() {
      if (data?.sellRange >= 0) {
        setData({
          ...data,
          sellAmount: (tokenBalance * BigInt(data?.sellRange)) / BigInt(100),
        });
      }
    }

    const handler = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [data?.sellRange]);

  useEffect(() => {
    async function fetchQuote() {
      if (data?.buyRange >= 0) {
        setData({
          ...data,
          buyAmount: (xdcBalance * BigInt(data?.buyRange)) / BigInt(100),
        });
      }
    }

    const handler = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [data?.buyRange]);

  const buy = {
    buttonName: "Buy " + symbol,
    disabled: disableBuy,
    data: {
      ...mbbb,
      functionName: "buy",
      args: [index],
      value: data?.buyAmount,
    },
    before: () => {
  
    },
    callback: () => {
      refetch();
    },
  };

  const sell = {
    buttonName: "Sell " + symbol,
    disabled: disableSell,
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

  const showBuyAmount = (xdcBalance * BigInt(data?.buyRange)) / BigInt(100);
  const showSellAmount = (tokenBalance * BigInt(data?.sellRange)) / BigInt(100);

  return (
    <>
      <div className="card" id="swap">
        <div className="card-body font-bold  p-2">
          {wrongChain && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="mb-2">{t.journey.wrongNetwork}</p>
              <button
                type="button"
                className="btn btn-sm btn-warning w-full"
                disabled={isSwitchingChain}
                onClick={() => switchChain?.({ chainId: xdc.id })}
                aria-busy={isSwitchingChain}
              >
                {isSwitchingChain ? (
                  <>
                    <span className="loading loading-spinner loading-sm" aria-hidden />
                    {t.writeButton.loading}
                  </>
                ) : (
                  t.journey.switchNetwork
                )}
              </button>
            </div>
          )}
          {isRefreshingQuotes && !wrongChain && (
            <p className="mb-2 text-xs font-medium text-emerald-700" role="status" aria-live="polite">
              {t.swapForm.refreshingData}
            </p>
          )}
          {type === "buy" && buyExceedsBalance && (
            <p className="mb-2 text-xs text-error" role="alert">
              {t.swapForm.insufficientXdc}
            </p>
          )}
          {type === "sell" && sellExceedsBalance && (
            <p className="mb-2 text-xs text-error" role="alert">
              {t.swapForm.insufficientToken}
            </p>
          )}
          {type === "buy" && invalidBuyZero && (
            <p className="mb-2 text-xs text-error" role="alert">
              {t.swapForm.invalidAmount}
            </p>
          )}
          {type === "sell" && invalidSellZero && (
            <p className="mb-2 text-xs text-error" role="alert">
              {t.swapForm.invalidAmount}
            </p>
          )}
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
                        buyAmount: undefined,
                      });
                    }

                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      let set = parseEther(newValue);

                      setData({
                        ...data,
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
                      (xdcBalance * BigInt(data?.buyRange)) / BigInt(100),
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
                        sellAmount: undefined,
                      });
                    }
                    let set = parseEther(newValue);

                    setData({
                      ...data,
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
