import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
import copy from "copy-to-clipboard";
import Image from "next/image";
import { useRouter } from "next/router";
const Home = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const handleCopyClick = (msg) => {
    copy(msg);
    setTooltipText("Address copied!");
    setTimeout(() => {
      setTooltipText("Click copy contract address");
    }, 1000);
  };

  const isCopied = tooltipText === "Address copied!";

  const chainId = useChainId();
  const { address } = useAccount();
  const [data, setData] = useState({
    dName: "Memes",
    dSymbol: "MEMES",
    dTotalSupply: 1000000000,
    dDropPercent: 10,
    drop: 0,
  });

  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbb;
  const mutilCall = contracts[chainId]?.multicallAddress;

  const { data: reads0, refetch } = useReadContracts({
    contracts: [
      { ...bbb, functionName: "allowance", args: [address, mbbb?.address] },
      {
        ...mbbb,
        functionName: "balanceOf",
        args: [address],
      },
      { ...bbb, functionName: "balanceOf", args: [address] },
      {
        ...mbbb,
        functionName: "getDropTokenLength",
        args: [],
      },
      {
        ...mbbb,
        functionName: "price",
        args: [],
      },
    ],
    multicallAddress: mutilCall?.address,
  });

  const allowance = reads0?.[0]?.result;
  const mbbbBalance = reads0?.[1]?.result;
  const bbbBalance = reads0?.[2]?.result;

  console.log(bbbBalance);
  const dropTokenLength = reads0?.[3]?.result;
  const price = reads0?.[4]?.result;

  const searchDropTokens = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchDropTokens.push({
      ...mbbb,
      functionName: "getDropToken",
      args: [i],
    });
  }

  const { data: reads1 } = useReadContracts({
    contracts: searchDropTokens,
    multicallAddress: mutilCall?.address,
  });

  const dropTokens = reads1?.map((item) => item?.result);

  const searchClaimAmt = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchClaimAmt.push({
      ...mbbb,
      functionName: "getClaimAmt",
      args: [i, address],
    });
  }

  const { data: reads2 } = useReadContracts({
    contracts: searchClaimAmt,
    multicallAddress: mutilCall?.address,
  });

  const claimAmts = reads2?.map((item) => item?.result);

  const searchClaimed = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchClaimed.push({
      ...mbbb,
      functionName: "claimed",
      args: [address, i],
    });
  }

  const { data: reads3 } = useReadContracts({
    contracts: searchClaimed,
    multicallAddress: mutilCall?.address,
  });

  const claimed = reads3?.map((item) => item?.result);

  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const approve = {
    buttonName: "Approve",
    data: {
      ...bbb,
      functionName: "approve",
      args: [mbbb?.address, MAX_UINT256],
    },
    callback: () => {
      refetch();
    },
  };

  console.log(
    data?.dName,
    data?.dSymbol,
    BigInt(data?.dTotalSupply) * BigInt(1e18),
    data?.dDropPercent
  );

  const drop = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "drop",
      args: [
        data?.dName,
        data?.dSymbol,
        BigInt(data?.dTotalSupply) * BigInt(1e18),
        data?.dDropPercent,
      ],
    },
    callback: () => {
      refetch();
      document.getElementById("dropModal").close();
    },
  };

  const bbbIsEnough = false;

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0)) {
    showApprove = false;
  }

  return (
    <>
      <div className="text-center mt-5">
        <div
          className="btn btn-success w-max"
          onClick={() => {
            document.getElementById("dropModal").showModal();
          }}
        >
          Start a new token
        </div>
      </div>

      <div className="card m-auto md:w-3/4 w-96">
        <div className="card-body font-black">
          <div className="grid grid-cols-2">
            <div className="">Terminal</div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {dropTokens?.map((item, index) => {
              return (
                <div
                  className="card card-side shadow-xl cursor-pointer hover:border-4 border-green-500"
                  key={index}
                  onClick={() => {
                    window.open(
                      "https://app.xspswap.finance/swap#/tokens/xinfin/" +
                        item?.token
                    );
                  }}
                >
                  <figure>
                    <Image
                      height={200}
                      width={200}
                      src="/roadmapleft.png"
                      alt="Movie"
                    />
                  </figure>
                  <div className="card-body">
                    <div className="text-xs">
                      {item?.name} ({item?.symbol})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <dialog id="dropModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Drop Memes</h3>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              Name
              <input
                type="text"
                className="grow"
                placeholder="Memes"
                value={data?.dName}
                onChange={(e) => {
                  setData({ ...data, dName: e.target.value });
                }}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Symbol
              <input
                type="text"
                className="grow"
                placeholder="MEMES"
                value={data?.dSymbol}
                onChange={(e) => {
                  setData({ ...data, dSymbol: e.target.value });
                }}
              />
            </label>

            <div className="collapse">
              <input
                type="checkbox"
                value={data?.showOptions}
                onClick={(e) => {
                  setData({
                    ...data,
                    showOptions: e.target.checked,
                  });
                }}
              />
              <div className="collapse-title text-left pl-0  hover:underline text-green-500">
                Show more options {data?.showOptions ? "↑" : "↓"}
              </div>
              <div className="collapse-content pl-0">
                <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                  Total Supply
                  <input
                    type="text"
                    className="grow"
                    placeholder="0.00"
                    value={data?.dTotalSupply}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d*$/.test(newValue)) {
                        setData({ ...data, dTotalSupply: newValue });
                      }
                    }}
                  />
                  <div className="font-black">{data?.dSymbol || "MEMES"}</div>
                </label>
                <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                  Drop Percent
                  <input
                    type="text"
                    className="grow"
                    placeholder="0.00"
                    value={data?.dDropPercent}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d*$/.test(newValue) && newValue <= 100) {
                        setData({ ...data, dDropPercent: newValue });
                      }
                    }}
                  />
                  <div className="font-black">%</div>
                </label>
              </div>
            </div>

            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Cost
              <input
                type="text"
                className="grow"
                placeholder={(price || 0n) / BigInt(1e18)}
                disabled
              />
              <div className="font-black">BBB</div>
            </label>
          </div>
          <div className="mt-1 text-xs">
            Available {((bbbBalance || 0n) / BigInt(1e18))?.toString()} BBB
          </div>
          {!bbbIsEnough && (
            <Link className="underline text-xs" href={dexLink} target="_blank">
              BBB is not enough ?
            </Link>
          )}
          {showApprove && (
            <WriteButton {...approve} className="btn mt-5 w-full btn-success" />
          )}
          {!showApprove && (
            <WriteButton {...drop} className="btn mt-5 w-full btn-success" />
          )}
        </div>
      </dialog>
    </>
  );
};

export default Home;
