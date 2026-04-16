import { bbbInfo, contracts, markets } from "@/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { getDate, getPool, getXDCPrice } from "@/components/Utils";
import TokenInfo from "@/components/TokenInfo";
import TokenChat from "@/components/TokenChat";
import TokenTradePool from "@/components/TokenTradePool";
import useWindowSize from "@/components/Hook/useWindowSize";
import TokenSwapPool from "@/components/TokenSwapPool";
import TokenHeadPool from "@/components/TokenHeadPool";
import TokenSwapFun from "@/components/TokenSwapFun";
import TokenTradeFun from "@/components/TokenTradeFun";
import TokenHeadFun from "@/components/TokenHeadFun";
import TokenChartPool from "@/components/TokenChartPool";
import TokenChartFun from "@/components/TokenChartFun";
import { erc20Abi } from "viem";
import rpc from "@/components/Rpc";
import TokenMarkets from "@/components/TokenMarkets";
import Loading from "@/components/Loading";

const Swap = () => {
  const router = useRouter();
  let { token, inputPoolAddress, ido } = router.query;
  const chainId = useChainId();
  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbbv2;
  const [data, setData] = useState({});
  const [mount, setMount] = useState(false);
  const [price, setPrice] = useState({});
  const { width: windowWidth } = useWindowSize();
  const { address } = useAccount();
  const [type, setType] = useState("chart");

  // Find token in markets configuration
  const marketToken = markets.find(market => market.address?.toLowerCase() === token?.toLowerCase());

  async function fetchData() {
    setMount(false);
    const xdc = await getXDCPrice();

    setPrice({ ...price, xdc });
    setMount(true);
  }

  const xdcPrice = price?.xdc?.price;

  const xdcPriceChangeH24 = price?.xdc?.priceChange24h;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setType("chart");
  }, [windowWidth, token]);

  const tokenContract = {
    address: token,
    abi: erc20Abi,
  };

  const { data: reads0 } = useReadContracts({
    contracts: [
      { ...tokenContract, functionName: "totalSupply" },
    ],
  });

  const totalSupply = reads0?.[0]?.result;
  
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
  let xdcAmount;
  let maxXdc;

  // Always treat as graduate = true
  let graduate = true;

  // Get token info from markets configuration if available
  if (marketToken) {
    name = marketToken.name;
    symbol = marketToken.symbol;
    imageUrl = marketToken.imageUrl;
    description = marketToken.description;
    website = marketToken.website?.replace("https://", "");
    telegram = marketToken.tg?.replace("https://t.me/", "");
    twitter = marketToken.x?.replace("https://x.com/", "");
    coingecko = marketToken.coingecko;
    cmc = marketToken.cmc;
    index = marketToken.symbol;
    deployer = marketToken.deployer;
    createTime = marketToken.createTime;
  }

  const isBBB = token == bbbInfo.address;
  const canUpdate = address == deployer && !isBBB;

  async function fetchGraduate() {
    if (token) {
      const pool = await getPool(token);

      if (pool) {
        const poolInfo = {
          price: pool?.base_token_price_usd || 0,
          priceChangeH24: pool?.price_change_percentage?.h24 / 100 || 0,
          cap: pool?.market_cap_usd || 0,
          volumeH24: pool?.volume_usd?.h24,
          address: pool?.address,
        };

        setData({ ...data, pool: poolInfo });
      } else {
        setData({ ...data, pool: {} });
      }
    }
  }

  useEffect(() => {
    // Always fetch graduate data since graduate is always true
    fetchGraduate();
  }, [token]);

  // If token not found in markets configuration, don't display it
  if (!marketToken) {
    return (
      <>
        <Loading />
        <div className="text-center mt-10 text-base-content/60">
          Token {token} not found in configuration
        </div>
      </>
    );
  }

  const tokenInfo = data?.tokenInfo;
  const pool = data?.pool;

  let poolCap;
  let poolAddress;
  let showData;
  let showRLD;

  // Always use graduate logic
  const poolData = data?.pool;
  poolCap = poolData?.cap;
  poolAddress = poolData?.address || inputPoolAddress;
  showData = poolData != undefined && xdcPrice != undefined;

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
    showRLD,
    xdcAmount,
    maxXdc,
    xdcPrice,
    totalSupply,
  };

  const tChat = {
    chainId,
    index,
    address,
  };

  const tTradePool = {
    poolAddress,
    token,
  };

  const tTradeFun = {
    symbol,
    token,
    xdcPrice,
  };

  const tSwapPool = {
    poolAddress,
    isBBB,
    symbol,
    imageUrl,
    token,
    xdcPrice,
  };

  const tSwapFun = {
    index,
    token,
    imageUrl,
    symbol,
    xdcPrice,
  };

  const tHeadPool = {
    name,
    symbol,
    poolCap,
    createTime,
    deployer,
    isBBB,
    index,
    token,
    pool,
    imageUrl,
    website,
    telegram,
    twitter,
  };

  const tHeadFun = {
    index,
    name,
    symbol,
    token,
    xdcPrice,
    createTime,
    deployer,
    isBBB,
    index,
    token,
    tokenInfo,
    xdcPriceChangeH24,
    xdcAmount,
    maxXdc,
    imageUrl,
    website,
    telegram,
    twitter,
  };

  const tChartPool = {
    poolAddress,
  };

  const tChartFun = { index, xdcPrice, token, symbol };

  const tMarkets = {
    xdcPrice,
    xdcPriceChangeH24,
  };

  return showData ? (
    <>
      <div className="bg-base-200 border border-base-300 rounded-md p-2 sm:p-3 mb-3">
        <TokenHeadPool {...tHeadPool} />
      </div>
      <div className="m-auto grid lg:grid-cols-5 gap-3 lg:gap-4 lg:h-[960px] lg:min-h-0 pb-2">
        {windowWidth > 1024 && (
          <div className="bg-base-200 border border-base-300 rounded-md p-3 text-center overflow-y-auto min-h-0">
            <TokenMarkets {...tMarkets} />
          </div>
        )}

        <div className="lg:col-span-3 bg-base-200 border border-base-300 rounded-md overflow-x-auto text-center flex flex-col min-h-0">
          <div className="card bg-transparent shadow-none border-b border-base-300 rounded-none">
            <div className="card-body p-3 sm:p-4">
              <div className="flex gap-2 text-base-content/70 font-semibold text-sm">
                <div role="tablist" className="tabs tabs-boxed bg-base-300/50 w-full gap-1 p-1">
                  <a
                    role="tab"
                    className={
                      "tab tab-sm rounded-md " +
                      (type === "chart" ? "tab-active bg-base-200 text-primary" : "")
                    }
                    onClick={() => {
                      setType("chart");
                    }}
                  >
                    Chart
                  </a>
                  <a
                    role="tab"
                    className={
                      "tab tab-sm rounded-md " +
                      (type === "info" ? "tab-active bg-base-200 text-primary" : "")
                    }
                    onClick={() => {
                      setType("info");
                    }}
                  >
                    Info
                  </a>
                  <a
                    role="tab"
                    className={
                      "tab tab-sm rounded-md " +
                      (type === "chat" ? "tab-active bg-base-200 text-primary" : "")
                    }
                    onClick={() => {
                      setType("chat");
                    }}
                  >
                    Chat
                  </a>
                  <a
                    role="tab"
                    className={
                      "tab tab-sm rounded-md lg:hidden " +
                      (type === "trades" ? "tab-active bg-base-200 text-primary" : "")
                    }
                    onClick={() => {
                      setType("trades");
                    }}
                  >
                    Trades
                  </a>
                  <a
                    role="tab"
                    className={
                      "tab tab-sm rounded-md lg:hidden " +
                      (type === "markets" ? "tab-active bg-base-200 text-primary" : "")
                    }
                    onClick={() => {
                      setType("markets");
                    }}
                  >
                    Markets
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[300px] lg:h-[450px] flex-1 min-h-0 border-b border-base-300">
            {type == "chart" && <TokenChartPool {...tChartPool} />}
            {type == "info" && <TokenInfo {...tInfo} />}
            {type == "chat" && <TokenChat {...tChat} />}
            {type == "trades" && <TokenTradePool {...tTradePool} />}
            {type == "markets" && <TokenMarkets {...tMarkets} />}
          </div>
          <div className="p-3 sm:p-4 border-t border-base-300 bg-base-300/20">
            <button 
              onClick={() => window.open(`https://app.xspswap.finance/#/swap?outputCurrency=${token}&inputCurrency=xdc`, '_blank')}
              className="btn btn-primary btn-block font-semibold"
            >
              Swap
            </button>
          </div>
        </div>
        {windowWidth > 1024 && (
          <div className="bg-base-200 border border-base-300 rounded-md p-3 text-center overflow-y-auto min-h-0">
            <TokenTradePool {...tTradePool} />
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <Loading />
      <div className="text-center mt-10 text-base-content/60">
        Searching for {token}
      </div>
    </>
  );
};

export default Swap;
