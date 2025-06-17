import { notFound } from 'next/navigation';
import ColorStyleGuide from './atoms/color';
import TextStyleGuide from './atoms/text';
import BreadcrumbStyleGuide from './ui/breadcrumb';
import ButtonStyleGuide from './ui/button';
import FormFieldSytelguide from './ui/form-field';
import LinkStyleGuide from './ui/link';
import NotificationSytelguide from './ui/notification';
import PaginationStyleGuide from './ui/pagination';

export default function StyleGuide() {
  if (!process.env.NEXT_PUBLIC_STYLEGUIDE_PAGE) {
    notFound();
  }
  return (
    <main className="max-w-6xl mx-auto px-4 grid gap-x-4 lg:px-9 md:gap-x-6">
      <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines mt-12 mb-6">Hello Styleguide</h1>
      <p className="text-xl lg:max-w-3/5">
        For the styling we are using tailwindcss. So the HTML-Tags get not styled at all, instead please use the utility
        classes provided by{' '}
        <a className="text-primary underline" href="https://tailwindcss.com/docs/styling-with-utility-classes">
          tailwindcss
        </a>{' '}
        and our ui-components.
        <br />
        <br />
        Here you can find some common styles and the ui-components documented.
      </p>
      <TextStyleGuide />
      <ColorStyleGuide />
      <ButtonStyleGuide />
      <LinkStyleGuide />
      <BreadcrumbStyleGuide />
      <PaginationStyleGuide />
      <FormFieldSytelguide />
      <NotificationSytelguide />
    </main>
  );
}
