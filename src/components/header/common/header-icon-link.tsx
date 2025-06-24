import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface HeaderIconLinkProps {
  icon: LucideIcon;
  text: string;
  href: string;
}

export default function HeaderIconLink({ icon: Icon, text, href }: HeaderIconLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-col text-primary-600 items-center min-w-12 rounded-sm p-0.5 hover:bg-primary hover:text-white transition-colors focus-visible:outline-2 focus:outline-primary"
    >
      <Icon className="w-8 h-8" />
      <p className="text-sm font-bold -mt-1">{text}</p>
    </Link>
  );
}
