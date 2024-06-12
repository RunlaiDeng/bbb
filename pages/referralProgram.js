import WriteButton from "@/components/WriteButton";
import { contracts } from "@/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import copy from "copy-to-clipboard";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import Link from "next/link";

const ReferralProgram = () => {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({});
  const chainId = useChainId();
  const { address } = useAccount();
  const router = useRouter();
  const { leaderAddress } = router.query;

  const referralProgram = contracts[chainId]?.referralProgram;

  const mutilCall = contracts[chainId]?.multicallAddress;

  const { data: reads0, refetch } = useReadContracts({
    contracts: [
      { ...referralProgram, functionName: "getReferrersList", args: [address] },
      { ...referralProgram, functionName: "leaders", args: [address] },
    ],
    multicallAddress: mutilCall?.address,
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
    setData({ ...data, leader: leaderAddress });
  }, [leaderAddress]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setData({
      ...data,
      referralLink:
        window.location.href.split("?")?.[0] + "/?leaderAddress=" + address,
    });
  }, [address]);

  const referralLink = data?.referralLink;

  const shareLink =
    "https://twitter.com/intent/tweet?text=Discover the magic of benybadboy! 🌟 Unlock exclusive perks with my referral link! 🎉 &via=benybadboybbb &url=" +
    referralLink +
    "&hashtags=benybadboy,bbb,xdc,defi";
  return (
    mounted && (
      <>
        {isConnected && (
          <div className="card w-96 m-auto">
            <div className="card-body">
              <label
                className="input input-bordered flex items-center gap-2 m-auto cursor-pointer"
                onClick={() => {
                  copy(
                    window.location.href.split("?")?.[0] +
                      "/?leaderAddress=" +
                      address
                  );
                  Notify.success("Copy successful!");
                }}
              >
                <div className="text-xs">Referral Link</div>
                <div>
                  {referralLink.substring(0, 15) +
                    "...." +
                    referralLink.split("leaderAddress=")?.[1].substring(35, 45)}
                </div>
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1469"
                  width="20"
                  height="20"
                  className="cursor-pointer"
                >
                  <path
                    d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                    fill="#5E6570"
                    p-id="1470"
                  ></path>
                  <path
                    d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                    fill="#5E6570"
                    p-id="1471"
                  ></path>
                  <path
                    d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                    fill="#5E6570"
                    p-id="1472"
                  ></path>
                  <path
                    d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                    fill="#5E6570"
                    p-id="1473"
                  ></path>
                  <path
                    d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                    fill="#5E6570"
                    p-id="1474"
                  ></path>
                </svg>
              </label>
              <Link
                className="btn btn-success"
                href={shareLink}
                target="_blank"
              >
                Share To X
              </Link>
            </div>
          </div>
        )}

        {!haveLeader && (
          <div className="card w-96 m-auto">
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
              <WriteButton {...submit} className="btn btn-success" />
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
