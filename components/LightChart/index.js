// components/CandleStickChart.js
import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const CandleStickChart = (props) => {
  const priceChartContainerRef = useRef();
  const volumeChartContainerRef = useRef();
  const priceChartRef = useRef();
  const volumeChartRef = useRef();
  const resizeObserverRef = useRef();

  const { trade, volume } = props; // 接收交易数据和交易量

  useEffect(() => {
    // 创建价格图表
    const priceChart = createChart(priceChartContainerRef.current, {
      width: priceChartContainerRef.current.clientWidth,
      height: 300,

      handleScroll: {
        mouseWheel: false, // 禁用鼠标滚轮
        pressedMouseMove: false, // 禁用按住鼠标移动
      },
    });
    priceChartRef.current = priceChart;

    const candleSeries = priceChart.addCandlestickSeries({
      priceFormat: {
        minMove: 0.000001,
      },
    });
    candleSeries.setData(trade || []);

    // 创建交易量图表
    const volumeChart = createChart(volumeChartContainerRef.current, {
      width: volumeChartContainerRef.current.clientWidth,
      height: 100,
      layout: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      handleScroll: {
        mouseWheel: false, // 禁用鼠标滚轮
        pressedMouseMove: false, // 禁用按住鼠标移动
      },
    });
    volumeChartRef.current = volumeChart;

    // 添加交易量柱状图系列
    const volumeSeries = volumeChart.addHistogramSeries({
      upColor: "green",
      downColor: "red",
      borderVisible: false,
    });
    volumeSeries.setData(volume || []);

    // 监听窗口大小变化
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      priceChart.applyOptions({ width });
      volumeChart.applyOptions({ width });
    });

    resizeObserverRef.current.observe(priceChartContainerRef.current);

    return () => {
      resizeObserverRef.current.disconnect();
      priceChart.remove();
      volumeChart.remove();
    };
  }, [trade, volume]); // 依赖数组中添加 trade 和 volume

  return (
    <div>
      <div
        ref={priceChartContainerRef}
        style={{ width: "100%", height: "300px" }}
      />
      <div
        ref={volumeChartContainerRef}
        style={{ width: "100%", height: "100px" }}
      />
    </div>
  );
};

export default CandleStickChart;
