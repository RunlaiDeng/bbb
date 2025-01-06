import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const MobileNav = () => {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 ${
            router.pathname === "/" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 1024 1024" width="24" height="24">
            <path
              d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5z"
              fill="currentColor"
            />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href="/markets"
          className={`flex flex-col items-center p-2 ${
            router.pathname === "/markets" ? "text-gray-900" : "text-gray-400"
          }`}
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
              fill="currentColor"
              p-id="10338"
            ></path>
          </svg>
          <span className="text-xs">Markets</span>
        </Link>
        <Link
          href="/swap/bbb"
          className={`flex flex-col items-center p-2 ${
            router.pathname.startsWith("/swap")
              ? "text-gray-900"
              : "text-gray-400"
          }`}
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
              fill="currentColor"
              p-id="4274"
            ></path>
            <path
              d="M547.612444 671.402667L392.419556 514.048l155.192888-156.956444 155.192889 156.956444-155.192889 157.354667z"
              fill="currentColor"
              p-id="4275"
            ></path>
          </svg>
          <span className="text-xs">Trade</span>
        </Link>
        <Link
          href={"/dashboard/" + address}
          className={`flex flex-col items-center p-2 ${
            router.pathname.startsWith("/dashboard")
              ? "text-gray-900"
              : "text-gray-400"
          }`}
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
          <span className="text-xs">Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav; 