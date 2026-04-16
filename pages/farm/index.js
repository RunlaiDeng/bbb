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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-4 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-base-content/80 mb-2">Farming Pools</h1>
          <p className="text-base-content/60 text-sm md:text-base">Stake your tokens to earn rewards</p>
        </div>
        
        <div className="space-y-4">
          {farmerList?.map((farmer, index) => (
            <div key={index} className="bg-base-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300/50 overflow-hidden">
              <FarmCard {...farmer} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Farm;
