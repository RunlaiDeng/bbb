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
        <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 p-8 rounded-2xl shadow-xl m-4 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center">
            <div className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
              Launch a memecoin that is instantly tradable in one click
            </div>

            <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
              🚀 Create your own token and start trading immediately
            </div>

            <button
              className="btn bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg transform hover:-translate-y-1"
              onClick={() => {
                router.push("/launch");
              }}
            >
              Launch Token {">"}
            </button>
          </div>
        </div>

        <div className="card ">
          <div className="card-body p-0">
            <div className="font-bold text-xs gap-2 flex flex-col md:flex-row items-stretch  whitespace-nowrap ">
              {latestTrade?.index > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <div className="card bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-green-100">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Latest Trade
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Image
                          height={16}
                          width={16}
                          src="/bbb.jpg"
                          alt={""}
                          className="rounded-full"
                        />
                        <span
                          className="hover:text-green-600 cursor-pointer transition-colors"
                          onClick={() => {
                            router.push("/dashboard/" + latestTrade?.account);
                          }}
                        >
                          {latestTrade?.account?.substr(36)}
                        </span>
                        <span
                          className={
                            latestTrade?.tradeType === "buy"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {latestTrade?.tradeType === "buy" ? "bought" : "sold"}
                        </span>
                        <span className="font-medium">
                          {(latestTrade?.xdcAmount?.toString() / 1e18)?.toFixed(
                            2
                          )}{" "}
                          XDC
                        </span>
                        <span>of</span>
                        <div
                          className="hover:text-green-600 cursor-pointer transition-colors flex items-center gap-1"
                          onClick={() => {
                            router.push("/swap/" + latestTrade?.token);
                          }}
                        >
                          {latestTradePro?.[1]}
                          <div className="h-4 w-4 overflow-hidden">
                            <Image
                              height={400}
                              width={400}
                              src={latestTradePro?.[3]}
                              alt={""}
                              className="object-cover w-full h-full rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {latestDrop?.index > 0 && (
                    <div className="card bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-green-100">
                      <div className="card-body p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Latest Creation
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Image
                            height={16}
                            width={16}
                            src="/bbb.jpg"
                            alt={""}
                            className="rounded-full"
                          />
                          <span
                            className="hover:text-green-600 cursor-pointer transition-colors"
                            onClick={() => {
                              router.push("/dashboard/" + latestDrop?.deployer);
                            }}
                          >
                            {latestDrop?.deployer?.substr(36)}
                          </span>
                          <span>created</span>
                          <div
                            className="hover:text-green-600 cursor-pointer transition-colors flex items-center gap-1"
                            onClick={() => {
                              router.push("/swap/" + latestDrop?.token);
                            }}
                          >
                            {latestDrop?.symbol}
                            <div className="h-4 w-4 overflow-hidden">
                              <Image
                                height={400}
                                width={400}
                                src={latestDrop?.imageUrl}
                                alt={""}
                                className="object-cover w-full h-full rounded-full"
                              />
                            </div>
                          </div>
                          <span>
                            on {getDate(latestDrop?.createTime?.toString())}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showList && latestKing?.index > 0 && (
                    <div
                      className="card bg-white cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-green-100"
                      onClick={() => {
                        router.push("/swap/" + latestKing?.token);
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Market King
                          </h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 overflow-hidden rounded">
                              <Image
                                height={40}
                                width={40}
                                src={
                                  latestKing?.imageUrl
                                    ? latestKing?.imageUrl
                                    : "/didntupload.png"
                                }
                                alt={latestKing?.name}
                                className="object-cover w-10 h-10"
                              />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {latestKing?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${latestKing?.symbol}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-500">Market Cap</span>
                              <span className="font-medium">
                                $
                                {(
                                  (2 *
                                    xdcPrice *
                                    latestKing?.xdcAmount?.toString()) /
                                  1e18
                                )?.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{
                                  width: `${(
                                    (100 * latestKing?.xdcAmount?.toString()) /
                                    latestKing?.maxXdc?.toString()
                                  )?.toFixed(2)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <label className="w-full flex items-center input input-bordered gap-2 input-sm bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-green-500 transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 text-gray-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="text"
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Search by address or token symbol"
                    onChange={(e) => {
                      setFormData({ ...formData, search: e.target.value });
                    }}
                  />
                </label>

                <button
                  className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl"
                  onClick={() => {
                    if (formData?.search) {
                      router.push("/swap/" + formData?.search);
                    } else {
                      info("Please enter a token address or symbol");
                    }
                  }}
                >
                  Search
                </button>
              </div>
            </div>
            {!showList && <Loading />}
            {showList && (
              <>
                <div className="overflow-x-auto p-4">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-4/8 text-gray-600 font-semibold p-4">
                          Coin
                        </th>
                        <th className="w-1/8 text-right text-gray-600 font-semibold p-4">
                          Price
                        </th>
                        <th className="w-1/8 text-right text-gray-600 font-semibold p-4">
                          24H Change
                        </th>
                        <th
                          className="cursor-pointer flex items-center w-1/8 justify-end text-gray-600 font-semibold p-4"
                          onClick={() => {
                            let setSort = tokens?.sort == 1 ? 2 : 1;
                            setMarketState((prev) => ({
                              ...prev,
                              tokens: { ...prev.tokens, sort: setSort },
                            }));
                          }}
                        >
                          Market Cap{" "}
                          <div className="ml-1">
                            <svg
                              viewBox="0 -450 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="8"
                              className={
                                tokens?.sort == 2
                                  ? "fill-green-600"
                                  : "fill-gray-400"
                              }
                            >
                              <path d="M804.571429 402.285714q0 14.857143-10.857143 25.714286t-25.714286 10.857143H256q-14.857143 0-25.714286-10.857143t-10.857143-25.714286 10.857143-25.714285l256-256q10.857143-10.857143 25.714286-10.857143t25.714286 10.857143l256 256q10.857143 10.857143 10.857143 25.714285z" />
                            </svg>
                            <svg
                              viewBox="0 450 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="8"
                              className={
                                tokens?.sort == 1
                                  ? "fill-green-600"
                                  : "fill-gray-400"
                              }
                            >
                              <path d="M804.571429 621.714286q0 14.857143-10.857143 25.714286l-256 256q-10.857143 10.857143-25.714286 10.857143t-25.714286-10.857143l-256-256q-10.857143-10.857143-10.857143-25.714286t10.857143-25.714286 25.714286-10.857143l512 0q14.857143 0 25.714286 10.857143t10.857143 25.714286z" />
                            </svg>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className="hover:bg-green-50 transition-colors duration-200 cursor-pointer border-b"
                        onClick={() => {
                          router.push(dexLink);
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden flex-shrink-0 rounded">
                              <Image
                                height={40}
                                width={40}
                                src="/bbb.jpg"
                                alt=""
                                className="object-cover w-10 h-10"
                              />
                            </div>
                            <div>
                              <div className="font-semibold">BBB</div>
                              <div className="text-sm text-gray-500">
                                Beny Bad Boy
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">
                          ${Number(bbbPrice)?.toFixed(6)}
                        </td>
                        <td className="text-right p-4">
                          <span
                            className={
                              bbbPriceChange24h >= 0
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {bbbPriceChange24h >= 0 ? "+" : ""}
                            {Math.abs(bbbPriceChange24h * 100)?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right p-4">
                          <div className="flex gap-2 justify-end items-center">
                            <div className="font-medium">
                              ${Number(bbbCap)?.toLocaleString()}
                            </div>
                            <div className="text-gray-500">(100.00%)</div>
                          </div>
                        </td>
                      </tr>

                      {dropTokens?.map((item, index) => {
                        const cap = item?.xdcAmount?.toString();
                        const percent = (100 * cap) / item?.maxXdc?.toString();
                        const tokenFromServer = tokenList?.[index];
                        const price =
                          Number(tokenFromServer?.price) / 1e18 || 0;
                        let priceChangeH24 =
                          Number(tokenFromServer?.priceChangeH24) || 0;
                        priceChangeH24 =
                          100 *
                          ((1 + priceChangeH24) * (1 + xdcPriceChange24h) - 1);

                        return (
                          <tr
                            key={item?.index}
                            className="hover:bg-green-50 transition-colors duration-200 cursor-pointer border-b"
                            onClick={() => {
                              router.push("/swap/" + item?.token);
                            }}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 overflow-hidden flex-shrink-0 rounded">
                                  <Image
                                    height={40}
                                    width={40}
                                    src={handleSrc(item?.imageUrl)}
                                    alt={item?.name}
                                    className="object-cover w-10 h-10"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold whitespace-nowrap">
                                    {item?.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500 whitespace-nowrap">
                                    {item?.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right p-4 font-medium">
                              ${(xdcPrice * price * 2)?.toFixed(6)}
                            </td>
                            <td className="text-right p-4">
                              <span
                                className={
                                  priceChangeH24 >= 0
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {priceChangeH24 >= 0 ? "+" : ""}
                                {priceChangeH24?.toFixed(2)}%
                              </span>
                            </td>
                            <td className="text-right p-4">
                              <div className="flex gap-2 justify-end items-center">
                                <div className="font-medium">
                                  $
                                  {(
                                    (2 * (xdcPrice * cap)) /
                                    1e18
                                  )?.toLocaleString()}
                                </div>
                                <div className="text-gray-500">
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
                <div className="flex justify-center p-4">
                  <ul className="flex items-center gap-1 text-sm">
                    <li
                      className={`${
                        tokens.pageNumber == 1
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-green-50"
                      } rounded-lg`}
                      onClick={() => {
                        if (tokens.pageNumber > 1) {
                          setMarketState((prev) => ({
                            ...prev,
                            tokens: {
                              ...prev.tokens,
                              pageNumber: prev.tokens.pageNumber - 1,
                            },
                          }));
                        }
                      }}
                    >
                      <a className="px-2 py-1 block">{"<"}</a>
                    </li>

                    {pages?.map((item) => {
                      const showPageItems =
                        item == 1 ||
                        item == tokens.totalPage ||
                        Math.abs(tokens.pageNumber - item) <= 1;
                      const showPassFront = item == 1 && tokens.pageNumber >= 4;
                      const showPassBack =
                        item == tokens?.totalPage &&
                        tokens.totalPage - tokens.pageNumber >= 3;

                      if (!showPageItems && !showPassFront && !showPassBack) {
                        return null;
                      }

                      return (
                        <li key={item}>
                          {showPassBack && item === tokens.totalPage && (
                            <span className="px-1 py-1">...</span>
                          )}

                          {showPageItems && (
                            <button
                              className={`min-w-[32px] px-2 py-1 rounded-lg ${
                                item == tokens?.pageNumber
                                  ? "bg-green-500 text-white"
                                  : "hover:bg-green-50 text-gray-700"
                              }`}
                              onClick={() => {
                                setMarketState((prev) => ({
                                  ...prev,
                                  tokens: { ...prev.tokens, pageNumber: item },
                                }));
                              }}
                            >
                              {item}
                            </button>
                          )}

                          {showPassFront && item === 1 && (
                            <span className="px-1 py-1">...</span>
                          )}
                        </li>
                      );
                    })}

                    <li
                      className={`${
                        tokens.pageNumber == tokens.totalPage
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:bg-green-50"
                      } rounded-lg`}
                      onClick={() => {
                        if (tokens.pageNumber < tokens.totalPage) {
                          setMarketState((prev) => ({
                            ...prev,
                            tokens: {
                              ...prev.tokens,
                              pageNumber: prev.tokens.pageNumber + 1,
                            },
                          }));
                        }
                      }}
                    >
                      <a className="px-2 py-1 block">{">"}</a>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    )
  );
};

export default Home;
