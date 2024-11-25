import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import {
  calculatePrice,
  getBBBPrice,
  getERC20List,
  getXDCPrice,
} from "@/components/Utils";
import { erc20Abi, formatEther, getAddress } from "viem";
import { contracts, dashboardConfig } from "@/config";
import { useNotification } from "@/components/Context/notice";
import rpc from "@/components/Rpc";
import copy from "copy-to-clipboard";
const Address = () => {
  const router = useRouter();
  const { addr } = router.query;
  const { data: xdcBalance } = useBalance({ address: addr });
  const [data, setData] = useState({});

  const { address } = useAccount();

  const [mount, setMount] = useState(false);
  const chainId = useChainId();
  const fetchData = async (addr) => {
    if (addr) {
      setMount(false);
      const setPrice = {};

      const xdc = await getXDCPrice();
      const bbb = await getBBBPrice();
      if (xdc.price != 0) {
        setPrice.xdc = xdc;
      }

      if (bbb.price != 0) {
        setPrice.bbb = bbb;
      }
      const erc20List = await getERC20List(addr);
      const queryList = erc20List?.items?.map((item) => {
        return getAddress(item?.token?.address);
      });

      const queryTokens = await rpc.getTokens(
        1,
        1,
        queryList?.length,
        queryList
      );

      const coins = erc20List?.items?.map((item, index) => {
        const list = queryTokens?.list;
        const listMapping = list?.reduce((acc, item) => {
          acc[item.token] = item;
          return acc;
        }, {});
        const queryAddr = getAddress(item?.token?.address);

        const queryInfo = listMapping[queryAddr];

        if (queryInfo) {
          queryInfo.priceChange24h =
            (1 + Number(queryInfo.priceChange24h)) *
              (1 + Number(xdc.priceChange24h)) -
            1;
        }

        item = { ...item.token, ...queryInfo };
        return item;
      });

      setData({ ...data, ...setPrice, coins: coins });
      setMount(true);
    }
  };

  const mbbb = contracts[chainId]?.mbbbv2;

  useEffect(() => {
    fetchData(addr);
  }, [addr]);

  const searchBalances = data?.coins?.map((item) => {
    return {
      address: item?.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr],
    };
  });

  const { data: reads0 } = useReadContracts({ contracts: searchBalances });

  const searchTokens = data?.coins?.map((item) => {
    return {
      ...mbbb,
      functionName: "tokenMapping",
      args: [item?.address],
    };
  });

  const { data: reads1 } = useReadContracts({ contracts: searchTokens });

  const mapping = {};

  const searchDropTokens = [];

  reads1?.forEach((item, index) => {
    const result = item?.result;
    if (result) {
      mapping[index] = result;
      searchDropTokens.push({
        ...mbbb,
        functionName: "getDropToken",
        args: [result?.toString()],
      });
    }
  });

  const { data: reads2 } = useReadContracts({ contracts: searchDropTokens });

  const xdcPrice = data?.xdc?.price;
  const xdcPriceChange24h = Number(data?.xdc?.priceChange24h);

  const bbbPrice = data?.bbb?.price;
  const bbbPriceChange24h = data?.bbb?.priceChange24h;

  const dropTokens = reads2?.map((item) => {
    return item?.result;
  });

  const dropTokensMapping = dropTokens?.reduce((acc, item) => {
    acc[item.token] = item;
    return acc;
  }, {});
  let totalBalance = 0;
  let total24hChange = 0;
  const xdcUsdBalance = xdcBalance?.formatted * xdcPrice;
  totalBalance += xdcUsdBalance;
  total24hChange += xdcUsdBalance - xdcUsdBalance / (1 + xdcPriceChange24h);

  let tokens = reads0?.map((item, index) => {
    const coin = data?.coins?.[index];
    const tokenAddress = getAddress(coin?.address);
    const coinConfig = dashboardConfig[tokenAddress];
    const dropToken = dropTokensMapping?.[tokenAddress];
    coin.priceChange24h = coin?.priceChange24h || 0;

    let tradeLink;
    let usdBalance = 0;
    let price = 0;
    let show = false;

    if (dropToken) {
      tradeLink = "/swap/" + dropToken?.token;
      price = xdcPrice * calculatePrice(Number(dropToken?.xdcAmount));
      usdBalance = (price * Number(item?.result)) / 1e18 || 0;
      totalBalance += usdBalance;
      total24hChange += usdBalance - usdBalance / (1 + coin.priceChange24h);
      show = true;
    }

    if (coinConfig?.price == "bbb" || coinConfig?.price == "mbbb") {
      price = bbbPrice;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
      coin.priceChange24h = bbbPriceChange24h;
      total24hChange += usdBalance - usdBalance / (1 + bbbPriceChange24h);
      show = true;
    }

    if (coinConfig?.price == "wxdc") {
      price = xdcPrice;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
      coin.priceChange24h = xdcPriceChange24h;
      total24hChange += usdBalance - usdBalance / (1 + xdcPriceChange24h);
      show = true;
    }

    const token = {
      balance: item?.result,
      ...coin,
      tradeLink,
      ...coinConfig,
      ...dropToken,
      usdBalance,
      price,
      show,
    };
    return token;
  });
  tokens = tokens?.filter((item) => {
    return item.show;
  });
  const { info, success } = useNotification();
  tokens = tokens?.sort((a, b) => b.usdBalance - a.usdBalance);

  const total24hChangePercent = Math.abs(
    total24hChange / (totalBalance - total24hChange)
  );

  const show = (mount && tokens) || data?.coins?.length == 0;

  return (
    <>
      <div className="card font-black p-0 m-auto w-96 sm:w-11/12 mt-4">
        <div className="card-body p-0">
          <div className="flex items-center gap-4 p-0 text-xl">
            <Image
              src="/bbb.jpg"
              alt="user"
              height={100}
              width={100}
              className="rounded-md"
            />
            <div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                {addr?.substr(36)}
                {address != addr && <div>(Watch Only)</div>}
                <div
                  className={"cursor-pointer tooltip"}
                  data-tip="Copy Address"
                  onClick={() => {
                    copy(addr);
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
                  data-tip="View on XDCScan"
                  onClick={() => {
                    window.open("https://xdcscan.com/address/" + addr);
                  }}
                >
                  <Image src="/xdc.png" width={20} height={20} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card font-black border m-auto w-96 sm:w-11/12 mt-4">
        <div className="card-body p-6">
          <div className="flex justify-between items-center">
            Estimated Balance{" "}
            {addr == address && (
              <div className="gap-2 hidden sm:flex">
                <div
                  className="btn btn-sm"
                  onClick={() => {
                    router.push("/deposit");
                  }}
                >
                  Deposit
                </div>
                <div
                  className="btn btn-sm"
                  onClick={() => {
                    info("coming soon");
                  }}
                >
                  Withdraw
                </div>
              </div>
            )}
          </div>
          {!show && (
            <div className="flex justify-center items-center mt-4">
              <div className="loading loading-bars loading-lg text-success"></div>
            </div>
          )}
          {show && (
            <>
              <div className="text-2xl sm:text-4xl">
                ${totalBalance?.toLocaleString()}
              </div>
              <div className={"flex items-center text-xs gap-2 "}>
                <div className="text-black">{"Totay's Pnl"}</div>{" "}
                <div
                  className={
                    total24hChange >= 0 ? "text-green-700" : "text-red-700"
                  }
                >
                  {total24hChange >= 0 ? "+" : "-"}$
                  {Math.abs(total24hChange)?.toLocaleString()}(
                  {(total24hChangePercent * 100)?.toFixed(2) + "%"})
                </div>
              </div>
              {addr == address && (
                <div className="gap-2 flex sm:hidden">
                  <div
                    className="btn btn-sm"
                    onClick={() => {
                      info("coming soon");
                    }}
                  >
                    Deposit
                  </div>
                  <div
                    className="btn btn-sm"
                    onClick={() => {
                      info("coming soon");
                    }}
                  >
                    Withdraw
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card font-medium border m-auto w-96 sm:w-11/12 mt-4">
        <div className="card-body p-2">
          <div className="font-black p-4">My Assets</div>
          {!show && (
            <div className="flex justify-center items-center mt-4">
              <div className="loading loading-bars loading-lg text-success"></div>
            </div>
          )}
          {show && (
            <div className="overflow-x-auto">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right hidden sm:table-cell">
                      Coin Price
                    </th>
                    <th className="text-right hidden sm:table-cell">
                      24H Change
                    </th>
                    <th className="text-right hidden sm:table-cell">Trade</th>
                    <th className="text-right sm:hidden  px-0"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover cursor-pointer">
                    <td className="flex items-center gap-2">
                      <div className="h-6 w-6 overflow-hidden">
                        <Image
                          height={400}
                          width={400}
                          src="/xdc.png"
                          alt={""}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div>XDC</div>
                        <div className="text-xs opacity-50 whitespace-nowrap">
                          XDC Network
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div>
                        {Number(xdcBalance?.formatted)?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs opacity-50">
                        ${xdcUsdBalance?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="text-right hidden sm:table-cell">
                      ${Number(xdcPrice || 0)?.toFixed(6)}
                    </td>
                    <td
                      className={
                        "text-right hidden sm:table-cell " +
                        (xdcPriceChange24h >= 0
                          ? "text-green-700"
                          : "text-red-700")
                      }
                    >
                      {xdcPriceChange24h >= 0 ? "+" : "-"}
                      {Math.abs(xdcPriceChange24h * 100)?.toFixed(2)}%
                    </td>
                    <td className="text-right hidden sm:table-cell"></td>
                    <td className="text-right sm:hidden px-0">
                      <svg
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        p-id="12307"
                        width="16"
                        height="16"
                      >
                        <path
                          d="M512 681.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 425.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 342.016q-34.005333 0-59.989333-25.984t-25.984-59.989333 25.984-59.989333 59.989333-25.984 59.989333 25.984 25.984 59.989333-25.984 59.989333-59.989333 25.984z"
                          fill="#444444"
                          p-id="12308"
                        ></path>
                      </svg>
                    </td>
                  </tr>
                  {tokens?.map((item, index) => {
                    return (
                      <tr
                        key={index}
                        className={
                          "hover cursor-pointer " +
                          (item?.balance == 0 ? "hidden" : "")
                        }
                        onClick={() => {
                          if (item?.tradeLink) {
                            router.push(item?.tradeLink);
                          }
                        }}
                      >
                        <td className="flex items-center gap-2">
                          <div className="h-6 w-6 overflow-hidden">
                            {item?.imageUrl && (
                              <Image
                                height={400}
                                width={400}
                                src={item?.imageUrl}
                                alt={""}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <div>{item.symbol}</div>
                            <div className="text-xs opacity-50 whitespace-nowrap hidden sm:block">
                              {item.name}
                            </div>
                            <div className="text-xs opacity-50 whitespace-nowrap sm:hidden">
                              {item.name?.length > 10
                                ? item.name?.substr(0, 10) + "..."
                                : item.name}
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div>
                            {formatEther(item?.balance) >= 1000
                              ? Number(
                                  formatEther(item?.balance)
                                )?.toLocaleString() || 0
                              : formatEther(item?.balance)}
                          </div>
                          <div className="text-xs opacity-50">
                            ${item?.usdBalance?.toLocaleString() || 0}
                          </div>
                        </td>
                        <td className="text-right hidden sm:table-cell">
                          ${Number(item?.price || 0)?.toFixed(6)}
                        </td>
                        <td
                          className={
                            "text-right hidden sm:table-cell " +
                            (item?.priceChange24h >= 0
                              ? "text-green-700"
                              : "text-red-700")
                          }
                        >
                          {item?.priceChange24h >= 0 && "+"}
                          {(item?.priceChange24h * 100)?.toFixed(2)}%
                        </td>
                        <td className="text-right hidden sm:table-cell">
                          {item?.tradeLink && (
                            <div className="underline text-green-700 cursor-pointer">
                              Trade
                            </div>
                          )}
                        </td>
                        <td className="text-right sm:hidden px-0">
                          <svg
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="12307"
                            width="16"
                            height="16"
                          >
                            <path
                              d="M512 681.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 425.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 342.016q-34.005333 0-59.989333-25.984t-25.984-59.989333 25.984-59.989333 59.989333-25.984 59.989333 25.984 25.984 59.989333-25.984 59.989333-59.989333 25.984z"
                              fill="#444444"
                              p-id="12308"
                            ></path>
                          </svg>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Address;
