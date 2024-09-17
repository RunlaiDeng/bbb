import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";
import LightChart from "@/components/LightChart";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import rpc from "@/components/Rpc";

const Swap = () => {
  const router = useRouter();
  const { token } = router.query;

  const chainId = useChainId();
  const { address } = useAccount();
  const [data, setData] = useState({ state: "buy" });

  const mbbb = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;
  const tokenContract = { address: token, abi: ERC20ABI };

  const { data: balance } = useBalance({ address: address });

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getDropTokenByAddress",
        args: [token],
      },
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
    multicallAddress: mutilCall?.address,
  });

  const dropToken = reads0?.[0]?.result;
  const tokenBalance = reads0?.[1]?.result || 0n;
  const xdcBalance = balance?.value || 0n;
  const symbol = dropToken?.symbol;
  const index = dropToken?.index;

  async function getData() {
    const trade = await rpc.getTrade(index?.toString());
    const holders = await rpc.getHolders(token);

    setData({ ...data, trade, holders });
  }

  useEffect(() => {
    getData();
  }, [index, token]);

  const { data: reads1, refetch: refetch1 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "price",
        args: [index],
      },
      {
        ...mbbb,
        functionName: "getBuyAmount",
        args: [index, data?.buyAmount],
      },
      {
        ...mbbb,
        functionName: "getSellAmount",
        args: [index, data?.sellAmount],
      },
    ],
    multicallAddress: mutilCall?.address,
  });
  const refetch = () => {
    refetch0();
    refetch1();
    getData();
  };
  const price = reads1?.[0]?.result;
  const buyTokenAmount = reads1?.[1]?.result;
  const sellXDCAmount = reads1?.[2]?.result;

  const buy = {
    buttonName: "Place Trade",
    data: {
      ...mbbb,
      functionName: "buy",
      args: [index],
      value: data?.buyAmount,
    },
    callback: () => {
      refetch();
    },
  };

  const sell = {
    buttonName: "Place Trade",
    data: {
      ...mbbb,
      functionName: "sell",
      args: [index, data?.sellAmount],
    },
    callback: () => {
      refetch();
    },
  };

  const holders = data?.holders;

  return (
    <>
      <div className="text-center mt-5">
        <div
          className="btn btn-ghost w-max hover:text-green-500 hover:bg-inherit text-2xl"
          onClick={() => {
            router.push("/");
          }}
        >
          [Go back]
        </div>
      </div>
      <div className="m-auto mt-5 grid md:grid-cols-5 gap-2 mx-4">
        <div className="md:col-span-3 font-black text-2xl text-center text-green-500">
          <div className="card bg-slate-100">
            <div className="card-body">
              <LightChart {...data} />
            </div>
          </div>

          <div className="card bg-slate-100 text-xs mt-2">
            <div className="card-body">
              <div className="overflow-auto h-96">
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
                <div className="chat chat-start ">
                  <div className="chat-header">
                    Obi-Wan Kenobi{" "}
                    <time className="text-xs opacity-50">12:45</time>
                  </div>
                  <div className="chat-bubble">You were the Chosen One!</div>
                </div>
              </div>

              <label className="input input-bordered flex items-center gap-2">
                <input type="text" className="grow" placeholder="Type here" />
                <kbd className="kbd kbd-sm">↑</kbd>
              </label>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 text-center">
          <div className="card bg-slate-100">
            <div className="card-body">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={
                    "btn w-full " + (data?.state == "buy" && "btn-success")
                  }
                  onClick={() => {
                    setData({ ...data, state: "buy" });
                  }}
                >
                  Buy
                </div>
                <div
                  className={
                    "btn w-full " + (data?.state == "sell" && "btn-success")
                  }
                  onClick={() => {
                    setData({ ...data, state: "sell" });
                  }}
                >
                  Sell
                </div>
              </div>
              {data?.state == "buy" && (
                <>
                  <label className="input input-bordered flex items-center gap-2">
                    <input
                      type="number"
                      className="grow"
                      value={data?.buyAmount?.toString() / 1e18}
                      placeholder="0"
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (/^\d*\.?\d+$/.test(newValue)) {
                          setData({
                            ...data,
                            buyAmount: BigInt(newValue * 1e18),
                          });
                        }
                      }}
                    />
                    XDC
                    <Image height={30} width={30} src="/xdc.png" alt="" />
                  </label>
                  <div role="tablist" className="tabs">
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          buyAmount: 0,
                        });
                      }}
                    >
                      0%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          buyAmount: (xdcBalance * BigInt(25)) / BigInt(100),
                        });
                      }}
                    >
                      25%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          buyAmount: (xdcBalance * BigInt(50)) / BigInt(100),
                        });
                      }}
                    >
                      50%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          buyAmount: (xdcBalance * BigInt(75)) / BigInt(100),
                        });
                      }}
                    >
                      75%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          buyAmount: xdcBalance,
                        });
                      }}
                    >
                      100%
                    </a>
                  </div>
                  <label className="input input-bordered flex items-center gap-2">
                    <input
                      type="number"
                      className="grow"
                      value={buyTokenAmount?.toString() / 1e18 || 0}
                      disabled
                    />
                    {symbol}
                  </label>
                  <WriteButton {...buy} className="btn btn-success" />
                </>
              )}
              {data?.state == "sell" && (
                <>
                  <label className="input input-bordered flex items-center gap-2">
                    <input
                      type="number"
                      className="grow"
                      value={data?.sellAmount?.toString() / 1e18}
                      placeholder="0"
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (/^\d*\.?\d+$/.test(newValue)) {
                          setData({
                            ...data,
                            sellAmount: BigInt(newValue * 1e18),
                          });
                        }
                      }}
                    />
                    {symbol}
                  </label>
                  <div role="tablist" className="tabs">
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({ ...data, sellAmount: 0 });
                      }}
                    >
                      0%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          sellAmount: (tokenBalance * BigInt(25)) / BigInt(100),
                        });
                      }}
                    >
                      25%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          sellAmount: (tokenBalance * BigInt(50)) / BigInt(100),
                        });
                      }}
                    >
                      50%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          sellAmount: (tokenBalance * BigInt(75)) / BigInt(100),
                        });
                      }}
                    >
                      75%
                    </a>
                    <a
                      role="tab"
                      className="tab btn btn-xs"
                      onClick={() => {
                        setData({
                          ...data,
                          sellAmount: tokenBalance,
                        });
                      }}
                    >
                      100%
                    </a>
                  </div>
                  <label className="input input-bordered flex items-center gap-2">
                    <input
                      type="number"
                      className="grow"
                      value={sellXDCAmount?.toString() / 1e18 || 0}
                      disabled
                    />
                    XDC
                    <Image height={30} width={30} src="/xdc.png" alt="" />
                  </label>
                  <WriteButton {...sell} className="btn btn-success" />
                </>
              )}
            </div>
          </div>
          <div className="card bg-slate-100 mt-2">
            <div className="card-body">
              <div className="font-black mt-4 text-left">
                <div>
                  Price :{" "}
                  <span className="text-green-500">
                    {price?.toString() / 1e18 + " XDC"}
                  </span>
                </div>
                <div>
                  Name :{" "}
                  <span className="text-green-500">{dropToken?.name}</span>
                </div>
                <div>
                  Symbol :{" "}
                  <span className="text-green-500">{dropToken?.symbol}</span>
                </div>
                <div>
                  Contract Address :{" "}
                  <span className="text-green-500">{dropToken?.token}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-slate-100 mt-2 ">
            <div className="card-body">
              <div className="overflow-auto h-96">
                <table className="table table-xs">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Address</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders?.map((item, index) => {
                      return (
                        <tr key={index}>
                          <th>{index + 1}</th>
                          <td>{item?.address}</td>
                          <td>{item?.balance}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Swap;
