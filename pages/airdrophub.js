import WriteButton from "@/components/WriteButton";
import dexx from "@/airdrop/dexx.json";
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
  const dexxMax = dexx[address?.toLowerCase()] || 0;
  const { proof: proof0, root: root0 } = getProof(dexx, {
    address: address,
    max: dexxMax,
  });

  // const { data: reads0, refetch: refetch0 } = useReadContracts({
  //   contracts: [{ ...dexxRewards, functionName: "claimed", args: [address] }],
  // });
  // const dexxClaimed = reads0?.[0]?.result;
  // console.log(reads0);

  const dexxClaim = {
    buttonName: "claim",
    data: { ...dexxRewards, functionName: "claim", args: [dexxMax, proof0] },
    callback: (confirm) => {
      if (confirm) {
      }
    },
  };
  return (
    <>
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
              <tr>
                <td>Love and care for dexx</td>
                <td>{dexxMax * 640}</td>
                <td>
                  <WriteButton
                    {...dexxClaim}
                    className="btn btn-success btn-sm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AirdropHub;
