import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import { useRouter } from "next/router";
const Home = () => {
  const privyLogin = usePrivyLogin();
  const router = useRouter();
  return (
    <>
      <div className="card min-h-screen sm:w-3/4 m-auto">
        <div className="card-body">
          <div className="sm:flex items-center gap-2 sm:mt-8">
            <div className="text-center sm:text-left">
              <div className="text-green-700 font-bold sm:text-5xl ">
                Next generation exchange and all is on blockchain
              </div>
              <div
                className="btn btn-success text-white sm:btn-lg mt-8 mx-4 w-72 sm:w-96 hover:bg-white hover:text-green-700 outline outline-2 "
                onClick={async () => {
                  await privyLogin();
                  router.push("/markets");
                }}
              >
                Try Now
              </div>
              <div className="mt-8"></div>
            </div>
            <div className="mt-10">
              <div className="mockup-browser border-green-700 border border-4">
                <Image
                  src={"/home0.png"}
                  height={1000}
                  width={1000}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="m-auto my-10 sm:mt-0"></div>
        </div>
      </div>

      <div className="card sm:w-1/2 m-auto min-h-screen">
        <div className="card-body text-center">
          <div className="text-green-700 font-bold text-5xl my-4">
            Trade with confidence
          </div>
          <div className="opacity-50 my-4">
            Get low fees, high speed transactions, powerful APIs, and more
          </div>
          <div className="mockup-browser border-green-700 border border-4 my-4">
            <Image
              src={"/home1.png"}
              height={1000}
              width={1000}
              className="w-full"
            />
          </div>
        </div>
      </div>
      {/* <div className="card m-auto sm:w-3/4 min-h-screen">
        <div className="card-body">
          <div className="text-green-700 font-bold text-5xl my-4 text-center">
            Backed by
          </div>
          <div className="grid grid-cols-4">
            <Image src={"/xdcBrand.png"} height={200} width={200} alt="" />
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Home;
