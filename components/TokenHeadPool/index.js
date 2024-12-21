import { useEffect, useState } from "react";
import { useFollow } from "../Context/follow";
import Image from "next/image";
import { handleSrc } from "../Utils";
import copy from "copy-to-clipboard";
import { useAccount, useWatchAsset } from "wagmi";
import usePrivyLogin from "../Hook/usePrivyLogin";
import { useNotification } from "../Context/notice";
const TokenHead = (props) => {
  const {
    name,
    symbol,
    isBBB,
    index,
    token,
    pool,
    imageUrl,
    website,
    telegram,
    twitter,
  } = props;
  const { isConnected } = useAccount();
  const { watchAsset } = useWatchAsset();
  const privyLogin = usePrivyLogin();
  
  const { success } = useNotification();
  const price = pool.price;
  const h24Change = pool?.priceChangeH24;
  const h24ChangeNum = price / (1 - h24Change) - price;

  const { follow, setFollow } = useFollow();

  const isFollowed = follow?.[index];

  return (
    <div className="card mx-2 py-1">
      <div className="card-body p-0 whitespace-nowrap">
        <div className="flex gap-4 text-left items-center font-bold">
          {typeof window !== "undefined" && isBBB && (
            <label className="btn btn-xs">
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
            </label>
          )}

          {typeof window !== "undefined" && !isBBB && (
            <label className="swap btn btn-xs">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                checked={isFollowed}
                onChange={(e) => {
                  setFollow(index, e.target.checked);
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
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden ">
            <Image
              height={400}
              width={400}
              src={handleSrc(imageUrl)}
              alt={""}
              className="object-cover w-full h-full"
              loading="lazy"
              priority={false}
            />
          </div>
          <div>
            <div className="text-xs lg:text-xl items-center flex h-6">
              {symbol} / USD
            </div>
            <div className="text-xs flex gap-1 items-center">
              <div className="flex gap-1 items-center">
                {token?.substr(0, 6) + "..." + token?.substr(36)}{" "}
                <div
                  className={"cursor-pointer tooltip"}
                  data-tip="Copy Address"
                  onClick={() => {
                    copy(token);
                    success("copy success!");
                  }}
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="1641"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                      fill="#5E6570"
                      p-id="1642"
                    ></path>
                    <path
                      d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                      fill="#5E6570"
                      p-id="1643"
                    ></path>
                    <path
                      d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                      fill="#5E6570"
                      p-id="1644"
                    ></path>
                    <path
                      d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                      fill="#5E6570"
                      p-id="1645"
                    ></path>
                    <path
                      d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                      fill="#5E6570"
                      p-id="1646"
                    ></path>
                  </svg>
                </div>
                <div
                  className={"cursor-pointer tooltip"}
                  data-tip="Add To Wallet"
                  onClick={() => {
                    if (!isConnected) {
                      privyLogin();
                    } else {
                      watchAsset({
                        type: "ERC20",
                        options: {
                          address: token,
                          symbol: symbol,
                          decimals: 18,
                          image: imageUrl,
                        },
                      });
                    }
                  }}
                >
                  <Image src="/metamask.jpg" width={16} height={16} alt="" />
                </div>
                <div
                  className={"cursor-pointer tooltip"}
                  data-tip="View on XDCScan"
                  onClick={() => {
                    window.open("https://xdcscan.com/token/" + token);
                  }}
                >
                  <Image src="/xdc.png" width={16} height={16} alt="" />
                </div>
              </div>
              <div className="">|</div>
              {twitter && (
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    window.open("https://x.com/" + twitter);
                  }}
                >
                  <svg
                    height="16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                  </svg>
                </div>
              )}
              {telegram && (
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    window.open("https://t.me/" + telegram);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="16"
                    width="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21.961 4.33581C21.9448 4.26415 21.9094 4.19792 21.8583 4.14382C21.8072 4.08972 21.7423 4.04967 21.6702 4.02773C21.4074 3.97723 21.1355 3.99594 20.8827 4.08191C20.8827 4.08191 3.35851 10.1941 2.35768 10.8709C2.14268 11.0165 2.07018 11.1014 2.03434 11.2008C1.86101 11.686 2.40018 11.8946 2.40018 11.8946L6.91684 13.3226C6.99321 13.3359 7.07174 13.3315 7.14601 13.3097C8.17268 12.6798 17.4793 6.97509 18.0202 6.78345C18.1035 6.75919 18.1677 6.78345 18.151 6.84409C17.936 7.57588 9.89351 14.508 9.84934 14.5501C9.82783 14.5672 9.81107 14.5892 9.80059 14.6142C9.79011 14.6392 9.78624 14.6664 9.78934 14.6932L9.36768 18.9723C9.36768 18.9723 9.19101 20.3041 10.5635 18.9723C11.5368 18.0271 12.471 17.2443 12.9377 16.8635C14.491 17.9042 16.1618 19.0548 16.8827 19.6572C17.0039 19.7711 17.1476 19.8601 17.3051 19.9189C17.4626 19.9776 17.6307 20.005 17.7993 19.9993C18.007 19.9747 18.2021 19.8894 18.3585 19.7546C18.515 19.6198 18.6254 19.442 18.6752 19.2448C18.6752 19.2448 21.8668 6.77375 21.9735 5.10317C21.9843 4.94145 21.9985 4.83472 22.0002 4.72232C22.0054 4.59235 21.9922 4.46231 21.961 4.33581Z"
                      fill="currenColor"
                    ></path>
                  </svg>
                </div>
              )}
              {website && (
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    window.open("https://" + website);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    height="16"
                    width="16"
                  >
                    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z"></path>
                    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className={"text-xs opacity-50 items-center flex h-6 "}>
              price
            </div>
            <div
              className={
                "text-xs " +
                (h24Change >= 0 ? "text-green-700" : "text-red-700")
              }
            >
              ${Number(price)?.toFixed(6)}
            </div>
          </div>
          <div className="hidden lg:block">
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
        <div className="lg:hidden flex gap-4 text-left items-center font-bold">
          <div>
            <div className={"text-xs opacity-50 items-center flex h-6 "}>
              price
            </div>
            <div
              className={
                "text-xs " +
                (h24Change >= 0 ? "text-green-700" : "text-red-700")
              }
            >
              ${Number(price)?.toFixed(6)}
            </div>
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
