import {AbstractIntlMessages, hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {loadI18nTranslations} from 'next-intl-split/load';

export default getRequestConfig(async ({requestLocale}) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    let messages: AbstractIntlMessages;

    if (process.env.NODE_ENV === 'development') {
        messages = loadI18nTranslations('./src/i18n/translations', locale, true);
    } else {
        messages = (await import(`./translations/${locale}.json`)).default;
    }

    return {
        locale,
        messages
    };
});
