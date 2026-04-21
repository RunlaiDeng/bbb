import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage } from "wagmi";
import { http } from "wagmi";
import { xdc } from "./chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "BBBFI",
  projectId:
    walletConnectProjectId ||
    "2a612b9a18e81ce3fda2f82787eb6a4a",
  chains: [xdc],
  transports: {
    [xdc.id]: http("https://rpc.ankr.com/xdc"),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
