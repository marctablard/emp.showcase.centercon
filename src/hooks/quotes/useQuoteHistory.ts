import { useEffect, useState } from 'react';

export interface QuoteHistoryComment {
  id: string;
  comment: string;
  userFirstName: string;
  userLastName: string;
  userFullName: string;
  modifiedAt: string;
  rawModifiedAt: string;
}

export interface UseQuoteHistoryResult {
  history: QuoteHistoryComment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useQuoteHistory(quoteId: string): UseQuoteHistoryResult {
  const [history, setHistory] = useState<QuoteHistoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/quote/history?quoteId=${encodeURIComponent(quoteId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quote history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch quote history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch quote history'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quoteId) {
      fetchHistory();
    }
  }, [quoteId]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}
