import { notFound } from 'next/navigation';
import ButtonStyleGuide from '@/app/[locale]/styleguide/ui/button';
import FormFieldStyleGuide from './ui/form-fields';

export default function StyleGuide() {
  if (!process.env.NEXT_PUBLIC_STYLEGUIDE_PAGE) {
    notFound();
  }
  return (
    <main className="max-w-7xl mx-auto px-4 grid gap-x-4 lg:px-9 md:gap-x-6">
      <h1>Hallo Styleguide</h1>
      <ButtonStyleGuide />
      <FormFieldStyleGuide />
    </main>
  );
}
