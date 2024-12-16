const TokenChartPool = (props) => {
  const { poolAddress } = props;
  return (
    <div className="card h-full overflow-y-auto" id="chart">
      <div className="card-body p-0">
        <div className="h-full">
          <iframe
            height="100%"
            width="100%"
            id="geckoterminal-embed"
            title="GeckoTerminal Embed"
            src={
              "https://www.geckoterminal.com/xdc/pools/" +
              poolAddress +
              "?embed=1&info=0&swaps=0&light_chart=1"
            }
            frameBorder="0"
            allow="clipboard-write"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TokenChartPool;
