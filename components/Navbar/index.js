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
        <div className="hidden md:flex">
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus="icon"
            showBalance="false"
          />
        </div>
        <div className="drawer drawer-end md:hidden">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer"
              className="btn drawer-button float-right"
            >
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
            </label>
          </div>
          <div className="drawer-side z-50">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
              {/* Sidebar content here */}

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
              <li>
                <div>
                  <ConnectButton
                    accountStatus={{
                      smallScreen: "avatar",
                      largeScreen: "full",
                    }}
                    chainStatus="icon"
                    showBalance="false"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
