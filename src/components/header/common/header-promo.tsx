import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import UiLink from '@/components/ui/link';

export function HeaderPromo() {
  const baseId = useId();
  const promos = [
    {
      title: 'Promo 1',
    },
    {
      title: 'Promo 2',
    },
  ];

  return (
    <div className="flex gap-2 mx-5 my-5">
      {promos.map((promo, index) => (
        <div key={index} className="flex w-full flex-col items-center rounded-sm bg-surface-image-background p-2">
          <div className="w-full aspect-square bg-surface-action-hover-2 mb-2">{/* Image Placeholder */}</div>
          <div className="flex w-full flex-wrap gap-2 justify-between">
            <p className="text-text-body font-bold" id={`${baseId}-promo-${index}`}>
              {promo.title}
            </p>
            <UiLink
              type="A"
              variant="buttonPrimary"
              href="#"
              className="ms-auto"
              aria-labelledby={`${baseId}-promo-${index}`}
            >
              <ArrowRight />
            </UiLink>
          </div>
        </div>
      ))}
    </div>
  );
}
