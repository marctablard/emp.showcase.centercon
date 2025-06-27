import React, { Fragment } from 'react';
import { Headline } from '@/components/ui/headline';
import UiLink from '@/components/ui/link';
import { SearchSuggestions } from '@/platform/services/model/search';
import { MarkedText } from './marked-text';

export interface SideBarProps {
  categories: SearchSuggestions['categories'];
  query: string;
}

export function SideBar({ categories, query }: SideBarProps) {
  const links = [
    {
      headline: 'Services & Guides',
      links: [
        { text: 'Catalogs & Guidelines', href: '' },
        { text: 'Safety instructions', href: '' },
        { text: 'Maintenance & Support Guides', href: '' },
        { text: 'Energy Consumption calculator', href: '' },
      ],
    },
    {
      headline: 'Help & Support',
      links: [
        { text: 'FAQs', href: '' },
        { text: 'Contact us', href: '' },
        { text: 'Delivery & Returns', href: '' },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {categories?.length > 0 && (
        <>
          <Headline className="mb-4" variant={'h5'}>
            Categories
          </Headline>
          {categories.map(({ name, count }) => (
            <UiLink className="mb-3" key={name + count} type="Link" href={'href'} variant="secondary">
              <MarkedText text={name} keyword={query} />
            </UiLink>
          ))}
        </>
      )}
      {links.map(({ headline, links }) => (
        <div className="flex flex-col" key={headline}>
          <Headline key={headline} className="mb-4" variant={'h5'}>
            {headline}
          </Headline>
          {links.map(({ text, href }) => (
            <UiLink className="mb-3" key={text} type="Link" href={href} variant="secondary">
              {text}
            </UiLink>
          ))}
        </div>
      ))}
    </div>
  );
}

export default SideBar;
