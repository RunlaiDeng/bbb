import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

const MobileNav = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();


  // 如果用户没有连接钱包或没有通过Privy认证，不显示移动导航
  if (!isConnected && !authenticated) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-lg">

      
      {/* Main navigation bar with enhanced styling */}
      <div className="flex justify-around items-center h-20 px-2 py-3">
        <Link
          href="/"
          className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform active:scale-95 min-w-[64px] ${
            router.pathname === "/" 
              ? "text-green-600 font-semibold bg-green-50 shadow-md scale-105" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            router.pathname === "/" ? "bg-green-100" : "bg-transparent"
          }`}>
            <svg viewBox="0 0 1024 1024" width="22" height="22">
              <path
                d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>

        <Link
          href="/swap?fromChain=50&toChain=50&fromToken=0x0000000000000000000000000000000000000000&toToken=0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1"
          className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform active:scale-95 min-w-[64px] ${
            router.pathname === "/swap"
              ? "text-green-600 font-semibold bg-green-50 shadow-md scale-105"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            router.pathname === "/swap" ? "bg-green-100" : "bg-transparent"
          }`}>
            <svg
              viewBox="0 0 1080 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4273"
              width="22"
              height="22"
            >
              <path
                d="M1038.051556 631.694222l-105.415112-119.978666-105.130666 120.433777h59.448889a364.544 364.544 0 0 1-131.640889 176.753778 357.262222 357.262222 0 0 1-208.327111 67.128889 357.262222 357.262222 0 0 1-208.213334-67.128889 364.544 364.544 0 0 1-131.697777-176.753778H112.924444A456.419556 456.419556 0 0 0 274.204444 873.813333 446.691556 446.691556 0 0 0 547.100444 967.111111a446.691556 446.691556 0 0 0 272.896-93.297778 456.419556 456.419556 0 0 0 161.28-241.664l56.775112-0.455111zM267.662222 391.281778H56.888889l105.187555 120.433778 105.585778-120.433778z m279.893334-244.508445a357.262222 357.262222 0 0 1 207.985777 67.640889 364.544 364.544 0 0 1 131.185778 176.924445h94.549333a456.419556 456.419556 0 0 0-161.336888-241.322667A446.748444 446.748444 0 0 0 547.214222 56.888889a446.691556 446.691556 0 0 0-272.668444 93.127111 456.476444 456.476444 0 0 0-161.393778 241.265778h94.378667A364.600889 364.600889 0 0 1 339.057778 214.129778 357.262222 357.262222 0 0 1 547.555556 146.773333z"
                fill="currentColor"
                p-id="4274"
              ></path>
              <path
                d="M547.612444 671.402667L392.419556 514.048l155.192888-156.956444 155.192889 156.956444-155.192889 157.354667z"
                fill="currentColor"
                p-id="4275"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">Swap</span>
        </Link>

        <Link
          href="/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1"
          className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform active:scale-95 min-w-[64px] ${
            router.pathname.startsWith("/swap/") 
              ? "text-green-600 font-semibold bg-green-50 shadow-md scale-105" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            router.pathname.startsWith("/swap/") ? "bg-green-100" : "bg-transparent"
          }`}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M3 3H21V21H3V3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 12H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">Markets</span>
        </Link>

        <Link
          href="/ido"
          className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform active:scale-95 min-w-[64px] ${
            router.pathname === "/ido" 
              ? "text-green-600 font-semibold bg-green-50 shadow-md scale-105" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            router.pathname === "/ido" ? "bg-green-100" : "bg-transparent"
          }`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              {/* 火箭主体 */}
              <path
                d="M12 2C12 2 15.5 5.5 15.5 10.5C15.5 12.5 14.5 14 12 14C9.5 14 8.5 12.5 8.5 10.5C8.5 5.5 12 2 12 2Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
              {/* 火箭窗口 */}
              <circle
                cx="12"
                cy="8"
                r="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* 火箭尾翼 */}
              <path
                d="M8.5 14C8.5 14 7 15.5 7 17C7 18.5 8.5 20 8.5 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M15.5 14C15.5 14 17 15.5 17 17C17 18.5 15.5 20 15.5 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              {/* 火焰效果 */}
              <path
                d="M10 20C10 20 11 21.5 12 22C13 21.5 14 20 14 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              {/* 装饰星星 */}
              <path
                d="M6 6L6.5 7L8 7L7 7.5L7.5 9L6 8L4.5 9L5 7.5L4 7L5.5 7L6 6Z"
                fill="currentColor"
                opacity="0.5"
              />
              <path
                d="M18 4L18.3 4.7L19 5L18.3 5.3L18 6L17.7 5.3L17 5L17.7 4.7L18 4Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">IDO</span>
        </Link>



        <Link
          href={address ? `/dashboard/${address}` : "/dashboard"}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform active:scale-95 min-w-[64px] ${
            router.pathname.startsWith("/dashboard")
              ? "text-green-600 font-semibold bg-green-50 shadow-md scale-105"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            router.pathname.startsWith("/dashboard") ? "bg-green-100" : "bg-transparent"
          }`}>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 8.5A4.5 4.5 0 018.5 4H20v16H8.5A4.5 4.5 0 014 15.5v-7zM8.5 7H17v3H8.5a1.5 1.5 0 110-3zm4.5 6h4v4h-4v-4z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
