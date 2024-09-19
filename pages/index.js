import { useReadContracts, useChainId, useAccount, useBalance } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState, useEffect } from "react";
import Link from "next/link";
import { buyXDCLink } from "@/config";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import ImageUpload from "@/components/ImageUpload";

const Home = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const chainId = useChainId();
  console.log(chainId);
  useEffect(() => {
    if (chainId && chainId != 551) {
      router.push("/v1");
    }
  }, [chainId]);

  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address });
  const [data, setData] = useState({
    dName: "",
    dSymbol: "",
  });

  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbbv2;
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
        functionName: "deployFee",
        args: [],
      },
    ],
    multicallAddress: mutilCall?.address,
  });

  const allowance = reads0?.[0]?.result;
  const bbbBalance = reads0?.[2]?.result;

  const dropTokenLength = reads0?.[3]?.result;
  const price = reads0?.[4]?.result;

  console.log(price);

  const searchDropTokens = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchDropTokens.push({
      ...mbbb,
      functionName: "getDropToken",
      args: [i + 1],
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

  const router = useRouter();

  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const drop = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "drop",
      args: [data?.dName, data?.dSymbol],
      value: price,
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

  const logos = {};

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

      <div className="w-96 m-auto mt-5 grid grid-cols-5 gap-2">
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
              console.log(item);
              const logo = logos[item?.token];
              const percent =
                (100 * item?.xdcAmount?.toString()) / item?.maxXdc?.toString();
              return (
                <div
                  className="card card-side bg-slate-100 cursor-pointer"
                  key={index}
                  onClick={() => {
                    router.push("/swap/" + item?.token);
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
                    <div>Created by {"..." + item?.deployer?.substr(36)}</div>
                    <div className="text-xl">
                      {item?.name} (${item?.symbol})
                    </div>
                    <div>
                      <span className="opacity-50"> Market Cap: </span>
                      <span>{item?.xdcAmount?.toString() / 1e18} XDC </span>
                      <span className="opacity-50"> ({percent}%)</span>
                    </div>
                    <progress
                      className="progress progress-success w-56"
                      value={percent}
                      max="100"
                    ></progress>
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
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Image <span className="text-green-500">*</span>
                </span>
              </div>
              <ImageUpload />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Name <span className="text-green-500">*</span>
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full "
                value={data?.dName}
                onChange={(e) => {
                  setData({ ...data, dName: e.target.value });
                }}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Symbol <span className="text-green-500">*</span>
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                value={data?.dSymbol}
                onChange={(e) => {
                  setData({ ...data, dSymbol: e.target.value });
                }}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">
                  Token Decription <span className="text-green-500">*</span>
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered h-24"
                value={data?.dDesciption}
                onChange={(e) => {
                  setData({ ...data, dDesciption: e.target.value });
                }}
              ></textarea>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Website</span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Optional"
                value={data?.dDesciption}
                onChange={(e) => {
                  setData({ ...data, dDesciption: e.target.value });
                }}
              ></input>
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Telegram</span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Optional"
                value={data?.dDesciption}
                onChange={(e) => {
                  setData({ ...data, dDesciption: e.target.value });
                }}
              ></input>
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">twitter</span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Optional"
                value={data?.dDesciption}
                onChange={(e) => {
                  setData({ ...data, dDesciption: e.target.value });
                }}
              ></input>
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
              Cost
              <input
                type="text"
                className="grow"
                placeholder={(price || 0n) / BigInt(1e18)}
                disabled
              />
              <div className="font-black">XDC</div>
            </label>
          </div>
          <div className="mt-1 text-xs">Available {balance?.formatted} XDC</div>
          {!bbbIsEnough && (
            <Link
              className="underline text-xs"
              href={buyXDCLink}
              target="_blank"
            >
              XDC is not enough ?
            </Link>
          )}
          <WriteButton {...drop} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
    </>
  );
};

export default Home;
