'use client';
import { useState } from 'react';

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  items: number;
}

export interface Return {
  id: string;
  orderId: string;
  date: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  items: number;
}

export interface Quote {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: string;
}

export interface Approval {
  id: string;
  type: 'order' | 'quote' | 'return';
  referenceId: string;
  requestedBy: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CompanyFinancials {
  revenue: number;
  budget: number;
  remainingBudget: number;
  currency: string;
}

export interface Company {
  id: string;
  name: string;
  orders: Order[];
  returns: Return[];
  quotes: Quote[];
  approvals: Approval[];
  financials: CompanyFinancials;
}

interface CompanyHook {
  company: Company | null;
  loading: boolean;
  error: Error | null;
  orderSummary: { total: number; inProgress: number };
  returnSummary: { total: number; open: number };
  pendingApprovals: number;
}

/**
 * Hook for company data
 * @returns Company data and state
 */
export const useCompany = (): CompanyHook => {
  // Mock data for company
  const mockCompany: Company = {
    id: 'comp-789012',
    name: 'Acme Corporation',
    orders: [
      {
        id: 'ord-001',
        date: '2025-05-20T10:30:00',
        total: 1250.99,
        status: 'delivered',
        items: 5
      },
      {
        id: 'ord-002',
        date: '2025-05-22T14:45:00',
        total: 799.50,
        status: 'processing',
        items: 3
      },
      {
        id: 'ord-003',
        date: '2025-05-24T09:15:00',
        total: 349.99,
        status: 'pending',
        items: 2
      },
      {
        id: 'ord-004',
        date: '2025-05-25T16:20:00',
        total: 1599.95,
        status: 'processing',
        items: 7
      },
      {
        id: 'ord-005',
        date: '2025-05-27T11:10:00',
        total: 499.99,
        status: 'processing',
        items: 1
      }
    ],
    returns: [
      {
        id: 'ret-001',
        orderId: 'ord-001',
        date: '2025-05-26T13:40:00',
        status: 'completed',
        items: 1
      },
      {
        id: 'ret-002',
        orderId: 'ord-002',
        date: '2025-05-27T15:30:00',
        status: 'pending',
        items: 1
      }
    ],
    quotes: [
      {
        id: 'quo-001',
        date: '2025-05-15T10:00:00',
        total: 2499.99,
        status: 'approved',
        expiresAt: '2025-06-15T10:00:00'
      },
      {
        id: 'quo-002',
        date: '2025-05-20T14:30:00',
        total: 1899.95,
        status: 'pending',
        expiresAt: '2025-06-20T14:30:00'
      },
      {
        id: 'quo-003',
        date: '2025-05-25T09:45:00',
        total: 3299.99,
        status: 'pending',
        expiresAt: '2025-06-25T09:45:00'
      }
    ],
    approvals: [
      {
        id: 'apr-001',
        type: 'order',
        referenceId: 'ord-003',
        requestedBy: 'Jane Smith',
        date: '2025-05-24T09:30:00',
        status: 'pending'
      },
      {
        id: 'apr-002',
        type: 'quote',
        referenceId: 'quo-002',
        requestedBy: 'Bob Johnson',
        date: '2025-05-20T15:00:00',
        status: 'pending'
      },
      {
        id: 'apr-003',
        type: 'quote',
        referenceId: 'quo-003',
        requestedBy: 'Alice Williams',
        date: '2025-05-25T10:15:00',
        status: 'pending'
      }
    ],
    financials: {
      revenue: 25000.00,
      budget: 50000.00,
      remainingBudget: 25000.00,
      currency: 'USD'
    }
  };

  const [company] = useState<Company | null>(mockCompany);
  const [loading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  // Calculate order summary
  const orderSummary = {
    total: company?.orders.length || 0,
    inProgress: company?.orders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length || 0
  };

  // Calculate return summary
  const returnSummary = {
    total: company?.returns.length || 0,
    open: company?.returns.filter(returnItem => 
      returnItem.status === 'pending' || returnItem.status === 'processing'
    ).length || 0
  };

  // Calculate pending approvals
  const pendingApprovals = company?.approvals.filter(
    approval => approval.status === 'pending'
  ).length || 0;

  return {
    company,
    loading,
    error,
    orderSummary,
    returnSummary,
    pendingApprovals
  };
};

export default useCompany;
