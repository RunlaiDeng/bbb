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
import Loading from "@/components/Loading";
const Address = () => {
  const router = useRouter();
  const { addr } = router.query;
  const { data: xdcBalanceData } = useBalance({ address: addr });
  const [data, setData] = useState({});
  const xdcBalance = xdcBalanceData?.formatted;

  const { address } = useAccount();

  const [mount, setMount] = useState(false);
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = async (addr) => {
    if (addr) {
      setMount(false);
      setIsLoading(true);
      setError(null);
      try {
        const setPrice = {};
        const referralInfo = await rpc.getReferralInfo(addr);
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
              (1 + Number(queryInfo.priceChangeH24)) *
                (1 + Number(xdc.priceChange24h)) -
              1;
          }

          item = { ...item.token, ...queryInfo };
          return item;
        });

        setData({ ...data, ...setPrice, coins: coins, referralInfo });
        setMount(true);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    }
  };

  const mbbb = contracts[chainId]?.mbbbv2;
  const referralInfo = data?.referralInfo;

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

  const referralBonus = referralInfo?.totalPrize / 1e18 || 0;

  const referralUsdBonus = referralBonus * xdcPrice || 0;
  const xdcUsdBalance = xdcBalance * xdcPrice;

  totalBalance += xdcUsdBalance + referralUsdBonus;
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

  const total24hChangePercent =
    Math.abs(total24hChange / (totalBalance - total24hChange)) || 0;

  const show = mount && data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Card */}
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="card-body p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src="/bbb.jpg"
                alt="user"
                fill
                className="rounded-2xl object-cover"
                priority
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
                <span className="font-mono">{addr?.substr(36)}</span>
                {address != addr && <span className="text-gray-500">(Watch Only)</span>}
                <div
                  className="tooltip cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="Copy Address"
                  onClick={() => {
                    copy(addr);
                    success("Address copied!");
                  }}
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                  >
                    <path
                      d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                      className="fill-current"
                    />
                    <path
                      d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                      className="fill-current"
                    />
                  </svg>
                </div>
                <div
                  className="tooltip cursor-pointer hover:opacity-80 transition-opacity"
                  data-tip="View on XDCScan"
                  onClick={() => {
                    window.open("https://xdcscan.com/address/" + addr);
                  }}
                >
                  <Image src="/xdc.png" width={20} height={20} alt="XDC" className="rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="card-body p-6">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg font-bold">Estimated Balance</h2>
            {addr == address && (
              <div className="gap-3 hidden sm:flex">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => router.push("/deposit")}
                >
                  Deposit
                </button>
                <button
                  className="btn btn-outline btn-success btn-sm"
                  onClick={() => router.push("/withdraw")}
                >
                  Withdraw
                </button>
              </div>
            )}
          </div>
          
          {!show && (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          )}
          
          {show && (
            <>
              <div className="mt-4">
                <div className="text-3xl sm:text-4xl font-bold">
                  ${totalBalance?.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-gray-600">24h Change</span>
                  <span className={total24hChange >= 0 ? "text-success" : "text-error"}>
                    {total24hChange >= 0 ? "+" : "-"}$
                    {Math.abs(total24hChange)?.toLocaleString()}
                    <span className="ml-1">
                      ({(total24hChangePercent * 100)?.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
              {addr == address && (
                <div className="flex gap-3 mt-4 sm:hidden">
                  <button
                    className="btn btn-success btn-sm flex-1"
                    onClick={() => router.push("/deposit")}
                  >
                    Deposit
                  </button>
                  <button
                    className="btn btn-outline btn-success btn-sm flex-1"
                    onClick={() => router.push("/withdraw")}
                  >
                    Withdraw
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assets Card */}
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="card-body p-6">
          <h2 className="card-title text-lg font-bold mb-4">My Assets</h2>
          {!show && (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          )}
          {show && (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loading />
                </div>
              ) : error ? (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error.message || "An error occurred while loading data"}</span>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Coin</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right hidden sm:table-cell">Price</th>
                      <th className="text-right hidden sm:table-cell">24h Change</th>
                      <th className="text-right hidden sm:table-cell">Actions</th>
                      <th className="text-right sm:hidden px-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              height={32}
                              width={32}
                              src="/xdc.png"
                              alt="XDC Token"
                              className="object-cover"
                              priority
                            />
                          </div>
                          <div>
                            <div className="font-medium">bXDC</div>
                            <div className="text-sm text-gray-500">Bonus XDC</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="font-medium">{Number(referralBonus)?.toLocaleString() || 0}</div>
                        <div className="text-sm text-gray-500">${referralUsdBonus?.toLocaleString() || 0}</div>
                      </td>
                      <td className="text-right hidden sm:table-cell font-medium">
                        ${Number(xdcPrice || 0)?.toFixed(6)}
                      </td>
                      <td className={
                        "text-right hidden sm:table-cell font-medium " +
                        (xdcPriceChange24h >= 0 ? "text-success" : "text-error")
                      }>
                        {xdcPriceChange24h >= 0 ? "+" : "-"}
                        {Math.abs(xdcPriceChange24h * 100)?.toFixed(2)}%
                      </td>
                      <td className="text-right hidden sm:table-cell">
                        <button
                          className="btn btn-sm btn-success btn-outline"
                          onClick={() => router.push("/referral")}
                        >
                          Claim
                        </button>
                      </td>
                      <td className="text-right sm:hidden px-0">
                        <button className="btn btn-ghost btn-sm btn-square">
                          <svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                          >
                            <path
                              d="M512 681.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 425.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 342.016q-34.005333 0-59.989333-25.984t-25.984-59.989333 25.984-59.989333 59.989333-25.984 59.989333 25.984 25.984 59.989333-25.984 59.989333-59.989333 25.984z"
                              className="fill-current"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {/* XDC Row */}
                    <tr className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              height={32}
                              width={32}
                              src="/xdc.png"
                              alt="XDC Token"
                              className="object-cover"
                              priority
                            />
                          </div>
                          <div>
                            <div className="font-medium">XDC</div>
                            <div className="text-sm text-gray-500">XDC Network</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="font-medium">{Number(xdcBalance)?.toLocaleString() || 0}</div>
                        <div className="text-sm text-gray-500">${xdcUsdBalance?.toLocaleString() || 0}</div>
                      </td>
                      <td className="text-right hidden sm:table-cell font-medium">
                        ${Number(xdcPrice || 0)?.toFixed(6)}
                      </td>
                      <td className={
                        "text-right hidden sm:table-cell font-medium " +
                        (xdcPriceChange24h >= 0 ? "text-success" : "text-error")
                      }>
                        {xdcPriceChange24h >= 0 ? "+" : "-"}
                        {Math.abs(xdcPriceChange24h * 100)?.toFixed(2)}%
                      </td>
                      <td className="text-right hidden sm:table-cell"></td>
                      <td className="text-right sm:hidden px-0">
                        <button className="btn btn-ghost btn-sm btn-square">
                          <svg
                            viewBox="0 0 1024 1024"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                          >
                            <path
                              d="M512 681.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 425.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 342.016q-34.005333 0-59.989333-25.984t-25.984-59.989333 25.984-59.989333 59.989333-25.984 59.989333 25.984 25.984 59.989333-25.984 59.989333-59.989333 25.984z"
                              className="fill-current"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {/* Other Tokens */}
                    {tokens?.map((item, index) => (
                      <tr
                        key={index}
                        className={"hover " + (item?.balance == 0 ? "hidden" : "")}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-base-200">
                              {item?.imageUrl && (
                                <Image
                                  height={32}
                                  width={32}
                                  src={item?.imageUrl}
                                  alt={item.symbol}
                                  className="object-cover"
                                  priority
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{item.symbol}</div>
                              <div className="text-sm text-gray-500 hidden sm:block">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500 sm:hidden">
                                {item.name?.length > 10
                                  ? item.name?.substr(0, 10) + "..."
                                  : item.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="font-medium">
                            {formatEther(item?.balance) >= 1000
                              ? Number(formatEther(item?.balance))?.toLocaleString()
                              : formatEther(item?.balance)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${item?.usdBalance?.toLocaleString() || 0}
                          </div>
                        </td>
                        <td className="text-right hidden sm:table-cell font-medium">
                          ${Number(item?.price || 0)?.toFixed(6)}
                        </td>
                        <td className={
                          "text-right hidden sm:table-cell font-medium " +
                          (item?.priceChange24h >= 0 ? "text-success" : "text-error")
                        }>
                          {item?.priceChange24h >= 0 && "+"}
                          {(item?.priceChange24h * 100)?.toFixed(2)}%
                        </td>
                        <td className="text-right hidden sm:table-cell">
                          {item?.tradeLink && (
                            <button
                              className="btn btn-sm btn-success btn-outline"
                              onClick={() => router.push(item?.tradeLink)}
                            >
                              Trade
                            </button>
                          )}
                        </td>
                        <td className="text-right sm:hidden px-0">
                          <button className="btn btn-ghost btn-sm btn-square">
                            <svg
                              viewBox="0 0 1024 1024"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                            >
                              <path
                                d="M512 681.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 425.984q34.005333 0 59.989333 25.984t25.984 59.989333-25.984 59.989333-59.989333 25.984-59.989333-25.984-25.984-59.989333 25.984-59.989333 59.989333-25.984zM512 342.016q-34.005333 0-59.989333-25.984t-25.984-59.989333 25.984-59.989333 59.989333-25.984 59.989333 25.984 25.984 59.989333-25.984 59.989333-59.989333 25.984z"
                                className="fill-current"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
