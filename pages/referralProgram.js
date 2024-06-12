import WriteButton from "@/components/WriteButton";
import { contracts } from "@/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import copy from "copy-to-clipboard";
import { Notify } from "notiflix/build/notiflix-notify-aio";

const ReferralProgram = () => {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({});
  const chainId = useChainId();
  const { address } = useAccount();
  const router = useRouter();
  const { leaderAddress } = router.query;

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

  let haveLeader = false;

  if (leader && leader != "0x0000000000000000000000000000000000000000") {
    haveLeader = true;
  }

  let haveReferrers = false;

  if (referrersList && referrersList?.length != 0) {
    haveReferrers = true;
  }

  const { isConnected } = useAccount();

  useEffect(() => {
    setData({ leader: leaderAddress });
  }, [leaderAddress]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <>
        {isConnected && (
          <div className="card md:w-1/2 w-96 m-auto">
            <div className="card-body">
              <div
                className="btn btn-success m-auto text-center"
                onClick={() => {
                  copy(
                    window.location.href.split("?")?.[0] +
                      "/?leaderAddress=" +
                      address
                  );
                  Notify.success("Copy successful!");
                }}
              >
                Copy your referral link
              </div>
            </div>
          </div>
        )}

        {!haveLeader && (
          <div className="card md:w-1/2 w-96 m-auto">
            <div className="card-body">
              <div className="font-black text-center">
                Submit Your Leader Address
              </div>
              <input
                type="text"
                placeholder="0x"
                className="input input-bordered w-full"
                defaultValue={leaderAddress}
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

        <div className="card md:w-1/2 w-96 m-auto">
          <div className="card-body">
            <div className="font-black text-center mt-12">
              Your Referral Addresses
            </div>
            {haveReferrers && (
              <>
                {referrersList?.map((referrer) => {
                  return (
                    <div key={referrer} className="text-center">
                      {referrer}
                    </div>
                  );
                })}
              </>
            )}
            {!haveReferrers && <div className="text-center">No Referrals</div>}
          </div>
        </div>
      </>
    )
  );
};

export default ReferralProgram;
