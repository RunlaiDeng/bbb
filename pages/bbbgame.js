import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { contracts } from "../config";
import { formatEther } from "viem";
import Image from "next/image";
import { useRouter } from "next/router";
import usePrivyLogin from "../components/Hook/usePrivyLogin";

export default function BBBGame() {
  const { address, isConnected } = useAccount();
  const [userInfo, setUserInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isFighting, setIsFighting] = useState(false);
  const { writeContract } = useWriteContract();
  const router = useRouter();
  const privyLogin = usePrivyLogin();

  // Get user info from contract
  const { data: userInfoData, refetch: refetchUserInfo } = useReadContract({
    address: contracts[50]?.bbbgame?.address,
    abi: contracts[50]?.bbbgame?.abi,
    functionName: "getUserInfo",
    args: [address],
    enabled: !!address,
  });

  // Get user BBBubu NFT balance
  const { data: bbbubuBalance } = useReadContract({
    address: contracts[50]?.bbbubu?.address,
    abi: contracts[50]?.bbbubu?.abi,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  });

  // Get base mining rate from BBBGame contract
  const { data: baseMiningRateData } = useReadContract({
    address: contracts[50]?.bbbgame?.address,
    abi: contracts[50]?.bbbgame?.abi,
    functionName: "baseMiningRate",
    enabled: true,
  });

  // Update user info and fighting state
  useEffect(() => {
    if (userInfoData) {
      const [currentPoints, lastClickBlock, remainingBlocks] = userInfoData;
      setUserInfo({
        points: currentPoints,
        lastClickBlock: lastClickBlock,
        remainingBlocks: remainingBlocks,
      });

      const remaining = Number(remainingBlocks);
      setIsFighting(remaining > 0);
      setCountdown(remaining * 2); // remaining blocks * 2 seconds
    }
  }, [userInfoData]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsFighting(false);
            refetchUserInfo(); // Refresh user info when countdown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown, refetchUserInfo]);

  // Start mining function or handle login
  const handleStartMining = async () => {
    // If not connected, trigger Privy login
    if (!isConnected) {
      try {
        await privyLogin();
        return;
      } catch (error) {
        console.error("Login failed:", error);
        return;
      }
    }

    // If fighting, do nothing
    if (isFighting) return;

    // Check if user has BBBubu NFTs
    if (getBbbubuCount() === 0) {
      alert("You need at least 1 BBBubu NFT to start fighting! Please purchase BBBubu NFTs first.");
      return;
    }

    try {
      await writeContract({
        address: contracts[50]?.bbbgame?.address,
        abi: contracts[50]?.bbbgame?.abi,
        functionName: "startMining",
      });

      // Refresh data after transaction
      setTimeout(() => {
        refetchUserInfo();
      }, 2000);
    } catch (error) {
      console.error("Error starting mining:", error);
    }
  };

  // Format points display
  const formatPoints = (points) => {
    if (!points) return "0";
    return Number(formatEther(points)).toFixed(4);
  };

  // Format countdown display
  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = "";
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}m `;
    }
    result += `${remainingSeconds}s`;

    return result;
  };

  // Get BBBubu count
  const getBbbubuCount = () => {
    if (!bbbubuBalance) return 0;
    return Number(bbbubuBalance);
  };

  // Get base mining rate
  const getBaseMiningRate = () => {
    if (!baseMiningRateData) return 0;
    return Number(formatEther(baseMiningRateData));
  };

  // Calculate current mining rate (base rate * bbbubu count)
  const getCurrentMiningRate = () => {
    const bbbubuCount = getBbbubuCount();
    const baseRate = getBaseMiningRate();
    return baseRate * bbbubuCount;
  };

  // Handle buy BBBubu navigation
  const handleBuyBBBubu = () => {
    router.push("/bbbubu");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Section - Points Only */}
        <div className="text-center mb-10">
          {/* Points Display */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              {userInfo ? formatPoints(userInfo.points) : "0"}
            </h1>
            <Image
              src="/logosm.png"
              alt="BBB"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
        </div>

        {/* Game Arena */}
        <div className="bg-green-50 rounded-3xl p-8 mb-8 min-h-[450px] relative overflow-hidden">

          {/* Fighting Animation */}
          <div className="relative z-10 flex items-center justify-center h-full min-h-[350px]">
            {isFighting ? (
              <div className="text-center space-y-6">
                <div className="relative flex justify-center">
                  {/* Fighting Video with enhanced styling */}
                  <div className="relative p-4 bg-white rounded-2xl">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-80 h-60 object-cover rounded-xl mx-auto block"
                    >
                      <source src="/fighting.mp4" type="video/mp4" />
                      {/* Fallback for browsers that don't support video */}
                      <div className="text-8xl animate-bounce mb-4">🐰</div>
                    </video>
                  </div>
                </div>

                <div className="bg-green-100 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-700 mb-2">
                    ⚔️ Battle in Progress
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    Your brave rabbit is fighting monsters...
                  </p>
                  
                  {/* BBBubu Stats - Also show during fighting */}
                  {isConnected && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* BBBubu Count with Buy Button */}
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">BBBubu NFTs</p>
                        <div className="text-lg font-bold text-green-600 mb-2">
                          🐰 {getBbbubuCount()}
                        </div>
                        <button
                          onClick={handleBuyBBBubu}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 transition-all duration-300"
                        >
                          🐰 Buy
                        </button>
                      </div>
                      
                      {/* Mining Rate */}
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">Mining Rate</p>
                        <div className="text-lg font-bold text-green-700">
                          ⚡ {getCurrentMiningRate().toFixed(4)}/block
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Fight Button - Also show during fighting */}
                  <button
                    onClick={handleStartMining}
                    disabled={isFighting || (isConnected && getBbbubuCount() === 0)}
                    className={`w-full px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isFighting
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : !isConnected
                        ? "bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105"
                        : isConnected && getBbbubuCount() === 0
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white transform hover:scale-105"
                    }`}
                  >
                    {!isConnected
                      ? "🔗 Connect Wallet"
                      : isFighting
                      ? `⚔️ Fighting (${formatCountdown(countdown)})`
                      : getBbbubuCount() === 0
                      ? "❌ Need BBBubu NFT to Fight"
                      : `⚔️ Start Fight ${getBbbubuCount()}X`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="relative flex justify-center">
                  {/* Video Playing - Ready State */}
                  <div className="relative p-4 bg-white rounded-2xl">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-80 h-60 object-cover rounded-xl mx-auto block"
                    >
                      <source src="/fighting.mp4" type="video/mp4" />
                      {/* Fallback for browsers that don't support video */}
                      <div className="text-8xl animate-bounce mb-4">🐰</div>
                    </video>
                  </div>
                </div>
                
                <div className="bg-green-100 rounded-xl p-6">
                  <p className="text-2xl font-bold text-green-700 mb-3">
                    🛡️ Ready for Battle!
                  </p>
                  <p className="text-lg text-gray-600 mb-4">
                    Your rabbit is prepared and waiting for your command
                  </p>
                  
                  {/* BBBubu Stats - Moved here */}
                  {isConnected && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* BBBubu Count with Buy Button */}
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">BBBubu NFTs</p>
                        <div className="text-lg font-bold text-green-600 mb-2">
                          🐰 {getBbbubuCount()}
                        </div>
                        <button
                          onClick={handleBuyBBBubu}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 transition-all duration-300"
                        >
                          🐰 Buy
                        </button>
                      </div>
                      
                      {/* Mining Rate */}
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">Mining Rate</p>
                        <div className="text-lg font-bold text-green-700">
                          ⚡ {getCurrentMiningRate().toFixed(4)}/block
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-lg text-green-600 font-semibold mb-4">
                    ⚔️ Click &quot;Start Fight&quot; to begin your adventure!
                  </p>
                  
                  {/* Start Fight Button - Moved here */}
                  <button
                    onClick={handleStartMining}
                    disabled={isFighting || (isConnected && getBbbubuCount() === 0)}
                    className={`w-full px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isFighting
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : !isConnected
                        ? "bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105"
                        : isConnected && getBbbubuCount() === 0
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white transform hover:scale-105"
                    }`}
                  >
                    {!isConnected
                      ? "🔗 Connect Wallet"
                      : isFighting
                      ? `⚔️ Fighting (${formatCountdown(countdown)})`
                      : getBbbubuCount() === 0
                      ? "❌ Need BBBubu NFT to Fight"
                      : `⚔️ Start Fight ${getBbbubuCount()}X`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="bg-green-50 rounded-2xl p-6">


          {/* Enhanced Status Messages */}
          <div className="space-y-4">
            {/* Connection Status */}
            {!isConnected && (
              <div className="bg-green-100 rounded-xl p-4 text-center">
                <p className="text-lg text-green-700 font-medium">
                  🔗 Connect your wallet to start your adventure!
                </p>
              </div>
            )}

            {/* Fighting Status */}
            {isFighting && (
              <div className="bg-green-100 rounded-xl p-4 text-center">
                <p className="text-lg text-green-700 font-medium">
                  ⏰ Battle in progress... Your rabbit is earning points automatically!
                </p>
              </div>
            )}
            
            {/* Game Tips */}
            {isConnected && (
              <div className="bg-white rounded-xl p-4">
                <div className="text-center mb-3">
                  <p className="text-lg font-semibold text-green-700 mb-2">
                    💡 Pro Gaming Tips
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600">🐰</span>
                      <span className="font-medium text-gray-700">BBBubu Power</span>
                    </div>
                    <p className="text-gray-600">Each NFT multiplies your mining rate!</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600">⚡</span>
                      <span className="font-medium text-gray-700">Auto Mining</span>
                    </div>
                    <p className="text-gray-600">Earn points automatically while fighting!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
