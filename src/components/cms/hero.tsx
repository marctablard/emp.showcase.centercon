import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react/rsc';
import { cn } from '@/lib/utils';
import Button from './button';

interface HeroProps {
  blok: {
    headline: string;
    description: string;
    main_button?: {
      title: string;
      link: string;
      iconLeft?: string;
      iconRight?: string;
    };
    image?: {
      filename: string;
      alt?: string;
    };
    alt_text?: string;
  };
}

const Hero = ({ blok }: HeroProps) => {
  if (!blok.image?.filename) {
    return null;
  }

  const url = blok.image.filename;
  console.log(url);
  return (
    <div {...storyblokEditable(blok)} className={cn('p-6 border rounded-lg shadow-sm h-185 bg-[url(' + url + ')]')}>
      <div className="flex flex-col rounded-ss-xl rounded-ee-xl border p-4">
        <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines mt-12 mb-6">{blok.headline}</h1>
        <p className="text-xl text-neutral-600">{blok.description}</p>
        {blok.main_button && <Button blok={blok.main_button} />}
      </div>

      <Image
        src={blok.image.filename}
        alt={blok.alt_text || blok.image.alt || 'Logo'}
        width={500}
        height={500}
        className="object-contain"
      />
    </div>
  );
};

export default Hero;
