import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { getDateSpecifics, getXDCPrice } from "../Utils";
import { formatEther } from "viem";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const TokenTradeFun = (props) => {
  const { token, symbol, xdcPrice } = props;
  const [data, setData] = useState({ type: 1 });
  const { address } = useAccount();

  async function fetchData() {
    if (data?.type == 1) {
      const orders = await rpc.getOrders(1, 1, 50, 2, undefined, token);
      setData({ ...data, orders });
    }
    if (data?.type == 2) {
      const myOrders = await rpc.getOrders(1, 1, 50, 2, address, token);
      setData({ ...data, myOrders });
    }
  }
  useEffect(() => {
    fetchData();
  }, [token, address, data?.type]);

  const list = data?.orders?.list;
  const myList = data?.myOrders?.list;

  const router = useRouter();
  return (
    <div className="card outline rounded-none outline-gray-200" id="chart">
      <div className="card-body p-2">
        <div className="font-bold text-sm flex gap-2">
          <div
            className={
              "hover:text-green-700 cursor-pointer " +
              (data?.type == 1 ? "text-green-700" : "")
            }
            onClick={() => {
              setData({ ...data, type: 1 });
            }}
          >
            Market Trades
          </div>
          <div
            className={
              "hover:text-green-700 cursor-pointer " +
              (data?.type == 2 ? "text-green-700" : "")
            }
            onClick={() => {
              setData({ ...data, type: 2 });
            }}
          >
            My Trades
          </div>
        </div>
        {data?.type == 1 && (
          <div className="overflow-x-auto whitespace-nowrap">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Price</th>
                  <th>{symbol}</th>
                  <th>Value</th>
                  <th>From</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {list?.map((item) => {
                  return (
                    <tr
                      key={item?.tid}
                      className={
                        item?.tradeType == "buy"
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      <td>{getDateSpecifics(item?.time)}</td>
                      <td>
                        $
                        {Number(
                          2 * xdcPrice * formatEther(item?.close || 0)
                        )?.toFixed(6)}
                      </td>
                      <td>
                        {Number(
                          formatEther(item?.tokenAmount || 0)
                        )?.toLocaleString()}
                      </td>
                      <td>
                        $
                        {Number(
                          Number(
                            xdcPrice * formatEther(item?.xdcAmount || 0)
                          )?.toFixed(6)
                        )?.toLocaleString()}
                      </td>
                      <td
                        className="hover:underline cursor-pointer flex items-center gap-1"
                        onClick={() => {
                          router.push("/dashboard/" + item?.account);
                        }}
                      >
                        {item?.account?.substr(36)}{" "}
                        <svg
                          t="1732778050219"
                          
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="8441"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M780.672 964.8H193.856A129.92 129.92 0 0 1 64 835.008V248.064a130.048 130.048 0 0 1 129.856-129.856h224.768a43.968 43.968 0 1 1 0 88H193.856a41.856 41.856 0 0 0-41.856 41.856v586.944c0 23.104 18.752 41.856 41.856 41.856h586.816a41.856 41.856 0 0 0 41.856-41.856V596.608a43.968 43.968 0 1 1 87.936 0v238.464a129.92 129.92 0 0 1-129.792 129.728z"
                            p-id="8442"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M497.024 554.752a43.968 43.968 0 0 1-31.104-75.136l384.896-384.896a44.032 44.032 0 0 1 62.208 62.208L528.128 541.888a43.712 43.712 0 0 1-31.104 12.864z"
                            p-id="8443"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M916.032 412.672a43.968 43.968 0 0 1-43.968-43.968V147.136H627.456a43.968 43.968 0 1 1 0-87.936h267.456c35.904 0 65.024 29.12 65.088 65.088V368.64c0 24.32-19.712 44.032-43.968 44.032z"
                            p-id="8444"
                            fill="#bfbfbf"
                          ></path>
                        </svg>
                      </td>
                      <td
                        className="hover:underline cursor-pointer"
                        onClick={() => {
                          window.open("https://xdcscan.com/tx/" + item?.hash);
                        }}
                      >
                        <svg
                          t="1732778050219"
                          
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="8441"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M780.672 964.8H193.856A129.92 129.92 0 0 1 64 835.008V248.064a130.048 130.048 0 0 1 129.856-129.856h224.768a43.968 43.968 0 1 1 0 88H193.856a41.856 41.856 0 0 0-41.856 41.856v586.944c0 23.104 18.752 41.856 41.856 41.856h586.816a41.856 41.856 0 0 0 41.856-41.856V596.608a43.968 43.968 0 1 1 87.936 0v238.464a129.92 129.92 0 0 1-129.792 129.728z"
                            p-id="8442"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M497.024 554.752a43.968 43.968 0 0 1-31.104-75.136l384.896-384.896a44.032 44.032 0 0 1 62.208 62.208L528.128 541.888a43.712 43.712 0 0 1-31.104 12.864z"
                            p-id="8443"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M916.032 412.672a43.968 43.968 0 0 1-43.968-43.968V147.136H627.456a43.968 43.968 0 1 1 0-87.936h267.456c35.904 0 65.024 29.12 65.088 65.088V368.64c0 24.32-19.712 44.032-43.968 44.032z"
                            p-id="8444"
                            fill="#bfbfbf"
                          ></path>
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {data?.type == 2 && (
          <div className="overflow-x-auto whitespace-nowrap">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Price</th>
                  <th>{symbol}</th>
                  <th>Value</th>
                  <th>From</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {myList?.map((item) => {
                  return (
                    <tr
                      key={item?.tid}
                      className={
                        item?.tradeType == "buy"
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      <td>{getDateSpecifics(item?.time)}</td>
                      <td>
                        $
                        {Number(
                          2 * xdcPrice * formatEther(item?.close || 0)
                        )?.toFixed(6)}
                      </td>
                      <td>
                        {Number(
                          formatEther(item?.tokenAmount || 0)
                        )?.toLocaleString()}
                      </td>
                      <td>
                        $
                        {Number(
                          Number(
                            2 * xdcPrice * formatEther(item?.xdcAmount || 0)
                          )?.toFixed(6)
                        )?.toLocaleString()}
                      </td>
                      <td
                        className="hover:underline cursor-pointer flex items-center gap-1"
                        onClick={() => {
                          router.push("/dashboard/" + item?.account);
                        }}
                      >
                        {item?.account?.substr(36)}{" "}
                        <svg
                          t="1732778050219"
                          
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="8441"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M780.672 964.8H193.856A129.92 129.92 0 0 1 64 835.008V248.064a130.048 130.048 0 0 1 129.856-129.856h224.768a43.968 43.968 0 1 1 0 88H193.856a41.856 41.856 0 0 0-41.856 41.856v586.944c0 23.104 18.752 41.856 41.856 41.856h586.816a41.856 41.856 0 0 0 41.856-41.856V596.608a43.968 43.968 0 1 1 87.936 0v238.464a129.92 129.92 0 0 1-129.792 129.728z"
                            p-id="8442"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M497.024 554.752a43.968 43.968 0 0 1-31.104-75.136l384.896-384.896a44.032 44.032 0 0 1 62.208 62.208L528.128 541.888a43.712 43.712 0 0 1-31.104 12.864z"
                            p-id="8443"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M916.032 412.672a43.968 43.968 0 0 1-43.968-43.968V147.136H627.456a43.968 43.968 0 1 1 0-87.936h267.456c35.904 0 65.024 29.12 65.088 65.088V368.64c0 24.32-19.712 44.032-43.968 44.032z"
                            p-id="8444"
                            fill="#bfbfbf"
                          ></path>
                        </svg>
                      </td>
                      <td
                        className="hover:underline cursor-pointer"
                        onClick={() => {
                          window.open("https://xdcscan.com/tx/" + item?.hash);
                        }}
                      >
                        <svg
                          t="1732778050219"
                          
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="8441"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M780.672 964.8H193.856A129.92 129.92 0 0 1 64 835.008V248.064a130.048 130.048 0 0 1 129.856-129.856h224.768a43.968 43.968 0 1 1 0 88H193.856a41.856 41.856 0 0 0-41.856 41.856v586.944c0 23.104 18.752 41.856 41.856 41.856h586.816a41.856 41.856 0 0 0 41.856-41.856V596.608a43.968 43.968 0 1 1 87.936 0v238.464a129.92 129.92 0 0 1-129.792 129.728z"
                            p-id="8442"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M497.024 554.752a43.968 43.968 0 0 1-31.104-75.136l384.896-384.896a44.032 44.032 0 0 1 62.208 62.208L528.128 541.888a43.712 43.712 0 0 1-31.104 12.864z"
                            p-id="8443"
                            fill="#bfbfbf"
                          ></path>
                          <path
                            d="M916.032 412.672a43.968 43.968 0 0 1-43.968-43.968V147.136H627.456a43.968 43.968 0 1 1 0-87.936h267.456c35.904 0 65.024 29.12 65.088 65.088V368.64c0 24.32-19.712 44.032-43.968 44.032z"
                            p-id="8444"
                            fill="#bfbfbf"
                          ></path>
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenTradeFun;
