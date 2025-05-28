import { useState } from 'react';

export interface Country {
    code: string;
    name: string;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    formatRule: string;
}

const mockCurrencies = [
    {
        code: 'EUR',
        name: 'Euro',
        symbol: '',
        formatRule: '{symbol}{amount}'
    },
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        formatRule: '{symbol}{amount}'
    },
    {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        formatRule: '{symbol}{amount}'
    },
    {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        formatRule: '{amount}{symbol}'
    },

]

const mockCountries = [
    {
        code: 'DE',
        name: 'Germany'
    },
    {
        code: 'AT',
        name: 'Austria'
    },
    {
        code: 'CH',
        name: 'Switzerland'
    }
]
;

const useSiteConfig = (site: string) => {
    if (!site) {
        site = 'main' // TODO get proper default
    }
    // TODO implement actual data fetching
    const [currencies, setCurrencies] = useState(mockCurrencies);
    const [shippingCountries, setShippingCountries] = useState(mockCountries);
    const [billingCountries, setBillingCountries] = useState(mockCountries);
    return { currencies, setCurrencies, shippingCountries, setShippingCountries, billingCountries, setBillingCountries };
}

export default useSiteConfig;