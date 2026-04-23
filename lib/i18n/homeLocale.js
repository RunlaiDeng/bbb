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
  heroRiskToggle: "Risk notice",
  heroDisclaimer:
    "Staking involves smart-contract and network risks. APR and exchange rates are not guaranteed and can change. Do your own research before participating.",
  liquidityStaking: "XDC Liquid Staking",
  specHint: "Native XDC → bXDC. Exit via instant liquidity or a delayed queue.",
  poolStatsToggle: "Pool metrics",
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
  connectToSeeBalances: "Connect your wallet to see balances and stake.",
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
  walletXdc: "Wallet",
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
  xdcAmountPlaceholder: "XDC amount",
  youWillReceive: "You will receive",
  estimatedNetworkFee: "Est. network fee",
  unbondingDelay: "Unbonding delay",
  protocolApr: "Protocol APR",
  aprNotOnChain: "N/A (not on-chain)",
  enterAmount: "Enter an amount",
  belowMinStake: "Below minimum stake",
  exceedsBalance: "Exceeds balance",
  faqTitle: "FAQ",
  faq: [
    {
      q: "What is XDC liquid staking?",
      a: "You stake native XDC into a pooled liquid staking contract and receive bXDC, a tokenized representation of your position. The pool routes stake toward protocol-eligible masternodes; rewards are reflected in the bXDC exchange mechanics per contract rules.",
    },
    {
      q: "What is bXDC?",
      a: "bXDC is the liquid staking token you get when you stake. It can be used in DeFi or held in your wallet while the underlying XDC remains staked, subject to liquidity and protocol design.",
    },
    {
      q: "How do I exit or withdraw?",
      a: "Depending on available instant liquidity, you may redeem immediately from the buffer. If the buffer cannot cover the full amount, the protocol can issue a withdrawal path with a time delay and/or an NFT ticket so XDC is paid out when conditions are met (e.g. FIFO and unbonding). Always check the live pool parameters in the app.",
    },
    {
      q: "Is APR or the exchange rate guaranteed?",
      a: "No. Staking returns, the bXDC reference rate, and network conditions can change. Treat any displayed figures as non-binding and do your own research before participating.",
    },
    {
      q: "What are the main risks?",
      a: "Smart-contract bugs, network upgrades, masternode and protocol parameters, liquidity for instant exits, and market risk can all affect outcomes. Only use funds you can afford to put at risk.",
    },
  ],
};

const zh = {
  heroTitle: "质押 XDC",
  heroSubtitle: "质押 XDC，获得可流通的 bXDC，同时参与池化质押收益。",
  heroRiskToggle: "风险说明",
  heroDisclaimer:
    "质押涉及智能合约与网络风险；年化与兑换比例不保证且可能变化。参与前请自行研究并谨慎决策。",
  liquidityStaking: "XDC 流动性质押",
  specHint: "原生 XDC → bXDC；退出可走即时流动性或延迟队列。",
  poolStatsToggle: "池子指标",
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
  connectToSeeBalances: "连接钱包后可查看余额并质押。",
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
  walletXdc: "钱包",
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
  xdcAmountPlaceholder: "XDC 数量",
  youWillReceive: "预计获得",
  estimatedNetworkFee: "预估网络费用",
  unbondingDelay: "解绑延迟",
  protocolApr: "协议年化",
  aprNotOnChain: "暂无（链上未提供）",
  enterAmount: "请输入数量",
  belowMinStake: "低于最小质押",
  exceedsBalance: "超过余额",
  faqTitle: "常见问题",
  faq: [
    {
      q: "什么是 XDC 流动性质押？",
      a: "将原生 XDC 质押进池化流动性质押合约后，会获得 bXDC，作为您持仓的代币化表示。资金按协议与合约规则参与合格主节点；收益通过 bXDC 的兑换与合约机制体现。",
    },
    {
      q: "什么是 bXDC？",
      a: "bXDC 是质押后获得的流动性质押代币。在符合流动性与协议设计的前提下，可在 DeFi 场景使用或自持，而底层 XDC 仍处于质押相关状态中。",
    },
    {
      q: "如何退出或赎回？",
      a: "若即时流动性缓冲足够，可能支持即时退出；若无法全额覆盖，协议可启用带时间延迟与/或 NFT 票据的赎回路径，在条件满足时按队列兑付 XDC。请以应用内实时池子参数与提示为准。",
    },
    {
      q: "年化或兑换比例是否保证？",
      a: "不保证。质押收益、bXDC 参考汇率与网络环境都可能变化。界面上任何数字仅作参考，参与前请自行研究并评估风险。",
    },
    {
      q: "主要风险有哪些？",
      a: "包括智能合约风险、网络升级、主节点与协议参数、即时退出的流动性以及市场风险等。请仅使用您能承担损失的资金参与。",
    },
  ],
};

export const homeUi = { en, zh };

export function getHomeStrings(locale) {
  return locale === "zh" ? zh : en;
}
