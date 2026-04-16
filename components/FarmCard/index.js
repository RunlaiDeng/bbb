import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import WriteButton from "../WriteButton";
import { contracts } from "@/config";
import Link from "next/link";
import copy from "copy-to-clipboard";
import { dexLink } from "@/config";
const FarmCard = (props) => {
  const [data, setData] = useState({ value: 0 });
  const { address } = useAccount();
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const { burnToken, farmer, rewardsTokenImg } = props;

  const burnTokenName = burnToken?.name;
  const farmerImg = farmer?.img;
  const farmerName = farmer?.name;

  const chainId = useChainId();

  const mutilCall = contracts[chainId]?.multicallAddress;

  const handleCopyClick = (msg) => {
    copy(msg);
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
      {
        ...burnToken,
        functionName: "allowance",
        args: [address, farmer?.address],
      },
      { ...burnToken, functionName: "balanceOf", args: [address] },
      { ...farmer, functionName: "getPendingPoint", args: [address] },
      { ...farmer, functionName: "balanceOf", args: [address] },
      { ...farmer, functionName: "pointToken", args: [] },
    ],
    multicallAddress: mutilCall?.address,
  });

  const allowance = reads0?.[0]?.result;

  const burnTokenBalance = reads0?.[1]?.result;
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
      ...burnToken,
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

  let burnTokenIsEnough = false;

  return (
    <div className="bg-base-200 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Farmer Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={farmerImg}
                alt={farmerName}
                height={60}
                width={60}
                className="rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-base-content/80">{farmerName}</h3>
                <p className="text-xs md:text-sm text-base-content/60">Stake {burnTokenName} to earn rewards</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-base-200 p-4 rounded-xl border border-primary/20">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">X {data.value}</p>
                <p className="text-xs md:text-sm text-base-content/60 mt-1">Multiplier</p>
              </div>
            </div>
          </div>

          {/* Buy Section */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-base-content/80">Buy {farmerName}</h3>
            <div className="bg-gradient-to-br from-primary/10 to-base-200 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="0"
                  className="input input-bordered w-full bg-base-200 text-sm"
                  value={data.value * 257000 + " " + burnTokenName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (/^\d*$/.test(newValue)) {
                      setData({ value: newValue });
                    }
                  }}
                  disabled
                />
                <button
                  className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300"
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
                </button>
                <button
                  className="btn btn-circle btn-sm btn-primary border-none hover:shadow-md"
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
                </button>
              </div>

              {showApprove ? (
                <WriteButton
                  {...approve}
                  className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
                />
              ) : (
                <WriteButton
                  {...buy}
                  className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-base-content/50">
                Available: {((burnTokenBalance || 0n) / BigInt(1e18))?.toString()} {burnTokenName}
              </p>
              <p className="text-xs md:text-sm text-base-content/50">
                Purchase at least one to unlock the referral bonus
              </p>
              {!burnTokenIsEnough && (
                <Link 
                  className="text-xs md:text-sm text-primary hover:text-success" 
                  href={dexLink}
                >
                  Need more {burnTokenName}?
                </Link>
              )}
            </div>
          </div>

          {/* Workshop Section */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-bold text-base-content/80">Workshop</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div 
                className={`bg-gradient-to-br from-primary/10 to-base-200 p-3 md:p-4 rounded-xl border border-primary/20 cursor-pointer hover:shadow-md transition-all duration-300 ${
                  isCopied ? "border-primary" : ""
                }`}
                onClick={() => handleCopyClick(farmer?.address)}
                data-tip={tooltipText}
              >
                <div className="flex flex-col items-center">
                  <Image
                    src={farmerImg}
                    alt=""
                    height={32}
                    width={32}
                    className="rounded-full mb-2"
                  />
                  <p className="font-bold text-base-content/80 text-sm md:text-base">X{stake?.toString() || 0}</p>
                  <p className="text-xs text-base-content/60">Staked</p>
                </div>
              </div>

              <div 
                className={`bg-gradient-to-br from-primary/10 to-base-200 p-3 md:p-4 rounded-xl border border-primary/20 cursor-pointer hover:shadow-md transition-all duration-300 ${
                  isCopied ? "border-primary" : ""
                }`}
                onClick={() => handleCopyClick(pointToken)}
                data-tip={tooltipText}
              >
                <div className="flex flex-col items-center">
                  <Image
                    src={rewardsTokenImg}
                    alt=""
                    height={32}
                    width={32}
                    className="rounded-full mb-2"
                  />
                  <p className="font-bold text-base-content/80 text-sm md:text-base">X{pendingPoint?.toString() || 0}</p>
                  <p className="text-xs text-base-content/60">Pending</p>
                </div>
              </div>
            </div>

            <WriteButton
              {...collect}
              className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
