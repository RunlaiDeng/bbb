import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
import copy from "copy-to-clipboard";
import { formatEther, parseEther } from "viem";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
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
    drop: 2,
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
    ],
  });

  const allowance = reads0?.[0]?.result;
  const mbbbBalance = reads0?.[1]?.result;
  const bbbBalance = reads0?.[2]?.result;

  const { data: reads7 } = useReadContracts({
    contracts: [
      {
        ...mbbbv2,
        functionName: "getDropTokenLength",
        args: [],
      },
    ],
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
  });

  let dropTokensV2 = reads4?.filter((item) => item?.result?.removed == 1n);

  dropTokensV2 = dropTokensV2?.map((item) => item?.result);

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

  const bbbIsEnough = false;

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0)) {
    showApprove = false;
  }

  const { isConnected } = useAccount();

  const privyLogin = usePrivyLogin();

  return (
    <>
      <div className="m-auto md:w-3/4 w-96 py-1">
        <div className="text-center font-bold mt-2">MEGADROP</div>
      </div>

      <div className="card m-auto md:w-3/4 w-96 ">
        <div className="card-body font-bold">
          <div className="font-bold">Your Supplies</div>
          <div className="font-bold text-xl   text-green-700">
            {((mbbbBalance?.toString() || 0) / 1e18)?.toFixed(6)} mBBB
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label
              className="btn font-bold btn-lg mt-5 w-full btn-success m-auto"
              onClick={() => {
                if (!isConnected) {
                  privyLogin();
                } else {
                  document.getElementById("depositModal").showModal();
                }
              }}
            >
              Stake
            </label>
            <label
              className="btn font-bold btn-lg mt-5 w-full m-auto"
              onClick={() => {
                if (!isConnected) {
                  privyLogin();
                } else {
                  document.getElementById("withdrawModal").showModal();
                }
              }}
            >
              Unstake
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
        <div className="card-body font-bold">
          <div className="grid grid-cols-2">
            <div className="">Drop History</div>
          </div>

          <div className="overflow-x-auto  rounded-none">
            <table className="table">
              {/* head */}
              <thead className="text-center">
                <tr>
                  <th>Coin</th>
                  <th>Total Airdrop Amount</th>
                  <th>My Staked BBB Amount</th>
                  <th>Total Staked BBB</th>
                  <th>My Staked BBB Percentage</th>
                  <th>My Airdrop Amount</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                {dropTokensV2?.map((item, index) => {
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

                  const amtsv2 = claimAmtsV2?.[index];

                  const airdropAmount = amtsv2?.[0];
                  const totalAirdropAmount = amtsv2?.[1];
                  const stakeMbbbAmount = amtsv2?.[2];
                  const totalStakeMbbbAmount = amtsv2?.[3];
                  const stakePercent =
                    (100 * stakeMbbbAmount?.toString() || 0) /
                      totalStakeMbbbAmount?.toString() || 0;

                  return (
                    <tr key={item?.index} className="text-center">
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
                      <td>{totalAirdropAmount?.toString() / 1e18 || 0}</td>
                      <td>{stakeMbbbAmount?.toString() / 1e18 || 0}</td>
                      <td>{totalStakeMbbbAmount?.toString() / 1e18 || 0}</td>
                      <td>{stakePercent?.toString() || 0} %</td>
                      <td>{airdropAmount?.toString() / 1e18 || 0}</td>
                      <td>
                        {!amtsv2 || airdropAmount?.toString() == 0 ? (
                          <>Unavailable</>
                        ) : (
                          <WriteButton {...claim} className="btn btn-success" />
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
      <dialog id="depositModal" className="modal font-bold">
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
                value={data?.value >= 0 ? formatEther(data?.value) : undefined}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (!newValue) {
                    setData({
                      ...data,
                      value: undefined,
                    });
                  }

                  if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                    setData({
                      ...data,
                      value: parseEther(newValue),
                    });
                  }
                }}
              />
              <div className="font-bold">BBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-bold"
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
            Avbl {(bbbBalance?.toString() || 0) / 1e18} BBB
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
            <WriteButton {...stake} className="btn mt-5 w-full btn-success" />
          )}
        </div>
      </dialog>
      <dialog id="withdrawModal" className="modal font-bold">
        <div className="modal-box">
          <div className="grid grid-cols-3">
            <form method="dialog">
              <button className="btn">X</button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">Unstake BBB</h3>
          </div>
          <div className="text-center mt-5">
            <label className="input input-bordered flex items-center gap-2 w-full m-auto">
              <input
                type="number"
                className="grow"
                placeholder="0.00"
                value={
                  data?.mValue >= 0 ? formatEther(data?.mValue) : undefined
                }
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (!newValue) {
                    setData({
                      ...data,
                      mValue: undefined,
                    });
                  }

                  if (/^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)) {
                    setData({
                      ...data,
                      mValue: parseEther(newValue),
                    });
                  }
                }}
              />
              <div className="font-bold">mBBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer font-bold"
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
            Avbl {(mbbbBalance?.toString() || 0) / 1e18} mBBB
          </div>
          <WriteButton {...unStake} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
    </>
  );
};

export default Megadrop;
