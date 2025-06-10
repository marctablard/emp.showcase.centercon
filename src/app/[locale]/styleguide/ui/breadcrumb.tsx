import {
  Breadcrumb,
  BreadcrumbBackLink,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function BreadcrumbStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Breadcrumb</h4>
      <div className="p-4 grid grid-cols-[1fr] gap-6 mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbBackLink href="/" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Link</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Link</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
