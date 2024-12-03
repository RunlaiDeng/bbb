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

  async function fetchGraduate() {
    if (token) {
      const pool = await getPool(token);
      if (pool) {
        const poolInfo = {
          price: pool?.base_token_price_usd || 0,
          priceChange24h: pool?.price_change_percentage?.h24 / 100 || 0,
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
    }
  }, [graduate, token]);

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
  };

  const tHeadFun = {
    index,
    name,
    symbol,
    token,
    xdcPrice,
    createTime,
    deployer,
  };

  const tChartPool = {
    poolAddress,
  };

  const tChartFun = { index, xdcPrice, token };

  const [type, setType] = useState("chart");

  useEffect(() => {
    if (windowWidth >= 1024) {
      setType("chart");
    }
  }, [windowWidth]);

  return showData ? (
    <>
      {graduate ? (
        <TokenHeadPool {...tHeadPool} />
      ) : (
        <TokenHeadFun {...tHeadFun} />
      )}

      <div className="m-auto grid lg:grid-cols-5 sm:mx-2 gap-[1px]">
        {windowWidth > 1024 && (
          <div className="text-center h-screen overflow-y-auto outline rounded-none outline-gray-200">
            <TokenInfo {...tInfo} />
            <div className="divider my-[0.5px]"></div>
            <TokenChat {...tChat} />
          </div>
        )}

        <div className="lg:col-span-3 font-bold text-2xl text-center h-screen overflow-y-auto outline rounded-none outline-gray-200">
          <div className="card">
            <div className="card-body p-2">
              <div className="flex gap-2 items-center">
                <div
                  className={
                    "font-bold text-sm cursor-pointer " +
                    (type == "chart" ? "text-green-700" : "")
                  }
                  onClick={() => {
                    setType("chart");
                  }}
                >
                  Chart
                </div>
                <div
                  className={
                    "font-bold text-sm cursor-pointer lg:hidden " +
                    (type == "info" ? "text-green-700" : "")
                  }
                  onClick={() => {
                    setType("info");
                  }}
                >
                  Info
                </div>
                <div
                  className={
                    "font-bold text-sm cursor-pointer lg:hidden " +
                    (type == "chat" ? "text-green-700" : "")
                  }
                  onClick={() => {
                    setType("chat");
                  }}
                >
                  Chat
                </div>
                <div
                  className={
                    "font-bold text-sm cursor-pointer lg:hidden " +
                    (type == "trades" ? "text-green-700" : "")
                  }
                  onClick={() => {
                    setType("trades");
                  }}
                >
                  Trades
                </div>
              </div>
            </div>
          </div>
          {graduate && (
            <>
              <div className="h-[500px]">
                {type == "chart" && <TokenChartPool {...tChartPool} />}
                {type == "info" && <TokenInfo {...tInfo} />}
                {type == "chat" && <TokenChat {...tChat} />}
                {type == "trades" && <TokenTradePool {...tTradePool} />}
              </div>
              <div className="divider my-1"></div>
              <TokenSwapPool {...tSwapPool} />
            </>
          )}
          {!graduate && (
            <>
              <div className="h-[500px]">
                {type == "chart" && <TokenChartFun {...tChartFun} />}
                {type == "info" && <TokenInfo {...tInfo} />}
                {type == "chat" && <TokenChat {...tChat} />}
                {type == "trades" && <TokenTradeFun {...tTradeFun} />}
              </div>
              <div className="divider my-1"></div>
              <TokenSwapFun {...tSwapFun} />
            </>
          )}
        </div>
        {windowWidth > 1024 && (
          <div className="text-center h-screen overflow-y-auto outline rounded-none outline-gray-200">
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
      <div className="flex justify-center items-center mt-48">
        <div className="loading loading-bars loading-lg text-success"></div>
      </div>
      <div className="text-center mt-10">Searching for {token}</div>
    </>
  );
};

export default Swap;
