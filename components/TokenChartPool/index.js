const TokenChartPool = ({ poolAddress, network = "xdc", plain = false }) => {
  const iframe = (
    <iframe
      height="100%"
      width="100%"
      id="geckoterminal-embed"
      title="GeckoTerminal Embed"
      src={
        `https://www.geckoterminal.com/${network}/pools/` +
        poolAddress +
        "?embed=1&info=0&swaps=0&light_chart=1"
      }
      frameBorder="0"
      allow="clipboard-write"
      allowFullScreen
    />
  );

  if (plain) {
    return <div className="h-full w-full">{iframe}</div>;
  }

  return (
    <div className="card h-full overflow-y-auto rounded-none" id="chart">
      <div className="card-body p-0">
        <div className="h-full">{iframe}</div>
      </div>
    </div>
  );
};

export default TokenChartPool;
