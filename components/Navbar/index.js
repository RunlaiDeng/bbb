import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useNotification } from "../Context/notice";
import { useAccount, useDisconnect } from "wagmi";
import copy from "copy-to-clipboard";
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "../Hook/usePrivyLogin";
import { buyXDCLink } from "@/config";
const Navbar = () => {
  const router = useRouter();

  const [data, setData] = useState({});

  const [mount, setMount] = useState(false);
  const { info } = useNotification();

  const { address, isConnected } = useAccount();

  const { disconnect } = useDisconnect();
  const { success } = useNotification();

  const privyLogin = usePrivyLogin();

  const { login, logout, user } = usePrivy();

  const connectorType = user?.wallet?.connectorType;
  useEffect(() => {
    setMount(true);
  }, []);
  return (
    mount && (
      <>
        <div className="bg-[url('/bg.png')] bg-center w-full h-18">
          <div className="navbar items-center font-bold">
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
              {/* <div className="grid grid-cols-2 text-xs ml-2 whitespace-nowrap gap-2 lg:gap-0">
              <div
                className="hover:text-green-700 cursor-pointer"
                onClick={() => {
                  window.open("https://x.com/bbbpumpdotfun");
                }}
              >
                [twitter]
              </div>
              <div
                className="hover:text-green-700 cursor-pointer"
                onClick={() => {
                  window.open("https://t.me/bbbsking");
                }}
              >
                [support]
              </div>
              <div
                className="hover:text-green-700 cursor-pointer"
                onClick={() => {
                  window.open("https://t.me/bbbpump");
                }}
              >
                [telegram]
              </div>
              <div
                className="hover:text-green-700 cursor-pointer"
                onClick={() =>
                  document.getElementById("howisworks").showModal()
                }
              >
                [how it works]
              </div>
            </div> */}

              <div className="ml-2 hidden lg:flex items-center pt-1">
                <Link
                  href={buyXDCLink}
                  target="_blank"
                  className="btn btn-ghost hover:text-green-700 hover:bg-inherit"
                >
                  Buy XDC
                </Link>
                <Link
                  href={"/markets"}
                  className="btn btn-ghost hover:text-green-700 hover:bg-inherit"
                >
                  Markets
                </Link>
                <Link
                  href={"/swap/bbb"}
                  className="btn btn-ghost hover:text-green-700 hover:bg-inherit"
                >
                  Trade
                </Link>
                <Link
                  href={"/earn"}
                  className="btn btn-ghost hover:text-green-700 hover:bg-inherit"
                >
                  Earn
                </Link>
                <div className="dropdown dropdown-hover font-bold">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn m-1 btn-ghost hover:text-green-700 hover:bg-inherit"
                  >
                    More
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-md z-50 w-52 p-2 shadow"
                  >
                    <li>
                      <Link
                        href={"/stake"}
                        className="hover:text-green-700 hover:bg-inherit"
                      >
                        Stake
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/farm"}
                        className="hover:text-green-700 hover:bg-inherit"
                      >
                        Farm
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/activity"}
                        className="hover:text-green-700 hover:bg-inherit"
                      >
                        Activity
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/airdrophub"}
                        className="hover:text-green-700 hover:bg-inherit"
                      >
                        Airdrop Hub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="navbar-center hidden xl:flex"></div>
            <div className="navbar-end">
              {isConnected && (
                <div className="flex items-center gap-2 btn-success ">
                  <div
                    className="btn btn-sm text-white flex items-center"
                    onClick={() => {
                      router.push("/deposit");
                    }}
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="2583"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M881.778 446.578L510.52 813.909l-83.058-82.716-285.24-282.34 83.626-82.716L451.186 589.71V0h118.613v589.767l227.783-225.963 84.196 82.774z m-1.138 460.06H142.222V1024H880.64V906.638z"
                        p-id="2584"
                        fill="#ffffff"
                      ></path>
                    </svg>
                    Deposit
                  </div>
                  <div
                    className={
                      " dropdown dropdown-end hidden lg:block " +
                      (data?.showUserItems ? "dropdown-open" : "")
                    }
                    onMouseEnter={() =>
                      setData({ ...data, showUserItems: true })
                    }
                    onMouseLeave={() =>
                      setData({ ...data, showUserItems: false })
                    }
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="1866"
                      width="24"
                      height="24"
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
                        "card dropdown-content menu bg-white rounded-md z-50 w-72 shadow p-0 text-xs"
                      }
                    >
                      <div className="card-body p-0 font-medium">
                        <div className="flex items-center gap-1 p-4 text-xl">
                          <Image
                            src="/bbb.jpg"
                            alt="user"
                            height={40}
                            width={40}
                            className="rounded-md"
                          />
                          <div>
                            <div>{address?.substr(36)}</div>
                          </div>
                          <div
                            className={"cursor-pointer tooltip"}
                            data-tip="Copy Address"
                            onClick={() => {
                              copy(address);
                              success("copy success!");
                            }}
                          >
                            <svg
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="1641"
                              width="20"
                              height="20"
                            >
                              <path
                                d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                                fill="#5E6570"
                                p-id="1642"
                              ></path>
                              <path
                                d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                                fill="#5E6570"
                                p-id="1643"
                              ></path>
                              <path
                                d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                                fill="#5E6570"
                                p-id="1644"
                              ></path>
                              <path
                                d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                                fill="#5E6570"
                                p-id="1645"
                              ></path>
                              <path
                                d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                                fill="#5E6570"
                                p-id="1646"
                              ></path>
                            </svg>
                          </div>
                          <div
                            className={"cursor-pointer tooltip"}
                            data-tip="View on XDCScan"
                            onClick={() => {
                              window.open(
                                "https://xdcscan.com/address/" + address
                              );
                            }}
                          >
                            <Image
                              src="/xdc.png"
                              width={20}
                              height={20}
                              alt=""
                            />
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                          onClick={() => {
                            router.push("/dashboard/" + address);
                          }}
                        >
                          <svg
                            size="24"
                            className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4 8.5A4.5 4.5 0 018.5 4H20v16H8.5A4.5 4.5 0 014 15.5v-7zM8.5 7H17v3H8.5a1.5 1.5 0 110-3zm4.5 6h4v4h-4v-4z"
                              fill="currentColor"
                            ></path>
                          </svg>

                          <div>Dashboard</div>
                        </div>
                        <div
                          className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/orders/" + address);
                          }}
                        >
                          <svg
                            size="24"
                            className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
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
                            className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M11 8.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM2 17a3 3 0 013-3h5a3 3 0 013 3v3H2v-3zm14.5-1v-3h-3v-3h3V7h3v3h3v3h-3v3h-3z"
                              fill="currentColor"
                            ></path>
                          </svg>
                          <div>Refferal</div>
                        </div>
                        <div
                          className="flex items-center gap-2 hover:bg-gray-100 p-4 cursor-pointer"
                          onClick={async () => {
                            await logout();
                            if (connectorType == "injected") {
                              disconnect();
                            }
                            setData({ ...data, showUserItems: false });
                          }}
                        >
                          <svg
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="7250"
                            width="20"
                            height="20"
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
                  <div className="drawer drawer-end lg:hidden w-max">
                    <input
                      id="userDrawer"
                      type="checkbox"
                      className="drawer-toggle"
                      checked={data?.userItemsOpen}
                      onChange={() => {
                        setData({ ...data, userItemsOpen: true });
                      }}
                    />
                    <div className="drawer-content">
                      {/* Page content here */}
                      <label
                        htmlFor="userDrawer"
                        className="btn drawer-button float-right btn-ghost px-2 "
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="1866"
                          width="24"
                          height="24"
                          className="cursor-pointer"
                        >
                          <path
                            d="M512 62.08A449.92 449.92 0 1 0 961.92 512 449.92 449.92 0 0 0 512 62.08z m0 135.04a135.04 135.04 0 1 1-135.04 135.04A134.72 134.72 0 0 1 512 197.12z m0 640a323.84 323.84 0 0 1-269.76-144.96c0-89.6 179.84-138.56 269.76-138.56s268.48 48.96 269.76 138.56A323.84 323.84 0 0 1 512 835.84z"
                            p-id="1867"
                            fill={data?.showUserItems ? "#0e932e" : ""}
                          ></path>
                        </svg>
                      </label>
                    </div>
                    <div className="drawer-side z-50 font-bold">
                      <div className="card bg-base-200 text-base-content min-h-full w-full p-2 font-full">
                        <div className="card-body p-0 text-xl font-medium">
                          <div className="flex justify-between items-center p-4">
                            <div></div>

                            <div
                              className="text-right w-max"
                              onClick={(e) => {
                                setData({ ...data, userItemsOpen: false });
                              }}
                            >
                              <svg
                                viewBox="0 0 1024 1024"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                p-id="1638"
                                width="20"
                                height="20"
                              >
                                <path
                                  d="M553.708426 511.998977l318.623781-318.623781c11.988032-11.988032 12.301164-31.112602 0.699941-42.714847l-1.399883-1.399883c-11.602246-11.602246-30.725792-11.288091-42.713824 0.700965L510.293637 468.584188 191.669856 149.96143c-11.988032-11.989055-31.112602-12.302187-42.714847-0.700965l-1.399883 1.400906c-11.602246 11.602246-11.288091 30.725792 0.700965 42.714847l318.623781 318.622758L148.255067 830.621734c-11.989055 11.989055-12.302187 31.112602-0.700965 42.714847l1.399883 1.399883c11.602246 11.602246 30.726815 11.288091 42.714847-0.699941l318.623781-318.623781 318.623781 318.623781c11.988032 11.989055 31.111578 12.302187 42.713824 0.700965l1.399883-1.399883c11.602246-11.602246 11.288091-30.726815-0.699941-42.714847L553.708426 511.998977z"
                                  fill="#272636"
                                  p-id="1639"
                                ></path>
                              </svg>
                            </div>
                          </div>
                          <div className="card-body p-0">
                            <div className="flex items-center gap-1 p-4 text-xl">
                              <Image
                                src="/bbb.jpg"
                                alt="user"
                                height={40}
                                width={40}
                                className="rounded-md"
                              />
                              <div>
                                <div>{address?.substr(36)}</div>
                              </div>
                              <div
                                className={"cursor-pointer tooltip"}
                                data-tip="Copy Address"
                                onClick={() => {
                                  copy(address);
                                  success("copy success!");
                                }}
                              >
                                <svg
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  p-id="1641"
                                  width="20"
                                  height="20"
                                >
                                  <path
                                    d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                                    fill="#5E6570"
                                    p-id="1642"
                                  ></path>
                                  <path
                                    d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                                    fill="#5E6570"
                                    p-id="1643"
                                  ></path>
                                  <path
                                    d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                                    fill="#5E6570"
                                    p-id="1644"
                                  ></path>
                                  <path
                                    d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                                    fill="#5E6570"
                                    p-id="1645"
                                  ></path>
                                  <path
                                    d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                                    fill="#5E6570"
                                    p-id="1646"
                                  ></path>
                                </svg>
                              </div>
                              <div
                                className={"cursor-pointer tooltip"}
                                data-tip="View on XDCScan"
                                onClick={() => {
                                  window.open(
                                    "https://xdcscan.com/address/" + address
                                  );
                                }}
                              >
                                <Image
                                  src="/xdc.png"
                                  width={20}
                                  height={20}
                                  alt=""
                                />
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                              onClick={() => {
                                router.push("/dashboard/" + address);
                                setData({ ...data, userItemsOpen: false });
                              }}
                            >
                              <svg
                                size="24"
                                className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4 8.5A4.5 4.5 0 018.5 4H20v16H8.5A4.5 4.5 0 014 15.5v-7zM8.5 7H17v3H8.5a1.5 1.5 0 110-3zm4.5 6h4v4h-4v-4z"
                                  fill="currentColor"
                                ></path>
                              </svg>

                              <div>Dashboard</div>
                            </div>
                            <div
                              className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();

                                setData({ ...data, userItemsOpen: false });
                                router.push("/orders/" + address);
                              }}
                            >
                              <svg
                                size="24"
                                className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
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
                                setData({ ...data, userItemsOpen: false });
                              }}
                            >
                              <svg
                                className="bn-svg icon-normal left-icon-pc sidebar-icon-size shrink-0"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M11 8.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM2 17a3 3 0 013-3h5a3 3 0 013 3v3H2v-3zm14.5-1v-3h-3v-3h3V7h3v3h3v3h-3v3h-3z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                              <div>Refferal</div>
                            </div>
                            <div
                              className="flex items-center gap-2 hover:bg-gray-100 p-4 cursor-pointer"
                              onClick={async () => {
                                await logout();
                                if (connectorType == "injected") {
                                  disconnect();
                                }
                                setData({ ...data, showUserItems: false });
                              }}
                            >
                              <svg
                                viewBox="0 0 1024 1024"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                p-id="7250"
                                width="20"
                                height="20"
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
                  </div>
                </div>
              )}
              {!isConnected && (
                <div
                  className="btn btn-sm mr-1"
                  onClick={async () => {
                    privyLogin();
                  }}
                >
                  Log In
                </div>
              )}

              <div className="drawer drawer-end lg:hidden w-max">
                <input
                  id="my-drawer"
                  type="checkbox"
                  className="drawer-toggle"
                  checked={data?.menuItemsOpen}
                  onChange={() => {
                    setData({ ...data, menuItemsOpen: true });
                  }}
                />
                <div className="drawer-content">
                  {/* Page content here */}
                  <label
                    htmlFor="my-drawer"
                    className="btn drawer-button float-right btn-ghost px-2 "
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
                <div className="drawer-side z-50 font-bold">
                  <div className="card bg-base-200 text-base-content min-h-full w-full p-2 font-full">
                    <div className="card-body p-0 text-xl font-medium">
                      <div className="flex justify-between items-center p-4">
                        <div></div>

                        <div
                          className="text-right w-max"
                          onClick={(e) => {
                            setData({ ...data, menuItemsOpen: false });
                          }}
                        >
                          <svg
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="1638"
                            width="20"
                            height="20"
                          >
                            <path
                              d="M553.708426 511.998977l318.623781-318.623781c11.988032-11.988032 12.301164-31.112602 0.699941-42.714847l-1.399883-1.399883c-11.602246-11.602246-30.725792-11.288091-42.713824 0.700965L510.293637 468.584188 191.669856 149.96143c-11.988032-11.989055-31.112602-12.302187-42.714847-0.700965l-1.399883 1.400906c-11.602246 11.602246-11.288091 30.725792 0.700965 42.714847l318.623781 318.622758L148.255067 830.621734c-11.989055 11.989055-12.302187 31.112602-0.700965 42.714847l1.399883 1.399883c11.602246 11.602246 30.726815 11.288091 42.714847-0.699941l318.623781-318.623781 318.623781 318.623781c11.988032 11.989055 31.111578 12.302187 42.713824 0.700965l1.399883-1.399883c11.602246-11.602246 11.288091-30.726815-0.699941-42.714847L553.708426 511.998977z"
                              fill="#272636"
                              p-id="1639"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={(e) => {
                          window.open(buyXDCLink);
                          setData({ ...data, menuItemsOpen: false });
                        }}
                      >
                        <Image src={"/xdc.png"} height={20} width={20} alt="" />
                        <div>Buy XDC</div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={(e) => {
                          router.push("/markets");
                          setData({ ...data, menuItemsOpen: false });
                        }}
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="10337"
                          width="20"
                          height="20"
                        >
                          <path
                            d="M173.9776 765.6448h148.8384a18.2272 18.2272 0 0 0 18.688-17.7664V301.056a18.2272 18.2272 0 0 0-18.688-17.7664H173.9776a18.2272 18.2272 0 0 0-18.688 17.7664v446.8224c0 9.8304 8.3456 17.7664 18.688 17.7664z m268.3392 0h148.8896a18.2272 18.2272 0 0 0 18.6368-17.7664V120.1664A18.2272 18.2272 0 0 0 591.2064 102.4H442.3168a18.2272 18.2272 0 0 0-18.688 17.7664v627.712c-0.1024 9.8304 8.3968 17.7664 18.688 17.7664z m268.288 0h148.7872a18.2272 18.2272 0 0 0 18.688-17.7664V481.9456a18.2272 18.2272 0 0 0-18.688-17.7664h-148.8384a18.2272 18.2272 0 0 0-18.688 17.7664v265.9328c0 9.8304 8.3968 17.7664 18.688 17.7664z m192.4096 77.9776H121.088a18.2272 18.2272 0 0 0-18.688 17.8176v42.3936c0 9.8304 8.3456 17.7664 18.688 17.7664h781.824a18.2272 18.2272 0 0 0 18.688-17.7664v-42.2912a18.176 18.176 0 0 0-18.5856-17.92z"
                            p-id="10338"
                          ></path>
                        </svg>
                        <div>Markets</div>
                      </div>
                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={(e) => {
                          router.push("/swap/bbb");
                          setData({ ...data, menuItemsOpen: false });
                        }}
                      >
                        <svg
                    
                          viewBox="0 0 1080 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="4273"
                          width="20"
                          height="20"
                        >
                          <path
                            d="M1038.051556 631.694222l-105.415112-119.978666-105.130666 120.433777h59.448889a364.544 364.544 0 0 1-131.640889 176.753778 357.262222 357.262222 0 0 1-208.327111 67.128889 357.262222 357.262222 0 0 1-208.213334-67.128889 364.544 364.544 0 0 1-131.697777-176.753778H112.924444A456.419556 456.419556 0 0 0 274.204444 873.813333 446.691556 446.691556 0 0 0 547.100444 967.111111a446.691556 446.691556 0 0 0 272.896-93.297778 456.419556 456.419556 0 0 0 161.28-241.664l56.775112-0.455111zM267.662222 391.281778H56.888889l105.187555 120.433778 105.585778-120.433778z m279.893334-244.508445a357.262222 357.262222 0 0 1 207.985777 67.640889 364.544 364.544 0 0 1 131.185778 176.924445h94.549333a456.419556 456.419556 0 0 0-161.336888-241.322667A446.748444 446.748444 0 0 0 547.214222 56.888889a446.691556 446.691556 0 0 0-272.668444 93.127111 456.476444 456.476444 0 0 0-161.393778 241.265778h94.378667A364.600889 364.600889 0 0 1 339.057778 214.129778 357.262222 357.262222 0 0 1 547.555556 146.773333z"
                            fill="#515151"
                            p-id="4274"
                          ></path>
                          <path
                            d="M547.612444 671.402667L392.419556 514.048l155.192888-156.956444 155.192889 156.956444-155.192889 157.354667z"
                            fill="#515151"
                            p-id="4275"
                          ></path>
                        </svg>
                        <div>Trade</div>
                      </div>
                      <div
                        tabIndex={0}
                        className="collapse collapse-arrow bg-base-200"
                      >
                        <input type="checkbox" className="peer" />
                        <div className="collapse-title text-xl font-medium flex items-center gap-2">
                          <svg
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="15539"
                            width="20"
                            height="20"
                          >
                            <path
                              d="M375.79 542.48H141.71C97.69 542.48 62 578.17 62 622.2v234.07c0 44.02 35.69 79.71 79.71 79.71h234.2c43.95 0 79.58-35.63 79.58-79.58V622.2c0.01-44.03-35.68-79.72-79.7-79.72zM588.73 481.52H822.8c44.02 0 79.71-35.69 79.71-79.71V167.73c0-44.02-35.69-79.71-79.71-79.71H588.73c-44.02 0-79.71 35.69-79.71 79.71V401.8c0 44.03 35.69 79.72 79.71 79.72zM944.88 856.24l-59.11-38.06c10.64-24.2 16.75-50.82 16.75-78.95 0-108.66-88.09-196.75-196.75-196.75s-196.75 88.09-196.75 196.75 88.09 196.75 196.75 196.75c53.61 0 102.1-21.58 137.58-56.36l61.13 39.36a37.132 37.132 0 0 0 20.16 5.94c12.28 0 24.28-6.04 31.43-17.12 11.13-17.32 6.14-40.41-11.19-51.56zM375.79 88.02H141.71C97.69 88.02 62 123.71 62 167.73V401.8c0 44.02 35.69 79.71 79.71 79.71h234.07c44.02 0 79.71-35.69 79.71-79.71V167.73c0.01-44.02-35.68-79.71-79.7-79.71z"
                              p-id="15540"
                            ></path>
                          </svg>{" "}
                          Earn
                        </div>
                        <div className="collapse-content z-50">
                          <div
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                            onClick={(e) => {
                              router.push("/stake");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div>Stake</div>
                          </div>
                          <div
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                            onClick={(e) => {
                              router.push("/farm");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div>Farm</div>
                          </div>
                          <div
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                            onClick={(e) => {
                              router.push("/activity");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div>Activity</div>
                          </div>
                          <div
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                            onClick={(e) => {
                              router.push("/airdrophub");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div>Airdrop Hub</div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-100"
                        onClick={() => {
                          window.open("https://t.me/bbbsking");
                        }}
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="1507"
                          width="20"
                          height="20"
                        >
                          <path
                            d="M960 403.2c-38.4-217.6-224-377.6-448-377.6-224 0-409.6 166.4-448 377.6C25.6 435.2 0 492.8 0 550.4c0 76.8 44.8 166.4 115.2 166.4 64 0 64-70.4 64-166.4 0-89.6 0-160-44.8-166.4C172.8 211.2 326.4 83.2 512 83.2c185.6 0 339.2 128 377.6 294.4-44.8 12.8-44.8 76.8-44.8 166.4 0 64 0 108.8 12.8 140.8-57.6 89.6-140.8 153.6-243.2 179.2-19.2-25.6-57.6-44.8-102.4-44.8-64 0-115.2 32-115.2 70.4 0 38.4 51.2 70.4 115.2 70.4s115.2-32 115.2-70.4c0 0 0 0 0 0 102.4-25.6 192-96 249.6-185.6 6.4 6.4 19.2 6.4 32 6.4 70.4 0 115.2-89.6 115.2-166.4C1024 492.8 998.4 435.2 960 403.2z"
                            p-id="1508"
                          ></path>
                        </svg>
                        <div>24/7 Chat Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <dialog id="howisworks" className="modal text-center">
          <div className="modal-box">
            <h1 className="text-xl font-bold">How is works</h1>
            <div className="font-bold my-4">
              Pump prevents rugs by making sure that all created tokens are
              safe. Each coin on pump is a{" "}
              <span className="text-green-700">fair-launch</span> with{" "}
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
    )
  );
};

export default Navbar;
