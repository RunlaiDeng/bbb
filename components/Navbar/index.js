import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useNotification } from "../Context/notice";
import { useAccount, useDisconnect } from "wagmi";
import copy from "copy-to-clipboard";
import useConnectWallet from "../Hook/useConnectWallet";
import { useLanguage } from "../Context/LanguageContext";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { MORE_NAV_ITEMS } from "@/lib/navMore";

function shortenAddress(addr) {
  if (!addr || typeof addr !== "string") return "";
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

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

  const { connector } = useAccount();
  const { locale, setLocale } = useLanguage();
  const openConnect = useConnectWallet();
  const { openAccountModal } = useAccountModal();

  const mobileWalletSummary = useMemo(() => {
    if (!address) return null;
    return shortenAddress(address);
  }, [address]);

  useEffect(() => {
    setMount(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.lang;
    const q = Array.isArray(raw) ? raw[0] : raw;
    if (q === "zh" || q === "zh-CN" || q === "cn") setLocale("zh");
    else if (q === "en") setLocale("en");
  }, [router.isReady, router.query.lang, setLocale]);

  return (
    mount && (
      <>
        <div className="sticky top-0 z-50 w-full border-b border-base-300/60 bg-base-100/90 shadow-shell backdrop-blur-md supports-[backdrop-filter]:bg-base-100/80">
          <div className="w-full min-h-18">
            <div className="navbar min-h-18 w-full max-w-content mx-auto items-center px-2 font-bold sm:px-4">
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
                  <Link
                    href={"/stake"}
                    className="btn btn-ghost hover:text-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                  >
                    Stake
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
                      className="dropdown-content menu bg-white rounded-xl z-50 w-52 p-2 shadow-lg border border-green-100/50 max-h-[min(70vh,28rem)] overflow-y-auto"
                    >
                      {MORE_NAV_ITEMS.map((item) => (
                        <li key={item.key} className="rounded-lg">
                          {item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              {item.label}
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              className="hover:text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="navbar-center hidden xl:flex"></div>
              <div className="navbar-end">
                <div className="flex lg:hidden items-center justify-end shrink-0">
                  {!isConnected ? (
                    <button
                      type="button"
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl"
                      onClick={openConnect}
                      aria-label="Connect"
                    >
                      Connect
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost font-mono text-xs max-w-[9rem] truncate px-2"
                      onClick={() => openAccountModal?.()}
                      aria-label="Wallet account"
                    >
                      {mobileWalletSummary}
                    </button>
                  )}
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  {isConnected && (
                    <div className="flex items-center gap-2">
                      <div
                        className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl"
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
                          " dropdown dropdown-end " +
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
                                if (connector?.type === "injected") {
                                  info("Please disconnect your wallet manually");
                                } else {
                                  await disconnect();
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
                  )}
                  {!isConnected && (
                    <button
                      type="button"
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 rounded-xl shrink-0"
                      onClick={openConnect}
                      aria-label="Connect"
                    >
                      Connect
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      className={`btn btn-ghost btn-xs rounded-lg ${locale === "en" ? "text-green-600 bg-green-50" : ""}`}
                      onClick={() => setLocale("en")}
                    >
                      EN
                    </button>
                    <span className="text-base-content/40">|</span>
                    <button
                      type="button"
                      className={`btn btn-ghost btn-xs rounded-lg ${locale === "zh" ? "text-green-600 bg-green-50" : ""}`}
                      onClick={() => setLocale("zh")}
                    >
                      中文
                    </button>
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
