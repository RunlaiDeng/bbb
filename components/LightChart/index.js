import React, { useEffect, useRef, useMemo, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";

const LightChart = ({ 
  trade = [], 
  height = 470,
  colors = {
    backgroundColor: 'white',
    lineColor: '#2962FF',
    textColor: 'black',
    areaTopColor: '#2962FF',
    areaBottomColor: 'rgba(41, 98, 255, 0.28)',
  }
}) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const resizeObserverRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  const chartOptions = useMemo(() => ({
    layout: {
      background: { type: ColorType.Solid, color: colors.backgroundColor },
      textColor: colors.textColor,
    },
    width: containerWidth,
    height: height,
    grid: {
      vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
      horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
    },
    crosshair: {
      mode: 0,
    },
    rightPriceScale: {
      borderColor: 'rgba(197, 203, 206, 0.8)',
      mode: 1,
    },
    timeScale: {
      borderColor: 'rgba(197, 203, 206, 0.8)',
      timeVisible: true,
      secondsVisible: false,
    },
  }), [height, colors, containerWidth]);

  // 初始化容器宽度
  useEffect(() => {
    if (chartContainerRef.current) {
      setContainerWidth(chartContainerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !containerWidth) return;

    const handleResize = () => {
      const newWidth = chartContainerRef.current?.clientWidth;
      if (newWidth && newWidth !== containerWidth) {
        setContainerWidth(newWidth);
        chartRef.current?.applyOptions({ width: newWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });

    try {
      candleSeries.setData(trade);
    } catch (error) {
      console.error('Error setting chart data:', error);
    }

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
      chart.remove();
    };
  }, [trade, chartOptions, containerWidth]);

  return (
    <div className="relative w-full">
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{
          visibility: trade.length ? 'visible' : 'hidden'
        }}
      />
      {!trade.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};

export default LightChart;
