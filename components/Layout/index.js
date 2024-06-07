import Head from "next/head";
import Navbar from "../Navbar";
import { useRouter } from "next/router";
const Layout = ({ children }) => {
  const router = useRouter();

  return (
    <main>
      <div className="min-h-screen">
        <Navbar />
        {children}
      </div>
    </main>
  );
};

export default Layout;
