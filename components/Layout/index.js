import Navbar from "../Navbar";
import MobileNav from "../MobileNav";

const Layout = ({ children }) => {
  return (
    <main className="min-h-screen">
      <div className="min-h-screen mobile-safe-bottom">
        <Navbar />
        {children}
      </div>

      <MobileNav />
    </main>
  );
};

export default Layout;
