import {
  useReadContracts,
  useChainId,
  useAccount,
  useBalance,
  useWatchContractEvent,
} from "wagmi";
import { contracts } from "@/config";
import WriteButton from "@/components/WriteButton";
import { useState, useEffect } from "react";
import Link from "next/link";
import { buyXDCLink } from "@/config";
import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import ImageUpload from "@/components/ImageUpload";
import rpc from "@/components/Rpc";
import { parseEther } from "viem";

const getDate = (timestamp) => {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};
const Home = () => {
  const [tooltipText, setTooltipText] = useState("Click copy contract address");

  const chainId = useChainId();

  const { address } = useAccount();
  const { data: balance } = useBalance({ address: address });
  const [data, setData] = useState({
    dName: "",
    dSymbol: "",
  });

  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbbv2;
  const mutilCall = contracts[chainId]?.multicallAddress;

  const [mount, setMount] = useState(false);

  async function fetchData() {
    setMount(true);
  }

  useEffect(() => {
    fetchData();
  }, [mount]);

  const { data: reads0, refetch: refetch0 } = useReadContracts({
    contracts: [
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
      {
        ...mbbb,
        functionName: "getValues",
        args: [],
      },
      {
        ...mbbb,
        functionName: "getLatestTrade",
        args: [],
      },
      {
        ...mbbb,
        functionName: "getLatestDropToken",
        args: [],
      },
    ],
    multicallAddress: mutilCall?.address,
    query: {
      refetchInterval: 2000,
    },
  });

  const refetch = () => {
    setData({
      ...data,
      dFile: "",
      dName: "",
      dSymbol: "",
      dDesciption: "",
      dWebiste: "",
      dTelegram: "",
      dTwitter: "",
      clean: !data?.clean,
    });
    fetchData();
    refetch0();
    refetch1();
  };

  const dropTokenLength = reads0?.[0]?.result;

  const price = reads0?.[1]?.result;
  const values = reads0?.[2]?.result;
  const latestTradePro = reads0?.[3]?.result;
  const latestDrop = reads0?.[4]?.result;

  const latestTrade = latestTradePro?.[0];

  let searchDropTokens = [];

  for (let i = dropTokenLength?.toString() - 1; i >= 0; i--) {
    searchDropTokens.push({
      ...mbbb,
      functionName: "getDropToken",
      args: [values?.[i]],
    });
  }

  const { data: reads1, refetch: refetch1 } = useReadContracts({
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
      args: [
        data?.dName,
        data?.dSymbol,
        data?.dFile,
        data?.dDesciption,
        data?.dWebiste,
        data?.dTelegram,
        data?.dTwitter,
      ],
      value: price,
    },
    callback: async (confirm, txHash) => {
      refetch();
      document.getElementById("dropModal").close();
    },
  };

  const bbbIsEnough = false;

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const imageUpload = {
    callback: (file) => {
      setData({ ...data, dFile: file });
    },
    clean: data?.clean,
  };

  return (
    mount && (
      <>
        <div className="m-auto font-black text-xs gap-2">
          {latestTrade?.index > 0 && (
            <div
              role="alert"
              className="alert animate-shake-border bg-white border-2 w-max m-auto"
            >
              <span className="flex gap-2">
                <Image height={10} width={16} src="/bbb.jpg" />
                {latestTrade?.account?.substr(36)}{" "}
                {latestTrade?.tradeType == "buy" && "bought"}
                {latestTrade?.tradeType == "sell" && "sold"}{" "}
                {latestTrade?.xdcAmount?.toString() / 1e18} XDC of{" "}
                {latestTradePro?.[1]}{""}
                <Image height={10} width={16} src={latestTradePro?.[3]} />
              </span>
            </div>
          )}
          {latestDrop?.index > 0 && (
            <div
              role="alert"
              className="alert animate-shake-border bg-white border-2 w-max m-auto mt-2"
            >
              <span className="flex gap-2">
                <Image height={10} width={16} src="/bbb.jpg" />
                {latestDrop?.deployer?.substr(36)} Created {latestDrop?.symbol}{" "}
                <Image height={10} width={16} src={latestDrop?.imageUrl} />
                on {getDate(latestDrop?.createTime?.toString())}
              </span>
            </div>
          )}
        </div>
        <div className="text-center">
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

        <div className="m-auto mt-5 grid grid-cols-5 gap-2 w-72 md:w-96">
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

        <div className="card m-auto w-full">
          <div className="card-body font-black">
            <div className="grid grid-cols-2">
              <div className="">Terminal</div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-auto px-4">
              {dropTokens?.map((item, index) => {
                const xdcAmount = item?.xdcAmount;
                const percent =
                  (100 * xdcAmount?.toString()) / item?.maxXdc?.toString();

                const cap = xdcAmount?.toString() / 1e18;
                return (
                  <>
                    <div
                      className={
                        "card cursor-pointer hover:border-4 border-green-500 bg-slate-100 " +
                        (index == 0 && "animate-shake-border border-4")
                      }
                      onClick={() => {
                        router.push("/swap/" + item?.token);
                      }}
                      key={item?.index}
                    >
                      <figure className="w-full h-64 overflow-hidden">
                        <Image
                          height={400}
                          width={400}
                          src={
                            item?.imageUrl ? item?.imageUrl : "/didntupload.png"
                          }
                          alt={item?.name}
                          className="object-cover w-full h-full"
                        />
                      </figure>
                      <div className="card-body text-xs">
                        <div className="flex gap-2">
                          <span
                            className="ml-2 hover:bg-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item?.twitter);
                            }}
                          >
                            <svg
                              t="1726931684805"
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
                            className="hover:bg-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item?.telegram);
                            }}
                          >
                            <svg
                              t="1726931652089"
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
                            className="hover:bg-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item?.website);
                            }}
                          >
                            <svg
                              t="1726931789924"
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
                        </div>
                        <div className="flex gap-2">
                          Created{" "}
                          <span className="hover:underline">
                            {item?.deployer?.substr(36)}
                          </span>
                          <span>{getDate(item?.createTime?.toString())}</span>
                        </div>
                        <div className="text-xl">
                          {item?.name} (${item?.symbol})
                        </div>
                        <div className="opacity-50 h-20 break-all overflow-y-auto">
                          {item?.description}
                        </div>
                        <div>
                          <span className="opacity-50"> Market Cap: </span>
                          <span>{cap} XDC </span>
                          <span className="opacity-50"> ({percent}%)</span>
                        </div>
                        <progress
                          className="progress progress-success w-full"
                          value={percent}
                          max="100"
                        ></progress>
                      </div>
                    </div>
                  </>
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
                <ImageUpload {...imageUpload} />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    Name <span className="text-green-500">*</span>
                  </span>
                  <span className="text-right">
                    {data?.dName?.length || 0}/20
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full "
                  value={data?.dName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 20) {
                      setData({ ...data, dName: newValue });
                    }
                  }}
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    Symbol <span className="text-green-500">*</span>
                  </span>
                  <span className="text-right">
                    {data?.dSymbol?.length || 0}/10
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={data?.dSymbol}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 10) {
                      setData({ ...data, dSymbol: newValue });
                    }
                  }}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    Token Decription <span className="text-green-500">*</span>
                  </span>
                  <span className="text-right">
                    {data?.dDesciption?.length || 0}/256
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={data?.dDesciption}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 256) {
                      setData({ ...data, dDesciption: newValue });
                    }
                  }}
                ></textarea>
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Website</span>
                  <span className="text-right">
                    {data?.dWebiste?.length || 0}/64
                  </span>
                </div>

                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Optional"
                  value={data?.dWebiste}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 64) {
                      setData({ ...data, dWebiste: newValue });
                    }
                  }}
                ></input>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Telegram</span>
                  <span className="text-right">
                    {data?.dTelegram?.length || 0}/64
                  </span>
                </div>

                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Optional"
                  value={data?.dTelegram}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 64) {
                      setData({ ...data, dTelegram: newValue });
                    }
                  }}
                ></input>
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">twitter</span>
                  <span className="text-right">
                    {data?.dTwitter?.length || 0}/64
                  </span>
                </div>

                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Optional"
                  value={data?.dTwitter}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue?.length <= 64) {
                      setData({ ...data, dTwitter: newValue });
                    }
                  }}
                ></input>
              </label>

              {/* <div className="text-left text-xs text-slate-500">
                Cost <span className="text-xl text-black">FREE</span>{" "}
                <span className="line-through text-slate-500">100</span>{" "}
                <span className="text-green-500">100% OFF</span>{" XDC"}
              </div> */}
              <label className="input input-bordered flex items-center gap-2 w-full m-auto mt-2">
                Cost
                <input
                  type="text"
                  className="grow line-through text-red-500"
                  placeholder={"100 XDC"}
                  disabled
                />
                <div className="text-green-500">Free</div>
              </label>
            </div>
            <div className="mt-1 text-xs">
              Available {balance?.formatted} XDC
            </div>
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
    )
  );
};

export default Home;
