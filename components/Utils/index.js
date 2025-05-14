function formatNumber(num) {
  if (!num && num !== 0) return "0.00";
  num = Number(num);
  const absNum = Math.abs(num);
  const formats = [
    { threshold: 1e12, suffix: "T", divisor: 1e12 },
    { threshold: 1e9, suffix: "B", divisor: 1e9 },
    { threshold: 1e6, suffix: "M", divisor: 1e6 },
    { threshold: 1e3, suffix: "K", divisor: 1e3 },
  ];

  for (const { threshold, suffix, divisor } of formats) {
    if (absNum >= threshold) {
      return `${(num / divisor).toFixed(2)}${suffix}`;
    }
  }
  return num.toFixed(2);
}

const calculatePrice = (xdcAmount) => {
  if (!xdcAmount) return 0;
  const BASE = 2e7;
  const PRECISION = 1e9;
  return ((Math.sqrt(xdcAmount / BASE) / PRECISION) * 2).toFixed(6);
};

const calculateXdcAmount = (supply) => {
  if (!supply) return 0;
  const BASE = 2e7;
  return (supply ** 2 / BASE).toFixed(6);
};

const calculateSupply = (xdcAmount) => {
  if (!xdcAmount) return 0;
  const BASE = 2e7;
  return Math.sqrt(xdcAmount * BASE).toFixed();
};

const getDateSpecifics = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp) * 1000);
  const pad = (num) => String(num).padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

const deleteSame = (list) => {
  if (!Array.isArray(list) || !list.length) return [];

  return Object.values(
    list.reduce((acc, item) => {
      const { time, close } = item;
      if (time) {
        acc[time] = { ...acc[time], ...item, close };
      }
      return acc;
    }, {})
  );
};

const setFollowing = async (index, isChecked) => {
  if (typeof window === "undefined" || !index) return;

  try {
    const following = JSON.parse(localStorage.getItem("following") || "{}");
    following[index] = isChecked;
    localStorage.setItem("following", JSON.stringify(following));
  } catch (error) {
    console.error("Error setting following:", error);
  }
};

const getFollowing = () => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem("following")) || {};
  } catch (error) {
    console.error("Error getting following:", error);
    return {};
  }
};

const getBytesLength = (str) => {
  if (typeof str !== "string") return 0;
  return new TextEncoder().encode(str).length;
};

const handleSrc = (src) => {
  if (!src) return "/loading.svg";
  const CDN_REGEX = /^https:\/\/benybadboy\.b-cdn\.net\/.*$/;
  return CDN_REGEX.test(src) || src == "/bbb.jpg" ? src : "/loading.svg";
};

const customToFixed = (num) => {
  if (!num) return "0";
  try {
    return num.toLocaleString("fullwide", { useGrouping: false }).split(".")[0];
  } catch (error) {
    console.error("Error in customToFixed:", error);
    return "0";
  }
};

const sqrtPriceX96ToPrice = (sqrtPriceX96) => {
  if (!sqrtPriceX96) return 0;
  try {
    const Q96 = BigInt(2) ** BigInt(96);
    const sqrtRatioX96Float = Number(sqrtPriceX96) / Number(Q96);
    return 1 / sqrtRatioX96Float ** 2;
  } catch (error) {
    console.error("Error in sqrtPriceX96ToPrice:", error);
    return 0;
  }
};

const API_ENDPOINTS = {
  GECKOTERMINAL: "https://api.geckoterminal.com/api/v2",
  XDCSCAN: "https://api.xdcscan.io",
  ICECREAMSWAP: "https://aggregator.icecreamswap.com/50",
};

const send = async (url, params = {}) => {
  const defaultHeaders = {
    Accept: "application/json;version=20230302",
  };

  try {
    const response = await fetch(url, {
      ...params,
      headers: { ...defaultHeaders, ...params.headers },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

const getPool = async (token) => {
  if (!token) return {};
  try {
    const json = await send(
      `${API_ENDPOINTS.GECKOTERMINAL}/networks/xdc/tokens/${token}/pools?page=1`
    );
    return json?.data?.[0]?.attributes || {};
  } catch (error) {
    console.error("Error getting pool:", error);
    return {};
  }
};

const getERC20List = async (address) => {
  if (!address) return {};
  try {
    return await send(
      `${API_ENDPOINTS.XDCSCAN}/addresses/${address}/tokens?type=ERC-20`
    );
  } catch (error) {
    console.error("Error getting ERC20 list:", error);
    return {};
  }
};

const getXDCPrice = async () =>
  getPrice("0xfcabba53dac7b6b19714c7d741a46f6dad260107");

const getQuoteFromPool = async (src, dst, amount, address) => {
  if (!src || !dst || !amount) return {};
  try {
    return await send(
      `${API_ENDPOINTS.ICECREAMSWAP}?src=${src}&dst=${dst}&amount=${amount}&slippage=99&from=${address}&convenienceFee=1&convenienceFeeRecipient=0x2475dcd4fe333be814ef7c8f8ce8a1e9b5fcdea0`
    );
  } catch (error) {
    console.error("Error getting quote from pool:", error);
    return {};
  }
};

const getKline = async (pool) => {
  if (!pool) return [];
  try {
    const json = await send(
      `${API_ENDPOINTS.GECKOTERMINAL}/networks/xdc/pools/${pool}/ohlcv/day?aggregate=1&limit=1000`
    );
    return json?.data?.attributes?.ohlcv_list || [];
  } catch (error) {
    console.error("Error getting kline:", error);
    return [];
  }
};

const getPrice = async (pool) => {
  if (!pool) return { price: 0, priceChange24h: 0, cap: 0, volumeH24: 0 };
  try {
    const json = await send(
      `${API_ENDPOINTS.GECKOTERMINAL}/networks/xdc/pools/${pool}?include=dex`
    );
    const item = json?.data?.attributes;
    return {
      price: item?.base_token_price_usd || 0,
      basePrice: item?.base_token_price_native_currency || 0,
      priceChange24h: (item?.price_change_percentage?.h24 || 0) / 100,
      cap: item?.market_cap_usd || 0,
      volumeH24: item?.volume_usd?.h24 || 0,
    };
  } catch (error) {
    console.error("Error getting price:", error);
    return { price: 0, priceChange24h: 0, cap: 0, volumeH24: 0 };
  }
};

const getBBBPrice = async () =>
  getPrice("0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e");

const aggregateTo5MinuteCandles = (rawData) => {
  return rawData;
};

module.exports = {
  getDate,
  formatNumber,
  deleteSame,
  calculatePrice,
  setFollowing,
  getFollowing,
  getBytesLength,
  handleSrc,
  customToFixed,
  calculateSupply,
  calculateXdcAmount,
  sqrtPriceX96ToPrice,
  getXDCPrice,
  aggregateTo5MinuteCandles,
  getERC20List,
  getBBBPrice,
  getDateSpecifics,
  getKline,
  getQuoteFromPool,
  getPrice,
  getPool,
};
