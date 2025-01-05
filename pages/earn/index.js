import { useAccount, useChainId } from "wagmi";
import { useState, useEffect } from "react";
import { contracts } from "@/config";
import Link from "next/link";
import rpc from "@/components/Rpc";
import { usePrivy } from "@privy-io/react-auth";

const Earn = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { user, linkTwitter } = usePrivy();
  const linkedTwitter = user?.twitter;

  const [data, setData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mock leaderboard data - replace with actual data from API/contract
  const [leaderboard] = useState([
    { address: "0x1234...5678", points: 25000, rank: 1 },
    { address: "0x8765...4321", points: 18500, rank: 2 },
    { address: "0x9876...1234", points: 15200, rank: 3 },
    { address: "0x4321...8765", points: 12800, rank: 4 },
    { address: "0x5678...9012", points: 10500, rank: 5 },
  ]);

  useEffect(() => {
    const checkTradeEvent = async () => {
      if (address) {
        const user = await rpc.getEarn(address);
        const leaderboard = await rpc.getEarnLeaderboard();
        setData({ ...data, user, leaderboard });
      }
    };
    checkTradeEvent();
  }, [address]);

  const tradeEventJoined = data?.user?.join;
  const tasks = data?.user?.twitterTasks;
  const completedTasks = data?.user?.completedTasks;

  const handleJoinTradeEvent = async () => {
    if (!address) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await rpc.addTradeEvent(address);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const puser = data?.user;
  const rank = puser?.rank;
  const pleaderboard = data?.leaderboard?.list;

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      {/* Total Points Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg p-8 mb-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">
          {puser?.weekId} Total Points
        </h1>
        {tradeEventJoined ? (
          <>
            <div className="text-4xl font-bold mb-2">
              {Number(puser?.totalPoint||0)?.toLocaleString()}
            </div>
            <div className="text-sm opacity-80 mb-2">
              Earn more points by trading tokens
            </div>
            <div className="text-sm opacity-70 italic">
              (Points are updated every 5 minutes)
            </div>
            {completedTasks?.length === tasks?.length && tasks?.length > 0 && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2">
                🌟 1.5x Points Multiplier Active!
              </div>
            )}
          </>
        ) : (
          <div className="mt-4">
            {error && <div className="text-red-300 mb-2">{error}</div>}
            <button
              onClick={handleJoinTradeEvent}
              disabled={isSubmitting || !address}
              className="bg-white text-blue-500 px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Joining..." : "Join Trade Event"}
            </button>
            <div className="text-sm opacity-80 mt-4">
              Join the trade event to start earning points
            </div>
          </div>
        )}
      </div>

      {/* Trade to earn points */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{puser?.weekId} Trade to Earn Points</h2>
          <Link
            href="/markets"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Trade
          </Link>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Current Points from Trading</p>
            <p className="text-2xl font-bold">
              {Number(puser?.tradePoint||0)?.toLocaleString()} pts
            </p>
          </div>
          <p className="text-sm text-gray-500">
            * Only trading non-BBB and non-graduated tokens will earn points.
            Higher trading volume earns more points. Trading amount greater than
            1 XDC will be counted for points.
          </p>
        </div>
      </div>

      {/* Twitter Tasks */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{puser?.weekId} Twitter Tasks</h2>
          <div className="text-blue-500 font-bold">Bonus: 10,000 pts</div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Link X Account</p>
                {linkedTwitter && (
                  <p className="text-sm text-gray-500">
                    @{user?.twitter?.username}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  linkTwitter();
                }}
                disabled={linkedTwitter}
                className={`px-4 py-2 rounded ${
                  linkedTwitter
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } ${linkedTwitter ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {linkedTwitter ? "Completed" : "Complete"}
              </button>
            </div>
            {tasks?.map((item, index) => {
              let showType;
              if (item?.includes("/follow")) {
                showType = "Follow an X account";
              }
              if (item?.includes("/retweet")) {
                showType = "Repost an X post";
              }
              let completed = false;
              for (const c in completedTasks) {
                if (index == c) completed = true;
              }

              return (
                <div
                  className="flex items-center justify-between my-2"
                  key={index}
                >
                  <p className="font-medium">{showType}</p>
                  <div
                    disabled={completed}
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded ${
                      completed
                        ? "bg-green-500 text-white opacity-50 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={async () => {
                      setIsSubmitting(true);
                      await rpc.finishTwitterTasks(address, index);
                      window.open(item);
                      setIsSubmitting(false);
                    }}
                  >
                    {completed ? "Completed" : "Complete"}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            * Complete all Twitter tasks to get 10,000 bonus points and 1.5x
            points multiplier!
          </p>
        </div>
      </div>

      {/* Points Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{puser?.weekId} Points Leaderboard</h2>
        </div>
        <div className="space-y-3">
          {address && rank && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 mb-2">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rank == 1
                      ? "bg-yellow-400"
                      : rank == 2
                      ? "bg-gray-300"
                      : rank == 3
                      ? "bg-amber-600"
                      : "bg-gray-200"
                  } text-white font-bold`}
                >
                  {rank}
                </div>
                <div className="font-medium">{formatAddress(address)}</div>
              </div>
              <div className="font-bold text-lg">
                {Number(puser?.totalPoint)?.toLocaleString()} pts
              </div>
            </div>
          )}
          {pleaderboard?.map((user, index) => (
            <div
              key={user.account}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.account === address
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0
                      ? "bg-yellow-400"
                      : index === 1
                      ? "bg-gray-300"
                      : index === 2
                      ? "bg-amber-600"
                      : "bg-gray-200"
                  } text-white font-bold`}
                >
                  {user.rank}
                </div>
                <div className="font-medium">{formatAddress(user.account)}</div>
              </div>
              <div className="font-bold text-lg">
                {Number(user.totalPoint)?.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earn;
