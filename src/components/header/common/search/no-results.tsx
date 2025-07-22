import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/h';
import { SearchSuggestions } from '@/platform/services/model/search';

export interface NoResultsProps {
  queryCompletions: SearchSuggestions['queryCompletions'];
}

export function NoResults({ queryCompletions }: NoResultsProps) {
  return (
    <div className="">
      <Heading variant={'h5'} className="pb-6">
        We&apos;re sorry – there are no product matches for your search.
      </Heading>
      <p className="text-md pb-6">
        Double-check your search for any typos or spelling mistakes, or try using a different search term.
      </p>
      <p className="text-md">Here are common search queries from other customers:</p>
      {queryCompletions &&
        queryCompletions.map((completion) => (
          <Button key={completion} className="mt-6" disabled={true}>
            <Search /> {completion}
          </Button>
        ))}
    </div>
  );
}

export default NoResults;
