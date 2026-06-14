/** Query key for English / 中文 on the home page (?lang=en | ?lang=zh) */
export const HOME_LANG_QUERY = "lang";

export function getHomeLocale(router) {
  const raw = router?.query?.[HOME_LANG_QUERY];
  const q = Array.isArray(raw) ? raw[0] : raw;
  if (q === "zh" || q === "zh-CN" || q === "cn") return "zh";
  return "en";
}

const en = {
  heroTitle: "BBB IDO",
  heroSubtitle:
    "Burn Beny Bad Boy BBB on XDC to join the BBBFI platform-token IDO on BSC.",
  heroRiskToggle: "IDO notice",
  heroDisclaimer:
    "This is an IDO, not a two-way 1:1 swap or bridge. Participation burns your existing BBB on XDC through the verified burner contract. After the IDO ends, BSC BBB will be distributed according to the IDO rules.",
  idoStatusLabels: {
    loading: "Checking status",
    upcoming: "Opens soon",
    live: "IDO live",
    ended: "IDO ended",
  },
  idoDateRangeLoading: "Loading on-chain schedule",
  startCountdown: "Start countdown",
  endCountdown: "End countdown",
  countdownStarted: "Started",
  countdownEnded: "Ended",
  idoCardTitle: "Burn BBB to Join IDO",
  idoCardSubtitle: "Your burned XDC BBB is recorded as IDO participation.",
  burnTokenLabel: "Burn",
  receiveTokenLabel: "IDO token",
  xdcNetwork: "XDC Network",
  bscNetwork: "BSC platform token",
  idoDistributionNote:
    "BBB will be issued on BSC as the BBBFI platform token with an initial market cap of $300,000 and initial liquidity on PancakeSwap.",
  totalParticipatedLabel: "Total joined",
  totalParticipatedHint: "On-chain total",
  burnAmountLabel: "BBB amount to burn",
  balance: "Balance",
  max: "Max",
  loadingShort: "...",
  bbbAmountPlaceholder: "Enter BBB amount",
  youWillReceive: "Recorded burn amount",
  oneToOneRule:
    "This records your IDO participation. It is not a reversible 1:1 exchange between XDC Beny Bad Boy and BSC BBB.",
  idoCheckingStatus: "Checking IDO status.",
  idoNotStarted: "IDO has not started yet.",
  idoEnded: "IDO has ended.",
  enterBbbAmount: "Enter a BBB amount.",
  invalidAmount: "Enter a valid amount greater than zero.",
  exceedsBbbBalance: "Amount exceeds your BBB balance.",
  connectWallet: "Connect wallet",
  approveBbb: "Approve BBB",
  burnForIdo: "Burn BBB for IDO",
  burnContract: "Burn contract",
  contractSourceNote:
    "The IDO contract provides the on-chain start time, end time, and total participated BBB.",
  faqTitle: "IDO FAQ",
  faq: [
    {
      q: "What is this IDO?",
      a: "This IDO launches BBB as the BBBFI platform token on BSC. During the on-chain schedule shown on this page, users participate by burning Beny Bad Boy BBB on XDC through the verified burner contract.",
    },
    {
      q: "Which contract is used?",
      a: "The home page uses IDO contract 0x6dfda506A1B0513d941E7778c7B8F90e8Fa1C21D on XDC. The button first approves BBB, then calls burn(uint256). The page reads startTime, endTime, and totalParticipatedBBB from this contract.",
    },
    {
      q: "When will I receive the BSC BBB?",
      a: "After the IDO ends, all participating wallets will receive BBB on BSC according to the IDO distribution rules.",
    },
    {
      q: "What happens at launch?",
      a: "BSC BBB will launch with an initial market cap of $300,000 and initial liquidity on PancakeSwap. After distribution, users will be able to trade BBB on PancakeSwap.",
    },
    {
      q: "Is this a 1:1 exchange or bridge?",
      a: "No. This is an IDO, not a two-way swap. After the IDO ends, XDC Beny Bad Boy cannot be exchanged for BSC BBB, and BSC BBB cannot be exchanged back into XDC Beny Bad Boy.",
    },
    {
      q: "What token logo is used?",
      a: "The new BBB display uses the BBBFI favicon.ico as its logo. More platform uses and trading venues may be added in the future.",
    },
    {
      q: "Can burned BBB be recovered?",
      a: "No. Burning is an on-chain transaction and cannot be reversed. Check the amount and contract address carefully before confirming in your wallet.",
    },
  ],
};

