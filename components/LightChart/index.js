// components/CandleStickChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandleStickChart = (props) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const resizeObserverRef = useRef();

  const trade = props?.trade;

  useEffect(() => {
    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries();

    candleSeries.setData(trade || []);

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      resizeObserverRef.current.disconnect();
      chart.remove();
    };
  }, [{ ...trade }]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
  );
};

export default CandleStickChart;
