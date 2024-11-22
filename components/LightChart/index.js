// components/CandleStickChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandleStickChart = (props) => {
  const priceChartContainerRef = useRef();
  const priceChartRef = useRef();
  const resizeObserverRef = useRef();

  const { trade } = props; // 仅接收交易数据

  useEffect(() => {
    // 创建价格图表
    const priceChart = createChart(priceChartContainerRef.current, {
      width: priceChartContainerRef.current.clientWidth,
      height: 300,
    });
    priceChartRef.current = priceChart;
    priceChart.priceScale("right").applyOptions({
      mode: 1,
    });
    const candleSeries = priceChart.addCandlestickSeries({
      priceFormat: {
        minMove: 0.000001,
      },
    });
    candleSeries.setData(trade || []);

    // 监听窗口大小变化
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      priceChart.applyOptions({ width });
    });

    resizeObserverRef.current.observe(priceChartContainerRef.current);

    return () => {
      resizeObserverRef.current.disconnect();
      priceChart.remove();
    };
  }, [trade]); // 依赖数组中仅保留 trade

  return (
    <div>
      <div ref={priceChartContainerRef} className="w-full" />
    </div>
  );
};

export default CandleStickChart;
