import { Container, inject } from 'inversify';
import EmporixCartApi from '../../cart/impl/EmporixCartApi';
import EmporixCheckoutApi from '../../checkout/impl/EmporixCheckoutApi';
import { TokenManager } from '../../common/TokenManager';
import EmporixApiInvoker from '../../common/impl/EmporixApiInvoker';
import { EmporixTestTokenManager } from '../../common/impl/EmporixTokenManager.test';
import { EmporixConfig } from '../../config';
import EmporixCustomerApi from '../../customer/impl/EmporixCustomerApi';
import { EmporixAddCartItemRequest, EmporixCreateCartRequest } from '../../model';
import {
  EmporixCartCheckoutRequest,
  EmporixCheckoutAddress,
  EmporixCheckoutCustomer,
  EmporixCheckoutPaymentMethod,
  EmporixShipping,
} from '../../model/checkout';
import { EmporixCreateOrderRequest, EmporixUpdateOrderRequest } from '../../model/order';
import EmporixOAuthApi from '../../oauth/impl/EmporixOAuthApi';
import EmporixOrderApi from './EmporixOrderApi';

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

// Sample cart creation request
const sampleCreateCartRequest: EmporixCreateCartRequest = {
  siteCode: 'main',
  currency: 'EUR',
  type: 'shopping',
  channel: {
    name: 'storefront',
    source: 'https://emporix-showcase.com/',
  },
  sessionValidated: true,
};

// Sample cart item request
const sampleAddItemRequest: EmporixAddCartItemRequest = {
  siteCode: 'main',
  itemYrn: 'urn:yaas:saasag:caasproduct:product:showcasetest;1',
  quantity: 1,
  price: {
    priceId: '682c2059e7c3ee6b744ac649',
    effectiveAmount: 9.99,
    originalAmount: 9.99,
    currency: 'EUR',
  },
};

// Sample order creation request (will be populated with actual cart ID)
const sampleCreateOrderRequest: EmporixCreateOrderRequest = {
  cartId: '', // Will be populated during test
  customerEmail: 'test@example.com',
  customerNote: 'Test order note',
  billingAddress: {
    contactName: 'Test Customer',
    companyName: 'Test Company',
    street: 'Test Street',
    zipCode: '12345',
    city: 'Test City',
    country: 'DE',
  },
  shippingAddress: {
    contactName: 'Test Customer',
    companyName: 'Test Company',
    street: 'Test Street',
    zipCode: '12345',
    city: 'Test City',
    country: 'DE',
  },
  payments: [
    {
      status: 'PENDING',
      method: 'invoice',
      paymentResponse: 'Payment is handled externally',
      paidAmount: 0,
    },
  ],
};

// Sample order update request
const sampleUpdateOrderRequest: EmporixUpdateOrderRequest = {
  status: 'CONFIRMED',
  customerNote: 'Updated order note',
};

// Helper function to create a checkout request
const createCheckoutRequest = (
  cartId: string,
  isGuest: boolean = true,
  email: string = 'guest@example.com',
): EmporixCartCheckoutRequest => {
  // Sample customer
  const customer: EmporixCheckoutCustomer = {
    email: email,
    firstName: 'Test',
    lastName: 'User',
    contactPhone: '1234567890',
    guest: isGuest,
  };

  // Sample billing address
  const billingAddress: EmporixCheckoutAddress = {
    contactName: 'Test User',
    type: 'BILLING',
    country: 'DE',
    city: 'Berlin',
    zipCode: '10115',
    street: 'Test Street',
    streetNumber: '123',
  };

  // Sample shipping address
  const shippingAddress: EmporixCheckoutAddress = {
    contactName: 'Test User',
    type: 'SHIPPING',
    country: 'DE',
    city: 'Berlin',
    zipCode: '10115',
    street: 'Test Street',
    streetNumber: '123',
  };

  // Sample payment method
  const paymentMethod: EmporixCheckoutPaymentMethod = {
    provider: 'none',
    method: 'invoice',
  };

  // Sample shipping
  const shipping: EmporixShipping = {
    methodId: 'de-standard',
    zoneId: 'de-region',
    methodName: 'Standard Shipping',
    amount: 4.99,
  };

  return {
    cartId,
    customer,
    addresses: [billingAddress, shippingAddress],
    paymentMethods: [paymentMethod],
    shipping,
  };
};

