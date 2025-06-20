import { useState } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import SendButton from "@/components/SendButton";
import WriteButton from "@/components/WriteButton";
import { parseEther, parseUnits, formatUnits } from "viem";
import { contracts } from "@/config";
import ERC20ABI from "@/abi/ERC20ABI.json";

const Withdraw = () => {
  const [data, setData] = useState({ selectedToken: "XDC" });
  const [message, setMessage] = useState("");
  const { address } = useAccount();
  const chainId = useChainId();
  
  // Get BBB token contract info
  const bbbContract = contracts[chainId]?.bbb;
  
  // XDC balance
  const { data: xdcBalance, refetch: refetchXDC } = useBalance({ 
    address: address 
  });
  
  // BBB balance
  const { data: bbbBalance, refetch: refetchBBB } = useBalance({
    address: address,
    token: bbbContract?.address,
    query: {
      enabled: !!bbbContract?.address,
    },
  });

  // Token configurations
  const tokens = {
    XDC: {
      symbol: "XDC",
      decimals: 18,
      balance: xdcBalance,
      isNative: true,
    },
    BBB: {
      symbol: "BBB", 
      decimals: 18,
      balance: bbbBalance,
      isNative: false,
      address: bbbContract?.address,
      abi: ERC20ABI,
    },
  };

  const selectedTokenConfig = tokens[data.selectedToken];
  const currentBalance = selectedTokenConfig?.balance;

  // Create send transaction data
  const createSendData = () => {
    if (data.selectedToken === "XDC") {
      // Native XDC transfer
      return {
        to: data.to,
        value: parseEther(data?.amount?.toString() || "0"),
      };
    } else {
      // ERC20 BBB transfer
      return {
        address: selectedTokenConfig.address,
        abi: selectedTokenConfig.abi,
        functionName: "transfer",
        args: [
          data.to,
          parseUnits(data?.amount?.toString() || "0", selectedTokenConfig.decimals),
        ],
      };
    }
  };

  const send = {
    buttonName: "Confirm Transfer",
    data: createSendData(),
    callback: () => {
      refetchXDC();
      refetchBBB();
      setData({ ...data, amount: "", to: "" });
    },
  };

  const handleWithdrawAll = () => {
    if (!currentBalance?.formatted) return;
    
    let maxAmount;
    if (data.selectedToken === "XDC") {
      // For XDC, subtract gas fee
      maxAmount = (Number(currentBalance.formatted) - 0.001).toFixed(6);
    } else {
      // For BBB, can use full balance
      maxAmount = Number(currentBalance.formatted).toFixed(6);
    }
    
    if (Number(maxAmount) > 0) {
      setData({ ...data, amount: maxAmount });
    }
  };

  const handleTokenChange = (tokenSymbol) => {
    setData({ 
      ...data, 
      selectedToken: tokenSymbol,
      amount: "" // Clear amount when switching tokens
    });
  };

  // Check if transfer is valid
  const isValidTransfer = () => {
    if (!data.to || !data.amount) return false;
    if (!currentBalance?.formatted) return false;
    
    const amount = Number(data.amount);
    const balance = Number(currentBalance.formatted);
    
    if (data.selectedToken === "XDC") {
      // For XDC, ensure enough for gas
      return amount > 0 && amount <= (balance - 0.001);
    } else {
      // For BBB, can use full balance
      return amount > 0 && amount <= balance;
    }
  };

  // For BBB transfers, we need to check if it's a native send or WriteButton
  const renderTransferButton = () => {
    if (data.selectedToken === "XDC") {
      return (
        <SendButton 
          className="btn w-full text-lg h-12 mt-4 bg-emerald-600 hover:bg-emerald-700 border-none text-white disabled:bg-gray-400" 
          disabled={!isValidTransfer()}
          {...send} 
        />
      );
    } else {
      return (
        <WriteButton
          className="btn w-full text-lg h-12 mt-4 bg-emerald-600 hover:bg-emerald-700 border-none text-white disabled:bg-gray-400"
          disabled={!isValidTransfer()}
          buttonName="Confirm Transfer"
          data={createSendData()}
          callback={send.callback}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
        <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">Send Tokens</h1>

        <div className="space-y-6">
          {/* Token Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Select Token</span>
            </label>
            <div className="flex gap-2">
              {Object.entries(tokens).map(([key, token]) => (
                <button
                  key={key}
                  className={`btn flex-1 ${
                    data.selectedToken === key 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                  onClick={() => handleTokenChange(key)}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Recipient Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={data?.to || ""}
              onChange={(e) => setData({ ...data, to: e.target.value })}
              className="input input-bordered w-full focus:outline-none focus:border-emerald-500 hover:border-emerald-300 transition-colors bg-white"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Amount</span>
              <span className="label-text-alt text-emerald-600">
                Available: {Number(currentBalance?.formatted || 0)?.toLocaleString()} {selectedTokenConfig?.symbol}
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 focus-within:border-emerald-500 hover:border-emerald-300 transition-colors bg-white">
              <input
                type="text"
                className="grow bg-transparent focus:outline-none"
                placeholder="0.00"
                value={data?.amount || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setData({ ...data, amount: value });
                  }
                }}
              />
              <div className="text-emerald-600">{selectedTokenConfig?.symbol}</div>
              <button 
                className="btn btn-sm bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-700"
                onClick={handleWithdrawAll}
                disabled={!currentBalance?.formatted}
              >
                MAX
              </button>
            </label>
          </div>

          {renderTransferButton()}

          {message && (
            <div className="alert bg-red-50 border-red-200 text-red-700 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {/* Balance Display */}
          <div className="bg-emerald-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-emerald-800 mb-3">Wallet Balance</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">XDC:</span>
                <span className="font-medium text-emerald-800">
                  {Number(xdcBalance?.formatted || 0).toLocaleString()} XDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">BBB:</span>
                <span className="font-medium text-emerald-800">
                  {Number(bbbBalance?.formatted || 0).toLocaleString()} BBB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
