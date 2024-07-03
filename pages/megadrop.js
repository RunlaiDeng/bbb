import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Image from "next/image";
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
    ],
  });

  const mbbbBalance = reads0?.[1]?.result || 0n / BigInt(1e18);

  const stake = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "depositFor",
      args: [address, data?.value],
    },
    callback: () => {
      refetch();
    },
  };

  return (
    <>
      <div className="card m-auto md:w-3/4 w-96 shadow-2xl mt-10">
        <div className="card-body font-black">
          <div className="text-center font-black">MEGADROP</div>
          <div className="font-black">Your Supplies</div>
          <div className="font-black text-5xl">
            {mbbbBalance?.toString()} BBB
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
            <div className="text-right">
              <button className="btn">?</button>
            </div>
          </div>

          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input type="number" className="grow" placeholder="0.00" />
              <div className="font-black">BBB</div>
              <kbd className="kbd kbd-sm cursor-pointer font-black">max</kbd>
            </label>
          </div>
          <WriteButton {...stake} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
      <dialog id="withdrawModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Withdraw BBB</h3>
            <div className="text-right">
              <button className="btn">?</button>
            </div>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input type="number" className="grow" placeholder="0.00" />
              <div className="font-black">BBB</div>
              <kbd className="kbd kbd-sm cursor-pointer font-black">max</kbd>
            </label>
          </div>
          <WriteButton {...stake} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
    </>
  );
};

export default Megadrop;
