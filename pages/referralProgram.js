import WriteButton from "@/components/WriteButton";
import { contracts } from "@/config";
import { useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
const ReferralProgram = () => {
  const [data, setData] = useState({});
  const chainId = useChainId();
  const { address } = useAccount();
  console.log(chainId)
  const referralProgram = contracts[chainId]?.referralProgram;

  const { data: reads0, refetch } = useReadContracts({
    contracts: [
      { ...referralProgram, functionName: "getReferrersList", args: [address] },
      { ...referralProgram, functionName: "leaders", args: [address] },
    ],
  });

  const referrersList = reads0?.[0]?.result;
  const leader = reads0?.[1]?.result;

  const submit = {
    buttonName: "Submit",
    data: {
      ...referralProgram,
      functionName: "register",
      args: [data?.leader],
    },
    callback: () => {
      refetch();
    },
  };

  let haveLeader = true;
  if (leader == "0x0000000000000000000000000000000000000000") {
    haveLeader = false;
  }

  let haveReferrers = true;
  if (referrersList?.length == 0) {
    haveReferrers = false;
  }

  return (
    <>
      {!haveLeader && (
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
      )}
      {haveLeader && (
        <div className="card md:w-1/2 w-96 m-auto">
          <div className="card-body">
            <div className="font-black text-center mt-12">
              Your Leader Address
            </div>
            <div className="text-center">{leader}</div>
          </div>
        </div>
      )}
      {haveReferrers && (
        <div className="card md:w-1/2 w-96 m-auto">
          <div className="card-body">
            <div className="font-black text-center mt-12">
              Your Referral Addresses
            </div>
            {referrersList?.map((referrer) => {
              return (
                <div key={referrer} className="text-center">
                  {referrer}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ReferralProgram;
