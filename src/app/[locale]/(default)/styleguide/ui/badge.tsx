import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BadgeStyleGuide() {
  return (
    <div className="py-12">
      <h4 className="text-3xl/5 lg:text-4xl font-bold text-headlines font-headlines mb-3">Badge</h4>
      <h5 className="text-xl font-bold text-headlines font-headlines mb-3">Rounded</h5>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-6 mb-2">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="default" rounded="default">
            <ArrowRight />
            Rounded default
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="default" rounded="rounded_right">
            <ArrowRight />
            Rounded right
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="default" rounded="none">
            <ArrowRight />
            Rounded none
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="default" rounded="lg">
            <ArrowRight />
            Rounded lg
            <ArrowRight />
          </Badge>
        </div>
      </div>
      <h5 className="text-xl font-bold text-headlines font-headlines mb-3">Variant</h5>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-6 mb-2">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge>
            <ArrowRight />
            Default badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="secondary">
            <ArrowRight />
            Secondary badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start p-3 bg-neutral-700">
          <Badge variant="white">
            <ArrowRight />
            White badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="black">
            <ArrowRight />
            Black badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="success">
            <ArrowRight />
            Success badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="warning">
            <ArrowRight />
            Warning badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="destructive">
            <ArrowRight />
            Destructive badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="outline">
            <ArrowRight />
            Outline badge
            <ArrowRight />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="info">
            <ArrowRight />
            Info badge
            <ArrowRight />
          </Badge>
        </div>
      </div>
      <h5 className="text-xl font-bold text-headlines font-headlines mb-3">As Link</h5>
      <div className="p-4 grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr_1fr] gap-6 mb-2">
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge asChild>
            <Link href="/">
              <ArrowRight />
              Badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="secondary" asChild>
            <Link href="/">
              <ArrowRight />
              Badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start p-3 bg-neutral-700">
          <Badge variant="white" asChild>
            <Link href="/">
              <ArrowRight />
              White badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="black" asChild>
            <Link href="/">
              <ArrowRight />
              Black badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="success" asChild>
            <Link href="/">
              <ArrowRight />
              Success badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="warning" asChild>
            <Link href="/">
              <ArrowRight />
              Warning badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="destructive" asChild>
            <Link href="/">
              <ArrowRight />
              Destructive badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="outline" asChild>
            <Link href="/">
              <ArrowRight />
              Outline badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 flex-col items-start">
          <Badge variant="info" asChild>
            <Link href="/">
              <ArrowRight />
              Info badge
              <ArrowRight />
            </Link>
          </Badge>
        </div>
      </div>
    </div>
  );
}
