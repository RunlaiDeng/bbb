import WriteButton from "@/components/WriteButton";
import { contracts } from "@/config";
import { useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
const ReferralProgram = () => {
  const [data, setData] = useState({});
  const chainId = useChainId();
  const { address } = useAccount();
  const referralProgram = contracts[chainId]?.referralProgram;

  const { data: reads0 } = useReadContracts({
    contracts: [
      { ...referralProgram, functionName: "referrersList", args: [address] },
    ],
  });

  const submit = {
    buttonName: "Submit",
    data: {
      ...referralProgram,
      functionName: "register",
      args: [data?.leader],
    },
  };
  return (
    <>
      <div className="card md:w-1/2 w-96 m-auto">
        <div className="card-body">
          <div className="font-black text-center mt-12">
            Submit Your Leader Address
          </div>
          <input
            type="text"
            placeholder="0x"
            className="input input-bordered w-full"
            onChange={(e) => setData({ ...data, leader: e.target.value })}
          />
          <WriteButton {...submit} className="btn btn-primary" />
        </div>
      </div>
    </>
  );
};

export default ReferralProgram;
