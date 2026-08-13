# BBBFiSwap

BBBFiSwap is a focused XDC Network DeFi interface with three user flows:

- Swap XDC and ERC-20 tokens.
- Add permissionless XDC/token liquidity.
- Stake BBB or USDC to earn BBB rewards.

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

The application uses XDC RPC endpoints and on-chain contracts; it has no local database.
