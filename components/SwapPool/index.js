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
import TokenChat from "../TokenChat";
import TokenTrade from "../TokenTrade";

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

  const tChat = {
    chainId,
    index,
    address,
  };
  const tTrade = {
    poolAddress,
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
                <TokenChat {...tChat} />
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
                <TokenTrade {...tTrade} />
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
