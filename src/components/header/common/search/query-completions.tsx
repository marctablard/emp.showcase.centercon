import React, { Dispatch, SetStateAction } from 'react';
import { History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useHistory from '@/hooks/history/useHistory';

export interface QueryCompletionsProps {
  isProductsShown: boolean;
  queryCompletions: string[];
  setQuery: Dispatch<SetStateAction<string>>;
}

export function QueryCompletions({ isProductsShown, queryCompletions, setQuery }: QueryCompletionsProps) {
  const { searchHistory } = useHistory();
  const completions = isProductsShown ? queryCompletions : searchHistory;
  return (
    <div id="query-completions" className="col-span-5">
      {completions.map((queryCompletion) => (
        <Button
          onClick={() => setQuery(queryCompletion)}
          key={queryCompletion}
          className="p-2 bg-gray-300 rounded-xs mr-6 mb-6"
        >
          {isProductsShown ? <Search /> : <History />} {queryCompletion}
        </Button>
      ))}
    </div>
  );
}

export default QueryCompletions;
