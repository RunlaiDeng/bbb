import { rpcUrl } from "@/config";
const getTrade = async (index) => {
  return send("getTrade", [index]);
};

const getHolders = async (token) => {
  return send("getHolders", [token]);
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
    return { error: e.message };
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
};
