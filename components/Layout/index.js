import Head from "next/head";
import Navbar from "../Navbar";
import { useRouter } from "next/router";
import Footer from "../Footer";
const Layout = ({ children }) => {
  const router = useRouter();

  return (
    <main>
      <div className="min-h-screen">
        <Navbar />
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default Layout;
