'use client';

import { useState } from 'react';
import { useSite } from './site/useSite';

const useCurrency = () => {
  const { currencies } = useSite();

  const [currency, setCurrency] = useState(currencies?.[0]);
  // TODO implement
  return { currency, setCurrency };
};

export default useCurrency;
