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
    // {
    //   farmer: {
    //     name: "Carrot Puree Farmer",
    //     img: "/farmer1/carrotPureeFarmer.png",
    //     ...contracts[chainId]?.carrotPureeFarmer,
    //   },
    //   burnToken: { name: "CAR", ...contracts[chainId]?.car },
    //   rewardsTokenImg: "/farmer1/carrotPuree.png",
    // },
  ];
  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96 mt-2 pb-1">
        <div></div>
        <div className="text-center font-black mt-2">Farm</div>
        <div className="text-right">
          <Link className="btn btn-xs" href="/farm/referral">
            Referral
          </Link>
          <Link className="btn btn-xs ml-1" href="/help">
            ?
          </Link>
        </div>
      </div>
      {farmerList?.map((farmer, index) => {
        return <FarmCard key={index} {...farmer} />;
      })}
    </>
  );
};

export default Farm;
