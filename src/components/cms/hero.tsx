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

  return (
    <div {...storyblokEditable(blok)} className={cn('relative')}>
      <div className="w-full flex justify-end">
        <div className="w-full mb-65 sm:mb-0 xl:w-5/6">
          {blok.image && (
            <Image
              src={blok.image.filename}
              alt={blok.alt_text || blok.image.alt || 'Logo'}
              width={150}
              height={50}
              className="w-full"
            />
          )}
        </div>
      </div>
      <div className="absolute bottom-0 lg:bottom-20 px-4 xl:p-0">
        <div className="flex flex-col gap-4 bg-white opacity-85 md:w-1/2 xl:w-4/7 rounded-ss-xl rounded-ee-xl shadow-lg p-6">
          <h1 className="text-5xl lg:text-8xl font-bold text-headlines font-headlines">{blok.headline}</h1>
          <div className="w-20 h-2 bg-primary-500 rounded-xl"></div>
          <p className=" text-base lg:text-xl text-neutral-800">{blok.description}</p>
          {blok.main_button && <Button blok={blok.main_button} />}
        </div>
      </div>
    </div>
  );
};

export default Hero;
