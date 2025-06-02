'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Approval } from '@/hooks/company/useCompany';

interface ApprovalsCardProps {
  approvals: Approval[];
  className?: string;
}

export function ApprovalsCard({ approvals, className }: ApprovalsCardProps) {
  const t = useTranslations('Account');

  const pendingApprovals = approvals.filter((approval) => approval.status === 'pending');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          {t('pendingApprovals')}
          <Badge variant="secondary">{pendingApprovals.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noApprovals')}</p>
        ) : (
          pendingApprovals.slice(0, 3).map((approval) => (
            <div key={approval.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">
                    {approval.type === 'order' && t('orderApproval')}
                    {approval.type === 'quote' && t('quoteApproval')}
                    {approval.type === 'return' && t('returnApproval')}{' '}
                    <span className="font-normal">#{approval.referenceId}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('requestedBy')}: {approval.requestedBy}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(approval.date), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
        {pendingApprovals.length > 3 && (
          <div className="text-center">
            <Link href="/account/approvals" className="text-xs text-primary hover:underline">
              {t('viewAllApprovals')}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ApprovalsCard;
