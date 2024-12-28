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
import { track } from "@vercel/analytics";
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
    dMaxXdcCap: parseEther("1000000"),
    dMaxSymbolCap: parseEther(calculateSupply("1000000")),
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
      track("laucnh");
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
    <>
      <div className="card max-w-lg w-full m-auto">
        <div className="card-body">
          <h3 className="font-bold label-text text-center mt-2">
            Launch token
          </h3>
          <div className="text-center mt-5">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Image <span className="text-green-700">*</span>
                </span>
              </div>
              <ImageUpload {...imageUpload} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Name <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(formData?.dName)}/20
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full "
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
                <span className="label-text">
                  Symbol <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(formData?.dSymbol)}/10
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
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
                <span className="label-text">
                  Token Decription <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(formData?.dDesciption)}/256
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered h-20"
                value={formData?.dDesciption}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (getBytesLength(newValue) <= 256) {
                    setFormData({ ...formData, dDesciption: newValue });
                  }
                }}
              ></textarea>
            </label>
            <div className="flex items-center mt-2">
              Max Curve(minimum 1m xdc)
              <div
                className="btn btn-xs ml-auto"
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
                switch to{" "}
                {formData?.maxSymbol == "XDC" ? formData?.dSymbol : "XDC"}
              </div>
            </div>

            {formData?.maxSymbol == "XDC" && (
              <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
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
                <div className="font-bold">XDC</div>
              </label>
            )}
            {formData?.dSymbol == formData?.maxSymbol && (
              <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
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
                <div className="font-bold">{formData?.dSymbol}</div>
              </label>
            )}
            <div className="collapse">
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
              <div className="collapse-title text-left pl-0 text-green-700">
                Show more options {formData?.showOptions ? "↑" : "↓"}
              </div>
              <div className="collapse-content p-0 w-72 sm:w-full">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text">Website</span>
                    <span className="text-right">
                      {getBytesLength(formData?.dWebiste)}/64
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-2 ">
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
                    <span className="label-text">Telegram</span>
                    <span className="text-right">
                      {getBytesLength(formData?.dTelegram)}/64
                    </span>
                  </div>
                  <label className="input input-bordered flex items-center gap-2">
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
                    <span className="label-text">Twitter</span>
                    <span className="text-right">
                      {getBytesLength(formData?.dTwitter)}/64
                    </span>
                  </div>

                  <label className="input input-bordered flex items-center gap-2">
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

                <div className="flex items-center mt-2">
                  How many you want buy
                  <div
                    className="btn btn-xs ml-auto"
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
                    switch to{" "}
                    {formData?.buySymbol == "XDC" ? formData?.dSymbol : "XDC"}
                  </div>
                </div>
                {formData?.buySymbol == "XDC" && (
                  <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
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
                    <div className="font-bold">XDC</div>
                  </label>
                )}
                {formData?.buySymbol == formData?.dSymbol && (
                  <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
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
                    <div className="font-bold">{formData?.dSymbol}</div>
                  </label>
                )}
              </div>
            </div>

            {/* <div className="text-left text-xs text-slate-500">
                Cost <span className="text-xl text-black">FREE</span>{" "}
                <span className="line-through text-slate-500">100</span>{" "}
                <span className="text-green-700">100% OFF</span>{" XDC"}
              </div> */}
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Cost
              <input
                type="text"
                className="grow"
                placeholder={formatEther(totalCost || 0) + " XDC"}
                disabled
              />
              {/* <div className="text-green-700">Free</div> */}
            </label>
          </div>
          <div className="mt-1 text-xs">Avbl {balance?.formatted} XDC</div>
          <Link className="underline text-xs" href={buyXDCLink} target="_blank">
            XDC is not enough ?
          </Link>
          {!canDrop && (
            <div className="text-red-700">
              image, name, symbol, token description are required
            </div>
          )}

          <WriteButton {...drop} className="btn w-full btn-success" />
        </div>
      </div>
    </>
  );
};

export default Launch;
