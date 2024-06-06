import Head from "next/head";
import Navbar from "../Navbar";
import { useRouter } from "next/router";
const Layout = ({ children }) => {
  const router = useRouter();

  return (
    <main>
      <div className="min-h-screen z-50 relative">
        <Navbar />
        <div className="mt-8 w-96 m-auto md:w-1/2 card ">
          <div className="card-body">
            <div className="text-3xl">
              <span className="font-black text-blue-500"></span>
            </div>
            <div className="text-xs text-slate-500 mt-2"></div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
