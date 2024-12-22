import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { useAccount } from "wagmi";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
const TradeEvent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState({});

  const { address, isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  const handleWaitlistSubmit = async () => {
    setIsSubmitting(true);
    try {
      const error = await rpc.addTradeEvent(address);
      console.log(error);
      setData({ ...data, error });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchData() {
    const user = await rpc.getTradeEvent(address);
    setData({ ...data, user });
  }

  useEffect(() => {
    fetchData();
  }, [address, isSubmitting]);

  const user = data?.user;
  const error = data?.error;

  console.log(error);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        BBB Trading Event
      </h1>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-2">Trading Volume</h2>
          <p className="text-4xl font-bold text-green-700 mb-2">
            ${user?.totalTradeInUsd?.toLocaleString() || 0}
          </p>
          <p className="text-sm opacity-70">
            Current trading volume during the event period
          </p>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Event Details</h2>
          <p className="mb-4">During the event period, users who:</p>
          <div className="mb-4 space-y-2">
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Login using Phone, Email, or Google</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Generate a trading address</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Trade at least $50 worth of tokens (excluding BBB tokens)
              </span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Maintain a total asset value greater than $50</span>
            </div>
          </div>
          <div className="divider"></div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Event Period:</span> 2025.1.1 -
              2025.3.1
            </p>
            <p>
              <span className="font-semibold">Airdrop Distribution:</span> All
              airdrops will be distributed after the event ends
            </p>
            <p className="text-xs opacity-70">
              BBBPump reserves all rights for final interpretation of this event
            </p>
          </div>
          <p className="text-green-700 font-bold mt-4">
            Will receive BBB tokens as an airdrop!
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        {error && <div className="text-red-700">{error?.error}</div>}
        {isConnected && !user?.join && (
          <button
            className={`btn btn-success ${isSubmitting ? "loading" : ""}`}
            onClick={handleWaitlistSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Join Waitlist"}
          </button>
        )}
        {isConnected && user?.join && (
          <div
            className="btn"
            disabled
            onClick={() => {
              privyLogin();
            }}
          >
            Joined
          </div>
        )}
        {!isConnected && (
          <div
            className="btn"
            onClick={() => {
              privyLogin();
            }}
          >
            Log in
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeEvent;
