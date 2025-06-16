import { EmporixLabel, PaginatedResponse } from '../model';

export interface EmporixLabelApi {
  /**
   * Retrieves a specified label's details.
   * @link https://developer.emporix.io/docs/openapi/label/#operation/GET-label-retrieve-label
   * @param id The label ID to retrieve
   */
  getLabel(id: string): Promise<EmporixLabel | undefined>;

  /**
   * Retrieves a list of labels.
   * @link https://developer.emporix.io/docs/openapi/label/#operation/GET-label-list-labels
   * @param page The page number (0-based)
   * @param pageSize The number of items per page
   * @param justOverlay If true, only returns labels with overlay.position >= 1
   */
  getLabels(page?: number, pageSize?: number, justOverlay?: boolean): Promise<PaginatedResponse<EmporixLabel>>;
}
