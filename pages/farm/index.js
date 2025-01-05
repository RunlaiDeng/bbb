import FarmCard from "@/components/FarmCard";
import Link from "next/link";
import { contracts } from "@/config";
import { useChainId } from "wagmi";

const Farm = () => {
  const chainId = useChainId();

  const farmerList = [
    {
      farmer: {
        name: "Carrot Farmer",
        img: "/farmer0/carrotFarmer.png",
        ...contracts[chainId]?.carrotFarmer,
      },
      burnToken: { name: "BBB", ...contracts[chainId]?.bbb },
      rewardsTokenImg: "/farmer0/carrot.png",
    },
  ];

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
          BBBPump Farming
        </h1>
        <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🌾 Stake your tokens to earn rewards and participate in farming
        </div>
      </div>
      
      <div className="space-y-6">
        {farmerList?.map((farmer, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <FarmCard {...farmer} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Farm;
