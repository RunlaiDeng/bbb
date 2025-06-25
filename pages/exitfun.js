import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { erc20Abi, formatEther, parseEther, isAddress } from "viem";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import Head from "next/head";
import { getXDCPrice } from "@/components/Utils";

const ExitFromFun = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const mbbbv2 = contracts[chainId]?.mbbbv2;

  const [tokenAddress, setTokenAddress] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [sellPercentage, setSellPercentage] = useState(0);
  const [xdcPrice, setXdcPrice] = useState(0);
  const [tokenIndex, setTokenIndex] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLiquidityRemoved, setIsLiquidityRemoved] = useState(false);

  // Get XDC price
  useEffect(() => {
    const fetchXDCPrice = async () => {
      try {
        const price = await getXDCPrice();
        setXdcPrice(price?.price || 0);
      } catch (error) {
        console.error("Failed to fetch XDC price:", error);
      }
    };
    fetchXDCPrice();
  }, []);

  // Token contract configuration
  const tokenContract =
    tokenAddress && isAddress(tokenAddress)
      ? {
          address: tokenAddress,
          abi: erc20Abi,
        }
      : null;

  // Read token balance and info
  const { data: tokenReads, refetch: refetchToken } = useReadContracts({
    contracts: tokenContract
      ? [
          {
            ...tokenContract,
            functionName: "balanceOf",
            args: [address],
          },
          {
            ...tokenContract,
            functionName: "symbol",
          },
          {
            ...tokenContract,
            functionName: "name",
          },
          {
            ...tokenContract,
            functionName: "decimals",
          },
        ]
      : [],
  });

  // Read token mapping to get index and token info
  const { data: mappingReads, refetch: refetchMapping } = useReadContracts({
    contracts:
      tokenContract && mbbbv2
        ? [
            {
              ...mbbbv2,
              functionName: "tokenMapping",
              args: [tokenAddress],
            },
            {
              ...mbbbv2,
              functionName: "getDropTokenByAddress",
              args: [tokenAddress],
            },
          ]
        : [],
  });

  // Read sell amount estimation
  const { data: sellReads, refetch: refetchSell } = useReadContracts({
    contracts:
      tokenIndex !== null && sellAmount && mbbbv2
        ? [
            {
              ...mbbbv2,
              functionName: "getSellAmount",
              args: [tokenIndex, parseEther(sellAmount || "0")],
            },
          ]
        : [],
  });

  const tokenBalance = tokenReads?.[0]?.result || 0n;
  const tokenSymbol = tokenReads?.[1]?.result || "";
  const tokenName = tokenReads?.[2]?.result || "";
  const tokenDecimals = tokenReads?.[3]?.result || 18;

  const mappedIndex = mappingReads?.[0]?.result;
  const dropTokenInfo = mappingReads?.[1]?.result;
  const sellXDCAmount = sellReads?.[0]?.result || 0n;

  // Update token index and liquidity status when mapping changes
  useEffect(() => {
    if (mappedIndex !== undefined) {
      if (mappedIndex > 0) {
        setTokenIndex(Number(mappedIndex));
        setIsValidToken(true);
        
        // Check if liquidity is removed
        if (dropTokenInfo && dropTokenInfo.removed > 0) {
          setIsLiquidityRemoved(true);
        } else {
          setIsLiquidityRemoved(false);
        }
      } else {
        setTokenIndex(null);
        setIsValidToken(false);
        setIsLiquidityRemoved(false);
      }
    }
  }, [mappedIndex, dropTokenInfo]);

  // Handle token address input
  const handleTokenAddressChange = (e) => {
    const value = e.target.value;
    setTokenAddress(value);
    setSellAmount("");
    setSellPercentage(0);
    setTokenIndex(null);
    setIsValidToken(false);
    setIsLiquidityRemoved(false);
  };

  // Handle percentage change
  const handlePercentageChange = (percentage) => {
    setSellPercentage(percentage);
    if (tokenBalance > 0) {
      const amount = (tokenBalance * BigInt(percentage)) / 100n;
      setSellAmount(formatEther(amount));
    }
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setSellAmount(value);

    if (tokenBalance > 0 && value) {
      try {
        const inputAmount = parseEther(value);
        const percentage = Number((inputAmount * 100n) / tokenBalance);
        setSellPercentage(Math.min(percentage, 100));
      } catch {
        setSellPercentage(0);
      }
    } else {
      setSellPercentage(0);
    }
  };

  // Sell button configuration
  const sellConfig = {
    buttonName: `Sell ${tokenSymbol}`,
    disabled:
      !isValidToken || !sellAmount || parseEther(sellAmount || "0") === 0n,
    data:
      tokenIndex !== null
        ? {
            ...mbbbv2,
            functionName: "sell",
            args: [tokenIndex, parseEther(sellAmount || "0")],
          }
        : null,
    callback: () => {
      refetchToken();
      refetchSell();
      setSellAmount("");
      setSellPercentage(0);
    },
  };

  const formatNumber = (value, decimals = 4) => {
    if (!value) return "0";
    return Number(formatEther(value)).toLocaleString(undefined, {
      maximumFractionDigits: decimals,
    });
  };

  const formatUSD = (xdcAmount) => {
    if (!xdcAmount || !xdcPrice) return "$0.00";
    const usdValue = Number(formatEther(xdcAmount)) * xdcPrice;
    return `$${usdValue.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6 text-center">
              Exit from Fun
            </h2>

            {/* Token Address Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-bold">Token Address</span>
              </label>
              <input
                type="text"
                placeholder="Enter token contract address (0x...)"
                className="input input-bordered w-full"
                value={tokenAddress}
                onChange={handleTokenAddressChange}
              />
              {tokenAddress && !isAddress(tokenAddress) && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    Invalid address format
                  </span>
                </label>
              )}
              {tokenAddress &&
                isAddress(tokenAddress) &&
                !isValidToken &&
                mappedIndex !== undefined && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      Token not found in Fun trading platform
                    </span>
                  </label>
                )}
            </div>

            {/* Token Info */}
            {isValidToken && tokenSymbol && (
              <div className="bg-base-200 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-2">
                  {tokenName} ({tokenSymbol})
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Your Balance: </span>
                    <span className="text-primary font-bold">
                      {formatNumber(tokenBalance)} {tokenSymbol}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Token Index: </span>
                    <span>#{tokenIndex}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Liquidity Removed Notice */}
            {isValidToken && isLiquidityRemoved && (
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Liquidity Removed!</h3>
                  <div className="text-sm">This token&apos;s liquidity has been removed from the Fun platform. You can trade it on other DEXs.</div>
                </div>
                <div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => window.open(`https://icecreamswap.com/swap?chain=xdc&inputCurrency=${tokenAddress}&outputCurrency=XDC`, '_blank')}
                  >
                    Trade on IceCreamSwap
                  </button>
                </div>
              </div>
            )}

            {/* Sell Interface */}
            {isValidToken && !isLiquidityRemoved && tokenBalance > 0 && (
              <>
                {/* Percentage Buttons */}
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text font-bold">Quick Select</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((percentage) => (
                      <button
                        key={percentage}
                        className={`btn btn-sm ${
                          sellPercentage === percentage
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                        onClick={() => handlePercentageChange(percentage)}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-bold">Amount to Sell</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered w-full"
                    value={sellAmount}
                    onChange={handleAmountChange}
                    step="any"
                    min="0"
                    max={formatEther(tokenBalance)}
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Max: {formatNumber(tokenBalance)} {tokenSymbol}
                    </span>
                  </label>
                </div>

                {/* Percentage Slider */}
                <div className="form-control mb-6">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sellPercentage}
                    onChange={(e) =>
                      handlePercentageChange(Number(e.target.value))
                    }
                    className="range range-primary"
                  />
                  <div className="flex justify-between text-xs px-2 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Sell Estimation */}
                {sellAmount && sellXDCAmount > 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-success mb-2">
                      You will receive:
                    </h4>
                    <div className="text-xl font-bold text-success">
                      {formatNumber(sellXDCAmount)} XDC
                    </div>
                    <div className="text-sm text-success/80">
                      ≈ {formatUSD(sellXDCAmount)}
                    </div>
                  </div>
                )}

                {/* Sell Button */}
                <WriteButton {...sellConfig} />
              </>
            )}

            {/* No Balance Message */}
            {isValidToken && !isLiquidityRemoved && tokenBalance === 0n && (
              <div className="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span>
                  You don&apos;t have any {tokenSymbol} tokens to sell.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h3 className="card-title">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter the token contract address you want to sell</li>
              <li>
                The system will check if the token is available for trading on
                the Fun platform
              </li>
              <li>
                If valid, you&apos;ll see your token balance and can select how
                much to sell
              </li>
              <li>Use the percentage buttons or slider for quick selection</li>
              <li>
                Review the XDC amount you&apos;ll receive and confirm the
                transaction
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExitFromFun;
