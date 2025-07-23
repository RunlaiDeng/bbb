import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContracts,
  usePublicClient,
  useChainId,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import WriteButton from "../../components/WriteButton";
import { useRouter } from "next/router";
import IDOABI from "../../abi/IDOABI.json";
import Link from "next/link";
import Image from "next/image";
import { contracts, idos } from "@/config";

const IdoDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseInput, setPurchaseInput] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const idoContract = contracts?.[chainId]?.idoContract;
  // Get public client for direct contract calls
  const publicClient = usePublicClient();

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id || !publicClient || !idoContract) return;

      setLoading(true);

      try {
        const campaignData = await publicClient.readContract({
          ...idoContract,
          functionName: "getCampaign",
          args: [Number(id)],
        });

        let userPurchase = 0n;
        let claimable = 0n;

        if (address) {
          try {
            userPurchase = await publicClient.readContract({
              ...idoContract,
              functionName: "userPurchases",
              args: [Number(id), address],
            });

            claimable = await publicClient.readContract({
              ...idoContract,
              functionName: "getClaimableAmount",
              args: [Number(id), address],
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        setCampaign({
          id: Number(id),
          projectToken: campaignData[0],
          tokenName: campaignData[1],
          tokenSymbol: campaignData[2],
          tokenImage: campaignData[3],
          creator: campaignData[4],
          saleStartTime: Number(campaignData[5]),
          saleEndTime: Number(campaignData[6]),
          liquidityAdded: campaignData[7],
          liquidityPair: campaignData[8],
          ethCollected: campaignData[9],
          userPurchase,
          claimable,
        });
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, address, publicClient, idoContract, refreshTrigger]);

  // Calculate time remaining
  const getTimeStatus = (startTime, endTime, liquidityAdded) => {
    // Get current time in seconds since epoch to match contract timestamps
    const now = Math.floor(Date.now() / 1000);

    // If liquidity is added, the sale is considered ended regardless of time
    if (liquidityAdded) {
      return { status: "ended", timeRemaining: "0" };
    }

    if (now < startTime) {
      return {
        status: "upcoming",
        timeRemaining: formatTimeRemaining((startTime - now) * 1000),
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        status: "live",
        timeRemaining: formatTimeRemaining((endTime - now) * 1000),
      };
    } else {
      return { status: "ended", timeRemaining: "0" };
    }
  };

  const formatTimeRemaining = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes % 60}m ${seconds % 60}s`;
    }
  };

  // Format dates
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get IDO additional info from the idos configuration in the main file
  const getIdoInfo = (idNumber) => {
    return (
      idos[idNumber] || { description: "", website: "", image: "/logo.png" }
    );
  };

  // Handle token purchase
  const handleBuy = () => {
    if (!purchaseInput) return;

    // Direct XDC amount
    const value = parseEther(purchaseInput);

    return {
      ...idoContract,
      functionName: "buyTokens",
      args: [Number(id)],
      value: value,
    };
  };

  // Handle token claiming
  const handleClaim = () => {
    return {
      ...idoContract,
      functionName: "claimTokens",
      args: [Number(id)],
    };
  };

  // Handle finalize sale - only creator can finalize
  const handleFinalizeSale = () => {
    return {
      ...idoContract,
      functionName: "finalizeSale",
      args: [Number(id)],
    };
  };

  const handleSuccess = () => {
    setPurchaseInput("");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-3xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">
            The IDO campaign you&apos;re looking for does not exist.
          </p>
          <Link href="/ido" className="btn btn-primary">
            Back to All Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const timeStatus = getTimeStatus(
    campaign.saleStartTime,
    campaign.saleEndTime,
    campaign.liquidityAdded
  );

  // Use tokenImage from contract, fallback to config or default
  const campaignImage = campaign.tokenImage || idos?.[campaign.id]?.image || "/logo.png";
  
  // Check if current user is the creator
  const isCreator = address && address.toLowerCase() === campaign.creator.toLowerCase();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-6">
        <Link
          href="/ido"
          className="inline-flex items-center text-green-600 hover:text-green-700"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to All Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Token Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="w-full aspect-square bg-gradient-to-r from-green-100 to-emerald-100 relative overflow-hidden">
              <Image
                src={campaignImage}
                alt={campaign.tokenName}
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png";
                }}
              />
            </div>

            <div className="p-6 border-t border-gray-100">
              <h1 className="text-3xl font-bold mb-2">{campaign.tokenName}</h1>
              <div className="flex items-center mb-4">
                <span className="mr-3 text-lg text-gray-500">
                  {campaign.tokenSymbol}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    timeStatus.status === "live"
                      ? "bg-green-100 text-green-800"
                      : timeStatus.status === "upcoming"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      timeStatus.status === "live"
                        ? "bg-green-500 animate-pulse"
                        : timeStatus.status === "upcoming"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></span>
                  <span className="capitalize">{timeStatus.status}</span>
                </span>
              </div>

              {/* Creator Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Created by</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">
                    {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                  </p>
                  {isCreator && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      You
                    </span>
                  )}
                </div>
                <a
                  href={`https://xdcscan.com/address/${campaign.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  View on XDCScan
                </a>
              </div>



              <div className="space-y-4">


                {timeStatus.status === "live" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
                    <p className="font-medium text-green-600">
                      {timeStatus.timeRemaining}
                    </p>
                  </div>
                )}

                {timeStatus.status === "upcoming" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Starts In</p>
                    <p className="font-medium text-yellow-600">
                      {timeStatus.timeRemaining}
                    </p>
                  </div>
                )}



                {campaign.liquidityAdded && campaign.liquidityPair && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Liquidity Pair</p>
                    <p className="font-medium break-all">
                      <a
                        href={`https://xdcscan.com/address/${campaign.liquidityPair}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        {campaign.liquidityPair.slice(0, 10)}...{campaign.liquidityPair.slice(-8)}
                      </a>
                    </p>
                  </div>
                )}

                {campaign.projectToken && campaign.projectToken !== "0x0000000000000000000000000000000000000000" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Token Contract</p>
                    <p className="font-medium break-all">
                      <a
                        href={`https://xdcscan.com/address/${campaign.projectToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        {campaign.projectToken.slice(0, 10)}...{campaign.projectToken.slice(-8)}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sale Info and Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Campaign Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Campaign Status</p>
                  <p className="text-xl font-bold capitalize">
                    {timeStatus.status}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">XDC Raised</p>
                  <p className="text-xl font-bold">
                    {formatEther(campaign.ethCollected)} XDC
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Start Time</p>
                  <p className="text-lg font-bold">
                    {formatDate(campaign.saleStartTime)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">End Time</p>
                  <p className="text-lg font-bold">
                    {formatDate(campaign.saleEndTime)}
                  </p>
                </div>
              </div>

              {/* Creator Actions */}
              {isCreator && timeStatus.status === "ended" && !campaign.liquidityAdded && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold mb-2 text-blue-800">Creator Actions</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Your IDO campaign has ended. You can now finalize the sale to add liquidity and allow token claiming.
                  </p>
                  <div className="bg-white border border-blue-300 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Fund Distribution:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 2% will go to the platform</li>
                      <li>• 8% will go to the IDO creator</li>
                      <li>• 90% will be sent to XSwap to create LP tokens and lock them in the IDO contract</li>
                    </ul>
                  </div>
                  <WriteButton
                    data={handleFinalizeSale()}
                    buttonName="Finalize Sale & Add Liquidity"
                    className="btn btn-success"
                    callback={handleSuccess}
                  />
                </div>
              )}

              {campaign.liquidityAdded && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold mb-2 text-green-800">✅ Sale Finalized</h3>
                  <p className="text-sm text-green-700">
                    This IDO has been successfully finalized. Liquidity has been added and tokens are available for claiming.
                  </p>
                  {campaign.liquidityPair && (
                    <div className="mt-3">
                      <Link
                        href={`https://app.xspswap.finance/#/swap?outputCurrency=${campaign.projectToken}&inputCurrency=XDC`}
                        className="btn btn-sm btn-outline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Trade on DEX
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Participation */}
          {isConnected && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Your Participation</h2>

                {campaign.userPurchase > 0n ? (
                  <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-700">Your contribution:</p>
                      <p className="font-medium text-right">
                        {(Number(campaign.userPurchase) / 1e24).toLocaleString('en-US', { maximumFractionDigits: 6 })} XDC
                      </p>
                    </div>

                    {campaign.claimable > 0n ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-700">Claimable tokens:</p>
                          <p className="font-medium text-right">
                            {Number(formatEther(campaign.claimable)).toLocaleString('en-US', { maximumFractionDigits: 6 })} {campaign.tokenSymbol}
                          </p>
                        </div>
                        {campaign.liquidityAdded && (
                          <WriteButton
                            data={handleClaim()}
                            buttonName="Claim Tokens"
                            className="btn btn-success w-full"
                            callback={handleSuccess}
                          />
                        )}
                        {!campaign.liquidityAdded && (
                          <p className="text-center text-sm text-gray-600">
                            Tokens will be claimable once the creator finalizes the sale.
                          </p>
                        )}
                      </div>
                    ) : campaign.liquidityAdded ? (
                      <div>
                        <p className="text-center text-green-700 mb-4">
                          ✅ Tokens have been claimed successfully!
                        </p>
                        <Link
                          href={`https://app.xspswap.finance/#/swap?outputCurrency=${campaign.projectToken}&inputCurrency=XDC`}
                          className="btn btn-success w-full"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Trade Your Tokens
                        </Link>
                      </div>
                    ) : (
                      <p className="text-center text-gray-600">
                        Tokens will be claimable once the sale is finalized.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6">
                    You have not participated in this IDO yet.
                  </p>
                )}

                {timeStatus.status === "live" && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XDC Amount
                      </label>
                      <input
                        type="number"
                        value={purchaseInput}
                        onChange={(e) => setPurchaseInput(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter XDC amount"
                        step="0.01"
                        min="0"
                      />

                      {purchaseInput && (
                        <div className="text-sm mt-2 text-gray-600">
                          <p>
                            Contributing {purchaseInput} XDC to this IDO
                          </p>
                        </div>
                      )}
                    </div>

                    <WriteButton
                      data={handleBuy()}
                      buttonName="Contribute to IDO"
                      className="btn btn-success w-full py-3 text-lg"
                      disabled={
                        !purchaseInput || parseFloat(purchaseInput) <= 0
                      }
                      callback={handleSuccess}
                    />
                  </div>
                )}

                {timeStatus.status === "upcoming" && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">
                    <p className="text-yellow-700">
                      This sale hasn&apos;t started yet. Come back on{" "}
                      {formatDate(campaign.saleStartTime)}.
                    </p>
                  </div>
                )}

                {timeStatus.status === "ended" && !campaign.userPurchase && !campaign.liquidityAdded && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-700">
                      This sale has ended and is awaiting finalization by the creator.
                    </p>
                  </div>
                )}

                {timeStatus.status === "ended" && !campaign.userPurchase && campaign.liquidityAdded && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-700">
                      This sale has ended. You did not participate in this IDO.
                    </p>
                    <Link
                      href={`https://app.xspswap.finance/#/swap?outputCurrency=${campaign.projectToken}&inputCurrency=XDC`}
                      className="btn btn-outline mt-3"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Trade on DEX
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6 text-center max-w-lg mx-auto">
                Connect your wallet to participate in this IDO campaign,
                purchase tokens, and track your investments.
              </p>
              <button
                className="btn btn-success px-8"
                onClick={() => {
                  document
                    .querySelector('header button[aria-label="Log in"]')
                    ?.click();
                }}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdoDetail;
