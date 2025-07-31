/**
 * Generic data transformation interface that facilitates bidirectional conversion
 * between external source data types and internal service data types.
 *
 * @template SOURCE_TYPE - The original data format (typically from an external API or data source)
 * @template SERVICE_TYPE - The internal service representation used within the application
 */
export interface Mapper<SOURCE_TYPE, SERVICE_TYPE> {
  /**
   * Transforms data from the external source format to the internal service format.
   *
   * @param source - The data in source format to be transformed
   * @returns The transformed data in service format
   */
  mapToService(source: SOURCE_TYPE): SERVICE_TYPE;

  /**
   * Transforms data from the internal service format back to the external source format.
   *
   * @param service - The data in service format to be transformed
   * @returns The transformed data in source format
   */
  mapToSource(service: SERVICE_TYPE): SOURCE_TYPE;
}
