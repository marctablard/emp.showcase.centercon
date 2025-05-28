'use client';
import { useState } from 'react';

export interface CustomerMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
}


interface CustomerMessagesHook {
  messages: CustomerMessage[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for customer messages
 * @returns Customer messages and state
 */
export const useCustomerMessages = (): CustomerMessagesHook => {
  // Mock data for customer
  const mockCustomerMessages: CustomerMessage[] = [
      {
        id: 'msg-1',
        title: 'New Customer Verification Pending',
        content: 'Your account verification is pending. Please complete the verification process.',
        date: '2025-05-27T14:30:00',
        read: false
      },
      {
        id: 'msg-2',
        title: 'Return #ORD-32156 has been processed',
        content: 'Your return request #ORD-32156 has been processed successfully.',
        date: '2025-05-26T10:15:00',
        read: true
      },
      {
        id: 'msg-3',
        title: 'Feedback on Quote required',
        content: 'Please provide feedback on quote #Q-123456 by May 30th.',
        date: '2025-05-25T16:45:00',
        read: false
      },
      {
        id: 'msg-4',
        title: 'Order Confirmation',
        content: 'Your order #ORD-123456 has been confirmed and is being processed.',
        date: '2025-05-24T09:20:00',
        read: true
      }
    ]

  const [messages] = useState<CustomerMessage[]>(mockCustomerMessages);
  const [loading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  return {
    messages,
    loading,
    error
  };
};

export default useCustomerMessages;
