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
      <div className="py-4 grid grid-cols-[1fr] gap-6 mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbBackLink href="/" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">This is Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Link Name</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Longer Link Name</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Another Link Name</BreadcrumbLink>
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
