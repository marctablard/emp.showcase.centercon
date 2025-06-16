import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ArrowRight, Gauge, MessageSquareQuote, ScanSearch, ShoppingCart } from 'lucide-react';

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
  blok: {
    title: string;
    link: string;
    link_name: string;
    icon: string;
  };
}

interface QuickEntryProps {
  blok: {
    elements: QuickEntry[];
  };
}

const QuickEntryElement = ({ blok }: QuickEntryElementProps) => {
  const Icon = blok.icon && IconVariant[blok.icon as keyof typeof IconVariant];
  return (
    <div className="flex gap-6 align-center min-w-full bg-white shadow-lg first:rounded-ss-xl last:rounded-ee-xl md:first:rounded-ss-3xl md:last:rounded-ee-3xl">
      <div className="bg-primary-500 hover:bg-primary-700 text-white p-4 lg:p-5 rounded-ss-[inherit]">
        {Icon && <Icon className="w-8 h-8 lg:w-10 lg:h-10" />}
      </div>
      <div className="flex flex-col justify-center bg-white ">
        <p className="text-xl font-bold">{blok.title}</p>
        <Link
          href={blok.link}
          className="text-base inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {blok.link_name}
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
};

const QuickEntry = ({ blok }: QuickEntryProps) => {
  return (
    <div {...storyblokEditable(blok)} className="mb-10">
      <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr]  gap-6 py-6 px-9 bg-primary-50">
        {blok.elements &&
          blok.elements.map((element, index) => {
            return <QuickEntryElement key={index} blok={element} />;
          })}
      </div>
    </div>
  );
};

export default QuickEntry;
