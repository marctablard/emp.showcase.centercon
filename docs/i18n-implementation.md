# Internationalization (i18n) with next-intl

## Overview

Our application uses [next-intl](https://next-intl-docs.vercel.app/) to provide a robust internationalization solution that works seamlessly with Next.js 14+ and React Server Components. This documentation explains our implementation approach, configuration, and usage patterns.

## Why next-intl?

We chose next-intl for several key reasons:

1. **Server Component Support**: Full compatibility with React Server Components
2. **Type Safety**: Strong TypeScript integration for translation keys
3. **Performance**: Optimized for both server and client rendering
4. **Routing Integration**: Built-in locale-aware routing
5. **Flexibility**: Support for both static and dynamic content translation

## Configuration

Our i18n setup consists of three main configuration files:

### 1. Routing Configuration (`src/i18n/routing.ts`)

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de'],
  // Used when no locale matches
  defaultLocale: 'en',
  // Used for routing
  localePrefix: 'as-needed',
});
```

This defines our supported locales and routing behavior. The `localePrefix: 'as-needed'` setting means that the default locale won't show in the URL, but other locales will.

### 2. Navigation Helpers (`src/i18n/navigation.ts`)

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

This provides locale-aware navigation utilities that respect our routing configuration.

### 3. Request Configuration (`src/i18n/request.ts`)

```typescript
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default,
  };
});
```

This handles loading the correct translation messages based on the requested locale.

## Translation Files

Our translations are stored in JSON files at the root of the i18n directory:

- `i18n/en.json`: English translations
- `i18n/de.json`: German translations

Example translation file structure:

```json
{
  "hello": {
    "world": "Hello World",
    "friend": "Hey Friend"
  }
}
```

## Implementation in App Router

### Directory Structure

We use Next.js App Router with a `[locale]` dynamic segment to handle different languages:

```
src/
  app/
    [locale]/
      layout.tsx       # Root layout with locale handling
      page.tsx         # Home page
      hello/           # Example feature directory
        layout.tsx     # Feature-specific layout
        page.tsx       # Feature-specific page
```

### Root Layout (`src/app/[locale]/layout.tsx`)

The root layout handles locale validation and setup:

```tsx
import { ReactNode } from 'react';
import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;

  const t = await getTranslations({ locale, namespace: 'hello' });

  return {
    title: t('world'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html className="h-full" lang={locale}>
      <body className="flex h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Key features:

- `generateStaticParams()` pre-renders pages for all supported locales
- `generateMetadata()` creates dynamic, localized page metadata
- `setRequestLocale()` enables static rendering with the correct locale
- `NextIntlClientProvider` makes translations available to client components

### Page Component (`src/app/[locale]/hello/page.tsx`)

```tsx
import { useTranslations } from 'next-intl';
import { HelloWorldComponent } from '@/app/components/HelloWorldComponent';

export default function Home() {
  const t = useTranslations('hello');
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>{t('friend')}</h1>

        <HelloWorldComponent />
      </main>
    </div>
  );
}
```

This demonstrates using the `useTranslations` hook to access translations in a server component.

## Usage Patterns

### 1. Server Components

For server components, use the `useTranslations` hook:

```tsx
import { useTranslations } from 'next-intl';

export default function ServerComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

### 2. Client Components

For client components, use the same `useTranslations` hook:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('namespace');
  return <button>{t('button.label')}</button>;
}
```

The `NextIntlClientProvider` in the root layout makes this possible.

### 3. Dynamic Metadata

Use `getTranslations` to create localized metadata:

```tsx
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 4. Locale-Aware Navigation

Use the provided navigation utilities for locale-aware links:

```tsx
import { Link } from '@/i18n/navigation';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

### 5. Integration with Services

When working with our service layer, translations should be handled at the UI level, not in the services themselves. This keeps the service layer focused on business logic rather than presentation concerns:

```tsx
// HelloWorldComponent.tsx
import services from '@/integration/services';
import { HelloService } from '@/integration/services/hello/HelloService';

export async function HelloWorldComponent() {
  const helloService = await services.get<HelloService>('HelloService');
  const message = await helloService.sayHello();
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
```

The `HelloService` returns raw messages that can be translated or formatted at the UI layer if needed.

## Best Practices

1. **Namespace Organization**: Organize translations by feature or domain (e.g., `hello`, `product`, `checkout`)

2. **Keep Keys Simple**: Use descriptive but concise keys that reflect the content's purpose

3. **Avoid String Concatenation**: Use message formatting instead of concatenating strings

4. **Separate UI and Business Logic**: Handle translations at the UI layer, not in services or APIs

5. **Prerender for Performance**: Use `generateStaticParams` to prerender pages for all supported locales

6. **Type Safety**: Leverage TypeScript to ensure translation keys are valid

## Conclusion

Our next-intl implementation provides a robust, type-safe, and performant solution for internationalization. By following the patterns and practices outlined in this documentation, we can create a consistent multilingual experience across our application.
