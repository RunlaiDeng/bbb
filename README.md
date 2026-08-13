# BBBFiSwap

BBBFiSwap is a multi-chain interface with XDC DeFi and a BSC wallet view:

- Swap XDC and ERC-20 tokens.
- Add permissionless XDC/token liquidity.
- Preview the upcoming BBB staking experience (Coming Soon).
- View the connected wallet's BBB balance on BNB Smart Chain.

## Development

Node.js 20 or newer is required.

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

The application uses XDC and BSC RPC endpoints and on-chain contracts; it has no local database.
