import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const MobileNav = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-base-300/60 bg-base-100/90 pb-[env(safe-area-inset-bottom,0px)] shadow-shell backdrop-blur-md supports-[backdrop-filter]:bg-base-100/85">
      <div className="flex justify-center items-center gap-8 h-16 px-4 py-2">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 min-w-[72px] ${
            router.pathname === "/"
              ? "text-green-600 font-semibold bg-green-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div
            className={`p-2 rounded-xl ${
              router.pathname === "/" ? "bg-green-100" : "bg-transparent"
            }`}
          >
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
          href={address ? `/dashboard/${address}` : "/dashboard"}
          className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 min-w-[72px] ${
            router.pathname.startsWith("/dashboard")
              ? "text-green-600 font-semibold bg-green-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div
            className={`p-2 rounded-xl ${
              router.pathname.startsWith("/dashboard")
                ? "bg-green-100"
                : "bg-transparent"
            }`}
          >
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
              />
            </svg>
          </div>
          <span className="text-xs mt-1 font-medium">Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
