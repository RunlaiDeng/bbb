import { linktree } from "@/config";
import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  return (
    <footer className="footer footer-center">
      <Image
        src="/layer.png"
        height={1}
        width={100000}
        alt="full"
        className="w-full h-10"
      />
      <aside>

        <p className="font-black">
          Copyright © 2024 - All right reserved by BBBPump
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
