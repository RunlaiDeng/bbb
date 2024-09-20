import { useRouter } from "next/router";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { contracts } from "@/config";
import LightChart from "@/components/LightChart";
import WriteButton from "@/components/WriteButton";
import ERC20ABI from "@/abi/ERC20ABI.json";
import rpc from "@/components/Rpc";
import Link from "next/link";

const Swap = () => {
  const router = useRouter();
  const { token } = router.query;

  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

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
      {
        ...tokenContract,
        functionName: "totalSupply",
      },
    ],
    multicallAddress: mutilCall?.address,
  });

  const dropToken = reads0?.[0]?.result;
  const tokenBalance = reads0?.[1]?.result || 0n;
  const totalSupply = reads0?.[2]?.result || 0n;
  const xdcBalance = balance?.value || 0n;
  const symbol = dropToken?.symbol;
  const index = dropToken?.index;
  const xdcAmount = dropToken?.xdcAmount;
  const removed = dropToken?.removed;
  const maxXdc = dropToken?.maxXdc;

  async function getData() {
    if (index) {
      const trade = await rpc.getTrade(index?.toString());
      const holders = await rpc.getHolders(token);
      const msg = await rpc.getMsg(index?.toString());

      setData({ ...data, trade, holders, msg, sendMsgContent: "" });
    }
  }

  useEffect(() => {
    getData();
  }, [index]);

  console.log(data?.msg);

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
  };
  const price = reads1?.[0]?.result;
  const buyTokenAmount = reads1?.[1]?.result;
  const sellXDCAmount = reads1?.[2]?.result;

  console.log(price);

  const buy = {
    buttonName: "Place Trade",
    disabled: removed,
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
    disabled: removed,
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
  const msg = data?.msg;

  return (
    mount && (
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
        <div className="card m-auto font-black mx-4 grid text-xs">
          <div className="card-body">
            <div className="text-xl">
              {dropToken?.name} (${dropToken?.symbol})
            </div>

            <div>
              <span className="opacity-50">Price : </span>

              <span className="">{price?.toString() / 1e18 + " XDC"}</span>
            </div>

            <div>
              <span className="opacity-50"> Total Supply : </span>

              <span className="">
                {totalSupply?.toString() / 1e18 + " " + dropToken?.symbol}
              </span>
            </div>
            <div>
              <span className="opacity-50"> Contract Address : </span>

              <span className="">{dropToken?.token}</span>
            </div>
          </div>
        </div>
        <div className="m-auto grid md:grid-cols-5 gap-2 mx-4">
          <div className="md:col-span-3 font-black text-2xl text-center">
            <div className="card bg-slate-100">
              <div className="card-body">
                <LightChart {...data} />
              </div>
            </div>

            <div className="card bg-slate-100 text-xs mt-2">
              <div className="card-body">
                <div className="overflow-auto h-96">
                  {msg?.map((item) => {
                    return (
                      <>
                        <div className="chat chat-start ">
                          <div className="chat-header">
                            {item?.ip}{" "}
                            <time className="text-xs opacity-50">
                              {item?.time}
                            </time>
                          </div>
                          <div className="chat-bubble">{item?.msg}</div>
                        </div>
                      </>
                    );
                  })}
                </div>

                <label className="input input-bordered flex items-center gap-2">
                  <input
                    type="text"
                    className="grow"
                    value={data?.sendMsgContent}
                    placeholder="Type Here"
                    onChange={(e) => {
                      setData({ ...data, sendMsgContent: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setData({ ...data, sendMsgContent: "" });
                        rpc.sendMsg(index?.toString(), data?.sendMsgContent);

                        getData();
                      }
                    }}
                  />
                  <kbd
                    className="kbd kbd-sm cursor-pointer"
                    onClick={() => {
                      setData({ ...data, sendMsgContent: "" });
                      rpc.sendMsg(index?.toString(), data?.sendMsgContent);

                      getData();
                    }}
                  >
                    ↑
                  </kbd>
                </label>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 text-center">
            <div className="card bg-slate-100">
              <div className="card-body font-black">
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
                            sellAmount:
                              (tokenBalance * BigInt(25)) / BigInt(100),
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
                            sellAmount:
                              (tokenBalance * BigInt(50)) / BigInt(100),
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
                            sellAmount:
                              (tokenBalance * BigInt(75)) / BigInt(100),
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
                  {removed && (
                    <div className="grid grid-cols-2">
                      <div className="text-red-500">Liquidity Moved</div>

                      <Link
                        className="btn btn-success"
                        href={
                          "https://icecreamswap.com/swap?chain=xdc&outputCurrency=" +
                          token +
                          "&inputCurrency=XDC"
                        }
                        target={"_blank"}
                      >
                        Go swap
                      </Link>
                    </div>
                  )}
                  {!removed && (
                    <>
                      <div>
                        <span className="opacity-50"> Cap : </span>

                        <span className="">
                          {xdcAmount?.toString() / 1e18 + " XDC "}
                        </span>
                        <span className="opacity-50">
                          ({(xdcAmount?.toString() * 100) / maxXdc?.toString()}
                          %)
                        </span>
                      </div>
                      <progress
                        className="progress progress-success w-full"
                        value={xdcAmount?.toString()}
                        max={maxXdc?.toString()}
                      ></progress>
                      <div className="opacity-50 text-xs">
                        There are{" "}
                        {(maxXdc?.toString() - xdcAmount?.toString()) / 1e18}{" "}
                        {symbol} still available for sale in the rld curve and
                        there are {xdcAmount?.toString() / 1e18} XDC in the rld
                        curve. When the market cap reaches{" "}
                        {maxXdc?.toString() / 1e18 + " XDC"} all the liquidity
                        from the rld curve will be deposited into XSwap and
                        burned. Progression increases as the price goes up.
                      </div>
                    </>
                  )}
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
    )
  );
};

export default Swap;
