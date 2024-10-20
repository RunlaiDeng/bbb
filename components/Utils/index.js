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

module.exports = {
  getDate,
  formatNumber,
  deleteSame,
  calculatePrice,
  setFollowing,
  getFollowing,
};
