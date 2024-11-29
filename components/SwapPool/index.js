import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContracts,
  useSendTransaction,
  useWatchAsset,
} from "wagmi";
import { contracts, bbbInfo, icecreamswap, xswapDexLink } from "@/config";
import LightChart from "@/components/LightChart";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import rpc from "@/components/Rpc";
import Link from "next/link";
import { parseEther, formatEther, erc20Abi } from "viem";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
import { track } from "@vercel/analytics";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import SendButton from "@/components/SendButton";
import {
  getBBBPrice,
  getDate,
  getFollowing,
  getKline,
  getPool,
  getQuoteFromPool,
  getQuoteFrompoolAddress,
  setFollowing,
} from "@/components/Utils";
import Live from "../Live";
import TokenInfo from "../TokenInfo";
import TokenChat from "../TokenChat";
import TokenTrade from "../TokenTrade";
import useWindowSize from "../Hook/useWindowSize";
import TokenSwapPool from "../TokenSwapPool";

const BBB = (props) => {
  const [mount, setMount] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { watchAsset } = useWatchAsset();
  const { success, info, failure } = useNotification();
  const router = useRouter();
  const { token } = props;

  const chainId = useChainId();
  const bbb = contracts[chainId]?.bbb;
  const [data, setData] = useState({
    state: "buy",
  });

  async function fetchData() {
    setMount(false);
    if (token) {
      const pool = await getPool(token);
      if (pool) {
        const poolInfo = {
          price: pool?.base_token_price_usd || 0,
          priceChange24h: pool?.price_change_percentage?.h24 / 100 || 0,
          cap: pool?.market_cap_usd || 0,
          volumeH24: pool?.volume_usd?.h24,
        };

        // const kline = await getKline(pool?.address);
        const kline = [];

        setData({ ...data, pool, poolInfo, kline: kline?.reverse() });
      }
    }

    setMount(true);
  }
  useEffect(() => {
    fetchData();
  }, [token]);

  const poolAddress = data?.pool?.address;

  const poolCap = data?.poolInfo?.cap;

  useEffect(() => {
    fetchData();
    setMount(true);
  }, []);

  const { address, isConnected } = useAccount();

  const mbbb = contracts[chainId]?.mbbbv2;

  const tokenContract = { address: token, abi: ERC20ABI };

  const { data: reads0, refetch: refetch0 } = useReadContracts({
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
  if (poolAddress) {
    coingecko = "https://www.geckoterminal.com/xdc/pools/" + poolAddress;
  }

  const { width: windowWidth } = useWindowSize();

  const live = { name, symbol, token, index, isDeployer: deployer == address };

  const isBBB = token == bbbInfo.address;
  const canUpdate = address == deployer && !isBBB;
  const graduate = true;

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
  const tTrade = {
    poolAddress,
    token,
    graduate,
  };
  const tSwap = {
    poolAddress,
    isBBB,
    symbol,
    imageUrl,
    token,
  };
  return (
    mount && (
      <>
        {/* <div className="text-center">
          <div
            className="btn btn-ghost w-max hover:text-green-700 hover:bg-inherit text-2xl"
            onClick={() => {
              router.push("/");
            }}
          >
            [Go back]
          </div>
        </div> */}
        {/* <Live {...live} /> */}
        {!poolAddress && (
          <div className="flex justify-center items-center mt-48">
            <div className="loading loading-bars loading-lg text-success"></div>
          </div>
        )}
        {!poolAddress && (
          <div className="text-center mt-10">Searching for {token}</div>
        )}
        {poolAddress && (
          <>
            <div className="card outline rounded-none outline-gray-200 sm:mx-2 py-1">
              <div className="card-body p-0">
                <div className="px-4 sm:flex gap-1 ">
                  <div className="font-bold">
                    {name} (${symbol})
                  </div>

                  <div
                    className="hover:underline cursor-pointer flex gap-1 items-center"
                    onClick={(e) => {
                      router.push("/dashboard/" + deployer);
                    }}
                  >
                    by
                    <div className="h-4 w-4 overflow-hidden">
                      <Image
                        height={400}
                        width={400}
                        src={"/bbb.jpg"}
                        alt={""}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {deployer?.substr(36)}
                  </div>
                  <div>at {createTime}</div>
                  <div>cap: ${Number(poolCap)?.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="m-auto grid md:grid-cols-5 sm:mx-2 gap-[1px]">
              {windowWidth > 768 && (
                <div className="md:col-span-1 text-center  hidden md:block">
                  <TokenInfo {...tInfo} />
                  <TokenChat {...tChat} />
                </div>
              )}

              <div className="md:col-span-3 font-bold text-2xl text-center">
                <TokenSwapPool {...tSwap} />
              </div>
              {windowWidth > 768 && (
                <div className="md:col-span-1 text-center  hidden md:block">
                  <TokenTrade {...tTrade} />
                </div>
              )}
            </div>
          </>
        )}
      </>
    )
  );
};

export default BBB;