const zh = {
  heroTitle: "BBB IDO",
  heroSubtitle:
    "销毁 XDC 链上的 Beny Bad Boy BBB，参与 BBBFI 平台币在 BSC 链上的 IDO。",
  heroRiskToggle: "IDO 说明",
  heroDisclaimer:
    "这次是 IDO，不是双向 1:1 兑换或跨链桥。参与会通过已验证的 burner 合约销毁您在 XDC 链上的 BBB；IDO 结束后，BSC 链 BBB 将按 IDO 规则发放。",
  idoStatusLabels: {
    loading: "正在检查状态",
    upcoming: "即将开始",
    live: "IDO 进行中",
    ended: "IDO 已结束",
  },
  idoDateRangeLoading: "正在读取链上时间",
  startCountdown: "开始倒计时",
  endCountdown: "结束倒计时",
  countdownStarted: "已开始",
  countdownEnded: "已结束",
  idoCardTitle: "销毁 BBB 参与 IDO",
  idoCardSubtitle: "销毁的 XDC 链 BBB 将作为 IDO 参与记录。",
  burnTokenLabel: "销毁",
  receiveTokenLabel: "IDO 代币",
  xdcNetwork: "XDC 网络",
  bscNetwork: "BSC 平台币",
  idoDistributionNote:
    "BBB 将作为 BBBFI 平台币发行在 BSC 链上，初始市值为 30 万美金，并在 PancakeSwap 加入初始流动性。",
  totalParticipatedLabel: "累计参与",
  totalParticipatedHint: "链上总量",
  burnAmountLabel: "销毁 BBB 数量",
  balance: "余额",
  max: "最大",
  loadingShort: "...",
  bbbAmountPlaceholder: "输入 BBB 数量",
  youWillReceive: "已记录销毁数量",
  oneToOneRule:
    "这里记录的是 IDO 参与，不是 XDC 链 Beny Bad Boy 与 BSC 链 BBB 之间可逆的 1:1 兑换。",
  idoCheckingStatus: "正在检查 IDO 状态。",
  idoNotStarted: "IDO 尚未开始。",
  idoEnded: "IDO 已结束。",
  enterBbbAmount: "请输入 BBB 数量。",
  invalidAmount: "请输入大于 0 的有效数量。",
  exceedsBbbBalance: "输入数量超过您的 BBB 余额。",
  connectWallet: "连接钱包",
  approveBbb: "授权 BBB",
  burnForIdo: "销毁 BBB 参与 IDO",
  burnContract: "销毁合约",
  contractSourceNote:
    "IDO 合约提供链上开始时间、结束时间和累计参与 BBB 数量。",
  faqTitle: "IDO 常见问题",
  faq: [
    {
      q: "这次 IDO 是什么？",
      a: "这次 IDO 是将 BBB 作为 BBBFI 平台币发行到 BSC 链上。用户在本页面读取到的链上时间内，通过已验证的 burner 合约销毁 XDC 链上的 Beny Bad Boy BBB 来参与。",
    },
    {
      q: "使用哪个合约？",
      a: "首页使用 XDC 链 IDO 合约 0x6dfda506A1B0513d941E7778c7B8F90e8Fa1C21D。按钮流程为先授权 BBB，再调用 burn(uint256)。页面会从该合约读取 startTime、endTime 和 totalParticipatedBBB。",
    },
    {
      q: "什么时候收到 BSC 链 BBB？",
      a: "IDO 结束后统一发放。所有参与用户都会按 IDO 分配规则收到 BSC 链上的 BBB。",
    },
    {
      q: "BSC 链 BBB 上线时有什么安排？",
      a: "BSC 链 BBB 将以 30 万美金初始市值发行，并在 PancakeSwap 加入初始流动性。IDO 结束并发放后，用户可以在 PancakeSwap 上交易 BBB。",
    },
    {
      q: "这是 1:1 兑换或跨链桥吗？",
      a: "不是。这次是 IDO，不是双向兑换。IDO 结束后，XDC 链上的 Beny Bad Boy 不能再兑换 BSC 链上的 BBB，BSC 链上的 BBB 也不能兑换回 XDC 链上的 Beny Bad Boy。",
    },
    {
      q: "新 BBB 使用什么 logo？",
      a: "新 BBB 的展示 logo 使用 BBBFI 的 favicon.ico。未来还会加入更多平台功能与交易场景。",
    },
    {
      q: "销毁后的 BBB 能找回吗？",
      a: "不能。销毁是链上交易，确认后不可撤销。请在钱包确认前认真核对数量和合约地址。",
    },
  ],
};

export const homeUi = { en, zh };

export function getHomeStrings(locale) {
  return locale === "zh" ? zh : en;
}
