import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { buyXDCLink } from "@/config";

const Deposit = () => {
  const { address } = useAccount();
  const { success } = useNotification();
  const [data, setData] = useState({ type: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const qrcode = {
    value: address,
    size: 280,
    imageSettings: {
      src: "/xdc.png",
      height: 56,
      width: 56,
      excavate: true,
    },
  };

  const handleCopyAddress = () => {
    copy(address);
    setCopied(true);
    success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTypeChange = (newType) => {
    setIsAnimating(true);
    setTimeout(() => {
      setData({ ...data, type: newType });
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/80 to-base-300/40">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {data?.type == 0 && (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-accent">
                Deposit XDC
              </h1>
              <p className="text-xl text-base-content/60 max-w-2xl mx-auto leading-relaxed">
                Choose your preferred method to get XDC and start your trading journey
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <button
                  className="group relative bg-gradient-to-br from-primary to-primary/80 text-primary-content p-8 rounded-2xl font-semibold hover:brightness-110 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  onClick={() => handleTypeChange(1)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-base-200/20 rounded-xl mb-4 mx-auto">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold mb-2">Already own crypto</div>
                    <div className="text-primary-content/80 text-sm">Deposit directly to your wallet address</div>
                  </div>
                </button>
                
                <button
                  className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  onClick={() => window.open(buyXDCLink)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-base-200/20 rounded-xl mb-4 mx-auto">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold mb-2">Don&apos;t own crypto</div>
                    <div className="text-blue-100 text-sm">Buy XDC with card or bank transfer</div>
                  </div>
                </button>
              </div>
          </div>
        )}

        {data?.type == 1 && (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-base-200/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6">
                <div className="flex justify-between items-center">
                  <button
                    className="flex items-center space-x-2 bg-base-200/20 hover:bg-base-200/30 text-white px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                    onClick={() => handleTypeChange(0)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                  </button>
                  <h2 className="text-3xl font-bold text-white">
                    Deposit XDC
                  </h2>
                  <div className="w-20"></div>
                </div>
              </div>
              
              <div className="p-8 md:p-12">
                {address ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-base-content/80 mb-2">Scan QR Code or Copy Address</h3>
                      <p className="text-base-content/60">Send XDC to your wallet address below</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary/10 to-base-200 p-8 rounded-2xl border border-base-300 shadow-inner">
                      <div className="flex justify-center mb-8">
                        <div className="bg-base-200 p-6 rounded-2xl shadow-lg">
                          <QRCodeSVG {...qrcode} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-primary/10 to-base-200 p-6 rounded-2xl border border-base-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-primary font-semibold">Network</div>
                            <div className="font-bold text-base-content/80 text-lg">XDC Network</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-primary/10 to-base-200 p-6 rounded-2xl border border-base-300">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-primary font-semibold mb-2">Deposit Address</div>
                            <div className="flex items-center justify-between bg-base-300/50 p-4 rounded-xl shadow-sm border border-base-300">
                              <div className="break-all font-mono text-sm text-base-content/80 mr-4">{address}</div>
                              <button
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                                  copied 
                                    ? 'bg-primary text-primary-content' 
                                    : 'bg-base-300 hover:bg-base-300/80 text-primary'
                                }`}
                                onClick={handleCopyAddress}
                              >
                                {copied ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-warning mb-1">Important Notice</h4>
                          <p className="text-base-content/80 text-sm">
                            Only send XDC to this address on the XDC Network. Sending other cryptocurrencies or using wrong networks may result in permanent loss.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-base-content/70 mb-2">Connect Your Wallet</h3>
                    <p className="text-base-content/60">Please connect your wallet to view your deposit address</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {data?.type == 2 && (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-base-200/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-300 p-12">
              <div className="text-center">
                <button
                  className="btn btn-primary mb-8 mx-auto"
                  onClick={() => handleTypeChange(0)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                  Coming Soon
                </h3>
                <p className="text-xl text-base-content/60 max-w-md mx-auto">
                  This feature is currently under development. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
