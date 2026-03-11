# Category Grid Component

A premium category grid component that displays all available product categories with a beautiful layout that works for both categories with and without images.

## Features

- ✨ Premium look and feel with gradient backgrounds for categories without images
- 🎨 Responsive grid layout (2, 3, or 4 columns)
- 🖼️ Handles both categories with and without images gracefully
- 🌐 Fully localized using the i18n system
- ⚡ Optimized with Next.js Image component
- 🎭 Smooth hover animations and transitions
- 📱 Mobile-friendly responsive design

## Usage

### Option 1: Through Storyblok CMS (Recommended)

The component is registered in Storyblok and can be added to any page through the CMS interface:

1. Go to your Storyblok space
2. Navigate to the page where you want to add the category grid (e.g., "home")
3. Add a new component block
4. Select "Category Grid" from the component list
5. Configure the following options:
   - **title**: Section title (default: "Shop by Category")
   - **subtitle**: Optional subtitle text
   - **categoryId**: Root category ID (default: "root")
   - **maxCategories**: Limit number of categories to display
   - **columns**: Number of columns (2, 3, or 4)

### Option 2: Direct Integration in React Components

You can also use the component directly in your React code:

```tsx
import CategoryGrid from '@/components/cms/category-grid';

export default function MyPage() {
  return (
    <div>
      <CategoryGrid
        title="Shop by Category"
        subtitle="Discover our wide range of products"
        columns={4}
        maxCategories={8}
      />
    </div>
  );
}
```

### Option 3: Add to Homepage Without Storyblok

If you want to add the component directly to the homepage without using Storyblok, follow these steps:

1. Modify `src/app/[site]/[locale]/(no-margin)/page.tsx`
2. Import and use the CategoryGrid component alongside the CMS content

Example:

```tsx
import { setRequestLocale } from 'next-intl/server';
import CMSPageComponent from '@/components/cms/storyblok/storyblok-cms-page';
import CategoryGrid from '@/components/cms/category-grid';
import { setRequestSite } from '@/site/server/';

export default async function Home({ params }: { params: Promise<{ locale: string; site: string }> }) {
  const { locale, site } = await params;
  setRequestSite(site);
  setRequestLocale(locale);
  
  return (
    <>
      <CMSPageComponent slug="home" locale={locale} site={site} emptyOnNoResult={true} />
      <CategoryGrid 
        title="Shop by Category" 
        subtitle="Explore our premium collection"
        columns={4}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Shop by Category"` | Main heading for the category section |
| `subtitle` | `string` | `undefined` | Optional subtitle text |
| `showAllCategories` | `boolean` | `true` | Whether to show all categories or filter |
| `categoryId` | `string` | `"root"` | Root category ID to fetch children from |
| `maxCategories` | `number` | `undefined` | Maximum number of categories to display |
| `columns` | `2 \| 3 \| 4` | `4` | Number of grid columns |

## Design Features

### Categories WITH Images
- Uses Next.js optimized Image component
- Gradient overlay for better text readability
- Smooth scale animation on hover
- Category name overlaid on the image

### Categories WITHOUT Images
- Premium gradient backgrounds (8 different color combinations)
- Subtle pattern overlay for texture
- Consistent card height and layout
- Same hover effects as image cards

### Color Gradients
The component uses 8 carefully selected gradient combinations that rotate through categories:
1. Blue to Indigo
2. Purple to Pink
3. Emerald to Teal
4. Orange to Red
5. Cyan to Blue
6. Rose to Fuchsia
7. Amber to Orange
8. Violet to Purple

## Responsive Behavior

- **Mobile (< 768px)**: Single column
- **Tablet (768px - 1024px)**: 2 columns (or less if columns prop is lower)
- **Desktop (> 1024px)**: Full column count as specified

## Performance

- Uses `useCategoryTree` hook for efficient data fetching
- Implements skeleton loading states
- Optimized images with Next.js Image component
- Only fetches visible/published categories

## Error Handling

- Graceful error messages for API failures
- Returns null if no categories are available
- Shows loading skeletons during data fetch
- Handles both localized and non-localized category data

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support (Link components)
- ARIA-compliant hover states

## Examples

### 3-Column Grid with Limited Categories
```tsx
<CategoryGrid 
  title="Featured Categories" 
  columns={3}
  maxCategories={6}
/>
```

### Full-Width 2-Column Grid
```tsx
<CategoryGrid 
  title="Main Categories" 
  subtitle="Everything you need"
  columns={2}
/>
```

### Custom Category Tree
```tsx
<CategoryGrid 
  title="Electronics" 
  categoryId="electronics-root-id"
  columns={4}
/>
```

## Styling Customization

The component uses Tailwind CSS and follows the project's design system. You can customize colors and styles by modifying:
- `gradients` array in the component for different gradient combinations
- Tailwind classes for spacing, shadows, and borders
- Hover effects and transitions

## Integration with Emporix

The component automatically:
- Fetches categories from Emporix Commerce API
- Handles localization based on current locale
- Filters unpublished/invisible categories
- Sorts categories by position
- Loads category media/images

## Testing

Test the component with different scenarios:
1. Categories with images
2. Categories without images
3. Mixed (some with, some without images)
4. Empty category tree
5. Different column counts
6. Different locales

## Support

For issues or questions, please check:
- Category API endpoint: `/api/categories/tree`
- Category service: `src/platform/services/category/CategoryService.d.ts`
- Category model: `src/platform/services/model/category/index.d.ts`
