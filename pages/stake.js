import Head from "next/head";
import Image from "next/image";
import { BBB_TOKEN_ADDRESS } from "@/config/bbbfiswap";
import { useTranslation } from "@/lib/i18n/useTranslation";

function CarrotTokenMark() {
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-[0_18px_45px_-20px_rgba(5,150,105,0.5)]">
      <Image
        src="/logo.png"
        alt="BBB carrot token logo"
        width={228}
        height={96}
        priority
        className="absolute left-0 h-24 w-auto max-w-none object-contain object-left"
      />
    </div>
  );
}

export default function Stake() {
  const t = useTranslation().stakePage;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
      </Head>

      <section className="dex-surface relative min-h-[calc(100vh-4.5rem)] overflow-hidden px-4 pb-28 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="dex-orb dex-orb-left" />
          <div className="dex-orb dex-orb-right" />
          <div className="dex-grid absolute inset-0 opacity-30" />
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.14)]" />
              {t.networkBadge}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white/90 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.42)] backdrop-blur-2xl sm:p-7">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <CarrotTokenMark />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-800">
                    BBB
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-800">
                    {t.comingSoon}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                  {t.poolTitleBbb}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {t.comingSoonDescription}
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm" aria-hidden>
                  🔒
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">{t.launchStatus}</p>
                <p className="mt-1 font-semibold text-slate-950">{t.statusPreparing}</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm" aria-hidden>
                  🥕
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">{t.rewardToken}</p>
                <p className="mt-1 font-semibold text-slate-950">BBB</p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3">
              <p className="text-xs font-medium text-slate-400">{t.contractLabel}</p>
              <p className="mt-1 truncate font-mono text-xs text-slate-600" title={BBB_TOKEN_ADDRESS}>
                {BBB_TOKEN_ADDRESS}
              </p>
            </div>

            <button
              type="button"
              disabled
              className="mt-5 h-14 w-full cursor-not-allowed rounded-[1.25rem] border border-amber-200 bg-amber-100 text-base font-bold text-amber-800 opacity-100"
            >
              {t.comingSoon}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">
              {t.disabledNote}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
