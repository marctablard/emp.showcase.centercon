import { injectable } from '@/platform/core/di/injectable';
import { EmporixQuoteHistory } from '@/platform/integrations/emporix/model/quote';
import { QuoteHistory } from '..';
import type { QuoteHistoryMapper } from './QuoteHistoryMapper';

/**
 * Implementation of QuoteHistoryMapper for Emporix quote history.
 * Maps Emporix QuoteHistory to internal QuoteHistory model
 */
@injectable('QuoteHistoryMapper', 'Singleton')
export class EmporixQuoteHistoryMapper implements QuoteHistoryMapper<EmporixQuoteHistory> {
  mapToService(emporixQuoteHistory: EmporixQuoteHistory): QuoteHistory {
    return emporixQuoteHistory.map((historyItem) => ({
      id: historyItem.id,
      op: historyItem.op,
      path: historyItem.path,
      newValue: historyItem.newValue,
      previousValue: historyItem.previousValue,
      userId: historyItem.userId,
      userFirstName: historyItem.userFirstName,
      userLastName: historyItem.userLastName,
      userType: historyItem.userType,
      modifiedAt: historyItem.modifiedAt,
    }));
  }
}

export default EmporixQuoteHistoryMapper;
