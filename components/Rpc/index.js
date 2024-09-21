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

const findTokens = async () => {
  return send("findTokens", []);
};

const addToken = async (
  txHash,
  image,
  description,
  website,
  twitter,
  telegram
) => {
  return send("addToken", [
    txHash,
    image,
    description,
    website,
    twitter,
    telegram,
  ]);
};

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch(rpcUrl + "/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("success:", result);
      return rpcUrl + "/uploads/" + result?.fileName;
    } else {
      console.error("failure:", response.statusText);
    }
  } catch (error) {
    console.error("error:", error);
  }
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
  uploadImage,
  addToken,
  findTokens,
};
