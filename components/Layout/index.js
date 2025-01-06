import Head from "next/head";
import Navbar from "../Navbar";
import { useRouter } from "next/router";
import Footer from "../Footer";
import MobileNav from "../MobileNav";
import { useAccount } from "wagmi";

const Layout = ({ children }) => {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <main>
      <div className="min-h-screen">
        <Navbar />
        {children}
      </div>

      <div className="pb-16 lg:pb-0">
        <Footer/>
      </div>
      <MobileNav />
    </main>
  );
};

export default Layout;
