import { Container } from 'inversify';
import { TokenManager } from '../../common/TokenManager';
import EmporixApiInvoker from '../../common/impl/EmporixApiInvoker';
import { EmporixTestTokenManager } from '../../common/impl/EmporixTokenManager.test';
import { EmporixConfig } from '../../config';
import { EmporixCustomerAddress } from '../../model/customer';
import EmporixOAuthApi from '../../oauth/impl/EmporixOAuthApi';
import EmporixCustomerApi from './EmporixCustomerApi';

// Using EmporixTestTokenManager from the imported file
const tenant = process.env.NEXT_EMPORIX_TEST_TENANT || '';

// Create a test config implementation
class TestEmporixConfig implements EmporixConfig {
  baseUrl: string = process.env.NEXT_EMPORIX_TEST_BASE_URL || 'https://api.emporix.io';
  tenant: string = tenant;
  clientId: string = process.env.NEXT_EMPORIX_TEST_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_EMPORIX_TEST_CLIENT_SECRET || '';
  serverClientId: string = process.env.NEXT_EMPORIX_TEST_SERVER_CLIENT_ID || '';
  serverClientSecret: string = process.env.NEXT_EMPORIX_TEST_SERVER_CLIENT_SECRET || '';
}

// Sample address for testing
const sampleAddress: Partial<EmporixCustomerAddress> = {
  contactName: 'Test Customer',
  companyName: 'Test Company',
  street: 'Test Street',
  zipCode: '12345',
  city: 'Test City',
  country: 'DE',
};

