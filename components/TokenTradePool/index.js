import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { getDateSpecifics } from "../Utils";
import { formatEther } from "viem";
import { useRouter } from "next/router";

const TokenTradePool = (props) => {
  const { poolAddress } = props;
  const [data, setData] = useState({ type: 1 });

  return (
    <div className="card" id="chart">
      <div className="card-body p-2">
        <div className="font-bold text-sm flex gap-2">
          <div
            className={
              "hover:text-green-700 cursor-pointer " +
              (data?.type == 1 ? "text-green-700" : "")
            }
            onClick={() => {
              setData({ ...data, type: 1 });
            }}
          >
            Market Trades
          </div>
          <div
            className={
              "hover:text-green-700 cursor-pointer " +
              (data?.type == 2 ? "text-green-700" : "")
            }
            onClick={() => {
              setData({ ...data, type: 2 });
            }}
          >
            My Trades
          </div>
        </div>
        {data?.type == 1 && (
          <div className="h-[470px] lg:h-screen">
            <iframe
              height="100%"
              width="100%"
              id="geckoterminal-embed"
              title="GeckoTerminal Embed"
              src={
                "https://www.geckoterminal.com/xdc/pools/" +
                poolAddress +
                "?embed=1&info=0&swaps=1&chart=0"
              }
              frameBorder="0"
              allow="clipboard-write"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {data?.type == 2 && <div>Coming soon</div>}
      </div>
    </div>
  );
};

export default TokenTradePool;
