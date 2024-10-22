import "../styles/globals.css";

import React from "react";
import Layout from "../components/Layout";
import "@rainbow-me/rainbowkit/styles.css";
import { http } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { NotificationProvider } from "@/components/Context/notice";

const xdc = /*#__PURE__*/ {
  id: 50,
  name: "XinFin Network",
  nativeCurrency: {
    decimals: 18,
    name: "XDC",
    symbol: "XDC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.xdcrpc.com"] },
  },
  blockExplorers: {
    default: {
      name: "xdcscan",
      url: "https://xdcscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF",
      blockCreated: 75884020,
    },
  },
};

const xdcParentNet = {
  id: 551,
  name: "XDC Devnet",
  network: "XDC Devnet",
  nativeCurrency: {
    decimals: 18,
    name: "XDC",
    symbol: "XDC",
  },
  rpcUrls: {
    public: { http: ["https://devnetstats.apothem.network/devnet"] },
    default: { http: ["https://devnetstats.apothem.network/devnet"] },
  },
  iconUrl: "/bbb.jpg",
};

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Benybadboy",
  projectId: "2a612b9a18e81ce3fda2f82787eb6a4a",
  chains: [xdc, xdcParentNet],
  transports: {
    [xdc.id]: http("https://rpc.xdcrpc.com"),
    [xdcParentNet.id]: http("https://devnetstats.apothem.network/devnet"),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const MyApp = ({ Component, pageProps }) => {
  const { locale } = useRouter();
  return (
    <NotificationProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider locale={locale} showRecentTransactions={true}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NotificationProvider>
  );
};

export default MyApp;
