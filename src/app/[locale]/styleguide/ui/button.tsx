import { Button } from '@/components/ui/button';

export default function ButtonStyleGuide() {
  return (
    <div className="py-12">
      <h3>Buttons</h3>
      <div className="grid grid-rows-4 grid-cols-[1fr_1fr_1fr_1fr] gap-6">
        <Button>Default button</Button>
        <Button variant="destructive">Destructive button</Button>
        <Button variant="outline">Outline button</Button>
        <Button variant="secondary">Secondary button</Button>
        <Button variant="ghost">Ghost button</Button>
        <Button variant="link">Link button</Button>
      </div>
    </div>
  );
}
