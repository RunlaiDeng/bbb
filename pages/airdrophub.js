import WriteButton from "@/components/WriteButton";
import dexx from "@/airdrop/dexx.json";
import blhz from "@/airdrop/blhz.json";
import { keccak256, encodePacked, getAddress } from "viem";
import MerkleTree from "merkletreejs";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";

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

  const dexxRewards = contracts[chainId]?.dexxRewards;
  const blhzRewards = contracts[chainId]?.blhzRewards;

  const airdropList = [
    {
      key: "blhz",
      desc: "BLHZ OG",
      rewards: 6400,
      contract: blhzRewards,
      dataList: blhz,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Airdrop Hub
      </h1>
      <div className="bg-base-200 rounded-2xl shadow-xl p-6 font-bold">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-right">Available</th>
                <th className="text-right">Operation</th>
              </tr>
            </thead>
            <tbody>
              {airdropList.map((item, index) => {
                const dataList = item?.dataList;
                const claimMax = dataList[address?.toLowerCase()] || 0;
                const { proof: proof0, root: root0 } = getProof(dataList, {
                  address: address,
                  max: claimMax,
                });

                const claimBtn = {
                  buttonName: "claim",
                  disabled: claimMax == 0,
                  data: {
                    ...item.contract,
                    functionName: "claim",
                    args: [claimMax, proof0],
                  },
                  callback: (confirm) => {
                    if (confirm) {
                    }
                  },
                };

                return (
                  <tr
                    key={index}
                    className="hover:bg-base-300 transition-colors duration-200"
                  >
                    <td className="py-4 text-lg">{item?.desc}</td>
                    <td className="text-right py-4">
                      <span className="text-lg font-medium text-green-700">
                        {claimMax * item?.rewards} $BBB
                      </span>
                    </td>
                    <td className="text-right py-4">
                      <WriteButton
                        {...claimBtn}
                        className="btn btn-xs btn-green-700 w-max"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AirdropHub;
