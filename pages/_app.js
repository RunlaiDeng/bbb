import "../styles/globals.css";
import React from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { NotificationProvider } from "@/components/Context/notice";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import { FollowProvider } from "@/components/Context/follow";
import { xdc } from "../config/chains";
import Script from "next/script";
import { cookieStorage, createStorage } from "wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const config = createConfig({
  chains: [xdc],
  transports: {
    [xdc.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const privyConfig = {
  appearance: {
    accentColor: "#6A6FF5",
    theme: "#FFFFFF",
    showWalletLoginFirst: false,
    logo: "https://bbbpump.fun/bbbpump-card.png",
    walletChainType: "ethereum-only",
  },
  loginMethods: ["wallet", "sms", "email", "google"],
  fundingMethodConfig: {
    moonpay: {
      useSandbox: true,
    },
  },
  defaultChain: xdc,
  supportedChains: [xdc],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: false,
  },
  mfa: {
    noPromptOnMfaRequired: false,
  },
};

const MyApp = ({ Component, pageProps }) => {
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>BBBFi - Crypto Exchange For XDC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FLNW2BCHW0"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-FLNW2BCHW0');
        `}
      </Script>
      <NotificationProvider>
        <FollowProvider>
          <PrivyProvider appId="cm3uezqn203md3kangodaq4u6" config={privyConfig}>
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={config}>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </WagmiProvider>
            </QueryClientProvider>
          </PrivyProvider>
        </FollowProvider>
      </NotificationProvider>
    </>
  );
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
