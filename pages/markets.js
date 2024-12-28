import {
  useReadContracts,
  useChainId,
  useAccount,
  useBalance,
  usePublicClient,
} from "wagmi";
import { bbbInfo, contracts, dexLink } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { buyXDCLink } from "@/config";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseEther, formatEther, decodeEventLog } from "viem";
import rpc from "@/components/Rpc";
import {
  getDate,
  calculatePrice,
  getBytesLength,
  handleSrc,
  calculateSupply,
  calculateXdcAmount,
  getXDCPrice,
  getBBBPrice,
} from "@/components/Utils";
import { useNotification } from "@/components/Context/notice";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Loading from "@/components/Loading";

const Home = () => {
  const chainId = useChainId();

  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address });

  const [marketState, setMarketState] = useState({
    mount: false,
    tokens: {},
    priceItems: {},
    image: "",
  });

  const [formData, setFormData] = useState({
    dName: "",
    dSymbol: "",
    dMaxXdcCap: parseEther("1000000"),
    dMaxSymbolCap: parseEther(calculateSupply("1000000")),
    maxSymbol: "XDC",
    buySymbol: "XDC",
    showOptions: false,
    dDesciption: "",
    dWebiste: "",
    dTelegram: "",
    dTwitter: "",
    dBuy: undefined,
    dBuySymbol: undefined,
    search: "",
  });

  const [type, setType] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("type") || "1" : "1"
  );

  const { mount, tokens, priceItems } = marketState;
  const xdcPrice = priceItems?.xdc?.price;
  const tokenList = tokens?.list;

  const pool = contracts[chainId]?.pool;
  const mbbb = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;

  const { info } = useNotification();

  const xdcPriceChange24h = priceItems?.xdc?.priceChange24h;
  const bbbPrice = priceItems?.bbb?.price;
  const bbbPriceChange24h = priceItems?.bbb?.priceChange24h;
  const bbbCap = priceItems?.bbb?.cap;

  async function fetchData() {
    try {
      let tokensResult = (await rpc.getTokens(
        tokens?.sort,
        tokens?.pageNumber,
        tokens?.size
      )) || { size: 10, pageNumber: tokens?.pageNumber || 1 };

      const [xdc, bbb] = await Promise.all([getXDCPrice(), getBBBPrice()]);

      const newPriceItems = {};
      if (xdc.price !== 0) newPriceItems.xdc = xdc;
      if (bbb.price !== 0) newPriceItems.bbb = bbb;

      setMarketState((prev) => ({
        ...prev,
        tokens: tokensResult,
        priceItems: { ...prev.priceItems, ...newPriceItems },
      }));
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
  }

  useEffect(() => {
    fetchData();
    setMarketState((prev) => ({ ...prev, mount: true }));
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

  const price = reads0?.[0]?.result;
  const latestTradePro = reads0?.[1]?.result;
  const latestDrop = reads0?.[2]?.result;
  const latestKing = reads0?.[3]?.result;
  const dropTokenLength = reads0?.[4].result;

  const latestTrade = latestTradePro?.[0];

  let searchDropTokens = [];

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

  const { data: reads1, refetch: refetch1 } = useReadContracts({
    contracts: searchDropTokens,
    multicallAddress: mutilCall?.address,
  });

  const dropTokens = useMemo(() => {
    return reads1?.map((item) => item?.result);
  }, [reads1]);

  useEffect(() => {
    if (dropTokens?.length > 0 && dropTokens?.[0] == undefined) {
      refetch0();
      refetch1();
    }
  }, [dropTokens]);

  const router = useRouter();

  const pages = [];
  const pageOnChain =
    Math.floor(dropTokenLength?.toString() / tokens?.size) +
    (dropTokenLength?.toString() % tokens?.size > 0 ? 1 : 0);
  for (let i = 1; i <= (tokens?.totalPage || pageOnChain); i++) {
    pages.push(i);
  }

  const showList = dropTokens && xdcPrice;

  return (
    mount && (
      <>
        <div
          className="bg-[url('/bg.png')]  bg-center w-full"
          style={{ backgroundPosition: "center calc(50% - 4rem)" }}
        >
          <div>
            <div className="text-center">
              <div className="text-green-700 text-xs mx-4 sm:text-4xl font-bold">
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
                className="btn btn-success text-white sm:btn-lg mt-8 mx-4 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2"
                onClick={() => {
                  router.push("/launch");
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

            <div className="font-bold text-xs gap-2 flex flex-col md:flex-row items-stretch px-4 whitespace-nowrap ">
              {latestTrade?.index > 0 && (
                <div
                  role="alert"
                  className="alert  border-green-700  bg-transparent border-2 w-full p-2 flex items-center "
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
                  className="alert  border-green-700 bg-transparent border-2 w-full p-2 flex items-center "
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
            {showList && latestKing?.index > 0 && (
              <div className="px-4 w-full m-auto ">
                <div
                  className={
                    "card cursor-pointer hover:outline-4 outline outline-green-700 bg-slate-100 card-side m-auto w-full h-24 rainbow-outline mt-2 "
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
                    <div className=" h-10 font-bold mt-2">
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
            {!showList && <Loading />}
            {showList && (
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
                      setFormData({ ...formData, search: e.target.value });
                    }}
                  />
                </label>

                <div
                  className="btn btn-sm cursor-pointer"
                  onClick={() => {
                    if (formData?.search) {
                      router.push("/swap/" + formData?.search);
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
                          let setSort;

                          if (tokens?.sort == 1) {
                            setSort = 2;
                          }

                          if (tokens?.sort == 2) {
                            setSort = 1;
                          }

                          setMarketState((prev) => ({
                            ...prev,
                            tokens: { ...prev.tokens, sort: setSort },
                          }));
                        }}
                      >
                        Cap{" "}
                        {
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
                        }
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
                      const tokenFromServer = tokenList?.[index];
                      const price = Number(tokenFromServer?.price) / 1e18 || 0;
                      let priceChangeH24 =
                        Number(tokenFromServer?.priceChangeH24) || 0;
                      priceChangeH24 =
                        100 *
                        ((1 + priceChangeH24) * (1 + xdcPriceChange24h) - 1);

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
                            {"$" + (xdcPrice * price * 2)?.toFixed(6)}
                          </td>
                          <td
                            className={
                              "text-right " +
                              (priceChangeH24 >= 0
                                ? "text-green-700"
                                : "text-red-700")
                            }
                          >
                            {priceChangeH24 >= 0 ? "+" : ""}
                            {priceChangeH24?.toFixed(2)}%
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
                    "card cursor-pointer hover:outline-4 hover:outline outline-green-700 bg-slate-100 w-full m-auto sm:m-0 "
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
                      <span className="font-bold">
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
                        "card cursor-pointer hover:outline-4 hover:outline outline-green-700 bg-slate-100 w-full m-auto sm:m-0 "
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
                          <span className="font-bold">
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

            {dropTokens?.length > 0 && (
              <ul className="menu menu-horizontal rounded-box ml-auto menu-xs">
                <li
                  className={tokens.pageNumber == 1 ? "disabled" : ""}
                  key={0}
                  onClick={() => {
                    setMarketState((prev) => ({
                      ...prev,
                      tokens: {
                        ...prev.tokens,
                        pageNumber: prev.tokens.pageNumber - 1,
                      },
                    }));
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
                            setMarketState((prev) => ({
                              ...prev,
                              tokens: { ...prev.tokens, pageNumber: item },
                            }));
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
                    setMarketState((prev) => ({
                      ...prev,
                      tokens: {
                        ...prev.tokens,
                        pageNumber: prev.tokens.pageNumber + 1,
                      },
                    }));
                  }}
                  key={-3}
                >
                  <a style={{ background: "transparent" }}>{">"}</a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </>
    )
  );
};

export default Home;
