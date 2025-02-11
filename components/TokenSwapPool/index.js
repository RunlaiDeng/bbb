import { useState, useEffect } from "react";
import { erc20Abi, formatEther, parseEther } from "viem";
import Image from "next/image";
import { track } from "@vercel/analytics";
import { icecreamswap, xswapDexLink } from "@/config";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import SendButton from "@/components/SendButton";
import { getBBBPrice, getPrice, getQuoteFromPool } from "../Utils";
import WriteButton from "../WriteButton";

const TokenSwap = (props) => {
  const [data, setData] = useState({ buyRange: 0, sellRange: 0 });
  const [type, setType] = useState("buy");
  const [max, setMax] = useState({});
  const { poolAddress, symbol, imageUrl, token, xdcPrice } = props;

  async function fetchData() {
    const pool = await getPrice(poolAddress);
    setData({ ...data, pool });
  }
  useEffect(() => {
    fetchData();
  }, [poolAddress]);

  const { address } = useAccount();

  const poolPrice = data?.pool?.price;

  const { data: balance, refetch: refetch1 } = useBalance({ address: address });
  const tokenContract = { address: token, abi: erc20Abi };
  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: "allowance",
        args: [address, icecreamswap],
      },
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  const refetch = () => {
    refetch0();
    refetch1();
    setData({
      ...data,
      buyAmount: 0n,
      sellAmount: 0n,
      buyRange: 0,
      sellRange: 0,
    });
  };

  const allowance = reads0?.[0]?.result || 0n;
  const tokenBalance = reads0?.[1]?.result || 0n;
  const xdcBalance = balance?.value || 0n;

  useEffect(() => {
    async function fetchMax() {
      if (tokenBalance || xdcBalance) {
        const res0 = await getQuoteFromPool(
          "0x0000000000000000000000000000000000000000",
          token,
          xdcBalance?.toString()
        );

        const res1 = await getQuoteFromPool(
          token,
          "0x0000000000000000000000000000000000000000",
          tokenBalance?.toString()
        );
        setMax({ maxBuy: res0?.toAmount, maxSell: res1?.toAmount });
      }
    }

    fetchMax();
  }, [tokenBalance, xdcBalance]);

  useEffect(() => {
    async function fetchQuote() {
      if (data?.buyAmount >= 0) {
        const res = await getQuoteFromPool(
          "0x0000000000000000000000000000000000000000",
          token,
          data?.buyAmount?.toString()
        );

        setData({ ...data, buy: res, disabledBtn: false });
      }
    }

    const handler = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [data?.buyAmount]);

  useEffect(() => {
    async function fetchQuote() {
      if (data?.sellAmount >= 0) {
        const res = await getQuoteFromPool(
          token,
          "0x0000000000000000000000000000000000000000",
          data?.sellAmount?.toString()
        );

        setData({ ...data, sell: res, disabledBtn: false });
      }
    }

    const handler = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [data?.sellAmount]);

  const sellTx = data?.sell?.tx || {};
  const buyTx = data?.buy?.tx || {};
  buyTx.value = data.buyAmount;
  delete sellTx.from;
  const toBuyAmount = BigInt(data?.buy?.toAmount || 0);
  const toSellAmount = BigInt(data?.sell?.toAmount || 0);

  const usdBuyIn = Number(buyTx?.value) * xdcPrice;
  const usdBuyTo = Number(toBuyAmount) * poolPrice;
  const usdSellIn = Number(data?.sellAmount) * poolPrice;
  const usdSellTo = Number(toSellAmount) * xdcPrice;

  console.log(
    data?.disabledBtn,
    !buyTx?.data,
    usdBuyIn * 0.4 > usdBuyTo,
    data.buyAmount > xdcBalance
  );

  const disableBuy =
    data?.disabledBtn ||
    !buyTx?.data ||
    usdBuyIn * 0.4 > usdBuyTo ||
    data.buyAmount > xdcBalance;
  const disableSell =
    data?.disabledBtn ||
    !sellTx?.data ||
    usdSellIn * 0.4 > usdSellTo ||
    data.sellAmount > tokenBalance;

  const buy = {
    buttonName: "Buy " + symbol,
    disabled: disableBuy,
    data: buyTx,
    before: () => {
      track("buy");
    },
    callback: () => {
      refetch();
    },
  };

  const sell = {
    buttonName: "Sell " + symbol,
    disabled: disableSell,
    data: sellTx,
    before: () => {
      track("sell");
    },
    callback: () => {
      refetch();
    },
  };

  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const approve = {
    buttonName: "Approve",
    data: {
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [icecreamswap, MAX_UINT256],
    },
    callback: (confirm) => {
      if (confirm) {
        refetch();
      }
    },
  };

  let showApprove = true;
  if (allowance && allowance >= (data?.sellAmount || 0)) {
    showApprove = false;
  }

  const maxBuy = BigInt(max?.maxBuy || 0);
  const maxSell = BigInt(max?.maxSell || 0);

  return (
    <>
      <div className="card " id="swap">
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
                        disabledBtn: true,
                        buyAmount: undefined,
                      });
                    }

                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      let set = parseEther(newValue);

                      setData({
                        ...data,
                        disabledBtn: true,
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
                    disabledBtn: true,
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
                  value={formatEther(BigInt(toBuyAmount || 0n))}
                  disabled
                />
                {symbol}

                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src={imageUrl}
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
              <SendButton className="btn btn-success" {...buy} />
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
                        disabledBtn: true,
                        sellAmount: undefined,
                      });
                    }
                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      let set = parseEther(newValue);

                      setData({
                        ...data,
                        disabledBtn: true,
                        sellAmount: set,
                      });
                    }
                  }}
                />
                {symbol}
                <div className="h-6 w-6 overflow-hidden">
                  <Image
                    height={400}
                    width={400}
                    src={imageUrl}
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
                    disabledBtn: true,
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
                  value={formatEther(BigInt(toSellAmount || 0))}
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
              {showApprove && (
                <WriteButton {...approve} className="btn btn-primary" />
              )}
              {!showApprove && (
                <SendButton {...sell} className="btn btn-error" />
              )}
            </>
          )}
          {/* {isBBB && (
            <div
              className="text-left font-bold text-xs hover:underline cursor-pointer flex items-center text-red-700"
              onClick={() => {
                window.open(xswapDexLink);
              }}
            >
              <svg
                t="1732767890609"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1469"
                width="16"
                height="16"
              >
                <path
                  d="M522.656 388.064a32 32 0 0 0-32 32v160a32 32 0 0 0 64 0v-160a32 32 0 0 0-32-32M522.656 676.064a32 32 0 1 0 0 64 32 32 0 0 0 0-64"
                  fill="#d81e06"
                  p-id="1470"
                ></path>
                <path
                  d="M714.656 795.616H203.072l127.584-221.888 33.152-57.664 158.848-276.224 158.816 276.224 33.184 57.696 127.552 221.856h-127.552z m194.528-11.968L566.528 187.712c-10.144-17.6-26.112-27.712-43.872-27.712s-33.728 10.112-43.84 27.712L136.096 783.648c-10.048 17.568-10.784 36.48-1.92 51.84 8.896 15.328 25.6 24.128 45.824 24.128H865.344c20.16 0 36.864-8.8 45.76-24.128 8.896-15.36 8.192-34.24-1.92-51.84z"
                  fill="#d81e06"
                  p-id="1471"
                ></path>
              </svg>
              Swap not work ? click to try xswap {"->"}
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default TokenSwap;
