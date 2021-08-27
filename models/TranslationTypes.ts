import * as translations from "../translations/Translations";

export interface TranslationsData {
    languageName: string;
    langCode: translations.LangCodes;
    translation: {[key: string]: string | number};
}

export interface TranslationsResponse {
    translationsData: { [key in translations.LangCodes]: TranslationsData };
    title: string;
    defaultPhrases: { [key: string]: string | number };
    LangCode: translations.LangCodes;
}