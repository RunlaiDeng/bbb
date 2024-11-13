import Image from "next/image";

const About = () => {
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
