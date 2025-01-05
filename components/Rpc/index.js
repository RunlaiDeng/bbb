import { rpcUrl } from "@/config";

/**
 * @typedef {Object} RPCError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {*} [data] - Additional error data
 */

/**
 * Custom error class for RPC-related errors
 */
class RPCError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = "RPCError";
    this.code = code;
    this.data = data;
  }
}

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request controller for cancellation
const controller = new AbortController();

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sends an RPC request with retries and timeout
 * @param {string} method - RPC method name
 * @param {Array} params - RPC method parameters
 * @param {Object} options - Request options
 * @returns {Promise<*>} - Response data
 */
const send = async (method, params, options = {}) => {
  const {
    timeout = 30000,
    retries = 3,
    useCache = false,
    cacheTTL = CACHE_TTL,
    signal = controller.signal,
    debounceMs = 0,
  } = options;

  const cacheKey = useCache ? `${method}:${JSON.stringify(params)}` : null;

  const sendRequest = async () => {
    // Cache check logic
    if (useCache && cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < cacheTTL) {
        return data;
      }
      cache.delete(cacheKey);
    }

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method,
          params,
        }),
        signal,
        timeout,
      });

      if (!response.ok) {
        throw new RPCError("Network response was not ok", "NETWORK_ERROR", {
          status: response.status,
        });
      }

      const result = await response.json();

      if (result.error) {
        return { error: result.error };
      }

      // Cache successful response
      if (useCache) {
        cache.set(cacheKey, {
          data: result.result,
          timestamp: Date.now(),
        });
      }

      return result.result;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new RPCError("Request was cancelled", "REQUEST_CANCELLED");
      }
      throw error;
    }
  };

  // Apply debouncing if specified
  if (debounceMs > 0) {
    return debounce(sendRequest, debounceMs)();
  }

  return sendRequest();
};

/**
 * Get trade information
 * @param {number} index - Trade index
 * @returns {Promise<Object>} Trade data
 */
const getTrade = async (index) => {
  return send("getTrade", [index], { useCache: true });
};

/**
 * Get token holders
 * @param {string} token - Token address
 * @returns {Promise<Array>} Holders data
 */
const getHolders = async (token) => {
  return send("getHolders", [token], { useCache: true });
};

/**
 * Get message by chain ID and index
 * @param {string} chainid - Chain ID
 * @param {number} index - Message index
 * @returns {Promise<Object>} Message data
 */
const getMsg = async (chainid, index) => {
  return send("getMsg", [chainid, index]);
};

/**
 * Get token kline data
 * @param {string} token - Token address
 * @param {string} type - Kline type
 * @returns {Promise<Array>} Kline data
 */
const getKline = async (token, type) => {
  return send("getKline", [token, type], { useCache: true });
};

/**
 * Send a message
 * @param {string} chainid - Chain ID
 * @param {number} index - Message index
 * @param {string} msg - Message content
 * @param {string} address - Sender address
 * @returns {Promise<Object>} Response data
 */
const sendMsg = async (chainid, index, msg, address) => {
  return send("sendMsg", [chainid, index, msg, address]);
};

/**
 * Get tokens with pagination
 * @param {number} [sort=1] - Sort order
 * @param {number} [pageNumber=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {Object} [queryList] - Query parameters
 * @returns {Promise<Object>} Paginated tokens data
 */
const getTokens = async (
  sort = 1,
  pageNumber = 1,
  pageSize = 11,
  queryList
) => {
  return send("getTokens", [sort, pageNumber, pageSize, queryList], {
    useCache: true,
    cacheTTL: 60000, // 1 minute cache for tokens
  });
};

/**
 * Get referral information
 * @param {string} account - Account address
 * @returns {Promise<Object>} Referral data
 */
const getReferralInfo = async (account) => {
  return send("getReferralInfo", [account]);
};

/**
 * Get orders with filtering
 * @param {number} [sort=1] - Sort order
 * @param {number} [pageNumber=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} type - Order type
 * @param {string} account - Account address
 * @param {string} token - Token address
 * @returns {Promise<Object>} Filtered orders data
 */
const getOrders = async (
  sort = 1,
  pageNumber = 1,
  pageSize = 10,
  type,
  account,
  token
) => {
  return send("getOrders", [sort, pageNumber, pageSize, type, account, token]);
};

/**
 * Get statistics
 * @returns {Promise<Object>} Statistics data
 */
const getStats = async () => {
  return send("getStats", [], { useCache: true });
};

const getTradeEvent = async (account) => {
  return send("getTradeEvent", [account]);
};

const addTradeEvent = async (account) => {
  return send("addTradeEvent", [account]);
};

const getEarn = async (account) => {
  return send("getEarn", [account]);
};

const finishTwitterTasks = async (account, index) => {
  return send("finishTwitterTasks", [account, index]);
};

const getEarnLeaderboard = async (pageNumber = 1, pageSize = 9999) => {
  return send("getEarnLeaderboard", [pageNumber, pageSize]);
};

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, { timestamp }] of cache.entries()) {
    if (now - timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute

module.exports = {
  getTrade,
  getHolders,
  getMsg,
  getKline,
  sendMsg,
  getTokens,
  getReferralInfo,
  getOrders,
  getStats,
  getTradeEvent,
  addTradeEvent,
  getEarn,
  finishTwitterTasks,
  getEarnLeaderboard,
};
