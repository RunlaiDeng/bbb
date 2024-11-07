import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { dexLink } from "@/config";
const Navbar = () => {
  const router = useRouter();

  const [data, setData] = useState({});

  return (
    <>
      <div className="bg-[url('/bg.png')] bg-center w-full h-18">
        <div className="navbar items-center font-black">
          <div className="navbar-start">
            <Image
              src={"/logo.png"}
              height={150}
              width={150}
              alt=""
              className=" cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            />
            {/* <div className="grid grid-cols-2 text-xs ml-2 whitespace-nowrap gap-2 md:gap-0">
              <div
                className="hover:text-green-500 cursor-pointer"
                onClick={() => {
                  window.open("https://x.com/bbbpumpdotfun");
                }}
              >
                [twitter]
              </div>
              <div
                className="hover:text-green-500 cursor-pointer"
                onClick={() => {
                  window.open("https://t.me/bbbsking");
                }}
              >
                [support]
              </div>
              <div
                className="hover:text-green-500 cursor-pointer"
                onClick={() => {
                  window.open("https://t.me/bbbpump");
                }}
              >
                [telegram]
              </div>
              <div
                className="hover:text-green-500 cursor-pointer"
                onClick={() =>
                  document.getElementById("howisworks").showModal()
                }
              >
                [how it works]
              </div>
            </div> */}

            <div className="ml-2 hidden md:flex items-center pt-1">
              {/* <Link
                className="btn mx-1 btn-ghost hover:bg-inherit shake-rainbow outline"
                href={"/buy"}
                target="_blank"
              >
                Buy $BBB
              </Link> */}

              <div className="dropdown dropdown-hover font-black">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn m-1 btn-ghost hover:text-green-500 hover:bg-inherit"
                >
                  More
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <Link
                      href={"/referral"}
                      className="hover:text-green-500 hover:bg-inherit"
                    >
                      Referral
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
                  <li>
                    <Link
                      href={"/farm"}
                      className="hover:text-green-500 hover:bg-inherit"
                    >
                      Farm
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
            <div className="drawer drawer-end md:hidden ">
              <input
                id="my-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={data?.drawerOpen}
                onChange={() => {
                  setData({ ...data, drawerOpen: true });
                }}
              />
              <div className="drawer-content">
                {/* Page content here */}
                <label
                  htmlFor="my-drawer"
                  className="btn drawer-button float-right btn-ghost"
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
              <div className="drawer-side z-50 font-black">
                <ul className="menu bg-base-200 text-base-content min-h-full w-full p-4 font-full">
                  {/* Sidebar content here */}
                  <li>
                    <div className="flex justify-between items-center">
                      <Image
                        src={"/logo.png"}
                        height={50}
                        width={150}
                        alt=""
                        className=" cursor-pointer"
                        onClick={() => {
                          router.push("/");
                        }}
                      />
                      <div className="text-right">
                        <svg
                          t="1726993124102"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="1658"
                          width="20"
                          height="20"
                          onClick={(e) => {
                            setData({ ...data, drawerOpen: false });
                          }}
                        >
                          <path
                            d="M918.4 489.6l-160-160c-12.8-12.8-32-12.8-44.8 0-12.8 12.8-12.8 32 0 44.8l105.6 105.6L512 480c-19.2 0-32 12.8-32 32s12.8 32 32 32l307.2 0-105.6 105.6c-12.8 12.8-12.8 32 0 44.8 6.4 6.4 12.8 9.6 22.4 9.6 9.6 0 16-3.2 22.4-9.6l160-163.2c0 0 0-3.2 3.2-3.2C931.2 518.4 931.2 499.2 918.4 489.6zM832 736c-19.2 0-32 12.8-32 32l0 64c0 19.2-12.8 32-32 32L224 864c-19.2 0-32-12.8-32-32L192 192c0-19.2 12.8-32 32-32l544 0c19.2 0 32 12.8 32 32l0 64c0 19.2 12.8 32 32 32s32-12.8 32-32L864 192c0-54.4-41.6-96-96-96L224 96C169.6 96 128 137.6 128 192l0 640c0 54.4 41.6 96 96 96l544 0c54.4 0 96-41.6 96-96l0-64C864 748.8 851.2 736 832 736z"
                            fill="#272636"
                            p-id="1659"
                          ></path>
                        </svg>
                      </div>
                    </div>
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
                  {/* <li>
                    <Link
                      className="btn mx-1 btn-ghost hover:bg-inherit shake-rainbow outline"
                      href={"/buy"}
                      target="_blank"
                    >
                      Buy $BBB
                    </Link>
                  </li> */}
                  <li>
                    <Link
                      className="hover:text-green-500 hover:bg-inherit"
                      href={"/"}
                      onClick={(e) => {
                        setData({ ...data, drawerOpen: false });
                      }}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="hover:text-green-500 hover:bg-inherit">
                      More
                    </div>
                    <ul>
                      <li>
                        <Link
                          href={"/referral"}
                          className="hover:text-green-500 hover:bg-inherit"
                          onClick={(e) => {
                            setData({ ...data, drawerOpen: false });
                          }}
                        >
                          Referral
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={"/megadrop"}
                          className="hover:text-green-500 hover:bg-inherit"
                          onClick={(e) => {
                            setData({ ...data, drawerOpen: false });
                          }}
                        >
                          Megadrop
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={"/farm"}
                          className="hover:text-green-500 hover:bg-inherit"
                          onClick={(e) => {
                            setData({ ...data, drawerOpen: false });
                          }}
                        >
                          Farm
                        </Link>
                      </li>
                    </ul>
                  </li>
               
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <dialog id="howisworks" className="modal text-center">
        <div className="modal-box">
          <h1 className="text-xl font-black">How is works</h1>
          <div className="font-black my-4">
            Pump prevents rugs by making sure that all created tokens are safe.
            Each coin on pump is a{" "}
            <span className="text-green-500">fair-launch</span> with{" "}
            <span className="text-blue-500">no presale</span> and{" "}
            <span className="text-orange-500">no team allocation.</span>
          </div>
          <div className="text-slate-500">
            <div className="my-4">step 1: pick a coin that you like</div>
            <div className="my-4">
              step 2: buy the coin on the bonding curve
            </div>
            <div className="my-4">
              step 3: sell at any time to lock in your profits or losses
            </div>
            <div className="my-4">
              step 4: when enough people buy on the bonding curve it reaches a
              market cap of 1m xdc
            </div>
            <div className="my-4">
              step 5: 1m xdc of liquidity is then deposited in icecreaswap and
              burned
            </div>
          </div>

          <div className="modal-action flex justify-center items-center">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">{"I'm ready to pump"}</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Navbar;
