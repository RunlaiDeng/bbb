import LightChart from "@/components/LightChart";
import { contracts } from "@/config";
import { useChainId, useReadContracts } from "wagmi";
import { deleteSame } from "../Utils";
import { formatEther } from "viem";

const TokenChartFun = (props) => {
  let { index, xdcPrice } = props;
  index = index?.toString();
  const chainId = useChainId();
  const mbbb = contracts[chainId]?.mbbbv2;

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getKlineLength",
        args: [index],
      },
    ],
  });
  const klineLength = reads0?.[0]?.result;

  const searchKline = [];
  for (let i = 0; i < klineLength; i++) {
    searchKline.push({
      ...mbbb,
      functionName: "klineMap",
      args: [index, i],
    });
  }
  const { data: reads2, refetch: refetch2 } = useReadContracts({
    contracts: searchKline,
  });
  let klineMap = reads2?.map((item) => {
    const kline = item?.result;
    let high;
    let low;
    let color;
    const time = Number(kline?.[0] || 0);
    const open = xdcPrice * Number(formatEther(kline?.[1] || 0)) * 2;
    const close = xdcPrice * Number(formatEther(kline?.[2] || 0)) * 2;
    const value = xdcPrice * Number(formatEther(kline?.[3] || 0));

    if (open > close) {
      low = open;
      high = close;
      color = "red";
    } else {
      low = close;
      high = open;
    }
    return {
      time,
      open,
      close,
      value,
      high,
      low,
      color,
    };
  });

  klineMap = deleteSame(klineMap);

  const trade = {
    trade: klineMap,
    volume: klineMap,
  };
  return (
    <>
      <div className="card" id="chart">
        <div className="card-body p-2">
          <LightChart {...trade} />
        </div>
      </div>
    </>
  );
};

export default TokenChartFun;
