import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import WriteButton from "../WriteButton";
import { contracts } from "@/config";
import Link from "next/link";
import copy from "copy-to-clipboard";
import { dexLink } from "@/config";
const FarmCard = () => {
  const [data, setData] = useState({ value: 0 });
  const { address } = useAccount();
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const chainId = useChainId();

  const bbb = contracts[chainId]?.bbb;
  const farmer = contracts[chainId]?.carrotfarmer;
  const mutilCall = contracts[chainId]?.multicallAddress;

  const handleCopyClick = () => {
    setTooltipText("Address copied!");
    setTimeout(() => {
      setTooltipText("Click copy contract address");
    }, 1000);
  };

  const isCopied = tooltipText === "Address copied!";

  const [internalId, setIntervalId] = useState();

  const increase = () => {
    if (!internalId) {
      const internalId = setInterval(() => {
        setData({ ...data, value: data.value++ });
      }, 100);
      setIntervalId(internalId);
    }
  };

  const decrease = () => {
    if (!internalId) {
      const internalId = setInterval(() => {
        if (data.value >= 1) {
          setData({ ...data, value: data.value-- });
        } else {
          setData({ ...data, value: 0 });
        }
      }, 100);
      setIntervalId(internalId);
    }
  };

  const release = () => {
    clearInterval(internalId);
    setIntervalId(undefined);
  };

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      { ...bbb, functionName: "allowance", args: [address, farmer?.address] },
      { ...bbb, functionName: "balanceOf", args: [address] },
      { ...farmer, functionName: "getPendingPoint", args: [address] },
      { ...farmer, functionName: "balanceOf", args: [address] },
      { ...farmer, functionName: "pointToken", args: [] },
    ],
    multicallAddress: mutilCall?.address,
  });

  const allowance = reads0?.[0]?.result;
  const bbbBalance = reads0?.[1]?.result;
  const pendingPoint = reads0?.[2]?.result;
  const stake = reads0?.[3]?.result;
  const pointToken = reads0?.[4]?.result;

  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const refetch = () => {
    refetch0();
  };

  const approve = {
    buttonName: "Approve",
    data: {
      ...bbb,
      functionName: "approve",
      args: [farmer?.address, MAX_UINT256],
    },
    callback: () => {
      refetch();
    },
  };

  const buy = {
    buttonName: "Buy",
    data: {
      ...farmer,
      functionName: "buy",
      args: [data.value],
    },
    callback: () => {
      refetch();
    },
  };

  const collect = {
    buttonName: "Collect",
    data: {
      ...farmer,
      functionName: "collect",
      args: [],
    },
    callback: () => {
      refetch();
    },
  };

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0) * 1e18 * 257000) {
    showApprove = false;
  }

  let bbbIsEnough = false;

  return (
    <div className="card m-auto md:w-3/4 w-96 mt-10 border-b">
      <div className="card-body font-black">
        <div className="grid lg:grid-cols-3 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Image
              src={"/farmer.png"}
              alt=""
              height={200}
              width={200}
              className="mask mask-squircle m-auto"
            />
            <div className="text-5xl font-black text-center mt-20">
              X {data.value}
            </div>
          </div>
          <div>
            <div>Buy Farmer</div>

            <div className="mt-8 grid grid-cols-7 gap-2">
              <input
                type="text"
                placeholder="0"
                className="input input-bordered col-span-5"
                value={data.value * 257000 + " BBB"}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({ value: newValue });
                  }
                }}
                disabled
              />
              <div
                className="btn  btn-square m-auto"
                onClick={() => {
                  if (data.value >= 1) {
                    setData({ ...data, value: data.value - 1 });
                  } else {
                    setData({ ...data, value: 0 });
                  }
                }}
                onMouseDown={decrease}
                onMouseUp={release}
                onMouseLeave={release}
                onTouchStart={decrease}
                onTouchEnd={release}
                onTouchMove={release}
              >
                -
              </div>
              <div
                className="btn btn-success btn-square m-auto"
                onClick={() => {
                  setData({ ...data, value: data.value + 1 });
                }}
                onMouseDown={increase}
                onMouseUp={release}
                onMouseLeave={release}
                onTouchStart={increase}
                onTouchEnd={release}
                onTouchMove={release}
              >
                +
              </div>
            </div>
            {!showApprove && (
              <WriteButton
                {...buy}
                className="btn font-black btn-lg mt-5 w-full btn-success"
              />
            )}
            {showApprove && (
              <WriteButton
                {...approve}
                className="btn font-black btn-lg mt-5 w-full btn-success"
              />
            )}
            <div className="text-xs">
              Purchase at least one to unlock the referral bonus.
            </div>
            <div className="mt-1 text-xs">
              Available {((bbbBalance || 0n) / BigInt(1e18))?.toString()} BBB
            </div>
            {!bbbIsEnough && (
              <Link
                className="underline text-xs"
                href={dexLink}
                target="_blank"
              >
                BBB is not enough ?
              </Link>
            )}
          </div>

          <div>
            <div>Workshop</div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div
                className={`tooltip ${isCopied ? "tooltip-success" : ""}`}
                data-tip={tooltipText}
                onClick={() => {
                  copy(farmer?.address);
                  handleCopyClick();
                }}
              >
                <div className="grid grid-cols-2 rounded-2xl shadow-2xl p-1 cursor-pointer">
                  <Image
                    src={"/farmer.png"}
                    alt=""
                    height={50}
                    width={50}
                    className="mask mask-squircle m-auto"
                  />{" "}
                  <div className="font-black mt-4">
                    X{stake?.toString() || 0}
                  </div>
                </div>
              </div>
              <div
                className={`tooltip ${isCopied ? "tooltip-success" : ""}`}
                data-tip={tooltipText}
                onClick={() => {
                  copy(pointToken);
                  handleCopyClick();
                }}
              >
                <div className="grid grid-cols-2 rounded-2xl shadow-2xl p-1 cursor-pointer">
                  <Image
                    src={"/carrot.png"}
                    alt=""
                    height={50}
                    width={50}
                    className="mask mask-squircle m-auto"
                  />{" "}
                  <div className="font-black mt-4">
                    X{pendingPoint?.toString() || 0}
                  </div>
                </div>
              </div>
            </div>
            <WriteButton
              {...collect}
              className="btn font-black btn-lg mt-4 w-full btn-success"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
