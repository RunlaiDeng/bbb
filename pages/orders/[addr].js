import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import rpc from "@/components/Rpc";
import {
  getDate,
  getDateSpecifics,
  getXDCPrice,
  handleSrc,
} from "@/components/Utils";
import { formatEther } from "viem";
import { contracts } from "@/config";
import Loading from "@/components/Loading";

const Orders = () => {
  const router = useRouter();
  const { addr } = router.query;
  const chainId = useChainId();
  const mbbb = contracts[chainId]?.mbbbv2;
  const [data, setData] = useState({
    type: 1,
    pageSize: 10,
  });

  const [orders, setOrders] = useState({
    list: [],
    sort: undefined,
    pageNumber: 1,
    size: 10,
    totalPage: 0,
  });

  const { address } = useAccount();

  const [mount, setMount] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setMount(false);
      const ordersResult = await rpc.getOrders(
        orders?.sort,
        orders?.pageNumber,
        orders?.size,
        data?.type,
        addr
      );
      setOrders((prev) => ({
        ...prev,
        ...ordersResult,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setMount(true);
    }
  }, [orders?.sort, orders?.pageNumber, orders?.size, data?.type, addr]);

  useEffect(() => {
    fetchData();
  }, [address, orders?.sort, orders?.pageNumber, data?.type, fetchData]);

  const searchDropTokens = useMemo(() => {
    if (!orders?.list?.length || !mbbb) return [];

    return orders.list.map((order) => ({
      ...mbbb,
      functionName: "getDropTokenByAddress",
      args: [order?.token],
    }));
  }, [orders?.list, mbbb]);

  const { data: reads0 } = useReadContracts({ contracts: searchDropTokens });
  const drops = reads0?.map((item) => item?.result);

  const pages = useMemo(() => {
    if (!orders?.totalPage && !drops?.length) return [];

    const pageCount =
      orders?.totalPage || Math.ceil((drops?.length || 0) / orders?.size);

    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }, [drops?.length, orders?.size, orders?.totalPage]);

  const showList = mount && orders?.list != undefined;

  console.log(orders?.list);

  return (
    <>
      {
        <>
          <div className="card bg-base-100 shadow-xl font-medium p-0 m-auto w-96 sm:w-11/12 mt-6 mb-6">
            <div className="card-body p-6">
              <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <div
                  className={
                    "btn btn-sm px-6 " +
                    (data?.type == 1 ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700")
                  }
                  onClick={() => {
                    setData({ ...data, type: 1 });
                  }}
                >
                  Launch Token History
                </div>
                <div
                  className={
                    "btn btn-sm px-6 " +
                    (data?.type == 2 ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700")
                  }
                  onClick={() => {
                    setData({ ...data, type: 2 });
                  }}
                >
                  Trade History
                </div>
              </div>
              {data?.type == 1 && (
                <>
                  {showList && (
                    <div className="overflow-x-auto">
                      <table className="table">
                        {/* head */}
                        <thead>
                          <tr className="bg-base-200">
                            <th className="font-bold">Date</th>
                            <th className="font-bold">Coin</th>
                            <th className="font-bold">Fee</th>
                            <th className="font-bold">Total in USD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.list?.map((item, index) => {
                            const drop = drops?.[index];
                            return (
                              <tr
                                key={item?.tid}
                                className="whitespace-nowrap hover:bg-gray-50 transition-colors duration-150"
                              >
                                <td>{getDateSpecifics(item?.createTime)}</td>
                                <td className="flex gap-2 items-center">
                                  <div className="w-8 h-8 flex items-center justify-center overflow-hidden ">
                                    <Image
                                      height={400}
                                      width={400}
                                      src={handleSrc(drop?.imageUrl)}
                                      alt={""}
                                      className="object-cover w-full h-full"
                                      loading="lazy"
                                      priority={false}
                                    />
                                  </div>

                                  <div className="sm:flex gap-2 items-center ">
                                    <div className="">{item?.symbol}</div>
                                    <div className="opacity-50 text-xs whitespace-nowrap">
                                      {item?.name}
                                    </div>
                                  </div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                      router.push("/swap/" + drop?.token);
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 1024 1024"
                                      version="1.1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      p-id="5120"
                                      width="16"
                                      height="16"
                                    >
                                      <path
                                        d="M822.661 218.552L761.108 689.49a15.33 15.33 0 0 1-4.372 8.868 15.34 15.34 0 0 1-8.724 4.352 15.352 15.352 0 0 1-16.22-9.104L649.8 504.535 336.036 818.299c-6 6-15.729 6-21.73 0L205.702 709.683c-6-6-6-15.718 0-21.719L519.465 374.2 330.394 292.21c-6.339-2.755-10.066-9.39-9.104-16.23a15.328 15.328 0 0 1 13.22-13.098l470.927-61.552c4.731-0.625 9.483 0.993 12.852 4.362a15.348 15.348 0 0 1 4.372 12.861z"
                                        p-id="5121"
                                        fill="#bfbfbf"
                                      ></path>
                                    </svg>
                                  </div>
                                </td>
                                <td>{formatEther(item?.deployFee || 0)} XDC</td>
                                <td>
                                  ≈ $
                                  {Number(item?.totalInUsd)?.toLocaleString()}{" "}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!showList && <Loading />}
                </>
              )}
              {data?.type == 2 && (
                <>
                  {showList && (
                    <div className="overflow-x-auto">
                      <table className="table">
                        {/* head */}
                        <thead>
                          <tr className="bg-base-200">
                            <th className="font-bold">Date</th>
                            <th className="font-bold">Coin</th>
                            <th className="font-bold">Side</th>
                            <th className="font-bold">Price</th>
                            <th className="font-bold">Filled</th>
                            <th className="font-bold">Fee</th>
                            <th className="font-bold">Total in USD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.list?.map((item, index) => {
                            const drop = drops?.[index];

                            return (
                              <tr key={item?.tid} className="whitespace-nowrap hover:bg-gray-50 transition-colors duration-150">
                                <td>{getDateSpecifics(item?.time)}</td>
                                <td className="flex gap-1 items-center">
                                  <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                                    <Image
                                      height={400}
                                      width={400}
                                      src={handleSrc(drop?.imageUrl)}
                                      alt={""}
                                      className="object-cover w-full h-full"
                                      loading="lazy"
                                      priority={false}
                                    />
                                  </div>

                                  <div className="sm:flex gap-2 items-center ">
                                    <div className="">{drop?.symbol}</div>
                                    <div className="opacity-50 text-xs whitespace-nowrap">
                                      {drop?.name}
                                    </div>
                                  </div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                      router.push("/swap/" + drop?.token);
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 1024 1024"
                                      version="1.1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      p-id="5120"
                                      width="16"
                                      height="16"
                                    >
                                      <path
                                        d="M822.661 218.552L761.108 689.49a15.33 15.33 0 0 1-4.372 8.868 15.34 15.34 0 0 1-8.724 4.352 15.352 15.352 0 0 1-16.22-9.104L649.8 504.535 336.036 818.299c-6 6-15.729 6-21.73 0L205.702 709.683c-6-6-6-15.718 0-21.719L519.465 374.2 330.394 292.21c-6.339-2.755-10.066-9.39-9.104-16.23a15.328 15.328 0 0 1 13.22-13.098l470.927-61.552c4.731-0.625 9.483 0.993 12.852 4.362a15.348 15.348 0 0 1 4.372 12.861z"
                                        p-id="5121"
                                        fill="#bfbfbf"
                                      ></path>
                                    </svg>
                                  </div>
                                </td>
                                <td
                                  className={
                                    item?.tradeType == "buy"
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }
                                >
                                  {item?.tradeType}
                                </td>
                                <td>${Number(item?.priceInUsd)?.toFixed(6)}</td>
                                <td>
                                  {Number(
                                    formatEther(item?.tokenAmount || 0)
                                  )?.toFixed(2)}
                                </td>
                                <td>
                                  {Number(
                                    formatEther(BigInt(Number(item?.fee) || 0))
                                  )?.toFixed(2)}{" "}
                                  XDC
                                </td>
                                <td>
                                  ≈ ${Number(item?.totalInUsd)?.toFixed(2)}{" "}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!showList && <Loading />}
                </>
              )}
              {showList && (
                <div className="flex justify-center items-center gap-1 mt-8 whitespace-nowrap overflow-x-auto">
                  <button 
                    className="flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setOrders({
                        ...orders,
                        pageNumber: orders.pageNumber - 1,
                      });
                    }}
                    disabled={orders.pageNumber == 1}
                  >
                    <span className="text-gray-600">&lt;</span>
                  </button>

                  {Array.from({ length: orders.totalPage }, (_, i) => i + 1).map((page, index) => {
                    let showPage = false;
                    if (orders.totalPage <= 5) {
                      showPage = true;
                    } else {
                      if (page === 1 || page === orders.totalPage) {
                        showPage = true;
                      } else if (orders.pageNumber <= 3 && page <= 4) {
                        showPage = true;
                      } else if (orders.pageNumber >= orders.totalPage - 2 && page >= orders.totalPage - 3) {
                        showPage = true;
                      } else if (Math.abs(orders.pageNumber - page) <= 1) {
                        showPage = true;
                      }
                    }

                    if (!showPage) {
                      if ((page === 2 && orders.pageNumber > 3) || 
                          (page === orders.totalPage - 1 && orders.pageNumber < orders.totalPage - 2)) {
                        return (
                          <button
                            key={index}
                            className="min-w-[32px] h-8 rounded-lg flex items-center justify-center cursor-default bg-transparent"
                            disabled
                          >
                            ...
                          </button>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => setOrders({ ...orders, pageNumber: page })}
                        className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center transition-colors ${
                          page === orders.pageNumber
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className="flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setOrders({
                        ...orders,
                        pageNumber: orders.pageNumber + 1,
                      });
                    }}
                    disabled={orders.pageNumber == orders.totalPage}
                  >
                    <span className="text-gray-600">&gt;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      }
    </>
  );
};

export default Orders;
