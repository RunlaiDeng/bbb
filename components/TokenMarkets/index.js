import { useEffect, useState } from "react";
import rpc from "@/components/Rpc";
import { useRouter } from "next/router";
import { getPool } from "../Utils";
import { bbbInfo } from "@/config";
import { useFollow } from "../Context/follow";
import Loading from "../Loading";

const TokenMarkets = (props) => {
  const { xdcPrice, xdcPriceChangeH24 } = props;
  const [data, setData] = useState({});
  const [show, setShow] = useState(2);

  const { follow, setFollow } = useFollow();
  useEffect(() => {
    async function fetchData() {
      const bbbPool = await getPool(bbbInfo.address);

      const bbb = {
        price: Number(bbbPool?.base_token_price_usd || 0)?.toFixed(4),
        changeH24: bbbPool?.price_change_percentage?.h24 || 0,
      };
      let findTokens = {};
      if (show == 1) {
        const followList = Object.keys(follow).filter((key) => follow[key]);

        findTokens = await rpc.getTokens(1, 1, 9999, followList);
      }
      if (show == 2) {
        findTokens = await rpc.getTokens(1, 1, 9999);
      }

      setData({ ...data, tokenList: findTokens?.list, bbb });
    }
    fetchData();
  }, [show, follow]);
  const tokenList = data?.tokenList;

  const router = useRouter();

  const bbbPrice = data?.bbb?.price;
  const bbbPriceChange24h = data?.bbb?.changeH24;

  return (
    <>
      <div className="card">
        <div className="card-body p-0 h-[500px] lg:h-full">
          <div className="p-2 flex items-center gap-2">
            <label className=" w-full flex items-center input input-bordered gap-2 input-sm">
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
                className="w-full"
                placeholder="0x or bbb"
                onChange={(e) => {
                  setData({ ...data, search: e.target.value });
                }}
              />
            </label>

            <div
              className="btn btn-sm cursor-pointer"
              onClick={() => {
                if (data?.search) {
                  router.push("/swap/" + data?.search);
                } else {
                  //   info("please submit token address");
                }
              }}
            >
              Search
            </div>
          </div>
          <div className="flex gap-2 text-slate-500">
            <div role="tablist" className="tabs tabs-bordered w-full">
              <a
                role="tab"
                className={"tab " + (show == 1 ? "tab-active" : "")}
                onClick={() => {
                  setShow(1);
                }}
              >
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="5267"
                  width="16"
                  height="16"
                >
                  <path
                    d="M785.352203 933.397493c-4.074805 0-8.151657-0.970094-11.833513-3.007497l-261.311471-142.488225L250.942821 930.388972c-8.343015 4.559852-18.527982 3.8814-26.28669-1.599428-7.760754-5.5279-11.640108-14.987343-10.088776-24.347524l47.578622-285.365306L72.563154 429.470355c-6.594185-6.547113-8.971325-16.295128-6.110161-25.122167 2.814092-8.850575 10.379395-15.397688 19.546172-16.949021l285.512662-47.577598 118.529557-236.989529c4.172019-8.391111 12.803607-13.701047 22.165836-13.701047 9.359158 0 17.992793 5.309936 22.163789 13.701047l118.529557 236.989529 285.511639 47.577598c9.217942 1.551332 16.73208 8.051373 19.593244 16.949021 2.813069 8.875135 0.48607 18.575054-6.109138 25.122167L762.264369 619.077737l47.577598 285.365306c1.50119 9.360182-2.37714 18.819624-10.087753 24.347524C795.487028 931.797042 790.394033 933.397493 785.352203 933.397493z"
                    p-id="5268"
                    fill="#0e932e"
                  ></path>
                </svg>
              </a>
              <a
                role="tab"
                className={"tab " + (show == 2 ? "tab-active" : "")}
                onClick={() => {
                  setShow(2);
                }}
              >
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="6437"
                  width="16"
                  height="16"
                >
                  <path
                    d="M370.857143 561.714286l-266.285714 266.285714q-5.714286 5.714286-13.142858 5.714286t-13.142857-5.714286l-28.571428-28.571429q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l224.571428-224.571428L49.714286 324q-5.714286-5.714286-5.714286-13.142857t5.714286-13.142857l28.571428-28.571429q5.714286-5.714286 13.142857-5.714286t13.142858 5.714286l266.285714 266.285714q5.714286 5.714286 5.714286 13.142858t-5.714286 13.142857z m616.571428 261.142857v36.571428q0 8-5.142857 13.142858t-13.142857 5.142857H420.571429q-8 0-13.142858-5.142857t-5.142857-13.142858v-36.571428q0-8 5.142857-13.142857t13.142858-5.142857h548.571428q8 0 13.142857 5.142857t5.142857 13.142857z"
                    p-id="6438"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
          {!tokenList && <Loading />}

          {tokenList && (
            <div className="overflow-auto ">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">24h change</th>
                  </tr>
                </thead>

                <tbody>
                  <>
                    <tr
                      className="hover cursor-pointer"
                      onClick={() => {
                        router.push("/swap/bbb");
                      }}
                    >
                      <td className="flex items-center gap-1">
                        <svg
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="5267"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M785.352203 933.397493c-4.074805 0-8.151657-0.970094-11.833513-3.007497l-261.311471-142.488225L250.942821 930.388972c-8.343015 4.559852-18.527982 3.8814-26.28669-1.599428-7.760754-5.5279-11.640108-14.987343-10.088776-24.347524l47.578622-285.365306L72.563154 429.470355c-6.594185-6.547113-8.971325-16.295128-6.110161-25.122167 2.814092-8.850575 10.379395-15.397688 19.546172-16.949021l285.512662-47.577598 118.529557-236.989529c4.172019-8.391111 12.803607-13.701047 22.165836-13.701047 9.359158 0 17.992793 5.309936 22.163789 13.701047l118.529557 236.989529 285.511639 47.577598c9.217942 1.551332 16.73208 8.051373 19.593244 16.949021 2.813069 8.875135 0.48607 18.575054-6.109138 25.122167L762.264369 619.077737l47.577598 285.365306c1.50119 9.360182-2.37714 18.819624-10.087753 24.347524C795.487028 931.797042 790.394033 933.397493 785.352203 933.397493z"
                            p-id="5268"
                            fill="#0e932e"
                          ></path>
                        </svg>
                        BBB
                      </td>
                      <td className="text-right">${bbbPrice}</td>
                      <td
                        className={
                          "text-right " +
                          (bbbPriceChange24h >= 0
                            ? "text-green-700"
                            : "text-red-700")
                        }
                      >
                        {bbbPriceChange24h >= 0 ? "+" : ""}
                        {bbbPriceChange24h}%
                      </td>
                    </tr>
                    {tokenList?.map((item, index) => {
                      const isFollowed = follow?.[item?.index];
                      const price = (
                        (xdcPrice * Number(item?.price || 0) * 2) /
                        1e18
                      )?.toFixed(4);
                      const changeH24 = (
                        100 *
                        ((1 + xdcPriceChangeH24) *
                          (1 + Number(item?.priceChangeH24)) -
                          1)
                      )?.toFixed(2);
                      return (
                        <tr
                          key={index}
                          className="hover cursor-pointer"
                          onClick={() => {
                            router.push("/swap/" + item?.token);
                          }}
                        >
                          <td className="flex items-center gap-1">
                            {typeof window !== "undefined" && (
                              <label
                                className="swap"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {/* this hidden checkbox controls the state */}
                                <input
                                  type="checkbox"
                                  checked={isFollowed}
                                  onClick={(e) => {
                                    setFollow(item?.index, e.target.checked);
                                  }}
                                />

                                {/* sun icon */}
                                <div className="swap-off swap-rotate">
                                  <svg
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="5573"
                                    width="16"
                                    height="16"
                                  >
                                    <path
                                      d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9 0.6 45.3l183.7 179.1-43.4 252.9c-1.2 6.9-0.1 14.1 3.2 20.3 8.2 15.6 27.6 21.7 43.2 13.4L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"
                                      p-id="5574"
                                      fill="#0e932e"
                                    ></path>
                                  </svg>
                                </div>
                                {/* moon icon */}
                                <div className="swap-on">
                                  <svg
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="5267"
                                    width="16"
                                    height="16"
                                  >
                                    <path
                                      d="M785.352203 933.397493c-4.074805 0-8.151657-0.970094-11.833513-3.007497l-261.311471-142.488225L250.942821 930.388972c-8.343015 4.559852-18.527982 3.8814-26.28669-1.599428-7.760754-5.5279-11.640108-14.987343-10.088776-24.347524l47.578622-285.365306L72.563154 429.470355c-6.594185-6.547113-8.971325-16.295128-6.110161-25.122167 2.814092-8.850575 10.379395-15.397688 19.546172-16.949021l285.512662-47.577598 118.529557-236.989529c4.172019-8.391111 12.803607-13.701047 22.165836-13.701047 9.359158 0 17.992793 5.309936 22.163789 13.701047l118.529557 236.989529 285.511639 47.577598c9.217942 1.551332 16.73208 8.051373 19.593244 16.949021 2.813069 8.875135 0.48607 18.575054-6.109138 25.122167L762.264369 619.077737l47.577598 285.365306c1.50119 9.360182-2.37714 18.819624-10.087753 24.347524C795.487028 931.797042 790.394033 933.397493 785.352203 933.397493z"
                                      p-id="5268"
                                      fill="#0e932e"
                                    ></path>
                                  </svg>
                                </div>
                              </label>
                            )}
                            {item?.symbol}
                          </td>
                          <td className="text-right">${price}</td>
                          <td
                            className={
                              "text-right " +
                              (changeH24 >= 0
                                ? "text-green-700"
                                : "text-red-700")
                            }
                          >
                            {changeH24 >= 0 ? "+" : ""}
                            {changeH24}%
                          </td>
                        </tr>
                      );
                    })}
                  </>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TokenMarkets;
