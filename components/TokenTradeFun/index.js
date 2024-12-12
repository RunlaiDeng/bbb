import { useEffect, useState, useMemo, useCallback } from "react";
import rpc from "@/components/Rpc";
import { getDateSpecifics } from "../Utils";
import { formatEther } from "viem";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

// Constants
const TRADE_TYPES = {
  MARKET: 1,
  MY_TRADES: 2,
};

const PAGE_SIZE = 50;

const ExternalLinkIcon = ({ className = "" }) => (
  <svg
    t="1732778050219"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="8441"
    width="16"
    height="16"
    className={className}
  >
    <path
      d="M780.672 964.8H193.856A129.92 129.92 0 0 1 64 835.008V248.064a130.048 130.048 0 0 1 129.856-129.856h224.768a43.968 43.968 0 1 1 0 88H193.856a41.856 41.856 0 0 0-41.856 41.856v586.944c0 23.104 18.752 41.856 41.856 41.856h586.816a41.856 41.856 0 0 0 41.856-41.856V596.608a43.968 43.968 0 1 1 87.936 0v238.464a129.92 129.92 0 0 1-129.792 129.728z"
      p-id="8442"
      fill="#bfbfbf"
    />
    <path
      d="M497.024 554.752a43.968 43.968 0 0 1-31.104-75.136l384.896-384.896a44.032 44.032 0 0 1 62.208 62.208L528.128 541.888a43.712 43.712 0 0 1-31.104 12.864z"
      p-id="8443"
      fill="#bfbfbf"
    />
    <path
      d="M916.032 412.672a43.968 43.968 0 0 1-43.968-43.968V147.136H627.456a43.968 43.968 0 1 1 0-87.936h267.456c35.904 0 65.024 29.12 65.088 65.088V368.64c0 24.32-19.712 44.032-43.968 44.032z"
      p-id="8444"
      fill="#bfbfbf"
    />
  </svg>
);

const TradeRow = ({ item, symbol, router, onAccountClick }) => {
  const formattedAmount = useMemo(() => 
    Number(formatEther(item?.tokenAmount || 0))?.toLocaleString()
  , [item?.tokenAmount]);

  const formattedTotal = useMemo(() => 
    Number(Number(item?.totalInUsd)?.toFixed(6))?.toLocaleString()
  , [item?.totalInUsd]);

  return (
    <tr
      key={item?.tid}
      className={item?.tradeType === "buy" ? "text-green-700" : "text-red-700"}
    >
      <td>{getDateSpecifics(item?.time)}</td>
      <td>${Number(item?.priceInUsd)?.toFixed(6)}</td>
      <td>{formattedAmount}</td>
      <td>${formattedTotal}</td>
      <td
        className="hover:underline cursor-pointer flex items-center gap-1"
        onClick={() => onAccountClick(item?.account)}
      >
        {item?.account?.substr(36)}{" "}
        <ExternalLinkIcon />
      </td>
      <td
        className="hover:underline cursor-pointer"
        onClick={() => window.open(`https://xdcscan.com/tx/${item?.hash}`)}
      >
        <ExternalLinkIcon />
      </td>
    </tr>
  );
};

const TokenTradeFun = ({ token, symbol }) => {
  const [tradeType, setTradeType] = useState(TRADE_TYPES.MARKET);
  const [orders, setOrders] = useState(null);
  const [myOrders, setMyOrders] = useState(null);
  const { address } = useAccount();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      if (tradeType === TRADE_TYPES.MARKET) {
        const result = await rpc.getOrders(1, 1, PAGE_SIZE, 2, undefined, token);
        setOrders(result);
      } else if (tradeType === TRADE_TYPES.MY_TRADES) {
        const result = await rpc.getOrders(1, 1, PAGE_SIZE, 2, address, token);
        setMyOrders(result);
      }
    } catch (error) {
      console.error('Error fetching trade data:', error);
    }
  }, [token, address, tradeType]);

  useEffect(() => {
    fetchData();
  }, [fetchData, tradeType]);

  const handleAccountClick = useCallback((account) => {
    router.push(`/dashboard/${account}`);
  }, [router]);

  const currentList = useMemo(() => 
    tradeType === TRADE_TYPES.MARKET ? orders?.list : myOrders?.list
  , [tradeType, orders?.list, myOrders?.list]);

  const handleTypeChange = useCallback((type) => {
    setTradeType(type);
  }, []);

  return (
    <div className="card" id="chart">
      <div className="card-body p-2">
        <div className="font-bold text-sm flex gap-2">
          <div
            className={`hover:text-green-700 cursor-pointer ${
              tradeType === TRADE_TYPES.MARKET ? "text-green-700" : ""
            }`}
            onClick={() => handleTypeChange(TRADE_TYPES.MARKET)}
          >
            Market Trades
          </div>
          <div
            className={`hover:text-green-700 cursor-pointer ${
              tradeType === TRADE_TYPES.MY_TRADES ? "text-green-700" : ""
            }`}
            onClick={() => handleTypeChange(TRADE_TYPES.MY_TRADES)}
          >
            My Trades
          </div>
        </div>
        <div className="overflow-x-auto whitespace-nowrap h-[470px] lg:h-full">
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
              {currentList?.length > 0 ? (
                currentList.map((item) => (
                  <TradeRow
                    key={item?.tid}
                    item={item}
                    symbol={symbol}
                    router={router}
                    onAccountClick={handleAccountClick}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TokenTradeFun;
