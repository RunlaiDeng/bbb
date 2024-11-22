import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
const Orders = () => {
  const router = useRouter();
  const { addr } = router.query;
  const chainId = useChainId();
  const mbbb = contracts[chainId]?.mbbbv2;
  const [data, setData] = useState({
    type: 1,
  });

  const [orders, setOrders] = useState({});

  const { address } = useAccount();

  const [mount, setMount] = useState(false);
  async function fetchData() {
    setMount(false);
    const xdc = await getXDCPrice();
    const ordersResult = await rpc.getOrders(
      orders?.sort,
      orders?.pageNumber,
      orders?.size,
      data?.type,
      address
    );
    setData({ ...data, xdc });
    setOrders(ordersResult);
    setMount(true);
  }

  useEffect(() => {
    fetchData();
  }, [address, orders?.sort, orders?.pageNumber, data?.type]);

  const searchDropTokens = [];

  const list = orders?.list;

  list?.forEach((order) => {
    searchDropTokens.push({
      ...mbbb,
      functionName: "getDropTokenByAddress",
      args: [order?.token],
    });
  });

  const { data: reads0 } = useReadContracts({ contracts: searchDropTokens });
  const drops = reads0?.map((item) => item?.result);

  const xdcPrice = data?.xdc?.price;

  const pages = [];
  const pageOnChain =
    Math.floor(drops?.length || 0 / orders?.size) +
    (drops?.length || 0 % orders?.size > 0 ? 1 : 0);
  for (let i = 1; i <= (orders?.totalPage || pageOnChain); i++) {
    pages.push(i);
  }

  return (
    <>
      {mount && (
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
                      {list?.map((item, index) => {
                        const drop = drops?.[index];

                        return (
                          <tr key={item?.index} className="whitespace-nowrap">
                            <td>{getDateSpecifics(item?.createTime)}</td>
                            <td className="flex gap-2 items-center">
                              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                                <Image
                                  height={400}
                                  width={400}
                                  src={handleSrc(drop?.imageUrl)}
                                  alt={""}
                                  className="object-cover w-full h-full"
                                />
                              </div>

                              <div className="sm:flex gap-2 items-center ">
                                <div className="">{item?.symbol}</div>
                                <div className="opacity-50 text-xs whitespace-nowrap">
                                  {item?.name}
                                </div>
                              </div>
                            </td>
                            <td>{formatEther(item?.deployFee || 0)} XDC</td>
                            <td>
                              ≈ $
                              {(
                                formatEther(item?.deployFee || 0) * xdcPrice
                              )?.toLocaleString()}{" "}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {data?.type == 2 && (
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
                      {list?.map((item, index) => {
                        console.log(item);
                        const drop = drops?.[index];
                        const price = BigInt(
                          Math.floor(
                            ((Number(item?.open) || 0) +
                              (Number(item?.close) || 0)) *
                              xdcPrice
                          )
                        );

                        const totalUSD = BigInt(
                          Math.floor(
                            (Number(item?.fee) || 0) +
                              (Number(item?.xdcAmount) || 0) * xdcPrice
                          )
                        );
                        return (
                          <tr key={item?.index} className="whitespace-nowrap">
                            <td>{getDateSpecifics(item?.time)}</td>
                            <td className="flex gap-2 items-center">
                              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                                <Image
                                  height={400}
                                  width={400}
                                  src={handleSrc(drop?.imageUrl)}
                                  alt={""}
                                  className="object-cover w-full h-full"
                                />
                              </div>

                              <div className="sm:flex gap-2 items-center ">
                                <div className="">{drop?.symbol}</div>
                                <div className="opacity-50 text-xs whitespace-nowrap">
                                  {drop?.name}
                                </div>
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
                            <td>
                              ${Number(formatEther(price || 0))?.toFixed(6)}
                            </td>
                            <td>
                              {Number(
                                formatEther(item?.tokenAmount || 0)
                              )?.toFixed(2)}
                            </td>
                            <td>
                              {Number(formatEther(item?.fee || 0))?.toFixed(2)}{" "}
                              XDC
                            </td>
                            <td>
                              ≈ $
                              {Number(formatEther(totalUSD || 0))?.toFixed(2)}{" "}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {list.length > 0 && (
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
      )}
      {!mount && (
        <>
          <div className="flex justify-center items-center mt-48">
            <div className="loading loading-bars loading-lg text-success"></div>
          </div>
        </>
      )}
    </>
  );
};

export default Orders;
