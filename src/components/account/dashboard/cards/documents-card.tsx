import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { BookText, Building, FileText, ShieldCheck } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import UiLink from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { DashboardCard } from './dashboard-card';

interface DocumentCategory {
  id: string;
  titleKey: string;
  href: string;
  icon: React.ElementType;
  highlighted?: boolean;
}

interface DocumentsCardProps {
  className?: string;
  title?: string;
}

export const DocumentsCard: FC<DocumentsCardProps> = ({ className, title, ...props }) => {
  const t = useTranslations('account.Documents');

  const documentCategories: DocumentCategory[] = [
    {
      id: 'contracts',
      titleKey: 'categories.contracts',
      href: '/account/documents/contracts',
      icon: FileText,
    },
    {
      id: 'company',
      titleKey: 'categories.company',
      href: '/account/documents/company',
      icon: Building,
    },
    {
      id: 'manuals',
      titleKey: 'categories.manuals',
      href: '/account/documents/manuals',
      icon: BookText,
      highlighted: true,
    },
    {
      id: 'warranty',
      titleKey: 'categories.warranty',
      href: '/account/documents/warranty',
      icon: ShieldCheck,
    },
  ];

  return (
    <DashboardCard variant="default" className={cn('py-4', className)} {...props}>
      <div className="flex justify-between items-center mb-4">
        <CardTitle className="text-4xl font-bold">{title || t('title')}</CardTitle>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {documentCategories.map((category) => (
          <UiLink
            key={category.id}
            type="Button"
            href={category.href}
            className={cn(
              'flex items-center gap-4 p-4 border-1 border-border-primary hover:border-border-action-hover rounded-md hover:text-text-action-hover hover:bg-surface-action-hover-2 transition-colors text-black no-underline',
            )}
          >
            <div>
              <category.icon className={cn('h-8 w-8')} />
            </div>
            <span className="text-base font-bold text-start">{t(category.titleKey)}</span>
          </UiLink>
        ))}
      </div>
    </DashboardCard>
  );
};

export default DocumentsCard;
