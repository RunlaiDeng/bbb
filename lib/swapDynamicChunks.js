import dynamic from "next/dynamic";

/** Stable loading UI for chart / tab panels to reduce CLS */
export function SwapPanelSkeleton() {
  return (
    <div
      className="h-[300px] lg:h-[450px] w-full rounded-lg bg-gray-100 animate-pulse border border-gray-200"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}

const panelOpts = {
  ssr: false,
  loading: SwapPanelSkeleton,
};

export const DynamicTokenChartPool = dynamic(
  () => import("@/components/TokenChartPool"),
  panelOpts
);

export const DynamicTokenChartFun = dynamic(
  () => import("@/components/TokenChartFun"),
  panelOpts
);

export const DynamicTokenTradePool = dynamic(
  () => import("@/components/TokenTradePool"),
  panelOpts
);

export const DynamicTokenTradeFun = dynamic(
  () => import("@/components/TokenTradeFun"),
  panelOpts
);

export const DynamicTokenMarkets = dynamic(
  () => import("@/components/TokenMarkets"),
  panelOpts
);

export const DynamicTokenInfo = dynamic(
  () => import("@/components/TokenInfo"),
  panelOpts
);

export const DynamicTokenChat = dynamic(
  () => import("@/components/TokenChat"),
  panelOpts
);

export const DynamicTokenSwapFun = dynamic(
  () => import("@/components/TokenSwapFun"),
  panelOpts
);
