import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { dexLink } from "@/config";
const Navbar = () => {
  const router = useRouter();

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

        <div className="ml-2 hidden md:flex">
          <Link
            className="btn mx-1 btn-ghost hover:bg-inherit animate-shake border-2 animate-shake-border"
            href={"/buy"}
            target="_blank"
          >
            Buy $BBB
          </Link>

          <div className="dropdown dropdown-hover font-black">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 btn-ghost hover:text-green-500 hover:bg-inherit"
            >
              Earn
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <Link
                  href={"/farm"}
                  className="hover:text-green-500 hover:bg-inherit"
                >
                  Farm
                </Link>
              </li>
              <li>
                <Link
                  href={"/referralProgram"}
                  className="hover:text-green-500 hover:bg-inherit"
                >
                  Referral Program
                </Link>
              </li>
              <li>
                <Link
                  href={"/megadrop"}
                  className="hover:text-green-500 hover:bg-inherit"
                >
                  Megadrop
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="navbar-center hidden xl:flex"></div>
      <div className="navbar-end">
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          chainStatus="icon"
          showBalance="false"
        />

        <div className="dropdown dropdown-end mx-1 md:hidden">
          <div tabIndex={0} role="button" className="btn m-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow font-black"
          >
            <ul className="menu rounded-box">
              <li>
                <Link
                  className="btn mx-1 btn-ghost hover:bg-inherit animate-shake border-2 animate-shake-border"
                  href={"/buy"}
                  target="_blank"
                >
                  Buy $BBB
                </Link>
              </li>
              <li>
                <div className=" hover:text-green-500 hover:bg-inherit">
                  Earn
                </div>
                <ul>
                  <li>
                    <Link
                      href={"/farm"}
                      className="hover:text-green-500 hover:bg-inherit"
                    >
                      Farm
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/referralProgram"}
                      className="hover:text-green-500 hover:bg-inherit"
                    >
                      Referral Program
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/megadrop"}
                      className="hover:text-green-500 hover:bg-inherit"
                    >
                      Megadrop
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
