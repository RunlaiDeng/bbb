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

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          BBB Trading Event
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🎯 Trade tokens to earn BBB airdrop rewards
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100 text-gray-700">
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Your Trading Volume</p>
            <p className="text-4xl font-bold text-green-600">
              ${user?.totalTradeInUsd?.toLocaleString() || 0}
            </p>
          </div>

          <div className="mt-6">
            {error && <div className="text-red-500 mb-4">{error?.error}</div>}
            {isConnected && !user?.join && (
              <button
                className={`btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${
                  isSubmitting ? "loading" : ""
                }`}
                onClick={handleWaitlistSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join Event"}
              </button>
            )}
            {isConnected && user?.join && (
              <button
                className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white opacity-50 cursor-not-allowed"
                disabled
              >
                Already Joined
              </button>
            )}
            {!isConnected && (
              <button
                className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={privyLogin}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
          Event Details
        </h2>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              Eligibility Requirements
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-green-500">•</span>
                <span>Login using Phone, Email, or Google</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-green-500">•</span>
                <span>
                  Trade at least $50 worth of tokens (excluding BBB tokens and
                  graduated tokens)
                </span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <span className="text-green-500">•</span>
                <span>Maintain a total asset value greater than $50</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              Event Information
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Event Period:</span>
                <span>2025.1.1 - 2025.3.1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Airdrop Distribution:</span>
                <span>After event ends</span>
              </div>
              <div className="text-sm text-gray-500 mt-4 italic">
                BBBPump reserves all rights for final interpretation of this
                event
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">🎁</span>
              <span className="text-lg font-semibold text-green-600">
                Will receive BBB tokens as an airdrop!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeEvent;
