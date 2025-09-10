import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend) // load file dịch từ public/locales
  .use(LanguageDetector) // tự phát hiện ngôn ngữ (browser, localStorage)
  .use(initReactI18next) // tích hợp vào react
  .init({
    fallbackLng: "en", // ngôn ngữ mặc định
    debug: true,
    ns: ["translation"], 
    interpolation: {
      escapeValue: false, // react đã auto escape
    },
  });

export default i18n;
