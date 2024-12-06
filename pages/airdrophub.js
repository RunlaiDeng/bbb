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
      key: "dexx",
      desc: "Love and care for dexx",
      rewards: 640,
      contract: dexxRewards,
      dataList: dexx,
    },
    {
      key: "blhz",
      desc: "Gratitude to blhz",
      rewards: 6400,
      contract: blhzRewards,
      dataList: blhz,
    },
  ];

  return (
    <>
      <div className="text-bold my-4 text-xl text-center">Airdrop Hub</div>
      <div>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Available</th>
                <th>Operation</th>
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
                  <tr key={index}>
                    <td>{item?.desc}</td>
                    <td>{claimMax * item?.rewards} $BBB</td>
                    <td>
                      <WriteButton
                        {...claimBtn}
                        className="btn btn-success btn-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AirdropHub;
