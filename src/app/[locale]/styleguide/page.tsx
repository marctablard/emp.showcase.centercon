import { notFound } from 'next/navigation';
import ButtonStyleGuide from '@/app/[locale]/styleguide/ui/button';
import TextStyleGuide from './atoms/text';

export default function StyleGuide() {
  if (!process.env.NEXT_PUBLIC_STYLEGUIDE_PAGE) {
    notFound();
  }
  return (
    <main className="max-w-6xl mx-auto px-4 grid gap-x-4 lg:px-9 md:gap-x-6">
      <h1 className="text-5xl md:text-8xl font-bold text-headlines font-headlines mt-12">Hallo Styleguide</h1>
      <TextStyleGuide />
      <ButtonStyleGuide />
    </main>
  );
}
