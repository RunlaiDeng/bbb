import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
const Megadrop = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [data, setData] = useState({
    aName: "Memes",
    aSymbol: "MEMES",
    aTotalSupply: 1000000000,
    aDropPercent: 100,
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
    ],
    multicallAddress: mutilCall?.address,
  });

  const allowance = reads0?.[0]?.result;
  const mbbbBalance = reads0?.[1]?.result;
  const bbbBalance = reads0?.[2]?.result;
  const DropTokenLength = reads0?.[3]?.result;

  const searchDropTokens = [];

  for (let i = 0; i < DropTokenLength; i++) {
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

  console.log(dropTokens);

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

  const stake = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "depositFor",
      args: [address, BigInt(data?.value || 0) * BigInt(1e18)],
    },
    callback: () => {
      refetch();
      document.getElementById("depositModal").close();
    },
  };

  const unStake = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "withdrawTo",
      args: [address, BigInt(data?.mValue || 0) * BigInt(1e18)],
    },
    callback: () => {
      refetch();
      document.getElementById("withdrawModal").close();
    },
  };

  const drop = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "drop",
      args: [
        data?.aName,
        data?.aSymbol,
        BigInt(data?.aTotalSupply) * BigInt(1e18),
        data?.aDropPercent,
      ],
    },
    callback: () => {
      refetch();
      document.getElementById("airdropModal").close();
    },
  };

  const bbbIsEnough = false;

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0) * 1e18) {
    showApprove = false;
  }

  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96 border-b pb-1">
        <div></div>
        <div className="text-center font-black mt-2">MEGADROP</div>
        <Link className="text-right" href="/help">
          <button className="btn">?</button>
        </Link>
      </div>
      <div className="card m-auto md:w-3/4 w-96 mt-10 border-b rounded-none">
        <div className="card-body font-black">
          <div className="font-black">Your Supplies</div>
          <div className="font-black text-5xl">
            {(mbbbBalance?.toString() || 0) / 1e18} BBB
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label
              className="btn font-black btn-lg mt-5 w-full btn-success m-auto"
              onClick={() =>
                document.getElementById("depositModal").showModal()
              }
            >
              Deposit
            </label>
            <label
              className="btn font-black btn-lg mt-5 w-full m-auto"
              onClick={() =>
                document.getElementById("withdrawModal").showModal()
              }
            >
              Withdraw
            </label>
          </div>
        </div>
      </div>
      <div className="card m-auto md:w-3/4 w-96 mt-5">
        <div className="card-body font-black">
          <div className="grid grid-cols-2">
            <div className="">Airdrop History</div>
            <div className="text-right">
              <div
                className="btn btn-success w-max"
                onClick={() => {
                  document.getElementById("airdropModal").showModal();
                }}
              >
                Wanna Aidrop?
              </div>
            </div>
          </div>
        </div>
      </div>
      <dialog id="depositModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Deposit BBB</h3>
          </div>

          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={data?.value}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({ ...data, value: newValue });
                  }
                }}
              />
              <div className="font-black">BBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-black"
                onClick={() => {
                  setData({
                    ...data,
                    value: (bbbBalance?.toString() || 0) / 1e18,
                  });
                }}
              >
                max
              </kbd>
            </label>
          </div>
          <div className="text-xs mt-1">
            Available {(bbbBalance?.toString() || 0) / 1e18} BBB
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
            <WriteButton {...stake} className="btn mt-5 w-full btn-success" />
          )}
        </div>
      </dialog>
      <dialog id="withdrawModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Withdraw BBB</h3>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={data?.mValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({ ...data, mValue: newValue });
                  }
                }}
              />
              <div className="font-black">mBBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-black"
                onClick={() => {
                  setData({
                    ...data,
                    mValue: (mbbbBalance?.toString() || 0) / 1e18,
                  });
                }}
              >
                max
              </kbd>
            </label>
          </div>
          <div className="text-xs mt-1">
            Available {(mbbbBalance?.toString() || 0) / 1e18} mBBB
          </div>
          <WriteButton {...unStake} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
      <dialog id="airdropModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">
              Airdrop Memes
            </h3>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              Name
              <input
                type="text"
                className="grow"
                placeholder="Memes"
                value={data?.aName}
                onChange={(e) => {
                  setData({ ...data, aName: e.target.value });
                }}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Symbol
              <input
                type="text"
                className="grow"
                placeholder="MEMES"
                value={data?.aSymbol}
                onChange={(e) => {
                  setData({ ...data, aSymbol: e.target.value });
                }}
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Total Supply
              <input
                type="text"
                className="grow"
                placeholder="0.00"
                value={data?.aTotalSupply}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({ ...data, aTotalSupply: newValue });
                  }
                }}
              />
              <div className="font-black">{data?.aSymbol || "MEMES"}</div>
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Drop Percent
              <input
                type="text"
                className="grow"
                placeholder="0.00"
                value={data?.aDropPercent}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue) && newValue <= 100) {
                    setData({ ...data, aDropPercent: newValue });
                  }
                }}
              />
              <div className="font-black">%</div>
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Cost
              <input
                type="text"
                className="grow"
                placeholder="0.00"
                value={257000}
                disabled
              />
              <div className="font-black">BBB</div>
            </label>
          </div>
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

export default Megadrop;
