import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useChainId,
  usePublicClient,
} from "wagmi";
import { formatEther, parseEther, parseUnits } from "viem";
import WriteButton from "../components/WriteButton";
import { useRouter } from "next/router";
import IDOABI from "../abi/IDOABI.json";
import Link from "next/link";
import Image from "next/image";
import { contracts, idos } from "@/config";

const Ido = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [purchaseInputs, setPurchaseInputs] = useState({});
  const [purchaseInTokens, setPurchaseInTokens] = useState({});
  const [campaignCount, setCampaignCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const idoContract = contracts?.[chainId]?.idoContract;

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    tokenName: "",
    tokenSymbol: "",
    tokenPrice: "",
    totalSupply: "",
    ethToRaise: "",
    startTime: "",
    endTime: "",
  });

  // Get public client for direct contract calls
  const publicClient = usePublicClient();

  // Balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Read campaign count and check if user is owner
  const { data: contractData } = useReadContracts({
    contracts: [
      {
        ...idoContract,
        functionName: "getCampaignCount",
      },
      {
        ...idoContract,
        functionName: "owner",
      },
    ],
    query: {
      enabled: Boolean(idoContract && isConnected),
      refetchInterval: 10000,
    },
  });

  const [platformStats, setPlatformStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0n,
    averageRoi: 0,
  });

  useEffect(() => {
    if (contractData && contractData[0]?.result !== undefined) {
      setCampaignCount(Number(contractData[0].result));
    }

    if (contractData && contractData[1]?.result && address) {
      setIsOwner(
        contractData[1].result.toLowerCase() === address.toLowerCase()
      );
    }
  }, [contractData, address]);

  // Load campaigns when count changes
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!campaignCount || !idoContract || !publicClient) return;

      setLoading(true);

      try {
        const campaignIds = Array.from({ length: campaignCount }, (_, i) => i);

        const campaignResults = await Promise.all(
          campaignIds.map(async (id) => {
            const campaign = await publicClient.readContract({
              ...idoContract,
              functionName: "getCampaign",
              args: [id],
            });

            let userPurchase = 0n;
            let claimable = 0n;

            if (address) {
              try {
                userPurchase = await publicClient.readContract({
                  ...idoContract,
                  functionName: "userPurchases",
                  args: [id, address],
                });

                claimable = await publicClient.readContract({
                  ...idoContract,
                  functionName: "getClaimableAmount",
                  args: [id, address],
                });
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
            }

            return {
              id,
              projectToken: campaign[0],
              tokenName: campaign[1],
              tokenSymbol: campaign[2],
              tokenPrice: campaign[3],
              totalTokensForSale: campaign[4],
              totalTokensSold: campaign[5],
              saleStartTime: Number(campaign[6]),
              saleEndTime: Number(campaign[7]),
              isActive: campaign[8],
              liquidityAdded: campaign[9],
              liquidityPair: campaign[10],
              ethCollected: campaign[11],
              userPurchase,
              claimable,
              progress:
                campaign[4] > 0n
                  ? Number((campaign[5] * 10000n) / campaign[4]) / 100
                  : 0,
            };
          })
        );

        setCampaigns(campaignResults);

        // Initialize purchase type for each campaign as token input
        const initialPurchaseTypes = {};
        campaignResults.forEach((campaign) => {
          initialPurchaseTypes[campaign.id] = true; // Default to token input
        });

        // Only set if not already set
        setPurchaseInTokens((prev) => {
          const newValues = { ...prev };
          campaignResults.forEach((campaign) => {
            if (newValues[campaign.id] === undefined) {
              newValues[campaign.id] = true;
            }
          });
          return newValues;
        });
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [campaignCount, address, refreshTrigger, publicClient]);

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

  // Handle input change for a specific campaign
  const handlePurchaseInputChange = (campaignId, value) => {
    setPurchaseInputs((prev) => ({
      ...prev,
      [campaignId]: value,
    }));
  };

  // Toggle between token and XDC input for a specific campaign
  const togglePurchaseType = (campaignId) => {
    setPurchaseInTokens((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  // Handle token purchase - only using XDC units now
  const handleBuy = (campaignId) => {
    const purchaseAmount = purchaseInputs[campaignId] || "";
    if (!purchaseAmount) return;

    // Direct XDC amount
    const value = parseEther(purchaseAmount);

    return {
      ...idoContract,
      functionName: "buyTokens",
      args: [campaignId],
      value: value,
    };
  };

  // Handle token claiming
  const handleClaim = (campaignId) => {
    return {
      ...idoContract,
      functionName: "claimTokens",
      args: [campaignId],
    };
  };

  // Calculate minimum supply based on XDC raise and token price
  const calculateMinSupply = () => {
    if (!newCampaign.ethToRaise || !newCampaign.tokenPrice) return 0;
    const minSupply = (Number(newCampaign.ethToRaise) / Number(newCampaign.tokenPrice)) * 1.5;
    return minSupply;
  };

  // Handle new campaign form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign((prev) => ({ ...prev, [name]: value }));
  };

  // Create new campaign
  const handleCreateCampaign = () => {
    // Convert ISO date strings to Unix timestamps (seconds)
    const startTimestamp = Math.floor(
      new Date(newCampaign.startTime).getTime() / 1000
    );
    const endTimestamp = Math.floor(
      new Date(newCampaign.endTime).getTime() / 1000
    );

    return {
      ...idoContract,
      functionName: "createCampaign",
      args: [
        newCampaign.tokenName,
        newCampaign.tokenSymbol,
        parseEther(newCampaign.tokenPrice),
        parseEther(newCampaign.totalSupply),
        parseEther(newCampaign.ethToRaise),
        startTimestamp,
        endTimestamp,
      ],
    };
  };

  // Update campaign status
  const handleUpdateStatus = (campaignId, isActive) => {
    return {
      ...idoContract,
      functionName: "updateCampaignStatus",
      args: [campaignId, isActive],
    };
  };

  // Finalize sale (add liquidity)
  const handleFinalizeSale = (campaignId) => {
    return {
      ...idoContract,
      functionName: "finalizeSale",
      args: [campaignId],
    };
  };

  const handleSuccess = () => {
    setPurchaseInputs({});
    setNewCampaign({
      tokenName: "",
      tokenSymbol: "",
      tokenPrice: "",
      totalSupply: "",
      ethToRaise: "",
      startTime: "",
      endTime: "",
    });
    setRefreshTrigger((prev) => prev + 1);
  };

  // Calculate platform statistics
  useEffect(() => {
    if (campaigns.length > 0) {
      const activeCampaigns = campaigns.filter((c) => {
        const timeStatus = getTimeStatus(
          c.saleStartTime,
          c.saleEndTime,
          c.isActive,
          c.liquidityAdded
        );
        return timeStatus.status === "live" && c.isActive;
      }).length;

      console.log(
        "Campaign ethCollected values:",
        campaigns.map((c) => ({
          id: c.id,
          ethCollected: c.ethCollected,
          formatted: formatEther(c.ethCollected),
        }))
      );
      const totalRaised = campaigns.reduce(
        (acc, c) => acc + c.ethCollected,
        0n
      );
      console.log("Total raised:", formatEther(totalRaised));

      // This is just an example - you might want to calculate ROI differently
      const averageRoi = 200; // Sample value - 200%

      setPlatformStats({
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalRaised,
        averageRoi,
      });
    }
  }, [campaigns]);

  // Navigate to the campaign detail page
  const navigateToCampaignDetail = (campaignId) => {
    router.push(`/ido/${campaignId}`);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">
          Initial DEX Offering
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto my-4"></div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Participate in carefully vetted token launches and get early access to
          promising projects.
        </p>
      </div>

      {/* Platform Statistics */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-24 flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-800">
              {platformStats.totalCampaigns}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-24 flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Active Campaigns</p>
            <p className="text-3xl font-bold text-gray-800">
              {platformStats.activeCampaigns}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-24 flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Total Raised</p>
            <p
              className="text-3xl font-bold text-gray-800 truncate"
              title={`${formatEther(platformStats.totalRaised)} XDC`}
            >
              {parseFloat(formatEther(platformStats.totalRaised)).toFixed(2)}{" "}
              XDC
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 h-24 flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Average ROI</p>
            <p className="text-3xl font-bold text-green-600">
              {platformStats.averageRoi}%
            </p>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="mb-12">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="btn btn-outline mb-4"
          >
            {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
          </button>

          {showAdminPanel && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Create New IDO Campaign
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Name
                  </label>
                  <input
                    type="text"
                    name="tokenName"
                    value={newCampaign.tokenName}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. My Token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    name="tokenSymbol"
                    value={newCampaign.tokenSymbol}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. MTK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Price (XDC)
                  </label>
                  <input
                    type="number"
                    name="tokenPrice"
                    value={newCampaign.tokenPrice}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 0.0001"
                    step="0.0000001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Supply
                  </label>
                  <input
                    type="number"
                    name="totalSupply"
                    value={newCampaign.totalSupply}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 1000000"
                    min={calculateMinSupply()}
                  />
                  {newCampaign.ethToRaise && newCampaign.tokenPrice && (
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum supply: {calculateMinSupply().toFixed(2)} tokens
                      (based on {newCampaign.ethToRaise} XDC raise and {newCampaign.tokenPrice} XDC price)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XDC to Raise
                  </label>
                  <input
                    type="number"
                    name="ethToRaise"
                    value={newCampaign.ethToRaise}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 10"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={newCampaign.startTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={newCampaign.endTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <WriteButton
                data={handleCreateCampaign()}
                buttonName="Create Campaign"
                className="btn btn-success"
                disabled={
                  !newCampaign.tokenName ||
                  !newCampaign.tokenSymbol ||
                  !newCampaign.tokenPrice ||
                  !newCampaign.totalSupply ||
                  !newCampaign.ethToRaise ||
                  !newCampaign.startTime ||
                  !newCampaign.endTime
                }
                callback={handleSuccess}
              />
            </div>
          )}

          {showAdminPanel && campaigns.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Manage Campaigns
              </h2>

              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Token</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Progress</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const timeStatus = getTimeStatus(
                        campaign.saleStartTime,
                        campaign.saleEndTime,
                        campaign.isActive,
                        campaign.liquidityAdded
                      );

                      return (
                        <tr
                          key={campaign.id}
                          className="border-b border-gray-100"
                        >
                          <td className="px-4 py-3">{campaign.id}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">
                                {campaign.tokenName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {campaign.tokenSymbol}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  timeStatus.status === "live"
                                    ? "bg-green-500"
                                    : timeStatus.status === "upcoming"
                                    ? "bg-yellow-500"
                                    : timeStatus.status === "inactive"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span className="capitalize">
                                {timeStatus.status}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {campaign.isActive ? "(Active)" : "(Inactive)"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {campaign.progress.toFixed(2)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(campaign.progress, 100)}%`,
                                }}
                                title={`${formatEther(
                                  campaign.totalTokensSold
                                )} / ${formatEther(
                                  campaign.totalTokensForSale
                                )} ${campaign.tokenSymbol}`}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {formatEther(campaign.totalTokensSold)} /{" "}
                              {formatEther(campaign.totalTokensForSale)}{" "}
                              {campaign.tokenSymbol}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <WriteButton
                                data={handleUpdateStatus(
                                  campaign.id,
                                  !campaign.isActive
                                )}
                                buttonName={
                                  campaign.isActive ? "Deactivate" : "Activate"
                                }
                                className="btn btn-xs btn-outline"
                                callback={handleSuccess}
                              />

                              {timeStatus.status === "ended" &&
                                !campaign.liquidityAdded && (
                                  <WriteButton
                                    data={handleFinalizeSale(campaign.id)}
                                    buttonName="Finalize"
                                    className="btn btn-xs btn-success"
                                    callback={handleSuccess}
                                  />
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connect Wallet Prompt */}
      {!isConnected && !loading && (
        <div className="flex flex-col items-center justify-center py-16 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <svg
            className="w-16 h-16 mb-4 text-green-500"
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
          <p className="text-gray-600 mb-6 text-center max-w-lg">
            Connect your wallet to view available IDO campaigns, purchase
            tokens, and track your investments.
          </p>
          <button
            className="btn btn-success px-8"
            onClick={() => {
              // This will trigger the wallet modal to open through your UI's existing wallet connection flow
              document
                .querySelector('header button[aria-label="Log in"]')
                ?.click();
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5273"
              width="100%"
              height="100%"
            >
              <path
                d="M864 96H160c-52.8 0-96 43.2-96 96v640c0 52.8 43.2 96 96 96h704c52.8 0 96-43.2 96-96V192c0-52.8-43.2-96-96-96z m-416 64h128v64H448v-64z m-192 0h128v64H256v-64z m640 672c0 17.6-14.4 32-32 32H160c-17.6 0-32-14.4-32-32V384h768v448z m0-512H128v-32c0-17.6 14.4-32 32-32h32v64h64v-64h128v64h64v-64h128v64h64v-64h128v64h64v-64h32c17.6 0 32 14.4 32 32v32z"
                fill="#0e932e"
                p-id="5274"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">No Active Campaigns</h2>
          <p className="text-gray-600">
            There are currently no active IDO campaigns. Please check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const timeStatus = getTimeStatus(
              campaign.saleStartTime,
              campaign.saleEndTime,
              campaign.isActive,
              campaign.liquidityAdded
            );

            // Default image if no custom image is available
            const campaignImage = idos?.[campaign.id]?.image;

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-green-300 transition-all hover:shadow-xl cursor-pointer"
                onClick={() => navigateToCampaignDetail(campaign.id)}
              >
                <div className="relative">
                  <div className="w-full aspect-[3/2] bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                    <Image
                      src={campaignImage}
                      alt={campaign.tokenName}
                      height={200}
                      width={200}
                      className="h-3/4 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                      }}
                    />
                  </div>

                  <div className="absolute top-4 right-4">
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
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold mb-1">
                    {campaign.tokenName}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {campaign.tokenSymbol}
                    </span>
                    {timeStatus.status === "live" && (
                      <span className="text-sm text-green-600 font-medium">
                        {timeStatus.timeRemaining} left
                      </span>
                    )}
                    {timeStatus.status === "upcoming" && (
                      <span className="text-sm text-yellow-600 font-medium">
                        Starts in {timeStatus.timeRemaining}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How It Works Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-green-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
            <p className="text-gray-600">
              Connect your Ethereum wallet to browse available IDO campaigns and
              participate in token sales.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Purchase Tokens</h3>
            <p className="text-gray-600">
              Invest in promising projects by purchasing tokens during the IDO
              campaign with XDC.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Claim & Trade</h3>
            <p className="text-gray-600">
              After the IDO concludes, claim your tokens and trade them on
              decentralized exchanges.
            </p>
          </div>
        </div>
      </div>

      {/* How to Claim Tokens Section */}
      <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-center">
          How to Claim Your Tokens
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="font-bold text-green-600">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Wait for the IDO to End
                </h3>
                <p className="text-gray-600">
                  Tokens become claimable only after the IDO campaign has ended
                  and the project team has finalized the sale by adding
                  liquidity.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="font-bold text-green-600">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Return to the IDO Page
                </h3>
                <p className="text-gray-600">
                  Once the IDO is finalized, return to this page and find your
                  purchased tokens in the campaign card.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="font-bold text-green-600">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Click &quot;Claim Tokens&quot;
                </h3>
                <p className="text-gray-600">
                  In the campaign card where you purchased tokens, you&apos;ll
                  see a &quot;Claim Tokens&quot; button when your tokens are
                  ready to claim. Click this button and confirm the transaction
                  in your wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="font-bold text-green-600">4</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Add Token to Your Wallet
                </h3>
                <p className="text-gray-600">
                  After claiming, you may need to add the token to your wallet
                  to see your balance. You can do this by adding the token
                  contract address to your wallet&apos;s custom tokens.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex">
              <svg
                className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-700">
                <span className="font-bold">Note:</span> The claim button will
                only appear when tokens are ready to be claimed. If you
                don&apos;t see it, either the IDO hasn&apos;t ended yet, or the
                project team hasn&apos;t finalized the sale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ido;
