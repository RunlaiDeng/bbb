import WriteButton from "@/components/WriteButton";
import ccr from "@/airdrop/ccr.json";
import blhz from "@/airdrop/blhz.json";
import { keccak256, encodePacked, getAddress } from "viem";
import MerkleTree from "merkletreejs";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";
import Image from "next/image";

const hash = (msgSender, max) => {
  try {
    return keccak256(encodePacked(["address", "uint256"], [msgSender, max]));
  } catch (error) {
    return "";
  }
};

const getTree = (data) => {
  const leaves = [];
  Object.entries(data).forEach(([key, value]) => {
    leaves.push(hash(getAddress(key), value));
  });

  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
  });
  return tree;
};

const getProof = (list, data) => {
  const tree = getTree(list);
  const leaf = hash(data?.address, data?.max);
  const proof = tree.getHexProof(leaf);
  return { proof, root: tree.getHexRoot() };
};

const AirdropHub = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const ccrRewards = contracts[chainId]?.ccrRewards;
  const blhzRewards = contracts[chainId]?.blhzRewards;

  const airdropList = [
    {
      key: "blhz",
      desc: "BLHZ OG",
      rewards: 6400,
      contract: blhzRewards,
      dataList: blhz,
      logo: "/blhz.png",
    },
    {
      key: "ccr",
      desc: "CCR OG",
      rewards: 6400,
      contract: ccrRewards,
      dataList: ccr,
      logo: "/ccr.png",
    },
  ];

  return (
    <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
      <div className="bg-gradient-to-br from-primary/90 via-base-300 to-base-200 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-primary">
          BBBPump Airdrops
        </h1>
        <div className="text-sm bg-base-200/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
          🎁 Claim your BBBPump airdrops and rewards
        </div>
      </div>

      <div className="bg-base-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-6">
          Available Airdrops
        </h2>
        
        <div className="space-y-4">
          {airdropList.map((item, index) => {
            const dataList = item?.dataList;
            const claimMax = dataList[address] || 0;
            const { proof: proof0 } = getProof(dataList, {
              address: address,
              max: claimMax,
            });

            const claimBtn = {
              buttonName: "Claim",
              disabled: claimMax == 0,
              data: {
                ...item.contract,
                functionName: "claim",
                args: [claimMax, proof0],
              },
              callback: () => {},
            };

            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-primary/10 to-base-200 p-6 rounded-xl border border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-base-200 shadow-sm">
                      <Image
                        height={400}
                        width={400}
                        src={item?.logo}
                        alt={item?.desc}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-base-content/80">{item?.desc}</h3>
                      <p className="text-sm text-base-content/60">
                        Available: {claimMax * item?.rewards} mBBB
                      </p>
                    </div>
                  </div>
                  <WriteButton
                    {...claimBtn}
                    className={`btn btn-sm ${
                      claimMax == 0
                        ? "bg-base-300 text-base-content/40 cursor-not-allowed"
                        : "btn btn-primary border-none hover:shadow-md transform hover:-translate-y-1"
                    } transition-all duration-300`}
                  />
                </div>
              </div>
            );
          })}

          {airdropList.length === 0 && (
            <div className="text-center py-8 text-base-content/50">
              No airdrops available at the moment
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirdropHub;
