import "../styles/globals.css";
import React from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { NotificationProvider } from "@/components/Context/notice";
import { WagmiProvider } from "wagmi";
import Head from "next/head";
import { FollowProvider } from "@/components/Context/follow";
import { xdc } from "../config/chains";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "../config/wagmi";
import { LanguageProvider, useLanguage } from "@/components/Context/LanguageContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const rkTheme = lightTheme({
  accentColor: "#16a34a",
  borderRadius: "large",
});

function RainbowKitWithLocale({ children }) {
  const { locale } = useLanguage();
  return (
    <RainbowKitProvider
      locale={locale === "zh" ? "zh-CN" : "en-US"}
      initialChain={xdc}
      theme={rkTheme}
    >
      {children}
    </RainbowKitProvider>
  );
}

const MyApp = ({ Component, pageProps }) => {
  useRouter();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FLNW2BCHW0"
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-FLNW2BCHW0');
        `}
      </Script>
      <LanguageProvider>
        <NotificationProvider>
          <FollowProvider>
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <RainbowKitWithLocale>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </RainbowKitWithLocale>
              </WagmiProvider>
            </QueryClientProvider>
          </FollowProvider>
        </NotificationProvider>
      </LanguageProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
