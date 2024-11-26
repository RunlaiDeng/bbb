import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContracts,
  useSendTransaction,
  useWatchAsset,
} from "wagmi";
import { contracts, bbbInfo, icecreamswap } from "@/config";
import LightChart from "@/components/LightChart";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import rpc from "@/components/Rpc";
import Link from "next/link";
import { parseEther, formatEther, erc20Abi } from "viem";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
import { track } from "@vercel/analytics";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SendButton from "@/components/SendButton";
import {
  getBBBPrice,
  getDate,
  getFollowing,
  getKline,
  getPool,
  getQuoteFromPool,
  getQuoteFrompoolAddress,
  setFollowing,
} from "@/components/Utils";
import Live from "../Live";
import TokenInfo from "../TokenInfo";

const BBB = (props) => {
  const [mount, setMount] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { watchAsset } = useWatchAsset();
  const { success, info, failure } = useNotification();
  const router = useRouter();
  const { token } = props;

  const chainId = useChainId();
  const bbb = contracts[chainId]?.bbb;
  const [data, setData] = useState({
    state: "buy",
  });

  async function fetchData() {
    setMount(false);
    if (token) {
      const pool = await getPool(token);
      if (pool) {
        const poolInfo = {
          price: pool?.base_token_price_usd || 0,
          priceChange24h: pool?.price_change_percentage?.h24 / 100 || 0,
          cap: pool?.market_cap_usd || 0,
          volumeH24: pool?.volume_usd?.h24,
        };

        // const kline = await getKline(pool?.address);
        const kline = [];

        setData({ ...data, pool, poolInfo, kline: kline?.reverse() });
      }
    }

    setMount(true);
  }
  useEffect(() => {
    fetchData();
  }, [token]);

  const poolAddress = data?.pool?.address;

  const poolCap = data?.poolInfo?.cap;

  useEffect(() => {
    fetchData();
    setMount(true);
  }, []);

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
      {
        ...tokenContract,
        functionName: "allowance",
        args: [address, icecreamswap],
      },
    ],
  });
  const dropToken = reads0?.[0]?.result;
  const tokenBalance = reads0?.[1]?.result || 0n;
  const totalSupply = reads0?.[2]?.result || 0n;
  const allowance = reads0?.[3]?.result;
  const xdcBalance = balance?.value || 0n;
  let name;
  let symbol;
  let imageUrl;
  let description;
  let website;
  let telegram;
  let twitter;
  let coingecko;
  let cmc;
  let index;
  let deployer;
  let createTime;
  if (token == bbb.address) {
    name = bbbInfo.name;
    symbol = bbbInfo.symbol;
    imageUrl = bbbInfo.imageUrl;
    description = bbbInfo.description;
    website = bbbInfo.website;
    telegram = bbbInfo.tg;
    twitter = bbbInfo.x;
    cmc = bbbInfo.cmc;
    index = symbol;
    deployer = bbbInfo.deployer;
    createTime = bbbInfo.createTime;
  } else {
    name = dropToken?.name;
    symbol = dropToken?.symbol;
    imageUrl = dropToken?.imageUrl;
    description = dropToken?.description;
    website = dropToken?.website;
    telegram = dropToken?.telegram;
    twitter = dropToken?.twitter;
    index = dropToken?.index;
    deployer = dropToken?.deployer;
    createTime = getDate(dropToken?.createTime);
  }
  if (poolAddress) {
    coingecko = "https://www.geckoterminal.com/xdc/pools/" + poolAddress;
  }

  const [tokenInfo, setTokenInfo] = useState({});
  const [holders, setHolders] = useState([]);
  const [msg, setMsg] = useState([]);

  const scrollRef = useRef(null);

  async function getData() {
    async function getHolders() {
      const holdersResult = await rpc.getHolders(token);
      if (Array.isArray(holdersResult)) {
        setHolders(holdersResult);
      }
    }
    async function getMsg(chainId, index) {
      const msgResult = await rpc.getMsg(chainId, index);

      if (Array.isArray(msgResult)) {
        setMsg(msgResult.reverse());
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }
    }
    if (chainId && index) {
      // getHolders();
      getMsg(chainId?.toString(), index?.toString());
      setTokenInfo({
        ...tokenInfo,
        sendMsgContent: "",
      });
    }
  }

  const { info: notice } = useNotification();

  useEffect(() => {
    getData();
  }, [chainId, index]);

  const refetch = () => {
    refetch0();
  };

  const trade = {
    trade: data?.kline?.map((item) => {
      return {
        time: item?.[0],
        open: item?.[1],
        high: item?.[2],
        low: item?.[3],
        close: item?.[4],
      };
    }),
  };

  useEffect(() => {
    async function fetchQuote() {
      if (data?.buyAmount) {
        const res = await getQuoteFromPool(
          "0x0000000000000000000000000000000000000000",
          token,
          data?.buyAmount?.toString()
        );

        setData({ ...data, buy: res });
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
      if (data?.sellAmount) {
        const res = await getQuoteFromPool(
          token,
          "0x0000000000000000000000000000000000000000",
          data?.sellAmount?.toString()
        );

        setData({ ...data, sell: res });
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
  sellTx.value = BigInt(sellTx?.value || 0);
  buyTx.value = BigInt(buyTx?.value || 0);

  const buy = {
    buttonName: "Place Trade",
    disabled: !buyTx?.data,
    data: buyTx,
    before: () => {
      track("buy");
    },
    callback: () => {
      refetch();
    },
  };

  const sell = {
    buttonName: "Place Trade",
    disabled: !sellTx?.data,
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
      args: [poolAddress, MAX_UINT256],
    },
    callback: () => {
      refetch();
    },
  };

  let showApprove = true;
  if (allowance && allowance > (data?.sellAmount || 0)) {
    showApprove = false;
  }

  const live = { name, symbol, token, index, isDeployer: deployer == address };

  const isBBB = token == bbbInfo.address;
  const canUpdate = address == deployer && !isBBB;

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
  };
  return (
    mount && (
      <>
        {/* <div className="text-center">
          <div
            className="btn btn-ghost w-max hover:text-green-500 hover:bg-inherit text-2xl"
            onClick={() => {
              router.push("/");
            }}
          >
            [Go back]
          </div>
        </div> */}
        {/* <Live {...live} /> */}
        {!poolAddress && (
          <div className="flex justify-center items-center mt-48">
            <div className="loading loading-bars loading-lg text-success"></div>
          </div>
        )}
        {!poolAddress && (
          <div className="text-center mt-10">Searching for {token}</div>
        )}
        {poolAddress && (
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
            <div className="m-auto grid md:grid-cols-5 sm:mx-2 gap-[1px]">
              <div className="md:col-span-1 text-center  hidden md:block">
                <TokenInfo {...tInfo} />
                <div
                  className="card outline rounded-none outline-gray-200 text-xs font-normal"
                  id="chat"
                >
                  <div className="card-body p-2">
                    <div className="overflow-auto h-96" ref={scrollRef}>
                      {msg?.map((item, index) => {
                        return (
                          <div
                            className="card bg-gray-200 rounded-none my-1"
                            key={index}
                          >
                            <div className="card-body p-1">
                              <div className="flex gap-2 ">
                                <div className="h-4 w-4 overflow-hidden">
                                  <Image
                                    height={400}
                                    width={400}
                                    src={"/bbb.jpg"}
                                    alt={""}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div
                                  className="hover:underline cursor-pointer font-bold"
                                  onClick={() => {
                                    router.push("/dashboard/" + item?.address);
                                  }}
                                >
                                  {item?.address?.substr(36)}
                                </div>{" "}
                                <time className="text-xs opacity-50">
                                  {item?.time}
                                </time>
                              </div>
                              <div className="text-left ">{item?.msg}</div>
                              <div className="flex gap-2">
                                <div
                                  className="cursor-pointer hover:bg-slate-300 rounded-lg flex gap-2 p-1"
                                  onClick={() => {
                                    notice("Coming soon");
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="4261"
                                    width="16"
                                    height="16"
                                  >
                                    <path
                                      d="M797.184 518.496l-284.384 294.016-284.16-292A162.752 162.752 0 0 1 192 417.6C192 328.512 263.808 256 352 256a159.36 159.36 0 0 1 133.28 72.16L512 368.64l26.72-40.48A159.488 159.488 0 0 1 672 256c88.224 0 160 72.512 160 161.6 0 37.536-12.992 74.08-34.816 100.896M672 192a222.72 222.72 0 0 0-160 67.712A222.624 222.624 0 0 0 352 192c-123.52 0-224 101.216-224 225.6 0 52.288 18.176 103.232 52.96 145.536l285.952 293.984a62.4 62.4 0 0 0 45.088 19.168c17.12 0 33.12-6.816 45.12-19.136l287.744-296.064A226.816 226.816 0 0 0 896 417.6C896 293.216 795.52 192 672 192"
                                      fill="#3E3A39"
                                      p-id="4262"
                                    ></path>
                                  </svg>
                                  0
                                </div>
                                <div
                                  className="cursor-pointer hover:bg-slate-300 rounded-lg flex gap-2 p-1"
                                  onClick={() => {
                                    notice("Coming soon");
                                  }}
                                >
                                  <svg
                                    t="1728632576992"
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="5350"
                                    width="16"
                                    height="16"
                                  >
                                    <path
                                      d="M401.807 730.808l68.464-70.68A30 30 0 0 1 491.819 651H742c16.569 0 30-13.431 30-30V297c0-16.569-13.431-30-30-30H282c-16.569 0-30 13.431-30 30v324c0 16.569 13.431 30 30 30h72.1a30 30 0 0 1 28.535 20.739l19.172 59.07zM332.297 711H282c-49.706 0-90-40.294-90-90V297c0-49.706 40.294-90 90-90h460c49.706 0 90 40.294 90 90v324c0 49.706-40.294 90-90 90H504.527l-94.313 97.368c-15.734 16.244-43.102 9.899-50.083-11.611L332.297 711z"
                                      fill="#2c2c2c"
                                      p-id="5351"
                                    ></path>
                                  </svg>
                                  Reply
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <label className="input input-bordered flex items-center gap-2">
                      <input
                        type="text"
                        className="grow"
                        value={tokenInfo?.sendMsgContent}
                        placeholder="Type Here"
                        onChange={(e) => {
                          setTokenInfo({
                            ...tokenInfo,
                            sendMsgContent: e.target.value,
                          });
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter") {
                            setTokenInfo({ ...tokenInfo, sendMsgContent: "" });
                            await rpc.sendMsg(
                              chainId?.toString(),
                              index?.toString(),
                              tokenInfo?.sendMsgContent,
                              address
                            );

                            getData();
                          }
                        }}
                      />
                      <kbd
                        className="kbd kbd-sm cursor-pointer"
                        onClick={async () => {
                          if (tokenInfo?.sendMsgContent) {
                            setTokenInfo({ ...tokenInfo, sendMsgContent: "" });
                            await rpc.sendMsg(
                              chainId?.toString(),
                              index?.toString(),
                              tokenInfo?.sendMsgContent,
                              address
                            );
                            getData();
                          }
                        }}
                      >
                        ↑
                      </kbd>
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 font-bold text-2xl text-center">
                <div
                  className="card outline rounded-none outline-gray-200"
                  id="chart"
                >
                  <div className="card-body p-2">
                    <div className="text-left font-bold text-sm">Chart</div>
                    <div className="h-[400px]">
                      <iframe
                        height="100%"
                        width="100%"
                        id="geckoterminal-embed"
                        title="GeckoTerminal Embed"
                        src={
                          "https://www.geckoterminal.com/xdc/pools/" +
                          poolAddress +
                          "?embed=1&info=0&swaps=0"
                        }
                        frameBorder="0"
                        allow="clipboard-write"
                        allowFullScreen
                      ></iframe>
                    </div>
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
                            value={formatEther(
                              BigInt(data?.buy?.toAmount || 0n)
                            )}
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
                        <div className="text-right text-xs">
                          Avbl :{" "}
                          {xdcBalance >= 0
                            ? Number(formatEther(xdcBalance))?.toFixed(2)
                            : undefined}{" "}
                          {"XDC"}
                        </div>
                        <SendButton className="btn btn-success" {...buy} />
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
                              src={imageUrl}
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
                            value={formatEther(
                              BigInt(data?.sell?.toAmount || 0)
                            )}
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
                            ? Number(
                                formatEther(tokenBalance)
                              )?.toLocaleString()
                            : undefined}{" "}
                          {symbol}
                        </div>
                        {showApprove && (
                          <WriteButton
                            {...approve}
                            className="btn btn-primary"
                          />
                        )}
                        {!showApprove && (
                          <SendButton {...sell} className="btn btn-error" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 text-center  hidden md:block">
                <div
                  className="card outline rounded-none outline-gray-200"
                  id="chart"
                >
                  <div className="card-body p-2">
                    <div className="text-left font-bold text-sm">
                      Market Trades
                    </div>
                    <div className="h-screen">
                      <iframe
                        height="100%"
                        width="100%"
                        id="geckoterminal-embed"
                        title="GeckoTerminal Embed"
                        src={
                          "https://www.geckoterminal.com/xdc/pools/" +
                          poolAddress +
                          "?embed=1&info=0&swaps=1&chart=0"
                        }
                        frameBorder="0"
                        allow="clipboard-write"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="menu menu-horizontal bg-base-200 fixed bottom-0 left-0 w-full z-50 md:hidden font-bold flex justify-between">
              <li>
                <a
                  onClick={() => {
                    const target = document.getElementById("info");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Info
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    const target = document.getElementById("chart");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Chart
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    const target = document.getElementById("swap");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Swap
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    const target = document.getElementById("chat");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Chat
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    const target = document.getElementById("holders");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Holders
                </a>
              </li>
            </ul>
          </>
        )}
      </>
    )
  );
};

export default BBB;
