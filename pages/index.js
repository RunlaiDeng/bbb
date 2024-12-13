import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo } from "react";

const HomeContent = memo(() => {
  const privyLogin = usePrivyLogin();
  const router = useRouter();

  const handleTryNow = async () => {
    await privyLogin();
    router.push("/markets");
  };

  return (
    <>
      <div className="card min-h-screen sm:w-3/4 m-auto">
        <div className="card-body">
          <div className="sm:flex items-center gap-2 sm:mt-8">
            <div className="text-center sm:text-left">
              <h1 className="text-green-700 font-bold sm:text-5xl">
                Next generation exchange and all is on blockchain
              </h1>
              <button
                className="btn btn-success text-white sm:btn-lg mt-8 mx-4 w-72 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2"
                onClick={handleTryNow}
                aria-label="Try Now"
              >
                Try Now
              </button>
              <div className="mt-8" />
            </div>
            <div className="mt-10">
              <div className="mockup-browser border-green-700 border border-4">
                <Image
                  src="/home0.png"
                  height={1000}
                  width={1000}
                  className="w-full"
                  alt="Platform Preview"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="m-auto my-10 sm:mt-0" />
        </div>
      </div>

      <div className="card sm:w-1/2 m-auto min-h-screen">
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
            />
          </div>
        </div>
      </div>
    </>
  );
});

HomeContent.displayName = "HomeContent";

const Home = () => <HomeContent />;
export default Home;
