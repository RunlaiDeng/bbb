export default async function handler(req, res) {
  const resp = await fetch(
    "https://api.bybit.com/v5/market/tickers?category=spot&symbol=XDCUSDT"
  );
  const json = await resp.json();

  res.status(200).send(json);
}
