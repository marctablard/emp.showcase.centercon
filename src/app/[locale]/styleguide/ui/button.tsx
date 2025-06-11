import { ArrowRight } from 'lucide-react';
import { BackToTopButton, Button } from '@/components/ui/button';

export default function ButtonStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Buttons</h4>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-6 mb-2">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button>
            <ArrowRight />
            Default button
            <ArrowRight />
          </Button>
          <p>disabled:</p>
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
          <p>disabled:</p>
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
          <p>disabled:</p>
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
          <p>disabled:</p>
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
          <p>disabled:</p>
          <Button size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="secondary" size="icon">
            <ArrowRight />
          </Button>
          <p>disabled:</p>
          <Button variant="secondary" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="link" size="icon">
            <ArrowRight />
          </Button>
          <p>disabled:</p>
          <Button variant="link" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Button variant="neutral" size="icon">
            <ArrowRight />
          </Button>
          <p>disabled:</p>
          <Button variant="neutral" size="icon" disabled>
            <ArrowRight />
          </Button>
        </div>
      </div>
      <h5 className="text-xs/3 lg:text-2xl font-bold text-headlines font-headlines mt-8 mb-3">Back to top</h5>
      <div className="p-4 flex flex-wrap items-center gap-6">
        <BackToTopButton />
        <div className="flex items-end gap-3">
          <p>disabled:</p>
          <BackToTopButton disabled />
        </div>
      </div>
    </div>
  );
}
