import { useRouter } from "next/router";
import { useState } from "react";

const Quests = () => {
  const router = useRouter();
  
  // Mock leaderboard data
  const [leaderboard] = useState([
    { rank: 1, address: "0x1234...5678", amount: "15,000", reward: "$200 BBB" },
    { rank: 2, address: "0xabcd...efgh", amount: "12,500", reward: "$200 BBB" },
    { rank: 3, address: "0x9876...5432", amount: "10,800", reward: "$200 BBB" },
    { rank: 4, address: "0xfedc...ba98", amount: "8,900", reward: "$100 BBB" },
    { rank: 5, address: "0x1111...2222", amount: "7,650", reward: "$100 BBB" },
    { rank: 6, address: "0x3333...4444", amount: "6,420", reward: "$100 BBB" },
    { rank: 7, address: "0x5555...6666", amount: "5,280", reward: "$100 BBB" },
    { rank: 8, address: "0x7777...8888", amount: "4,150", reward: "$100 BBB" },
    { rank: 9, address: "0x9999...aaaa", amount: "3,680", reward: "$100 BBB" },
    { rank: 10, address: "0xbbbb...cccc", amount: "3,200", reward: "$100 BBB" },
    { rank: 11, address: "0xdddd...eeee", amount: "2,850", reward: "$50 BBB" },
    { rank: 12, address: "0xffff...0000", amount: "2,450", reward: "$50 BBB" },
  ]);

  return (
    <div className="m-auto md:w-4/5 w-96 mt-2 pb-1">
      {/* Main Header */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('/bbbbirthday.jpg')"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🎂 One Year of BBB</h2>
          <p className="text-gray-500">A journey that started with laughter, grew with love</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg">
            <span className="font-medium text-gray-800">June 10, 2024</span> - It all began as a joke between colleagues. 
            A simple meme coin launched on xdc.sale with nothing but hope and humor.
          </p>
          
          <p>
            But then something magical happened. The community embraced BBB with open arms. 
            From <span className="font-medium text-green-600">$20,000</span> to an incredible 
            <span className="font-medium text-green-600"> $15 million</span> market cap - 
            you showed us that dreams really do come true.
          </p>

          <p>
            Together, we built more than just a token. We created an ecosystem: 
            <span className="text-gray-800 font-medium"> BBBPump, Staking, Airdrops, Liquidity Mining, bpsXDC, and USDB</span>. 
            Each product born from our shared vision of financial freedom.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400 my-8">
            <p className="text-lg text-gray-700 italic">
              &ldquo;Our vision is to increase the freedom of money globally. 
              We believe that by spreading this freedom, we can significantly improve lives around the world.&rdquo;
            </p>
          </div>

          <p className="text-center text-lg">
            <span className="text-red-500">❤️</span> 
            <span className="font-medium text-gray-800"> Thank you</span> to everyone who believed in us, 
            supported us, and grew with us. This anniversary belongs to 
            <span className="font-medium text-gray-800"> all of us</span>.
          </p>

          <div className="text-center pt-4">
            <span className="text-3xl">🙏</span>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl overflow-hidden border-2 border-green-200 mb-8">
        {/* Activity Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏆</span>
            <h2 className="text-2xl font-bold">USDB Deposit Competition</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-lg font-medium mb-2">📅 Event Period: June 10 - June 30, 2024</p>
            <p className="text-base">💰 Deposit USDB to compete in rankings and win generous BBB rewards!</p>
          </div>
        </div>

        {/* Reward Rules */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Reward Structure
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border border-green-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-2">🥇 Rank 1-3</div>
                <div className="text-lg font-bold text-gray-800">$200 USD BBB</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-xl border border-emerald-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700 mb-2">🥈 Rank 4-10</div>
                <div className="text-lg font-bold text-gray-800">$100 USD BBB</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-4 rounded-xl border border-teal-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-700 mb-2">🥉 Rank 11-20</div>
                <div className="text-lg font-bold text-gray-800">$50 USD BBB</div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Live Leaderboard
          </h3>
          
          {/* Desktop View - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4">
              <div className="grid grid-cols-4 gap-4 font-bold text-gray-700">
                <div>Rank</div>
                <div>Address</div>
                <div>Deposit Amount (USDB)</div>
                <div>Reward (BBB)</div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {leaderboard.map((item) => (
                <div 
                  key={item.rank} 
                  className={`grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    item.rank <= 3 ? 'bg-green-50' : 
                    item.rank <= 10 ? 'bg-emerald-50' : 
                    'bg-teal-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {item.rank <= 3 ? (
                        <span className="text-green-600">#{item.rank}</span>
                      ) : item.rank <= 10 ? (
                        <span className="text-emerald-600">#{item.rank}</span>
                      ) : (
                        <span className="text-teal-600">#{item.rank}</span>
                      )}
                    </span>
                    {item.rank === 1 && <span className="text-xl">🥇</span>}
                    {item.rank === 2 && <span className="text-xl">🥈</span>}
                    {item.rank === 3 && <span className="text-xl">🥉</span>}
                  </div>
                  <div className="font-mono text-sm text-gray-600">{item.address}</div>
                  <div className="font-bold text-green-600">${item.amount}</div>
                  <div className="font-bold text-emerald-600">{item.reward}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-3 mb-6">
            {leaderboard.map((item) => (
              <div 
                key={item.rank}
                className={`rounded-xl shadow-lg border p-4 ${
                  item.rank <= 3 ? 'bg-green-50 border-green-200' : 
                  item.rank <= 10 ? 'bg-emerald-50 border-emerald-200' : 
                  'bg-teal-50 border-teal-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xl">
                        {item.rank <= 3 ? (
                          <span className="text-green-600">#{item.rank}</span>
                        ) : item.rank <= 10 ? (
                          <span className="text-emerald-600">#{item.rank}</span>
                        ) : (
                          <span className="text-teal-600">#{item.rank}</span>
                        )}
                      </span>
                      {item.rank === 1 && <span className="text-xl">🥇</span>}
                      {item.rank === 2 && <span className="text-xl">🥈</span>}
                      {item.rank === 3 && <span className="text-xl">🥉</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 text-lg">{item.reward}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Address:</span>
                    <span className="font-mono text-sm text-gray-700">{item.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Deposit:</span>
                    <span className="font-bold text-green-600">${item.amount} USDB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Participate Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/usdb")}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.05] hover:shadow-xl text-lg"
            >
              🚀 Join Competition Now
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Click to go to USDB deposit page and participate in the competition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quests;
