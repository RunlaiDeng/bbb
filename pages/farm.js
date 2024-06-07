import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
const Farm = () => {
  const [data, setData] = useState({ value: 0 });

  const { address } = useAccount();

  console.log(address);

  return (
    <>
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

              <div className="mt-6 grid grid-cols-7 gap-2">
                <input
                  type="text"
                  placeholder="0"
                  className="input input-bordered col-span-5"
                  value={data.value * 3600000 + " BBB"}
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
                    if (data.value - 1 >= 0) {
                      setData({ value: data.value - 1 });
                    }
                  }}
                >
                  -
                </div>
                <div
                  className="btn btn-accent btn-square m-auto"
                  onClick={() => {
                    setData({ value: data.value + 1 });
                  }}
                >
                  +
                </div>
              </div>
              <div className="btn font-black btn-lg mt-4 w-full btn-secondary">
                buy
              </div>
            </div>
            <div>Collect Carrots</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Farm;
