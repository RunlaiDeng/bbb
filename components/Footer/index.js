import { linktree, submitTokenInfo } from "@/config";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="footer footer-center p-4">
      <aside>
        <div className="grid grid-cols-2">
          <Link
            href={linktree}
            target="_blank"
            className="hover:text-green-500 hover:underline"
          >
            Contact Us
          </Link>
          <Link
            href={submitTokenInfo}
            target="_blank"
            className="hover:text-green-500 hover:underline"
          >
            Submit Token Info
          </Link>
        </div>

        <p>Copyright © 2024 - All right reserved by BBB</p>
      </aside>
    </footer>
  );
};

export default Footer;
