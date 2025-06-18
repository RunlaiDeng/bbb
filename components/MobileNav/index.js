import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

const MobileNav = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [isEarnOpen, setIsEarnOpen] = useState(false);

  // Close dropdown when navigating
  useEffect(() => {
    setIsEarnOpen(false);
  }, [router.pathname]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      {/* Dropdown menu with transition */}
      <div 
        className={`absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-md transition-all duration-300 ease-in-out overflow-hidden ${
          isEarnOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-3 p-4">
          <Link
            href="/merch"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/merch" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
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
            <span className="ml-2">Merch</span>
          </Link>
          <Link
            href="/launch"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/launch" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ml-2">Launch</span>
          </Link>
          <Link
            href="/bbbstake"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/bbbstake" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
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
            <span className="ml-2">BBB Stake</span>
          </Link>
          <Link
            href="/farm"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/farm" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
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
            <span className="ml-2">Farm</span>
          </Link>
          <Link
            href="/bbbubu"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/bbbubu" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="ml-2">BBBubu</span>
          </Link>
          <Link
            href="/anniversary"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/anniversary" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ml-2">Anniversary</span>
          </Link>
          <Link
            href="/airdrophub"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/airdrophub" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
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
              <circle cx="12" cy="9" r="1" fill="currentColor" />
            </svg>
            <span className="ml-2">Airdrop Hub</span>
          </Link>
          <Link
            href="/bpsXDC"
            className={`flex items-center p-3 rounded-xl ${
              router.pathname === "/bpsXDC" 
                ? "bg-green-50 text-green-600 font-medium" 
                : "hover:bg-gray-50"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="ml-2">bpsXDC</span>
          </Link>
          <Link
            href="/usdb"
            className={`flex flex-col items-center p-2 ${
              router.pathname === "/usdb" 
                ? "text-green-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 2C13.1046 2 14 2.89543 14 4V20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20V4C10 2.89543 10.8954 2 12 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 9C9 5.13401 9 5.13401 12 5.13401C15 5.13401 15 5.13401 15 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 15C9 18.866 9 18.866 12 18.866C15 18.866 15 18.866 15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs mt-1">USDB</span>
          </Link>
        </div>
      </div>
      
      {/* Main navigation bar */}
      <div className="flex justify-around items-center h-18 px-1">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 ${
            router.pathname === "/" 
              ? "text-green-600 font-medium" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z"
              fill="currentColor"
            />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/swap/bbb"
          className={`flex flex-col items-center p-2 ${
            router.pathname.startsWith("/swap")
              ? "text-green-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            viewBox="0 0 1080 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="4273"
            width="24"
            height="24"
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
          <span className="text-xs mt-1">Trade</span>
        </Link>
        <Link
          href="/stake"
          className={`flex flex-col items-center p-2 ${
            router.pathname === "/stake" 
              ? "text-green-600 font-medium" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
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
          <span className="text-xs mt-1">Stake</span>
        </Link>
        <Link
          href="/usdb"
          className={`flex flex-col items-center p-2 ${
            router.pathname === "/usdb" 
              ? "text-green-600 font-medium" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M12 2C13.1046 2 14 2.89543 14 4V20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20V4C10 2.89543 10.8954 2 12 2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9C9 5.13401 9 5.13401 12 5.13401C15 5.13401 15 5.13401 15 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15C9 18.866 9 18.866 12 18.866C15 18.866 15 18.866 15 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs mt-1">USDB</span>
        </Link>
        <button
          onClick={() => setIsEarnOpen(!isEarnOpen)}
          className={`flex flex-col items-center p-2 relative ${
            router.pathname.startsWith("/anniversary") ||
            router.pathname === "/farm" ||
            router.pathname === "/bbbubu" ||
            router.pathname === "/airdrophub" ||
            router.pathname === "/merch" ||
            router.pathname === "/launch" ||
            router.pathname === "/bbbstake" ||
            router.pathname === "/bpsXDC" ||
            router.pathname === "/usdb"
              ? "text-green-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="15539"
            width="24"
            height="24"
          >
            <path
              d="M375.79 542.48H141.71C97.69 542.48 62 578.17 62 622.2v234.07c0 44.02 35.69 79.71 79.71 79.71h234.2c43.95 0 79.58-35.63 79.58-79.58V622.2c0.01-44.03-35.68-79.72-79.7-79.72zM588.73 481.52H822.8c44.02 0 79.71-35.69 79.71-79.71V167.73c0-44.02-35.69-79.71-79.71-79.71H588.73c-44.02 0-79.71 35.69-79.71 79.71V401.8c0 44.03 35.69 79.72 79.71 79.72zM944.88 856.24l-59.11-38.06c10.64-24.2 16.75-50.82 16.75-78.95 0-108.66-88.09-196.75-196.75-196.75s-196.75 88.09-196.75 196.75 88.09 196.75 196.75 196.75c53.61 0 102.1-21.58 137.58-56.36l61.13 39.36a37.132 37.132 0 0 0 20.16 5.94c12.28 0 24.28-6.04 31.43-17.12 11.13-17.32 6.14-40.41-11.19-51.56zM375.79 88.02H141.71C97.69 88.02 62 123.71 62 167.73V401.8c0 44.02 35.69 79.71 79.71 79.71h234.07c44.02 0 79.71-35.69 79.71-79.71V167.73c0.01-44.02-35.68-79.71-79.7-79.71z"
              p-id="15540"
              fill="currentColor"
            ></path>
          </svg>
          <span className="text-xs mt-1">More</span>
          <span className={`absolute -right-1 top-0 transition-transform duration-300 ${isEarnOpen ? "rotate-180" : ""}`}>
            {isEarnOpen ? "▲" : "▼"}
          </span>
        </button>
        <Link
          href={address ? `/dashboard/${address}` : "/dashboard"}
          className={`flex flex-col items-center p-2 ${
            router.pathname.startsWith("/dashboard")
              ? "text-green-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 8.5A4.5 4.5 0 018.5 4H20v16H8.5A4.5 4.5 0 014 15.5v-7zM8.5 7H17v3H8.5a1.5 1.5 0 110-3zm4.5 6h4v4h-4v-4z"
              fill="currentColor"
            ></path>
          </svg>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
