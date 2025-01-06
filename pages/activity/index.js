import { useRouter } from "next/router";

const Quests = () => {
  const router = useRouter();
  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          BBBPump Activities
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🎯 Participate in BBBPump activities to earn rewards and bonuses
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group p-6 border border-green-100"
          onClick={() => {
            router.push("/activity/tradeevent");
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold text-gray-800">Trade Event</h3>
            </div>
            <p className="text-gray-600">
              Participate in trading events to earn special rewards and BBB airdrops
            </p>
            <div className="flex items-center text-green-600 font-medium">
              Learn more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group p-6 border border-green-100"
          onClick={() => {
            router.push("/earn");
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h3 className="text-xl font-bold text-gray-800">Earn Event</h3>
            </div>
            <p className="text-gray-600">
              Trade tokens, follow and retweet on Twitter to earn BBB airdrops
            </p>
            <div className="flex items-center text-green-600 font-medium">
              Learn more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quests;
