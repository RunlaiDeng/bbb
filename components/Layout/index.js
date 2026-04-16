import Navbar from "../Navbar";
import Footer from "../Footer";
import MobileNav from "../MobileNav";
import AppDownloadBanner from "../AppDownloadBanner";

const Layout = ({ children }) => {
  return (
    <main className="min-h-screen">
      <div className="min-h-screen mobile-safe-bottom">
        <Navbar />
        {children}
      </div>

      <div className="pb-16 lg:pb-0 hidden lg:block">
        <Footer/>
      </div>
      <MobileNav />
      <AppDownloadBanner />
    </main>
  );
};

export default Layout;
