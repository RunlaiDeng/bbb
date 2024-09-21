import { rpcUrl } from "@/config";
const getTrade = async (index) => {
  return send("getTrade", [index]);
};

const getHolders = async (token) => {
  return send("getHolders", [token]);
};

const getMsg = async (index) => {
  return send("getMsg", [index]);
};

const sendMsg = async (index, msg) => {
  return send("sendMsg", [index, msg]);
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
};
