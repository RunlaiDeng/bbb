import Head from "next/head";
import MobileNav from "../MobileNav";
import Navbar from "../Navbar";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useChainId } from "wagmi";
import { bsc } from "@/config/chains";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Layout({ children }) {
  const t = useTranslation();
  const router = useRouter();
  const { isReady, pathname, replace } = router;
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).replace(/\/$/, "");
  const ogImage = siteOrigin ? `${siteOrigin}/logo.png` : "";

  useEffect(() => {
    if (!isBscChain || !isReady || pathname === "/") return;
    replace("/");
  }, [isBscChain, isReady, pathname, replace]);

  return (
    <main className="min-h-screen">
      <Head>
        <title>{t.layout.defaultTitle}</title>
        <meta name="description" content={t.layout.defaultDescription} />
        <meta property="og:title" content={t.layout.defaultTitle} />
        <meta property="og:description" content={t.layout.defaultDescription} />
        <meta property="og:type" content="website" />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className={`${isBscChain ? "" : "mobile-safe-bottom"} min-h-screen`}>
        <Navbar />
        {children}
      </div>
      {!isBscChain ? <MobileNav /> : null}
    </main>
  );
}
