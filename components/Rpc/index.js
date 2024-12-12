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
    this.name = 'RPCError';
    this.code = code;
    this.data = data;
  }
}

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Sends an RPC request with retries and timeout
 * @param {string} method - RPC method name
 * @param {Array} params - RPC method parameters
 * @param {Object} options - Request options
 * @returns {Promise<*>} - Response data
 */
const send = async (method, params, options = {}) => {
  const {
    timeout = 30000, // 30 seconds
    retries = 3,
    useCache = false,
    cacheTTL = CACHE_TTL,
  } = options;

  // Generate cache key if caching is enabled
  const cacheKey = useCache ? `${method}:${JSON.stringify(params)}` : null;
  
  // Check cache
  if (useCache && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < cacheTTL) {
      return data;
    }
    cache.delete(cacheKey);
  }

  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params: params || [],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return { 
          error: {
            code: response.status,
            message: `HTTP error ${response.status}`,
            data: { status: response.status }
          }
        };
      }

      const result = await response.json();

      // If there's an error in the result, return the entire result
      if (result.error) {
        return result;
      }

      // Cache successful response if caching is enabled
      if (useCache) {
        cache.set(cacheKey, {
          data: result.result,
          timestamp: Date.now(),
        });
      }

      return result.result;
    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') {
        return { 
          error: {
            code: 'TIMEOUT',
            message: 'Request timeout',
            data: null
          }
        };
      }
      // Only retry on network errors or 5xx server errors
      if (i === retries - 1 || (!error.status || error.status < 500)) {
        return { 
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
            data: error
          }
        };
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  return { 
    error: {
      code: 'MAX_RETRIES',
      message: 'Maximum retries exceeded',
      data: lastError
    }
  };
};

/**
 * Get trade information
 * @param {number} index - Trade index
 * @returns {Promise<Object>} Trade data
 */
const getTrade = async (index) => {
  return send('getTrade', [index], { useCache: true });
};

/**
 * Get token holders
 * @param {string} token - Token address
 * @returns {Promise<Array>} Holders data
 */
const getHolders = async (token) => {
  return send('getHolders', [token], { useCache: true });
};

/**
 * Get message by chain ID and index
 * @param {string} chainid - Chain ID
 * @param {number} index - Message index
 * @returns {Promise<Object>} Message data
 */
const getMsg = async (chainid, index) => {
  return send('getMsg', [chainid, index]);
};

/**
 * Get token kline data
 * @param {string} token - Token address
 * @param {string} type - Kline type
 * @returns {Promise<Array>} Kline data
 */
const getKline = async (token, type) => {
  return send('getKline', [token, type], { useCache: true });
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
  return send('sendMsg', [chainid, index, msg, address]);
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
  pageSize = 10,
  queryList
) => {
  return send('getTokens', [sort, pageNumber, pageSize, queryList], {
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
  return send('getReferralInfo', [account]);
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
  return send('getOrders', [sort, pageNumber, pageSize, type, account, token]);
};

/**
 * Get statistics
 * @returns {Promise<Object>} Statistics data
 */
const getStats = async () => {
  return send('getStats', [], { useCache: true });
};

/**
 * Start live data stream
 * @param {number} index - Stream index
 * @returns {Promise<Object>} Stream start response
 */
const startLive = async (index) => {
  return send('startLive', [index]);
};

/**
 * Stop live data stream
 * @param {number} index - Stream index
 * @returns {Promise<Object>} Stream stop response
 */
const stopLive = async (index) => {
  return send('stopLive', [index]);
};

/**
 * Get live data
 * @param {number} index - Stream index
 * @returns {Promise<Object>} Live data
 */
const getLive = async (index) => {
  return send('getLive', [index]);
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
  startLive,
  stopLive,
  getLive,
};
