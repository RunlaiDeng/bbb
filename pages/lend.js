import { useState, useEffect, useMemo } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import {
  parseEther,
  formatEther,
  formatUnits,
  parseUnits,
  maxUint256,
} from "viem";
import WriteButton from "@/components/WriteButton";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import { contracts } from "@/config";
import Head from "next/head";

const BUTTON_STYLES = {
  base: "aave-button font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center min-h-[48px] relative",
  approve: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg",
  supply:
    "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg",
  borrow:
    "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg",
  repay:
    "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg",
  withdraw:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg",
  disabled: "opacity-50 cursor-not-allowed hover:transform-none",
};

const Lend = () => {
  const [activeTab, setActiveTab] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [userData, setUserData] = useState(null);
  const [assetsList, setAssetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();

  // Ray Math functions (AAVE V3 style)
  const RAY = parseUnits("1", 27); // 1e27

  const rayMul = (a, b) => {
    if (a === 0n || b === 0n) return 0n;
    const halfRay = RAY / 2n;
    return (a * b + halfRay) / RAY;
  };

  const lendContract = contracts[chainId]?.lend;
  const bbbToken = contracts[chainId]?.bbb;

  const assetIconMap = useMemo(() => {
    const map = {
      BBB: "/bbb.jpg",
      USDB: "/usdb.png",
      USDC: "/usdc.jpg",
      USDT: "/usdt.jpg",
      XDC: "/xdc.png",
      WETH: "/xdc.png",
    };

    if (contracts[chainId]?.bbb?.address) {
      map[contracts[chainId].bbb.address.toLowerCase()] = "/bbb.jpg";
    }
    if (contracts[chainId]?.usdb?.address) {
      map[contracts[chainId].usdb.address.toLowerCase()] = "/usdb.png";
    }
    if (contracts[chainId]?.xdcUSDC?.address) {
      map[contracts[chainId].xdcUSDC.address.toLowerCase()] = "/usdc.jpg";
    }
    if (contracts[chainId]?.stargateUSDC?.address) {
      map[contracts[chainId].stargateUSDC.address.toLowerCase()] = "/usdc.jpg";
    }
    if (contracts[chainId]?.stargateUSDT?.address) {
      map[contracts[chainId].stargateUSDT.address.toLowerCase()] = "/usdt.jpg";
    }

    return map;
  }, [chainId]);

  // 获取储备资产列表
  const { data: reservesListData } = useReadContracts({
    contracts: lendContract
      ? [{ ...lendContract, functionName: "getReservesList" }]
      : [],
    query: { enabled: !!lendContract },
  });

  const reservesList = reservesListData?.[0]?.result || [];

  // 创建获取资产信息的合约调用
  const createAssetInfoContracts = () => {
    if (!reservesList || reservesList.length === 0) return [];
    const contracts = [];
    reservesList.forEach((assetAddress) => {
      contracts.push(
        { address: assetAddress, abi: bbbToken?.abi, functionName: "symbol" },
        { address: assetAddress, abi: bbbToken?.abi, functionName: "name" },
        { address: assetAddress, abi: bbbToken?.abi, functionName: "decimals" }
      );
    });
    return contracts;
  };

  const { data: assetInfoData } = useReadContracts({
    contracts: createAssetInfoContracts(),
    query: { enabled: !!(reservesList && reservesList.length > 0) },
  });

  // 创建储备数据的映射
  const supportedAssets = useMemo(() => {
    if (!reservesList || !assetInfoData || reservesList.length === 0) return [];
    const assets = [];
    let infoIndex = 0;
    reservesList.forEach((address, index) => {
      const symbol = assetInfoData[infoIndex]?.result || `Asset${index}`;
      const name = assetInfoData[infoIndex + 1]?.result || `Asset ${index}`;
      const decimals = assetInfoData[infoIndex + 2]?.result || 18;
      const icon =
        assetIconMap[address.toLowerCase()] ||
        assetIconMap[symbol] ||
        "/logo.png";
      assets.push({ symbol, address, decimals: Number(decimals), icon, name });
      infoIndex += 3;
    });
    return assets;
  }, [reservesList, assetInfoData, assetIconMap]);

  // 创建用户数据合约调用
  const createUserDataContracts = useMemo(() => {
    if (!address || !lendContract || !supportedAssets.length) return [];
    let contracts = [
      { ...lendContract, functionName: "getUserAccountData", args: [address] },
    ];
    supportedAssets.forEach((asset) => {
      if (asset.address) {
        contracts.push(
          {
            ...lendContract,
            functionName: "balanceOf",
            args: [address, asset.address],
          },
          {
            ...lendContract,
            functionName: "getUserVariableDebt",
            args: [address, asset.address],
          },
          {
            address: asset.address,
            abi: bbbToken?.abi,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: asset.address,
            abi: bbbToken?.abi,
            functionName: "allowance",
            args: [address, lendContract.address],
          },
          {
            ...lendContract,
            functionName: "assetPrices",
            args: [asset.address],
          }
        );
      }
    });
    return contracts;
  }, [address, lendContract, supportedAssets]);

  const { data: contractData, refetch: refetchData } = useReadContracts({
    contracts: createUserDataContracts,
    query: {
      enabled: !!(address && lendContract && supportedAssets.length > 0),
      refetchInterval: 15000,
    },
  });

  // 获取储备数据（不需要连接钱包）
  const { data: reserveData, refetch: refetchReserveData } = useReadContracts({
    contracts:
      supportedAssets.length > 0
        ? supportedAssets.map((asset) => ({
            ...lendContract,
            functionName: "reserves",
            args: [asset.address],
          }))
        : [],
    query: { enabled: !!(lendContract && supportedAssets.length > 0) },
  });

  // 获取资产价格数据（不需要连接钱包）
  const { data: assetPricesData, refetch: refetchAssetPricesData } =
    useReadContracts({
      contracts:
        supportedAssets.length > 0
          ? supportedAssets.map((asset) => ({
              ...lendContract,
              functionName: "assetPrices",
              args: [asset.address],
            }))
          : [],
      query: { enabled: !!(lendContract && supportedAssets.length > 0) },
    });

  // 获取平台手续费率
  const { data: protocolFeeRateData } = useReadContracts({
    contracts: lendContract
      ? [{ ...lendContract, functionName: "protocolFeeRate" }]
      : [],
    query: { enabled: !!lendContract },
  });

  // ESC键关闭弹窗
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && activeTab && selectedAsset) {
        setActiveTab("");
        setSelectedAsset("");
        setAmount("");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [activeTab, selectedAsset]);

  useEffect(() => {
    const assetsLoaded = supportedAssets.length > 0;
    const pricesLoaded = assetPricesData && assetPricesData.length > 0;

    if (assetsLoaded) {
      if (isConnected && contractData && contractData.length > 0) {
        // 连接钱包时的完整数据处理
        const accountData = contractData[0]?.result;
        let processedAssets = [];
        let contractIndex = 1;

        supportedAssets.forEach((asset, index) => {
          if (asset.address) {
            const userSupplied = contractData[contractIndex]?.result || 0n;
            const userBorrowed = contractData[contractIndex + 1]?.result || 0n;
            const balance = contractData[contractIndex + 2]?.result || 0n;
            const allowance = contractData[contractIndex + 3]?.result || 0n;
            const assetPrice = contractData[contractIndex + 4]?.result || 0n;

            // 从储备数据获取利率信息
            const reserve = reserveData?.[index]?.result;

            // 获取 scaled values 和 indexes (根据新ABI结构)
            const scaledTotalSupply = reserve?.[7] || 0n; // scaledTotalSupply
            const scaledTotalVariableDebt = reserve?.[8] || 0n; // scaledTotalVariableDebt
            const liquidityIndex = reserve?.[4] || parseEther("1"); // liquidityIndex，默认为1e18
            const variableBorrowIndex = reserve?.[5] || parseEther("1"); // variableBorrowIndex，默认为1e18

            // 计算实际的总供应量和总借贷量（使用Ray数学）
            const actualTotalSupply = rayMul(scaledTotalSupply, liquidityIndex);
            const actualTotalBorrow = rayMul(
              scaledTotalVariableDebt,
              variableBorrowIndex
            );

            // 计算利用率和供应利率
            const borrowAPY = reserve?.[6] || 0n;
            const utilizationRate = actualTotalSupply > 0n ? 
              (actualTotalBorrow * parseUnits("1", 27)) / actualTotalSupply : 0n;
            
            // 获取平台手续费率（以万分之几为单位）
            const protocolFeeRate = protocolFeeRateData?.[0]?.result || 500n; // 默认5%
            // 计算给存款者的比例：(1 - 平台手续费/10000)
            const depositorsShare = parseUnits("1", 27) - (protocolFeeRate * parseUnits("1", 23)); // 10000 = 1e4, 27-4=23
            // 供应利率 = 借贷利率 * 利用率 * (1 - 平台手续费/10000)
            const supplyAPY = rayMul(rayMul(borrowAPY, utilizationRate), depositorsShare);

            // 添加调试信息（开发时启用）
            if (process.env.NODE_ENV === "development") {
              console.log(`${asset.symbol} Rate Calculation (Connected):`);
              console.log("Protocol Fee Rate (basis points):", protocolFeeRate.toString());
              console.log("Depositors Share:", formatUnits(depositorsShare, 27));
              console.log("Utilization Rate:", formatUnits(utilizationRate, 27));
              console.log("Borrow APY:", formatAPY(borrowAPY) + "%");
              console.log("Supply APY:", formatAPY(supplyAPY) + "%");
            }

            processedAssets.push({
              ...asset,
              userSupplied: userSupplied,
              userBorrowed: userBorrowed,
              userSupplyInterest: 0n, // 可以根据需要计算
              userBorrowInterest: 0n, // 可以根据需要计算
              totalSupply: actualTotalSupply, // 实际总供应量
              totalBorrow: actualTotalBorrow, // 实际总借贷量
              scaledTotalSupply: scaledTotalSupply,
              scaledTotalVariableDebt: scaledTotalVariableDebt,
              liquidityIndex: liquidityIndex,
              variableBorrowIndex: variableBorrowIndex,
              utilizationRate: utilizationRate,
              supplyAPY: supplyAPY,
              borrowAPY: borrowAPY,
              balance: balance,
              allowance: allowance,
              price: assetPrice,
            });
            contractIndex += 5;
          }
        });

        setUserData({
          totalCollateralValueUSD: accountData?.[0] || 0n,
          totalDebtValueUSD: accountData?.[1] || 0n,
          availableBorrowsUSD: accountData?.[2] || 0n,
          healthFactor: accountData?.[5] || 0n, // healthFactor is at index 5
        });

        setAssetsList(processedAssets);
      } else if (reserveData && assetPricesData && reserveData.length > 0) {
        // 未连接钱包时的基础数据处理
        let processedAssets = [];

        supportedAssets.forEach((asset, index) => {
          if (asset.address && reserveData[index]?.result) {
            const reserve = reserveData[index].result;
            const assetPrice = assetPricesData[index]?.result || 0n;

            // 获取 scaled values 和 indexes (根据新ABI结构)
            const scaledTotalSupply = reserve[7] || 0n; // scaledTotalSupply
            const scaledTotalVariableDebt = reserve[8] || 0n; // scaledTotalVariableDebt
            const liquidityIndex = reserve[4] || parseEther("1"); // liquidityIndex，默认为1e18
            const variableBorrowIndex = reserve[5] || parseEther("1"); // variableBorrowIndex，默认为1e18

            // 计算实际的总供应量和总借贷量（使用Ray数学）
            const actualTotalSupply = rayMul(scaledTotalSupply, liquidityIndex);
            const actualTotalBorrow = rayMul(
              scaledTotalVariableDebt,
              variableBorrowIndex
            );

            // 计算利用率和供应利率
            const borrowAPY = reserve[6] || 0n;
            const utilizationRate = actualTotalSupply > 0n ? 
              (actualTotalBorrow * parseUnits("1", 27)) / actualTotalSupply : 0n;
            
            // 获取平台手续费率（以万分之几为单位）
            const protocolFeeRate = protocolFeeRateData?.[0]?.result || 500n; // 默认5%
            // 计算给存款者的比例：(1 - 平台手续费/10000)
            const depositorsShare = parseUnits("1", 27) - (protocolFeeRate * parseUnits("1", 23)); // 10000 = 1e4, 27-4=23
            // 供应利率 = 借贷利率 * 利用率 * (1 - 平台手续费/10000)
            const supplyAPY = rayMul(rayMul(borrowAPY, utilizationRate), depositorsShare);

            // 添加调试信息（开发时启用）
            if (process.env.NODE_ENV === "development") {
              console.log(`${asset.symbol} Rate Calculation (Not Connected):`);
              console.log("Protocol Fee Rate (basis points):", protocolFeeRate.toString());
              console.log("Depositors Share:", formatUnits(depositorsShare, 27));
              console.log("Utilization Rate:", formatUnits(utilizationRate, 27));
              console.log("Borrow APY:", formatAPY(borrowAPY) + "%");
              console.log("Supply APY:", formatAPY(supplyAPY) + "%");
            }

            processedAssets.push({
              ...asset,
              userSupplied: 0n,
              userBorrowed: 0n,
              userSupplyInterest: 0n,
              userBorrowInterest: 0n,
              totalSupply: actualTotalSupply, // 实际总供应量
              totalBorrow: actualTotalBorrow, // 实际总借贷量
              scaledTotalSupply: scaledTotalSupply,
              scaledTotalVariableDebt: scaledTotalVariableDebt,
              liquidityIndex: liquidityIndex,
              variableBorrowIndex: variableBorrowIndex,
              utilizationRate: utilizationRate,
              supplyAPY: supplyAPY,
              borrowAPY: borrowAPY,
              balance: 0n,
              allowance: 0n,
              price: assetPrice,
            });
          }
        });

        setUserData({
          totalCollateralValueUSD: 0n,
          totalDebtValueUSD: 0n,
          availableBorrowsUSD: 0n,
          healthFactor: 0n,
        });

        setAssetsList(processedAssets);
      }

      setLoading(false);
    }
  }, [
    contractData,
    supportedAssets,
    isConnected,
    reserveData,
    assetPricesData,
    protocolFeeRateData,
  ]);

  // Helper functions
  const formatNumber = (value, decimals = 18, displayDecimals = 4) => {
    if (!value) return "0.0000";
    return Number(formatUnits(value, decimals)).toLocaleString("en-US", {
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
    });
  };

  const formatAPY = (value) => {
    if (!value) return "0.00";
    // 新合约的利率已经是以 ray (1e27) 为单位的年利率
    return (Number(formatUnits(value, 27)) * 100).toFixed(2);
  };

  // 创建资产价格映射（备用价格源，主要价格从 asset.price 获取）
  const assetPrices = useMemo(() => {
    const priceMap = {};

    // 优先使用 assetsList 中的价格数据（来自合约调用）
    assetsList.forEach((asset) => {
      if (asset.price && asset.price > 0n) {
        const price = Number(formatEther(asset.price));
        priceMap[asset.address.toLowerCase()] = price;
        priceMap[asset.symbol] = price;
      }
    });

    // 如果没有价格数据，使用独立的价格查询结果作为备选
    if (
      Object.keys(priceMap).length === 0 &&
      supportedAssets.length &&
      assetPricesData
    ) {
      supportedAssets.forEach((asset, index) => {
        if (assetPricesData[index]?.result) {
          // 合约价格是以18位小数的USD价格
          const price = Number(formatEther(assetPricesData[index].result));
          priceMap[asset.address.toLowerCase()] = price;
          priceMap[asset.symbol] = price;
        }
      });
    }

    return priceMap;
  }, [supportedAssets, assetPricesData, assetsList]);

  // 获取代币价格（USD）- 从合约获取
  const getTokenPrice = (symbol, assetAddress, asset = null) => {
    // 第一优先级：如果传入了 asset 对象且有价格数据，直接使用
    if (asset && asset.price && asset.price > 0n) {
      const price = Number(formatEther(asset.price));
      if (process.env.NODE_ENV === "development") {
        console.log(`Price for ${symbol} from asset object:`, price);
      }
      return price;
    }

    // 第二优先级：从资产列表中查找对应的价格
    const assetData = assetsList.find(
      (a) =>
        a.address.toLowerCase() === assetAddress?.toLowerCase() ||
        a.symbol === symbol
    );
    if (assetData && assetData.price && assetData.price > 0n) {
      const price = Number(formatEther(assetData.price));
      if (process.env.NODE_ENV === "development") {
        console.log(`Price for ${symbol} from assetsList:`, price);
      }
      return price;
    }

    // 第三优先级：使用资产地址查找价格映射
    if (assetAddress && assetPrices[assetAddress.toLowerCase()]) {
      const price = assetPrices[assetAddress.toLowerCase()];
      if (process.env.NODE_ENV === "development") {
        console.log(`Price for ${symbol} from price map (address):`, price);
      }
      return price;
    }

    // 第四优先级：使用符号查找价格映射
    if (assetPrices[symbol]) {
      const price = assetPrices[symbol];
      if (process.env.NODE_ENV === "development") {
        console.log(`Price for ${symbol} from price map (symbol):`, price);
      }
      return price;
    }

    // 如果没有找到价格数据，返回默认值1.0（但会在控制台警告）
    console.warn(`Price not found for asset: ${symbol} (${assetAddress})`);
    return 1.0;
  };

  // 计算资产的USD价值
  const calculateUSDValue = (tokenAmount, asset) => {
    if (!tokenAmount || tokenAmount === 0n || !asset) return 0;
    const tokenAmountInDecimals = Number(
      formatUnits(tokenAmount, asset.decimals)
    );
    const tokenPrice = getTokenPrice(asset.symbol, asset.address, asset);
    return tokenAmountInDecimals * tokenPrice;
  };

  // 获取可用流动性
  const getAvailableLiquidity = (asset) => {
    if (!asset) return 0n;

    // 现在 asset.totalSupply 和 asset.totalBorrow 是通过 Ray 数学计算的实际值
    const liquidity =
      asset.totalSupply > asset.totalBorrow
        ? asset.totalSupply - asset.totalBorrow
        : 0n;

    // 添加调试信息（可以在开发时启用）
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${asset.symbol} - Total Supply:`,
        formatUnits(asset.totalSupply, asset.decimals)
      );
      console.log(
        `${asset.symbol} - Total Borrow:`,
        formatUnits(asset.totalBorrow, asset.decimals)
      );
      console.log(
        `${asset.symbol} - Available Liquidity:`,
        formatUnits(liquidity, asset.decimals)
      );
    }

    return liquidity;
  };

  // 格式化流动性信息
  const formatLiquidity = (asset) => {
    const liquidity = getAvailableLiquidity(asset);
    const liquidityFormatted = formatNumber(liquidity, asset.decimals, 2);
    const liquidityUSD =
      Number(formatUnits(liquidity, asset.decimals)) *
      getTokenPrice(asset.symbol, asset.address, asset);
    return {
      tokens: liquidityFormatted,
      usd: liquidityUSD.toFixed(2),
    };
  };

  const getMaxBorrowAmount = (asset) => {
    if (!asset) return 0n;

    // 如果没有连接钱包或没有用户数据，返回合约可用流动性
    if (!isConnected || !userData?.availableBorrowsUSD) {
      return getAvailableLiquidity(asset);
    }

    // availableBorrowsUSD 是以18位小数存储的USD值
    const availableBorrowsInUSD = Number(
      formatUnits(userData.availableBorrowsUSD, 18)
    );

    // 防止科学记数法和处理极小值
    if (availableBorrowsInUSD < 1e-10) return 0n;

    // 计算合约可用流动性
    const availableLiquidity = getAvailableLiquidity(asset);
    if (availableLiquidity <= 0n) return 0n;

    try {
      // 获取代币价格
      const tokenPrice = getTokenPrice(asset.symbol, asset.address, asset);

      if (tokenPrice <= 0) {
        console.warn(`Invalid price for ${asset.symbol}:`, tokenPrice);
        return 0n;
      }

      // 根据USD额度和代币价格计算可借款的代币数量
      const maxTokensByCredit = availableBorrowsInUSD / tokenPrice;

      // 确保不超过小数精度
      const tokenString = maxTokensByCredit.toFixed(asset.decimals);
      const maxBorrowTokens = parseUnits(tokenString, asset.decimals);

      // 添加调试信息（可以在开发时启用）
      if (process.env.NODE_ENV === "development") {
        console.log(`${asset.symbol} Max Borrow Calculation:`);
        console.log("Available Borrows USD:", availableBorrowsInUSD);
        console.log("Token Price:", tokenPrice);
        console.log(
          "Max Tokens by Credit:",
          formatUnits(maxBorrowTokens, asset.decimals)
        );
        console.log(
          "Available Liquidity:",
          formatUnits(availableLiquidity, asset.decimals)
        );
      }

      // 返回 min(基于用户信用额度的可借款量, 合约可用流动性)
      return maxBorrowTokens < availableLiquidity
        ? maxBorrowTokens
        : availableLiquidity;
    } catch (error) {
      console.warn(
        "Error calculating borrow amount:",
        error,
        "Asset:",
        asset.symbol,
        "Price:",
        getTokenPrice(asset.symbol, asset.address, asset)
      );
      return 0n;
    }
  };

  const safeParseAmount = (value, decimals = 18) => {
    if (!value || value === "" || isNaN(Number(value))) return 0n;
    const cleanValue = value.toString().replace(/,/g, "").trim();
    const numValue = Number(cleanValue);
    if (isNaN(numValue) || numValue <= 0) return 0n;

    try {
      const result = parseUnits(cleanValue, decimals);
      if (result === 0n && numValue > 0) {
        throw new Error("parseUnits returned 0 for non-zero input");
      }
      return result;
    } catch (error) {
      try {
        const multiplier = Math.pow(10, decimals);
        const scaledValue = Math.round(numValue * multiplier);
        return BigInt(scaledValue);
      } catch (fallbackError) {
        return 0n;
      }
    }
  };

  const getHealthFactorColor = (healthFactor) => {
    if (!healthFactor || healthFactor === 0n) return "text-gray-500";
    const hf = Number(formatEther(healthFactor));
    if (hf >= 2) return "text-green-600";
    if (hf >= 1.5) return "text-yellow-600";
    if (hf >= 1.2) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthFactorText = (healthFactor) => {
    if (
      !healthFactor ||
      healthFactor === 0n ||
      healthFactor ===
        BigInt(
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
    )
      return "No debt";
    const hf = Number(formatEther(healthFactor));
    if (hf >= 2) return "Healthy";
    if (hf >= 1.5) return "Good";
    if (hf >= 1.2) return "Risky";
    return "Danger";
  };

  const getSelectedAssetData = () => {
    return assetsList.find((asset) => asset.address === selectedAsset);
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("🔄 开始刷新数据...");

      // 立即刷新用户数据
      if (refetchData) {
        await refetchData();
        console.log("✅ 用户数据刷新完成");
      }

      // 稍后刷新储备数据和价格数据（因为区块链状态可能需要一点时间更新）
      setTimeout(async () => {
        try {
          const promises = [];
          if (refetchReserveData) {
            promises.push(refetchReserveData());
          }
          if (refetchAssetPricesData) {
            promises.push(refetchAssetPricesData());
          }

          if (promises.length > 0) {
            await Promise.all(promises);
            console.log("✅ 储备数据和价格数据刷新完成");
          }

          setIsRefreshing(false);
          console.log("🎉 所有数据刷新完成");
        } catch (error) {
          console.warn("❌ 储备/价格数据刷新失败:", error);
          setIsRefreshing(false);
        }
      }, 1000); // 1秒后刷新储备数据
    } catch (error) {
      console.warn("❌ 用户数据刷新失败:", error);
      setIsRefreshing(false);
    }
  };

  const createActions = () => {
    const selectedAssetData = getSelectedAssetData();
    if (!selectedAssetData || !lendContract) return {};

    const parsedAmount = safeParseAmount(amount, selectedAssetData.decimals);

    return {
      approve: {
        buttonName: "Approve",
        data: {
          address: selectedAssetData.address,
          abi: bbbToken?.abi,
          functionName: "approve",
          args: [lendContract.address, maxUint256],
        },
        callback: refreshData,
      },
      supply: {
        buttonName: "Supply",
        data: {
          ...lendContract,
          functionName: "supply",
          args: [selectedAssetData.address, parsedAmount, address, 0],
        }, // 添加 onBehalfOf 和 referralCode 参数
        callback: () => {
          refreshData();
          setAmount("");
          setActiveTab("");
          setSelectedAsset("");
        },
        disabled:
          !amount ||
          parsedAmount <= 0n ||
          parsedAmount > selectedAssetData.balance,
      },
      borrow: {
        buttonName: "Borrow",
        data: {
          ...lendContract,
          functionName: "borrow",
          args: [selectedAssetData.address, parsedAmount, address, 0],
        }, // 添加 onBehalfOf 和 referralCode 参数
        callback: () => {
          refreshData();
          setAmount("");
          setActiveTab("");
          setSelectedAsset("");
        },
        disabled:
          !amount ||
          parsedAmount <= 0n ||
          parsedAmount > getMaxBorrowAmount(selectedAssetData),
      },
      repay: {
        buttonName: "Repay",
        data: {
          ...lendContract,
          functionName: "repay",
          args: [selectedAssetData.address, parsedAmount, address],
        }, // 添加 onBehalfOf 参数
        callback: () => {
          refreshData();
          setAmount("");
          setActiveTab("");
          setSelectedAsset("");
        },
        disabled:
          !amount ||
          parsedAmount <= 0n ||
          parsedAmount > selectedAssetData.userBorrowed,
      },
      withdraw: {
        buttonName: "Withdraw",
        data: {
          ...lendContract,
          functionName: "withdraw",
          args: [selectedAssetData.address, parsedAmount, address],
        }, // 添加 to 参数
        callback: () => {
          refreshData();
          setAmount("");
          setActiveTab("");
          setSelectedAsset("");
        },
        disabled:
          !amount ||
          parsedAmount <= 0n ||
          parsedAmount > selectedAssetData.userSupplied,
      },
    };
  };

  const actions = createActions();
  const selectedAssetData = getSelectedAssetData();

  if (!lendContract || (isConnected && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!lendContract
              ? "Loading contract..."
              : "Loading lending protocol..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Lend - BBB Finance</title>
        <meta
          name="description"
          content="Supply assets as collateral, borrow against them, and earn interest on BBB Finance."
        />
        <style jsx>{`
          .aave-gradient {
            background: linear-gradient(
              135deg,
              #1e1b4b 0%,
              #3730a3 50%,
              #1e40af 100%
            );
          }
          .aave-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(229, 231, 235, 0.8);
          }
          .aave-button {
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.2s ease-in-out;
          }
          .aave-button:hover:not(.disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="">
            <div className="aave-gradient  p-8 rounded-2xl">
              <h1 className="text-4xl font-bold mb-4">Lending & Borrowing</h1>
              <p className=" text-lg">
                Supply assets to earn interest and use them as collateral to
                borrow other assets
              </p>
            </div>
          </div>

          {/* Refresh Indicator - Fixed to bottom right */}
          {isRefreshing && (
            <div className="fixed bottom-6 right-6 z-50 max-w-sm">
              <div className="bg-white border border-blue-200 rounded-xl p-4 flex items-center space-x-3 shadow-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="text-blue-800">
                  <div className="font-medium text-sm">Updating data...</div>
                  <div className="text-xs text-blue-600">
                    Refreshing balances and borrowing amounts
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* User Dashboard */}
            {isConnected && userData && (
              <div className="aave-card px-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Account Overview
                </h2>
                <div className="flex gap-8">
                  <div className="text-left">
                    <div className="text-sm text-gray-600 mb-1">Net Worth</div>
                    <div className="text-2xl font-bold text-gray-900">
                      $
                      {formatNumber(
                        userData.totalCollateralValueUSD -
                          userData.totalDebtValueUSD,
                        18,
                        2
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-600 mb-1">
                      Health Factor
                    </div>
                    <div
                      className={`text-2xl font-bold ${getHealthFactorColor(
                        userData.healthFactor
                      )}`}
                    >
                      {userData.healthFactor && userData.healthFactor > 0n
                        ? userData.healthFactor ===
                          BigInt(
                            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                          )
                          ? "∞"
                          : formatNumber(userData.healthFactor, 18, 2)
                        : "∞"}
                    </div>
                    <div
                      className={`text-xs font-medium ${getHealthFactorColor(
                        userData.healthFactor
                      )}`}
                    >
                      {getHealthFactorText(userData.healthFactor)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aave-style layout: Supplies and Borrows on top */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Your Supplies */}
                <div className="aave-card p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Your supplies
                  </h2>
                  {assetsList.some((asset) => asset.userSupplied > 0n) ? (
                    <div className="space-y-3">
                      {assetsList
                        .filter((asset) => asset.userSupplied > 0n)
                        .map((asset) => (
                          <div
                            key={`user-supply-${asset.address}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <img
                                src={asset.icon}
                                alt={asset.symbol}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {asset.symbol}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatNumber(
                                    asset.userSupplied,
                                    asset.decimals,
                                    4
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  $
                                  {calculateUSDValue(
                                    asset.userSupplied,
                                    asset
                                  ).toFixed(2)}
                                </div>
                                <div className="text-sm text-green-600">
                                  {formatAPY(asset.supplyAPY)}% APY
                                </div>
                              </div>
                              {isConnected ? (
                                <button
                                  onClick={() => {
                                    setSelectedAsset(asset.address);
                                    setActiveTab("withdraw");
                                    setAmount("");
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Withdraw
                                </button>
                              ) : (
                                <button
                                  onClick={privyLogin}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Nothing supplied yet
                    </div>
                  )}
                </div>

                {/* Assets to Supply */}
                <div className="aave-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Assets to supply
                    </h2>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Hide —
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showZeroBalances}
                        onChange={(e) => setShowZeroBalances(e.target.checked)}
                        className="mr-2"
                      />
                      Show assets with 0 balance
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-2">
                      <div>Asset</div>
                      <div className="text-right">Wallet balance</div>
                      <div className="text-right">APY</div>
                      <div className="text-right">Can be collateral</div>
                      <div></div>
                    </div>

                    {assetsList
                      .filter((asset) => showZeroBalances || asset.balance > 0n)
                      .map((asset) => (
                        <div
                          key={`supply-${asset.address}`}
                          className="grid grid-cols-5 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <img
                              src={asset.icon}
                              alt={asset.symbol}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <span className="font-semibold text-gray-900">
                              {asset.symbol}
                            </span>
                          </div>
                          <div className="text-right font-medium">
                            {formatNumber(asset.balance, asset.decimals, 6)}
                          </div>
                          <div className="text-right font-medium text-green-600">
                            {formatAPY(asset.supplyAPY)}%
                          </div>
                          <div className="text-right">
                            <span className="text-green-600">✓</span>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => {
                                if (!isConnected) {
                                  privyLogin();
                                  return;
                                }
                                setSelectedAsset(asset.address);
                                setActiveTab("supply");
                                setAmount("");
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              {isConnected ? "Supply" : "Connect to Supply"}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Your Borrows */}
                <div className="aave-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Your borrows
                    </h2>
                  </div>
                  {assetsList.some((asset) => asset.userBorrowed > 0n) ? (
                    <div className="space-y-3">
                      {assetsList
                        .filter((asset) => asset.userBorrowed > 0n)
                        .map((asset) => (
                          <div
                            key={`user-borrow-${asset.address}`}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <img
                                src={asset.icon}
                                alt={asset.symbol}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {asset.symbol}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatNumber(
                                    asset.userBorrowed,
                                    asset.decimals,
                                    4
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  $
                                  {calculateUSDValue(
                                    asset.userBorrowed,
                                    asset
                                  ).toFixed(2)}
                                </div>
                                <div className="text-sm text-red-600">
                                  {formatAPY(asset.borrowAPY)}% APY
                                </div>
                              </div>
                              {isConnected ? (
                                <button
                                  onClick={() => {
                                    setSelectedAsset(asset.address);
                                    setActiveTab("repay");
                                    setAmount("");
                                  }}
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Repay
                                </button>
                              ) : (
                                <button
                                  onClick={privyLogin}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Nothing borrowed yet
                    </div>
                  )}
                </div>

                {/* Assets to Borrow */}
                <div className="aave-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Assets to borrow
                    </h2>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Hide —
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-blue-700">
                      To borrow you need to supply any asset to be used as
                      collateral.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-2">
                      <div>Asset</div>
                      <div className="text-right">Available</div>
                      <div className="text-right">APY, variable</div>
                      <div></div>
                      <div></div>
                    </div>

                    {assetsList.map((asset) => (
                      <div
                        key={`borrow-${asset.address}`}
                        className="grid grid-cols-5 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <img
                            src={asset.icon}
                            alt={asset.symbol}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <span className="font-semibold text-gray-900">
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="text-right font-medium">
                          {formatNumber(
                            getMaxBorrowAmount(asset),
                            asset.decimals,
                            6
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-red-600">
                            {formatAPY(asset.borrowAPY)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => {
                              if (!isConnected) {
                                privyLogin();
                                return;
                              }
                              setSelectedAsset(asset.address);
                              setActiveTab("borrow");
                              setAmount("");
                            }}
                            disabled={
                              isConnected && getMaxBorrowAmount(asset) <= 0n
                            }
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            {isConnected ? "Borrow" : "Connect to Borrow"}
                          </button>
                        </div>
                        <div className="text-right">
                          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Wallet Banner for non-connected users */}
          {!isConnected && (
            <div className="text-center mt-8">
              <div className="aave-card p-6 max-w-2xl mx-auto bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-blue-900">
                  Connect Your Wallet
                </h3>
                <p className="text-blue-700 mb-4">
                  Connect your wallet to start supplying assets and borrowing on
                  our lending protocol.
                </p>
                <button
                  onClick={privyLogin}
                  className="bg-blue-600 text-white py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal Popup */}
      {activeTab && selectedAsset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setActiveTab("");
            setSelectedAsset("");
            setAmount("");
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedAssetData?.icon}
                  alt={selectedAssetData?.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {activeTab} {selectedAssetData?.symbol}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveTab("");
                  setSelectedAsset("");
                  setAmount("");
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            const decimalPart = value.split(".")[1];
                            if (
                              !decimalPart ||
                              decimalPart.length <=
                                (selectedAssetData?.decimals || 18)
                            ) {
                              setAmount(value);
                            }
                          }
                        }}
                        placeholder="0.00"
                        className="w-full p-4 pr-20 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-semibold"
                      />
                      <div className="absolute right-4 top-4 text-gray-500 font-medium">
                        {selectedAssetData?.symbol}
                      </div>
                    </div>

                    {selectedAssetData && (
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Available:{" "}
                          {formatNumber(
                            activeTab === "supply"
                              ? selectedAssetData.balance
                              : activeTab === "borrow"
                              ? getMaxBorrowAmount(selectedAssetData)
                              : activeTab === "repay"
                              ? selectedAssetData.userBorrowed
                              : selectedAssetData.userSupplied,
                            selectedAssetData.decimals,
                            4
                          )}{" "}
                          {selectedAssetData.symbol}
                        </span>
                        <button
                          onClick={() => {
                            const maxValue =
                              activeTab === "supply"
                                ? selectedAssetData.balance
                                : activeTab === "borrow"
                                ? getMaxBorrowAmount(selectedAssetData)
                                : activeTab === "repay"
                                ? selectedAssetData.userBorrowed
                                : selectedAssetData.userSupplied;
                            const formattedValue = formatNumber(
                              maxValue,
                              selectedAssetData.decimals,
                              selectedAssetData.decimals
                            );
                            setAmount(formattedValue.replace(/,/g, ""));
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          MAX
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {activeTab === "supply" && selectedAssetData && (
                      <>
                        {selectedAssetData.allowance <
                          safeParseAmount(
                            amount,
                            selectedAssetData.decimals
                          ) && (
                          <WriteButton
                            {...actions.approve}
                            className={`${BUTTON_STYLES.base} ${BUTTON_STYLES.approve}`}
                          />
                        )}
                        <WriteButton
                          {...actions.supply}
                          className={`${BUTTON_STYLES.base} ${
                            BUTTON_STYLES.supply
                          } ${
                            actions.supply?.disabled
                              ? BUTTON_STYLES.disabled
                              : ""
                          }`}
                        />
                        {actions.supply?.disabled && (
                          <p className="text-sm text-red-500 text-center">
                            {!amount
                              ? "Please enter supply amount"
                              : safeParseAmount(
                                  amount,
                                  selectedAssetData.decimals
                                ) > selectedAssetData.balance
                              ? "Insufficient balance"
                              : "Please enter valid amount"}
                          </p>
                        )}
                      </>
                    )}

                    {activeTab === "borrow" && selectedAssetData && (
                      <>
                        <WriteButton
                          {...actions.borrow}
                          className={`${BUTTON_STYLES.base} ${
                            BUTTON_STYLES.borrow
                          } ${
                            actions.borrow?.disabled
                              ? BUTTON_STYLES.disabled
                              : ""
                          }`}
                        />
                        {actions.borrow?.disabled && (
                          <p className="text-sm text-red-500 text-center">
                            {!amount
                              ? "Please enter borrow amount"
                              : safeParseAmount(
                                  amount,
                                  selectedAssetData.decimals
                                ) > getMaxBorrowAmount(selectedAssetData)
                              ? "Amount exceeds borrowing capacity"
                              : "Please enter valid amount"}
                          </p>
                        )}
                      </>
                    )}

                    {activeTab === "repay" && selectedAssetData && (
                      <>
                        {selectedAssetData.allowance <
                          safeParseAmount(
                            amount,
                            selectedAssetData.decimals
                          ) && (
                          <WriteButton
                            {...actions.approve}
                            className={`${BUTTON_STYLES.base} ${BUTTON_STYLES.approve}`}
                          />
                        )}
                        <WriteButton
                          {...actions.repay}
                          className={`${BUTTON_STYLES.base} ${
                            BUTTON_STYLES.repay
                          } ${
                            actions.repay?.disabled
                              ? BUTTON_STYLES.disabled
                              : ""
                          }`}
                        />
                        {actions.repay?.disabled && (
                          <p className="text-sm text-red-500 text-center">
                            {!amount
                              ? "Please enter repay amount"
                              : safeParseAmount(
                                  amount,
                                  selectedAssetData.decimals
                                ) > selectedAssetData.userBorrowed
                              ? "Amount exceeds borrowed balance"
                              : "Please enter valid amount"}
                          </p>
                        )}
                      </>
                    )}

                    {activeTab === "withdraw" && selectedAssetData && (
                      <>
                        <WriteButton
                          {...actions.withdraw}
                          className={`${BUTTON_STYLES.base} ${
                            BUTTON_STYLES.withdraw
                          } ${
                            actions.withdraw?.disabled
                              ? BUTTON_STYLES.disabled
                              : ""
                          }`}
                        />
                        {actions.withdraw?.disabled && (
                          <p className="text-sm text-red-500 text-center">
                            {!amount
                              ? "Please enter withdraw amount"
                              : safeParseAmount(
                                  amount,
                                  selectedAssetData.decimals
                                ) > selectedAssetData.userSupplied
                              ? "Amount exceeds supplied balance"
                              : "Please enter valid amount"}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Transaction Overview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Transaction Overview
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asset:</span>
                      <div className="flex items-center space-x-2">
                        <img
                          src={selectedAssetData?.icon}
                          alt={selectedAssetData?.symbol}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="font-medium">
                          {selectedAssetData?.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        {amount || "0"} {selectedAssetData?.symbol}
                      </span>
                    </div>
                    {activeTab === "supply" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supply APY:</span>
                        <span className="font-medium text-green-600">
                          {formatAPY(selectedAssetData?.supplyAPY)}%
                        </span>
                      </div>
                    )}
                    {activeTab === "borrow" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Borrow APY:</span>
                          <span className="font-medium text-red-600">
                            {formatAPY(selectedAssetData?.borrowAPY)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Available Liquidity:
                          </span>
                          <span className="font-medium">
                            {formatLiquidity(selectedAssetData).tokens}{" "}
                            {selectedAssetData?.symbol}
                          </span>
                        </div>
                      </>
                    )}

                    {amount && selectedAssetData && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">USD Value:</span>
                          <span className="font-medium">
                            $
                            {(
                              Number(amount || 0) *
                              getTokenPrice(
                                selectedAssetData.symbol,
                                selectedAssetData.address,
                                selectedAssetData
                              )
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Lend;
