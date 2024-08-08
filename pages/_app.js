import "../styles/globals.css";

import React from "react";
import Layout from "../components/Layout";
import "@rainbow-me/rainbowkit/styles.css";
import { http } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { xdc } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

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
};

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "2a612b9a18e81ce3fda2f82787eb6a4a",
  chains: [xdc],
  transports: {
    [xdc.id]: http("https://rpc.xdcrpc.com"),
    [xdcParentNet.id]: http("https://devnetstats.apothem.network/devnet"),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const MyApp = ({ Component, pageProps }) => {
  const { locale } = useRouter();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale={locale}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MyApp;
