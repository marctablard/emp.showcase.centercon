# Battery Included Integration

This integration provides a client for interacting with the Battery Included API, which offers product search and discovery capabilities.

## Features

- Product browsing with search, filtering, and pagination
- Product suggestions based on search queries
- Highlighted products
- Product recommendations
- Presets for predefined searches

## Usage

### Configuration

The integration requires the following environment variables:

- `NEXT_PUBLIC_BATTERY_INCLUDED_BASE_URL`: Base URL for the Battery Included API
- `NEXT_PUBLIC_BATTERY_INCLUDED_API_KEY`: API Key for authentication
- `NEXT_PUBLIC_BATTERY_INCLUDED_COLLECTION`: Collection name to use for queries

### Example

```typescript
import apis from '@/platform/integrations';
import { ShopApi } from '@/platform/integrations/batteryincluded';

// Get the ShopApi instance
const shopApi = await apis.get<ShopApi>('BatteryIncludedShopApi');

// Browse products
const products = await shopApi.browse({
  query: 'phone',
  page: 0,
  size: 20,
  locale: 'en',
  filters: {
    'attributes.brand': ['Samsung', 'Apple'],
  },
  sort: 'price:desc',
});

// Get suggestions
const suggestions = await shopApi.suggest('pho', 'en');

// Get highlights
const highlights = await shopApi.getHighlights();

// Get recommendations
const recommendations = await shopApi.getRecommendations('product-id');

// Get presets
const presets = await shopApi.getPresets();
```
