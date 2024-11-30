const TokenChartPool = (props) => {
  const { poolAddress } = props;
  return (
    <div className="card " id="chart">
      <div className="card-body p-2">
        <div className="h-[500px]">
          <iframe
            height="100%"
            width="100%"
            id="geckoterminal-embed"
            title="GeckoTerminal Embed"
            src={
              "https://www.geckoterminal.com/xdc/pools/" +
              poolAddress +
              "?embed=1&info=0&swaps=0"
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
