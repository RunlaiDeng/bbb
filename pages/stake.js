import { useState, useEffect, useCallback } from "react";
import { getBBBPrice } from "@/components/Utils";
import { useRouter } from "next/router";
import StakingPool from "@/components/StakingPool";

// Process pool ids for hash navigation (move outside component to avoid dependency issues)
const POOL_HASH_MAP = {
  xdc: "xdc-0",
  usdb: "usdb-1",
  "usdb-expired": "usdb-0",
  psxdc: "lp-0",
  bpsxdc: "lp-1",
  bbb: "lp-2",
  "xdc-bbb": "lp-3",
  "xdc-bpsxdc": "lp-4",
};

// Pool configurations (move outside component)
const POOL_CONFIGS = [
  { 
    id: 'xdc-0', 
    pid: 0, 
    poolType: 'xdc', 
    title: 'XDC Staking', 
    symbol: 'XDC',
    icon: "/xdc.png",
    getTokenLink: "https://faucet.blockpi.io/xdc",
    hashTag: "#xdc"
  },
  { 
    id: 'usdb-0', 
    pid: 0, 
    poolType: 'usdb', 
    title: 'USDB Staking (Expired)', 
    symbol: 'USDB',
    icon: "/usdb.png",
    getTokenLink: "/usdb",
    hashTag: "#usdb-expired"
  },
  { 
    id: 'usdb-2', 
    pid: 2, 
    poolType: 'usdb', 
    title: 'USDB Staking', 
    symbol: 'USDB',
    icon: "/usdb.png",
    getTokenLink: "/usdb",
    hashTag: "#usdb"
  },
  { 
    id: 'lp-0', 
    pid: 0, 
    poolType: 'lp', 
    title: 'psXDC ReStaking', 
    symbol: 'psXDC',
    icon: "/xdc.png",
    getTokenLink: "https://primestaking.xyz/xdc-liquid-staking",
    hashTag: "#psxdc"
  },
  { 
    id: 'lp-1', 
    pid: 1, 
    poolType: 'lp', 
    title: 'bpsXDC ReStaking', 
    symbol: 'bpsXDC',
    icon: "/xdc.png",
    getTokenLink: "/bpsXDC",
    hashTag: "#bpsxdc"
  },
  { 
    id: 'lp-2', 
    pid: 2, 
    poolType: 'lp', 
    title: 'BBB Staking', 
    symbol: 'BBB',
    icon: "/bbb.jpg",
    getTokenLink: "/buy",
    hashTag: "#bbb"
  },
  { 
    id: 'lp-3', 
    pid: 3, 
    poolType: 'lp', 
    title: 'XDC-BBB LP Staking', 
    symbol: 'XDC-BBB LP',
    icon: "combined",
    getTokenLink: "https://icecreamswap.com/add/XDC/0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1?chain=xdc",
    hashTag: "#xdc-bbb"
  },
  { 
    id: 'lp-4', 
    pid: 4, 
    poolType: 'lp', 
    title: 'XDC-bpsXDC LP Staking', 
    symbol: 'XDC-bpsXDC LP',
    icon: "combined",
    getTokenLink: "https://icecreamswap.com/add/XDC/0x24be372f0915b8BAf17AfA150210FFcB79C88845?chain=xdc",
    hashTag: "#xdc-bpsxdc"
  },
];

