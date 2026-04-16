import { useState, useEffect, useCallback } from "react";
import { formatEther, parseEther } from "viem";
import { contracts } from "@/config";
import { useChainId, useAccount, useBalance, useReadContracts } from "wagmi";
import WriteButton from "@/components/WriteButton";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";

const BBBubu = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();

  // Local state
  const [data, setData] = useState({
    quantity: 1,
    selectedTokenIds: [],
    selectedTransferTokenIds: [],
    transferAddress: "",
    imageLoading: true,
    farmImageLoading: {},
    bbbubuImageLoading: {},
    showSwapModal: false,
    showMintModal: false,
    showTransferModal: false,
    isLoading: false,
    mintProgress: 0,
    swapProgress: 0,
    approveProgress: 0,
    transferProgress: 0,
    longPressTimer: null,
    longPressInterval: null,
  });

  // Single image loading effect
  useEffect(() => {
    // Use a default image or specific image
    const staticImage = "/bbbubu.gif"; // You can change this to any specific image
    
    // Preload the static image
    const img = new window.Image();
    img.onload = () => {
      setData(prev => ({ ...prev, imageLoading: false }));
    };
    img.onerror = () => {
      setData(prev => ({ ...prev, imageLoading: false }));
    };
    img.src = staticImage;
  }, []);

  // Contract addresses
  const bbbubuAddress = contracts[chainId]?.bbbubu?.address;
  const carrotFarmerAddress = contracts[chainId]?.carrotFarmer?.address;
  const multiTransferAddress = contracts[chainId]?.multitransfer?.address;

  // XDC balance
  const { data: xdcBalance } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  // Read public contract data (doesn't require wallet connection)
  const { data: publicData, refetch: refetchPublicData } = useReadContracts({
    contracts: [
      {
        address: bbbubuAddress,
        abi: contracts[chainId]?.bbbubu?.abi || [],
        functionName: "totalSupply",
      },
      {
        address: bbbubuAddress,
        abi: contracts[chainId]?.bbbubu?.abi || [],
        functionName: "remainingSupply",
      },
    ],
    query: {
      enabled: !!chainId && !!bbbubuAddress,
    },
  });

  // Read user-specific contract data (requires wallet connection)
  const { data: userData, refetch: refetchUserData } = useReadContracts({
    contracts: [
      {
        address: bbbubuAddress,
        abi: contracts[chainId]?.bbbubu?.abi || [],
        functionName: "tokensOfOwner",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: carrotFarmerAddress,
        abi: contracts[chainId]?.carrotFarmer?.abi || [],
        functionName: "tokensOfOwner",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      {
        address: carrotFarmerAddress,
        abi: contracts[chainId]?.carrotFarmer?.abi || [],
        functionName: "isApprovedForAll",
        args: [
          address || "0x0000000000000000000000000000000000000000",
          bbbubuAddress || "0x0000000000000000000000000000000000000000",
        ],
      },
      {
        address: bbbubuAddress,
        abi: contracts[chainId]?.bbbubu?.abi || [],
        functionName: "isApprovedForAll",
        args: [
          address || "0x0000000000000000000000000000000000000000",
          multiTransferAddress || "0x0000000000000000000000000000000000000000",
        ],
      },
    ],
    query: {
      enabled:
        !!chainId && !!bbbubuAddress && !!carrotFarmerAddress && !!address,
    },
  });

  const totalSupply = publicData?.[0]?.result || 0n;
  const remainingSupply = publicData?.[1]?.result || 0n;
  const userBBBubuNFTs = userData?.[0]?.result || [];
  const userCarrotFarmerNFTs = userData?.[1]?.result || [];
  const isApprovedForAll = userData?.[2]?.result || false;
  const isApprovedForMultiTransfer = userData?.[3]?.result || false;

  const MINT_PRICE = parseEther("600");
  const totalCost = MINT_PRICE * BigInt(data.quantity);

  // WriteButton 配置对象
  const mint = {
    buttonName: data.isLoading
      ? "Minting..."
      : !xdcBalance || xdcBalance.value < totalCost
      ? "Insufficient Balance"
      : "Mint",
    data: {
      address: bbbubuAddress,
      abi: contracts[chainId]?.bbbubu?.abi || [],
      functionName: "mint",
      args: [data.quantity],
      value: totalCost,
    },
    before: () => {
      simulateProgress("mint");
    },
    callback: () => {
      refreshData();
    },
    onError: () => {
      setData((prev) => ({ ...prev, isLoading: false, mintProgress: 0 }));
    },
    disabled: !xdcBalance || xdcBalance.value < totalCost || data.isLoading,
  };

  const approve = {
    buttonName: data.isLoading ? "Approving..." : "Approve NFTs",
    data: {
      address: carrotFarmerAddress,
      abi: contracts[chainId]?.carrotFarmer?.abi || [],
      functionName: "setApprovalForAll",
      args: [bbbubuAddress, true],
    },
    before: () => {
      simulateProgress("approve");
    },
    callback: () => {
      refreshDataKeepModal();
    },
    onError: () => {
      setData((prev) => ({ ...prev, isLoading: false, approveProgress: 0 }));
    },
    disabled: data.isLoading,
  };

  const approveForTransfer = {
    buttonName: data.isLoading ? "Approving..." : "Approve for Transfer",
    data: {
      address: bbbubuAddress,
      abi: contracts[chainId]?.bbbubu?.abi || [],
      functionName: "setApprovalForAll",
      args: [multiTransferAddress, true],
    },
    before: () => {
      simulateProgress("approve");
    },
    callback: () => {
      // Ensure loading state is reset on success
      setData((prev) => ({
        ...prev,
        isLoading: false,
        approveProgress: 100,
      }));
      setTimeout(() => {
        setData((prev) => ({
          ...prev,
          approveProgress: 0,
          isLoading: false,
        }));
        refetchPublicData();
        refetchUserData();
      }, 1000);
    },
    onError: () => {
      // Ensure loading state is reset on error
      setData((prev) => ({
        ...prev,
        isLoading: false,
        approveProgress: 0,
      }));
    },
    disabled: data.isLoading,
  };

  const swap = {
    buttonName: data.isLoading
      ? "Swapping..."
      : data.selectedTokenIds.length === 0
      ? "Select NFTs to Swap"
      : `Swap ${data.selectedTokenIds.length} NFTs`,
    data: {
      address: bbbubuAddress,
      abi: contracts[chainId]?.bbbubu?.abi || [],
      functionName: "swapNFTs",
      args: [data.selectedTokenIds.map((id) => BigInt(id))],
    },
    before: () => {
      simulateProgress("swap");
    },
    callback: () => {
      refreshData();
    },
    onError: () => {
      setData((prev) => ({ ...prev, isLoading: false, swapProgress: 0 }));
    },
    disabled: data.selectedTokenIds.length === 0 || data.isLoading,
  };

  const transfer = {
    buttonName: data.isLoading
      ? "Transferring..."
      : data.selectedTransferTokenIds.length === 0
      ? "Select NFTs to Transfer"
      : `Transfer ${data.selectedTransferTokenIds.length} NFTs`,
    data: {
      address: multiTransferAddress,
      abi: contracts[chainId]?.multitransfer?.abi || [],
      functionName: "batchTransferNFT",
      args: [
        bbbubuAddress,
        Array(data.selectedTransferTokenIds.length).fill(data.transferAddress),
        data.selectedTransferTokenIds.map((id) => BigInt(id)),
      ],
    },
    before: () => {
      simulateProgress("transfer");
    },
    callback: () => {
      refreshDataForTransfer();
    },
    onError: () => {
      // Ensure loading state is reset on transfer error
      setData((prev) => ({
        ...prev,
        isLoading: false,
        transferProgress: 0,
        approveProgress: 0, // Also reset approve progress if any
      }));
    },
    disabled:
      data.selectedTransferTokenIds.length === 0 ||
      !data.transferAddress.trim() ||
      !data.transferAddress.match(/^0x[a-fA-F0-9]{40}$/) ||
      data.isLoading,
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const maxQuantity = Number(remainingSupply); // 直接使用剩余供应量作为最大值
    setData((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(maxQuantity, prev.quantity + delta)),
    }));
  };

  // 长按增加数量的处理函数
  const handleLongPress = (delta) => {
    const startLongPress = () => {
      // 清除之前的定时器
      if (data.longPressTimer) clearTimeout(data.longPressTimer);
      if (data.longPressInterval) clearInterval(data.longPressInterval);

      // 延迟500ms后开始快速重复
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          handleQuantityChange(delta);
        }, 100); // 每100ms增加一次
        
        setData(prev => ({ ...prev, longPressInterval: interval }));
      }, 500);
      
      setData(prev => ({ ...prev, longPressTimer: timer }));
    };

    const stopLongPress = () => {
      if (data.longPressTimer) {
        clearTimeout(data.longPressTimer);
        setData(prev => ({ ...prev, longPressTimer: null }));
      }
      if (data.longPressInterval) {
        clearInterval(data.longPressInterval);
        setData(prev => ({ ...prev, longPressInterval: null }));
      }
    };

    return { startLongPress, stopLongPress };
  };

  // 创建长按处理器
  const plusLongPress = handleLongPress(1);

  // 清理定时器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (data.longPressTimer) clearTimeout(data.longPressTimer);
      if (data.longPressInterval) clearInterval(data.longPressInterval);
    };
  }, [data.longPressTimer, data.longPressInterval]);

  // Toggle NFT selection for swap
  const toggleNFTSelection = (tokenId) => {
    setData((prev) => ({
      ...prev,
      selectedTokenIds: prev.selectedTokenIds.includes(tokenId)
        ? prev.selectedTokenIds.filter((id) => id !== tokenId)
        : [...prev.selectedTokenIds, tokenId],
    }));
  };

  // Select all NFTs
  const selectAllNFTs = () => {
    setData((prev) => ({
      ...prev,
      selectedTokenIds: userCarrotFarmerNFTs.map((tokenId) =>
        tokenId.toString()
      ),
    }));
  };

  // Deselect all NFTs
  const deselectAllNFTs = () => {
    setData((prev) => ({
      ...prev,
      selectedTokenIds: [],
    }));
  };

  // Toggle NFT selection for transfer
  const toggleTransferNFTSelection = (tokenId) => {
    setData((prev) => ({
      ...prev,
      selectedTransferTokenIds: prev.selectedTransferTokenIds.includes(tokenId)
        ? prev.selectedTransferTokenIds.filter((id) => id !== tokenId)
        : [...prev.selectedTransferTokenIds, tokenId],
    }));
  };

  // Select all transfer NFTs
  const selectAllTransferNFTs = () => {
    setData((prev) => ({
      ...prev,
      selectedTransferTokenIds: userBBBubuNFTs.map((tokenId) =>
        tokenId.toString()
      ),
    }));
  };

  // Deselect all transfer NFTs
  const deselectAllTransferNFTs = () => {
    setData((prev) => ({
      ...prev,
      selectedTransferTokenIds: [],
    }));
  };

  // Progress simulation with timeout fallback
  const simulateProgress = (type) => {
    setData((prev) => ({ ...prev, isLoading: true, [`${type}Progress`]: 0 }));

    const interval = setInterval(() => {
      setData((prev) => {
        const newProgress = prev[`${type}Progress`] + Math.random() * 15;
        if (newProgress >= 95) {
          clearInterval(interval);
          return { ...prev, [`${type}Progress`]: 95 };
        }
        return { ...prev, [`${type}Progress`]: newProgress };
      });
    }, 200);

    // Auto-reset after 30 seconds if transaction is stuck/rejected
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        [`${type}Progress`]: 0,
      }));
    }, 30000);

    return { interval, timeout };
  };

  // Refresh data without closing modals (for approve)
  const refreshDataKeepModal = useCallback(() => {
    setData((prev) => ({
      ...prev,
      isLoading: false,
      approveProgress: 100,
    }));
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        approveProgress: 0,
      }));
      refetchPublicData();
      refetchUserData();
    }, 1000);
  }, [refetchPublicData, refetchUserData]);

  // Refresh data without closing transfer modal (for transfer approve)
  const refreshDataKeepTransferModal = useCallback(() => {
    setData((prev) => ({
      ...prev,
      isLoading: false,
      approveProgress: 100,
    }));
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        approveProgress: 0,
      }));
      refetchPublicData();
      refetchUserData();
    }, 1000);
  }, [refetchPublicData, refetchUserData]);

  // Manual reset function for stuck loading states
  const resetLoadingState = () => {
    setData((prev) => ({
      ...prev,
      isLoading: false,
      mintProgress: 0,
      swapProgress: 0,
      approveProgress: 0,
      transferProgress: 0,
    }));
  };

  const refreshData = useCallback(() => {
    setData((prev) => ({
      ...prev,
      isLoading: false,
      mintProgress: 100,
      swapProgress: 100,
      approveProgress: 100,
    }));
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        mintProgress: 0,
        swapProgress: 0,
        approveProgress: 0,
        selectedTokenIds: [],
        showSwapModal: false,
        showMintModal: false,
      }));
      refetchPublicData();
      refetchUserData();
    }, 1000);
  }, [refetchPublicData, refetchUserData]);

  // Refresh data for transfer without closing modal (for transfer)
  const refreshDataForTransfer = useCallback(() => {
    setData((prev) => ({
      ...prev,
      isLoading: false,
      transferProgress: 100,
    }));
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        transferProgress: 0,
        selectedTransferTokenIds: [],
        transferAddress: "",
        showTransferModal: false,
      }));
      refetchPublicData();
      refetchUserData();
    }, 1000);
  }, [refetchPublicData, refetchUserData]);

  // Progress Bar Component
  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-base-300 rounded-full h-2 mb-4">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 mobile-safe-bottom">
      <Head>
        <title>BBBubu - Mystery Box NFT Collection</title>
        <meta
          name="description"
          content="Mint exclusive BBBubu mystery box NFTs"
        />
      </Head>

      <div className="w-full max-w-lg mx-auto">
        {/* Sale Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-base-content/80 mb-1">
            BBBubu NFT Sale
          </h1>
          <p className="text-base-content/60 text-sm">
            Exclusive Mystery Box Collection
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-6 bg-base-200 border-2 border-base-300 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-base-content/60 mb-2 text-sm">
            <span>Minting Progress</span>
            <span>
              {totalSupply.toString()}/
              {Number(totalSupply) + Number(remainingSupply)}
            </span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Number(totalSupply) /
                    (Number(totalSupply) + Number(remainingSupply))) *
                  100
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between text-base-content/50 mt-2 text-xs">
            <span>Minted</span>
            <span>Total Supply</span>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="border-2 border-base-300 rounded-xl mb-6 h-96 overflow-hidden relative bg-base-200 shadow-sm">
          {data.imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-10">
              <div className="animate-spin text-6xl">🥕</div>
            </div>
          )}
          <Image
            src="/bbbubu.gif"
            alt="BBBubu NFT"
            fill
            className="object-cover"
            priority
            style={{
              opacity: data.imageLoading ? 0.8 : 1
            }}
            onError={(e) => {
              e.target.src = "/bbb.jpg";
            }}
          />
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-base-content/80 mb-3">
              How to Get BBBubu NFTs
            </h3>

            {/* Limited Supply Warning */}
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-semibold">
                ⚠️ Limited Supply - First Come, First Served!
              </p>
            </div>

            {/* Direct Purchase Option */}
            <div className="mb-4 p-3 bg-base-200 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-base-content/80 mb-2">
                💰 Direct Purchase
              </h4>
              <p className="text-base-content/60 text-sm">
                You can directly purchase BBBubu NFTs with{" "}
                <span className="font-semibold text-blue-600">600 XDC</span>{" "}
                each
              </p>
            </div>

            {/* Swap Option */}
            <div className="mb-4 p-3 bg-base-200 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-base-content/80 mb-2">🔄 1:1 Swap</h4>
              <p className="text-base-content/60 text-sm mb-2">
                If you hold Farm NFTs, you can use{" "}
                <span className="font-semibold text-blue-600">Swap</span> to
                exchange them 1:1 for BBBubu NFTs
              </p>
              <Link
                href="/farm"
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View My Farm NFTs →
              </Link>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() =>
              setData((prev) => ({ ...prev, showMintModal: true }))
            }
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-4 text-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            disabled={false}
          >
            Mint
          </button>
          <button
            onClick={() =>
              setData((prev) => ({ ...prev, showSwapModal: true }))
            }
            className="flex-1 btn btn-primary border-none rounded-xl py-4 text-xl font-bold hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            disabled={false}
          >
            Swap
          </button>
        </div>

        {/* User's BBBubu NFTs */}
        {userBBBubuNFTs && userBBBubuNFTs.length > 0 && (
          <div className="mt-8 bg-base-200/60 border border-base-300 rounded-xl p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-base-content/80 mb-1">
                Your BBBubu NFTs
              </h3>
              <p className="text-base-content/60 text-sm">
                You own {userBBBubuNFTs.length} BBBubu NFT
                {userBBBubuNFTs.length !== 1 ? "s" : ""}
              </p>
              
              {/* Play BBBGame Button */}
              <div className="mt-4">
                <Link
                  href="/bbbgame"
                  className="inline-flex items-center px-6 py-3 btn btn-primary border-none font-bold rounded-xl hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🎮 Play BBBGame
                </Link>
                <p className="text-xs text-base-content/50 mt-2">
                  Use your BBBubu NFTs to battle and earn rewards!
                </p>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex gap-2 mb-4 justify-center">
              <button
                onClick={selectAllTransferNFTs}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                disabled={
                  data.isLoading ||
                  data.selectedTransferTokenIds.length === userBBBubuNFTs.length
                }
              >
                Select All ({userBBBubuNFTs.length})
              </button>
              <button
                onClick={deselectAllTransferNFTs}
                className="px-3 py-1 text-xs bg-base-300 text-base-content/60 rounded-lg hover:bg-base-300 transition-colors disabled:opacity-50"
                disabled={
                  data.isLoading || data.selectedTransferTokenIds.length === 0
                }
              >
                Clear Selection
              </button>
              <span className="text-xs text-base-content/50 self-center">
                {data.selectedTransferTokenIds.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {userBBBubuNFTs.map((tokenId) => (
                <div
                  key={tokenId.toString()}
                  className={`relative bg-base-200 rounded-lg border-2 p-3 text-center cursor-pointer transition-all ${
                    data.selectedTransferTokenIds.includes(tokenId.toString())
                      ? "border-blue-500 bg-blue-50"
                      : "border-base-300 hover:border-blue-300"
                  }`}
                  onClick={() => toggleTransferNFTSelection(tokenId.toString())}
                >
                  {data.selectedTransferTokenIds.includes(
                    tokenId.toString()
                  ) && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="mb-2 relative">
                    {data.bbbubuImageLoading[tokenId.toString()] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin text-2xl">🥕</div>
                      </div>
                    )}
                    <Image
                      src={`https://benybadboy.b-cdn.net/bbbhero/${tokenId.toString()}.jpg`}
                      alt={`BBBubu #${tokenId.toString()}`}
                      width={80}
                      height={80}
                      className="mx-auto rounded-lg object-cover"
                      onLoad={() => 
                        setData(prev => ({
                          ...prev,
                          bbbubuImageLoading: {
                            ...prev.bbbubuImageLoading,
                            [tokenId.toString()]: false
                          }
                        }))
                      }
                      onError={(e) => {
                        e.target.src = "/bbb.jpg";
                        setData(prev => ({
                          ...prev,
                          bbbubuImageLoading: {
                            ...prev.bbbubuImageLoading,
                            [tokenId.toString()]: false
                          }
                        }));
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-base-content/80">
                    BBBubu #{tokenId.toString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Transfer Button */}
            <div className="mt-4">
              <button
                onClick={() =>
                  setData((prev) => ({ ...prev, showTransferModal: true }))
                }
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={data.selectedTransferTokenIds.length === 0}
              >
                Transfer Selected NFTs ({data.selectedTransferTokenIds.length})
              </button>
            </div>

            {/* Debug Reset Button - only show when stuck */}
            {data.isLoading && (
              <div className="mt-3">
                <button
                  onClick={resetLoadingState}
                  className="w-full py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset Loading State (Debug)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mint Modal */}
      {data.showMintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mobile-safe-modal">
          <div className="bg-base-200 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-base-content/80">Mint BBBubu</h2>
              <button
                onClick={() =>
                  setData((prev) => ({ ...prev, showMintModal: false }))
                }
                className="text-base-content/40 hover:text-base-content/60 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between text-base-content/60 mb-2 text-sm">
                <span>Progress</span>
                <span>
                  {totalSupply.toString()}/
                  {Number(totalSupply) + Number(remainingSupply)}
                </span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (Number(totalSupply) /
                        (Number(totalSupply) + Number(remainingSupply))) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Progress Bars */}
            {data.mintProgress > 0 && (
              <div className="mb-4">
                <div className="text-base-content/60 text-sm mb-1">Minting...</div>
                <ProgressBar progress={data.mintProgress} />
              </div>
            )}

            {/* Cost Info */}
            <div className="bg-base-200/60 rounded-2xl p-4 mb-6 space-y-3 border border-base-300">
              <div className="flex justify-between">
                <span className="text-base-content/60">Amount:</span>
                <span className="text-base-content/80 font-semibold">
                  {data.quantity} BBBUBU
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Unit Price:</span>
                <span className="text-base-content/60">600 XDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Total Price:</span>
                <span className="text-base-content/80 font-semibold">
                  {formatEther(totalCost)} XDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Your Balance:</span>
                <span className="text-base-content/80 font-semibold">
                  {xdcBalance ? parseFloat(formatEther(xdcBalance.value)).toFixed(2) : "0"} XDC
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex justify-between items-center mb-6">
              <button
                className="w-12 h-12 rounded-full border-2 border-base-300 text-base-content/60 text-2xl hover:bg-base-300 hover:border-gray-400 transition-colors disabled:opacity-50"
                onClick={() => handleQuantityChange(-1)}
                disabled={data.isLoading || data.quantity <= 1}
              >
                -
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-base-content/80">
                  {data.quantity}
                </span>
                <div className="text-xs text-base-content/50 mt-1">
                  max: {Number(remainingSupply)}
                </div>
              </div>
              <button
                className="w-12 h-12 rounded-full border-2 border-base-300 text-base-content/60 text-2xl hover:bg-base-300 hover:border-gray-400 transition-colors disabled:opacity-50 select-none"
                onClick={() => handleQuantityChange(1)}
                onMouseDown={() => plusLongPress.startLongPress()}
                onMouseUp={() => plusLongPress.stopLongPress()}
                onMouseLeave={() => plusLongPress.stopLongPress()}
                onTouchStart={() => plusLongPress.startLongPress()}
                onTouchEnd={() => plusLongPress.stopLongPress()}
                disabled={data.isLoading || data.quantity >= Number(remainingSupply)}
              >
                +
              </button>
            </div>

            {/* Mint Button */}
            <WriteButton
              {...mint}
              className="w-full py-4 text-white font-bold bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {data.showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mobile-safe-modal">
          <div className="bg-base-200 rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-base-content/80">Swap Farm</h2>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    showSwapModal: false,
                    selectedTokenIds: [],
                  }))
                }
                className="text-base-content/40 hover:text-base-content/60 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Progress Bars */}
            {data.approveProgress > 0 && (
              <div className="mb-4">
                <div className="text-base-content/60 text-sm mb-1">Approving...</div>
                <ProgressBar progress={data.approveProgress} />
              </div>
            )}
            {data.swapProgress > 0 && (
              <div className="mb-4">
                <div className="text-base-content/60 text-sm mb-1">Swapping...</div>
                <ProgressBar progress={data.swapProgress} />
              </div>
            )}

            {userCarrotFarmerNFTs && userCarrotFarmerNFTs.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-base-content/60 mb-4">
                    You own {userCarrotFarmerNFTs.length} CarrotFarmer NFTs
                  </p>
                  <p className="text-base-content/50 mb-3 text-sm">
                    Select NFTs to swap (1:1 exchange ratio):
                  </p>

                  {/* Select All Controls */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={selectAllNFTs}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                      disabled={
                        data.isLoading ||
                        data.selectedTokenIds.length ===
                          userCarrotFarmerNFTs.length
                      }
                    >
                      Select All ({userCarrotFarmerNFTs.length})
                    </button>
                    <button
                      onClick={deselectAllNFTs}
                      className="px-3 py-1 text-xs bg-base-300 text-base-content/60 rounded-lg hover:bg-base-300 transition-colors disabled:opacity-50"
                      disabled={
                        data.isLoading || data.selectedTokenIds.length === 0
                      }
                    >
                      Clear Selection
                    </button>
                    <span className="text-xs text-base-content/50 self-center">
                      {data.selectedTokenIds.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-base-300 rounded-lg p-3 bg-base-200/60">
                    {userCarrotFarmerNFTs.map((tokenId) => (
                      <button
                        key={tokenId.toString()}
                        className={`p-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center min-h-[80px] ${
                          data.selectedTokenIds.includes(tokenId.toString())
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                            : "bg-base-200 text-base-content/70 border border-base-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                        onClick={() => toggleNFTSelection(tokenId.toString())}
                        disabled={data.isLoading}
                      >
                        <div className="mb-1 relative">
                          {data.farmImageLoading[tokenId.toString()] !== false && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin text-lg">🥕</div>
                            </div>
                          )}
                          <Image
                            src={`/farmer0/carrotFarmer.png`}
                            alt={`Farm #${tokenId.toString()}`}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                            onLoad={() => 
                              setData(prev => ({
                                ...prev,
                                farmImageLoading: {
                                  ...prev.farmImageLoading,
                                  [tokenId.toString()]: false
                                }
                              }))
                            }
                            onError={(e) => {
                              e.target.src = "/bbb.jpg";
                              setData(prev => ({
                                ...prev,
                                farmImageLoading: {
                                  ...prev.farmImageLoading,
                                  [tokenId.toString()]: false
                                }
                              }));
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-center">
                          Farm #{tokenId.toString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-base-200/60 rounded-xl p-4 mb-6 border border-base-300">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Selected:</span>
                    <span className="text-base-content/80 font-semibold">
                      {data.selectedTokenIds.length} NFTs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Exchange Ratio:</span>
                    <span className="text-base-content/80">1:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Will Receive:</span>
                    <span className="text-base-content/80 font-semibold">
                      {data.selectedTokenIds.length} BBBubu NFTs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Approval Status:</span>
                    <span
                      className={`font-semibold ${
                        isApprovedForAll ? "text-primary" : "text-red-600"
                      }`}
                    >
                      {isApprovedForAll ? "Approved" : "Not Approved"}
                    </span>
                  </div>
                </div>

                {/* Conditional buttons based on approval status */}
                {!isApprovedForAll ? (
                  <div className="space-y-3">
                    <div className="text-center text-base-content/60 text-sm">
                      You need to approve CarrotFarmer NFTs first to proceed
                      with swapping
                    </div>
                    <WriteButton
                      {...approve}
                      className="w-full py-4 text-white font-bold bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    />
                  </div>
                ) : (
                  <WriteButton
                    {...swap}
                    className="w-full py-4 text-white font-bold bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🥕</div>
                <p className="text-base-content/60 text-lg mb-2">
                  You don&apos;t have any CarrotFarmer NFTs
                </p>
                <p className="text-base-content/50 text-sm">
                  Please get CarrotFarmer NFTs first to swap
                </p>
                <button
                  onClick={() => refetchPublicData()}
                  className="mt-4 px-4 py-2 bg-base-300 text-base-content/60 rounded-lg hover:bg-base-300 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {data.showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mobile-safe-modal">
          <div className="bg-base-200 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-base-content/80">
                Transfer BBBubu NFTs
              </h2>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    showTransferModal: false,
                    selectedTransferTokenIds: [],
                    transferAddress: "",
                  }))
                }
                className="text-base-content/40 hover:text-base-content/60 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            {data.transferProgress > 0 && (
              <div className="mb-4">
                <div className="text-base-content/60 text-sm mb-1">
                  Transferring...
                </div>
                <ProgressBar progress={data.transferProgress} />
              </div>
            )}
            {data.approveProgress > 0 && (
              <div className="mb-4">
                <div className="text-base-content/60 text-sm mb-1">
                  Approving for Transfer...
                </div>
                <ProgressBar progress={data.approveProgress} />
              </div>
            )}

            {/* Transfer Info */}
            <div className="bg-base-200/60 rounded-xl p-4 mb-6 border border-base-300">
              <div className="flex justify-between mb-2">
                <span className="text-base-content/60">Selected NFTs:</span>
                <span className="text-base-content/80 font-semibold">
                  {data.selectedTransferTokenIds.length}
                </span>
              </div>
              <div className="text-xs text-base-content/50 mb-2">
                Token IDs: {data.selectedTransferTokenIds.join(", ")}
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-base-content/60">Transfer Approval:</span>
                <span
                  className={`font-semibold text-xs ${
                    isApprovedForMultiTransfer
                      ? "text-primary"
                      : "text-red-600"
                  }`}
                >
                  {isApprovedForMultiTransfer
                    ? "✅ Approved"
                    : "❌ Not Approved"}
                </span>
              </div>
              {data.isLoading && (
                <div className="flex justify-between mb-2">
                  <span className="text-base-content/60">Status:</span>
                  <span className="text-blue-600 text-xs font-semibold">
                    {data.approveProgress > 0
                      ? "Approving..."
                      : data.transferProgress > 0
                      ? "Transferring..."
                      : "Processing..."}
                  </span>
                </div>
              )}
              {data.selectedTransferTokenIds.length > 1 && (
                <div className="text-xs text-primary bg-primary/10 p-2 rounded">
                  ✅ All NFTs will be transferred in a single transaction
                </div>
              )}
            </div>

            {/* Recipient Address Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-base-content/70 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={data.transferAddress}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    transferAddress: e.target.value,
                  }))
                }
                placeholder="Enter recipient wallet address (0x...)"
                className="w-full px-4 py-3 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={data.isLoading}
              />
              {data.transferAddress && (
                <div className="mt-2">
                  {data.transferAddress.match(/^0x[a-fA-F0-9]{40}$/) ? (
                    <span className="text-xs text-primary">
                      ✓ Valid address format
                    </span>
                  ) : (
                    <span className="text-xs text-red-600">
                      ⚠ Invalid address format
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                <span className="font-semibold">⚠️ Warning:</span> Please
                double-check the recipient address. NFT transfers cannot be
                reversed!
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Using secure batch transfer contract for efficient multi-NFT
                transfers.
              </p>
            </div>

            {/* Transfer Button */}
            {!isApprovedForMultiTransfer ? (
              <div className="space-y-3">
                <div className="text-center text-base-content/60 text-sm">
                  You need to approve BBBubu NFTs for batch transfer first
                </div>
                <WriteButton
                  {...approveForTransfer}
                  className="w-full py-4 text-white font-bold bg-gradient-to-r from-orange-500 to-red-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
                />
              </div>
            ) : (
              <WriteButton
                {...transfer}
                className="w-full py-4 text-white font-bold bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
              />
            )}

            {/* Debug Reset Button - only show when stuck */}
            {data.isLoading && (
              <div className="mt-3">
                <button
                  onClick={resetLoadingState}
                  className="w-full py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset Loading State (Debug)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BBBubu;
