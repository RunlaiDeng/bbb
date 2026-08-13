const BBB_POOL = "0x2340cd5ec3e6c51c217212f5092d56d594f0bd0e";

export async function getBBBPrice() {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/xdc/pools/${BBB_POOL}`
    );
    if (!response.ok) throw new Error(`Price request failed: ${response.status}`);
    const attributes = (await response.json())?.data?.attributes;
    return {
      price: Number(attributes?.base_token_price_usd) || 0,
      basePrice: Number(attributes?.base_token_price_native_currency) || 0,
    };
  } catch (error) {
    console.error("Failed to load BBB price:", error);
    return { price: 0, basePrice: 0 };
  }
}
