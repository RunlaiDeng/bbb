import Image from "next/image";
import { useRouter } from "next/router";
import { getFollowing, getPool, getPrice, setFollowing } from "../Utils";
import { useEffect, useState } from "react";
const TokenHead = (props) => {
  const { name, symbol, isBBB, index, token, pool } = props;

  const price = pool.price;
  const h24Change = pool?.priceChangeH24;
  const h24ChangeNum = price / (1 - h24Change) - price;

  const following = getFollowing();
  const isFollowed = following?.[index];
  const [followed, setFollowed] = useState(isFollowed);

  return (
    <div className="card mx-2 py-1">
      <div className="card-body p-0">
        <div className="px-4 flex gap-4 text-left items-center font-bold">
          {typeof window !== "undefined" && !isBBB && (
            <label className="swap btn btn-xs">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                checked={isFollowed}
                onChange={(e) => {
                  setFollowing(index, e.target.checked);
                  setFollowed(e.target.checked);
                }}
              />

              {/* sun icon */}
              <div className="swap-off swap-rotate">
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="5573"
                  width="20"
                  height="20"
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
                  width="20"
                  height="20"
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
          <div>
            <div className="text-xl items-center flex h-6">{symbol} / USD</div>
            <div className="text-xs opacity-50">price</div>
          </div>
          <div>
            <div
              className={
                "items-center flex h-6 " +
                (h24Change >= 0 ? "text-green-700" : "text-red-700")
              }
            >
              {Number(price)?.toFixed(6)}
            </div>
            <div className="text-xs">${Number(price)?.toFixed(6)}</div>
          </div>
          <div>
            <div className="text-xs opacity-50 items-center flex h-6">
              24h change
            </div>
            <div
              className={
                "text-xs " +
                (h24Change >= 0 ? "text-green-700" : "text-red-700")
              }
            >
              {Math.abs(h24ChangeNum)?.toFixed(6)} {h24Change >= 0 ? "+" : ""}
              {(h24Change * 100)?.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenHead;
