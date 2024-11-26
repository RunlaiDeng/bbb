import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContracts,
  useWatchAsset,
} from "wagmi";
import { bbbInfo, contracts } from "@/config";
import LightChart from "@/components/LightChart";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import rpc from "@/components/Rpc";
import Link from "next/link";
import { parseEther, formatEther } from "viem";
import ImageUpload from "@/components/ImageUpload";
import { buyXDCLink } from "@/config";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
import { track } from "@vercel/analytics";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  getDate,
  deleteSame,
  setFollowing,
  getFollowing,
  getBytesLength,
  handleSrc,
  customToFixed,
  getXDCPrice,
  aggregateTo5MinuteCandles,
} from "@/components/Utils";
import TokenInfo from "../TokenInfo";
import TokenChat from "../TokenChat";
import TokenTrade from "../TokenTrade";
import useWindowSize from "../Hook/useWindowSize";

const Swap = (props) => {
  const { openConnectModal } = useConnectModal();
  const { watchAsset } = useWatchAsset();
  const { success, info, failure } = useNotification();
  const router = useRouter();
  const { token } = props;

  const [mount, setMount] = useState(false);
  const [xdcPrice, setXdcPrice] = useState(0);

  async function fetchData() {
    setXdcPrice((await getXDCPrice()).price);
  }

  useEffect(() => {
    fetchData();
    setMount(true);
  }, []);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const mbbb = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;
  const tokenContract = { address: token, abi: ERC20ABI };

  const { data: balance } = useBalance({ address: address });

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getDropTokenByAddress",
        args: [token],
      },
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
    multicallAddress: mutilCall?.address,
  });

  const dropToken = reads0?.[0]?.result;
  const tokenBalance = reads0?.[1]?.result || 0n;
  const totalSupply = reads0?.[2]?.result || 0n;
  const xdcBalance = balance?.value || 0n;
  const name = dropToken?.name;
  const symbol = dropToken?.symbol;
  const index = dropToken?.index?.toString();
  const xdcAmount = dropToken?.xdcAmount;
  const removed = dropToken?.removed;
  const maxXdc = dropToken?.maxXdc;
  const imageUrl = dropToken?.imageUrl;
  const description = dropToken?.description;
  const deployer = dropToken?.deployer;
  const website = dropToken?.website;
  const telegram = dropToken?.telegram;
  const twitter = dropToken?.twitter;
  const createTime = getDate(Number(dropToken?.createTime));

  const [data, setData] = useState({
    state: "buy",
  });

  const { data: reads1, refetch: refetch1 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "price",
        args: [index],
      },
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
        ...mbbb,
        functionName: "getTradeVolume",
        args: [index],
      },
    ],
    multicallAddress: mutilCall?.address,
  });
  const refetch = () => {
    refetch0();
    refetch1();
  };

  const price = reads1?.[0]?.result;
  const buyTokenAmount = reads1?.[1]?.result;
  const sellXDCAmount = reads1?.[2]?.result;
  const klineLength = reads1?.[3]?.result;
  const tradeVolume = reads1?.[4]?.result;

  const tradeVolume24h = tradeVolume?.[1];

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
    multicallAddress: mutilCall?.address,
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

  klineMap = aggregateTo5MinuteCandles(deleteSame(klineMap));

  const trade = {
    trade: klineMap,
    volume: klineMap,
  };

  const buy = {
    buttonName: "Place Trade",
    disabled: removed || !data?.buyAmount,
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
    disabled: removed || !data?.sellAmount,
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

  let coingecko;
  let cmc;

  const poolCap =
    xdcPrice *
    Number(formatEther(totalSupply || 0n) * formatEther(price || 0n) * 2);

  const isBBB = token == bbbInfo.address;
  const canUpdate = address == deployer && !isBBB;
  const showRLD = true;
  const tInfo = {
    token,
    name,
    symbol,
    imageUrl,
    description,
    website,
    telegram,
    twitter,
    coingecko,
    cmc,
    index,
    deployer,
    createTime,
    canUpdate,
    isBBB,
    showRLD,
    xdcPrice,
    xdcAmount,
    maxXdc,
    totalSupply,
  };
  const tChat = {
    chainId,
    index,
    address,
  };
  const tTrade = {
    poolAddress: undefined,
  };

  const { width: windowWidth } = useWindowSize();

  return (
    mount && (
      <>
        {/* <div className="text-center">
          <div
            className="btn btn-ghost w-max hover:text-green-700 hover:bg-inherit text-2xl"
            onClick={() => {
              router.push("/");
            }}
          >
            [Go back]
          </div>
        </div> */}

        {!dropToken && (
          <div className="flex justify-center items-center mt-48">
            <div className="loading loading-bars loading-lg text-success"></div>
          </div>
        )}
        {!dropToken && (
          <div className="text-center mt-10">Searching for {token}</div>
        )}
        {dropToken && (
          <>
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

            <div className="m-auto grid md:grid-cols-5 gap-[1px] sm:mx-2">
              {windowWidth > 768 && (
                <div className="md:col-span-1 text-center hidden md:block">
                  <TokenInfo {...tInfo} />
                  <TokenChat {...tChat} />
                </div>
              )}

              <div className="md:col-span-3 font-bold text-2xl text-center">
                <div
                  className="card outline rounded-none outline-gray-200"
                  id="chart"
                >
                  <div className="card-body p-2">
                    <div className="text-left font-bold text-sm">Chart</div>
                    <LightChart {...trade} />
                  </div>
                </div>
                <div
                  className="card outline rounded-none outline-gray-200"
                  id="swap"
                >
                  <div className="card-body font-bold  p-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={
                          "btn w-full " +
                          (data?.state == "buy" && "btn-success")
                        }
                        onClick={() => {
                          setData({ ...data, state: "buy" });
                        }}
                      >
                        Buy
                      </div>
                      <div
                        className={
                          "btn w-full " + (data?.state == "sell" && "btn-error")
                        }
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

                              if (
                                /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(
                                  newValue
                                )
                              ) {
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
                                buyAmount:
                                  (xdcBalance * BigInt(25)) / BigInt(100),
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
                                buyAmount:
                                  (xdcBalance * BigInt(50)) / BigInt(100),
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
                                buyAmount:
                                  (xdcBalance * BigInt(75)) / BigInt(100),
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
                            ? Number(formatEther(xdcBalance))?.toFixed(2)
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
                              if (
                                /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(
                                  newValue
                                )
                              ) {
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
                                sellAmount:
                                  (tokenBalance * BigInt(25)) / BigInt(100),
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
                                sellAmount:
                                  (tokenBalance * BigInt(50)) / BigInt(100),
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
                                sellAmount:
                                  (tokenBalance * BigInt(75)) / BigInt(100),
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
                            ? Number(formatEther(tokenBalance))?.toFixed()
                            : undefined}{" "}
                          {symbol}
                        </div>
                        <WriteButton {...sell} className="btn btn-error" />
                      </>
                    )}
                  </div>
                </div>
              </div>
              {windowWidth > 768 && (
                <div className="md:col-span-1 text-center hidden md:block">
                  <TokenTrade {...tTrade} />
                </div>
              )}
            </div>
          
          </>
        )}
      </>
    )
  );
};

export default Swap;
