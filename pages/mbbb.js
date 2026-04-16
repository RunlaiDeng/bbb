import { useReadContracts, useChainId, useAccount } from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useEffect, useState } from "react";
import Link from "next/link";
import { dexLink } from "@/config";
import copy from "copy-to-clipboard";
import { formatEther, parseEther } from "viem";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";
import rpc from "@/components/Rpc";
const Stake = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const [data, setData] = useState({
    dName: "Memes",
    dSymbol: "MEMES",
    dTotalSupply: 1000000000,
    dDropPercent: 100,
    drop: 2,
    showDepositModal: false,
    showWithdrawModal: false,
  });

  const handleCopyClick = (msg) => {
    copy(msg);
    setTooltipText("Address copied!");
    setTimeout(() => {
      setTooltipText("Click copy contract address");
    }, 1000);
  };

  const isCopied = tooltipText === "Address copied!";

  useEffect(() => {
    async function fetchdata(params) {
      const graduateTokkens = await rpc.getGraduateTokens();

      setData({ ...data, graduateTokkens });
    }
    fetchdata();
  }, []);

  const chainId = useChainId();
  const { address } = useAccount();

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

  const refetch = () => {
    refetch0();
  };

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
      setData((prev) => ({ ...prev, showDepositModal: false }));
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
      setData((prev) => ({ ...prev, showWithdrawModal: false }));
    },
  };

  const bbbIsEnough = false;

  let showApprove = true;
  if (allowance && allowance > (data?.value || 0)) {
    showApprove = false;
  }

  const { isConnected } = useAccount();

  const graduateTokkens = data?.graduateTokkens;

  const privyLogin = usePrivyLogin();

  const searchGraduatedTokens = graduateTokkens?.map((item) => {
    return {
      ...mbbbv2,
      functionName: "getClaimAmt",
      args: [item?.index, address],
    };
  });

  const searchClaimed = graduateTokkens?.map((item) => {
    return {
      ...mbbbv2,
      functionName: "claimed",
      args: [address, item?.index],
    };
  });

  const { data: reads1 } = useReadContracts({
    contracts: searchGraduatedTokens,
  });
  const { data: reads2 } = useReadContracts({ contracts: searchClaimed });
  const claimedV2 = reads2?.map((item) => item?.result);
  const dropTokensV2 = reads1?.map((item) => item?.result);

  const showList = dropTokensV2?.length > 0;

  console.log(claimedV2);

  return (
    <>
      <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
        <div className="bg-gradient-to-br from-primary/90 via-base-300 to-base-200 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-primary">
            BBB Staking
          </h1>
          <div className="text-sm bg-base-200/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
            🔒 Stake BBB to earn rewards and participate in airdrops
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-base-200 p-6 rounded-xl border border-primary/20 text-base-content/70">
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Your Staked Balance</p>
              <p className="text-3xl font-bold text-primary">
                {((mbbbBalance?.toString() || 0) / 1e18)?.toLocaleString()} mBBB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="btn btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => {
                  if (!isConnected) {
                    privyLogin();
                  } else {
                    setData((prev) => ({ ...prev, showDepositModal: true }));
                  }
                }}
              >
                Stake BBB
              </button>
              <button
                className="btn bg-base-200 border-2 border-primary text-primary hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => {
                  if (!isConnected) {
                    privyLogin();
                  } else {
                    setData((prev) => ({ ...prev, showWithdrawModal: true }));
                  }
                }}
              >
                Unstake BBB
              </button>
            </div>
          </div>
        </div>

        <div className="bg-base-200 rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Airdrop List
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-base-content/60">
                  <th>Coin</th>
                  <th>Total Airdrop</th>
                  <th>My Staked</th>
                  <th>Total Staked</th>
                  <th>My Stake Percentage</th>
                  <th>My Airdrop</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {showList &&
                  dropTokensV2?.map((item, index) => {
                    const tokenObj = graduateTokkens[index];

                    const claim = {
                      buttonName: "Claim",
                      data: {
                        ...mbbbv2,
                        functionName: "claim",
                        args: [tokenObj?.index, address],
                      },
                      callback: () => {
                        refetch();
                      },
                    };

                    const airdropAmount = item?.[0];
                    const totalAirdropAmount = item?.[1];
                    const stakeMbbbAmount = item?.[2];
                    const totalStakeMbbbAmount = item?.[3];
                    const stakePercent =
                      (100 * stakeMbbbAmount?.toString() || 0) /
                        totalStakeMbbbAmount?.toString() || 0;

                    const claimed = claimedV2[index];
                    console.log(claimedV2[index]);
                    return (
                      <tr
                        key={item?.index}
                        className="hover:bg-primary/10 transition-colors whitespace-nowrap"
                      >
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
                            {tokenObj?.symbol}
                          </div>
                        </td>
                        <td>
                          {Number(
                            totalAirdropAmount?.toString() / 1e18 || 0
                          ).toLocaleString()}{" "}
                          {tokenObj?.symbol}
                        </td>
                        <td>
                          {Number(
                            stakeMbbbAmount?.toString() / 1e18 || 0
                          ).toLocaleString()}{" "}
                          BBB
                        </td>
                        <td>
                          {Number(
                            totalStakeMbbbAmount?.toString() / 1e18 || 0
                          ).toLocaleString()}{" "}
                          BBB
                        </td>
                        <td>
                          {Number(
                            stakePercent?.toString() || 0
                          ).toLocaleString()}
                          %
                        </td>
                        <td>
                          {Number(
                            airdropAmount?.toString() / 1e18 || 0
                          ).toLocaleString()}{" "}
                          {tokenObj?.symbol}
                        </td>
                        <td>
                          {claimed || airdropAmount?.toString() == 0 ? (
                            <span className="text-base-content/40">Unavailable</span>
                          ) : (
                            <WriteButton
                              {...claim}
                              className="btn btn-sm btn-primary border-none hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!showList && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-base-content/40">
                      No drop history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        id="depositModal"
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
          data.showDepositModal ? "" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Stake BBB
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setData((prev) => ({ ...prev, showDepositModal: false }))
              }
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-base-200/60">
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
              <div className="font-medium">BBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-primary/10"
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

            <div className="flex justify-between text-sm text-base-content/50">
              <span>Available</span>
              <span>{(bbbBalance?.toString() || 0) / 1e18} BBB</span>
            </div>

            {!bbbIsEnough && (
              <Link
                className="text-sm text-primary hover:text-success block"
                href={dexLink}
              >
                Need more BBB?
              </Link>
            )}

            {showApprove ? (
              <WriteButton
                {...approve}
                className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              />
            ) : (
              <WriteButton
                {...stake}
                className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              />
            )}
          </div>
        </div>
      </div>

      <div
        id="withdrawModal"
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
          data.showWithdrawModal ? "" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Unstake BBB
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() =>
                setData((prev) => ({ ...prev, showWithdrawModal: false }))
              }
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-base-200/60">
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
              <div className="font-medium">mBBB</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-primary/10"
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

            <div className="flex justify-between text-sm text-base-content/50">
              <span>Available</span>
              <span>{(mbbbBalance?.toString() || 0) / 1e18} mBBB</span>
            </div>

            <WriteButton
              {...unStake}
              className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Stake;
