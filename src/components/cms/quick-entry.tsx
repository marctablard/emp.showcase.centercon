import { ArrowRight, Gauge, MessageSquareQuote, ScanSearch, ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const IconVariant = {
  MessageSquareQuote: MessageSquareQuote,
  ScanSearch: ScanSearch,
  Gauge: Gauge,
  ShoppingCart: ShoppingCart,
} as const;

interface QuickEntry {
  title: string;
  link: string;
  link_name: string;
  icon: string;
}

interface QuickEntryElementProps {
  title: string;
  link: string;
  link_name: string;
  icon: string;
}

interface QuickEntryProps {
  elements: QuickEntry[];
}

const QuickEntryElement = ({ title, link, link_name, icon }: QuickEntryElementProps) => {
  const Icon = icon && IconVariant[icon as keyof typeof IconVariant];
  return (
    <Link
      href={link}
      className="flex gap-6 align-center group w-full xl:max-w-[400px] bg-white shadow-lg first:rounded-ss-xl last:rounded-ee-xl md:first:rounded-ss-3xl md:last:rounded-ee-3xl"
    >
      <div className="bg-primary-500 transition group-hover:bg-primary-700 text-white p-4 lg:p-5 rounded-ss-[inherit]">
        {Icon && <Icon className="w-8 h-8 lg:w-10 lg:h-10" />}
      </div>
      <div className="flex flex-col justify-center bg-white ">
        <p className="md:text-xl font-bold font-headlines">{title}</p>
        <p className="text-base inline-flex items-center gap-1 text-primary font-bold underline transition group-hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white">
          {link_name}
          <ArrowRight />
        </p>
      </div>
    </Link>
  );
};

const QuickEntry = ({ elements }: QuickEntryProps) => {
  return (
    <div className="mb-10 w-full bg-primary-50">
      <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] xl:max-w-[1672px] mx-auto justify-items-center gap-3 md:gap-4 lg:gap-6 px-4 py-4 lg:py-6 lg:px-9">
        {elements &&
          elements.map((element, index) => {
            return <QuickEntryElement key={index} {...element} />;
          })}
      </div>
    </div>
  );
};

export default QuickEntry;
