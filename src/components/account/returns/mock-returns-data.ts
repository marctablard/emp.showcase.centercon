import { Return } from '@/platform/services/model/return';

/**
 * Extended ReturnItem with product images for the detail view
 */
export interface ExtendedReturnItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice?: { value: number; currency: string };
  total?: { value: number; currency: string };
  netPrice?: { value: number; currency: string };
  reason?: { code?: string; details?: string };
  images?: string[];
  brand?: string;
  itemNumber?: string;
}

/**
 * Extended Return type with images support
 */
export interface ExtendedReturn extends Omit<Return, 'orders'> {
  orders: {
    id: string;
    items: ExtendedReturnItem[];
  }[];
}

/**
 * Sample product images for mock data
 */
const productImages = {
  solarPanel: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=300&fit=crop',
  ],
  inverter: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
  ],
  battery: [
    'https://images.unsplash.com/photo-1619641805634-98e12c005bb5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
  ],
  mountingKit: ['https://images.unsplash.com/photo-1545209463-e2ac9e0bdbf3?w=400&h=300&fit=crop'],
  cable: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
  microInverter: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop'],
  monitoring: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  ],
};

/**
 * Claim reason options matching Figma design
 */
export const claimReasonOptions = [
  { value: 'DEFECTIVE', label: 'Defective Product' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'WRONG_ITEM', label: 'Wrong Item Received' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as Described' },
  { value: 'CHANGED_MIND', label: 'Changed Mind' },
  { value: 'WARRANTY', label: 'Warranty Claim' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Mock data for Returns page displaying all status variants
 * This data matches the Figma design specifications
 */
export const mockReturns: ExtendedReturn[] = [
  {
    id: '1234567890',
    status: 'APPROVED',
    received: true,
    isExpired: false,
    createdAt: '2024-12-17T10:30:00Z',
    expiryDate: '2025-01-17T10:30:00Z',
    requestor: {
      customerId: 'cust-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'j.smith@mail.com',
      fullName: 'John Smith',
    },
    total: {
      value: 1770.0,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-001',
            name: 'Solar Panel Type B',
            brand: 'Serie GMV 6',
            itemNumber: '12345678',
            quantity: 5,
            unitPrice: { value: 590.0, currency: 'USD' },
            total: { value: 590.0, currency: 'USD' },
            netPrice: { value: 580.0, currency: 'USD' },
            reason: { code: 'DAMAGED', details: 'The solar panel has long crack along the side.' },
            images: productImages.solarPanel,
          },
          {
            id: 'item-001b',
            name: 'Solar Panel Type B',
            brand: 'Serie GMV 6',
            itemNumber: '12345679',
            quantity: 1,
            unitPrice: { value: 590.0, currency: 'USD' },
            total: { value: 590.0, currency: 'USD' },
            netPrice: { value: 580.0, currency: 'USD' },
            reason: { code: 'DAMAGED', details: 'The solar panel has long crack along the side.' },
            images: [productImages.solarPanel[0], productImages.solarPanel[1]],
          },
          {
            id: 'item-001c',
            name: 'Solar Panel Type B',
            brand: 'Serie GMV 6',
            itemNumber: '12345680',
            quantity: 3,
            unitPrice: { value: 590.0, currency: 'USD' },
            total: { value: 590.0, currency: 'USD' },
            netPrice: { value: 580.0, currency: 'USD' },
            reason: { code: 'DAMAGED', details: 'The solar panel has long crack along the side.' },
            images: [],
          },
        ],
      },
    ],
  },
  {
    id: '1234567891',
    status: 'APPROVED',
    received: true,
    isExpired: false,
    createdAt: '2024-12-17T11:00:00Z',
    expiryDate: '2025-01-17T11:00:00Z',
    requestor: {
      customerId: 'cust-002',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'j.smith@mail.com',
      fullName: 'Jane Doe',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-002',
            name: 'Inverter 5kW',
            brand: 'Serie GMV 6',
            itemNumber: '12345681',
            quantity: 1,
            unitPrice: { value: 120.5, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 118.5, currency: 'USD' },
            reason: { code: 'WRONG_ITEM', details: 'Received wrong model' },
            images: productImages.inverter,
          },
        ],
      },
    ],
  },
  {
    id: '1234567892',
    status: 'APPROVED',
    received: false,
    isExpired: false,
    createdAt: '2024-12-17T12:00:00Z',
    expiryDate: '2025-01-17T12:00:00Z',
    requestor: {
      customerId: 'cust-003',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'j.smith@mail.com',
      fullName: 'Bob Wilson',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-003',
            name: 'Battery Storage 10kWh',
            brand: 'Serie GMV 6',
            itemNumber: '12345682',
            quantity: 1,
            unitPrice: { value: 120.5, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 118.5, currency: 'USD' },
            reason: { code: 'DAMAGED', details: 'Shipping damage' },
            images: productImages.battery,
          },
        ],
      },
    ],
  },
  {
    id: '1234567893',
    status: 'APPROVED',
    received: true,
    isExpired: false,
    createdAt: '2024-12-17T13:00:00Z',
    requestor: {
      customerId: 'cust-004',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'j.smith@mail.com',
      fullName: 'Alice Johnson',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-004',
            name: 'Mounting Kit',
            brand: 'Serie GMV 6',
            itemNumber: '12345683',
            quantity: 3,
            unitPrice: { value: 40.17, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 115.0, currency: 'USD' },
            reason: { code: 'NOT_AS_DESCRIBED', details: 'Does not match product description' },
            images: productImages.mountingKit,
          },
        ],
      },
    ],
  },
  {
    id: '1234567894',
    status: 'PENDING',
    received: false,
    isExpired: false,
    createdAt: '2024-12-17T14:00:00Z',
    expiryDate: '2025-01-17T14:00:00Z',
    requestor: {
      customerId: 'cust-005',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'j.smith@mail.com',
      fullName: 'Charlie Brown',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-005',
            name: 'Solar Cable 50m',
            brand: 'Serie GMV 6',
            itemNumber: '12345684',
            quantity: 2,
            unitPrice: { value: 60.25, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 115.0, currency: 'USD' },
            reason: { code: 'CHANGED_MIND', details: 'No longer needed' },
            images: productImages.cable,
          },
        ],
      },
    ],
  },
  {
    id: '1234567895',
    status: 'REJECTED',
    received: false,
    isExpired: false,
    createdAt: '2024-12-17T15:00:00Z',
    requestor: {
      customerId: 'cust-006',
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'j.smith@mail.com',
      fullName: 'Diana Prince',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    reason: {
      code: 'OUT_OF_POLICY',
      details: 'Return request submitted after return window',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-006',
            name: 'Micro Inverter',
            brand: 'Serie GMV 6',
            itemNumber: '12345685',
            quantity: 4,
            unitPrice: { value: 30.13, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 115.0, currency: 'USD' },
            reason: { code: 'DEFECTIVE', details: 'Multiple units not working' },
            images: productImages.microInverter,
          },
        ],
      },
    ],
  },
  {
    id: '1234567896',
    status: 'CLOSED',
    received: true,
    isExpired: true,
    createdAt: '2024-12-17T16:00:00Z',
    expiryDate: '2024-12-01T16:00:00Z',
    requestor: {
      customerId: 'cust-007',
      firstName: 'Edward',
      lastName: 'Norton',
      email: 'j.smith@mail.com',
      fullName: 'Edward Norton',
    },
    total: {
      value: 120.5,
      currency: 'USD',
    },
    orders: [
      {
        id: '8438439tghr9339',
        items: [
          {
            id: 'item-007',
            name: 'Monitoring System',
            brand: 'Serie GMV 6',
            itemNumber: '12345686',
            quantity: 1,
            unitPrice: { value: 120.5, currency: 'USD' },
            total: { value: 120.5, currency: 'USD' },
            netPrice: { value: 118.5, currency: 'USD' },
            reason: { code: 'WARRANTY', details: 'Warranty claim' },
            images: productImages.monitoring,
          },
        ],
      },
    ],
  },
];

/**
 * Get a single mock return by ID
 */
export function getMockReturnById(id: string): ExtendedReturn | undefined {
  return mockReturns.find((r) => r.id === id);
}
