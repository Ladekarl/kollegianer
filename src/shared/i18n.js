'use strict';

import I18n from 'react-native-i18n';
import en from '../../locales/en.json';
import da from '../../locales/da.json';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
  en,
  da,
};

I18n.fallbacks = true;
const currentLocale = I18n.currentLocale();
console.log(currentLocale);

export function strings(name, params = {}) {
  return I18n.t(name, params);
}

export default I18n;
