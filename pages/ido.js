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
import ImageUpload from "../components/ImageUpload";

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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const idoContract = contracts?.[chainId]?.idoContract;

  // New campaign form state - updated to match new ABI
  const [newCampaign, setNewCampaign] = useState({
    tokenName: "",
    tokenSymbol: "",
    tokenImage: "",
    startTime: "",
    endTime: "",
  });

  // Get public client for direct contract calls
  const publicClient = usePublicClient();

  // Balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Read campaign count - removed owner check since anyone can create
  const { data: contractData } = useReadContracts({
    contracts: [
      {
        ...idoContract,
        functionName: "getCampaignCount",
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
  }, [contractData, address]);

  // Load campaigns when count changes
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!campaignCount || !idoContract || !publicClient) return;

      setLoading(true);

      try {
        const campaignIds = Array.from({ length: campaignCount }, (_, i) => campaignCount - 1 - i);

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
              tokenImage: campaign[3],
              creator: campaign[4],
              saleStartTime: Number(campaign[5]),
              saleEndTime: Number(campaign[6]),
              liquidityAdded: campaign[7],
              liquidityPair: campaign[8],
              ethCollected: campaign[9],
              userPurchase,
              claimable,
              // Note: progress calculation might need to be updated based on new contract structure
              progress: 0, // Will need to calculate this based on available data
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

  // Handle new campaign form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload callback
  const handleImageUpload = (imageUrl) => {
    setNewCampaign((prev) => ({ ...prev, tokenImage: imageUrl }));
  };

  // Create new campaign - updated to match new ABI
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
        newCampaign.tokenImage,
        startTimestamp,
        endTimestamp,
      ],
    };
  };

  // Finalize sale (add liquidity) - only creator can finalize
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
      tokenImage: "",
      startTime: "",
      endTime: "",
    });
    setRefreshTrigger((prev) => prev + 1);
    setShowCreateForm(false);
  };

  // Calculate platform statistics
  useEffect(() => {
    if (campaigns.length > 0) {
      const activeCampaigns = campaigns.filter((c) => {
        const timeStatus = getTimeStatus(
          c.saleStartTime,
          c.saleEndTime,
          c.liquidityAdded
        );
        return timeStatus.status === "live";
      }).length;

      const totalRaised = campaigns.reduce(
        (acc, c) => acc + c.ethCollected,
        0n
      );

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
          IDO
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto my-4"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Everyone can create IDOs with fair token distribution and fully locked liquidity pools
        </p>
      </div>

      {/* Create Campaign Section - Available to all connected users */}
      {isConnected && (
        <div className="mb-12">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-success px-8 py-3 text-lg"
            >
              {showCreateForm ? "Cancel" : "Create Your IDO Campaign"}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-green-600 text-center">
                Launch Your Token
              </h2>

              <div className="space-y-6">
                {/* Token Image Upload */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Token Image
                  </label>
                  <ImageUpload
                    callback={handleImageUpload}
                    image={newCampaign.tokenImage}
                    clean={!newCampaign.tokenImage}
                  />
                  {!newCampaign.tokenImage && (
                    <p className="text-xs text-gray-500 mt-2">
                      Upload an image for your token (required)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Name *
                    </label>
                    <input
                      type="text"
                      name="tokenName"
                      value={newCampaign.tokenName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. My Amazing Token"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token Symbol *
                    </label>
                    <input
                      type="text"
                      name="tokenSymbol"
                      value={newCampaign.tokenSymbol}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. MAT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
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
                      End Time *
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

                <div className="text-center">
                  <WriteButton
                    data={handleCreateCampaign()}
                    buttonName="Create IDO Campaign"
                    className="btn btn-success px-8"
                    disabled={
                      !newCampaign.tokenName ||
                      !newCampaign.tokenSymbol ||
                      !newCampaign.tokenImage ||
                      !newCampaign.startTime ||
                      !newCampaign.endTime
                    }
                    callback={handleSuccess}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"
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
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>
                          Creating an IDO will deploy a new ERC20 token contract
                        </li>
                        <li>
                          You will be the creator and can finalize the sale
                          after it ends
                        </li>
                        <li>
                          Token pricing and supply will be determined during the
                          sale process
                        </li>
                        <li>
                          Make sure your start and end times are set correctly
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
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
            tokens, create your own IDO, and track your investments.
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
                d="M864 96H160c-52.8 0-96 43.2-96 96v640c0 52.8 43.2 96 96 96h704c52.8 0 96-43.2 96-96V192c0-52.8-43.2-96-96-96z m-416 64h128v64H448v-64z m-192 0h128v64H256v-64z m640 672c0 17.6-14.4 32-32 32H160c-17.6 0-32-14.4-32-32V384h768v448z m0-512H128v-32c0-17.6 14.4-32 32-32h32v64h64v-64h128v64h64v-64h128v64h64v-64h32c17.6 0 32 14.4 32 32v32z"
                fill="#0e932e"
                p-id="5274"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">No Campaigns Yet</h2>
          <p className="text-gray-600 mb-4">
            Be the first to create an IDO campaign on our platform!
          </p>
          {isConnected && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-success"
            >
              Create First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Start Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    End Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Raised
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const timeStatus = getTimeStatus(
                    campaign.saleStartTime,
                    campaign.saleEndTime,
                    campaign.liquidityAdded
                  );

                  // Use tokenImage from contract, fallback to config or default
                  const campaignImage =
                    campaign.tokenImage ||
                    idos?.[campaign.id]?.image ||
                    "/logo.png";

                  return (
                    <tr
                      key={campaign.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToCampaignDetail(campaign.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            <Image
                              src={campaignImage}
                              alt={campaign.tokenName}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/logo.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {campaign.tokenName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.tokenSymbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            timeStatus.status === "live"
                              ? "bg-green-100 text-green-800"
                              : timeStatus.status === "upcoming"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                              timeStatus.status === "live"
                                ? "bg-green-500 animate-pulse"
                                : timeStatus.status === "upcoming"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          <span className="capitalize">
                            {timeStatus.status}
                          </span>
                        </span>
                        {timeStatus.status === "live" && (
                          <div className="text-xs text-green-600 mt-1">
                            {timeStatus.timeRemaining} left
                          </div>
                        )}
                        {timeStatus.status === "upcoming" && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Starts in {timeStatus.timeRemaining}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {campaign.creator.slice(0, 6)}...
                        {campaign.creator.slice(-4)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          campaign.saleStartTime * 1000
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          campaign.saleEndTime * 1000
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {parseFloat(formatEther(campaign.ethCollected)).toFixed(
                          4
                        )}{" "}
                        XDC
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {address &&
                          address.toLowerCase() ===
                            campaign.creator.toLowerCase() &&
                          timeStatus.status === "ended" &&
                          !campaign.liquidityAdded && (
                            <WriteButton
                              data={handleFinalizeSale(campaign.id)}
                              buttonName="Finalize"
                              className="btn btn-sm btn-success"
                              callback={handleSuccess}
                            />
                          )}
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
  );
};

export default Ido;
