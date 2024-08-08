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

        <div className="">
          {/* <Link
            className="btn btn-ghost mx-1 hover:text-green-500 hover:bg-inherit"
            href={"/buy"}
            target="_blank"
          >
            Buy $BBB
          </Link>
          <Link
            className="btn btn-ghost mx-1 hover:text-green-500 hover:bg-inherit"
            href={"/chart"}
            target="_blank"
          >
            Chart
          </Link>
          <Link
            className="btn btn-ghost mx-1 hover:text-green-500 hover:bg-inherit"
            href={"/farm"}
          >
            Farm
          </Link>
          <Link
            className="btn btn-ghost mx-1 hover:text-green-500 hover:bg-inherit"
            href={"/megadrop"}
          >
            Megadrop
          </Link>
          <Link
            className="btn btn-ghost mx-1 hover:text-green-500 hover:bg-inherit"
            href={"/referralProgram"}
          >
            Referral Program
          </Link> */}
          <Link
            className="btn btn-ghost mx-1 text-green-500 hover:bg-inherit"
            href={"/buy"}
            target="_blank"
          >
            Buy $BBB
          </Link>

          <div className="dropdown dropdown-hover">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 btn-ghost hover:text-green-500 hover:bg-inherit"
            >
              Financials(Earn) ↓
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <Link href={"/farm"}>Farm</Link>
              </li>
              <li>
                <Link href={"/referralProgram"}>Referral Program</Link>
              </li>
              <li>
                <Link href={"/megadrop"}>Megadrop</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="navbar-center flex hidden xl:block"></div>
      <div className="navbar-end">
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          chainStatus="icon"
          showBalance="false"
        />
        {/* <div className="dropdown ml-2 hidden xl:block dropdown-end">
          <div tabIndex={0} role="button" className="btn m-1">
            Theme
            <svg
              width="12px"
              height="12px"
              className="h-2 w-2 fill-current opacity-60 inline-block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
          >
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Default"
                value="default"
              />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Light"
                value="light"
              />
            </li>
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Dark"
                value="dark"
              />
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Navbar;
