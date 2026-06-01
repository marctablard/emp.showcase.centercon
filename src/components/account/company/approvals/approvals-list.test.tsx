/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import type { Approval } from '@/platform/services/model/approval';
import { ApprovalsList } from './approvals-list';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <div>{placeholder}</div>,
}));

jest.mock('@/hooks/approval/useApprovals', () => ({
  useApprovals: (initialApprovals?: Approval[]) => ({
    approvals: initialApprovals ?? [],
    loading: false,
    error: null,
    filterApprovals: jest.fn(),
    refreshApprovals: jest.fn(),
  }),
}));

describe('company ApprovalsList', () => {
  it('keeps QUOTE approvals visible in the aggregated company approval list and on the canonical approval route', () => {
    const approvals: Approval[] = [
      {
        id: 'approval-quote-1',
        resourceType: 'QUOTE',
        action: 'CHECKOUT',
        status: 'PENDING',
        resource: { id: 'quote-1' },
        requestor: { userId: 'requestor-1' },
        approver: { userId: 'approver-1', firstName: 'Approver', lastName: 'One', fullName: 'Approver One' },
        createdAt: '2026-06-01T10:00:00.000Z',
      },
      {
        id: 'approval-cart-1',
        resourceType: 'CART',
        action: 'CHECKOUT',
        status: 'APPROVED',
        resource: { id: 'cart-1' },
        requestor: { userId: 'requestor-2' },
        approver: { userId: 'approver-2', firstName: 'Approver', lastName: 'Two', fullName: 'Approver Two' },
        createdAt: '2026-05-31T10:00:00.000Z',
      },
    ];

    render(<ApprovalsList initialApprovals={approvals} />);

    expect(screen.getByText('resourceType')).toBeInTheDocument();
    expect(screen.getByText('QUOTE')).toBeInTheDocument();
    expect(screen.getByText('CART')).toBeInTheDocument();
    expect(screen.getByText('requestor-1')).toBeInTheDocument();
    expect(screen.getByText('Approver One')).toBeInTheDocument();
    expect(screen.getByText('Approver Two')).toBeInTheDocument();

    const quoteRow = screen.getByText('approval-quote-1').closest('tr');

    expect(quoteRow).not.toBeNull();
    expect(within(quoteRow as HTMLTableRowElement).getByRole('link', { name: 'view' })).toHaveAttribute(
      'href',
      '/account/approval/approval-quote-1',
    );
  });
});
