import BatteryIncludedApiInvoker from './BatteryIncludedApiInvoker';
import { BatteryIncludedConfig } from '../../config';

// Mock fetch
global.fetch = jest.fn();

describe('BatteryIncludedApiInvoker', () => {
  let apiInvoker: BatteryIncludedApiInvoker;
  let mockConfig: BatteryIncludedConfig;
  
  beforeEach(() => {
    // Reset mocks
    (global.fetch as jest.Mock).mockReset();
    
    // Create mock config
    mockConfig = {
      baseUrl: 'https://api.batteryincluded.com',
      apiKey: 'test-api-key',
      collection: 'test-collection'
    };
    
    // Create API invoker instance
    apiInvoker = new BatteryIncludedApiInvoker(mockConfig);
  });

  describe('apiFetch', () => {
    it('should call fetch with the correct URL and headers', async () => {
      // Mock fetch response
      const mockResponse = { status: 200, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const url = '/api/v1/collections/test-collection/documents/browse';
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      
      await apiInvoker.apiFetch(url, options);
      
      // Check fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.batteryincluded.com/api/v1/collections/test-collection/documents/browse',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-BI-API-KEY': 'test-api-key'
          }
        }
      );
    });

    it('should add API key header to requests without existing headers', async () => {
      // Mock fetch response
      const mockResponse = { status: 200, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method with no headers
      const url = '/api/v1/collections/test-collection/documents/browse';
      
      await apiInvoker.apiFetch(url);
      
      // Check fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.batteryincluded.com/api/v1/collections/test-collection/documents/browse',
        {
          headers: {
            'X-BI-API-KEY': 'test-api-key'
          }
        }
      );
    });

    it('should return the fetch response', async () => {
      // Mock fetch response
      const mockResponse = { status: 200, json: jest.fn() };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await apiInvoker.apiFetch('test-url');
      
      // Check result
      expect(result).toBe(mockResponse);
    });
  });
});
