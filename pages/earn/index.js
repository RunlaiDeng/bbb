import { useAccount, useChainId } from "wagmi";
import { useState, useEffect } from "react";
import { contracts } from "@/config";
import Link from "next/link";
import Image from "next/image";
import rpc from "@/components/Rpc";
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";

const FavIcon = () => (
  <div className="bg-white rounded-full p-1.5 inline-flex hover:scale-125 transition-transform duration-300 cursor-pointer mr-2">
    <Image
      src="/favicon.ico"
      width={32}
      height={32}
      alt="Fav Icon"
      className="inline-block"
    />
  </div>
);

const Earn = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { user, linkTwitter } = usePrivy();
  const linkedTwitter = user?.twitter;

  const [data, setData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkTradeEvent = async () => {
      let user = await rpc.getEarn(address);

      const leaderboard = await rpc.getEarnLeaderboard();
      setData({ ...data, user, leaderboard });
    };
    checkTradeEvent();
  }, [address, isSubmitting]);

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

  console.log(data);

  const privyLogin = usePrivyLogin();

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      {/* Total Points Display */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          {puser?.weekId} Total Points
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🎯 All points earned will be counted towards BBB airdrop in Q3-Q4 2025
        </div>
        {tradeEventJoined ? (
          <>
            <div className="text-5xl font-bold mb-4 drop-shadow-lg flex items-center justify-center">
              <FavIcon />
              {Number(puser?.totalPoint || 0)?.toLocaleString()}{" "}
              <span className="ml-2 text-sm">cps</span>
            </div>
            <div className="text-lg opacity-90 mb-2">
              Earn more points by trading tokens
            </div>

            {completedTasks?.length === tasks?.length && tasks?.length > 0 && (
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl mt-3 shadow-lg">
                🌟 1.5x Points Multiplier Active!
              </div>
            )}
          </>
        ) : (
          <div className="mt-6">
            {error && <div className="text-red-300 mb-3">{error}</div>}
            {isConnected && (
              <button
                onClick={handleJoinTradeEvent}
                disabled={isSubmitting || !address}
                className="cursor-pointer bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all disabled:opacity-50 shadow-lg transform hover:-translate-y-1"
              >
                {isSubmitting ? "Joining..." : "Join Trade Event"}
              </button>
            )}
            {!isConnected && (
              <button
                onClick={privyLogin}
                className="cursor-pointer bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all disabled:opacity-50 shadow-lg transform hover:-translate-y-1"
              >
                Log in
              </button>
            )}
            <div className="text-sm opacity-90 mt-4">
              Join the trade event to start earning points
            </div>
          </div>
        )}
      </div>

      {/* Trade to earn points */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
            {puser?.weekId} Trade to Earn Points
          </h2>
          <Link
            href="/markets"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Go to Trade
          </Link>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <p className="text-gray-600 mb-2">Current Points from Trading</p>
            <p className="text-3xl font-bold text-green-600 flex items-center">
              <FavIcon />
              {Number(puser?.tradePoint || 0)?.toLocaleString()}{" "}
              <span className="ml-2 text-sm">cps</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            * Only trading non-BBB and non-graduated tokens will earn points.
            Higher trading volume earns more points. Trading amount greater than
            1 XDC will be counted for points.
          </p>
        </div>
      </div>

      {/* Twitter Tasks */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
            {puser?.weekId} Twitter Tasks
          </h2>
          <div className="text-green-600 font-bold text-lg">
            Bonus: 10,000 <span className="ml-1 text-sm">cps</span>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 mb-1">Link X Account</p>
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
                disabled={linkedTwitter || !tradeEventJoined}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  linkedTwitter || !tradeEventJoined
                    ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1"
                }`}
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
                    disabled={completed || !tradeEventJoined}
                    href={item}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                      completed || !tradeEventJoined
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 cursor-pointer "
                    }`}
                    onClick={async () => {
                      if (!tradeEventJoined) return;
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
          <p className="text-sm text-gray-500 leading-relaxed">
            * Complete all Twitter tasks to get 10,000 bonus points and 1.5x
            points multiplier!
          </p>
        </div>
      </div>

      {/* Points Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
            {puser?.weekId} Points Leaderboard
          </h2>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-green-100 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <span className="text-emerald-500 text-2xl mr-3">🏆</span>
            <span className="font-semibold text-lg text-emerald-700">
              Weekly Rewards
            </span>
          </div>
          <p className="text-emerald-600 mt-2 leading-relaxed">
            Top 10 participants each week will receive special airdrop rewards!
          </p>
        </div>
        <div className="space-y-4">
          {address && rank && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-green-200">
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
              <div className="font-bold text-lg flex items-center">
                <FavIcon />
                {Number(puser?.totalPoint)?.toLocaleString()}{" "}
                <span className="ml-2 text-sm">cps</span>
              </div>
            </div>
          )}
          <div className="divider my-1"></div>
          {pleaderboard?.map((user, index) => (
            <div
              key={user.account}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.account === address
                  ? "bg-emerald-50 border border-green-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user.rank == 1
                      ? "bg-yellow-400"
                      : user.rank == 2
                      ? "bg-gray-300"
                      : user.rank == 3
                      ? "bg-amber-600"
                      : "bg-gray-200"
                  } text-white font-bold`}
                >
                  {user.rank}
                </div>
                <div className="font-medium">{formatAddress(user.account)}</div>
              </div>
              <div className="font-bold text-lg flex items-center">
                <FavIcon />
                {Number(user.totalPoint)?.toLocaleString()}{" "}
                <span className="ml-2 text-sm">cps</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Earn;
