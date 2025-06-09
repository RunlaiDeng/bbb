import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getUSDBDepositLeaderboard } from "@/components/Rpc";

const Quests = () => {
  const router = useRouter();

  // State for leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardInfo, setLeaderboardInfo] = useState(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // You can adjust these timestamps as needed for the competition period
        const startTimestamp = new Date("2025-06-10").getTime() / 1000;
        const endTimestamp = new Date("2025-06-30").getTime() / 1000;

        const response = await getUSDBDepositLeaderboard(
          1,
          20,
          startTimestamp,
          endTimestamp
        );

        if (response.error) {
          setError(response.error.message || "Failed to fetch leaderboard");
          return;
        }

        // Process the data and add reward information
        const processedData = response.list.map((item) => {
          let reward = "$50 BBB"; // Default for rank 11-20
          if (item.rank >= 1 && item.rank <= 3) {
            reward = "$200 BBB";
          } else if (item.rank >= 4 && item.rank <= 10) {
            reward = "$100 BBB";
          }

          return {
            rank: item.rank,
            address: `${item.user.slice(0, 6)}...${item.user.slice(-4)}`,
            fullAddress: item.user,
            amount: item.totalAmountFormatted,
            reward: reward,
          };
        });

        setLeaderboard(processedData);
        setLeaderboardInfo({
          totalUsers: response.totalUsers,
          totalDeposits: response.totalDeposits,
          pageNumber: response.pageNumber,
          totalSize: response.totalSize,
        });
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to get reward based on rank
  const getRewardByRank = (rank) => {
    if (rank >= 1 && rank <= 3) return "$200 BBB";
    if (rank >= 4 && rank <= 10) return "$100 BBB";
    if (rank >= 11 && rank <= 20) return "$50 BBB";
    return "No Reward";
  };

  return (
    <div className="m-auto md:w-4/5 w-96 mt-2 pb-1">
      {/* Main Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('/bbbbirthday.jpg')",
          }}
        />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
            🎉 BBB Anniversary Celebration 🎉
          </h1>
        </div>
      </div>

      {/* BBB History Story */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎂 One Year of BBB
          </h2>
          <p className="text-gray-500">
            A journey that started with laughter, grew with love
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg">
            <span className="font-medium text-gray-800">June 10, 2024</span> -
            It all began as a joke between colleagues. A simple meme coin
            launched on xdc.sale with nothing but hope and humor.
          </p>

          <p>
            But then something magical happened. The community embraced BBB with
            open arms. From{" "}
            <span className="font-medium text-green-600">$20,000</span> to an
            incredible
            <span className="font-medium text-green-600">
              {" "}
              $15 million
            </span>{" "}
            market cap - you showed us that dreams really do come true.
          </p>

          <p>
            Together, we built more than just a token. We created an ecosystem:
            <span className="text-gray-800 font-medium">
              {" "}
              BBBPump, Staking, Airdrops, Liquidity Mining, bpsXDC, and USDB
            </span>
            . Each product born from our shared vision of financial freedom.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400 my-8">
            <p className="text-lg text-gray-700 italic">
              &ldquo;Our vision is to increase the freedom of money globally. We
              believe that by spreading this freedom, we can significantly
              improve lives around the world.&rdquo;
            </p>
          </div>

          <p className="text-center text-lg">
            <span className="text-red-500">❤️</span>
            <span className="font-medium text-gray-800"> Thank you</span> to
            everyone who believed in us, supported us, and grew with us. This
            anniversary belongs to
            <span className="font-medium text-gray-800"> all of us</span>.
          </p>

          <div className="text-center pt-4">
            <span className="text-3xl">🙏</span>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        {/* Activity Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏆</span>
            <h2 className="text-2xl font-bold text-gray-800">
              USDB Deposit Competition
            </h2>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-lg font-medium mb-2 text-gray-700">
              📅 Event Period: June 10 - June 30, 2024
            </p>
            <p className="text-base text-gray-600">
              💰 Deposit USDB to compete in rankings and win generous BBB
              rewards!
            </p>
          </div>
        </div>

        {/* Reward Rules */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Reward Structure
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">
                  🥇 Rank 1-3
                </div>
                <div className="text-lg font-medium text-green-600">
                  $200 USD BBB
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">
                  🥈 Rank 4-10
                </div>
                <div className="text-lg font-medium text-green-600">
                  $100 USD BBB
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 p-4 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700 mb-2">
                  🥉 Rank 11-20
                </div>
                <div className="text-lg font-medium text-green-600">
                  $50 USD BBB
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Live Leaderboard
            {leaderboardInfo && (
              <span className="text-sm font-normal text-gray-500">
                ({leaderboardInfo.totalUsers} participants)
              </span>
            )}
          </h3>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <span>⚠️</span>
                <span className="font-medium">Error loading leaderboard</span>
              </div>
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Desktop View - Hidden on mobile */}
          {!loading && !error && (
            <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="border-b border-gray-100 p-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-gray-600 text-sm">
                  <div>Rank</div>
                  <div>Address</div>
                  <div>Deposit Amount (USDB)</div>
                  <div>Reward</div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item) => (
                    <div
                      key={item.rank}
                      className="grid grid-cols-4 gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          #{item.rank}
                        </span>
                        {item.rank === 1 && <span>🥇</span>}
                        {item.rank === 2 && <span>🥈</span>}
                        {item.rank === 3 && <span>🥉</span>}
                      </div>
                      <div
                        className="font-mono text-sm text-gray-600"
                        title={item.fullAddress}
                      >
                        {item.address}
                      </div>
                      <div className="font-medium text-gray-700">
                        {item.amount}
                      </div>
                      <div className="font-medium text-green-600">
                        {item.reward}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No participants yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile View - Simple List */}
          {!loading && !error && (
            <div className="md:hidden space-y-4 mb-6">
              {leaderboard.length > 0 ? (
                leaderboard.map((item) => (
                  <div
                    key={item.rank}
                    className="bg-white border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 text-lg">
                          #{item.rank}
                        </span>
                        {item.rank === 1 && <span>🥇</span>}
                        {item.rank === 2 && <span>🥈</span>}
                        {item.rank === 3 && <span>🥉</span>}
                      </div>
                      <div className="font-medium text-green-600">
                        {item.reward}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address</span>
                        <span
                          className="font-mono text-gray-600"
                          title={item.fullAddress}
                        >
                          {item.address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deposit (USDB)</span>
                        <span className="font-medium text-gray-700">
                          {item.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                  <span className="text-gray-500">No participants yet</span>
                </div>
              )}
            </div>
          )}

          {/* Participate Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/usdb")}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.05] hover:shadow-xl text-lg"
            >
              🚀 Join Competition Now
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Click to go to USDB deposit page and participate in the
              competition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quests;
