import { linktree } from "@/config";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <Link href={linktree} target="_blank" className="hover:text-green-500 hover:underline">
          Contact us
        </Link>
        <p>Copyright © 2024 - All right reserved by BBB</p>
      </aside>
    </footer>
  );
};

export default Footer;
