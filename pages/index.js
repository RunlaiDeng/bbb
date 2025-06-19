import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import TokenMarkets from "@/components/TokenMarkets";
import { getXDCPrice } from "@/components/Utils";

const WaveBackground = () => (
  <div className="wave-container fixed top-0 left-0 w-full h-full overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-green-50/30" />
    <svg
      className="waves absolute bottom-0 w-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
    >
      <defs>
        <path
          id="wave"
          d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
        />
      </defs>
      <g className="wave-parallax1">
        <use href="#wave" x="50" y="3" fill="rgba(34, 197, 94, 0.03)" />
      </g>
      <g className="wave-parallax2">
        <use href="#wave" x="50" y="0" fill="rgba(34, 197, 94, 0.05)" />
      </g>
      <g className="wave-parallax3">
        <use href="#wave" x="50" y="9" fill="rgba(34, 197, 94, 0.07)" />
      </g>
    </svg>
  </div>
);

const FloatingCoins = () => (
  <div className="floating-coins absolute w-full h-full overflow-hidden pointer-events-none">
    <div className="coin coin1">
      <Image
        src="/xdc.png"
        alt="XDC"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
    <div className="coin coin2">
      <Image
        src="/bbb.jpg"
        alt="BBB"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
    <div className="coin coin3">
      <Image
        src="/favicon.ico"
        alt="Coin"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
  </div>
);

const HomeContent = memo(() => {
  const privyLogin = usePrivyLogin();
  const router = useRouter();
  const [mount, setMount] = useState(false);
  const { address } = useAccount();

  const [price, setPrice] = useState({});

  async function fetchData() {
    setMount(false);
    const xdc = await getXDCPrice();

    setPrice({ ...price, xdc });
    setMount(true);
  }

  const xdcPrice = price?.xdc?.price;

  const xdcPriceChangeH24 = price?.xdc?.priceChange24h;

  useEffect(() => {
    // router.push("/markets");
    fetchData();
  }, []);

  const handleTryNow = useCallback(async () => {
    try {
      if (!address) {
        await privyLogin();
        router.push("/markets");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, [privyLogin, router, address]);

  const tMarkets = {
    showBar: false,
    searchBar: false,
    pageSize: 4,
    xdcPrice,
    xdcPriceChangeH24,
    showLogo: true,
    tableSize: "lg",
  };

  return (
    <>
      <style jsx global>{`
        .wave-container {
          z-index: -1;
        }
        .waves {
          height: 100vh;
          min-height: 100px;
        }
        .wave-parallax1 use {
          animation: move-forever1 25s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        .wave-parallax2 use {
          animation: move-forever2 20s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        .wave-parallax3 use {
          animation: move-forever3 15s cubic-bezier(0.55, 0.5, 0.45, 0.5)
            infinite;
        }
        @keyframes move-forever1 {
          0% {
            transform: translate(85px, 0%);
          }
          100% {
            transform: translate(-90px, 0%);
          }
        }
        @keyframes move-forever2 {
          0% {
            transform: translate(-90px, 0%);
          }
          100% {
            transform: translate(85px, 0%);
          }
        }
        @keyframes move-forever3 {
          0% {
            transform: translate(-90px, 0%);
          }
          100% {
            transform: translate(85px, 0%);
          }
        }
        .floating-coins .coin {
          position: absolute;
          animation: float 6s infinite;
          opacity: 0.7;
        }
        .coin1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .coin2 {
          top: 40%;
          right: 10%;
          animation-delay: -2s;
        }
        .coin3 {
          top: 60%;
          left: 20%;
          animation-delay: -4s;
        }
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }
        .glow-effect {
          position: relative;
        }
        .glow-effect::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #22c55e, #15803d);
          border-radius: 0.5rem;
          z-index: -1;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-effect:hover::before {
          opacity: 1;
        }
      `}</style>
      <WaveBackground />
      <FloatingCoins />
      <div className="relative min-h-screen pt-32">
        <div className="card sm:w-3/4 m-auto">
          <div className="card-body backdrop-blur-sm bg-white/10 rounded-lg">
            <div className="sm:flex items-center gap-4 mt-12">
              <div className="text-center sm:text-left sm:pt-24">
                <h1 className="text-green-700 font-bold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 animate-pulse">
                  {address
                    ? "Discuss Everything Crypto On BBBFI.COM"
                    : "Next generation exchange and all is on blockchain"}
                </h1>
                {!address && (
                  <button
                    className="btn btn-success text-white sm:btn-lg mt-8 mx-4 w-72 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2 transition-all duration-300 transform hover:scale-105 glow-effect"
                    onClick={handleTryNow}
                    aria-label="Try Now"
                    type="button"
                  >
                    Log in
                  </button>
                )}
                {address && (
                  <button
                    className="btn sm:btn-lg mt-8 mx-4 w-72 sm:w-96 text-green-700 transition-all duration-300 transform hover:scale-105 glow-effect"
                    onClick={() => {
                      router.push("/swap/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1");
                    }}
                    aria-label="Try Now"
                    type="button"
                  >
                    Trade
                  </button>
                )}
                <div className="mt-8" />
              </div>
              <div className="glass p-4 rounded-xl backdrop-blur-md bg-white/10">
                <TokenMarkets {...tMarkets} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

HomeContent.displayName = "HomeContent";

const Home = memo(() => <HomeContent />);
Home.displayName = "Home";

export default Home;
