import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";
import {
  getBytesLength,
  handleSrc,
  calculateSupply,
  calculateXdcAmount,
  getXDCPrice,
  getBBBPrice,
} from "@/components/Utils";
import { useState } from "react";
import { parseEther, formatEther, decodeEventLog } from "viem";
import { buyXDCLink, contracts } from "@/config";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContracts,
} from "wagmi";
import WriteButton from "@/components/WriteButton";

import { useRouter } from "next/router";

const Launch = () => {
  const router = useRouter();
  const chainId = useChainId();
  const mbbb = contracts[chainId]?.mbbbv2;

  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address });
  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "deployFee",
        args: [],
      },
    ],
  });

  const price = reads0?.[0]?.result;

  const [formData, setFormData] = useState({
    dName: "",
    dSymbol: "",
    dMaxXdcCap: parseEther("100000"),
    dMaxSymbolCap: parseEther(calculateSupply("100000")),
    maxSymbol: "XDC",
    buySymbol: "XDC",
    showOptions: false,
    dDesciption: "",
    dWebiste: "",
    dTelegram: "",
    dTwitter: "",
    dBuy: undefined,
    dBuySymbol: undefined,
    search: "",
  });

  const imageUpload = {
    callback: (file) => {
      setMarketState((prev) => ({ ...prev, image: file }));
    },
  };

  const [marketState, setMarketState] = useState({
    mount: false,
    tokens: {},
    priceItems: {},
    image: "",
  });

  const canDrop =
    formData?.dName &&
    formData?.dSymbol &&
    marketState?.image &&
    formData?.dDesciption;

  const totalCost = (price || 0n) + (formData?.dBuy || 0n);

  const client = usePublicClient();
  const drop = {
    buttonName: "Confirm",
    disabled: !canDrop,
    data: {
      ...mbbb,
      functionName: "drop",
      args: [
        formData?.dName,
        formData?.dSymbol,
        marketState?.image,
        formData?.dDesciption,
        formData?.dWebiste,
        formData?.dTelegram,
        formData?.dTwitter,
        formData?.dMaxXdcCap,
      ],
      value: totalCost,
    },
    before: () => {

    },
    callback: async (confirm, txHash) => {
      if (confirm) {
        const transaction = await client.getTransactionReceipt({
          hash: txHash,
        });
        const log = transaction?.logs?.[1];
        const data = log?.data;
        const topics = log?.topics;
        const result = decodeEventLog({ ...mbbb, data, topics });
        const tokenAddress = result?.args?.token;
        router.push("/swap/" + tokenAddress);
      }
    },
  };

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          Launch Your Token
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🚀 Create your own token on XDC Network in minutes
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold text-gray-700">
                Token Image <span className="text-green-700">*</span>
              </span>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
              <ImageUpload {...imageUpload} />
            </div>
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold text-gray-700">
                Token Name <span className="text-green-700">*</span>
              </span>
              <span className="text-right text-gray-500">
                {getBytesLength(formData?.dName)}/20
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full bg-gradient-to-br from-emerald-50 to-green-50 border-green-100"
              value={formData?.dName}
              onChange={(e) => {
                const newValue = e.target.value;
                if (getBytesLength(newValue) <= 20) {
                  setFormData({ ...formData, dName: newValue });
                }
              }}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-semibold text-gray-700">
                Token Symbol <span className="text-green-700">*</span>
              </span>
              <span className="text-right text-gray-500">
                {getBytesLength(formData?.dSymbol)}/10
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full bg-gradient-to-br from-emerald-50 to-green-50 border-green-100"
              value={formData?.dSymbol}
              onChange={(e) => {
                const newValue = e.target.value;
                if (getBytesLength(newValue) <= 10) {
                  let change = { dSymbol: newValue };
                  if (formData?.maxSymbol != "XDC") {
                    change = { ...change, maxSymbol: newValue };
                  }
                  if (formData?.buySymbol != "XDC") {
                    change = { ...change, buySymbol: newValue };
                  }
                  setFormData({
                    ...formData,
                    ...change,
                  });
                }
              }}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-semibold text-gray-700">
                Token Description <span className="text-green-700">*</span>
              </span>
              <span className="text-right text-gray-500">
                {getBytesLength(formData?.dDesciption)}/256
              </span>
            </div>
            <textarea
              className="textarea textarea-bordered h-20 bg-gradient-to-br from-emerald-50 to-green-50 border-green-100"
              value={formData?.dDesciption}
              onChange={(e) => {
                const newValue = e.target.value;
                if (getBytesLength(newValue) <= 256) {
                  setFormData({ ...formData, dDesciption: newValue });
                }
              }}
            ></textarea>
          </label>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-700">Max Curve (minimum 10000 XDC)</span>
              <button
                className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => {
                  if (formData.maxSymbol == "XDC") {
                    setFormData({
                      ...formData,
                      maxSymbol: formData?.dSymbol,
                    });
                  } else {
                    setFormData({ ...formData, maxSymbol: "XDC" });
                  }
                }}
              >
                switch to {formData?.maxSymbol == "XDC" ? formData?.dSymbol : "XDC"}
              </button>
            </div>

            {formData?.maxSymbol == "XDC" && (
              <label className="input input-bordered flex items-center gap-2 w-full bg-white">
                <input
                  type="text"
                  className="grow"
                  placeholder="0.00"
                  value={
                    formData?.dMaxXdcCap >= 0
                      ? formatEther(formData?.dMaxXdcCap)
                      : undefined
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (!newValue) {
                      setFormData({
                        ...formData,
                        dMaxXdcCap: undefined,
                        dMaxSymbolCap: undefined,
                      });
                    }
                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      setFormData({
                        ...formData,
                        dMaxXdcCap: parseEther(newValue),
                        dMaxSymbolCap: parseEther(calculateSupply(newValue)),
                      });
                    }
                  }}
                />
                <div className="font-bold text-gray-700">XDC</div>
              </label>
            )}

            {formData?.dSymbol == formData?.maxSymbol && (
              <label className="input input-bordered flex items-center gap-2 w-full bg-white">
                <input
                  type="text"
                  className="grow"
                  placeholder="0.00"
                  value={
                    formData?.dMaxSymbolCap >= 0
                      ? formatEther(formData?.dMaxSymbolCap)
                      : undefined
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (!newValue) {
                      setFormData({
                        ...formData,
                        dMaxXdcCap: undefined,
                        dMaxSymbolCap: undefined,
                      });
                    }
                    if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                      setFormData({
                        ...formData,
                        dMaxXdcCap: parseEther(calculateXdcAmount(newValue)),
                        dMaxSymbolCap: parseEther(newValue),
                      });
                    }
                  }}
                />
                <div className="font-bold text-gray-700">{formData?.dSymbol}</div>
              </label>
            )}
          </div>

          <div className="collapse bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-green-100">
            <input
              type="checkbox"
              value={formData?.showOptions}
              onClick={(e) => {
                setFormData({
                  ...formData,
                  showOptions: e.target.checked,
                });
              }}
            />
            <div className="collapse-title text-left pl-4 text-green-700 font-semibold">
              Show more options {formData?.showOptions ? "↑" : "↓"}
            </div>
            <div className="collapse-content p-4">
              <div className="space-y-4">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold text-gray-700">Website</span>
                    <span className="text-right text-gray-500">
                      {getBytesLength(formData?.dWebiste)}/64
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-2 bg-white">
                    https://
                    <input
                      type="text"
                      className="grow"
                      placeholder="Optional"
                      value={formData?.dWebiste}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (getBytesLength(newValue) <= 64) {
                          setFormData({ ...formData, dWebiste: newValue });
                        }
                      }}
                    />
                  </label>
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold text-gray-700">Telegram</span>
                    <span className="text-right text-gray-500">
                      {getBytesLength(formData?.dTelegram)}/64
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-2 bg-white">
                    https://t.me/
                    <input
                      type="text"
                      className="grow"
                      placeholder="Optional"
                      value={formData?.dTelegram}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (getBytesLength(newValue) <= 64) {
                          setFormData({ ...formData, dTelegram: newValue });
                        }
                      }}
                    />
                  </label>
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold text-gray-700">Twitter</span>
                    <span className="text-right text-gray-500">
                      {getBytesLength(formData?.dTwitter)}/64
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-2 bg-white">
                    https://x.com/
                    <input
                      type="text"
                      className="grow"
                      placeholder="Optional"
                      value={formData?.dTwitter}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (getBytesLength(newValue) <= 64) {
                          setFormData({ ...formData, dTwitter: newValue });
                        }
                      }}
                    />
                  </label>
                </label>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">How many you want to buy</span>
                    <button
                      className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      onClick={() => {
                        if (formData.buySymbol == "XDC") {
                          setFormData({
                            ...formData,
                            buySymbol: formData?.dSymbol,
                          });
                        } else {
                          setFormData({ ...formData, buySymbol: "XDC" });
                        }
                      }}
                    >
                      switch to {formData?.buySymbol == "XDC" ? formData?.dSymbol : "XDC"}
                    </button>
                  </div>

                  {formData?.buySymbol == "XDC" && (
                    <label className="input input-bordered flex items-center gap-2 w-full bg-white">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          formData?.dBuy >= 0
                            ? formatEther(formData?.dBuy)
                            : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setFormData({
                              ...formData,
                              dBuy: undefined,
                              dBuySymbol: undefined,
                            });
                          }
                          if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                            setFormData({
                              ...formData,
                              dBuySymbol: parseEther(calculateSupply(newValue)),
                              dBuy: parseEther(newValue),
                            });
                          }
                        }}
                      />
                      <div className="font-bold text-gray-700">XDC</div>
                    </label>
                  )}

                  {formData?.buySymbol == formData?.dSymbol && (
                    <label className="input input-bordered flex items-center gap-2 w-full bg-white">
                      <input
                        type="text"
                        className="grow"
                        placeholder="0.00"
                        value={
                          formData?.dBuySymbol >= 0
                            ? formatEther(formData?.dBuySymbol)
                            : undefined
                        }
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setFormData({
                              ...formData,
                              dBuy: undefined,
                              dBuySymbol: undefined,
                            });
                          }
                          if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                            setFormData({
                              ...formData,
                              dBuySymbol: parseEther(newValue),
                              dBuy: parseEther(calculateXdcAmount(newValue)),
                            });
                          }
                        }}
                      />
                      <div className="font-bold text-gray-700">{formData?.dSymbol}</div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-700 mb-1">Launch Cost</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatEther(totalCost || 0)} XDC
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Available: {balance?.formatted} XDC
                </div>
              </div>
              <Link
                className="text-green-600 hover:text-green-700 underline text-sm"
                href={buyXDCLink}
                target="_blank"
              >
                Need more XDC?
              </Link>
            </div>
          </div>

          {!canDrop && (
            <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              ⚠️ Image, name, symbol, and token description are required
            </div>
          )}

          <WriteButton
            {...drop}
            className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Launch;
