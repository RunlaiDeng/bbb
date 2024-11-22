function formatNumber(num) {
  num = Number(num || 0);
  if (Math.abs(num) >= 1e12) {
    return (num / 1e12).toFixed(2) + "T";
  } else if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else {
    return num?.toFixed(2);
  }
}

const calculatePrice = (xdcAmount) => {
  return (Math.sqrt(xdcAmount / 2e7) / 1e9).toFixed(6) * 2;
};

const calculateXdcAmount = (supply) => {
  return (supply ** 2 / 2e7).toFixed(6);
};

const calculateSupply = (xdcAmount) => {
  return Math.sqrt(xdcAmount * 2e7).toFixed();
};

const getDateSpecifics = (timestamp) => {
  const date = new Date(timestamp * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
};

const getDate = (timestamp) => {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

const deleteSame = (list) => {
  const result = [];

  const timeMap = {};

  list?.forEach((item) => {
    const { time, close } = item;

    if (timeMap[time]) {
      timeMap[time].close = close;
    } else {
      timeMap[time] = item;
    }
  });

  for (const key in timeMap) {
    result.push(timeMap[key]);
  }
  return result;
};

async function setFollowing(index, isChecked) {
  if (typeof window !== "undefined" && index) {
    let following = localStorage.getItem("following");
    if (!following) {
      following = {};
    } else {
      following = JSON.parse(following);
    }

    following[index] = isChecked;
    localStorage.setItem("following", JSON.stringify(following));
  }
}

function getFollowing() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("following")) || {};
  }
}

function getBytesLength(str) {
  return new TextEncoder().encode(str).length;
}

function handleSrc(src) {
  const regex = /^https:\/\/benybadboy\.b-cdn\.net\/.*$/;
  return regex.test(src) ? src : "/didntupload.png";
}

function customToFixed(num) {
  let numStr = num.toLocaleString("fullwide", { useGrouping: false });
  let [intPart] = numStr.split(".");

  return intPart;
}

function sqrtPriceX96ToPrice(sqrtPriceX96) {
  const Q96 = BigInt(2) ** BigInt(96);

  const sqrtRatioX96Float = Number(sqrtPriceX96) / Number(Q96);

  const price = sqrtRatioX96Float ** 2;

  return 1 / price;
}

async function getERC20List(address) {
  try {
    const res = await fetch(
      "https://api.xdcscan.io/addresses/" + address + "/tokens?type=ERC-20"
    );
    const json = await res.json();
    return json;
  } catch (e) {
    return {};
  }
}

async function getXDCPrice() {
  try {
    const res = await fetch(
      "https://b.bitrue.com/kline-api/ticker?symbol=xdcusdt"
    );
    const json = await res.json();
    const item = json?.data?.ticker;
    return { price: item?.c || 0, priceChange24h: item?.r };
  } catch (e) {
    return { price: 0, priceChange24h: 0 };
  }
}
function modifyNumber(num) {
  const dst = 10000;
  if (num > dst) {
    (BigInt(num) / BigInt(dst)) * BigInt(dst);
    return Math.floor(num / dst) * dst;
  }
  return num?.toString();
}

async function getQuoteFromIcecreamswap(src, dst, amount) {
  try {
    const res = await fetch(
      "https://aggregator.icecreamswap.com/50?src=" +
        src +
        "&dst=" +
        dst +
        "&amount=" +
        amount
    );
    const json = await res.json();
    return json;
  } catch (e) {
    return {};
  }
}

async function getKline(pool) {
  try {
    const res = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/xdc/pools/" +
        pool +
        "/ohlcv/day?aggregate=1&limit=1000"
    );
    const json = await res.json();
    return json?.data?.attributes?.ohlcv_list;
  } catch (e) {
    return [];
  }
}

async function getBBBPrice() {
  try {
    const res = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/xdc/pools/0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e?include=dex"
    );
    const json = await res.json();
    const item = json?.data?.attributes;

    return {
      price: item?.base_token_price_usd || 0,
      priceChange24h: item?.price_change_percentage?.h24 / 100 || 0,
      cap: item?.market_cap_usd || 0,
      volumeH24: item?.volume_usd?.h24,
    };
  } catch (e) {
    return { price: 0, priceChange24h: 0, cap: 0, volumeH24: 0 };
  }
}

function aggregateTo5MinuteCandles(rawData) {
  return rawData;
}

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
  getQuoteFromIcecreamswap,
};
