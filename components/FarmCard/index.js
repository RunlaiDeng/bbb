import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
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
                onMouseDown={() => {
                  if (!internalId) {
                    if (data.value >= 1) {
                      setData({ ...data, value: data.value-- });
                    } else {
                      setData({ ...data, value: 0 });
                    }
                    const internalId = setInterval(() => {
                      if (data.value >= 1) {
                        setData({ ...data, value: data.value-- });
                      } else {
                        setData({ ...data, value: 0 });
                      }
                    }, 100);
                    setIntervalId(internalId);
                  }
                }}
                onMouseUp={() => {
                  clearInterval(internalId);
                  setIntervalId(undefined);
                }}
              >
                -
              </div>
              <div
                className="btn btn-accent btn-square m-auto"
                onMouseDown={() => {
                  if (!internalId) {
                    setData({ ...data, value: data.value++ });
                    const internalId = setInterval(() => {
                      setData({ ...data, value: data.value++ });
                    }, 100);
                    setIntervalId(internalId);
                  }
                }}
                onMouseUp={() => {
                  clearInterval(internalId);
                  setIntervalId(undefined);
                }}
              >
                +
              </div>
            </div>
            <div className="btn font-black btn-lg mt-5 w-full btn-success">
              buy
            </div>
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
            <div className="btn font-black btn-lg mt-4 w-full btn-secondary">
              Collect
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
