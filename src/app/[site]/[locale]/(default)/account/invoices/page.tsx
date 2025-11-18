import { useTranslations } from 'next-intl';
import PlaceholderPage from '@/components/account/placeholder-page';

export default function InvoicesPage() {
  const t = useTranslations('account.Invoices');

  return <PlaceholderPage title={t('title')} />;
}
