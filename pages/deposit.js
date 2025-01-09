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
    <div className="max-w-4xl m-auto px-4 mt-12 pb-8">
      {data?.type == 0 && (
        <div className="grid gap-8">
          <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl shadow-2xl p-10 text-white">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
              Deposit XDC
            </h1>
            <div className="text-lg bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/20 shadow-inner">
              Choose how you want to get XDC to start trading
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                className="bg-white/95 text-emerald-600 px-8 py-8 rounded-2xl font-bold hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm"
                onClick={() => setData({ ...data, type: 1 })}
              >
                <div className="text-xl mb-2">Already own crypto</div>
                <div className="text-sm text-emerald-500">Deposit directly to your wallet</div>
              </button>
              <button
                className="bg-white/95 text-emerald-600 px-8 py-8 rounded-2xl font-bold hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm"
                onClick={() => window.open(buyXDCLink)}
              >
                <div className="text-xl mb-2">Don&apos;t own crypto</div>
                <div className="text-sm text-emerald-500">Buy XDC with card or bank transfer</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {data?.type == 1 && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
              <button
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 font-medium"
                onClick={() => setData({ ...data, type: 0 })}
              >
                ← Back
              </button>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600">
                Deposit XDC
              </h2>
            </div>
            {address && (
              <div className="flex justify-center mb-8 bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl">
                <QRCodeSVG {...qrcode} />
              </div>
            )}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-100/50 shadow-inner">
              <div className="space-y-6">
                <div>
                  <div className="text-emerald-700 mb-2 font-medium">Network</div>
                  <div className="font-bold text-gray-800 text-lg">XDC Network</div>
                </div>
                <div className="h-px bg-gradient-to-r from-emerald-200/50 via-green-200/50 to-emerald-200/50"></div>
                <div>
                  <div className="text-emerald-700 mb-2 font-medium">Deposit Address</div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-inner border border-emerald-100/50">
                    <div className="break-all font-medium text-gray-800">{address}</div>
                    <div
                      className="cursor-pointer tooltip ml-4 hover:opacity-80 transition-opacity bg-emerald-50 p-2 rounded-lg"
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
                        className="text-emerald-600"
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
        <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <button
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 mb-8 font-medium"
              onClick={() => setData({ ...data, type: 0 })}
            >
              ← Back
            </button>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600">
              Coming soon
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
