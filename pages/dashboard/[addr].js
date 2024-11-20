import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import {
  calculatePrice,
  getERC20List,
  getXDCPrice,
  sqrtPriceX96ToPrice,
} from "@/components/Utils";
import { erc20Abi, getAddress } from "viem";
import { contracts, dashboardConfig } from "@/config";
import { useNotification } from "@/components/Context/notice";
import rpc from "@/components/Rpc";
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
      const xdcPrice = await getXDCPrice();
      const erc20List = await getERC20List(addr);
      const queryList = erc20List?.items?.map((item) => {
        return getAddress(item?.token?.address);
      });

      const queryTokens = await rpc.getTokens(
        1,
        1,
        queryList.length,
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
              (1 + Number(xdcPrice.priceChange24h)) -
            1;
        }
        console.log(queryInfo?.priceChange24h);
        item = { ...item.token, ...queryInfo };
        return item;
      });

      setData({ ...data, xdcPrice, coins: coins });
      setMount(true);
    }
  };

  const mbbb = contracts[chainId]?.mbbbv2;
  const pool = contracts[chainId]?.pool;
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

  const { data: reads3 } = useReadContracts({
    contracts: [{ ...pool, functionName: "slot0" }],
  });

  const sqrtPriceX96 = reads3?.[0]?.result?.[0];
  const xdcPrice = data?.xdcPrice?.price;
  const priceChange24h = data?.xdcPrice?.priceChange24h;

  const bbbPrice = (xdcPrice * sqrtPriceX96ToPrice(sqrtPriceX96))?.toFixed(6);

  const dropTokens = reads2?.map((item) => {
    return item?.result;
  });

  const dropTokensMapping = dropTokens?.reduce((acc, item) => {
    acc[item.token] = item;
    return acc;
  }, {});
  let totalBalance = 0;
  const xdcUsdBalance = xdcBalance?.formatted * xdcPrice;
  totalBalance += xdcUsdBalance;
  let tokens = reads0?.map((item, index) => {
    const coin = data?.coins?.[index];
    const tokenAddress = getAddress(coin?.address);
    const coinConfig = dashboardConfig[tokenAddress];
    const dropToken = dropTokensMapping?.[tokenAddress];
    coin.priceChange24h = coin?.priceChange24h || 0;

    let tradeLink;
    let usdBalance = 0;
    let price = 0;

    if (dropToken) {
      tradeLink = "/swap/" + dropToken?.token;
      price = xdcPrice * calculatePrice(Number(dropToken?.xdcAmount));
      usdBalance = (price * Number(item?.result)) / 1e18;

      totalBalance += usdBalance;
    }
    if (coinConfig?.price == "bbb") {
      price = bbbPrice;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
    }

    const token = {
      balance: item?.result,
      ...coin,
      tradeLink,
      ...coinConfig,
      ...dropToken,
      usdBalance,
      price,
    };
    return token;
  });

  const { info } = useNotification();
  tokens = tokens?.sort((a, b) => b.usdBalance - a.usdBalance);
  console.log(tokens);

  return (
    <>
      {(!mount || !tokens) && (
        <div className="flex justify-center items-center mt-48">
          <div className="loading loading-bars loading-lg text-success"></div>
        </div>
      )}
      {mount && tokens && (
        <>
          {" "}
          <div className="card font-black p-0 m-auto w-96 sm:w-11/12 mt-4">
            <div className="card-body p-0">
              <div className="flex items-center gap-4 p-4 text-xl">
                <Image
                  src="/bbb.jpg"
                  alt="user"
                  height={100}
                  width={100}
                  className="rounded-md"
                />
                <div>
                  <div className="flex items-center">
                    {addr?.substr(36)}
                    {address != addr && <div>(Watch Only)</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card font-black border m-auto w-96 sm:w-11/12 mt-4">
            <div className="card-body">
              <div className="flex justify-between">
                Estimated Balance{" "}
                <div
                  className="btn btn-sm text-white flex items-center btn-success"
                  onClick={() => {
                    info("coming soon");
                  }}
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="2583"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M881.778 446.578L510.52 813.909l-83.058-82.716-285.24-282.34 83.626-82.716L451.186 589.71V0h118.613v589.767l227.783-225.963 84.196 82.774z m-1.138 460.06H142.222V1024H880.64V906.638z"
                      p-id="2584"
                      fill="#ffffff"
                    ></path>
                  </svg>
                  Deposit
                </div>
              </div>
              <div className="text-2xl sm:text-4xl">
                ${totalBalance?.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="card font-medium border m-auto w-96 sm:w-11/12 mt-4">
            <div className="card-body">
              <div className="font-black">My Assets</div>
              <div className="overflow-x-auto">
                <table className="table">
                  {/* head */}
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Coin Price</th>
                      <th className="text-right">24H Change</th>
                      <th className="text-right">Trade</th>
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
                      <td className="text-right">
                        ${Number(xdcPrice || 0)?.toFixed(6)}
                      </td>
                      <td
                        className={
                          "text-right " +
                          (priceChange24h >= 0
                            ? "text-green-700"
                            : "text-red-500")
                        }
                      >
                        {priceChange24h >= 0 && "+"}
                        {(priceChange24h * 100)?.toFixed(2)}%
                      </td>
                      <td className="text-right"></td>
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
                              {Number(
                                item?.balance / BigInt(10 ** item?.decimals)
                              )?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs opacity-50">
                              ${item?.usdBalance?.toLocaleString() || 0}
                            </div>
                          </td>
                          <td className="text-right">
                            ${Number(item?.price || 0)?.toFixed(6)}
                          </td>
                          <td
                            className={
                              "text-right " +
                              (item?.priceChange24h >= 0
                                ? "text-green-700"
                                : "text-red-500")
                            }
                          >
                            {item?.priceChange24h >= 0 && "+"}
                            {(item?.priceChange24h * 100)?.toFixed(2)}%
                          </td>
                          <td className="text-right">
                            {item?.tradeLink && (
                              <div className="underline text-green-700 cursor-pointer">
                                Trade
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Address;
