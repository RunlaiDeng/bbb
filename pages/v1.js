import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const Home = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

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
  const bbbBalance = reads0?.[2]?.result;

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

  let dropTokens = reads1?.map((item) => item?.result);

  if (data?.search) {
    dropTokens = dropTokens.filter((item) => {
      return (
        item?.token?.toLowerCase()?.includes(data?.search?.toLowerCase()) ||
        item?.name?.toLowerCase().includes(data?.search?.toLowerCase()) ||
        item?.symbol?.toLowerCase().includes(data?.search?.toLowerCase())
      );
    });
  }

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

  const logos = {
    "0xF05bCACAf95EAA7f4361ff85Ce1F45533ec10295": true,
    "0x20F179bA842d349ff789D86792B941af17509e44": true,
    "0x34b9d4a27b93E0a128e0945ab0e2D1C49385Ec90": true,
    "0xc430dCB2680B7E4c715d208E41Cc8Fa2fAc3F513": true,
    "0x59A3fCCA7dA1855e4b5d82Fa2571c4726AF10218": true,
    "0x6819AdAdeFa242427520A09d3CE13f8759d2f9b8": true,
  };

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  return (
    <>
      <div className="text-center mt-5">
        <div
          className="btn btn-ghost w-max hover:text-green-500 hover:bg-inherit text-2xl"
          onClick={() => {
            if (!isConnected) {
              openConnectModal();
            } else {
              document.getElementById("dropModal").showModal();
            }
          }}
        >
          [Start a new token]
        </div>
      </div>

      <div className="w-72 md:w-96 m-auto mt-5 grid grid-cols-5 gap-2">
        <label className="input input-bordered flex items-center gap-2 col-span-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            id="search"
            className="grow"
            placeholder="search for token"
          />
        </label>
        <div
          className="btn btn-success w-max m-auto col-span-1"
          onClick={() => {
            document.getElementById("search").value;
            setData({
              ...data,
              search: document.getElementById("search").value,
            });
          }}
        >
          Search
        </div>
      </div>

      <div className="card m-auto md:w-full w-96">
        <div className="card-body font-black">
          <div className="grid grid-cols-2">
            <div className="">Terminal</div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dropTokens?.map((item, index) => {
              const logo = logos[item?.token];
              return (
                <div
                  className="card card-side bg-slate-100 cursor-pointer"
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
                      height={100}
                      width={100}
                      src={
                        logo ? "/" + item?.token + ".png" : "/didntupload.png"
                      }
                      alt={item?.name}
                      className="ml-10 "
                      style={{
                        objectFit: "contain",
                        width: "75px",
                        height: "75px",
                      }}
                    />
                  </figure>
                  <div className="card-body text-xs">
                    <div>Market Cap: 0</div>
                    <div>
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
            <h3 className="font-bold text-lg text-center mt-2">
              Start a new token
            </h3>
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
            Avbl {((bbbBalance || 0n) / BigInt(1e18))?.toString()} BBB
          </div>
          {!bbbIsEnough && (
            <Link className="underline text-xs" href={dexLink}>
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
