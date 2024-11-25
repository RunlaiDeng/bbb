import {
  useReadContracts,
  useChainId,
  useAccount,
  useBalance,
  useWatchContractEvent,
  useClient,
  usePublicClient,
  useConfig,
} from "wagmi";
import { bbbInfo, contracts, dexLink } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { buyXDCLink } from "@/config";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import ImageUpload from "@/components/ImageUpload";
import { parseEther, formatEther, decodeEventLog } from "viem";
import rpc from "@/components/Rpc";
import { track } from "@vercel/analytics";
import {
  formatNumber,
  getDate,
  calculatePrice,
  getFollowing,
  getBytesLength,
  handleSrc,
  calculateSupply,
  calculateXdcAmount,
  sqrtPriceX96ToPrice,
  getXDCPrice,
  getBBBPrice,
} from "@/components/Utils";
import { useNotification } from "@/components/Context/notice";

const Home = () => {
  const chainId = useChainId();

  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address });
  const [show, setShow] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("show") || "2" : "2"
  );

  useEffect(() => {
    localStorage.setItem("show", show);
  }, [show]);

  const [type, setType] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("type") || "2" : "2"
  );

  useEffect(() => {
    localStorage.setItem("type", type);
  }, [type]);
  const following = getFollowing() || {};
  const followList = Object.keys(following).filter((key) => following[key]);

  const [data, setData] = useState({
    dName: "",
    dSymbol: "",
    dMaxXdcCap: parseEther("1000000"),
    dMaxSymbolCap: parseEther(calculateSupply("1000000")),
    maxSymbol: "XDC",
    buySymbol: "XDC",
  });

  const pool = contracts[chainId]?.pool;
  const mbbb = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;

  const [mount, setMount] = useState(false);
  const [tokens, setTokens] = useState({});

  const { info, failure } = useNotification();

  const [priceItems, setPriceItems] = useState({});

  const xdcPrice = priceItems?.xdc?.price;
  const xdcPriceChange24h = priceItems?.xdc?.priceChange24h;
  const bbbPrice = priceItems?.bbb?.price;
  const bbbPriceChange24h = priceItems?.bbb?.priceChange24h;
  const bbbCap = priceItems?.bbb?.cap;

  async function fetchData() {
    let tokensResult = await rpc.getTokens(
      tokens?.sort,
      tokens?.pageNumber,
      tokens?.size
    );
    if (tokensResult == undefined) {
      tokensResult = { size: 10, pageNumber: tokens?.pageNumber || 1 };
    }

    setTokens(tokensResult);
    const setPrice = {};
    const xdc = await getXDCPrice();
    const bbb = await getBBBPrice();
    if (xdc.price != 0) {
      setPrice.xdc = xdc;
    }

    if (bbb.price != 0) {
      setPrice.bbb = bbb;
    }
    setPriceItems({ ...priceItems, ...setPrice });
  }

  const tokenList = tokens?.list;

  useEffect(() => {
    fetchData();
    setMount(true);

    // const interval = setInterval(() => {
    //   fetchData();
    // }, 10000);

    // return () => clearInterval(interval);
  }, [mount, tokens?.pageNumber, tokens?.sort]);

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "deployFee",
        args: [],
      },
      {
        ...mbbb,
        functionName: "getLatestTrade",
        args: [],
      },
      {
        ...mbbb,
        functionName: "getLatestDropToken",
        args: [],
      },
      {
        ...mbbb,
        functionName: "getLatestKing",
        args: [],
      },
      { ...mbbb, functionName: "getDropTokenLength" },
      { ...pool, functionName: "slot0" },
    ],
    multicallAddress: mutilCall?.address,
  });

  const refetch = () => {
    setData({
      ...data,
      dFile: "",
      dName: "",
      dSymbol: "",
      dDesciption: "",
      dWebiste: "",
      dTelegram: "",
      dTwitter: "",
      clean: !data?.clean,
    });
    fetchData();
    refetch0();
    refetch1();
  };

  const price = reads0?.[0]?.result;
  const latestTradePro = reads0?.[1]?.result;
  const latestDrop = reads0?.[2]?.result;
  const latestKing = reads0?.[3]?.result;
  const dropTokenLength = reads0?.[4].result;

  const latestTrade = latestTradePro?.[0];

  let searchDropTokens = [];

  if (show == 1) {
    for (let i = followList.length?.toString() - 1; i >= 0; i--) {
      searchDropTokens.push({
        ...mbbb,
        functionName: "getDropToken",
        args: [followList?.[i]?.toString()],
      });
    }
  }

  if (show == 2) {
    if (tokenList) {
      for (let i = 0; i < tokenList?.length; i++) {
        searchDropTokens.push({
          ...mbbb,
          functionName: "getDropToken",
          args: [tokenList?.[i]?.index?.toString()],
        });
      }
    } else {
      const start =
        dropTokenLength?.toString() - (tokens?.pageNumber - 1) * tokens?.size;
      let stop = start - tokens?.size;
      if (stop < 0) {
        stop = 0;
      }

      for (let i = start; i > stop; i--) {
        searchDropTokens.push({
          ...mbbb,
          functionName: "getDropToken",
          args: [i?.toString()],
        });
      }
    }
  }

  const { data: reads1, refetch: refetch1 } = useReadContracts({
    contracts: searchDropTokens,
    multicallAddress: mutilCall?.address,
  });

  let dropTokens = reads1?.map((item) => item?.result);

  useEffect(() => {
    if (dropTokens?.length > 0 && dropTokens?.[0] == undefined) {
      refetch0();
      refetch1();
    }
  }, [dropTokens]);

  const router = useRouter();

  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const [image, setImage] = useState("");

  const canDrop = data?.dName && data?.dSymbol && image && data?.dDesciption;

  const totalCost = (price || 0n) + (data?.dBuy || 0n);

  const client = usePublicClient();

  const drop = {
    buttonName: "Confirm",
    disabled: !canDrop,
    data: {
      ...mbbb,
      functionName: "drop",
      args: [
        data?.dName,
        data?.dSymbol,
        image,
        data?.dDesciption,
        data?.dWebiste,
        data?.dTelegram,
        data?.dTwitter,
        data?.dMaxXdcCap,
      ],
      value: totalCost,
    },
    before: () => {
      track("laucnh");
    },
    callback: async (confirm, txHash) => {
      if (confirm) {
        const transaction = await client.getTransactionReceipt({
          hash: txHash,
        });
        const log = transaction?.logs?.[1];
        const data = log?.data;
        const topics = log?.topics;
        const result = decodeEventLog({ ...mbbb, data, topics });
        const tokenAddress = result?.args?.token;
        router.push("/swap/" + tokenAddress);
      }
    },
  };

  const bbbIsEnough = false;

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const imageUpload = {
    callback: (file) => {
      setImage(file);
    },
    clean: data?.clean,
  };

  const pages = [];
  const pageOnChain =
    Math.floor(dropTokenLength?.toString() / tokens?.size) +
    (dropTokenLength?.toString() % tokens?.size > 0 ? 1 : 0);
  for (let i = 1; i <= (tokens?.totalPage || pageOnChain); i++) {
    pages.push(i);
  }

  return (
    mount && (
      <>
        <div
          className="bg-[url('/bg.png')]  bg-center w-full"
          style={{ backgroundPosition: "center calc(50% - 4rem)" }}
        >
          <div>
            <div className="text-center">
              <div className="text-green-700 text-xl sm:text-4xl font-black">
                Launch a memecoin that is instantly tradable in one click
                {/* <Image
                  src="/title.png"
                  height={100}
                  width={300}
                  alt=""
                  className="m-auto"
                  style={{ width: "auto", height: "auto" }}
                /> */}
              </div>

              <div
                className="btn btn-success text-white btn-lg mt-8 mx-4 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2"
                onClick={() => {
                  if (!isConnected) {
                    openConnectModal();
                  } else {
                    document.getElementById("dropModal").showModal();
                  }
                }}
              >
                Launch Token {">"}
              </div>
            </div>
          </div>

          <Image
            src="/banner.png"
            height="10"
            width="10000"
            className="w-full h-20"
            alt=""
          />
        </div>

        <div className="card m-auto w-full">
          <div className="card-body p-2">
            <div className="flex gap-2 text-slate-500 ml-4">
              <ul className="menu menu-horizontal bg-base-200 rounded-box">
                <li
                  onClick={() => {
                    setShow(1);
                  }}
                >
                  <a className={show == 1 ? "focus" : ""}>
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="3770"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M480.304762 237.738667l7.582476 7.68c6.826667 6.826667 14.872381 14.677333 24.112762 23.576381l10.50819-10.191238c8.289524-8.045714 15.36-15.067429 21.211429-21.065143a220.891429 220.891429 0 0 1 317.074286 0c86.747429 88.600381 87.576381 231.765333 2.438095 321.365333L512 902.095238 160.768 559.128381c-85.113905-89.624381-84.309333-232.789333 2.438095-321.389714a220.891429 220.891429 0 0 1 317.074286 0z"
                        p-id="3771"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li
                  onClick={() => {
                    setShow(2);
                  }}
                >
                  <a className={show == 2 ? "focus" : ""}>
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="6437"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M370.857143 561.714286l-266.285714 266.285714q-5.714286 5.714286-13.142858 5.714286t-13.142857-5.714286l-28.571428-28.571429q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l224.571428-224.571428L49.714286 324q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l28.571428-28.571429q5.714286-5.714286 13.142857-5.714286t13.142858 5.714286l266.285714 266.285714q5.714286 5.714286 5.714286 13.142858t-5.714286 13.142857z m616.571428 261.142857v36.571428q0 8-5.142857 13.142858t-13.142857 5.142857H420.571429q-8 0-13.142858-5.142857t-5.142857-13.142858v-36.571428q0-8 5.142857-13.142857t13.142858-5.142857h548.571428q8 0 13.142857 5.142857t5.142857 13.142857z"
                        p-id="6438"
                      ></path>
                    </svg>
                  </a>
                </li>
              </ul>

              <div className="ml-auto">
                <ul className="menu menu-horizontal bg-base-200 rounded-box">
                  <li
                    onClick={() => {
                      setType(1);
                    }}
                  >
                    <a className={type == 1 ? "focus" : ""}>
                      <svg
                        t="1729317230835"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="1685"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M107.2 212.8m-67.2 0a4.2 4.2 0 1 0 134.4 0 4.2 4.2 0 1 0-134.4 0Z"
                          p-id="1686"
                        ></path>
                        <path
                          d="M980.8 145.6 297.6 145.6c-9.6 0-16 8-16 16l0 102.4c0 9.6 8 16 16 16l683.2 0c9.6 0 16-8 16-16l0-102.4C996.8 152 988.8 145.6 980.8 145.6z"
                          p-id="1687"
                        ></path>
                        <path
                          d="M96 497.6m-67.2 0a4.2 4.2 0 1 0 134.4 0 4.2 4.2 0 1 0-134.4 0Z"
                          p-id="1688"
                        ></path>
                        <path
                          d="M968 430.4 284.8 430.4c-9.6 0-16 8-16 16l0 102.4c0 9.6 8 16 16 16l683.2 0c9.6 0 16-8 16-16l0-102.4C984 438.4 977.6 430.4 968 430.4z"
                          p-id="1689"
                        ></path>
                        <path
                          d="M96 795.2m-67.2 0a4.2 4.2 0 1 0 134.4 0 4.2 4.2 0 1 0-134.4 0Z"
                          p-id="1690"
                        ></path>
                        <path
                          d="M968 728 284.8 728c-9.6 0-16 8-16 16l0 102.4c0 9.6 8 16 16 16l683.2 0c9.6 0 16-8 16-16l0-102.4C984 736 977.6 728 968 728z"
                          p-id="1691"
                        ></path>
                      </svg>
                    </a>
                  </li>
                  <li
                    onClick={() => {
                      setType(2);
                    }}
                  >
                    <a className={type == 2 ? "focus" : ""}>
                      <svg
                        t="1729317279715"
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="3949"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M426.666667 170.666667 426.666667 341.333333 597.333333 341.333333 597.333333 170.666667 426.666667 170.666667M682.666667 170.666667 682.666667 341.333333 853.333333 341.333333 853.333333 170.666667 682.666667 170.666667M682.666667 426.666667 682.666667 597.333333 853.333333 597.333333 853.333333 426.666667 682.666667 426.666667M682.666667 682.666667 682.666667 853.333333 853.333333 853.333333 853.333333 682.666667 682.666667 682.666667M597.333333 853.333333 597.333333 682.666667 426.666667 682.666667 426.666667 853.333333 597.333333 853.333333M341.333333 853.333333 341.333333 682.666667 170.666667 682.666667 170.666667 853.333333 341.333333 853.333333M341.333333 597.333333 341.333333 426.666667 170.666667 426.666667 170.666667 597.333333 341.333333 597.333333M341.333333 341.333333 341.333333 170.666667 170.666667 170.666667 170.666667 341.333333 341.333333 341.333333M426.666667 597.333333 597.333333 597.333333 597.333333 426.666667 426.666667 426.666667 426.666667 597.333333M170.666667 85.333333 853.333333 85.333333C900.266667 85.333333 938.666667 123.733333 938.666667 170.666667L938.666667 853.333333C938.666667 900.266667 900.266667 938.666667 853.333333 938.666667L170.666667 938.666667C124.586667 938.666667 85.333333 900.266667 85.333333 853.333333L85.333333 170.666667C85.333333 123.733333 123.733333 85.333333 170.666667 85.333333Z"
                          p-id="3950"
                        ></path>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
     
            <div className="font-black text-xs gap-2 flex flex-col md:flex-row items-stretch px-4 whitespace-nowrap ">
              {latestTrade?.index > 0 && (
                <div
                  role="alert"
                  className="alert  border-green-500  bg-transparent border-2 w-full p-2 flex items-center rounded-none"
                >
                  <span className="flex gap-2 items-center overflow-auto">
                    <Image height={16} width={16} src="/bbb.jpg" alt={""} />
                    <span
                      className="hover:underline cursor-pointer"
                      onClick={() => {
                        router.push("/dashboard/" + latestTrade?.account);
                      }}
                    >
                      {latestTrade?.account?.substr(36)}
                    </span>{" "}
                    {latestTrade?.tradeType === "buy" && "bought"}
                    {latestTrade?.tradeType === "sell" && "sold"}{" "}
                    {(latestTrade?.xdcAmount?.toString() / 1e18)?.toFixed(2)}{" "}
                    XDC of{" "}
                    <div
                      className="hover:underline cursor-pointer"
                      onClick={() => {
                        router.push("/swap/" + latestTrade?.token);
                      }}
                    >
                      {latestTradePro?.[1]}
                    </div>
                    <div className="h-4 w-4 overflow-hidden">
                      <Image
                        height={400}
                        width={400}
                        src={latestTradePro?.[3]}
                        alt={""}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </span>
                </div>
              )}
              {latestDrop?.index > 0 && (
                <div
                  role="alert"
                  className="alert  border-green-500 bg-transparent border-2 w-full p-2 flex items-center rounded-none"
                >
                  <span className="flex gap-2 items-center overflow-auto">
                    <Image height={16} width={16} src="/bbb.jpg" alt={""} />
                    <span
                      className="hover:underline cursor-pointer"
                      onClick={() => {
                        router.push("/dashboard/" + latestDrop?.deployer);
                      }}
                    >
                      {latestDrop?.deployer?.substr(36)}
                    </span>{" "}
                    created
                    <div
                      className="hover:underline cursor-pointer"
                      onClick={() => {
                        router.push("/swap/" + latestDrop?.token);
                      }}
                    >
                      {latestDrop?.symbol}
                    </div>
                    <div className="h-4 w-4 overflow-hidden">
                      <Image
                        height={400}
                        width={400}
                        src={latestDrop?.imageUrl}
                        alt={""}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    on {getDate(latestDrop?.createTime?.toString())}
                  </span>
                </div>
              )}
            </div>
            {latestKing?.index > 0 && (
              <div className="px-4 w-full m-auto ">
                <div
                  className={
                    "card cursor-pointer hover:outline-4 outline outline-green-500 bg-slate-100 card-side m-auto w-full h-24 rainbow-outline mt-2 rounded-none"
                  }
                  onClick={() => {
                    router.push("/swap/" + latestKing?.token);
                  }}
                >
                  <figure className="w-24 overflow-hidden">
                    <Image
                      height={400}
                      width={400}
                      src={
                        latestKing?.imageUrl
                          ? latestKing?.imageUrl
                          : "/didntupload.png"
                      }
                      alt={latestKing?.name}
                      className="object-cover w-full h-full"
                    />
                  </figure>

                  <div className="card-body text-xs p-2 whitespace-nowrap   overflow-x-auto">
                    <div className="flex gap-2">
                      <div className="opacity-50">Created</div>

                      <span
                        className="hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/dashboard/" + latestKing?.deployer);
                        }}
                      >
                        {latestKing?.deployer?.substr(36)}
                      </span>
                      <span>{getDate(latestKing?.createTime?.toString())}</span>
                    </div>
                    <div className=" h-10 font-black mt-2">
                      {latestKing?.name} (${latestKing?.symbol})
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="opacity-50">Cap</span>
                      <span>
                        $
                        {(
                          (2 * xdcPrice * latestKing?.xdcAmount?.toString()) /
                          1e18
                        )?.toLocaleString()}
                      </span>
                      <div className="opacity-50">
                        (
                        {(
                          (100 * latestKing?.xdcAmount?.toString()) /
                          latestKing?.maxXdc?.toString()
                        )?.toFixed(2)}
                        %)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!dropTokens && (
              <div className="flex justify-center items-center mt-48">
                <div className="loading loading-bars loading-lg text-success"></div>
              </div>
            )}
            {dropTokens && (
              <div className="p-4 flex items-center gap-2">
                <label className=" w-full flex items-center input input-bordered gap-2 input-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="text"
                    className="w-full"
                    placeholder="0x or bbb"
                    onChange={(e) => {
                      setData({ ...data, search: e.target.value });
                    }}
                  />
                </label>

                <div
                  className="btn btn-sm cursor-pointer"
                  onClick={() => {
                    if (data?.search) {
                      router.push("/swap/" + data?.search);
                    } else {
                      info("please submit token address");
                    }
                  }}
                >
                  Search
                </div>
              </div>
            )}

            {type == 1 && dropTokens && (
              <div className="overflow-x-auto">
                <table className="table">
                  {/* head */}
                  <thead>
                    <tr>
                      <th className="w-4/8">Coin</th>
                      <th className="w-1/8 text-right">Price</th>
                      <th className="w-1/8 text-right">24H Change</th>
                      {/* <th className="w-1/8 text-right">24h Volume</th> */}
                      <th
                        className="cursor-pointer flex items-center w-1/8 justify-end"
                        onClick={() => {
                          if (show == 2) {
                            let setSort;
                            if (!tokens?.sort) {
                              setSort = 1;
                            }
                            if (tokens?.sort == 1) {
                              setSort = 2;
                            }

                            if (tokens?.sort == 2) {
                              setSort = undefined;
                            }

                            setTokens({ ...tokens, sort: setSort });
                          }
                        }}
                      >
                        Cap{" "}
                        {show == 2 && (
                          <div>
                            <svg
                              viewBox="0 -450 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="9979"
                              width="8"
                              height="8"
                            >
                              <path
                                d="M804.571429 402.285714q0 14.857143-10.857143 25.714286t-25.714286 10.857143H256q-14.857143 0-25.714286-10.857143t-10.857143-25.714286 10.857143-25.714285l256-256q10.857143-10.857143 25.714286-10.857143t25.714286 10.857143l256 256q10.857143 10.857143 10.857143 25.714285z"
                                p-id="9980"
                                fill={tokens?.sort == 2 ? "#0e932e" : ""}
                              ></path>
                            </svg>
                            <svg
                              viewBox="0 450 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="11004"
                              width="8"
                              height="8"
                            >
                              <path
                                d="M804.571429 621.714286q0 14.857143-10.857143 25.714286l-256 256q-10.857143 10.857143-25.714286 10.857143t-25.714286-10.857143l-256-256q-10.857143-10.857143-10.857143-25.714286t10.857143-25.714286 25.714286-10.857143l512 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z"
                                p-id="11005"
                                fill={tokens?.sort == 1 ? "#0e932e" : ""}
                              ></path>
                            </svg>
                          </div>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={"cursor-pointer hover "}
                      onClick={() => {
                        router.push(dexLink);
                      }}
                    >
                      <td className="flex gap-2 items-center">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                          <Image
                            height={400}
                            width={400}
                            src={"/bbb.jpg"}
                            alt={""}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="sm:flex gap-2 items-center ">
                          <div className="">BBB</div>
                          <div className="opacity-50 text-xs whitespace-nowrap">
                            Beny Bad Boy
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        ${Number(bbbPrice)?.toFixed(6)}
                      </td>
                      {/* <td className="text-right">-</td> */}
                      <td
                        className={
                          "text-right " +
                          (bbbPriceChange24h >= 0
                            ? "text-green-700"
                            : "text-red-700")
                        }
                      >
                        {bbbPriceChange24h >= 0 ? "+" : "-"}
                        {Math.abs(bbbPriceChange24h * 100)?.toFixed(2)}%
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end items-center">
                          <div>${Number(bbbCap)?.toLocaleString()}</div>
                          <div className="opacity-50"> (100.00%)</div>
                        </div>
                      </td>
                    </tr>

                    {dropTokens?.map((item, index) => {
                      const cap = item?.xdcAmount?.toString();
                      const percent = (100 * cap) / item?.maxXdc?.toString();
                      let volume24h =
                        "$" +
                        formatNumber(
                          xdcPrice *
                            formatEther(tokenList?.[index]?.volume24 || 0)
                        );
                      let priceChange24h = (
                        ((1 + Number(xdcPriceChange24h || 0)) *
                          (1 +
                            Number(tokenList?.[index]?.priceChange24h || 0)) -
                          1) *
                        100
                      )?.toFixed(2);

                      if (tokenList?.[index]?.volume24 == undefined) {
                        volume24h = "-";
                      }
                      if (tokenList?.[index]?.priceChange24h == undefined) {
                        priceChange24h = "-";
                      }
                      return (
                        <tr
                          key={item?.index}
                          className={"cursor-pointer hover"}
                          onClick={() => {
                            router.push("/swap/" + item?.token);
                          }}
                        >
                          <td className="flex gap-2 items-center">
                            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                              <Image
                                height={400}
                                width={400}
                                src={handleSrc(item?.imageUrl)}
                                alt={item?.name}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            <div className="sm:flex gap-2 items-center ">
                              <div className="">{item?.symbol}</div>
                              <div className="opacity-50 text-xs whitespace-nowrap">
                                {item?.name}
                              </div>
                            </div>
                          </td>
                          <td className="text-right">
                            {"$" + (xdcPrice * calculatePrice(cap))?.toFixed(6)}
                          </td>
                          <td
                            className={
                              "text-right " +
                              (priceChange24h != "-" &&
                                (priceChange24h >= 0
                                  ? "text-green-700"
                                  : "text-red-700"))
                            }
                          >
                            {priceChange24h >= 0 ? "+" : "-"}
                            {Math.abs(priceChange24h)}%
                          </td>
                          {/* <td className="text-right">{volume24h}</td> */}
                          <td>
                            <div className="flex gap-2 justify-end items-center">
                              <div className="whitespace-nowrap">
                                {"$" +
                                  (
                                    (2 * (xdcPrice * cap)) /
                                    1e18
                                  )?.toLocaleString()}{" "}
                              </div>
                              <div className="opacity-50">
                                ({percent?.toFixed(2)}%)
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {type == 2 && dropTokens && (
              <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 overflow-auto p-4">
                <div
                  className={
                    "card cursor-pointer hover:outline-4 hover:outline outline-green-500 bg-slate-100 w-full m-auto sm:m-0 "
                  }
                  onClick={() => {
                    router.push(dexLink);
                  }}
                >
                  <figure className="overflow-hidden h-80 sm:h-72">
                    <Image
                      height={400}
                      width={400}
                      src={"/bbb.jpg"}
                      alt={""}
                      className="object-cover w-full h-full"
                    />
                  </figure>
                  <div className="card-body text-xs p-2">
                    <div className="flex gap-2">
                      <div className="opacity-50">Created</div>

                      <span
                        className="hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/dashboard/" + bbbInfo.deployer);
                        }}
                      >
                        {bbbInfo.deployer?.substr(36)}
                      </span>
                      <span>{bbbInfo.createTime}</span>
                    </div>
                    <div className="overflow-auto w-full h-20">
                      <span className="font-black">
                        {bbbInfo.name} (${bbbInfo.symbol}){" "}
                      </span>

                      <span className="opacity-50">{bbbInfo.description}</span>
                    </div>

                    <div className="flex gap-1 items-center">
                      <div className="opacity-50">Price</div>
                      <div className="">
                        ${Number(bbbPrice)?.toFixed(6)} XDC
                      </div>
                    </div>

                    <div className="flex gap-1 items-center">
                      <div className="opacity-50">Cap </div>
                      <div className="">
                        ${Number(bbbCap)?.toLocaleString()} (100.00%)
                      </div>
                    </div>

                    <progress
                      className="progress progress-success w-full"
                      value={100}
                      max="100"
                    ></progress>
                  </div>
                </div>
                {dropTokens?.map((item, index) => {
                  const xdcAmount = item?.xdcAmount;
                  const percent =
                    (100 * xdcAmount?.toString()) / item?.maxXdc?.toString();
                  const cap = xdcAmount?.toString();
                  return (
                    <div
                      className={
                        "card cursor-pointer hover:outline-4 hover:outline outline-green-500 bg-slate-100 w-full m-auto sm:m-0 "
                      }
                      onClick={() => {
                        router.push("/swap/" + item?.token);
                      }}
                      key={item?.index}
                    >
                      <figure className="overflow-hidden h-80 sm:h-72">
                        <Image
                          height={400}
                          width={400}
                          src={handleSrc(item?.imageUrl)}
                          alt={item?.name}
                          className="object-cover w-full h-full"
                        />
                      </figure>
                      <div className="card-body text-xs p-2">
                        <div className="flex gap-2">
                          <div className="opacity-50">Created</div>

                          <span
                            className="hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/dashboard/" + item?.deployer);
                            }}
                          >
                            {item?.deployer?.substr(36)}
                          </span>
                          <span>{getDate(item?.createTime?.toString())}</span>
                        </div>
                        <div className="overflow-auto w-full h-20">
                          <span className="font-black">
                            {item?.name} (${item?.symbol}){" "}
                          </span>

                          <span className="opacity-50">
                            {item?.description}
                          </span>
                        </div>

                        <div className="flex gap-1 items-center">
                          <div className="opacity-50">Price</div>
                          <div className="">
                            ${(xdcPrice * calculatePrice(cap))?.toFixed(6)}
                          </div>
                        </div>

                        <div className="flex gap-1 items-center">
                          <div className="opacity-50">Cap </div>
                          <div className="">
                            {"$" +
                              ((2 * xdcPrice * cap) / 1e18)?.toLocaleString()}
                            ({percent?.toFixed(2)}%)
                          </div>
                        </div>

                        <progress
                          className="progress progress-success w-full"
                          value={percent}
                          max="100"
                        ></progress>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dropTokens?.length > 0 && show == 2 && (
              <ul className="menu menu-horizontal rounded-box ml-auto menu-xs">
                <li
                  className={tokens.pageNumber == 1 ? "disabled" : ""}
                  key={0}
                  onClick={() => {
                    setTokens({ ...tokens, pageNumber: tokens.pageNumber - 1 });
                  }}
                >
                  <a style={{ background: "transparent" }}>{"<"}</a>
                </li>

                {pages?.map((item, index) => {
                  let showPageItems = false;
                  if (item == 1 || item == tokens.totalPage) {
                    showPageItems = true;
                  }
                  const pageDiff = Math.abs(tokens.pageNumber - item);
                  if (pageDiff <= 2) {
                    showPageItems = true;
                  }

                  let showPassFront = false;

                  if (item == 1 && tokens.pageNumber >= 5) {
                    showPassFront = true;
                  }

                  let showPassBack = false;

                  if (
                    item == tokens?.totalPage &&
                    tokens.totalPage - tokens.pageNumber >= 4
                  ) {
                    showPassBack = true;
                  }

                  return (
                    <div key={item} className="flex items-center">
                      {showPassBack && (
                        <li className="disabled" key={-1}>
                          <a style={{ background: "transparent" }}>...</a>
                        </li>
                      )}

                      {showPageItems && (
                        <li
                          onClick={() => {
                            setTokens({ ...tokens, pageNumber: item });
                          }}
                        >
                          <a
                            className={
                              item == tokens?.pageNumber
                                ? "focus font-bold"
                                : ""
                            }
                          >
                            {item}
                          </a>
                        </li>
                      )}
                      {showPassFront && (
                        <li className="disabled" key={-1}>
                          <a style={{ background: "transparent" }}>...</a>
                        </li>
                      )}
                    </div>
                  );
                })}

                <li
                  className={
                    tokens.pageNumber == tokens.totalPage ? "disabled" : ""
                  }
                  onClick={() => {
                    setTokens({ ...tokens, pageNumber: tokens.pageNumber + 1 });
                  }}
                  key={-3}
                >
                  <a style={{ background: "transparent" }}>{">"}</a>
                </li>
              </ul>
            )}
          </div>
        </div>

        <dialog id="dropModal" className="modal font-black text-xs">
          <div className="modal-box">
            <div className="grid grid-cols-3">
              <form method="dialog">
                <button className="btn">X</button>
              </form>
              <h3 className="font-bold label-text text-center mt-2">
                Launch token
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
                    {getBytesLength(data?.dName)}/20
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full "
                  value={data?.dName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 20) {
                      setData({ ...data, dName: newValue });
                    }
                  }}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    Symbol <span className="text-green-500">*</span>
                  </span>
                  <span className="text-right">
                    {getBytesLength(data?.dSymbol)}/10
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={data?.dSymbol}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 10) {
                      let change = { dSymbol: newValue };
                      if (data?.maxSymbol != "XDC") {
                        change = { ...change, maxSymbol: newValue };
                      }
                      if (data?.buySymbol != "XDC") {
                        change = { ...change, buySymbol: newValue };
                      }

                      setData({
                        ...data,
                        ...change,
                      });
                    }
                  }}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Token Decription <span className="text-green-500">*</span>
                  </span>
                  <span className="text-right">
                    {getBytesLength(data?.dDesciption)}/256
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-20"
                  value={data?.dDesciption}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 256) {
                      setData({ ...data, dDesciption: newValue });
                    }
                  }}
                ></textarea>
              </label>

              <div className="collapse">
                <input
                  type="checkbox"
                  value={data?.showOptions}
                  onClick={(e) => {
                    setData({
                      ...data,
                      showOptions: e.target.checked,
                    });
                  }}
                />
                <div className="collapse-title text-left pl-0 text-green-500">
                  Show more options {data?.showOptions ? "↑" : "↓"}
                </div>
                <div className="collapse-content p-0 w-72 sm:w-full">
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Website</span>
                      <span className="text-right">
                        {getBytesLength(data?.dWebiste)}/64
                      </span>
                    </div>
                    <label className="input input-bordered flex items-center gap-2 ">
                      https://
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.dWebiste}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setData({ ...data, dWebiste: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Telegram</span>
                      <span className="text-right">
                        {getBytesLength(data?.dTelegram)}/64
                      </span>
                    </div>
                    <label className="input input-bordered flex items-center gap-2">
                      https://t.me/
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.dTelegram}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setData({ ...data, dTelegram: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Twitter</span>
                      <span className="text-right">
                        {getBytesLength(data?.dTwitter)}/64
                      </span>
                    </div>

                    <label className="input input-bordered flex items-center gap-2">
                      https://x.com/
                      <input
                        type="text"
                        className="grow"
                        placeholder="Optional"
                        value={data?.dTwitter}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (getBytesLength(newValue) <= 64) {
                            setData({ ...data, dTwitter: newValue });
                          }
                        }}
                      />
                    </label>
                  </label>
                  <div className="flex items-center mt-2">
                    Max Curve(minimum 1m xdc)
                    <div
                      className="btn btn-xs ml-auto"
                      onClick={() => {
                        if (data.maxSymbol == "XDC") {
                          setData({ ...data, maxSymbol: data?.dSymbol });
                        } else {
                          setData({ ...data, maxSymbol: "XDC" });
                        }
                      }}
                    >
                      switch to{" "}
                      {data?.maxSymbol == "XDC" ? data?.dSymbol : "XDC"}
                    </div>
                  </div>

                  {data?.maxSymbol == "XDC" && (
                    <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          data?.dMaxXdcCap >= 0
                            ? formatEther(data?.dMaxXdcCap)
                            : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              dMaxXdcCap: undefined,
                              dMaxSymbolCap: undefined,
                            });
                          }
                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              dMaxXdcCap: parseEther(newValue),
                              dMaxSymbolCap: parseEther(
                                calculateSupply(newValue)
                              ),
                            });
                          }
                        }}
                      />
                      <div className="font-black">XDC</div>
                    </label>
                  )}
                  {data?.dSymbol == data?.maxSymbol && (
                    <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          data?.dMaxSymbolCap >= 0
                            ? formatEther(data?.dMaxSymbolCap)
                            : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              dMaxXdcCap: undefined,
                              dMaxSymbolCap: undefined,
                            });
                          }
                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              dMaxXdcCap: parseEther(
                                calculateXdcAmount(newValue)
                              ),
                              dMaxSymbolCap: parseEther(newValue),
                            });
                          }
                        }}
                      />
                      <div className="font-black">{data?.dSymbol}</div>
                    </label>
                  )}

                  <div className="flex items-center mt-2">
                    How many you want buy
                    <div
                      className="btn btn-xs ml-auto"
                      onClick={() => {
                        if (data.buySymbol == "XDC") {
                          setData({ ...data, buySymbol: data?.dSymbol });
                        } else {
                          setData({ ...data, buySymbol: "XDC" });
                        }
                      }}
                    >
                      switch to{" "}
                      {data?.buySymbol == "XDC" ? data?.dSymbol : "XDC"}
                    </div>
                  </div>
                  {data?.buySymbol == "XDC" && (
                    <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          data?.dBuy >= 0 ? formatEther(data?.dBuy) : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              dBuy: undefined,
                              dBuySymbol: undefined,
                            });
                          }

                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              dBuySymbol: parseEther(calculateSupply(newValue)),
                              dBuy: parseEther(newValue),
                            });
                          }
                        }}
                      />
                      <div className="font-black">XDC</div>
                    </label>
                  )}
                  {data?.buySymbol == data?.dSymbol && (
                    <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          data?.dBuySymbol >= 0
                            ? formatEther(data?.dBuySymbol)
                            : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              dBuy: undefined,
                              dBuySymbol: undefined,
                            });
                          }

                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              dBuySymbol: parseEther(newValue),
                              dBuy: parseEther(calculateXdcAmount(newValue)),
                            });
                          }
                        }}
                      />
                      <div className="font-black">{data?.dSymbol}</div>
                    </label>
                  )}
                </div>
              </div>

              {/* <div className="text-left text-xs text-slate-500">
                Cost <span className="text-xl text-black">FREE</span>{" "}
                <span className="line-through text-slate-500">100</span>{" "}
                <span className="text-green-500">100% OFF</span>{" XDC"}
              </div> */}
              <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                Cost
                <input
                  type="text"
                  className="grow"
                  placeholder={formatEther(totalCost || 0) + " XDC"}
                  disabled
                />
                {/* <div className="text-green-500">Free</div> */}
              </label>
            </div>
            <div className="mt-1 text-xs">
              Available {balance?.formatted} XDC
            </div>
            {!bbbIsEnough && (
              <Link
                className="underline text-xs"
                href={buyXDCLink}
                target="_blank"
              >
                XDC is not enough ?
              </Link>
            )}
            {!canDrop && (
              <div className="text-red-700">
                image, name, symbol, token description are required
              </div>
            )}

            <WriteButton {...drop} className="btn w-full btn-success" />
          </div>
        </dialog>
      </>
    )
  );
};

export default Home;
