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

const getTokens = async (sort) => {
  return send("getTokens", [sort]);
};
const uploadFile = async (file) => {
  const formData = new FormData(); //
  formData.append("file", file);
  let res;
  try {
    res = await fetch(rpcUrl + "/uploadFile", {
      method: "POST",
      body: formData,
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
  uploadFile,
  getTokens,
};