describe('EmporixOrderApi', () => {
  let container: Container;
  let orderApi: EmporixOrderApi;
  let cartApi: EmporixCartApi;
  let customerApi: EmporixCustomerApi;
  let checkoutApi: EmporixCheckoutApi;
  let apiInvoker: EmporixApiInvoker;
  let createdOrderId: string;
  let createdCartId: string;

  beforeAll(async () => {
    // Set up the container with our test config
    container = new Container();
    container.bind<EmporixConfig>('EmporixConfig').to(TestEmporixConfig);
    container.bind<EmporixOAuthApi>('EmporixOAuthApi').to(EmporixOAuthApi);
    container.bind<TokenManager>('EmporixTokenManager').to(EmporixTestTokenManager);
    container.bind<EmporixApiInvoker>('EmporixApiInvoker').to(EmporixApiInvoker);
    container.bind<EmporixCartApi>('EmporixCartApi').to(EmporixCartApi);
    container.bind<EmporixCustomerApi>('EmporixCustomerApi').to(EmporixCustomerApi);
    container.bind<EmporixCheckoutApi>('EmporixCheckoutApi').to(EmporixCheckoutApi);
    container.bind<EmporixOrderApi>('EmporixOrderApi').to(EmporixOrderApi);

    // Get instances from the container
    apiInvoker = container.get<EmporixApiInvoker>('EmporixApiInvoker');
    cartApi = container.get<EmporixCartApi>('EmporixCartApi');
    customerApi = container.get<EmporixCustomerApi>('EmporixCustomerApi');
    checkoutApi = container.get<EmporixCheckoutApi>('EmporixCheckoutApi');
    orderApi = container.get<EmporixOrderApi>('EmporixOrderApi');
  });

  afterAll(async () => {
    // Clean up any tokens
    await apiInvoker.clearTokens();
  });

  describe.skip('Order Operations', () => {
    // Create a cart and add items before testing order creation
    beforeEach(async () => {
      // Create a cart
      createdCartId = await cartApi.createCart(sampleCreateCartRequest);
      expect(createdCartId).toBeDefined();

      // Add an item to the cart
      const itemId = await cartApi.addItemToCart(createdCartId, sampleAddItemRequest);
      expect(itemId).toBeDefined();

      // Update the order request with the actual cart ID
      sampleCreateOrderRequest.cartId = createdCartId;
    }, 15000);

    // Clean up the cart after each test if order creation fails
    afterEach(async () => {
      try {
        // Only delete the cart if it exists and no order was created
        // (orders will automatically consume the cart)
        if (createdCartId && !createdOrderId) {
          await cartApi.deleteCart(createdCartId);
        }
      } catch (error) {
        console.warn('Error during cart cleanup:', error);
      }
    }, 10000);

    it('should create a new order', async () => {
      // Create an order from the real cart we created
      const orderResponse = await orderApi.createOrder(sampleCreateOrderRequest);

      // Verify the order was created
      expect(orderResponse).toBeDefined();
      expect(orderResponse.orderId).toBeDefined();
      expect(typeof orderResponse.orderId).toBe('string');

      // Save the order ID for later tests
      createdOrderId = orderResponse.orderId;
    }, 10000);

    it('should get an order by ID', async () => {
      // Get the order we just created
      const order = await orderApi.getOrder(createdOrderId);

      // Verify the order details
      expect(order).toBeDefined();
      expect(order?.id).toBe(createdOrderId);
      expect(order?.customerEmail).toBe(sampleCreateOrderRequest.customerEmail);
      expect(order?.customerNote).toBe(sampleCreateOrderRequest.customerNote);
    }, 10000);

    it('should get orders with filtering', async () => {
      // Get orders with pagination
      const orders = await orderApi.getOrders(10, 0);

      // Verify we got some orders
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);

      // Find our created order
      const createdOrder = orders.find((order) => order.id === createdOrderId);
      expect(createdOrder).toBeDefined();
    }, 10000);

    it('should update an order', async () => {
      // Update the order
      await orderApi.updateOrder(createdOrderId, sampleUpdateOrderRequest);

      // Get the updated order
      const updatedOrder = await orderApi.getOrder(createdOrderId);

      // Verify the order was updated
      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe(sampleUpdateOrderRequest.status);
      expect(updatedOrder?.customerNote).toBe(sampleUpdateOrderRequest.customerNote);
    }, 10000);

    it('should get order status transitions', async () => {
      // Get the status transitions
      const transitions = await orderApi.getOrderStatusTransitions(createdOrderId);

      // Verify we got transitions
      expect(transitions).toBeDefined();
      expect(Array.isArray(transitions)).toBe(true);
    }, 10000);

    it('should delete an order', async () => {
      // Delete the order
      await orderApi.deleteOrder(createdOrderId);

      // Try to get the deleted order
      const deletedOrder = await orderApi.getOrder(createdOrderId);

      // Verify the order was deleted
      expect(deletedOrder).toBeNull();

      // Reset the created order ID since it's been deleted
      createdOrderId = '';
    }, 10000);
  });

  describe.skip('Customer Order Operations', () => {
    const username = 'forrest.gump@alaba.ma';
    const password = 'Test1234';

    // Login with test customer credentials before all customer order tests
    beforeAll(async () => {
      try {
        // Use the customer API to login
        const sessionContext = await customerApi.login(username, password);
        console.log('Customer login successful, session ID:', sessionContext.sessionId);
      } catch (error) {
        console.error('Error logging in customer:', error);
        throw error;
      }
    }, 15000);

    // Create a cart and add items before testing customer order creation
    beforeEach(async () => {
      // Create a cart
      createdCartId = await cartApi.createCart(sampleCreateCartRequest);
      expect(createdCartId).toBeDefined();

      // Add an item to the cart
      const itemId = await cartApi.addItemToCart(createdCartId, sampleAddItemRequest);
      expect(itemId).toBeDefined();

      // Update the order request with the actual cart ID
      sampleCreateOrderRequest.cartId = createdCartId;

      // Update customer email to match test user
      sampleCreateOrderRequest.customerEmail = username;
    }, 15000);

    // Clean up the cart after each test if order creation fails
    afterEach(async () => {
      try {
        // Only delete the cart if it exists and no order was created
        // (orders will automatically consume the cart)
        if (createdCartId && !createdOrderId) {
          await cartApi.deleteCart(createdCartId);
        }
      } catch (error) {
        console.warn('Error during cart cleanup:', error);
      }
    }, 10000);

    // Logout after all customer order tests
    afterAll(async () => {
      try {
        await customerApi.logout();
        console.log('Customer logout successful');
      } catch (error) {
        console.warn('Error during customer logout:', error);
      }
    }, 10000);

    it('should create a new customer order', async () => {
      // Create an order from the real cart we created
      const orderResponse = await orderApi.createCustomerOrder(sampleCreateOrderRequest);

      // Verify the order was created
      expect(orderResponse).toBeDefined();
      expect(orderResponse.orderId).toBeDefined();
      expect(typeof orderResponse.orderId).toBe('string');

      // Save the order ID for later tests
      createdOrderId = orderResponse.orderId;
    }, 10000);

    it('should get a customer order by ID', async () => {
      // Get the order we just created
      const order = await orderApi.getCustomerOrder(createdOrderId);

      // Verify the order details
      expect(order).not.toBeNull();
      expect(order).toBeDefined(); // Fixed the assertion that was causing test failure
      expect(order?.id).toBe(createdOrderId);
      expect(order?.customerEmail).toBe(sampleCreateOrderRequest.customerEmail);
      expect(order?.customerNote).toBe(sampleCreateOrderRequest.customerNote);
    }, 10000);

    it('should get customer orders with filtering', async () => {
      // Get orders with pagination
      const orders = await orderApi.getCustomerOrders(10, 0);

      // Verify we got some orders
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);

      // Find our created order
      const createdOrder = orders.find((order) => order.id === createdOrderId);
      expect(createdOrder).toBeDefined();
    }, 10000);

    it('should update a customer order', async () => {
      // Update the order
      await orderApi.updateCustomerOrder(createdOrderId, sampleUpdateOrderRequest);

      // Get the updated order
      const updatedOrder = await orderApi.getCustomerOrder(createdOrderId);

      // Verify the order was updated
      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe(sampleUpdateOrderRequest.status);
      expect(updatedOrder?.customerNote).toBe(sampleUpdateOrderRequest.customerNote);
    }, 10000);

    it('should get customer order status transitions', async () => {
      // Get the status transitions
      const transitions = await orderApi.getCustomerOrderStatusTransitions(createdOrderId);

      // Verify we got transitions
      expect(transitions).toBeDefined();
      expect(Array.isArray(transitions)).toBe(true);
    }, 10000);
  });

  describe.skip('Guest Checkout and Order Retrieval', () => {
    let guestOrderId: string;
    let guestCartId: string;
    const guestEmail = 'guest.test@example.com';
    let tokenManager: TokenManager;

    // Get token manager and clear tokens before all tests
    beforeAll(async () => {
      // Get the token manager from the container
      tokenManager = container.get<TokenManager>('EmporixTokenManager');

      // Clear all tokens to ensure we start with a fresh session
      tokenManager.clearTokens(tenant);
    }, 10000);

    // Create a cart and add items before testing guest checkout
    beforeEach(async () => {
      // Create a cart
      guestCartId = await cartApi.createCart(sampleCreateCartRequest);
      expect(guestCartId).toBeDefined();

      // Add an item to the cart
      const itemId = await cartApi.addItemToCart(guestCartId, sampleAddItemRequest);
      expect(itemId).toBeDefined();
    }, 15000);

    // Clean up the cart after each test if order creation fails
    afterEach(async () => {
      try {
        // Only delete the cart if it exists and no order was created
        // (orders will automatically consume the cart)
        if (guestCartId && !guestOrderId) {
          await cartApi.deleteCart(guestCartId);
        }
      } catch (error) {
        console.warn('Error during cart cleanup:', error);
      }

      // Reset the order ID
      guestOrderId = '';
    }, 10000);

    it('should create an order via guest checkout and retrieve it in the same session', async () => {
      try {
        // Create a checkout request with guest = true
        const checkoutRequest = createCheckoutRequest(guestCartId, true, guestEmail);
        const checkoutResponse = await checkoutApi.guestCheckout(checkoutRequest);

        // Verify checkout was successful
        expect(checkoutResponse).toBeDefined();
        expect(checkoutResponse.orderId).toBeDefined();

        // Save the order ID
        guestOrderId = checkoutResponse.orderId;

        // Now try to retrieve the order using the customer order endpoint
        // This should work because we're in the same session
        console.log('Retrieving order with ID:', guestOrderId);
        const retrievedOrder = await orderApi.getCustomerOrder(guestOrderId);

        // Verify we can retrieve the order
        expect(retrievedOrder).not.toBeNull();
        expect(retrievedOrder).toBeDefined();
        expect(retrievedOrder?.id).toBe(guestOrderId);
        expect(retrievedOrder?.customer.email).toBe(guestEmail);
        expect(retrievedOrder?.customer.id).toBe('ANONYMOUS');

        // Try to get all customer orders and verify our order is in the list
        console.log('Getting all customer orders...');
        const customerOrders = await orderApi.getCustomerOrders(10, 0);
        expect(customerOrders).toBeDefined();
        expect(Array.isArray(customerOrders)).toBe(true);

        // Find our created order in the list
        const foundOrder = customerOrders.find((order) => order.id === guestOrderId);
        expect(foundOrder).toBeDefined();
      } catch (error) {
        console.error('Error in guest checkout test:', error);
        throw error;
      }
    }, 60000);
  });
});
