/** Query key for English / 中文 on the home page (?lang=en | ?lang=zh) */
export const HOME_LANG_QUERY = "lang";

export function getHomeLocale(router) {
  const raw = router?.query?.[HOME_LANG_QUERY];
  const q = Array.isArray(raw) ? raw[0] : raw;
  if (q === "zh" || q === "zh-CN" || q === "cn") return "zh";
  return "en";
}

const en = {
  heroTitle: "Stake XDC",
  heroSubtitle: "Stake XDC and receive bXDC while your assets participate in pooled staking.",
  heroDisclaimer:
    "Staking involves smart-contract and network risks. APR and exchange rates are not guaranteed and can change. Do your own research before participating.",
  liquidityStaking: "XDC Liquid Staking",
  specHint: "Spec v1.5 · Stake native XDC for bXDC; exits use the instant buffer or a delayed NFT queue.",
  yourBalance: "Your balance",
  poolInfo: "Pool info",
  totalStaked: "Total pooled",
  rate: "Exchange rate",
  bufferHealth: "Buffer health",
  instantBuffer: "Instant exit buffer",
  approxValue: "bXDC ≈",
  stake: "Stake",
  withdraw: "Withdraw",
  connectWallet: "Connect wallet",
  withdrawalTickets: "Withdrawal tickets",
  ticketId: "Ticket",
  xdcOut: "XDC out",
  pending: "Unbonding",
  ready: "Claim",
  redeemed: "Done",
  claim: "Claim",
  blocksLeft: "blocks left",
  stakeXdc: "Stake XDC",
  requestWithdrawal: "Request withdrawal",
  amount: "Amount",
  bxdcAmount: "bXDC amount",
  balance: "Balance",
  max: "Max",
  cancel: "Cancel",
  minStake: "Minimum stake",
  minWithdrawXdc: "Minimum XDC to withdraw (after burn)",
  delayNote:
    "If the instant buffer cannot cover your exit, you receive an NFT ticket and XDC is paid after the unbonding delay (FIFO when liquid is available).",
  blocksDelay: "Unbonding delay (blocks)",
  language: "Language",
  en: "English",
  zh: "中文",
  comingSoonTitle: "XDC Liquid Staking",
  comingSoonBody:
    "Stake XDC to receive liquid bXDC, participate in pooled masternode rewards, and exit via instant liquidity or a delayed queue per protocol rules.",
  comingSoonBadge: "Coming soon",
  viewPools: "View all pools",
  nftEnumerableHint:
    "Withdrawal NFTs must implement ERC721Enumerable for this dashboard to list ticket IDs automatically.",
};

const zh = {
  heroTitle: "质押 XDC",
  heroSubtitle: "质押 XDC，获得可流通的 bXDC，同时参与池化质押收益。",
  heroDisclaimer:
    "质押涉及智能合约与网络风险；年化与兑换比例不保证且可能变化。参与前请自行研究并谨慎决策。",
  liquidityStaking: "XDC 流动性质押",
  specHint: "规范 v1.5 · 质押原生 XDC 获得 bXDC；退出可走即时缓冲池或延迟 NFT 队列。",
  yourBalance: "您的余额",
  poolInfo: "池子信息",
  totalStaked: "池内总量",
  rate: "兑换比例",
  bufferHealth: "缓冲健康度",
  instantBuffer: "即时退出缓冲",
  approxValue: "bXDC 约等于",
  stake: "质押",
  withdraw: "提取",
  connectWallet: "连接钱包",
  withdrawalTickets: "赎回票据",
  ticketId: "票据 ID",
  xdcOut: "对应 XDC",
  pending: "解绑中",
  ready: "可领取",
  redeemed: "已完成",
  claim: "领取",
  blocksLeft: "剩余区块",
  stakeXdc: "质押 XDC",
  requestWithdrawal: "申请赎回",
  amount: "数量",
  bxdcAmount: "bXDC 数量",
  balance: "余额",
  max: "最大",
  cancel: "取消",
  minStake: "最小质押",
  minWithdrawXdc: "最小赎回对应的 XDC（销毁后）",
  delayNote:
    "若即时缓冲不足以覆盖您的退出，您将收到 NFT 票据；解绑延迟结束后按队列（FIFO）在缓冲充足时兑付 XDC。",
  blocksDelay: "解绑延迟（区块）",
  language: "语言",
  en: "English",
  zh: "中文",
  comingSoonTitle: "XDC 流动性质押",
  comingSoonBody: "质押 XDC 获得流动性代币 bXDC，参与池化主节点收益分配，并按协议规则通过即时流动性或延迟队列退出。",
  comingSoonBadge: "即将推出",
  viewPools: "查看全部池子",
  nftEnumerableHint:
    "赎回 NFT 合约需实现 ERC721Enumerable，主页才能自动列出您的票据 ID。",
};

export const homeUi = { en, zh };

export function getHomeStrings(locale) {
  return locale === "zh" ? zh : en;
}
