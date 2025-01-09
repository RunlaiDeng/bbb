import { useRouter } from "next/router";
import WriteButton from "@/components/WriteButton";
import { useEffect, useState } from "react";
import { contracts } from "@/config";
import { useAccount, useChainId } from "wagmi";
import { useNotification } from "@/components/Context/notice";
import copy from "copy-to-clipboard";
import Image from "next/image";
import rpc from "@/components/Rpc";
import { formatEther } from "viem";
import SignButton from "@/components/SignButton";

const Referral = () => {
  const [mount, setMount] = useState(false);
  const chainId = useChainId();

  const [data, setData] = useState({});
  const { address } = useAccount();
  const [referralData, setReferralData] = useState({
    isKol: false,
    userShare: "0",
    underline: [],
    leader: {
      account: "0x0000000000000000000000000000000000000000",
      shareFee: "0",
      prize: "0",
    },
  });

  const refetch = async () => {};

  useEffect(() => {
    refetch();
  }, [address]);

  const { success, info } = useNotification();

  const claimReferral = {
    buttonName: "claim",
    disabled: true,
    data: {},
  };

  const signShareFee = {
    buttonName: "confirm",
    disabled: !data?.userShare,
    message: JSON.stringify({ shareFee: data?.userShare }),
    callback: async (signature) => {
      await rpc.updateShareFee(data?.userShare, signature);
      document.getElementById("commissionRate").close();
      refetch();
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const inviteLink = window.location.origin + "/register/" + address;
      setData({ ...data, inviteLink, userShare: referralData.userShare });
    }
    const fetchData = async () => {
      const referrals = await rpc.getReferrals(address);
      setReferralData(referrals);
      setMount(true);
    };
    fetchData();
  }, [address, referralData.userShare]);

  const shareLink =
    "https://twitter.com/intent/tweet?text=Register on the BBBPump trading platform. Enjoy a 20％ cashback. &url=" +
    data?.inviteLink;

  const totalPrize = referralData?.totalPrize;

  const maxShare = referralData.isKol == 1 ? "30" : "20";

  console.log(referralData);

  return (
    mount && (
      <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
        {/* KOL Program Card */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
            BBBPump KOL Program
          </h1>
          <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
            🌟 Join the BBB Pump KOL program now to enjoy exclusive events and
            up to 50% referral commission!
          </div>
          <button
            className="btn bg-white text-green-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            onClick={() => {
              window.open("https://docs.bbbpump.fun/kol-program");
            }}
          >
            Join KOL Program
          </button>
        </div>

        {/* Total Bonus Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Total Bonus
            </h2>
            <WriteButton
              {...claimReferral}
              className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
            />
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {Number(formatEther(totalPrize || 0))?.toLocaleString()} XDC
            </div>
            <p className="text-sm text-gray-500">
              Automatically updates. Claim feature coming soon.
            </p>
          </div>
        </div>

        {/* Commission Rate Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
              Commission Rate
            </h2>
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="6680"
              width="20"
              height="20"
              className="cursor-pointer hover:opacity-80 transition-opacity"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-gray-600 mb-2">Friends</p>
              <p className="text-3xl font-bold text-green-600">
                {referralData.userShare || 0}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-gray-600 mb-2">Mine</p>
              <p className="text-3xl font-bold text-green-600">
                {maxShare - (referralData.userShare || 0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Invitation Methods Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
            Invitation Methods
          </h2>

          <div className="space-y-4">
            <label
              className="input input-bordered flex items-center gap-2 cursor-pointer w-full bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                copy(address);
                success("Copy successful!");
              }}
            >
              <div className="text-sm font-medium">Invite Code</div>
              <div className="text-gray-600">
                {"..." + address?.substring(33, 45)}
              </div>
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="1469"
                width="20"
                height="20"
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <path
                  d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                  fill="currentColor"
                  p-id="1470"
                ></path>
                <path
                  d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                  fill="currentColor"
                  p-id="1471"
                ></path>
              </svg>
            </label>

            <label
              className="input input-bordered flex items-center gap-2 cursor-pointer w-full bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                copy(data?.inviteLink);
                success("Copy successful!");
              }}
            >
              <div className="text-sm font-medium">Invite Link</div>
              <div className="text-gray-600">
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
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <path
                  d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                  fill="currentColor"
                  p-id="1470"
                ></path>
                <path
                  d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                  fill="currentColor"
                  p-id="1471"
                ></path>
              </svg>
            </label>

            <div className="flex justify-center mt-4">
              <button
                className="btn bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => {
                  window.open(shareLink);
                }}
              >
                Share on Twitter
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20"
                  width="20"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Invitee Cashback Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
            Invitee Cashback
          </h2>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-gray-600">
                  <th>Leader</th>
                  <th>Cashback Ratio</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                {referralData.leader?.account !==
                  "0x0000000000000000000000000000000000000000" && (
                  <tr className="hover:bg-green-50 transition-colors">
                    <td className="flex items-center gap-2">
                      <Image height={16} width={16} src="/bbb.jpg" alt={""} />
                      <span className="text-gray-700">
                        {referralData.leader}
                      </span>
                    </td>
                    <td className="text-gray-700">
                      {(referralData.leaderInfo.isKol === 1 ? 30 : 20) - referralData.leaderInfo.shareFee || 0}%
                    </td>
                    <td className="text-gray-700">
                      {Number(
                        formatEther(referralData.leaderPrize || 0)
                      )?.toLocaleString()}{" "}
                      XDC
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invited Users Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 mb-6">
            Invited Users
          </h2>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-gray-600">
                  <th>Referral</th>
                  <th>Fee</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                {referralData.underline?.map((item) => {
                  return (
                    <tr
                      key={item.account}
                      className="hover:bg-green-50 transition-colors"
                    >
                      <td className="flex items-center gap-2">
                        <Image height={16} width={16} src="/bbb.jpg" alt={""} />
                        <span className="text-gray-700">{item.account}</span>
                      </td>
                      <td className="text-gray-700">
                        {Number(
                          formatEther(item.totalFee || 0)
                        )?.toLocaleString()}{" "}
                        XDC
                      </td>
                      <td className="text-gray-700">
                        {Number(
                          formatEther(item.totalShareFee || 0)
                        )?.toLocaleString()}{" "}
                        XDC
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <dialog id="commissionRate" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg mb-4">Set Commission Rate</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Commission Rate</span>
              </label>
              <input
                type="number"
                placeholder="Type here"
                className="input input-bordered w-full"
                value={data?.userShare}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value >= 0 && value <= maxShare) {
                    setData({ ...data, userShare: value });
                  }
                }}
              />
              <label className="label">
                <span className="label-text-alt">
                  You can set up to {maxShare}% commission rate
                </span>
              </label>
            </div>
            <div className="modal-action">
              <SignButton
                {...signShareFee}
                className="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              />
            </div>
          </div>
        </dialog>
      </div>
    )
  );
};

export default Referral;
