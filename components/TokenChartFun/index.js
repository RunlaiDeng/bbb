import LightChart from "@/components/LightChart";
import { contracts } from "@/config";
import { useChainId, useReadContracts } from "wagmi";
import { deleteSame } from "../Utils";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";

const TokenChartFun = (props) => {
  let { index, token, xdcPrice, symbol } = props;
  index = index?.toString();
  const chainId = useChainId();

  const [data, setData] = useState({ type: 1 });

  async function fetchData() {
    if (token) {
      const kline = await rpc.getKline(token, data?.type);
      setData({ ...data, kline });
    }
  }

  useEffect(() => {
    fetchData();
  }, [token, data?.type]);
  //   const mbbb = contracts[chainId]?.mbbbv2;

  //   const { data: reads0, refetch: refetch0 } = useReadContracts({
  //     contracts: [
  //       {
  //         ...mbbb,
  //         functionName: "getKlineLength",
  //         args: [index],
  //       },
  //     ],
  //   });
  //   const klineLength = reads0?.[0]?.result;

  //   const searchKline = [];
  //   for (let i = 0; i < klineLength; i++) {
  //     searchKline.push({
  //       ...mbbb,
  //       functionName: "klineMap",
  //       args: [index, i],
  //     });
  //   }
  //   const { data: reads2, refetch: refetch2 } = useReadContracts({
  //     contracts: searchKline,
  //   });
  //   let klineMap = reads2?.map((item) => {
  //     const kline = item?.result;
  //     let high;
  //     let low;
  //     let color;
  //     const time = Number(kline?.[0] || 0);
  //     const open = xdcPrice * Number(formatEther(kline?.[1] || 0)) * 2;
  //     const close = xdcPrice * Number(formatEther(kline?.[2] || 0)) * 2;
  //     const value = xdcPrice * Number(formatEther(kline?.[3] || 0));

  //     if (open > close) {
  //       low = open;
  //       high = close;
  //       color = "#ef5350";
  //     } else {
  //       low = close;
  //       high = open;
  //       color = "#26a69a";
  //     }
  //     return {
  //       time,
  //       open,
  //       close,
  //       value,
  //       high,
  //       low,
  //       color,
  //     };
  //   });

  //   klineMap = deleteSame(klineMap);

  const trade = {
    trade: data?.kline,
    volume: data?.kline,
    height: 250,
  };
  return (
    <div className="card h-full overflow-y-auto" id="chart">
      <div className="card-body p-2 pt-0">
        {data?.type == 1 && (
          <div
            className="text-left btn w-max btn-sm"
            onClick={() => {
              setData({ ...data, type: 2 });
            }}
          >
            {symbol} / USD
          </div>
        )}
        {data?.type == 2 && (
          <div
            className="text-left btn w-max btn-sm"
            onClick={() => {
              setData({ ...data, type: 1 });
            }}
          >
            {symbol} / XDC
          </div>
        )}
        <LightChart {...trade} />
      </div>
    </div>
  );
};

export default TokenChartFun;
