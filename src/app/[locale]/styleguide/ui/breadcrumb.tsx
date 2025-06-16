import { UiBreadcrumb } from '@/components/ui/molecules/ui-breadcrumb';
import { BreadcrumbContent } from '@/lib/breadcrumb';

export default function BreadcrumbStyleGuide() {
  const breadcrumbs: BreadcrumbContent[] = [
    {
      href: '#',
      label: 'Link Name',
    },
    {
      href: '#',
      label: 'Longer Link Name',
    },
    {
      href: '#',
      label: 'Another Link Name',
    },
    {
      href: '#',
      label: 'Current Page',
    },
  ];
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Breadcrumb</h4>
      <div className="grid  mb-2">
        <UiBreadcrumb items={breadcrumbs} />
      </div>
    </div>
  );
}
