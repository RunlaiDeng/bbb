import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { getDateSpecifics } from "../Utils";
import { formatEther } from "viem";
import { useRouter } from "next/router";
const TokenTrade = (props) => {
  const { token, symbol, poolAddress, graduate, xdcPrice } = props;

  const [data, setData] = useState({ type: 1 });

  async function fetchData() {
    const orders = await rpc.getOrders(1, 1, 100, 2, undefined, token);
    console.log(orders);
    setData({ ...data, orders });
  }
  useEffect(() => {
    if (!graduate) {
      fetchData();
    }
  }, [graduate, token]);

  const list = data?.orders?.list;

  console.log(data);

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
        {data?.type == 1 &&
          (graduate ? (
            <div className="h-screen">
              <iframe
                height="100%"
                width="100%"
                id="geckoterminal-embed"
                title="GeckoTerminal Embed"
                src={
                  "https://www.geckoterminal.com/xdc/pools/" +
                  poolAddress +
                  "?embed=1&info=0&swaps=1&chart=0"
                }
                frameBorder="0"
                allow="clipboard-write"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="overflow-x-auto whitespace-nowrap">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>{symbol}</th>
                    <th>Value</th>
                    <th>From</th>
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
                            2 * xdcPrice * formatEther(item?.xdcAmount || 0)
                          )?.toFixed(6)}
                        </td>
                        <td
                          className="hover:underline cursor-pointer flex items-center"
                          onClick={() => {
                            router.push("/dashboard/" + item?.account);
                          }}
                        >
                          {item?.account?.substr(36)}{" "}
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        {data?.type == 2 && <div>Coming soon</div>}
      </div>
    </div>
  );
};

export default TokenTrade;
