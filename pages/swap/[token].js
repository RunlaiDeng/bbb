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

  const { data: reads0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getDropTokenByAddress",
        args: [token],
      },
    ],
  });
  const dropToken = reads0?.[0]?.result;
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
  if (graduate) {
    const pool = data?.pool;
    poolCap = pool?.cap;
    poolAddress = pool?.address;
    showData = poolAddress != undefined && xdcPrice != undefined;
  } else {
    showData = dropToken != undefined && xdcPrice != undefined;
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

  return showData ? (
    <>
      {graduate ? (
        <TokenHeadPool {...tHeadPool} />
      ) : (
        <TokenHeadFun {...tHeadFun} />
      )}

      <div className="m-auto grid md:grid-cols-5 sm:mx-2 gap-[1px]">
        {windowWidth > 768 && (
          <div className="md:col-span-1 text-center  hidden md:block">
            <TokenInfo {...tInfo} />
            <TokenChat {...tChat} />
          </div>
        )}

        <div className="md:col-span-3 font-bold text-2xl text-center">
          {graduate ? (
            <TokenSwapPool {...tSwapPool} />
          ) : (
            <TokenSwapFun {...tSwapFun} />
          )}
        </div>
        {windowWidth > 768 && (
          <div className="md:col-span-1 text-center  hidden md:block">
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
