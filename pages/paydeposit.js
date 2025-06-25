import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useBalance } from "wagmi";
import { formatEther } from "viem";
import rpc from "@/components/Rpc";
import Loading from "@/components/Loading";
import { getXDCPrice } from "@/components/Utils";

const PayDeposit = () => {
  const router = useRouter();
  const { id } = router.query;
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eurPrice, setEurPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 使用 wagmi 获取地址余额
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useBalance({
    address: address,
  });

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 备用方案：使用旧的方式复制
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      // 显示复制成功状态
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      // 触觉反馈 (仅在支持的设备上)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制地址");
    }
  };

  useEffect(() => {
    if (id) {
      fetchAddress();
      fetchPrices();
    }
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await rpc.getAddress(id);

      if (result?.error) {
        setError(`Error: ${result.error.message || "Failed to get address"}`);
      } else {
        setAddress(result || "");
      }
    } catch (err) {
      setError(`Error: ${err.message || "Failed to fetch address"}`);
      console.error("Error fetching address:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      setPriceLoading(true);

      // 获取 XDC 价格（美元）
      const xdcData = await getXDCPrice();
      const xdcUsdPrice = Number(xdcData?.price) || 0.04; // 确保是数字，设置默认值

      // 获取 EUR/USD 汇率并计算 XDC 的欧元价格
      try {
        const eurResponse = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        if (eurResponse.ok) {
          const eurData = await eurResponse.json();
          const eurRate = Number(eurData.rates?.EUR) || 0.85; // 默认汇率
          setEurPrice(xdcUsdPrice * eurRate);
        } else {
          // 如果获取汇率失败，使用默认汇率 0.85
          setEurPrice(xdcUsdPrice * 0.85);
        }
      } catch (eurErr) {
        console.error("Error fetching EUR rate:", eurErr);
        setEurPrice(xdcUsdPrice * 0.85);
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      // 设置默认值
      setEurPrice(0.034);
    } finally {
      setPriceLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Request
          </h1>
          <p className="text-gray-600">No ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Content */}
          <div className="px-6 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
                <span className="ml-3 text-gray-600">Loading address...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Error Loading Address
                  </h3>
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchAddress}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Address Section */}
                <div className="space-y-6">
                  {/* Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Address
                    </label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs sm:text-sm min-h-[3rem] flex items-center break-all leading-relaxed">
                        <span className="text-gray-700">
                          {address || "Address will appear here..."}
                        </span>
                      </div>
                      {address && (
                        <button
                          onClick={() => copyToClipboard(address)}
                          className={`absolute right-3 top-3 p-1 focus:outline-none rounded transition-colors ${
                            copySuccess
                              ? "text-green-600 bg-green-100"
                              : "text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100"
                          }`}
                          title={copySuccess ? "已复制!" : "复制地址"}
                        >
                          {copySuccess ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              ></path>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance Information */}
                {address && (
                                      <div className="grid grid-cols-2 gap-4">
                    {/* XDC Balance */}
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            XDC Balance
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {balanceLoading ? (
                              <span className="text-lg">Loading...</span>
                            ) : balanceError ? (
                              <span className="text-lg text-red-500">
                                Error
                              </span>
                            ) : (
                              `${parseFloat(
                                formatEther(balanceData?.value || 0)
                              ).toLocaleString()} XDC`
                            )}
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* EUR Value */}
                    <div className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            EUR Value
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {priceLoading || balanceLoading ? (
                              <span className="text-lg">Loading...</span>
                            ) : balanceError ? (
                              <span className="text-lg text-red-500">
                                Error
                              </span>
                            ) : (
                              `€${(
                                parseFloat(
                                  formatEther(balanceData?.value || 0)
                                ) * (Number(eurPrice) || 0)
                              ).toFixed(2)}`
                            )}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full">
                          <svg
                            className="w-6 h-6 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayDeposit;
