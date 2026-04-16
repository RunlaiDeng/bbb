import Head from "next/head";
import Navbar from "../Navbar";
import { useRouter } from "next/router";
import Footer from "../Footer";
import MobileNav from "../MobileNav";
import AppDownloadBanner from "../AppDownloadBanner";
import { useAccount } from "wagmi";

const Layout = ({ children }) => {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="min-h-screen mobile-safe-bottom max-w-[1920px] mx-auto px-3 sm:px-4">
        <Navbar />
        {children}
      </div>

      <div className="pb-16 lg:pb-0 hidden lg:block border-t border-base-300 bg-base-200/50">
        <Footer/>
      </div>
      <MobileNav />
      <AppDownloadBanner />
    </main>
  );
};

export default Layout;
