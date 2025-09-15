import { HeaderCheckout } from '@/components/header/header-checkout';
import { H1 } from '@/components/ui/h';
import UiLink from '@/components/ui/link';

export default function NotFound() {
  return (
    <>
      <HeaderCheckout />
      <div className="flex-grow mt-17 md:mt-36 lg:mt-52 mx-auto text-center">
        <H1 className="mb-6">404</H1>
        <UiLink href="/" type="Link" variant="button_primary">
          Return Home
        </UiLink>
      </div>
    </>
  );
}
