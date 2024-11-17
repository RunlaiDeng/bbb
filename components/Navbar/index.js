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
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
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
                      "card dropdown-content menu bg-white rounded-md z-[1] w-max shadow p-0 text-xs"
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
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="7914"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M398.575 565.67H123.21c-33 0-60 27-60 60v273.735c0 33 27 60 60 60h275.364c33 0 60-27 60-60V625.67c0.001-33-26.999-60-59.999-60z m0 333.628a0.901 0.901 0 0 1-0.107 0.107h-275.15a0.901 0.901 0 0 1-0.107-0.107v-273.52a0.901 0.901 0 0 1 0.107-0.107h275.149v-0.001c0.037 0.031 0.076 0.07 0.108 0.108v273.52zM899.21 63.801H623.772c-33 0-60 27-60 60v273.735c0 33 27 60 60 60H899.21c33 0 60-27 60-60V123.801c0-33-27-60-60-60z m0.001 333.628a0.901 0.901 0 0 1-0.107 0.107H623.88a0.901 0.901 0 0 1-0.107-0.107v-273.52a0.901 0.901 0 0 1 0.107-0.107h275.223v-0.001c0.037 0.031 0.076 0.07 0.108 0.108v273.52zM398.649 63.801H123.21c-33 0-60 27-60 60v273.735c0 33 27 60 60 60h275.438c33 0 60-27 60-60V123.801c0.001-33-26.999-60-59.999-60z m0 333.628a0.901 0.901 0 0 1-0.107 0.107H123.318a0.901 0.901 0 0 1-0.107-0.107v-273.52a0.901 0.901 0 0 1 0.107-0.107h275.223v-0.001c0.037 0.031 0.076 0.07 0.108 0.108v273.52zM899.21 565.976h-274c-33 0-60 26.988-60 59.973v273.879c0 32.985 27 59.973 60 59.973h180c16.5 0 30-13.494 30-29.987s-13.5-29.987-30-29.987h-180V625.949h274v182.919c0 16.493 13.5 29.987 30 29.987s30-13.494 30-29.987V625.949c0-32.985-27-59.973-60-59.973z"
                            fill="#707070"
                            p-id="7915"
                          ></path>
                        </svg>
                        <div>Dashboard</div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={() => {
                          router.push("/referral");
                        }}
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="12564"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M664.2688 325.3248c0 22.1184-3.3792 43.3664-8.3968 64 96.9216-11.776 172.288-93.3888 172.288-193.536A195.8912 195.8912 0 0 0 632.32 0 194.4064 194.4064 0 0 0 483.6352 69.7856c104.96 37.888 180.6336 137.6256 180.6336 255.488"
                            fill="#5F5F5F"
                            p-id="12565"
                          ></path>
                          <path
                            d="M632.32 489.5744c-8.448 0-16.7424 0.3584-25.0368 0.6144-19.456 25.344-42.7008 47.36-69.7344 64.5632 174.7968 31.232 299.52 117.9648 319.5392 228.5568H1024v-97.8944c0-108.1856-175.3088-195.84-391.6288-195.84M391.68 521.1136c87.9104 0 161.3824-58.3168 186.1632-138.1376 5.6832-18.3296 9.6256-37.4784 9.6256-57.7024 0-89.088-59.904-163.4304-141.312-187.136a193.3312 193.3312 0 0 0-54.4768-8.704 195.84 195.84 0 1 0 0 391.68M519.5776 835.9936a50.688 50.688 0 0 1 50.3296-46.9504h74.6496v-74.6496c0-16.4352 8.2432-30.3616 20.224-39.7312-70.6048-34.3552-166.8608-55.6032-273.1008-55.6032-47.7696 0-93.184 4.5056-135.5776 12.288C106.752 658.944 0 730.5728 0 814.8992v97.8944H521.728c-1.4336-4.7104-2.9696-9.472-2.9696-14.6432V840.192c0-1.536 0.768-2.7648 0.8704-4.2496"
                            fill="#5F5F5F"
                            p-id="12566"
                          ></path>
                          <path
                            d="M804.864 840.192h-51.2V714.3424H695.808V840.192H569.856v57.9072H695.808V1024H753.664V898.0992h125.8496v-57.856H860.16z"
                            fill="#5F5F5F"
                            p-id="12567"
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
                          p-id="8994"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M128 213.333333c0-46.933333 38.4-85.333333 85.333333-85.333333h341.333334v85.333333H213.333333v597.333334h341.333334v85.333333H213.333333c-46.933333 0-85.333333-38.4-85.333333-85.333333V213.333333z m604.842667 256L624.64 361.130667l60.330667-60.330667 211.2 211.2-211.2 211.2-60.330667-60.330667L732.842667 554.666667H451.84v-85.333334h281.002667z"
                            fill="#000000"
                            p-id="8995"
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
