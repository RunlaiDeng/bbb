import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="light" >
      <Head>
        <meta name="description" content="Official website of BBB Pump" />
        <meta name="keywords" content="bbbpump, BBB, crypto, meme token" />
        <meta name="author" content="BBB Team" />
        <meta property="og:title" content="BBB Pump - Next big meme token" />
        <meta property="og:description" content="Join the BBB Pump project and explore the next big thing in meme tokens." />
        <meta property="og:url" content="https://bbbpump.com" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
