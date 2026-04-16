import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import {
  calculatePrice,
  getBBBPrice,
  getXDCPrice,
} from "@/components/Utils";
import { erc20Abi, formatEther, getAddress } from "viem";
import { contracts, dashboardConfig } from "@/config";
import Loading from "@/components/Loading";
const Address = () => {
  const router = useRouter();
  const { addr } = router.query;
  const chainId = useChainId();
  const { data: xdcBalanceData } = useBalance({ address: addr });
  const [data, setData] = useState({});
  const xdcBalance = xdcBalanceData?.formatted;

  const { address } = useAccount();

  const [mount, setMount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = useCallback(async (addr) => {
    if (addr) {
      setMount(false);
      setIsLoading(true);
      setError(null);
      try {
        const setPrice = {};
        const xdc = await getXDCPrice();
        const bbb = await getBBBPrice();
        if (xdc.price != 0) {
          setPrice.xdc = xdc;
        }

        if (bbb.price != 0) {
          setPrice.bbb = bbb;
        }

        setData((prevData) => ({ ...prevData, ...setPrice }));
        setMount(true);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    }
  }, []);

  const mbbb = contracts[chainId]?.mbbbv2;

  useEffect(() => {
    fetchData(addr);
  }, [addr, fetchData]);

  // Get token addresses from dashboardConfig instead of data.coins
  const configuredTokens = Object.keys(dashboardConfig);
  
  const searchBalances = configuredTokens.map((tokenAddress) => {
    return {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr],
    };
  });

  const { data: reads0 } = useReadContracts({ contracts: searchBalances });
  console.log(reads0)
  
  const searchTokens = configuredTokens.map((tokenAddress) => {
    return {
      ...mbbb,
      functionName: "tokenMapping",
      args: [tokenAddress],
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

  const xdcUsdBalance = xdcBalance * xdcPrice;

  totalBalance += xdcUsdBalance;
  total24hChange += xdcUsdBalance - xdcUsdBalance / (1 + xdcPriceChange24h);

  let tokens = reads0?.map((item, index) => {
    const tokenAddress = getAddress(configuredTokens[index]);
    const coinConfig = dashboardConfig[tokenAddress];
    const dropToken = dropTokensMapping?.[tokenAddress];
    
    // Create a coin object with basic info from config
    const coin = {
      address: tokenAddress,
      symbol: coinConfig?.symbol || 'Unknown',
      name: coinConfig?.name || 'Unknown Token',
      priceChange24h: 0, // Default to 0, will be updated below
      imageUrl: coinConfig?.imageUrl || '/logo.png',
    };

    let tradeLink;
    let usdBalance = 0;
    let price = 0;
    let show = false;

    // Handle dropTokens if they exist
    if (dropToken) {
      tradeLink = "/swap/" + dropToken?.token;
      price = xdcPrice * calculatePrice(Number(dropToken?.xdcAmount));
      usdBalance = (price * Number(item?.result)) / 1e18 || 0;
      totalBalance += usdBalance;
      total24hChange += usdBalance - usdBalance / (1 + coin.priceChange24h);
      show = true;
    }
    // Handle configured tokens
    else if (coinConfig?.price == "bbb" || coinConfig?.price == "mbbb") {
      price = bbbPrice;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
      coin.priceChange24h = bbbPriceChange24h;
      total24hChange += usdBalance - usdBalance / (1 + bbbPriceChange24h);
      tradeLink = coinConfig?.tradeLink || tradeLink;
      show = true;
    }

    else if (coinConfig?.price == "wxdc" || coinConfig?.price == "psxdc" || coinConfig?.price == "bpsxdc") {
      price = xdcPrice;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
      coin.priceChange24h = xdcPriceChange24h;
      total24hChange += usdBalance - usdBalance / (1 + xdcPriceChange24h);
      tradeLink = coinConfig?.tradeLink || tradeLink;
      show = true;
    }

    else if (coinConfig?.price == "usdb" || coinConfig?.price == "susdb") {
      // USDB and sUSDB are stablecoins, price is approximately $1
      price = 1;
      usdBalance = (price * Number(item?.result)) / 1e18;
      totalBalance += usdBalance;
      coin.priceChange24h = 0; // Stablecoins have minimal price change
      total24hChange += usdBalance - usdBalance / (1 + 0);
      tradeLink = coinConfig?.tradeLink || tradeLink;
      show = true;
    }

    else if (coinConfig?.price == "usdc") {
      // USDC is a stablecoin, price is approximately $1
      price = 1;
      usdBalance = (price * Number(item?.result)) / 1e6; // USDC typically has 6 decimals
      totalBalance += usdBalance;
      coin.priceChange24h = 0; // Stablecoins have minimal price change
      total24hChange += usdBalance - usdBalance / (1 + 0);
      tradeLink = coinConfig?.tradeLink || tradeLink;
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
  tokens = tokens?.sort((a, b) => b.usdBalance - a.usdBalance);

  const total24hChangePercent =
    Math.abs(total24hChange / (totalBalance - total24hChange)) || 0;

  const show = mount && data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
                  <span className="text-base-content/60">24h Change</span>
                  <span
                    className={
                      total24hChange >= 0 ? "text-success" : "text-error"
                    }
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    {error.message || "An error occurred while loading data"}
                  </span>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Coin</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right hidden sm:table-cell">Price</th>
                      <th className="text-right hidden sm:table-cell">
                        24h Change
                      </th>
                      <th className="text-right hidden sm:table-cell">
                        Actions
                      </th>
                      <th className="text-right sm:hidden px-0"></th>
                    </tr>
                  </thead>
                  <tbody>
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
                            <div className="text-sm text-base-content/50">
                              XDC Network
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="font-medium">
                          {Number(xdcBalance)?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-base-content/50">
                          ${xdcUsdBalance?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="text-right hidden sm:table-cell font-medium">
                        ${Number(xdcPrice || 0)?.toFixed(6)}
                      </td>
                      <td
                        className={
                          "text-right hidden sm:table-cell font-medium " +
                          (xdcPriceChange24h >= 0
                            ? "text-success"
                            : "text-error")
                        }
                      >
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
                    {/* XDC Network Tokens */}
                    {tokens?.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          "hover " + (item?.balance == 0 ? "hidden" : "")
                        }
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
                              <div className="text-sm text-base-content/50 hidden sm:block">
                                {item.name}
                              </div>
                              <div className="text-sm text-base-content/50 sm:hidden">
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
                              ? Number(
                                  formatEther(item?.balance)
                                )?.toLocaleString()
                              : formatEther(item?.balance)}
                          </div>
                          <div className="text-sm text-base-content/50">
                            ${item?.usdBalance?.toLocaleString() || 0}
                          </div>
                        </td>
                        <td className="text-right hidden sm:table-cell font-medium">
                          ${Number(item?.price || 0)?.toFixed(6)}
                        </td>
                        <td
                          className={
                            "text-right hidden sm:table-cell font-medium " +
                            (item?.priceChange24h >= 0
                              ? "text-success"
                              : "text-error")
                          }
                        >
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
