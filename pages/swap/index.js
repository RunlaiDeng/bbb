import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function Home() {
  const router = useRouter();
  const { fromChain, toChain, fromToken, toToken } = router.query;

  // 创建动态的widgetConfig
  const widgetConfig = {
    appearance: "light",
    theme: {
      container: {
        border: "1px solid rgb(234, 234, 234)",
        borderRadius: "16px",
      },
    },
    fromChain: Number(fromChain),
    toChain: Number(toChain),
    fromToken,
    toToken,
  };

  return <LiFiWidget integrator="BBBFi" config={widgetConfig} />;
}
