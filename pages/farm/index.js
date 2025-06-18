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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Farming Pools</h1>
          <p className="text-gray-600">Stake your tokens to earn rewards</p>
        </div>
        
        <div className="grid gap-6">
          {farmerList?.map((farmer, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden">
              <FarmCard {...farmer} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Farm;
