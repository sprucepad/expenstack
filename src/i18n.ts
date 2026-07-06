import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import pt from "./locales/pt.json";

export const defaultLocale = Localization.getLocales()[0];
export const defaultLocaleCode = defaultLocale.languageCode ?? "en";

// this is how i18next works
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
  },
  lng: defaultLocaleCode,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}

/** @lintignore */
export default i18n;
