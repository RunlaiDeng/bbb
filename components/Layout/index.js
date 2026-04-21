import Head from "next/head";
import Navbar from "../Navbar";
import MobileNav from "../MobileNav";
import { useTranslation } from "@/lib/i18n/useTranslation";

const Layout = ({ children }) => {
  const t = useTranslation();
  return (
    <main className="min-h-screen">
      <Head>
        <title>{t.layout.defaultTitle}</title>
      </Head>
      <div className="min-h-screen mobile-safe-bottom">
        <Navbar />
        {children}
      </div>

      <MobileNav />
    </main>
  );
};

export default Layout;
