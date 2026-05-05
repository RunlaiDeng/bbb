# AGENTS.md

## Cursor Cloud specific instructions

### Overview

BBBPump (BBBFI) is a DeFi web application on the XDC Network — a single Next.js 14 project (Pages Router, JavaScript, no TypeScript). It provides token trading, liquid staking, swapping, farming, a stablecoin (USDB), IDO launchpad, and NFT game features. All data comes from on-chain smart contracts (via wagmi/viem) and a remote JSON-RPC backend at `https://api.bbbpump.fun`; there is no local database.

### Dev environment

- **Node.js >=20** is required (`engines` field in `package.json`). Use nvm: `source /home/ubuntu/.nvm/nvm.sh && nvm use 20`.
- **Package manager:** npm (lockfile is `package-lock.json`). The `packageManager` field in `package.json` references yarn, but yarn.lock is gitignored; use npm.
- **SWC is disabled** in dev mode because of a custom `.babelrc` — this is expected and not an error.

### Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Production server | `npm start` |

### Notes

- There are **no automated tests** in this codebase (no test framework or test files).
- Lint produces warnings only (react-hooks/exhaustive-deps, no-img-element) — these are pre-existing and not errors.
- The app connects to external services (XDC RPC, api.bbbpump.fun) at runtime; no local backend or database setup is needed.
- Environment variables are optional — `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` has a hardcoded fallback, and other env vars have defaults.
