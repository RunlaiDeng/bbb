import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from '@vercel/analytics/react';

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        {/* BBBPump Meta Tags */}
        <meta name="description" content="Official website of BBB Pump" />
        <meta name="keywords" content="bbbpump, BBB, crypto, meme token" />
        <meta name="author" content="BBB Team" />
        <meta property="og:title" content="BBB Pump - Next big meme token" />
        <meta
          property="og:description"
          content="Join the BBB Pump project and explore the next big thing in meme tokens."
        />
        <meta property="og:url" content="https://bbbpump.com" />
        <meta property="og:type" content="website" />

        {/* Benybadboy Meta Tags */}
        <meta name="description" content="Official website of Benybadboy" />
        <meta
          name="keywords"
          content="benybadboy, Beny, crypto, meme project, XDC"
        />
        <meta name="author" content="Benybadboy Team" />
        <meta
          property="og:title"
          content="Benybadboy - The journey continues"
        />
        <meta
          property="og:description"
          content="Follow Benybadboy for the latest in meme projects and crypto innovations."
        />
        <meta property="og:url" content="https://benybadboy.com" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
