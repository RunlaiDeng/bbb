import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
import { useState } from "react";
import { useRouter } from "next/router";
import { buyXDCLink } from "@/config";

const Deposit = () => {
  const { address } = useAccount();
  const { success } = useNotification();
  const [data, setData] = useState({ type: 0 });
  const router = useRouter();

  const qrcode = {
    value: address,
    size: 256,
    imageSettings: {
      src: "/xdc.png",
      height: 48,
      width: 48,
      excavate: true,
    },
  };

  return (
    <div className="m-auto md:w-3/4 w-96 mt-8 pb-1">
      {data?.type == 0 && (
        <div className="grid gap-6">
          <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
              Deposit XDC
            </h1>
            <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
              Choose how you want to get XDC to start trading
            </div>
            <div className="grid gap-4">
              <button
                className="bg-white text-green-600 px-8 py-6 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg transform hover:-translate-y-1"
                onClick={() => setData({ ...data, type: 1 })}
              >
                Already own crypto
              </button>
              <button
                className="bg-white text-green-600 px-8 py-6 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg transform hover:-translate-y-1"
                onClick={() => window.open(buyXDCLink)}
              >
                Don&apos;t own crypto
              </button>
            </div>
          </div>
        </div>
      )}

      {data?.type == 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => setData({ ...data, type: 0 })}
              >
                Back
              </button>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                Deposit XDC
              </h2>
            </div>
            {address && (
              <div className="flex justify-center mb-6">
                <QRCodeSVG {...qrcode} />
              </div>
            )}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 mb-2">Network</div>
                  <div className="font-bold text-gray-800">XDC</div>
                </div>
                <div className="divider my-2"></div>
                <div>
                  <div className="text-gray-600 mb-2">Deposit Address</div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="break-all font-medium text-gray-800">{address}</div>
                    <div
                      className="cursor-pointer tooltip ml-2 hover:opacity-80 transition-opacity"
                      data-tip="Copy Address"
                      onClick={() => {
                        copy(address);
                        success("Address copied!");
                      }}
                    >
                      <svg
                        viewBox="0 0 1024 1024"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        className="text-green-600"
                      >
                        <path
                          d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                          fill="currentColor"
                        ></path>
                        <path
                          d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {data?.type == 2 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 mb-6"
              onClick={() => setData({ ...data, type: 0 })}
            >
              Back
            </button>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Coming soon
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
