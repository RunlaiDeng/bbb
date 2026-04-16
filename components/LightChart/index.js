import React, { useEffect, useRef, useMemo, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";

const LightChart = ({
  trade = [],
  colors = {
    backgroundColor: "#12161f",
    lineColor: "#38bdf8",
    textColor: "#e5e7eb",
    areaTopColor: "#38bdf8",
    areaBottomColor: "rgba(56, 189, 248, 0.2)",
  },
}) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const resizeObserverRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const chartOptions = useMemo(
    () => ({
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor },
        textColor: colors.textColor,
      },
      width: containerWidth,
      height: containerHeight,
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.25)",
        mode: 1,
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.25)",
        timeVisible: true,
        secondsVisible: false,
      },
    }),
    [colors, containerWidth, containerHeight]
  );

  // 初始化容器尺寸
  useEffect(() => {
    if (chartContainerRef.current) {
      setContainerWidth(chartContainerRef.current.clientWidth);
      setContainerHeight(chartContainerRef.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !containerWidth || !containerHeight) return;

    const handleResize = () => {
      const newWidth = chartContainerRef.current?.clientWidth;
      const newHeight = chartContainerRef.current?.clientHeight;
      
      if (newWidth && newWidth !== containerWidth) {
        setContainerWidth(newWidth);
        chartRef.current?.applyOptions({ width: newWidth });
      }
      
      if (newHeight && newHeight !== containerHeight) {
        setContainerHeight(newHeight);
        chartRef.current?.applyOptions({ height: newHeight });
      }
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 6,
        minMove: 0.000001,
      },
    });

    try {
      candleSeries.setData(trade);
    } catch (error) {
      console.error("Error setting chart data:", error);
    }

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
      chart.remove();
    };
  }, [trade, chartOptions, containerWidth, containerHeight]);

  return (
    <div className="h-full">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{
          visibility: trade.length ? "visible" : "hidden",
        }}
      />
      {!trade.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-base-content/50">No data available</p>
        </div>
      )}
    </div>
  );
};

export default LightChart;
