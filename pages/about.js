import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { getKline, getXDCPrice } from "@/components/Utils";

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
  const fee = Number(BigInt(stats?.feeInXDC || 0) / BigInt(1e18)) * xdcPrice;
  const volume = Number(BigInt(stats?.volumeInXDC || 0) / BigInt(1e18)) * xdcPrice;
  const user = stats?.user;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h1 className="text-6xl font-bold text-base-content mb-6">Welcome to BBBFI</h1>
            <p className="text-xl text-base-content/60 leading-relaxed">
              At BBBFI, we believe that everyone should have the freedom to earn, hold, spend, share and give their money - no matter who you are or where you come from.
            </p>
          </div>
          <div className="flex-1">
            <svg viewBox="0 0 200 200" className="w-full max-w-[500px] mx-auto" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="carrotBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="carrotLeaves" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#86efac', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              
              {/* Carrot Body */}
              <path d="M100,60 L120,90 Q130,150 100,180 Q70,150 80,90 Z" 
                    fill="url(#carrotBody)" 
                    stroke="#22c55e" 
                    strokeWidth="2">
                <animate attributeName="d" 
                         values="M100,60 L120,90 Q130,150 100,180 Q70,150 80,90 Z;
                                M100,60 L125,90 Q135,150 100,185 Q65,150 75,90 Z;
                                M100,60 L120,90 Q130,150 100,180 Q70,150 80,90 Z"
                         dur="2s"
                         repeatCount="indefinite" />
              </path>
              
              {/* Carrot Texture Lines */}
              <path d="M90,100 Q100,110 110,100" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2" 
                    opacity="0.5">
                <animate attributeName="d" 
                         values="M90,100 Q100,110 110,100;
                                M88,100 Q100,115 112,100;
                                M90,100 Q100,110 110,100"
                         dur="2s"
                         repeatCount="indefinite" />
              </path>
              <path d="M88,120 Q100,130 112,120" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2" 
                    opacity="0.5">
                <animate attributeName="d" 
                         values="M88,120 Q100,130 112,120;
                                M86,120 Q100,135 114,120;
                                M88,120 Q100,130 112,120"
                         dur="2s"
                         repeatCount="indefinite" />
              </path>
              
              {/* Leaves */}
              <g>
                <path d="M95,50 Q85,30 95,20" 
                      stroke="url(#carrotLeaves)" 
                      strokeWidth="4" 
                      fill="none">
                  <animateTransform attributeName="transform"
                                  type="rotate"
                                  values="-5 100 60;5 100 60;-5 100 60"
                                  dur="3s"
                                  repeatCount="indefinite"/>
                </path>
                <path d="M100,50 Q100,25 110,20" 
                      stroke="url(#carrotLeaves)" 
                      strokeWidth="4" 
                      fill="none">
                  <animateTransform attributeName="transform"
                                  type="rotate"
                                  values="5 100 60;-5 100 60;5 100 60"
                                  dur="2.5s"
                                  repeatCount="indefinite"/>
                </path>
                <path d="M105,50 Q115,30 105,15" 
                      stroke="url(#carrotLeaves)" 
                      strokeWidth="4" 
                      fill="none">
                  <animateTransform attributeName="transform"
                                  type="rotate"
                                  values="-3 100 60;7 100 60;-3 100 60"
                                  dur="3.5s"
                                  repeatCount="indefinite"/>
                </path>
              </g>

              {/* BBB Text */}
              <text x="100" y="130" 
                    textAnchor="middle" 
                    fill="#ffffff" 
                    fontSize="24" 
                    fontWeight="bold">
                BBB
                <animate attributeName="opacity"
                         values="0.8;1;0.8"
                         dur="2s"
                         repeatCount="indefinite"/>
              </text>

              {/* Shine Effect */}
              <circle cx="85" cy="85" r="3" fill="#ffffff" opacity="0.8">
                <animate attributeName="opacity"
                         values="0.8;0.3;0.8"
                         dur="2s"
                         repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-base-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-xl">
                  <svg viewBox="0 0 100 100" width="32" height="32">
                    <circle cx="50" cy="50" r="20" fill="#4ade80">
                      <animate attributeName="r" values="20;22;20" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <path d="M50,20 C70,20 80,35 80,50 C80,65 70,80 50,80 C30,80 20,65 20,50 C20,35 30,20 50,20" 
                          fill="none" stroke="#4ade80" strokeWidth="4">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-base-content">{user?.toLocaleString()}</div>
                  <div className="text-sm text-base-content/50">Total Users</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-xl">
                  <svg viewBox="0 0 100 100" width="32" height="32">
                    <path d="M20,80 L50,20 L80,80" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round">
                      <animate attributeName="stroke-dasharray" values="0,1000;180,0" dur="2s" />
                    </path>
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#4ade80" strokeWidth="4">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-base-content">${volume?.toLocaleString()}</div>
                  <div className="text-sm text-base-content/50">Total Volume</div>
                </div>
              </div>
            </div>

            <div className="bg-base-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-xl">
                  <svg viewBox="0 0 100 100" width="32" height="32">
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#4ade80" strokeWidth="4" strokeDasharray="188.5">
                      <animate attributeName="stroke-dashoffset" from="188.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <path d="M40,50 L47,57 L60,43" stroke="#4ade80" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <animate attributeName="stroke-dasharray" values="0,1000;50,0" dur="2s" />
                    </path>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-base-content">${fee?.toLocaleString()}</div>
                  <div className="text-sm text-base-content/50">Total Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <svg viewBox="0 0 1024 1024" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#4ade80"/>
              <path d="M512 140c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm0 682c-171.4 0-310-138.6-310-310s138.6-310 310-310 310 138.6 310 310-138.6 310-310 310z" fill="#bbf7d0"/>
              <path d="M512 298c-118.8 0-214 95.2-214 214s95.2 214 214 214 214-95.2 214-214-95.2-214-214-214zm0 366c-83.8 0-152-68.2-152-152s68.2-152 152-152 152 68.2 152 152-68.2 152-152 152z" fill="#86efac"/>
              <path d="M512 404c-59.4 0-108 48.6-108 108s48.6 108 108 108 108-48.6 108-108-48.6-108-108-108zm0 164c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56z" fill="#4ade80"/>
              <path d="M512 468c-24.3 0-44 19.7-44 44s19.7 44 44 44 44-19.7 44-44-19.7-44-44-44zm0 64c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" fill="#22c55e"/>
              <path d="M842 512c0 182.2-147.8 330-330 330S182 694.2 182 512s147.8-330 330-330v-42c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372h-42z" fill="#4ade80">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 512 512"
                  to="360 512 512"
                  dur="30s"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M512 280v464" stroke="#4ade80" strokeWidth="4" strokeDasharray="8,8">
                <animate
                  attributeName="stroke-dashoffset"
                  values="16;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M280 512h464" stroke="#4ade80" strokeWidth="4" strokeDasharray="8,8">
                <animate
                  attributeName="stroke-dashoffset"
                  values="16;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-5xl font-bold text-base-content mb-6">Our Vision</h2>
            <p className="text-xl text-base-content/60 leading-relaxed">
              Our vision is to increase the freedom of money globally. We believe that by spreading this freedom, we can significantly improve lives around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Ecosystem Section */}
      <div className="bg-primary/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-base-content mb-6">Our Ecosystem</h2>
          <p className="text-xl text-base-content/60 mb-12">
            Our platform is trusted by millions worldwide, and features an unmatched portfolio of financial product offerings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-base-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-primary/15 rounded-xl inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8">
                  <defs>
                    <linearGradient id="exchangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer Circle */}
                  <circle cx="12" cy="12" r="10" 
                          fill="none" 
                          stroke="url(#exchangeGradient)" 
                          strokeWidth="1.5">
                    <animate attributeName="r"
                             values="10;11;10"
                             dur="2s"
                             repeatCount="indefinite"/>
                    <animate attributeName="opacity"
                             values="0.8;1;0.8"
                             dur="2s"
                             repeatCount="indefinite"/>
                  </circle>

                  {/* Exchange Arrows */}
                  <g transform="translate(12,12)">
                    <animateTransform attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    from="0 0 0"
                                    to="360 0 0"
                                    dur="10s"
                                    repeatCount="indefinite"/>
                    
                    {/* Up Arrow */}
                    <path d="M-4,-2 L0,-6 L4,-2" 
                          stroke="url(#exchangeGradient)" 
                          strokeWidth="1.5" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round">
                      <animate attributeName="stroke-width"
                               values="1.5;2;1.5"
                               dur="2s"
                               repeatCount="indefinite"/>
                    </path>
                    <line x1="0" y1="-6" x2="0" y2="0" 
                          stroke="url(#exchangeGradient)" 
                          strokeWidth="1.5" 
                          strokeLinecap="round">
                      <animate attributeName="stroke-width"
                               values="1.5;2;1.5"
                               dur="2s"
                               repeatCount="indefinite"/>
                    </line>

                    {/* Down Arrow */}
                    <path d="M-4,2 L0,6 L4,2" 
                          stroke="url(#exchangeGradient)" 
                          strokeWidth="1.5" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round">
                      <animate attributeName="stroke-width"
                               values="1.5;2;1.5"
                               dur="2s"
                               repeatCount="indefinite"/>
                    </path>
                    <line x1="0" y1="6" x2="0" y2="0" 
                          stroke="url(#exchangeGradient)" 
                          strokeWidth="1.5" 
                          strokeLinecap="round">
                      <animate attributeName="stroke-width"
                               values="1.5;2;1.5"
                               dur="2s"
                               repeatCount="indefinite"/>
                    </line>
                  </g>

                  {/* Center Dot */}
                  <circle cx="12" cy="12" r="1.5" 
                          fill="url(#exchangeGradient)">
                    <animate attributeName="r"
                             values="1.5;2;1.5"
                             dur="2s"
                             repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-4">BBBFI Exchange</h3>
              <p className="text-base-content/60">
                BBBFI Exchange is the largest crypto exchange by trade volume on xdc network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
