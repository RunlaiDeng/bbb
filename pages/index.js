import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import TokenMarkets from "@/components/TokenMarkets";
import { getXDCPrice } from "@/components/Utils";

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
      <div className="card min-h-screen sm:w-3/4 m-auto">
        <div className="card-body">
          <div className="sm:flex items-center gap-4 mt-12">
            <div className="text-center sm:text-left sm:pt-24">
              <h1 className="text-green-700 font-bold sm:text-5xl">
                {address
                  ? "Discuss Everything Crypto On BBBPump.fun"
                  : "Next generation exchange and all is on blockchain"}
              </h1>
              {!address && (
                <button
                  className="btn btn-success text-white sm:btn-lg mt-8 mx-4 w-72 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2"
                  onClick={handleTryNow}
                  aria-label="Try Now"
                  type="button"
                >
                  Sign Up
                </button>
              )}
              {address && (
                <button
                  className="btn sm:btn-lg mt-8 mx-4 w-72 sm:w-96 text-green-700"
                  onClick={() => {
                    router.push("/swap/bbb");
                  }}
                  aria-label="Try Now"
                  type="button"
                >
                  Trade
                </button>
              )}
              <div className="mt-8" />
            </div>
            <div>
              <TokenMarkets {...tMarkets} />
            </div>
          </div>
          <div className="m-auto my-10 sm:mt-0" />
        </div>
      </div>

      <div className="card sm:w-3/4 m-auto min-h-screen">
        <div className="card-body text-center">
          <h2 className="text-green-700 font-bold text-5xl my-4">
            Trade with confidence
          </h2>
          <div className="opacity-50 my-4">
            Get low fees, high speed transactions, powerful APIs, and more
          </div>
          <div className="mockup-browser border-green-700 border border-4 my-4">
            <Image
              src="/home1.png"
              height={1000}
              width={1000}
              className="w-full"
              alt="Trading Interface"
              loading="lazy"
              quality={75}
            />
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
