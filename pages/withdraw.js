import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import SendButton from "@/components/SendButton";
import { parseEther } from "viem";

const Withdraw = () => {
  const [data, setData] = useState({});
  const [message, setMessage] = useState("");
  const { address } = useAccount();
  const { data: balance, refetch } = useBalance({ address: address });

  const send = {
    buttonName: "Confirm",
    data: {
      ...data,
      value: parseEther(data?.amount?.toString() || "0"),
    },
    callback: () => {
      refetch();
    },
  };

  const handleWithdrawAll = () => {
    const maxAmount = balance?.formatted
      ? (Number(balance.formatted) - 0.001).toFixed(3)
      : "0";
    setData({ ...data, amount: maxAmount });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
        <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">Send XDC</h1>

        <div className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Recipient Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={data?.to}
              onChange={(e) => setData({ ...data, to: e.target.value })}
              className="input input-bordered w-full focus:outline-none focus:border-emerald-500 hover:border-emerald-300 transition-colors bg-white"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Network</span>
            </label>
            <select className="select select-bordered w-full focus:outline-none focus:border-emerald-500 hover:border-emerald-300 transition-colors bg-white">
              <option disabled selected>XDC</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-emerald-700">Amount</span>
              <span className="label-text-alt text-emerald-600">
                Available: {Number(balance?.formatted)?.toLocaleString() || "0.00"} XDC
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 focus-within:border-emerald-500 hover:border-emerald-300 transition-colors bg-white">
              <input
                type="text"
                className="grow bg-transparent focus:outline-none"
                placeholder="0.00"
                value={data?.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
              />
              <div className="text-emerald-600">XDC</div>
              <button 
                className="btn btn-sm bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 text-emerald-700"
                onClick={handleWithdrawAll}
              >
                MAX
              </button>
            </label>
          </div>

          <SendButton 
            className="btn w-full text-lg h-12 mt-4 bg-emerald-600 hover:bg-emerald-700 border-none text-white" 
            {...send} 
          />

          {message && (
            <div className="alert bg-red-50 border-red-200 text-red-700 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
