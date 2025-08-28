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

const AnniversaryBanner = ({ router }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-lg cursor-pointer"
      onClick={() => router.push("/anniversary")}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🎉</span>
              <div className="text-white">
                <span className="font-bold text-lg">
                  BBB Anniversary Celebration
                </span>
                <span className="hidden sm:inline ml-2 text-sm opacity-90">
                  Join the USDB Deposit Competition & Win BBB Rewards!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Animated sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle sparkle1">✨</div>
          <div className="sparkle sparkle2">⭐</div>
          <div className="sparkle sparkle3">💫</div>
        </div>
      </div>

      <style jsx>{`
        .sparkle {
          position: absolute;
          animation: sparkle 3s infinite;
          font-size: 16px;
        }
        .sparkle1 {
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }
        .sparkle2 {
          top: 60%;
          right: 20%;
          animation-delay: 1s;
        }
        .sparkle3 {
          top: 40%;
          left: 70%;
          animation-delay: 2s;
        }
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

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
        <div className="w-full">
          <div className="w-full h-18">
            <div className="navbar items-center font-bold">
              <div className="navbar-start">
                <Image
                  src={"/logo.png"}
                  height={150}
                  width={150}
                  alt=""
                  className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    router.push("/");
                  }}
                />

                <div className="ml-2 hidden lg:flex items-center pt-1 space-x-2">
                  <a
                    href="https://jumper.exchange/zh?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toChain=50&toToken=0x0000000000000000000000000000000000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                  >
                    Bridge
                  </a>
                  <Link
                    href={"/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1"}
                    className="btn btn-ghost hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                  >
                    Markets
                  </Link>
                  <Link
                    href={"/ido"}
                    className="btn btn-ghost hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                  >
                    IDO
                  </Link>

                  <div className="dropdown dropdown-hover font-bold">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl border-none hover:border-none focus:border-none active:border-none"
                    >
                      More
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-white rounded-xl z-50 w-52 p-2 shadow-lg border border-green-100/50"
                    >
                      <li className="rounded-lg">
                        <Link
                          href={"/stake"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg "
                        >
                          Stake
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/usdb"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg "
                        >
                          USDB
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/lend"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg "
                        >
                          Lend
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/merch"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg "
                        >
                          Merch
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/mbbb"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg "
                        >
                          mBBB
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/farm"}
                          className="hover:text-green-600 hover:bg-green-50  rounded-lg "
                        >
                          Farm
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/bbbubu"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          BBBubu
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/bbbgame"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          🎮 BBBGame
                        </Link>
                      </li>
                      <li className="rounded-lg">
                        <Link
                          href={"/airdrophub"}
                          className="hover:text-green-600 hover:bg-green-50 rounded-lg"
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
                  <div className="flex items-center gap-2">
                    <div
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl hidden lg:flex"
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
                        className="card dropdown-content menu bg-white rounded-xl z-50 w-72 shadow-lg border border-green-100 p-0 text-xs"
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
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
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
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/orders/" + address);
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
                                d="M4.5 3v18h4.91A7.5 7.5 0 0118.5 9.365V7l-4-4h-10zm16 13a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zm-4.79-2.875h-2v4l3.031 1.75 1-1.732-2.031-1.173v-2.845z"
                                fill="currentColor"
                              ></path>
                            </svg>
                            <div>Orders</div>
                          </div>
                          <div
                            className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
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
                            className="flex items-center gap-2 hover:bg-green-50 transition-all duration-300 cursor-pointer p-4"
                            onClick={async () => {
                              if (connectorType == "injected") {
                                info("Please disconnect your wallet manually");
                              } else {
                                await logout();
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
                                className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
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
                                className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
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
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
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
                                className="flex items-center gap-2 cursor-pointer p-4 hover:bg-green-50 transition-all duration-300"
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
                                className="flex items-center gap-2 hover:bg-green-50 transition-all duration-300 cursor-pointer p-4"
                                onClick={async () => {
                                  if (connectorType == "injected") {
                                    info(
                                      "Please disconnect your wallet manually"
                                    );
                                  } else {
                                    await logout();
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
                    className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl hidden lg:flex"
                    onClick={async () => {
                      privyLogin();
                    }}
                  >
                    Sign Up
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
                        {/* MobileNav More Content */}
                        <div className="grid grid-cols-2 gap-4 p-4">
                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/stake");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M3 3H21V21H3V3Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M3 9H21"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M9 21V9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">Stake</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/usdb");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl overflow-hidden bg-gray-100">
                              <Image
                                src="/usdb.png"
                                alt="USDB"
                                width={20}
                                height={20}
                                className="rounded-lg object-cover"
                              />
                            </div>
                            <span className="ml-3 font-medium">USDB</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/lend");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M12 2C13.1046 2 14 2.89543 14 4V6H16C17.1046 6 18 6.89543 18 8V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V8C6 6.89543 6.89543 6 8 6H10V4C10 2.89543 10.8954 2 12 2Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 10V14M10 12H14"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">Lend</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/merch");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M20 6H4C2.89543 6 2 6.89543 2 8V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V8C22 6.89543 21.1046 6 20 6Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">Merch</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/mbbb");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">mBBB</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/farm");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M3 6.5C3 4.01472 5.01472 2 7.5 2C9.98528 2 12 4.01472 12 6.5C12 8.98528 9.98528 11 7.5 11C5.01472 11 3 8.98528 3 6.5Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M12 6.5C12 4.01472 14.0147 2 16.5 2C18.9853 2 21 4.01472 21 6.5C21 8.98528 18.9853 11 16.5 11C14.0147 11 12 8.98528 12 6.5Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M3 17.5C3 15.0147 5.01472 13 7.5 13C9.98528 13 12 15.0147 12 17.5C12 19.9853 9.98528 22 7.5 22C5.01472 22 3 19.9853 3 17.5Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M12 17.5C12 15.0147 14.0147 13 16.5 13C18.9853 13 21 15.0147 21 17.5C21 19.9853 18.9853 22 16.5 22C14.0147 22 12 19.9853 12 17.5Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">Farm</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/bbbubu");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl overflow-hidden bg-gray-100">
                              <Image
                                src="/bbb.jpg"
                                alt="BBBubu"
                                width={20}
                                height={20}
                                className="rounded-lg object-cover"
                              />
                            </div>
                            <span className="ml-3 font-medium">BBBubu</span>
                          </div>

                          <div
                            className="flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md border border-transparent"
                            onClick={() => {
                              router.push("/airdrophub");
                              setData({ ...data, menuItemsOpen: false });
                            }}
                          >
                            <div className="p-2 rounded-xl bg-gray-100">
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                  d="M12 2L8 6H4C3.44772 6 3 6.44772 3 7V17C3 17.5523 3.44772 18 4 18H20C20.5523 18 21 17.5523 21 17V7C21 6.44772 20.5523 6 20 6H16L12 2Z"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 11V15"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M12 18V22"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <circle
                                  cx="12"
                                  cy="9"
                                  r="1"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            <span className="ml-3 font-medium">
                              Airdrop Hub
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <dialog id="howisworks" className="modal text-center">
          <div className="modal-box bg-white rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
              How it works
            </h1>
            <div className="font-bold my-4 text-gray-700">
              Pump prevents rugs by making sure that all created tokens are
              safe. Each coin on pump is a{" "}
              <span className="text-green-600">fair-launch</span> with{" "}
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
                <button className="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl">
                  {"I'm ready to pump"}
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </>
    )
  );
};

export default Navbar;
