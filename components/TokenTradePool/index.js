import { useState } from "react";
import PropTypes from 'prop-types';

const TAB_TYPES = {
  MARKET: 1,
  MY_TRADES: 2
};

const TokenTradePool = ({ poolAddress }) => {
  const [activeTab, setActiveTab] = useState(TAB_TYPES.MARKET);

  const TabButton = ({ type, label }) => (
    <a
      role="tab"
      className={`tab ${
        activeTab === type ? "tab-active text-green-700" : ""
      }`}
      onClick={() => setActiveTab(type)}
    >
      {label}
    </a>
  );

  return (
    <div className="card h-full overflow-y-auto" id="chart">
      <div className="card-body p-2">
        <div className="flex gap-2 text-gray-500 font-bold">
          <div role="tablist" className="tabs tabs-bordered w-full">
            <TabButton type={TAB_TYPES.MARKET} label="Market Trades" />
            <TabButton type={TAB_TYPES.MY_TRADES} label="My Trades" />
          </div>
        </div>

        {activeTab === TAB_TYPES.MARKET ? (
          <div className="h-full">
            <iframe
              height="100%"
              width="100%"
              id="geckoterminal-embed"
              title="GeckoTerminal Embed"
              src={`https://www.geckoterminal.com/xdc/pools/${poolAddress}?embed=1&info=0&swaps=1&chart=0&light_swaps=1`}
              frameBorder="0"
              allow="clipboard-write"
              allowFullScreen
            />
          </div>
        ) : (
          <div>Coming soon</div>
        )}
      </div>
    </div>
  );
};

TokenTradePool.propTypes = {
  poolAddress: PropTypes.string.isRequired
};

export default TokenTradePool;
