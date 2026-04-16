import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { contracts } from "@/config";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContracts,
} from "wagmi";
import WriteButton from "@/components/WriteButton";
import Link from "next/link";
import usePrivyLogin from "@/components/Hook/usePrivyLogin";

const BpsXDC = () => {
  const [data, setData] = useState({
    stakeAmount: "",
    unstakeAmount: "",
    showStakeModal: false,
    showUnstakeModal: false,
  });

  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const privyLogin = usePrivyLogin();

  // Get contract addresses from config
  const psXDCAddress = contracts[chainId]?.psXDC?.address;
  const bpsXDCAddress = contracts[chainId]?.bpsXDC?.address;

  // Read contract data
  const { data: contractData, refetch: refetchContractData } = useReadContracts({
    contracts: [
      // User's psXDC balance
      {
        address: psXDCAddress,
        abi: contracts[chainId]?.psXDC?.abi,
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      // User's bpsXDC balance
      {
        address: bpsXDCAddress,
        abi: contracts[chainId]?.bpsXDC?.abi,
        functionName: "balanceOf",
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
      // psXDC allowance for bpsXDC contract
      {
        address: psXDCAddress,
        abi: contracts[chainId]?.psXDC?.abi,
        functionName: "allowance",
        args: [
          address || "0x0000000000000000000000000000000000000000",
          bpsXDCAddress,
        ],
      },
      // Get psXDC symbol
      {
        address: psXDCAddress,
        abi: contracts[chainId]?.psXDC?.abi,
        functionName: "symbol",
      },
      // Get bpsXDC symbol
      {
        address: bpsXDCAddress,
        abi: contracts[chainId]?.bpsXDC?.abi,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: !!psXDCAddress && !!bpsXDCAddress && !!address,
    },
  });

  const refreshData = () => {
    refetchContractData();
  };

  useEffect(() => {
    if (isConnected) {
      refreshData();
    }
  }, [isConnected, address]);

  // Extract data from contract calls
  const psXDCBalance = contractData?.[0]?.result || BigInt(0);
  const bpsXDCBalance = contractData?.[1]?.result || BigInt(0);
  const allowance = contractData?.[2]?.result || BigInt(0);
  const psXDCSymbol = contractData?.[3]?.result || "psXDC";
  const bpsXDCSymbol = contractData?.[4]?.result || "bpsXDC";

  // Create action objects for WriteButton components
  const createActions = () => {
    return {
      approve: {
        buttonName: "Approve",
        data: {
          address: psXDCAddress,
          abi: contracts[chainId]?.psXDC?.abi,
          functionName: "approve",
          args: [bpsXDCAddress, parseEther("10000000000")], // Large approval amount
        },
        callback: () => {
          refreshData();
        },
      },
      stake: {
        buttonName: "Stake",
        data: {
          address: bpsXDCAddress, 
          abi: contracts[chainId]?.bpsXDC?.abi,
          functionName: "depositFor",
          args: [address, data.stakeAmount ? parseEther(data.stakeAmount) : BigInt(0)],
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
            ...prev,
            showStakeModal: false,
            stakeAmount: "",
          }));
        },
        disabled: !data.stakeAmount || parseEther(data.stakeAmount) <= BigInt(0) || parseEther(data.stakeAmount) > psXDCBalance,
      },
      unstake: {
        buttonName: "Unstake",
        data: {
          address: bpsXDCAddress,
          abi: contracts[chainId]?.bpsXDC?.abi,
          functionName: "withdrawTo",
          args: [address, data.unstakeAmount ? parseEther(data.unstakeAmount) : BigInt(0)],
        },
        callback: () => {
          refreshData();
          setData((prev) => ({
            ...prev,
            showUnstakeModal: false,
            unstakeAmount: "",
          }));
        },
        disabled: !data.unstakeAmount || parseEther(data.unstakeAmount) <= BigInt(0) || parseEther(data.unstakeAmount) > bpsXDCBalance,
      },
    };
  };

  // Handle stake modal
  const openStakeModal = () => {
    setData((prev) => ({ ...prev, showStakeModal: true }));
  };

  const closeStakeModal = () => {
    setData((prev) => ({ ...prev, showStakeModal: false, stakeAmount: "" }));
  };

  // Handle unstake modal
  const openUnstakeModal = () => {
    setData((prev) => ({ ...prev, showUnstakeModal: true }));
  };

  const closeUnstakeModal = () => {
    setData((prev) => ({ ...prev, showUnstakeModal: false, unstakeAmount: "" }));
  };

  // Set max amount for stake
  const setMaxStakeAmount = () => {
    setData((prev) => ({
      ...prev,
      stakeAmount: formatEther(psXDCBalance),
    }));
  };

  // Set max amount for unstake
  const setMaxUnstakeAmount = () => {
    setData((prev) => ({
      ...prev,
      unstakeAmount: formatEther(bpsXDCBalance),
    }));
  };

  // Handle stake amount input change
  const handleStakeAmountChange = (e) => {
    const value = e.target.value;
    if ((/^(0|[1-9]\d*)(\.\d*)?$/.test(value) || value === "")) {
      setData((prev) => ({ ...prev, stakeAmount: value }));
    }
  };

  // Handle unstake amount input change
  const handleUnstakeAmountChange = (e) => {
    const value = e.target.value;
    if ((/^(0|[1-9]\d*)(\.\d*)?$/.test(value) || value === "")) {
      setData((prev) => ({ ...prev, unstakeAmount: value }));
    }
  };

  // Get action objects
  const actions = createActions();

  // Render pool card
  const renderPoolCard = () => {
    return (
      <div className="space-y-6 mb-8 p-6 bg-base-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{psXDCSymbol} Staking</h2>
          <div className="text-primary font-bold text-lg">
            0% APR
          </div>
        </div>

        <div className="space-y-4">
          {isConnected ? (
            <>
              <div className="flex justify-between items-center py-2 border-b border-base-300">
                <span className="text-base-content/50">Your {psXDCSymbol} Balance</span>
                <div className="font-medium">
                  {Number(formatEther(psXDCBalance))?.toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                  )}{" "}
                  {psXDCSymbol}
                  <Link
                    href="https://primestaking.xyz/xdc-liquid-staking"
                    className="ml-1 text-xs text-primary hover:underline"
                    target="_blank"
                  >
                    Get {psXDCSymbol}
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-base-300">
                <span className="text-base-content/50">Your {bpsXDCSymbol} Balance</span>
                <div className="font-medium">
                  {Number(formatEther(bpsXDCBalance))?.toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                  )}{" "}
                  {bpsXDCSymbol}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex justify-between items-center py-2 border-b border-base-300">
            <span className="text-base-content/50">Exchange Rate</span>
            <div className="font-medium">1 {psXDCSymbol} = 1 {bpsXDCSymbol}</div>
          </div>
        </div>

        {isConnected ? (
          <>
            <div className="flex gap-4 pt-4">
              <button
                className="flex-1 py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                onClick={openStakeModal}
              >
                Stake {psXDCSymbol}
              </button>
              <button
                className="flex-1 py-2 px-4 text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
                onClick={openUnstakeModal}
                disabled={bpsXDCBalance <= BigInt(0)}
              >
                Unstake {psXDCSymbol}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4 mt-4 bg-base-200/60 rounded-lg">
            <p className="mb-4 text-base-content/60">
              Connect your wallet to stake and earn rewards
            </p>
            <button
              className="btn bg-green-600 text-white hover:bg-green-700 py-2 px-6 rounded-md"
              onClick={privyLogin}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render main content
  return (
    <div className="m-auto md:w-3/4 w-96 mt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">psXDC Staking</h1>
        <div className="text-sm text-success">🌊 Stake to earn</div>
      </div>

      {/* Pool Card */}
      {renderPoolCard()}

      {/* Information Section */}
      <div className="space-y-6 mb-8 p-6 bg-base-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold">About {psXDCSymbol} Staking</h2>
        <p className="text-base-content/60 mb-3">
          Stake your {psXDCSymbol} tokens to receive {bpsXDCSymbol} tokens, which represent your staked position.
          You can unstake your {psXDCSymbol} at any time by converting your {bpsXDCSymbol} tokens back to {psXDCSymbol}.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h3 className="text-amber-700 font-medium mb-1">Fee Notice</h3>
          <p className="text-amber-700 text-sm">
            There is a 1% fee for unstaking your {psXDCSymbol}. This fee is deducted from your unstaking amount.
          </p>
        </div>
        <div className="mt-4">
          <Link
            href="https://primestaking.xyz/xdc-liquid-staking"
            className="text-primary hover:text-success font-medium flex items-center"
            target="_blank"
          >
            <span>Get {psXDCSymbol} tokens from Prime Staking</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Stake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showStakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Stake {psXDCSymbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={closeStakeModal}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-base-200/60 p-2 rounded-lg border border-base-300">
              <input
                type="text"
                className="grow outline-none bg-transparent"
                placeholder="0.00"
                value={data.stakeAmount}
                onChange={handleStakeAmountChange}
              />
              <div className="font-medium">{psXDCSymbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-primary/10 px-2 py-1 bg-base-300 rounded text-xs"
                onClick={setMaxStakeAmount}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-base-content/50">
              <span>Available</span>
              <span>
                {Number(formatEther(psXDCBalance)).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                )} {psXDCSymbol}
                <Link
                  href="https://primestaking.xyz/xdc-liquid-staking"
                  className="ml-1 text-xs text-primary hover:underline"
                  target="_blank"
                >
                  Get more
                </Link>
              </span>
            </div>

            {/* Show approve button if allowance is less than stake amount */}
            {allowance < (data.stakeAmount ? parseEther(data.stakeAmount) : BigInt(0)) ? (
              <WriteButton
                {...actions.approve}
                className="btn w-full btn-primary border-none hover:shadow-lg py-2 px-4 rounded-md"
              >
                Approve {psXDCSymbol}
              </WriteButton>
            ) : (
              <WriteButton
                {...actions.stake}
                className="btn w-full btn-primary border-none hover:shadow-lg py-2 px-4 rounded-md"
              >
                Stake {psXDCSymbol}
              </WriteButton>
            )}
          </div>
        </div>
      </div>

      {/* Unstake Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          data.showUnstakeModal ? "" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-2xl p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Unstake {psXDCSymbol}
            </h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={closeUnstakeModal}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <label className="input input-bordered flex items-center gap-2 w-full bg-base-200/60 p-2 rounded-lg border border-base-300">
              <input
                type="text"
                className="grow outline-none bg-transparent"
                placeholder="0.00"
                value={data.unstakeAmount}
                onChange={handleUnstakeAmountChange}
              />
              <div className="font-medium">{bpsXDCSymbol}</div>
              <kbd
                className="kbd kbd-sm cursor-pointer hover:bg-primary/10 px-2 py-1 bg-base-300 rounded text-xs"
                onClick={setMaxUnstakeAmount}
              >
                max
              </kbd>
            </label>

            <div className="flex justify-between text-sm text-base-content/50">
              <span>Available</span>
              <span>
                {Number(formatEther(bpsXDCBalance)).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 4, maximumFractionDigits: 4 }
                )} {bpsXDCSymbol}
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-amber-700 text-sm">
              <p>
                <span className="font-bold">Note:</span> A 1% fee will be charged on your unstaking amount.
              </p>
              <p className="mt-1">
                You will receive {data.unstakeAmount ? (Number(data.unstakeAmount) * 0.99).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "0.0000"} {psXDCSymbol} after fee.
              </p>
            </div>

            <WriteButton
              {...actions.unstake}
              className="btn w-full btn-primary border-none hover:shadow-lg py-2 px-4 rounded-md"
            >
              Unstake {psXDCSymbol}
            </WriteButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BpsXDC;
