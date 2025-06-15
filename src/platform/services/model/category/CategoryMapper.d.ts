import { EmporixCategory } from '@platform/integrations/emporix/model';
import { Mapper } from '../Mapper';

/**
 * Specialized mapper interface for transforming between external category data sources
 * and the internal Category domain model.
 */
export interface CategoryMapper<SOURCE_TYPE> extends Mapper<SOURCE_TYPE, Category> {}
