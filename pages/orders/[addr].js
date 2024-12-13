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
          <div className="card font-medium p-0 m-auto w-96 sm:w-11/12 mt-4">
            <div className="card-body p-0">
              <div className="flex items-center gap-2">
                <div
                  className={
                    "btn btn-ghost hover:text-green-700 hover:bg-inherit " +
                    (data?.type == 1 ? "text-green-700" : "")
                  }
                  onClick={() => {
                    setData({ ...data, type: 1 });
                  }}
                >
                  Launch Token History
                </div>
                <div
                  className={
                    "btn btn-ghost hover:text-green-700 hover:bg-inherit " +
                    (data?.type == 2 ? "text-green-700" : "")
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
                          <tr>
                            <th>Date</th>
                            <th>Coin</th>
                            <th>Fee</th>
                            <th>Total in USD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.list?.map((item, index) => {
                            const drop = drops?.[index];
                            return (
                              <tr
                                key={item?.tid}
                                className="whitespace-nowrap"
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
                          <tr>
                            <th>Date</th>
                            <th>Coin</th>
                            <th>Side</th>
                            <th>Price</th>
                            <th>Filled</th>
                            <th>Fee</th>
                            <th>Total in USD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.list?.map((item, index) => {
                            const drop = drops?.[index];

                            return (
                              <tr key={item?.tid} className="whitespace-nowrap">
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
                <ul className="menu menu-horizontal rounded-box ml-auto menu-xs">
                  <li
                    className={orders.pageNumber == 1 ? "disabled" : ""}
                    key={0}
                    onClick={() => {
                      setOrders({
                        ...orders,
                        pageNumber: orders.pageNumber - 1,
                      });
                    }}
                  >
                    <a style={{ background: "transparent" }}>{"<"}</a>
                  </li>

                  {pages?.map((item, index) => {
                    let showPageItems = false;
                    if (item == 1 || item == orders.totalPage) {
                      showPageItems = true;
                    }
                    const pageDiff = Math.abs(orders.pageNumber - item);
                    if (pageDiff <= 2) {
                      showPageItems = true;
                    }

                    let showPassFront = false;

                    if (item == 1 && orders.pageNumber >= 5) {
                      showPassFront = true;
                    }

                    let showPassBack = false;

                    if (
                      item == orders?.totalPage &&
                      orders.totalPage - orders.pageNumber >= 4
                    ) {
                      showPassBack = true;
                    }

                    return (
                      <div key={item} className="flex items-center">
                        {showPassBack && (
                          <li className="disabled" key={-1}>
                            <a style={{ background: "transparent" }}>...</a>
                          </li>
                        )}

                        {showPageItems && (
                          <li
                            onClick={() => {
                              setOrders({ ...orders, pageNumber: item });
                            }}
                          >
                            <a
                              className={
                                item == orders?.pageNumber
                                  ? "focus font-bold"
                                  : ""
                              }
                            >
                              {item}
                            </a>
                          </li>
                        )}
                        {showPassFront && (
                          <li className="disabled" key={-1}>
                            <a style={{ background: "transparent" }}>...</a>
                          </li>
                        )}
                      </div>
                    );
                  })}

                  <li
                    className={
                      orders.pageNumber == orders.totalPage ? "disabled" : ""
                    }
                    onClick={() => {
                      setOrders({
                        ...orders,
                        pageNumber: orders.pageNumber + 1,
                      });
                    }}
                    key={-3}
                  >
                    <a style={{ background: "transparent" }}>{">"}</a>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </>
      }
    </>
  );
};

export default Orders;
