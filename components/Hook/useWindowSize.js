import { useState, useEffect } from "react";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // 定义处理窗口大小变化的函数
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 添加事件监听器
    window.addEventListener("resize", handleResize);

    // 初始化窗口大小
    handleResize();

    // 清理事件监听器
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
