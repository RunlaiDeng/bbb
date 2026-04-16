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
      className={`tab tab-sm rounded-md ${
        activeTab === type ? "tab-active bg-base-200 text-primary" : ""
      }`}
      onClick={() => setActiveTab(type)}
    >
      {label}
    </a>
  );

  return (
    <div className="card h-full overflow-y-auto whitespace-nowrap bg-transparent shadow-none" id="chart">
      <div className="card-body p-2">
        <div className="flex gap-2 text-base-content/70 font-semibold text-sm">
          <div role="tablist" className="tabs tabs-boxed bg-base-300/50 w-full gap-1 p-1">
            <TabButton type={TAB_TYPES.MARKET} label="Market Trades" />
            <TabButton type={TAB_TYPES.MY_TRADES} label="My Trades" />
          </div>
        </div>

        {activeTab === TAB_TYPES.MARKET ? (
          <div className="h-full min-h-[280px] rounded-md border border-base-300 overflow-hidden bg-base-300/30">
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
          <div className="text-base-content/60 text-sm py-6 text-center">Coming soon</div>
        )}
      </div>
    </div>
  );
};

TokenTradePool.propTypes = {
  poolAddress: PropTypes.string.isRequired
};

export default TokenTradePool;
