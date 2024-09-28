import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
import copy from "copy-to-clipboard";
const Megadrop = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const handleCopyClick = (msg) => {
    copy(msg);
    setTooltipText("Address copied!");
    setTimeout(() => {
      setTooltipText("Click copy contract address");
    }, 1000);
  };

  const isCopied = tooltipText === "Address copied!";

  const chainId = useChainId();
  const { address } = useAccount();
  const [data, setData] = useState({
    dName: "Memes",
    dSymbol: "MEMES",
    dTotalSupply: 1000000000,
    dDropPercent: 100,
    drop: 0,
  });

  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbb;
  const mbbbv2 = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;



  const { data: reads0, refetch: refetch0 } = useReadContracts({
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
  const mbbbBalance = reads0?.[1]?.result;
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

  const dropTokens = reads1?.map((item) => item?.result);

  const searchClaimAmt = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchClaimAmt.push({
      ...mbbb,
      functionName: "getClaimAmt",
      args: [i, address],
    });
  }

  const { data: reads2 } = useReadContracts({
    contracts: searchClaimAmt,
    multicallAddress: mutilCall?.address,
  });

  const claimAmts = reads2?.map((item) => item?.result);

  const searchClaimed = [];

  for (let i = 0; i < dropTokenLength; i++) {
    searchClaimed.push({
      ...mbbb,
      functionName: "claimed",
      args: [address, i],
    });
  }

  const { data: reads3 } = useReadContracts({
    contracts: searchClaimed,
    multicallAddress: mutilCall?.address,
  });

  const claimed = reads3?.map((item) => item?.result);

  const { data: reads7 } = useReadContracts({
    contracts: [
      {
        ...mbbbv2,
        functionName: "getDropTokenLength",
        args: [],
      },
    ],
    multicallAddress: mutilCall?.address,
  });

  const dropTokenLengthV2 = reads7?.[0]?.result;

  const searchDropTokensV2 = [];

  for (let i = 0; i < dropTokenLengthV2; i++) {
    searchDropTokensV2.push({
      ...mbbbv2,
      functionName: "getDropToken",
      args: [i + 1],
    });
  }

  const { data: reads4, refetch: refetch1 } = useReadContracts({
    contracts: searchDropTokensV2,
    multicallAddress: mutilCall?.address,
  });

  const dropTokensV2 = reads4?.map((item) => item?.result);

  const searchClaimAmtV2 = [];

  for (let i = 0; i < dropTokenLengthV2; i++) {
    searchClaimAmtV2.push({
      ...mbbbv2,
      functionName: "getClaimAmt",
      args: [i + 1, address],
    });
  }

  const { data: reads5 } = useReadContracts({
    contracts: searchClaimAmtV2,
    multicallAddress: mutilCall?.address,
  });

  const claimAmtsV2 = reads5?.map((item) => item?.result);

  const searchClaimedV2 = [];

  for (let i = 0; i < dropTokenLengthV2; i++) {
    searchClaimedV2.push({
      ...mbbbv2,
      functionName: "claimed",
      args: [address, i + 1],
    });
  }

  const { data: reads6 } = useReadContracts({
    contracts: searchClaimedV2,
    multicallAddress: mutilCall?.address,
  });

  const refetch = () => {
    refetch0();
    refetch1();
  };

  const claimedV2 = reads6?.map((item) => item?.result);


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
      args: [address, data?.value],
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
      args: [address, data?.mValue],
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

  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96 border-b pb-1">
        <div></div>
        <div className="text-center font-black mt-2">MEGADROP</div>
        <Link className="text-right" href="/help">
          <button className="btn">?</button>
        </Link>
      </div>

      <div className="card m-auto md:w-3/4 w-96 border-b">
        <div className="card-body font-black">
          <div className="font-black">Your Supplies</div>
          <div className="font-black text-xl">
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
      {/* <div className="text-center mt-5">
        <div
          className="btn btn-success w-max"
          onClick={() => {
            document.getElementById("dropModal").showModal();
          }}
        >
          Start a new token
        </div>
      </div> */}
      <div className="card m-auto md:w-3/4 w-96">
        <div className="card-body font-black">
          <div className="grid grid-cols-2">
            <div className="">Drop History</div>
          </div>
          <div className="border-b rounded-none">
            <div className="flex gap-2">
              <div
                className={
                  "btn btn-ghost hover:text-green-500 hover:bg-inherit" +
                  (data?.drop == 0 ? " text-green-500 bg-inherit" : "")
                }
                onClick={() => {
                  setData({ ...data, drop: 0 });
                }}
              >
                Official
              </div>
              <div
                className={
                  "btn btn-ghost hover:text-green-500 hover:bg-inherit" +
                  (data?.drop == 1 ? " text-green-500 bg-inherit" : "")
                }
                onClick={() => {
                  setData({ ...data, drop: 1 });
                }}
              >
                Community V1
              </div>
              <div
                className={
                  "btn btn-ghost hover:text-green-500 hover:bg-inherit" +
                  (data?.drop == 2 ? " text-green-500 bg-inherit" : "")
                }
                onClick={() => {
                  setData({ ...data, drop: 2 });
                }}
              >
                Community V2
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border-b rounded-none">
            <table className="table">
              {/* head */}
              <thead className="text-center">
                <tr>
                  <th></th>
                  <th>Memes Symbol</th>
                  <th>Drop Amount</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                {data?.drop == 1 &&
                  dropTokens?.map((item, index) => {
                    const claim = {
                      buttonName: "Claim",
                      data: {
                        ...mbbb,
                        functionName: "claim",
                        args: [index],
                      },
                      callback: () => {
                        refetch();
                      },
                    };

                    return (
                      <tr key={index} className="text-center">
                        <th>{index}</th>
                        <td>
                          <div
                            className={`cursor-pointer tooltip ${
                              isCopied ? "tooltip-success" : ""
                            }`}
                            data-tip={tooltipText}
                            onClick={() => {
                              handleCopyClick(item?.token);
                            }}
                          >
                            {item?.symbol}
                          </div>
                        </td>
                        <td>{claimAmts?.[index]?.toString() / 1e18 || 0}</td>
                        <td>
                          {claimed?.[index] ||
                          claimAmts?.[index]?.toString() == 0 ? (
                            <>Unavailable</>
                          ) : (
                            <WriteButton
                              {...claim}
                              className="btn btn-success"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {data?.drop == 2 &&
                  dropTokensV2?.map((item, index) => {
                    const claim = {
                      buttonName: "Claim",
                      data: {
                        ...mbbbv2,
                        functionName: "claim",
                        args: [index + 1, address],
                      },
                      callback: () => {
                        refetch();
                      },
                    };

                    return (
                      <tr key={index} className="text-center">
                        <th>{index + 1}</th>
                        <td>
                          <div
                            className={`cursor-pointer tooltip ${
                              isCopied ? "tooltip-success" : ""
                            }`}
                            data-tip={tooltipText}
                            onClick={() => {
                              handleCopyClick(item?.token);
                            }}
                          >
                            {item?.symbol}
                          </div>
                        </td>
                        <td>{claimAmtsV2?.[index]?.toString() / 1e18 || 0}</td>
                        <td>
                          {claimedV2?.[index] ||
                          claimAmtsV2?.[index]?.toString() == 0 ? (
                            <>Unavailable</>
                          ) : (
                            <WriteButton
                              {...claim}
                              className="btn btn-success"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <dialog id="depositModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Stake BBB</h3>
          </div>

          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={data?.value?.toString() / 1e18}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({
                      ...data,
                      value: BigInt(newValue) * BigInt(1e18),
                    });
                  }
                }}
              />
              <div className="font-black">BBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-black"
                onClick={() => {
                  setData({
                    ...data,
                    value: bbbBalance,
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
                value={data?.mValue?.toString() / 1e18}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (/^\d*$/.test(newValue)) {
                    setData({
                      ...data,
                      mValue: BigInt(newValue) * BigInt(1e18),
                    });
                  }
                }}
              />
              <div className="font-black">mBBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-black"
                onClick={() => {
                  setData({
                    ...data,
                    mValue: mbbbBalance,
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
      <dialog id="dropModal" className="modal font-black">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Drop Memes</h3>
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
              <div className="collapse-title text-left pl-0 text-blue-500">
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
