import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ButtonStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Buttons</h4>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr] gap-6 mb-2">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button>
            <ArrowRight />
            Default button
            <ArrowRight />
          </Button>
          <Button disabled>
            <ArrowRight />
            Default button
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="secondary">
            <ArrowRight />
            Secondary button
            <ArrowRight />
          </Button>
          <Button variant="secondary" disabled>
            <ArrowRight />
            Secondary button
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="link">
            <ArrowRight />
            Link button
            <ArrowRight />
          </Button>
          <Button variant="link" disabled>
            <ArrowRight />
            Link button
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="neutral">
            <ArrowRight />
            Neutral button
            <ArrowRight />
          </Button>
          <Button variant="neutral" disabled>
            <ArrowRight />
            Neutral button
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr] gap-6">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button size="icon">
            <ArrowRight />
          </Button>
          <Button size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="secondary" size="icon">
            <ArrowRight />
          </Button>
          <Button variant="secondary" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="link" size="icon">
            <ArrowRight />
          </Button>
          <Button variant="link" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="neutral" size="icon">
            <ArrowRight />
          </Button>
          <Button variant="neutral" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
