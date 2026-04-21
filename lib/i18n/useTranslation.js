import { useMemo } from "react";
import { useLanguage } from "@/components/Context/LanguageContext";
import { getSiteStrings } from "@/lib/i18n/siteStrings";

/** Site-wide UI strings (en/zh) keyed by locale from LanguageContext. */
export function useTranslation() {
  const { locale } = useLanguage();
  return useMemo(() => getSiteStrings(locale), [locale]);
}
