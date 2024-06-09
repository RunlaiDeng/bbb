import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import WriteButton from "../WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import BBBFarmerABI from "@/abi/BBBFarmerABI.json";
const FarmCard = () => {
  const [data, setData] = useState({ value: 0 });
  const { address } = useAccount();
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

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

  const approve = {
    buttonName: "Approve",
    data: {
      abi: ERC20ABI,
      address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
      functionName: "approve",
      args: [address, 0],
    },
  };

  const buy = {
    buttonName: "Buy",
    data: {
      abi: BBBFarmerABI,
      address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
      functionName: "buy",
      args: [data.value],
    },
  };

  const collect = {
    buttonName: "Collect",
    data: {
      abi: BBBFarmerABI,
      address: "0xFa4dDcFa8E3d0475f544d0de469277CF6e0A6Fd1",
      functionName: "collect",
      args: [],
    },
  };

  let showApprove = false;

  return (
    <div className="card m-auto md:w-3/4 w-96 shadow-2xl mt-10">
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
                value={data.value * 257 + " BBB"}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({ value: newValue });
                  }
                }}
                disabled
              />
              <div
                className="btn btn-primary btn-square m-auto"
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
                className="btn btn-accent btn-square m-auto"
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
                className="btn font-black btn-lg mt-5 w-full btn-accent"
              />
            )}
          </div>

          <div>
            <div>Workshop</div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div
                className={`tooltip ${isCopied ? "tooltip-success" : ""}`}
                data-tip={tooltipText}
                onClick={handleCopyClick}
              >
                <div className="grid grid-cols-2 gap-2 rounded-2xl shadow-2xl p-1 cursor-pointer">
                  <Image
                    src={"/farmer.png"}
                    alt=""
                    height={50}
                    width={50}
                    className="mask mask-squircle m-auto"
                  />{" "}
                  <div className="font-black mt-4"> X 0</div>
                </div>
              </div>
              <div
                className={`tooltip ${isCopied ? "tooltip-success" : ""}`}
                data-tip={tooltipText}
                onClick={handleCopyClick}
              >
                <div className="grid grid-cols-2 gap-2 rounded-2xl shadow-2xl p-1 cursor-pointer">
                  <Image
                    src={"/carrot.png"}
                    alt=""
                    height={50}
                    width={50}
                    className="mask mask-squircle m-auto"
                  />{" "}
                  <div className="font-black mt-4"> X 0</div>
                </div>
              </div>
            </div>
            <WriteButton
              {...collect}
              className="btn font-black btn-lg mt-4 w-full btn-secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
