import { defaultLocale, defaultLocaleCode } from "@/i18n";

export const moneyFormatter = new Intl.NumberFormat(defaultLocaleCode, {
  style: "currency",
  currency: defaultLocale.currencyCode ?? "USD",
});
