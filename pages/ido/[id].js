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
import { idos } from "../ido";

const IdoDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseInput, setPurchaseInput] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Define your contract address - replace with actual deployed contract address
  const idoContractAddress = "0x1bFa56fb42F5C5291EEa7953938ac265c802a5Cb"; // Replace with your actual IDO contract address

  // Get public client for direct contract calls
  const publicClient = usePublicClient();

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id || !publicClient || !idoContractAddress) return;

      setLoading(true);

      try {
        const campaignData = await publicClient.readContract({
          address: idoContractAddress,
          abi: IDOABI,
          functionName: "getCampaign",
          args: [Number(id)],
        });

        let userPurchase = 0n;
        let claimable = 0n;

        if (address) {
          try {
            userPurchase = await publicClient.readContract({
              address: idoContractAddress,
              abi: IDOABI,
              functionName: "userPurchases",
              args: [Number(id), address],
            });

            claimable = await publicClient.readContract({
              address: idoContractAddress,
              abi: IDOABI,
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
          tokenPrice: campaignData[3],
          totalTokensForSale: campaignData[4],
          totalTokensSold: campaignData[5],
          saleStartTime: Number(campaignData[6]),
          saleEndTime: Number(campaignData[7]),
          isActive: campaignData[8],
          liquidityAdded: campaignData[9],
          liquidityPair: campaignData[10],
          ethCollected: campaignData[11],
          userPurchase,
          claimable,
          progress:
            campaignData[4] > 0n
              ? Number((campaignData[5] * 10000n) / campaignData[4]) / 100
              : 0,
        });
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, address, publicClient, idoContractAddress, refreshTrigger]);

  // Calculate time remaining
  const getTimeStatus = (startTime, endTime, isActive, liquidityAdded) => {
    // Get current time in seconds since epoch to match contract timestamps
    const now = Math.floor(Date.now() / 1000);

    // If liquidity is added, the sale is considered ended regardless of time
    if (liquidityAdded) {
      return { status: "ended", timeRemaining: "0" };
    }

    // If campaign is not active, it cannot be live
    if (!isActive) {
      return { status: "inactive", timeRemaining: "0" };
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
    return idos[idNumber] || { description: "", website: "", image: "/logo.png" };
  };

  // Handle token purchase
  const handleBuy = () => {
    if (!purchaseInput) return;

    // Direct XDC amount
    const value = parseEther(purchaseInput);

    return {
      address: idoContractAddress,
      abi: IDOABI,
      functionName: "buyTokens",
      args: [Number(id)],
      value: value,
    };
  };

  // Handle token claiming
  const handleClaim = () => {
    return {
      address: idoContractAddress,
      abi: IDOABI,
      functionName: "claimTokens",
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
    campaign.isActive,
    campaign.liquidityAdded
  );

  // Default image if no custom image is available
  const campaignImage =
    idos[campaign.id]?.image || 
    `/ido/${campaign.tokenSymbol?.toLowerCase()}.png` || 
    "/logo.png";

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
            <div className="w-full aspect-square bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center p-8">
              <Image
                src={campaignImage}
                alt={campaign.tokenName}
                height={200}
                width={200}
                className="max-w-full max-h-full object-contain"
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
                      : timeStatus.status === "ended"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      timeStatus.status === "live"
                        ? "bg-green-500 animate-pulse"
                        : timeStatus.status === "upcoming"
                        ? "bg-yellow-500"
                        : timeStatus.status === "ended"
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  <span className="capitalize">{timeStatus.status}</span>
                </span>
              </div>

              {getIdoInfo(campaign.id).description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">
                    {getIdoInfo(campaign.id).description}
                  </p>
                </div>
              )}

              {getIdoInfo(campaign.id).website && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <a
                    href={getIdoInfo(campaign.id).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    {getIdoInfo(campaign.id).website}
                  </a>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Token Price</p>
                  <p className="font-medium">
                    {formatEther(campaign.tokenPrice)} XDC
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Sale Period</p>
                  <p className="font-medium">
                    {formatDate(campaign.saleStartTime)} -{" "}
                    {formatDate(campaign.saleEndTime)}
                  </p>
                </div>

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
                        {campaign.liquidityPair}
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
              <h2 className="text-2xl font-bold mb-6">Sale Progress</h2>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {campaign.progress.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                    style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    title={`${formatEther(
                      campaign.totalTokensSold
                    )} / ${formatEther(campaign.totalTokensForSale)} ${
                      campaign.tokenSymbol
                    }`}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>
                    {formatEther(campaign.totalTokensSold)}{" "}
                    {campaign.tokenSymbol}
                  </span>
                  <span>
                    {formatEther(campaign.totalTokensForSale)}{" "}
                    {campaign.tokenSymbol}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Total Tokens for Sale
                  </p>
                  <p className="text-xl font-bold">
                    {formatEther(campaign.totalTokensForSale)}{" "}
                    {campaign.tokenSymbol}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Tokens Sold</p>
                  <p className="text-xl font-bold">
                    {formatEther(campaign.totalTokensSold)}{" "}
                    {campaign.tokenSymbol}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">XDC Raised</p>
                  <p className="text-xl font-bold">
                    {formatEther(campaign.ethCollected)} XDC
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Token Price</p>
                  <p className="text-xl font-bold">
                    {formatEther(campaign.tokenPrice)} XDC
                  </p>
                </div>
              </div>
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
                      <p className="text-sm text-gray-700">Your purchase:</p>
                      <p
                        className="font-medium text-right"
                        title={`${formatEther(
                          (campaign.userPurchase * campaign.tokenPrice) /
                            10n ** 18n
                        )} XDC`}
                      >
                        {parseFloat(
                          formatEther(
                            (campaign.userPurchase * campaign.tokenPrice) /
                              10n ** 18n
                          )
                        ).toFixed(4)}{" "}
                        XDC
                      </p>
                    </div>

                    {campaign.claimable > 0n ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-700">Claimable:</p>
                          <p
                            className="font-medium text-right"
                            title={`${formatEther(campaign.claimable)} ${
                              campaign.tokenSymbol
                            }`}
                          >
                            {formatEther(campaign.claimable)}{" "}
                            {campaign.tokenSymbol}
                          </p>
                        </div>
                        {timeStatus.status === "ended" && (
                          <WriteButton
                            data={handleClaim()}
                            buttonName="Claim Tokens"
                            className="btn btn-success w-full"
                            callback={handleSuccess}
                          />
                        )}
                      </div>
                    ) : campaign.liquidityAdded ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-700">Claimed:</p>
                          <p
                            className="font-medium text-right"
                            title={`${formatEther(campaign.userPurchase)} ${
                              campaign.tokenSymbol
                            }`}
                          >
                            {formatEther(campaign.userPurchase)}{" "}
                            {campaign.tokenSymbol}
                          </p>
                        </div>
                        <button
                          className="btn btn-success w-full"
                          onClick={() =>
                            (window.location.href = `/swap/${campaign.projectToken}`)
                          }
                        >
                          Go Swap
                        </button>
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
                      />

                      {purchaseInput && (
                        <div className="text-sm mt-2 text-gray-600">
                          <p>
                            ≈{" "}
                            {(
                              parseFloat(purchaseInput) /
                              parseFloat(formatEther(campaign.tokenPrice))
                            ).toFixed(6)}{" "}
                            {campaign.tokenSymbol}
                          </p>
                        </div>
                      )}
                    </div>

                    <WriteButton
                      data={handleBuy()}
                      buttonName="Buy Tokens"
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

                {timeStatus.status === "ended" && !campaign.userPurchase && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-700">
                      This sale has ended. You did not participate in this IDO.
                    </p>
                  </div>
                )}

                {timeStatus.status === "inactive" && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                    <p className="text-red-700">
                      This sale is currently inactive.
                    </p>
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
