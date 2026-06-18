import Head from "next/head";
import Image from "next/image";
import Navbar from "../Navbar";
import MobileNav from "../MobileNav";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useMemo } from "react";
import { useChainId } from "wagmi";
import { bsc } from "@/config/chains";
import { useRouter } from "next/router";

const BscUnderConstruction = ({ t }) => (
  <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-white px-4 py-10">
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <div className="w-full max-w-xl">
        <Image
          src="/bbbpump-card.png"
          alt={t.bscHome.imageAlt}
          width={1600}
          height={776}
          priority
          className="h-auto w-full object-contain"
        />
      </div>
      <div className="mt-7 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
        BSC
      </div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t.bscHome.title}
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600">
        {t.bscHome.description}
      </p>
    </div>
  </section>
);

const Layout = ({ children }) => {
  const t = useTranslation();
  const router = useRouter();
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const { isReady, pathname, replace } = router;
  const siteOrigin = useMemo(() => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit.replace(/\/$/, "");
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "";
  }, []);
  const ogImage = siteOrigin ? `${siteOrigin}/bbb.jpg` : "";

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
      <div className={`min-h-screen ${isBscChain ? "bg-white" : "mobile-safe-bottom"}`}>
        <Navbar />
        {isBscChain ? <BscUnderConstruction t={t} /> : children}
      </div>

      {!isBscChain && <MobileNav />}
    </main>
  );
};

export default Layout;
