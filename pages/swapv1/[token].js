import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContracts,
  useWatchAsset,
} from "wagmi";
import { contracts } from "@/config";
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

const Swap = () => {
  const { openConnectModal } = useConnectModal();
  const { watchAsset } = useWatchAsset();
  const { success, info, failure } = useNotification();
  const router = useRouter();
  const { token } = router.query;

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

  const [data, setData] = useState({
    state: "buy",
  });

  const [tokenInfo, setTokenInfo] = useState({});
  const [holders, setHolders] = useState([]);
  const [msg, setMsg] = useState([]);

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
        setMsg(msgResult);
      }
    }
    if (index) {
      // getHolders();
      getMsg(chainId?.toString(), index?.toString());
      setTokenInfo({
        ...tokenInfo,
        name,
        symbol,
        imageUrl,
        description,
        website,
        telegram,
        twitter,
        sendMsgContent: "",
      });
    }
  }

  const { info: notice } = useNotification();

  useEffect(() => {
    getData();
  }, [index, dropToken]);

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

  const update = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "updateToken",
      args: [
        index,
        tokenInfo?.imageUrl,
        tokenInfo?.description,
        tokenInfo?.website,
        tokenInfo?.telegram,
        tokenInfo?.twitter,
      ],
    },
    callback: () => {
      refetch();
      document.getElementById("updateModal").close();
    },
  };

  const imageUpload = {
    image: tokenInfo?.imageUrl,
    callback: (file) => {
      setTokenInfo({ ...tokenInfo, imageUrl: file });
    },
  };

  const following = getFollowing();
  const isFollowed = following?.[index];

  const [followed, setFollowed] = useState(isFollowed);
  return (
    mount && (
      <>
        <div className="text-center">
          <div
            className="btn btn-ghost w-max hover:text-green-500 hover:bg-inherit text-2xl"
            onClick={() => {
              router.push("/");
            }}
          >
            [Go back]
          </div>
        </div>
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
            {" "}
            <div className="card m-auto font-black grid text-xs" id="info">
              <div className="card-body p-2">
                <div className="md:flex gap-4 items-center">
                  <figure className="h-72 w-full md:h-36 md:w-36 overflow-hidden">
                    <Image
                      height={400}
                      width={400}
                      src={handleSrc(imageUrl)}
                      alt={""}
                      className="object-cover w-full h-full"
                    />
                  </figure>
                  <div className="mt-4 sm:mt-0">
                    <div className="text-xl flex gap-2 items-center">
                      {name} (${symbol})
                      {twitter && (
                        <div
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://x.com/" + twitter);
                          }}
                        >
                          <svg
                            height="20"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                          </svg>
                        </div>
                      )}
                      {telegram && (
                        <div
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://t.me/" + telegram);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            width="20"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M21.961 4.33581C21.9448 4.26415 21.9094 4.19792 21.8583 4.14382C21.8072 4.08972 21.7423 4.04967 21.6702 4.02773C21.4074 3.97723 21.1355 3.99594 20.8827 4.08191C20.8827 4.08191 3.35851 10.1941 2.35768 10.8709C2.14268 11.0165 2.07018 11.1014 2.03434 11.2008C1.86101 11.686 2.40018 11.8946 2.40018 11.8946L6.91684 13.3226C6.99321 13.3359 7.07174 13.3315 7.14601 13.3097C8.17268 12.6798 17.4793 6.97509 18.0202 6.78345C18.1035 6.75919 18.1677 6.78345 18.151 6.84409C17.936 7.57588 9.89351 14.508 9.84934 14.5501C9.82783 14.5672 9.81107 14.5892 9.80059 14.6142C9.79011 14.6392 9.78624 14.6664 9.78934 14.6932L9.36768 18.9723C9.36768 18.9723 9.19101 20.3041 10.5635 18.9723C11.5368 18.0271 12.471 17.2443 12.9377 16.8635C14.491 17.9042 16.1618 19.0548 16.8827 19.6572C17.0039 19.7711 17.1476 19.8601 17.3051 19.9189C17.4626 19.9776 17.6307 20.005 17.7993 19.9993C18.007 19.9747 18.2021 19.8894 18.3585 19.7546C18.515 19.6198 18.6254 19.442 18.6752 19.2448C18.6752 19.2448 21.8668 6.77375 21.9735 5.10317C21.9843 4.94145 21.9985 4.83472 22.0002 4.72232C22.0054 4.59235 21.9922 4.46231 21.961 4.33581Z"
                              fill="currenColor"
                            ></path>
                          </svg>
                        </div>
                      )}
                      {website && (
                        <div
                          className="btn btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://" + website);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            height="20"
                            width="20"
                          >
                            <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z"></path>
                            <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z"></path>
                          </svg>
                        </div>
                      )}
                      {address == deployer && (
                        <div
                          className="btn btn-xs btn-success"
                          onClick={() => {
                            document.getElementById("updateModal").showModal();
                          }}
                        >
                          update
                        </div>
                      )}
                      {typeof window !== "undefined" && (
                        <label className="swap btn btn-xs">
                          {/* this hidden checkbox controls the state */}
                          <input
                            type="checkbox"
                            checked={isFollowed}
                            onChange={(e) => {
                              setFollowing(index, e.target.checked);
                              setFollowed(e.target.checked);
                            }}
                          />

                          {/* sun icon */}
                          <div className="swap-off swap-rotate">
                            <svg
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="5573"
                              width="20"
                              height="20"
                            >
                              <path
                                d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9 0.6 45.3l183.7 179.1-43.4 252.9c-1.2 6.9-0.1 14.1 3.2 20.3 8.2 15.6 27.6 21.7 43.2 13.4L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"
                                p-id="5574"
                                fill="#0e932e"
                              ></path>
                            </svg>
                          </div>
                          {/* moon icon */}
                          <div className="swap-on">
                            <svg
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="5267"
                              width="20"
                              height="20"
                            >
                              <path
                                d="M785.352203 933.397493c-4.074805 0-8.151657-0.970094-11.833513-3.007497l-261.311471-142.488225L250.942821 930.388972c-8.343015 4.559852-18.527982 3.8814-26.28669-1.599428-7.760754-5.5279-11.640108-14.987343-10.088776-24.347524l47.578622-285.365306L72.563154 429.470355c-6.594185-6.547113-8.971325-16.295128-6.110161-25.122167 2.814092-8.850575 10.379395-15.397688 19.546172-16.949021l285.512662-47.577598 118.529557-236.989529c4.172019-8.391111 12.803607-13.701047 22.165836-13.701047 9.359158 0 17.992793 5.309936 22.163789 13.701047l118.529557 236.989529 285.511639 47.577598c9.217942 1.551332 16.73208 8.051373 19.593244 16.949021 2.813069 8.875135 0.48607 18.575054-6.109138 25.122167L762.264369 619.077737l47.577598 285.365306c1.50119 9.360182-2.37714 18.819624-10.087753 24.347524C795.487028 931.797042 790.394033 933.397493 785.352203 933.397493z"
                                p-id="5268"
                                fill="#0e932e"
                              ></path>
                            </svg>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="flex gap-1 items-center">
                      <div className="opacity-50">Contract</div>
                      {dropToken?.token?.substr(0, 6) +
                        "..." +
                        dropToken?.token?.substr(36)}{" "}
                      <div
                        className={"cursor-pointer tooltip"}
                        data-tip="Copy Address"
                        onClick={() => {
                          copy(dropToken?.token);
                          success("copy success!");
                        }}
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="1641"
                          width="20"
                          height="20"
                        >
                          <path
                            d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                            fill="#5E6570"
                            p-id="1642"
                          ></path>
                          <path
                            d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                            fill="#5E6570"
                            p-id="1643"
                          ></path>
                          <path
                            d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                            fill="#5E6570"
                            p-id="1644"
                          ></path>
                          <path
                            d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                            fill="#5E6570"
                            p-id="1645"
                          ></path>
                          <path
                            d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                            fill="#5E6570"
                            p-id="1646"
                          ></path>
                        </svg>
                      </div>
                      <div
                        className={"cursor-pointer tooltip"}
                        data-tip="Add To MetaMask"
                        onClick={() => {
                          if (!isConnected) {
                            openConnectModal();
                          } else {
                            watchAsset({
                              type: "ERC20",
                              options: {
                                address: dropToken.token,
                                symbol: dropToken.symbol,
                                decimals: 18,
                                image: dropToken.imageUrl,
                              },
                            });
                          }
                        }}
                      >
                        <Image
                          src="/metamask.jpg"
                          width={20}
                          height={20}
                          alt=""
                        />
                      </div>
                      <div
                        className={"cursor-pointer tooltip"}
                        data-tip="View on XDCScan"
                        onClick={() => {
                          window.open(
                            "https://xdcscan.com/token/" + dropToken.token
                          );
                        }}
                      >
                        <Image src="/xdc.png" width={20} height={20} alt="" />
                      </div>
                    </div>
                    <div className="opacity-50 mt-1 h-20 overflow-auto">
                      {description}
                    </div>

                    <div className="xl:flex gap-2 ">
                      <div>
                        <span className="opacity-50">Price </span>

                        <span>
                          {"$" +
                            (
                              xdcPrice *
                              Number(formatEther(price || 0n)) *
                              2
                            )?.toFixed(6)}
                        </span>
                      </div>

                      <div>
                        <span className="opacity-50">Total Supply </span>

                        <span>
                          {Number(
                            formatEther(totalSupply || 0n)
                          )?.toLocaleString() +
                            " " +
                            dropToken?.symbol}
                        </span>
                      </div>

                      <div>
                        <span className="opacity-50">Cap </span>

                        <span>
                          {"$" +
                            (
                              xdcPrice *
                              Number(
                                formatEther(totalSupply || 0n) *
                                  formatEther(price || 0n) *
                                  2
                              )
                            )?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-50">24H Volume </span>

                        <span>
                          {"$" +
                            (
                              xdcPrice *
                              Number(formatEther(tradeVolume24h || 0n))
                            )?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-50">Token Created </span>

                        <span>
                          {getDate(dropToken?.createTime?.toString())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="m-auto grid md:grid-cols-5 gap-2 sm:mx-2">
              <div className="md:col-span-3 font-black text-2xl text-center">
                <div className="card bg-slate-100" id="chart">
                  <div className="card-body p-2">
                    <div className="text-xs text-left flex items-center gap-2">
                      <div className="h-6 w-6 overflow-hidden">
                        <Image
                          height={400}
                          width={400}
                          src={handleSrc(imageUrl)}
                          alt={""}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      {symbol} / USD
                    </div>

                    <LightChart {...trade} />
                  </div>
                </div>

                <div
                  className="card bg-slate-100 text-xs mt-2 font-normal"
                  id="chat"
                >
                  <div className="card-body p-2">
                    <div className="overflow-auto h-96">
                      {msg?.map((item, index) => {
                        return (
                          <div className="card my-2" key={index}>
                            <div className="card-body p-0">
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
                                  className="hover:underline cursor-pointer font-black"
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
              <div className="md:col-span-2 text-center">
                <div className="card bg-slate-100" id="swap">
                  <div className="card-body font-black  p-2">
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
                <div className="card bg-slate-100 mt-2">
                  <div className="card-body  p-2">
                    <div className="font-black mt-4 text-left">
                      {removed && (
                        <div className="grid grid-cols-2">
                          <div className="text-red-700">Liquidity Moved</div>

                          <Link
                            className="btn btn-success"
                            href={
                              "https://icecreamswap.com/swap?chain=xdc&outputCurrency=" +
                              token +
                              "&inputCurrency=XDC"
                            }
                            target={"_blank"}
                          >
                            Go swap
                          </Link>
                        </div>
                      )}
                      {!removed && (
                        <>
                          <div>
                            <span className="opacity-50">
                              RLD Curve Progress:{" "}
                            </span>

                            <span className="">
                              {"$" +
                                (
                                  xdcPrice *
                                  Number(formatEther(xdcAmount || 0n))
                                )?.toLocaleString()}
                            </span>
                            <span className="opacity-50">
                              (
                              {(
                                (xdcAmount?.toString() * 100) /
                                maxXdc?.toString()
                              )?.toFixed(2)}
                              %)
                            </span>
                          </div>
                          <progress
                            className="progress progress-success w-full"
                            value={xdcAmount?.toString()}
                            max={maxXdc?.toString()}
                          ></progress>

                          <div className="opacity-50 text-xs">
                            When the market cap reaches{" "}
                            <span className="text-green-500">
                              {"$" +
                                (
                                  xdcPrice * formatEther(maxXdc || 0n)
                                )?.toLocaleString()}
                            </span>{" "}
                            all the liquidity from the rld curve will be
                            deposited into icecreaswap and burned. Progression
                            increases as the price goes up. After removing
                            liquidity, the Megadrop Staker is snapshot and
                            receives <span className="text-green-500">2%</span>{" "}
                            of the token supply.
                          </div>
                          <div className="opacity-50 text-xs mt-4">
                            There are{" "}
                            <span className="text-green-500">
                              {(
                                formatEther(
                                  customToFixed(
                                    Math.sqrt(maxXdc?.toString() * 2e25)
                                  )
                                ) - formatEther(totalSupply || 0n)
                              )?.toLocaleString()}{" "}
                              {symbol}
                            </span>{" "}
                            still available for sale in the rld curve and there
                            are{" "}
                            <span className="text-green-500">
                              {Number(
                                formatEther(xdcAmount || 0n)
                              )?.toLocaleString()}{" "}
                              XDC
                            </span>{" "}
                            in the rld curve.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card bg-slate-100 mt-2 break-all" id="holders">
                  <div className="card-body p-2">
                    <div className="font-black text-left ml-4 flex items-center gap-2">
                      Holder distribution{" "}
                      <div
                        className={"cursor-pointer tooltip"}
                        data-tip="View on XDCScan"
                        onClick={() => {
                          window.open(
                            "https://xdcscan.com/token/" +
                              dropToken.token +
                              "#balances"
                          );
                        }}
                      >
                        <Image src="/xdc.png" width={20} height={20} alt="" />
                      </div>
                    </div>
                    {/* <div className="overflow-auto h-96 w-full">
                  <table className="table table-xs">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Account</th>
                        <th>Percent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holders?.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td className="hover:underline cursor-pointer font-black">
                              {item?.address?.substr(36)}
                            </td>

                            <td>{item?.percent?.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div> */}
                  </div>
                </div>
              </div>
            </div>
            <ul className="menu menu-horizontal bg-base-200 fixed bottom-0 left-0 w-full z-50 md:hidden font-black flex justify-between">
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
            <dialog id="updateModal" className="modal font-black">
              <div className="modal-box">
                <div className="grid grid-cols-3">
                  <form method="dialog">
                    <button className="btn">X</button>
                  </form>
                  <h3 className="font-bold text-lg text-center mt-2">
                    Upadate token
                  </h3>
                </div>
                <div className="text-center mt-5">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">
                        Image <span className="text-green-500">*</span>
                      </span>
                    </div>
                    <ImageUpload {...imageUpload} />
                  </label>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">
                        Name <span className="text-green-500">*</span>
                      </span>
                      <span className="text-right">
                        {getBytesLength(tokenInfo?.name)}/20
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full "
                      value={tokenInfo?.name}
                      disabled
                    />
                  </label>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">
                        Symbol <span className="text-green-500">*</span>
                      </span>
                      <span className="text-right">
                        {getBytesLength(tokenInfo?.symbol)}/10
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={tokenInfo?.symbol}
                      disabled
                    />
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">
                        Token Decription{" "}
                        <span className="text-green-500">*</span>
                      </span>
                      <span className="text-right">
                        {getBytesLength(tokenInfo?.description)}/256
                      </span>
                    </div>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      value={tokenInfo?.description}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (getBytesLength(newValue) <= 256) {
                          setTokenInfo({ ...tokenInfo, description: newValue });
                        }
                      }}
                    ></textarea>
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Website</span>
                      <span className="text-right">
                        {getBytesLength(data?.website)}/64
                      </span>
                    </div>
                    <label className="input input-bordered flex items-center gap-2">
                      https://
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.website}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setTokenInfo({ ...tokenInfo, website: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Telegram</span>
                      <span className="text-right">
                        {getBytesLength(data?.telegram)}/64
                      </span>
                    </div>

                    <label className="input input-bordered flex items-center gap-2">
                      https://t.me/
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.telegram}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setTokenInfo({ ...tokenInfo, telegram: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">twitter</span>
                      <span className="text-right">
                        {getBytesLength(data?.twitter)}/64
                      </span>
                    </div>

                    <label className="input input-bordered flex items-center gap-2">
                      https://x.com/
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.twitter}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setTokenInfo({ ...tokenInfo, twitter: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                    Cost
                    <input
                      type="text"
                      className="grow"
                      placeholder={(price || 0n) / BigInt(1e18)}
                      disabled
                    />
                    <div className="font-black">XDC</div>
                  </label>
                </div>
                <div className="mt-1 text-xs">
                  Avbl {balance?.formatted} XDC
                </div>
                {
                  <Link
                    className="underline text-xs"
                    href={buyXDCLink}
                    target="_blank"
                  >
                    XDC is not enough ?
                  </Link>
                }
                <WriteButton
                  {...update}
                  className="btn mt-5 w-full btn-success"
                />
              </div>
            </dialog>
          </>
        )}
      </>
    )
  );
};

export default Swap;
