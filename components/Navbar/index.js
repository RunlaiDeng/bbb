import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
const Navbar = () => {
  const router = useRouter();
  const pathname = router.pathname;
  return (
    <div className="navbar items-center h-20">
      <div className="navbar-start">
      </div>
      <div className="navbar-center flex"></div>
      <div className="navbar-end">
        <Link
          className="btn btn-primary w-auto m-auto mt-4"
          href={
            "https://xdc.sale/presale/0x6182c5cC8D21a63708e567684F6A01b691f24a5e"
          }
        >
          IDO NOW!
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
