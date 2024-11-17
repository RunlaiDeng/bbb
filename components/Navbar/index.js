import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useNotification } from "../Context/notice";
import { useAccount, useDisconnect } from "wagmi";
const Navbar = () => {
  const router = useRouter();

  const [data, setData] = useState({});

  const { info } = useNotification();

  const { address, isConnected } = useAccount();

  const { openConnectModal } = useConnectModal();

  const { disconnect } = useDisconnect();

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
                  className="dropdown-content menu bg-base-100 rounded-md z-[1] w-52 p-2 shadow"
                >
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
            {isConnected && (
              <div className="flex items-center gap-2 btn-success">
                <div
                  className="btn btn-sm text-white"
                  onClick={() => {
                    info("coming soon");
                  }}
                >
                  Deposit
                </div>
                <div
                  className={
                    "w-8 dropdown dropdown-end " +
                    (data?.showUserItems ? "dropdown-open" : "")
                  }
                  onMouseEnter={() => setData({ ...data, showUserItems: true })}
                  onMouseLeave={() =>
                    setData({ ...data, showUserItems: false })
                  }
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="1866"
                    width="20"
                    height="20"
                    className="cursor-pointer"
                  >
                    <path
                      d="M512 62.08A449.92 449.92 0 1 0 961.92 512 449.92 449.92 0 0 0 512 62.08z m0 135.04a135.04 135.04 0 1 1-135.04 135.04A134.72 134.72 0 0 1 512 197.12z m0 640a323.84 323.84 0 0 1-269.76-144.96c0-89.6 179.84-138.56 269.76-138.56s268.48 48.96 269.76 138.56A323.84 323.84 0 0 1 512 835.84z"
                      p-id="1867"
                      fill={data?.showUserItems ? "#0e932e" : ""}
                    ></path>
                  </svg>
                  <div
                    tabIndex={0}
                    className={
                      "card dropdown-content menu bg-white rounded-md z-[1] w-72 shadow p-0 text-xs"
                    }
                  >
                    <div className="card-body p-0">
                      <div className="flex items-center gap-2 p-4">
                        <Image
                          src="/user.png"
                          alt="user"
                          height={40}
                          width={40}
                          className="rounded-md"
                        />
                        <div>
                          <div>{address?.substr(36)}</div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={() => {
                          info("coming soon");
                        }}
                      >
                        <svg
                          size="24"
                          class="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M4 8.5A4.5 4.5 0 018.5 4H20v16H8.5A4.5 4.5 0 014 15.5v-7zM8.5 7H17v3H8.5a1.5 1.5 0 110-3zm4.5 6h4v4h-4v-4z"
                            fill="currentColor"
                          ></path>
                        </svg>

                        <div>Assets</div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={() => {
                          info("coming soon");
                        }}
                      >
                        <svg
                          size="24"
                          class="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M4.5 3v18h4.91A7.5 7.5 0 0118.5 9.365V7l-4-4h-10zm16 13a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zm-4.79-2.875h-2v4l3.031 1.75 1-1.732-2.031-1.173v-2.845z"
                            fill="currentColor"
                          ></path>
                        </svg>
                        <div>Orders</div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={() => {
                          router.push("/referral");
                        }}
                      >
                        <svg
                          class="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M11 8.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM2 17a3 3 0 013-3h5a3 3 0 013 3v3H2v-3zm14.5-1v-3h-3v-3h3V7h3v3h3v3h-3v3h-3z"
                            fill="currentColor"
                          ></path>
                        </svg>
                        <div>Refferal</div>
                      </div>
                      <div
                        className="flex items-center gap-2 hover:bg-gray-100 p-4 cursor-pointer"
                        onClick={() => {
                          disconnect();
                        }}
                      >
                        <svg
                     
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="7250"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M972.8 512l-307.2-256 0 153.6-358.4 0 0 204.8 358.4 0 0 153.6 307.2-256zM153.6 153.6l409.6 0 0-102.4-409.6 0c-56.32 0-102.4 46.08-102.4 102.4l0 716.8c0 56.32 46.08 102.4 102.4 102.4l409.6 0 0-102.4-409.6 0 0-716.8z"
                            fill="#444444"
                            p-id="7251"
                          ></path>
                        </svg>
                        <div>Log Out</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!isConnected && (
              <div
                className="btn btn-sm"
                onClick={() => {
                  openConnectModal();
                }}
              >
                Log In
              </div>
            )}

            <div className="drawer drawer-end md:hidden w-max">
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
                  className="btn drawer-button float-right btn-ghost p-0"
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