const Stake = () => {
  const [data, setData] = useState({
    bbbPrice: 0,
    lpTokenPrice: 0,
    basePrice: 0, // BBB/XDC price ratio
    xdcPrice: 0, // XDC price in USD
    expandedPools: {}, // Track which pools are expanded
    sortBy: "apr", // apr, latest
    searchQuery: "", // Search keyword for filtering pools
  });

  // Pool APR values for sorting
  const [poolAPRs, setPoolAPRs] = useState({});

  const router = useRouter();

  // Handle hash-based navigation to expand specific pools
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (hash && POOL_HASH_MAP[hash]) {
        setData((prev) => ({
          ...prev,
          expandedPools: {
            ...prev.expandedPools,
            [POOL_HASH_MAP[hash]]: true,
          },
        }));

        // Scroll to the pool
        setTimeout(() => {
          const element = document.getElementById(POOL_HASH_MAP[hash]);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Handle hash on initial load
    handleHashChange();

    // Listen to hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load BBB and XDC prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const bbbPriceData = await getBBBPrice();
        const bbbPrice = bbbPriceData.price || 0;
        const basePrice = bbbPriceData.basePrice || 0; // BBB/XDC price ratio
        const xdcPrice = basePrice > 0 ? bbbPrice / basePrice : 0;

        setData((prev) => ({
          ...prev,
          bbbPrice: bbbPrice,
          basePrice: basePrice,
          xdcPrice: xdcPrice,
        }));
      } catch (error) {
        console.error("Error calculating prices:", error);
      }
    };

    fetchPrices();
  }, []);

  // Handle APR updates from pools (stabilized with useCallback)
  const handleAPRChange = useCallback((poolId, apr) => {
    setPoolAPRs(prev => {
      // Only update if the value actually changed to prevent unnecessary re-renders
      if (prev[poolId] === apr) return prev;
      return {
        ...prev,
        [poolId]: apr,
      };
    });
  }, []);

  // Add token to wallet function
  const addTokenToWallet = useCallback(async (tokenAddress, symbol, decimals = 18) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: decimals,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error adding token to wallet:", error);
    }
  }, []);

  // Apply sorting to pools
  const sortPools = (pools) => {
    if (data.sortBy === "latest") {
      return [...pools].reverse();
    }

    // Default to APR sorting (from high to low)
    return [...pools].sort((a, b) => {
      const aprA = poolAPRs[a.id] || 0;
      const aprB = poolAPRs[b.id] || 0;
      return aprB - aprA;
    });
  };

  // Apply filtering to pools
  const filterPools = (pools) => {
    if (!data.searchQuery.trim()) {
      return pools;
    }

    const searchTerm = data.searchQuery.toLowerCase().trim();

    return pools.filter((poolConfig) => {
      // Search by pool symbol
      const symbolMatch = poolConfig.symbol?.toLowerCase().includes(searchTerm);

      // For XDC-BBB LP, also search by "icelp"
      const contractSymbolMatch = poolConfig.pid === 3 && poolConfig.poolType === 'lp' && "icelp".includes(searchTerm);

      // Search by pool title
      const titleMatch = poolConfig.title.toLowerCase().includes(searchTerm);

      // Search by keywords
      const keywordMatch =
        (searchTerm.includes("xdc") &&
          (poolConfig.poolType === 'xdc' || poolConfig.symbol?.toLowerCase().includes("xdc"))) ||
        (searchTerm.includes("bbb") &&
          poolConfig.symbol?.toLowerCase().includes("bbb")) ||
        searchTerm.includes("stake") ||
        searchTerm.includes("staking") ||
        searchTerm.includes("restake") ||
        searchTerm.includes("restaking") ||
        (searchTerm.includes("lp") && poolConfig.pid === 3) ||
        (searchTerm.includes("icelp") && poolConfig.pid === 3);

      return symbolMatch || contractSymbolMatch || titleMatch || keywordMatch;
    });
  };

  // Apply sorting and filtering
  const sortedPools = sortPools(POOL_CONFIGS);
  const filteredPools = filterPools(sortedPools);

  return (
    <div className="m-auto md:w-3/4 w-full px-4 md:px-0 mt-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-green-600">Stake</h1>
        <div className="text-sm text-green-700">🌊 Stake to earn</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={data.sortBy}
            onChange={(e) =>
              setData((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px]"
          >
            <option value="apr">APR</option>
            <option value="latest">Latest</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Search:</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search pools..."
              value={data.searchQuery}
              onChange={(e) =>
                setData((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="px-3 py-1 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px]"
            />
            {data.searchQuery && (
              <button
                onClick={() =>
                  setData((prev) => ({ ...prev, searchQuery: "" }))
                }
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {data.searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredPools.length} pool
          {filteredPools.length !== 1 ? "s" : ""}
          {filteredPools.length > 0
            ? ` matching \`${data.searchQuery}\``
            : ` for \`${data.searchQuery}\``}
        </div>
      )}

      {filteredPools.length > 0 ? (
        filteredPools.map((poolConfig) => (
          <StakingPool
            key={poolConfig.id}
            pid={poolConfig.pid}
            poolType={poolConfig.poolType}
            poolConfig={poolConfig}
            data={data}
            setData={setData}
            addTokenToWallet={addTokenToWallet}
            bbbTokenAddress="0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1"
            onAPRChange={(apr) => handleAPRChange(poolConfig.id, apr)}
          />
        ))
      ) : data.searchQuery ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pools found
          </h3>
          <p className="text-gray-500 mb-4">
            No pools match your search for `{data.searchQuery}`
          </p>
          <button
            onClick={() => setData((prev) => ({ ...prev, searchQuery: "" }))}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Stake;
