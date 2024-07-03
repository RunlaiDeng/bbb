import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { dexLink } from "@/config";
const Megadrop = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [data, setData] = useState({});

  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbb;

  const { data: reads0, refetch } = useReadContracts({
    contracts: [
      { ...bbb, functionName: "allowance", args: [address, mbbb?.address] },
      {
        ...mbbb,
        functionName: "balanceOf",
        args: [address],
      },
      { ...bbb, functionName: "balanceOf", args: [address] },
    ],
  });

  const allowance = reads0?.[0]?.result;
  const mbbbBalance = reads0?.[1]?.result;
  const bbbBalance = reads0?.[2]?.result;

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
    },
  };

  const bbbIsEnough = false;

  console.log(data?.value * 1e18);

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0) * 1e18) {
    showApprove = false;
  }

  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96">
        <div></div>
        <div className="text-center font-black mt-2">MEGADROP</div>
        <Link className="text-right" href="/help">
          <button className="btn">?</button>
        </Link>
      </div>
      <div className="card m-auto md:w-3/4 w-96 shadow-2xl mt-10">
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
      <div className="card m-auto md:w-3/4 w-96 shadow-2xl mt-5">
        <div className="card-body font-black">
          <div className="">Airdrop History</div>
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
            <Link className="text-right" href="/help">
              <button className="btn">?</button>
            </Link>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={data?.mValue}
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
    </>
  );
};

export default Megadrop;
