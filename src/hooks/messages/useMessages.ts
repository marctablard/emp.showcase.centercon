'use client';

import { useState } from 'react';
import useCustomerMessages from '../customer/useCustomerMessages';

export function useMessages() {
  // Simply re-export the customer messages hook with the same interface
  return useCustomerMessages();
}
