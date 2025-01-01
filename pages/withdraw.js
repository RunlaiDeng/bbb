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
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-4">Send XDC</h1>

      <label className="w-full max-w-xs mb-2">Address</label>
      <input
        type="text"
        placeholder="0x..."
        value={data?.to}
        onChange={(e) => setData({ ...data, to: e.target.value })}
        className="input input-bordered w-full max-w-xs mb-2"
      />

      <label className="w-full max-w-xs mb-2">Network</label>
      <select className="select select-bordered w-full max-w-xs mb-2">
        <option disabled selected>
          XDC
        </option>
      </select>

      <label className="w-full max-w-xs mb-2">Amount</label>
      <label className="input input-bordered flex items-center w-full max-w-xs gap-1">
        <input
          type="text"
          className="grow"
          placeholder="0.00"
          value={data?.amount}
          onChange={(e) => setData({ ...data, amount: e.target.value })}
        />
        <div>XDC</div>

        <button className="btn btn-sm" onClick={handleWithdrawAll}>
          All
        </button>
      </label>

      <div className="w-full max-w-xs mb-4">
        <p>
          Available: {Number(balance?.formatted)?.toLocaleString() || "0.00"}{" "}
          XDC
        </p>
      </div>

      <SendButton className="btn btn-success w-full max-w-xs" {...send} />

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Withdraw;
