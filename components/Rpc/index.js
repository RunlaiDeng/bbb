import { rpcUrl } from "@/config";
const getTrade = async (index) => {
  return send("getTrade", [index]);
};

const getHolders = async (token) => {
  return send("getHolders", [token]);
};

const getMsg = async (chainid, index) => {
  return send("getMsg", [chainid, index]);
};

const sendMsg = async (chainid, index, msg, address) => {
  return send("sendMsg", [chainid, index, msg, address]);
};

const getTokens = async (sort = 1, pageNumber = 1, pageSize = 10) => {
  return send("getTokens", [sort, pageNumber, pageSize]);
};

const getReferralInfo = async (account) => {
  return send("getRefferalInfo", [account]);
};

const send = async (method, params) => {
  let res;
  try {
    res = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: 1,
      }),
    });
  } catch (e) {
    return undefined;
  }

  const json = await res?.json();

  if (json?.error) {
    return { error: json.error };
  }
  return json?.["result"];
};

module.exports = {
  getTrade,
  getHolders,
  getMsg,
  sendMsg,
  getReferralInfo,
  getTokens,
};
