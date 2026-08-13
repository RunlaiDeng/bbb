import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <link rel="canonical" href="https://defi.bbbfi.com/" />
        <meta
          name="keywords"
          content="BBBFiSwap, XDC, DEX, swap, liquidity, staking, BBB, USDC"
        />
        <meta property="og:url" content="https://defi.bbbfi.com/" />
        <meta property="og:site_name" content="BBBFiSwap" />
        <meta property="og:image" content="https://defi.bbbfi.com/bbb.jpg" />
        <meta name="twitter:image" content="https://defi.bbbfi.com/bbb.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
