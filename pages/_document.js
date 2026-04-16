import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="bbbexchange">
      <Head>
        <link rel="canonical" href="https://bbbpump.fun/"></link>
        <meta
          name="description"
          content="BBBPump | The First Meme Fair Launch Platform on XDC Network:swap,earn,meme culture,instantly tradable without having to seed liquidity"
        />

        <meta
          name="keywords"
          content="bbbpump, BBB, crypto, meme token, benybadboy"
        />
        <meta
          name="twitter:title"
          content="BBBPump - XDC Network's Meme Token | Build Your Community"
        ></meta>
        <meta
          name="twitter:description"
          content="Join BBBPump, the fun and community-driven meme token on the XDC Network. Pump the price, grow your community, and be part of the XDC revolution!"
        ></meta>
        <meta
          name="twitter:image"
          content="https://bbbpump.fun/bbbpump-card.png"
        ></meta>
        <meta name="twitter:card" content="summary_large_image"></meta>

        <meta property="og:url" content="https://bbbpump.fun/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BBBPump." />
        <meta
          property="og:description"
          content="The First Meme Fair Launch Platform on XDC Network:swap,earn,meme culture,instantly tradable without having to seed liquidity"
        />
        <meta property="og:title" content="BBBPump" />
        <meta
          property="og:image"
          content="https://bbbpump.fun/bbbpump-card.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
