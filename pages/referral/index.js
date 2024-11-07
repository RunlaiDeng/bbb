import { useRouter } from "next/router";
import WriteButton from "@/components/WriteButton";
import { useEffect, useState } from "react";
import { contracts } from "@/config";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useNotification } from "@/components/Context/notice";
import copy from "copy-to-clipboard";
import Image from "next/image";
import rpc from "@/components/Rpc";
import { formatEther } from "viem";
const Referral = () => {
  const [mount, setMount] = useState(false);
  const chainId = useChainId();
  const bbbpumpReferral = contracts[chainId]?.bbbpumpReferral;
  const mutilCall = contracts[chainId]?.multicallAddress;
  const router = useRouter();
  const [data, setData] = useState({});
  const [referralObj, setReferralObj] = useState({});
  const { address } = useAccount();

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...bbbpumpReferral,
        functionName: "getReferrersList",
        args: [address],
      },
      {
        ...bbbpumpReferral,
        functionName: "leaderMap",
        args: [address],
      },
      { ...bbbpumpReferral, functionName: "getLeader", args: [address] },
    ],
  });

  const refetch = () => {
    refetch0();
  };

  const referralList = reads0?.[0]?.result;
  const leaderMap = reads0?.[1]?.result;
  const leaderConfig = reads0?.[2]?.result;

  const { success, info } = useNotification();

  const claimReferral = {
    buttonName: "claim",
    disabled: true,
    data: {},
  };

  const changeCommission = {
    buttonName: "confirm",
    disabled: !data?.userShare,
    data: {
      ...bbbpumpReferral,
      functionName: "setShare",
      args: [data?.userShare],
    },
    callback: () => {
      document.getElementById("commissionRate").close();
      refetch();
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const inviteLink = window.location.origin + "/register/" + address;
      setData({ ...data, inviteLink });
    }
    const fetchData = async () => {
      const referralInfo = await rpc.getReferralInfo(address);
      setReferralObj({ ...referralInfo });
      setMount(true);
    };
    fetchData();
  }, [address]);

  const isKol = leaderMap?.[0];
  const userShare = leaderMap?.[2];

  useEffect(() => {
    setData({ ...data, userShare: userShare?.toString() });
  }, [userShare]);

  const shareLink =
    "https://twitter.com/intent/tweet?text=Register on the BBBPump trading platform. Enjoy a 20％ cashback. &url=" +
    data?.inviteLink;

  const totalPrize = referralObj?.totalPrize;
  const leaderPrize = referralObj?.leaderPrize;
  const referrals = referralObj?.referrals;

  const maxShare = isKol ? "30" : "20";

  return (
    mount && (
      <div className="">
        <div className="card m-auto w-full ">
          <div className="card-body font-black">
            <div className="card w-full m-auto outline outline-green-700 text-center text-green-700">
              <div className="card-body">
                <div className="text-xl">Become KOL</div>
                <div className="text-xs ">
                  Join the BBB Pump KOL program now to enjoy exclusive events
                  and up to 50% referral commission!
                </div>
                <div
                  className="btn btn-success m-auto w-max"
                  onClick={() => {
                    window.open("https://docs.bbbpump.fun/kol-program");
                  }}
                >
                  Join now
                </div>
              </div>
            </div>
            <div className="font-black">Rewards</div>
            <div className="font-black text-green-700 flex items-center gap-2">
              <div className="text-4xl">{formatEther(totalPrize || 0)} XDC</div>

              <WriteButton
                {...claimReferral}
                className="btn btn-xs w-max btn-success"
              />
            </div>
            <div className="text-xs opacity-50">
              It will automatically update. Claim is coming soon
            </div>
            <div className="flex gap-2 items-center">
              Commission Rate{" "}
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="6680"
                width="16"
                height="16"
                className="cursor-pointer"
                onClick={() => {
                  document.getElementById("commissionRate").showModal();
                }}
              >
                <path
                  d="M652.4 156.6125a112.5 112.5 0 1 1 155.925 161.15625L731.375 394.71875 572.3 235.5875l79.5375-79.5375 0.5625 0.5625zM333.63125 792.40625v0.1125H174.5v-159.1875l358.03125-357.975 159.075 159.13125-357.975 357.91875zM62 849.5h900v112.5H62v-112.5z"
                  fill="#262626"
                  p-id="6681"
                ></path>
              </svg>
            </div>
            <div className="stats stats-horizontal shadow text-green-700 text-xs">
              <div className="stat">
                <div className="stat-title">Invited User</div>
                <div className="stat-value">{userShare?.toString() || 0}%</div>
              </div>

              <div className="stat">
                <div className="stat-title">You</div>
                <div className="stat-value">
                  {maxShare - (userShare?.toString() || 0)}%
                </div>
              </div>
            </div>
            <div>Invitation Method</div>
            <label
              className="input input-bordered flex items-center gap-2 cursor-pointer w-full"
              onClick={() => {
                copy(address);
                success("Copy successful!");
              }}
            >
              <div className="text-xs">Invite Code</div>
              <div>{"..." + address?.substring(33, 45)}</div>
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1469"
                width="20"
                height="20"
                className="ml-auto"
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
            <label
              className="input input-bordered flex items-center gap-2 cursor-pointer w-full"
              onClick={() => {
                copy(data?.inviteLink);
                success("Copy successful!");
              }}
            >
              <div className="text-xs">Invite Link</div>
              <div>
                {data?.inviteLink?.substring(0, 10) +
                  "...." +
                  data?.inviteLink?.split("/register/")?.[1]?.substring(40, 45)}
              </div>
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1469"
                width="20"
                height="20"
                className="ml-auto"
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
            <div>Share To</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="17.5"
              viewBox="0 0 448 512"
              className="cursor-pointer"
              onClick={() => {
                window.open(shareLink);
              }}
            >
              <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z" />
            </svg>
            <div className="font-black">Invitee cashback</div>
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th className="w-1/2">leader</th>
                    <th className="w-1/4">cashback ratio</th>
                    <th className="w-1/4">Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderConfig &&
                    leaderConfig?.[0] !=
                      "0x0000000000000000000000000000000000000000" && (
                      <tr>
                        <td className="flex items-center gap-1">
                          <Image
                            height={16}
                            width={16}
                            src="/bbb.jpg"
                            alt={""}
                          />
                          {leaderConfig?.[0]}
                        </td>
                        <td>{leaderConfig?.[1]?.toString() || 0}%</td>

                        <td>{formatEther(leaderPrize || 0)} XDC</td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
            <div className="font-black">Invited Users</div>
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th className="w-1/2">Referral</th>
                    <th className="w-1/4">Fee</th>
                    <th className="w-1/4">Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  {referralList?.map((item) => {
                    const referralPrize = referrals[item];
                    const shareFee = referralPrize?.shareFee;
                    const fee = referralPrize?.fee;

                    return (
                      <tr key={item}>
                        <td className="flex items-center gap-1">
                          <Image
                            height={16}
                            width={16}
                            src="/bbb.jpg"
                            alt={""}
                          />
                          {item}
                        </td>
                        <td>{formatEther(fee || 0)} XDC</td>
                        <td>{formatEther(shareFee || 0)} XDC</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <dialog id="commissionRate" className="modal">
          <div className="modal-box font-black">
            <div className="grid grid-cols-3">
              <form method="dialog">
                <button className="btn">X</button>
              </form>
              <h3 className="font-bold label-text text-center mt-2 text-xs">
                Commission Rate Setting
              </h3>
            </div>
            <label className="form-control w-full mt-4">
              <input
                type="range"
                min={0}
                max={maxShare}
                value={data?.userShare || 0}
                className="range range-success range-xs"
                onChange={(e) => {
                  setData({ ...data, userShare: e.target.value });
                }}
              />
              <div className="flex justify-between">
                <div>Mine {maxShare - (data?.userShare || 0)}%</div>
                <div>Friends {data?.userShare || 0}%</div>
              </div>
            </label>

            <WriteButton
              {...changeCommission}
              className="btn btn-success w-full mt-4"
            />
          </div>
        </dialog>
      </div>
    )
  );
};

export default Referral;
