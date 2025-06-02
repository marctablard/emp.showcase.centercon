import { useState } from 'react';

const useCurrency = () => {
  const [currency, setCurrency] = useState('EUR');
  // TODO implement
  return { currency, setCurrency };
};

export default useCurrency;
