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
import { parseEther, formatEther } from "viem";
import ImageUpload from "@/components/ImageUpload";
import { buyXDCLink } from "@/config";

const deleteSame = (list) => {
  const result = [];

  const timeMap = {};

  list?.forEach((item) => {
    const { time, close } = item;

    if (timeMap[time]) {
      timeMap[time].close = close;
    } else {
      timeMap[time] = item;
    }
  });

  for (const key in timeMap) {
    result.push(timeMap[key]);
  }
  return result;
};

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
  const name = dropToken?.name;
  const symbol = dropToken?.symbol;
  const index = dropToken?.index;
  const xdcAmount = dropToken?.xdcAmount;
  const removed = dropToken?.removed;
  const maxXdc = dropToken?.maxXdc;
  const imageUrl = dropToken?.imageUrl;
  const description = dropToken?.description;
  const deployer = dropToken?.deployer;
  const website = dropToken?.website;
  const telegram = dropToken?.telegram;
  const twitter = dropToken?.twitter;

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
      {
        ...mbbb,
        functionName: "getKlineLength",
        args: [index],
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
  const klineLength = reads1?.[3]?.result;

  const searchKline = [];

  for (let i = 0; i < klineLength; i++) {
    searchKline.push({
      ...mbbb,
      functionName: "klineMap",
      args: [index, i],
    });
  }

  const { data: reads2, refetch: refetch2 } = useReadContracts({
    contracts: searchKline,
    multicallAddress: mutilCall?.address,
  });
  let klineMap = reads2?.map((item) => {
    const kline = item?.result;
    let high;
    let low;
    let color;
    const time = Number(kline?.[0]);
    const open = Number(formatEther(kline?.[1]));
    const close = Number(formatEther(kline?.[2]));
    const value = Number(formatEther(kline?.[3]));

    if (open > close) {
      low = open;
      high = close;
      color = "red";
    } else {
      low = close;
      high = open;
    }
    return {
      time,
      open,
      close,
      value,
      high,
      low,
      color,
    };
  });
  klineMap = deleteSame(klineMap);
  console.log(klineMap);
  const trade = {
    trade: klineMap,
    volume: klineMap,
  };

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

  console.log(xdcAmount);

  const update = {};

  return (
    mount && (
      <>
        <div className="text-center">
          <div
            className="btn btn-ghost w-max hover:text-green-500 hover:bg-inherit text-2xl"
            onClick={() => {
              router.push("/v2");
            }}
          >
            [Go back]
          </div>
        </div>
        <div className="card m-auto font-black mx-4 grid text-xs">
          <div className="card-body">
            <div className="flex gap-4">
              <Image height={100} width={100} src={imageUrl} alt={""} />
              <div>
                <div className="text-xl flex gap-2">
                  {name} (${symbol})
                  <span
                    className="ml-2 hover:bg-green-500 pt-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(twitter);
                    }}
                  >
                    <svg
                      t="1726931684805"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="4003"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M512 1024C794.769792 1024 1024 794.769792 1024 512 1024 229.230208 794.769792 0 512 0 229.230208 0 0 229.230208 0 512 0 794.769792 229.230208 1024 512 1024ZM343.754675 307.2 515.024998 478.534374 686.953114 307.2 723.325005 344.796877 551.521869 515.595315 722.44375 686.596864 686.118758 722.957824 515.09376 551.690624 343.754675 722.678118 307.2 686.335949 479.029683 515.275008 307.510938 344.379699 343.754675 307.2Z"
                        fill="#272636"
                        p-id="4004"
                      ></path>
                    </svg>
                  </span>
                  <span
                    className="hover:bg-green-500 pt-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(telegram);
                    }}
                  >
                    <svg
                      t="1726931652089"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="2770"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M679.424 746.861714l84.004571-395.995428c7.424-34.852571-12.580571-48.566857-35.437714-40.009143l-493.714286 190.281143c-33.718857 13.129143-33.133714 32-5.705142 40.557714l126.281142 39.424 293.156572-184.576c13.714286-9.142857 26.294857-3.986286 16.018286 5.156571l-237.129143 214.272-9.142857 130.304c13.129143 0 18.870857-5.705143 25.709714-12.580571l61.696-59.428571 128 94.281142c23.442286 13.129143 40.009143 6.290286 46.299428-21.723428zM1024 512c0 282.843429-229.156571 512-512 512S0 794.843429 0 512 229.156571 0 512 0s512 229.156571 512 512z"
                        fill=""
                        p-id="2771"
                      ></path>
                    </svg>
                  </span>
                  <span
                    className="hover:bg-green-500 pt-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(website);
                    }}
                  >
                    <svg
                      t="1726931789924"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="7374"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M694.852267 313.821867C664.917333 129.4336 594.261333 0 512.1024 0s-152.814933 129.4336-182.749867 313.821867h365.499734zM313.856 512c0 45.841067 2.491733 89.8048 6.826667 132.130133h382.634666c4.334933-42.325333 6.826667-86.289067 6.826667-132.130133s-2.491733-89.8048-6.826667-132.130133H320.682667c-4.334933 42.325333-6.826667 86.289067-6.826667 132.130133z m670.481067-198.178133A513.160533 513.160533 0 0 0 658.090667 21.469867c50.3808 69.768533 85.060267 174.865067 103.253333 292.352h223.0272zM365.909333 21.469867a512.8192 512.8192 0 0 0-326.0416 292.352H262.826667c17.954133-117.486933 52.667733-222.549333 103.048533-292.352z m640.546134 358.4h-236.885334c4.369067 43.349333 6.826667 87.722667 6.826667 132.130133 0 44.373333-2.4576 88.746667-6.826667 132.130133h236.680534c11.332267-42.325333 17.749333-86.289067 17.749333-132.130133s-6.417067-89.8048-17.544533-132.130133zM247.808 512c0-44.373333 2.4576-88.746667 6.826667-132.130133H17.749333A516.437333 516.437333 0 0 0 0 512c0 45.841067 6.621867 89.8048 17.749333 132.130133h236.6464A1397.623467 1397.623467 0 0 1 247.808 512z m81.578667 198.178133C359.253333 894.600533 429.8752 1024 512.068267 1024s152.814933-129.4336 182.749866-313.821867H329.352533z m328.9088 292.352a513.6384 513.6384 0 0 0 326.2464-292.317866h-222.993067c-18.158933 117.4528-52.872533 222.549333-103.253333 292.317866zM39.867733 710.212267a513.160533 513.160533 0 0 0 326.2464 292.317866c-50.3808-69.768533-85.060267-174.865067-103.253333-292.317866H39.867733z"
                        fill="#373537"
                        p-id="7375"
                      ></path>
                    </svg>
                  </span>
                  {address == deployer && (
                    <div className="btn btn-xs btn-success">update</div>
                  )}
                </div>
                <div>
                  <span className="opacity-50"> Contract Address : </span>

                  <span className="">{dropToken?.token}</span>
                </div>
                <div className="opacity-50 mt-4">{description}</div>
                <div className="flex gap-2">
                  <span className="opacity-50">Price : </span>

                  <span className="">{formatEther(price || 0n) + " XDC"}</span>

                  <span className="opacity-50"> Total Supply : </span>

                  <span className="">
                    {formatEther(totalSupply || 0n) + " " + dropToken?.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="m-auto grid md:grid-cols-5 gap-2 mx-4">
          <div className="md:col-span-3 font-black text-2xl text-center">
            <div className="card bg-slate-100">
              <div className="card-body">
                <LightChart {...trade} />
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
                        value={formatEther(data?.buyAmount || 0n)}
                        placeholder="0"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              buyAmount: BigInt(0),
                            });
                          }
                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              buyAmount: parseEther(newValue),
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
                        value={formatEther(buyTokenAmount || 0n)}
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
                        value={formatEther(data?.sellAmount || 0n)}
                        placeholder="0"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (!newValue) {
                            setData({
                              ...data,
                              sellAmount: BigInt(0),
                            });
                          }
                          if (
                            /^(0|[+]?[1-9][0-9]*)(\.[0-9]+)?$/.test(newValue)
                          ) {
                            setData({
                              ...data,
                              sellAmount: parseEther(newValue),
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
                        value={formatEther(sellXDCAmount || 0n)}
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
                          {formatEther(xdcAmount || 0n) + " XDC "}
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
                        {formatEther(maxXdc || 0n) -
                          formatEther(xdcAmount || 0n)}{" "}
                        {symbol} still available for sale in the rld curve and
                        there are {formatEther(xdcAmount || 0n)} XDC in the rld
                        curve. When the market cap reaches{" "}
                        {formatEther(maxXdc || 0n) + " XDC"} all the liquidity
                        from the rld curve will be deposited into icecreamswap
                        and burned. Progression increases as the price goes up.
                        After removing liquidity, the Megadrop Staker is
                        snapshot and receives 2% of the token supply.
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

        <dialog id="dropModal" className="modal font-black">
          <div className="modal-box">
            <div className="grid grid-cols-3">
              <form method="dialog">
                <button className="btn">X</button>
              </form>
              <h3 className="font-bold text-lg text-center mt-2">
                Upadate token
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
                  value={name}
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
                  value={symbol}
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
                  value={data?.dWebiste}
                  onChange={(e) => {
                    setData({ ...data, dWebiste: e.target.value });
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
                  value={data?.dTelegram}
                  onChange={(e) => {
                    setData({ ...data, dTelegram: e.target.value });
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
                  value={data?.dTwitter}
                  onChange={(e) => {
                    setData({ ...data, dTwitter: e.target.value });
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
            <div className="mt-1 text-xs">
              Available {balance?.formatted} XDC
            </div>
            {
              <Link
                className="underline text-xs"
                href={buyXDCLink}
                target="_blank"
              >
                XDC is not enough ?
              </Link>
            }
            <WriteButton {...update} className="btn mt-5 w-full btn-success" />
          </div>
        </dialog>
      </>
    )
  );
};

export default Swap;
