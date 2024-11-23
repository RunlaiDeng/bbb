import Image from "next/image";
import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { getXDCPrice } from "@/components/Utils";
const About = () => {
  const [data, setData] = useState({});
  async function fetchData(params) {
    const xdc = await getXDCPrice();
    const stats = await rpc.getStats();
    setData({ ...data, xdc, stats });
  }
  useEffect(() => {
    fetchData();
  }, []);
  const xdcPrice = data?.xdc?.price;
  const stats = data?.stats;
  console.log(xdcPrice, stats);
  const fee = Number(BigInt(stats?.feeInXDC || 0) / BigInt(1e18)) * xdcPrice;
  const volume =
    Number(BigInt(stats?.volumeInXDC || 0) / BigInt(1e18)) * xdcPrice;
  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="sm:flex font-black items-center gap-4 mt-10">
            <div>
              <div className="text-5xl">Welcome to BBBPump</div>

              <div className="opacity-50 mt-8">
                At BBBPump, we believe that everyone should have the freedom to
                earn, hold, spend, share and give their money - no matter who
                you are or where you come from.
              </div>
            </div>
            <div>
              <Image src={"/logo.png"} height={1000} width={1000} alt="" />
            </div>
          </div>
          <div className="grid grid-cols-3 font-black mt-8">
            <div className="flex gap-4 items-center">
              <div className="w-10 w-10">
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="2487"
                  width="16"
                  height="16"
                  className="w-full h-full"
                >
                  <path
                    d="M512 1024C229.229714 1024 0 794.770286 0 512S229.229714 0 512 0s512 229.229714 512 512-229.229714 512-512 512z m0-927.98781C282.258286 96.01219 96.01219 282.258286 96.01219 512c0 107.446857 41.081905 205.04381 107.934477 278.869333 60.269714-29.135238 38.13181-4.87619 116.955428-37.351619 80.676571-33.133714 99.791238-44.714667 99.791238-44.714666l0.75581-76.434286s-30.208-22.942476-39.594667-94.866286c-18.919619 5.436952-25.161143-22.016-26.282666-39.497143-0.999619-16.896-10.922667-69.632 12.117333-64.877714-4.705524-35.206095-8.094476-66.950095-6.436572-83.772952 5.778286-59.050667 63.097905-120.758857 151.356953-125.269334 103.838476 4.510476 144.969143 66.169905 150.723047 125.220572 1.682286 16.822857-2.023619 48.615619-6.729142 83.748571 23.064381-4.681143 13.04381 47.957333 11.922285 64.853334-1.024 17.481143-7.41181 44.836571-26.258285 39.424-9.435429 71.899429-39.643429 94.671238-39.643429 94.671238l0.707048 76.04419s19.090286 10.825143 99.766857 43.983238c78.823619 32.451048 56.710095 9.630476 116.955428 38.838857 66.876952-73.801143 107.958857-171.422476 107.958857-278.869333 0-229.741714-186.270476-415.98781-416.01219-415.98781z"
                    p-id="2488"
                  ></path>
                </svg>
              </div>
              <div>
                <div>{stats?.user}</div>
                <div className="text-xs opacity-50">Total users</div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-10 w-10">
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  className="w-full h-full"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15 3.5a5.502 5.502 0 00-5.302 4.032 7.502 7.502 0 016.77 6.77A5.502 5.502 0 0015 3.5zM14.5 15a5.5 5.5 0 10-11 0 5.5 5.5 0 0011 0zm-8 0L9 17.5l2.5-2.5L9 12.5 6.5 15zM9 4H4v5l5-5zm11 16h-5l5-5v5z"
                  ></path>
                </svg>
              </div>
              <div>
                <div>${volume?.toLocaleString()}</div>
                <div className="text-xs opacity-50">Total volume</div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div></div>
              <div>
                <div>${fee?.toLocaleString()}</div>
                <div className="text-xs opacity-50">Total fee</div>
              </div>
            </div>
          </div>
          <div className="sm:flex font-black items-center gap-4 mt-24">
            <div>
              <Image src={"/vision.png"} height={1000} width={1000} alt="" />
            </div>
            <div>
              <div className="text-5xl">Our Vision</div>

              <div className="opacity-50 mt-8">
                Our vision is to build an all-in-one platform that integrates
                DeFi, DEX, Launchpad, and blockchain technology, focusing on
                supporting meme projects. All profits will be directed towards
                BBB holders, ensuring the platform operates to maximize benefits
                for BBB holders.
              </div>
            </div>
          </div>
          <div className="font-black items-center gap-4 mt-24">
            <div>
              <div className="text-5xl">Our Ecosystem</div>
              <div className="opacity-50 mt-8">
                Our platform is trusted by millions worldwide, and features an
                unmatched portfolio of financial product offerings.
              </div>
              <div className="grid grid-cols-3 mt-8">
                <div className="card outline w-96 h-48">
                  <div className="card-body">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-8 h-8"
                    >
                      <path
                        d="M21.5 8.5a6 6 0 11-12 0 6 6 0 0112 0z"
                        fill="#76808F"
                      ></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.5 9.5a6 6 0 110 12 6 6 0 010-12zm0 8.5L6 15.5 8.5 13l2.5 2.5L8.5 18z"
                        fill="url(#spot-g_svg__paint0_linear)"
                      ></path>
                      <path
                        d="M9 3H3v6l6-6z"
                        fill="url(#spot-g_svg__paint1_linear)"
                      ></path>
                      <path
                        d="M15 21h6v-6l-6 6z"
                        fill="url(#spot-g_svg__paint2_linear)"
                      ></path>
                      <defs>
                        <linearGradient
                          id="spot-g_svg__paint0_linear"
                          x1="8.5"
                          y1="21.5"
                          x2="8.5"
                          y2="9.5"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#F0B90B"></stop>
                          <stop offset="1" stop-color="#F8D33A"></stop>
                        </linearGradient>
                        <linearGradient
                          id="spot-g_svg__paint1_linear"
                          x1="6"
                          y1="9"
                          x2="6"
                          y2="3"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#F0B90B"></stop>
                          <stop offset="1" stop-color="#F8D33A"></stop>
                        </linearGradient>
                        <linearGradient
                          id="spot-g_svg__paint2_linear"
                          x1="18"
                          y1="21"
                          x2="18"
                          y2="15"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#F0B90B"></stop>
                          <stop offset="1" stop-color="#F8D33A"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="text-xl">BBBPump Exchange</div>

                    <div className="opacity-50">
                      BBBPump Exchange is the largest crypto exchange by trade
                      volume on xdc network.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
