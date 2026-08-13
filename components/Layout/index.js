import Head from "next/head";
import MobileNav from "../MobileNav";
import Navbar from "../Navbar";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Layout({ children }) {
  const t = useTranslation();
  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
  ).replace(/\/$/, "");
  const ogImage = siteOrigin ? `${siteOrigin}/logo.png` : "";

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
      <div className="mobile-safe-bottom min-h-screen">
        <Navbar />
        {children}
      </div>
      <MobileNav />
    </main>
  );
}
