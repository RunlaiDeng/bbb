import Image from "next/image";
import WriteButton from "../WriteButton";
import Link from "next/link";
import {
  customToFixed,
  getBytesLength,
  getFollowing,
  setFollowing,
} from "../Utils";
import { useEffect, useState } from "react";
import ImageUpload from "../ImageUpload";
import { useAccount, useChainId, useWatchAsset } from "wagmi";
import { contracts } from "@/config";
import { formatEther } from "viem";
import { useNotification } from "../Context/notice";
import copy from "copy-to-clipboard";
const TokenInfo = (props) => {
  const {
    token,
    name,
    symbol,
    imageUrl,
    description,
    website,
    telegram,
    twitter,
    coingecko,
    cmc,
    index,
    deployer,
    createTime,
    canUpdate,
    isBBB,
    showRLD,
    xdcPrice,
    xdcAmount,
    maxXdc,
    totalSupply,
  } = props;

  const [tokenInfo, setTokenInfo] = useState({});
  const following = getFollowing();
  const isFollowed = following?.[index];
  const [followed, setFollowed] = useState(isFollowed);
  useEffect(() => {
    setTokenInfo({
      ...tokenInfo,
      name,
      symbol,
      imageUrl,
      description,
      website,
      telegram,
      twitter,
    });
  }, [props]);
  const imageUpload = {
    image: tokenInfo?.imageUrl,
    callback: (file) => {
      setTokenInfo({ ...tokenInfo, imageUrl: file });
    },
  };

  const chainId = useChainId();

  const mbbb = contracts[chainId]?.mbbbv2;
  const update = {
    buttonName: "Confirm",
    data: {
      ...mbbb,
      functionName: "updateToken",
      args: [
        index,
        tokenInfo?.imageUrl,
        tokenInfo?.description,
        tokenInfo?.website,
        tokenInfo?.telegram,
        tokenInfo?.twitter,
      ],
    },
    callback: () => {
      refetch();
      document.getElementById("updateModal").close();
    },
  };
  const { isConnected } = useAccount();
  const { watchAsset } = useWatchAsset();
  const { success } = useNotification();

  return (
    <>
      <div className="card" id="info">
        <div className="card-body p-2">
          <div className="text-xl flex gap-2 items-center">
            {canUpdate && (
              <div
                className="btn btn-xs btn-success"
                onClick={() => {
                  document.getElementById("updateModal").showModal();
                }}
              >
                update
              </div>
            )}
            {coingecko && (
              <div
                className="btn btn-xs"
                onClick={(e) => {
                  window.open(coingecko);
                }}
              >
                <Image src="/coingecko.png" height={20} width={20} alt="" />
              </div>
            )}
            {cmc && (
              <div
                className="btn btn-xs"
                onClick={(e) => {
                  window.open(cmc);
                }}
              >
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4445"
                  width="20"
                  height="20"
                >
                  <path
                    d="M877.2608 611.8912c-17.92 11.264-38.912 12.6976-54.8864 3.6864-20.3264-11.4688-31.488-38.2976-31.488-75.6736V428.1856c0-53.9136-21.2992-92.3136-56.9856-102.656-60.416-17.6128-105.8816 56.32-122.9824 84.0704L504.32 582.4512V371.2c-1.1776-48.5888-16.9472-77.6704-46.9504-86.4256-19.8144-5.7856-49.5104-3.4816-78.336 40.6528l-238.7968 383.488A421.3248 421.3248 0 0 1 91.6992 512c0-231.0144 185.088-418.9184 412.672-418.9184 227.4816 0 412.5696 187.904 412.5696 418.9184 0 0.4096 0.1024 0.768 0.1536 1.1264 0 0.4096-0.1024 0.768-0.0512 1.1264 2.1504 44.7488-12.3392 80.384-39.7824 97.6896z m131.3792-99.84v-2.3552C1007.36 228.352 781.6192 0 504.32 0 226.2528 0 0 229.6832 0 512s226.2528 512 504.32 512c127.5904 0 249.3952-48.4864 342.8864-136.5504a47.0016 47.0016 0 0 0 2.4576-65.7408 45.3632 45.3632 0 0 0-64.8192-2.5088 407.8592 407.8592 0 0 1-280.5248 111.7184c-121.856 0-231.424-53.9136-307.0464-139.4176L412.672 445.6448v159.4368c0 76.5952 29.696 101.376 54.5792 108.544 24.9344 7.2704 62.976 2.304 103.0144-62.6176l118.4256-192a348.16 348.16 0 0 1 10.496-16.1792v97.0752c0 71.5776 28.672 128.8192 78.6432 157.0304 45.056 25.4464 101.7344 23.1424 147.8656-5.9904 55.9616-35.328 86.0672-100.4544 82.944-178.944z"
                    fill="#17181B"
                    p-id="4446"
                  ></path>
                </svg>
              </div>
            )}
            {twitter && (
              <div
                className="btn btn-xs"
                onClick={(e) => {
                  window.open("https://x.com/" + twitter);
                }}
              >
                <svg
                  height="20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                </svg>
              </div>
            )}
            {telegram && (
              <div
                className="btn btn-xs"
                onClick={(e) => {
                  window.open("https://t.me/" + telegram);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20"
                  width="20"
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
                className="btn btn-xs"
                onClick={(e) => {
                  window.open("https://" + website);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  height="20"
                  width="20"
                >
                  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z"></path>
                  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z"></path>
                </svg>
              </div>
            )}
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
          </div>
          <div className="flex gap-1 items-center">
            <div className="opacity-50">Contract</div>
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
                width="20"
                height="20"
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
              data-tip="Add To MetaMask"
              onClick={() => {
                if (!isConnected) {
                  openConnectModal();
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
              <Image src="/metamask.jpg" width={20} height={20} alt="" />
            </div>
            <div
              className={"cursor-pointer tooltip"}
              data-tip="View on XDCScan"
              onClick={() => {
                window.open("https://xdcscan.com/token/" + token);
              }}
            >
              <Image src="/xdc.png" width={20} height={20} alt="" />
            </div>
          </div>

          <div className="h-48 w-48 overflow-hidden">
            <Image
              height={400}
              width={400}
              src={imageUrl}
              alt={""}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="mt-1 overflow-auto text-left">
            <div className="font-bold">
              {name} (${symbol})
            </div>
            <div className="opacity-50 text-xs"> {description}</div>
          </div>
          {showRLD && (
            <div className="text-left">
              <div className="mt-4">
                <span className="opacity-50">RLD Curve Progress: </span>

                <span className="">
                  {"$" +
                    (
                      xdcPrice * Number(formatEther(xdcAmount || 0n))
                    )?.toLocaleString()}
                </span>
                <span className="opacity-50">
                  (
                  {(
                    (xdcAmount?.toString() * 100) /
                    maxXdc?.toString()
                  )?.toFixed(2)}
                  %)
                </span>
              </div>
              <progress
                className="progress progress-success w-full"
                value={xdcAmount?.toString()}
                max={maxXdc?.toString()}
              ></progress>

              <div className="opacity-50 text-xs">
                When the market cap reaches{" "}
                <span className="text-green-700">
                  {"$" +
                    (xdcPrice * formatEther(maxXdc || 0n))?.toLocaleString()}
                </span>{" "}
                all the liquidity from the rld curve will be deposited into
                icecreaswap and burned. Progression increases as the price goes
                up. After removing liquidity, the Megadrop Staker is snapshot
                and receives <span className="text-green-700">2%</span> of the
                token supply.
              </div>
              <div className="opacity-50 text-xs mt-4">
                There are{" "}
                <span className="text-green-700">
                  {(
                    formatEther(
                      customToFixed(Math.sqrt(maxXdc?.toString() * 2e25))
                    ) - formatEther(totalSupply || 0n)
                  )?.toLocaleString()}{" "}
                  {symbol}
                </span>{" "}
                still available for sale in the rld curve and there are{" "}
                <span className="text-green-700">
                  {Number(formatEther(xdcAmount || 0n))?.toLocaleString()} XDC
                </span>{" "}
                in the rld curve.
              </div>
            </div>
          )}
          <div
            className="font-bold text-left mt-2 flex items-center gap-2"
            id="holders"
          >
            Holder distribution{" "}
            <div
              className={"cursor-pointer tooltip"}
              data-tip="View on XDCScan"
              onClick={() => {
                window.open("https://xdcscan.com/token/" + token + "#balances");
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
            </div>
          </div>
        </div>
      </div>
      <dialog id="updateModal" className="modal font-bold">
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
                  Image <span className="text-green-700">*</span>
                </span>
              </div>
              <ImageUpload {...imageUpload} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Name <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.name)}/20
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full "
                value={tokenInfo?.name}
                disabled
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">
                  Symbol <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.symbol)}/10
                </span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                value={tokenInfo?.symbol}
                disabled
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">
                  Token Decription <span className="text-green-700">*</span>
                </span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.description)}/256
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered h-24"
                value={tokenInfo?.description}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (getBytesLength(newValue) <= 256) {
                    setTokenInfo({ ...tokenInfo, description: newValue });
                  }
                }}
              ></textarea>
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Website</span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.website)}/64
                </span>
              </div>
              <label className="input input-bordered flex items-center gap-2">
                https://
                <input
                  type="text"
                  className="grow"
                  placeholder="Optional"
                  value={tokenInfo?.website}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 64) {
                      setTokenInfo({ ...tokenInfo, website: newValue });
                    }
                  }}
                />
              </label>
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Telegram</span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.telegram)}/64
                </span>
              </div>

              <label className="input input-bordered flex items-center gap-2">
                https://t.me/
                <input
                  type="text"
                  className="grow"
                  placeholder="Optional"
                  value={tokenInfo?.telegram}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 64) {
                      setTokenInfo({ ...tokenInfo, telegram: newValue });
                    }
                  }}
                />
              </label>
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">twitter</span>
                <span className="text-right">
                  {getBytesLength(tokenInfo?.twitter)}/64
                </span>
              </div>

              <label className="input input-bordered flex items-center gap-2">
                https://x.com/
                <input
                  type="text"
                  className="grow"
                  placeholder="Optional"
                  value={tokenInfo?.twitter}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (getBytesLength(newValue) <= 64) {
                      setTokenInfo({ ...tokenInfo, twitter: newValue });
                    }
                  }}
                />
              </label>
            </label>
          </div>

          <WriteButton {...update} className="btn mt-5 w-full btn-success" />
        </div>
      </dialog>
    </>
  );
};

export default TokenInfo;
