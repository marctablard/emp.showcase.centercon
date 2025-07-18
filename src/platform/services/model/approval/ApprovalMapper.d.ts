import { Approval } from '@/platform/services/model/approval';
import { Mapper } from '../Mapper';

/**
 * Specialized mapper interface for transforming between external approval data sources
 * and the internal Approval domain model.
 *
 * @template SOURCE_TYPE - The external approval data format (typically from an API or data source)
 * @extends {Mapper<SOURCE_TYPE, Approval>} - Extends the generic Mapper interface with Approval as the service type
 */
export interface ApprovalMapper<SOURCE_TYPE> extends Mapper<SOURCE_TYPE, Approval> {}
