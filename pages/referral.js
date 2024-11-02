import { useRouter } from "next/router";
import WriteButton from "@/components/WriteButton";
import { useEffect, useState } from "react";
import { contracts } from "@/config";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useNotification } from "@/components/Context/notice";
import copy from "copy-to-clipboard";

const Referral = () => {
  const chainId = useChainId();
  const bbbpumpReferral = contracts[chainId]?.bbbpumpReferral;
  const mutilCall = contracts[chainId]?.multicallAddress;
  const router = useRouter();
  const [data, setData] = useState({});
  const { address } = useAccount();

  const { data: reads0 } = useReadContracts({
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
    ],
  });

  const referralList = reads0?.[0]?.result;
  const leaderMap = reads0?.[1]?.result;

  const { success } = useNotification();

  const claimReferral = {
    buttonName: "claim",
    disabled: true,
    data: {},
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const inviteLink = window.location.origin + "/register/" + address;
      setData({ ...data, inviteLink });
    }
  }, [address]);

  console.log(leaderMap);
  return (
    <div className="">
      <div className="card m-auto w-full ">
        <div className="card-body font-black">
          <div className="font-black">Rewards</div>
          <div className="font-black text-green-700 flex items-center gap-2">
            <div className="text-4xl"> {0} XDC</div>

            <WriteButton
              {...claimReferral}
              className="btn btn-xs w-max btn-success"
            />
          </div>
          <div className="text-xs opacity-50">
            It will automatically update every two weeks.
          </div>
          <div>Commission Rate</div>
          <div className="stats stats-horizontal shadow text-green-700 text-xs">
            <div className="stat">
              <div className="stat-title">Invited User</div>
              <div className="stat-value">0%</div>
            </div>

            <div className="stat">
              <div className="stat-title">You</div>
              <div className="stat-value">20%</div>
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
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Referral</th>
                  <th>Fee</th>
                  <th>Rewards</th>
                </tr>
              </thead>
              <tbody>
                {referralList?.map((item) => {
                  return (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>0 XDC</td>
                      <td>0 XDC</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
