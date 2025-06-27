import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { Product } from '@/platform/services/model/product';
import { SearchFlyOut } from './search-fly-out';

export interface HeaderSearchProps {
  small: boolean;
}

export default function HeaderSearch({ small }: HeaderSearchProps) {
  const t = useTranslations('header');
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasInitialSearch, setHasInitialSearch] = useState(false);
  const [hasInputFocus, setHasInputFocus] = useState(false);

  // Todo replace with the real thing
  const locale = 'de';

  // Initialize the search hook with Product type and initial results
  const { data: _products, suggestions, loading, getSuggestions, currentQuery } = useSearch<Product>();

  const [query, setQuery] = useState(currentQuery || '');

  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // redirect to /browse with the search terms
  const redirectToBrowse = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/browse?q=${query}`);
    setShowSuggestions(false);
    setHasInputFocus(false);
    inputRef.current?.blur();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHasInputFocus(true);

    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    inputTimeoutRef.current = setTimeout(() => {
      // Fetch suggestions only when at least 2 characters are entered
      if (value.trim().length >= 2) {
        setShowSuggestions(true);
        getSuggestions(value, 'de');
      } else {
        setShowSuggestions(false);
      }
    }, 360);
  };

  useEffect(() => {
    if (loading) {
      setHasInitialSearch(true);
    }
  }, [loading]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      // Check if the click is outside both the input field and suggestions component
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        (!showSuggestions || (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)))
      ) {
        setShowSuggestions(false);
        setHasInputFocus(false);
      }
    },
    [inputRef, suggestionsRef, showSuggestions],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      className={`hidden z-50 drop-shadow-md lg:block relative transition-all transition-discrete duration-350  ${hasInputFocus ? 'search w-full' : 'w-[720px]'}`}
    >
      <form onSubmit={(e) => redirectToBrowse(e)}>
        <Input
          placeholder={small ? t('shortSearch') : t('search')}
          onChange={handleInput}
          onFocus={handleInput}
          ref={inputRef}
          onKeyDown={(e) => e.key === 'Enter' && redirectToBrowse(e)}
          className={`h-[44px] pr-[62px] text-neutral-600 bg-neutral-100 hover:bg-neutral-100 border border-neutral-100 hover:border-primary-700`}
        />

        <Button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent pr-6 cursor-pointer"
          variant={'link'}
        >
          <Search className="text-primary-600" width="28" height="28" />
        </Button>
      </form>
      {showSuggestions && hasInitialSearch && (
        <SearchFlyOut
          ref={suggestionsRef}
          suggestions={suggestions}
          hasInitialSearch={hasInitialSearch}
          loading={loading}
          locale={locale}
          query={query}
          setQuery={setQuery}
        />
      )}
    </div>
  );
}
