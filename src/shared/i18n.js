'use strict';

import ReactNative from 'react-native';
import I18n from 'react-native-i18n';
import en from '../../locales/en.json';
import da from '../../locales/da.json';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
    en,
    da
};

const currentLocale = I18n.currentLocale();

export const isRTL = false;
ReactNative.I18nManager.allowRTL(isRTL);

export function strings(name, params = {}) {
    return I18n.t(name, params);
}

export default I18n;