describe('EmporixCustomerApi', () => {
  let container: Container;
  let customerApi: EmporixCustomerApi;
  let oauthApi: EmporixOAuthApi;
  let apiInvoker: EmporixApiInvoker;
  let tokenManager: TokenManager;

  // Set up the DI container and create instances before all tests
  beforeAll(() => {
    // Create a new container for dependency injection
    container = new Container();
    container.bind<EmporixConfig>('EmporixConfig').toConstantValue(new TestEmporixConfig());
    container.bind<TokenManager>('EmporixTokenManager').to(EmporixTestTokenManager).inSingletonScope();
    container.bind<EmporixApiInvoker>('EmporixApiInvoker').to(EmporixApiInvoker).inSingletonScope();
    container.bind<EmporixOAuthApi>('EmporixOAuthApi').to(EmporixOAuthApi).inSingletonScope();
    container.bind<EmporixCustomerApi>('EmporixCustomerApi').to(EmporixCustomerApi).inSingletonScope();

    // Get instances from the container
    customerApi = container.get<EmporixCustomerApi>('EmporixCustomerApi');
    oauthApi = container.get<EmporixOAuthApi>('EmporixOAuthApi');
    apiInvoker = container.get<EmporixApiInvoker>('EmporixApiInvoker');
    tokenManager = container.get<TokenManager>('EmporixTokenManager');

    // Clear any existing tokens to ensure a fresh session
    tokenManager.clearTokens(tenant);
  }, 10000);

  // Tests for authenticated customer API operations
  describe('Customer Address Management', () => {
    // Create a test user session before tests
    beforeAll(async () => {
      // Get a session token if needed
      try {
        // Check if we need to authenticate
        const username = 'forrest.gump@alaba.ma';
        const password = 'Test1234';
        if (username && password) {
          // Login with the test credentials if available
          await customerApi.login(username, password);
        } else {
          throw new Error('Test credentials not found');
        }
      } catch (error) {
        console.error('Error during test setup authentication:', error);
        throw error;
      }
    }, 15000);

    // Clean up after all tests
    afterAll(async () => {
      // Clear tokens
      await tokenManager.clearTokens(tenant);
    }, 10000);

    it('should get customer addresses', async () => {
      try {
        // Call the getCustomerAddresses function
        const addresses = await customerApi.getCustomerAddresses();

        // Verify we got an array of addresses
        expect(addresses).toBeDefined();
        expect(Array.isArray(addresses)).toBe(true);

        // Even if the user has no addresses, we should get an empty array
        // rather than an error
        if (addresses.length > 0) {
          // If addresses exist, verify they have the expected structure
          const firstAddress = addresses[0];
          expect(firstAddress).toHaveProperty('id');
          expect(firstAddress).toHaveProperty('country');
          // Add more field checks as needed for your address structure
        }
      } catch (error) {
        console.error('Error getting customer addresses:', error);
        throw error;
      }
    }, 10000);

    // Tests for other address management functions
    it('should add a customer address and then delete it', async () => {
      try {
        // Generate a unique test address to avoid conflicts
        const uniqueTestAddress: Partial<EmporixCustomerAddress> = {
          ...sampleAddress,
          contactName: `Test Customer ${Date.now()}`, // Add timestamp for uniqueness
          tags: ['SHIPPING'],
        };
        // Step 1: Add a new address
        const result = await customerApi.addCustomerAddress(uniqueTestAddress);
        // Verify the result has an ID
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();

        // Store the ID for cleanup or further tests
        const addressId = result.id;
        console.log(`Created test address with ID: ${addressId}`);

        // Step 2: Verify the address was added by retrieving all addresses
        const addresses = await customerApi.getCustomerAddresses();
        const addedAddress = addresses.find((addr) => addr.id === addressId);

        expect(addedAddress).toBeDefined();
        expect(addedAddress?.contactName).toBe(uniqueTestAddress.contactName);
        expect(addedAddress?.street).toBe(uniqueTestAddress.street);
        expect(addedAddress?.city).toBe(uniqueTestAddress.city);

        // Step 3: Clean up - delete the test address
        // Da deleteCustomerAddress void zurückgibt, testen wir, dass es ohne Fehler ausgeführt wird
        let deleteError = null;
        try {
          await customerApi.deleteCustomerAddress(addressId);
          console.log('Address deletion executed successfully');
        } catch (error) {
          console.log('Error deleting address:', error);
          deleteError = error;
        }
        expect(deleteError).toBeNull();

        // Step 4: Verify the address was deleted
        const addressesAfterDelete = await customerApi.getCustomerAddresses();
        const addressExists = addressesAfterDelete.some((addr) => addr.id === addressId);
        expect(addressExists).toBe(false);

        console.log(`Successfully deleted test address with ID: ${addressId}`);
      } catch (error) {
        console.error('Error in address creation/deletion test:', error);
        throw error;
      }
    }, 15000);

    it('should update a customer address', async () => {
      try {
        // Step 1: Create a test address to update
        const initialAddress: Partial<EmporixCustomerAddress> = {
          ...sampleAddress,
          contactName: `Update Test Customer ${Date.now()}`,
          tags: ['SHIPPING'],
        };

        // Add the initial address
        const createResult = await customerApi.addCustomerAddress(initialAddress);
        expect(createResult).toBeDefined();
        expect(createResult.id).toBeDefined();
        const addressId = createResult.id;
        console.log(`Created test address for update with ID: ${addressId}`);

        // Step 2: Update the address
        const updatedData: Partial<EmporixCustomerAddress> = {
          contactName: `Updated Customer ${Date.now()}`,
          companyName: 'Updated Company Name',
          street: 'Updated Street',
          streetNumber: '42',
          zipCode: '54321',
          city: 'Updated City',
          tags: ['SHIPPING', 'BILLING'], // Add billing tag
        };

        await customerApi.updateCustomerAddress(addressId, updatedData);
        console.log(`Updated address with ID: ${addressId}`);

        // Step 3: Verify the update was successful
        const addresses = await customerApi.getCustomerAddresses();
        const updatedAddress = addresses.find((addr) => addr.id === addressId);

        expect(updatedAddress).toBeDefined();
        expect(updatedAddress?.contactName).toBe(updatedData.contactName);
        expect(updatedAddress?.companyName).toBe(updatedData.companyName);
        expect(updatedAddress?.street).toBe(updatedData.street);
        expect(updatedAddress?.streetNumber).toBe(updatedData.streetNumber);
        expect(updatedAddress?.zipCode).toBe(updatedData.zipCode);
        expect(updatedAddress?.city).toBe(updatedData.city);

        // Check that both tags are present (could be in any order)
        expect(updatedAddress?.tags).toContain('SHIPPING');
        expect(updatedAddress?.tags).toContain('BILLING');

        // Step 4: Clean up - delete the test address
        let deleteError = null;
        try {
          await customerApi.deleteCustomerAddress(addressId);
        } catch (error) {
          console.log('Error deleting address:', error);
          deleteError = error;
        }
        expect(deleteError).toBeNull();

        // Verify deletion
        const addressesAfterDelete = await customerApi.getCustomerAddresses();
        const addressExists = addressesAfterDelete.some((addr) => addr.id === addressId);
        expect(addressExists).toBe(false);

        console.log(`Successfully completed address update test for ID: ${addressId}`);
      } catch (error) {
        console.error('Error in address update test:', error);
        throw error;
      }
    }, 15000);
  });
});
