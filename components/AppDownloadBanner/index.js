import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

const AppDownloadBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    window.open('/download', '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 border-t border-green-500/30 shadow-lg hidden lg:block">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Image
                src="/logosm.png"
                alt="BBBFI App"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">
                BBBFI App
              </div>
              <div className="text-green-100 text-xs">
                Secure, fast and elegant
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* QR Code Tooltip */}
              {showQR && (
                <div className="absolute bottom-16 right-0 mb-2 bg-white rounded-lg shadow-2xl p-4 border border-gray-200 transform transition-all duration-300 ease-in-out animate-fadeInUp">
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      Scan to Download App
                    </p>
                    <p className="text-xs text-gray-600">iOS & Android</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <QRCodeSVG
                      value="https://bbbfi.com/download"
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  {/* Arrow pointing down to button */}
                  <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white shadow-sm"></div>
                </div>
              )}

              {/* QR Code Icon Button */}
              <button
                className="text-green-100 hover:text-white transition-colors duration-200 p-2 mr-2 hover:bg-green-500/20 rounded-lg"
                onMouseEnter={() => setShowQR(true)}
                onMouseLeave={() => setShowQR(false)}
                aria-label="Scan QR Code"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/>
                  <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor"/>
                  <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor"/>
                  <rect x="5" y="5" width="4" height="4" rx="0.5" fill="#065f46"/>
                  <rect x="15" y="5" width="4" height="4" rx="0.5" fill="#065f46"/>
                  <rect x="5" y="15" width="4" height="4" rx="0.5" fill="#065f46"/>
                  <rect x="13" y="13" width="3" height="3" fill="currentColor"/>
                  <rect x="17" y="13" width="4" height="3" fill="currentColor"/>
                  <rect x="13" y="17" width="8" height="4" fill="currentColor"/>
                  <rect x="15" y="19" width="4" height="1" fill="#065f46"/>
                </svg>
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              Download
            </button>
            <button
              onClick={handleClose}
              className="text-green-100 hover:text-white transition-colors duration-200 p-1 hover:bg-green-500/20 rounded"
              aria-label="Close banner"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppDownloadBanner;
