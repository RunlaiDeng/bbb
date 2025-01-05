import { bbbInfo, contracts } from "@/config";
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
  let { token } = router.query;
  const chainId = useChainId();
  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbbv2;
  const [data, setData] = useState({});
  const [mount, setMount] = useState(false);
  const [price, setPrice] = useState({});

  if (token == "bbb") {
    token = bbb.address;
  }

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

  const tokenContract = {
    address: token,
    abi: erc20Abi,
  };

  const { data: reads0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getDropTokenByAddress",
        args: [token],
      },
      { ...tokenContract, functionName: "totalSupply" },
    ],
  });

  const dropToken = reads0?.[0]?.result;
  const totalSupply = reads0?.[1]?.result;
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

  let graduate;
  if (token == bbb.address) {
    graduate = 1n;
  } else {
    graduate = dropToken?.removed;
  }

  if (token == bbb.address) {
    name = bbbInfo.name;
    symbol = bbbInfo.symbol;
    imageUrl = bbbInfo.imageUrl;
    description = bbbInfo.description;
    website = bbbInfo.website?.replace("https://", "");
    telegram = bbbInfo.tg?.replace("https://t.me/", "");
    twitter = bbbInfo.x?.replace("https://x.com/", "");
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
    xdcAmount = dropToken?.xdcAmount;
    maxXdc = dropToken?.maxXdc;
  }

  const { width: windowWidth } = useWindowSize();

  const { address } = useAccount();

  const isBBB = token == bbbInfo.address;
  const canUpdate = address == deployer && !isBBB;

  async function fetchNonGraduate() {
    if (token) {
      const findToken = await rpc.getTokens(1, 1, 1, [token]);
      setData({ ...data, tokenInfo: findToken?.list?.[0] });
    }
  }

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
      }
    }
  }

  useEffect(() => {
    if (graduate) {
      fetchGraduate();
    } else {
      fetchNonGraduate();
    }
  }, [graduate, token]);

  const tokenInfo = data?.tokenInfo;
  const pool = data?.pool;

  let poolCap;
  let poolAddress;
  let showData;
  let showRLD;
  if (graduate) {
    const pool = data?.pool;
    poolCap = pool?.cap;
    poolAddress = pool?.address;
    showData = poolAddress != undefined && xdcPrice != undefined;
  } else {
    showData = dropToken != undefined && xdcPrice != undefined;
    showRLD = true;
  }

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

  const [type, setType] = useState("chart");

  useEffect(() => {
    setType("chart");
  }, [windowWidth, token]);

  return showData ? (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 m-2">
        {graduate ? (
          <TokenHeadPool {...tHeadPool} />
        ) : (
          <TokenHeadFun {...tHeadFun} />
        )}
      </div>
      <div className="m-auto grid lg:grid-cols-5 gap-4 lg:h-[960px] p-2">
        {windowWidth > 1024 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center overflow-y-auto">
            <TokenMarkets {...tMarkets} />
          </div>
        )}

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg overflow-x-auto text-center">
          <div className="card">
            <div className="card-body p-4">
              <div className="flex gap-2 text-gray-500 font-bold">
                <div role="tablist" className="tabs tabs-bordered w-full">
                  <a
                    role="tab"
                    className={
                      "tab " +
                      (type === "chart" ? "tab-active text-green-700" : "")
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
                      "tab " +
                      (type === "info" ? "tab-active text-green-700" : "")
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
                      "tab " +
                      (type === "chat" ? "tab-active text-green-700" : "")
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
                      "tab lg:hidden " +
                      (type === "trades" ? "tab-active text-green-700" : "")
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
                      "tab lg:hidden " +
                      (type === "markets" ? "tab-active text-green-700" : "")
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
          {graduate && (
            <>
              <div className="h-[300px] lg:h-[450px]">
                {type == "chart" && <TokenChartPool {...tChartPool} />}
                {type == "info" && <TokenInfo {...tInfo} />}
                {type == "chat" && <TokenChat {...tChat} />}
                {type == "trades" && <TokenTradePool {...tTradePool} />}
                {type == "markets" && <TokenMarkets {...tMarkets} />}
              </div>
              <div className="divider my-1"></div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl m-4 border border-green-100">
                <TokenSwapPool {...tSwapPool} />
              </div>
            </>
          )}
          {!graduate && (
            <>
              <div className="h-[300px] lg:h-[450px]">
                {type == "chart" && <TokenChartFun {...tChartFun} />}
                {type == "info" && <TokenInfo {...tInfo} />}
                {type == "chat" && <TokenChat {...tChat} />}
                {type == "trades" && <TokenTradeFun {...tTradeFun} />}
                {type == "markets" && <TokenMarkets {...tMarkets} />}
              </div>
              <div className="divider my-1"></div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl m-4 border border-green-100">
                <TokenSwapFun {...tSwapFun} />
              </div>
            </>
          )}
        </div>
        {windowWidth > 1024 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center overflow-y-auto">
            {graduate ? (
              <TokenTradePool {...tTradePool} />
            ) : (
              <TokenTradeFun {...tTradeFun} />
            )}
          </div>
        )}
      </div>
    </>
  ) : (
    <>
      <Loading />
      <div className="text-center mt-10 text-gray-600">Searching for {token}</div>
    </>
  );
};

export default Swap;
