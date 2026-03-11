# Category Grid - Quick Start ⚡

## 🎉 What You Got

A beautiful, production-ready category grid component is now **live on your homepage**!

## ✅ Already Integrated

The component is automatically showing on:
- **Homepage**: `http://localhost:3000` (scroll down below hero)
- **Position**: Below CMS content
- **Configuration**: 4 columns, all categories displayed

## 🎨 Key Feature

### Works perfectly whether categories have images or not!

**With Images:**
- Shows product photos
- Smooth zoom on hover
- Overlay gradient

**Without Images:**
- Premium gradient backgrounds (8 colors)
- Subtle pattern texture
- Same professional look

## 📝 3 Ways to Use

### 1️⃣ It's Already on the Homepage (Done! ✓)
Just visit your site and scroll down.

### 2️⃣ Add to Another Page
```tsx
import CategoryGrid from '@/components/cms/category-grid';

<CategoryGrid 
  title="Shop by Category"
  columns={4}
/>
```

### 3️⃣ Via Storyblok CMS
1. Open Storyblok editor
2. Add "Category Grid" component
3. Configure title, columns, etc.

## ⚙️ Quick Config Examples

### Simple (Use Defaults)
```tsx
<CategoryGrid />
```

### Custom Styling
```tsx
<CategoryGrid 
  title="Featured Collections"
  subtitle="Explore our best"
  columns={3}
  maxCategories={6}
/>
```

### Specific Category Tree
```tsx
<CategoryGrid 
  title="Electronics"
  categoryId="electronics-id"
  columns={4}
/>
```

## 📱 Responsive

- **Mobile**: 1 column
- **Tablet**: 2 columns  
- **Desktop**: 4 columns (or your choice)

## 🎨 8 Gradient Colors

Categories rotate through:
1. Blue → Indigo (tech, professional)
2. Purple → Pink (creative, modern)
3. Emerald → Teal (fresh, natural)
4. Orange → Red (bold, energetic)
5. Cyan → Blue (cool, digital)
6. Rose → Fuchsia (vibrant, playful)
7. Amber → Orange (warm, inviting)
8. Violet → Purple (premium, elegant)

## 📊 Props Cheat Sheet

| Prop | Type | Default | Example |
|------|------|---------|---------|
| `title` | string | "Shop by Category" | `"Top Picks"` |
| `subtitle` | string | undefined | `"Browse all"` |
| `columns` | 2\|3\|4 | 4 | `3` |
| `maxCategories` | number | undefined | `8` |
| `categoryId` | string | "root" | `"electronics"` |

## 🎯 Common Use Cases

**Homepage Hero Section:**
```tsx
<CategoryGrid columns={4} />
```

**Sidebar Widget:**
```tsx
<CategoryGrid 
  title="Categories" 
  columns={2}
  maxCategories={4}
/>
```

**Landing Page:**
```tsx
<CategoryGrid 
  title="Shop Now"
  subtitle="Everything you need"
  columns={3}
/>
```

## 📚 Full Documentation

- **Component Guide**: `docs/CATEGORY-GRID-COMPONENT.md`
- **Visual Examples**: `docs/CATEGORY-GRID-VISUAL-GUIDE.md`
- **Implementation**: `CATEGORY-GRID-IMPLEMENTATION.md`

## 🐛 Troubleshooting

**Categories not showing?**
→ Check if categories exist in Emporix API

**404 on category API?**
→ Component automatically falls back to `/api/categories/all`

**Want different colors?**
→ Edit `gradients` array in `src/components/cms/category-grid.tsx`

**Need help?**
→ Check the full documentation files listed above

## 🚀 Test It Now

```bash
# If dev server not running:
npm run dev

# Then visit:
# http://localhost:3000

# Scroll down to see the category grid!
```

## 🎉 You're Done!

The component is production-ready and already integrated. Enjoy! 🚀

---

**Files to explore:**
- Component: `src/components/cms/category-grid.tsx`
- Homepage: `src/app/[site]/[locale]/(no-margin)/page.tsx`
- API: `src/app/api/categories/all/route.ts`
