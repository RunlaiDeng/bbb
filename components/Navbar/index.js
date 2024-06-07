import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
const Navbar = () => {
  const router = useRouter();
  const pathname = router.pathname;

  const ido =
    "https://xdc.sale/presale/0x6182c5cC8D21a63708e567684F6A01b691f24a5e";
  const linktree = "https://linktr.ee/benybadboy";

  return (
    <div className="navbar items-center">
      <div className="navbar-start">
        <Image
          src={"/bbb.jpg"}
          height={50}
          width={50}
          alt=""
          className="rounded-full cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        />
        <div className="md:hidden flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <details>
                <summary>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-5 h-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    ></path>
                  </svg>
                </summary>
                <ul className="p-2 bg-base-100 rounded-t-none z-50">
                  <li>
                    <Link href={linktree} target="_blank">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link target="_blank" href={ido}>
                      IDO NOW!
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center flex"></div>
      <div className="navbar-end">
        <div className="hidden md:block">
          <Link href={linktree} target="_blank" className="btn btn-accent mr-2">
            Contact
          </Link>
          <Link className="btn btn-primary mr-2" target="_blank" href={ido}>
            IDO NOW!
          </Link>
        </div>

        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;
