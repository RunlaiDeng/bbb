import { useRouter } from "next/router";
import { useEffect } from "react";
import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const { fromChain, toChain, fromToken, toToken, ...otherParams } = router.query;

  useEffect(() => {
    // 构建jumper.exchange的URL参数
    const params = new URLSearchParams();
    
    if (fromChain) params.append('fromChain', fromChain);
    if (toChain) params.append('toChain', toChain);
    if (fromToken) params.append('fromToken', fromToken);
    if (toToken) params.append('toToken', toToken);
    
    // 添加其他所有查询参数
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    // 构建完整的跳转URL
    const redirectUrl = `https://jumper.exchange/?${params.toString()}`;
    
    // 直接跳转
    window.location.href = redirectUrl;
  }, [router.query]);

  // 显示加载状态
  return <Loading />;
}
