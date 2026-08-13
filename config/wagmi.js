import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage } from "wagmi";
import { http, fallback } from "viem";
import { bsc, xdc } from "./chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const walletConnectFallbackId = "2a612b9a18e81ce3fda2f82787eb6a4a";

if (typeof window === "undefined" && !walletConnectProjectId) {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Set it in production; a temporary fallback is used so the app can build and run locally."
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "BBBFI",
  projectId: walletConnectProjectId || walletConnectFallbackId,
  chains: [xdc, bsc],
  transports: {
    [xdc.id]: fallback(
      [
        http("https://rpc.ankr.com/xdc"),
        http("https://rpc.xdcrpc.com"),
        http("https://erpc.xdcrpc.com"),
      ],
      { retryCount: 2 }
    ),
    [bsc.id]: fallback(
      [
        http("https://bsc-rpc.publicnode.com"),
        http("https://bsc-dataseed.binance.org"),
      ],
      { retryCount: 2 }
    ),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
